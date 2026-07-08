"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocketHandlers = setupSocketHandlers;
const game_engine_1 = require("game-engine");
const db_1 = require("./db");
// Generate short random code
function generateRoomCode() {
    return Math.random().toString(36).substring(2, 7).toUpperCase();
}
function setupSocketHandlers(io) {
    io.on('connection', (socket) => {
        console.log(`Socket connected: ${socket.id}`);
        // Create a new game room
        socket.on('create_room', async ({ playerName }) => {
            try {
                const roomCode = generateRoomCode();
                const gameId = Math.random().toString(36).substring(2, 11);
                const hostPlayer = {
                    id: Math.random().toString(36).substring(2, 11),
                    name: playerName,
                    socketId: socket.id,
                    faction: null,
                };
                const initialState = (0, game_engine_1.createInitialState)(gameId, roomCode, [hostPlayer]);
                await (0, db_1.dbCreateGame)(initialState);
                socket.join(roomCode);
                socket.emit('room_created', { gameId, roomCode, playerId: hostPlayer.id });
                console.log(`Room created: ${roomCode} by ${playerName}`);
            }
            catch (err) {
                socket.emit('error', err.message);
            }
        });
        // Join an existing game room
        socket.on('join_room', async ({ roomCode, playerName, playerId }) => {
            try {
                const code = roomCode.toUpperCase();
                const gameId = await (0, db_1.getGameIdByCode)(code);
                if (!gameId) {
                    socket.emit('join_error', 'Game room not found.');
                    return;
                }
                const state = await (0, db_1.mapDbToGameState)(gameId);
                if (!state) {
                    socket.emit('join_error', 'Failed to retrieve game state.');
                    return;
                }
                let player;
                // Try to reconnect if playerId is provided
                if (playerId) {
                    player = state.players.find(p => p.id === playerId);
                    if (player) {
                        player.socketId = socket.id;
                    }
                }
                // If not reconnecting, join as new player
                if (!player) {
                    if (state.status !== 'LOBBY') {
                        socket.emit('join_error', 'Game is already in progress.');
                        return;
                    }
                    if (state.players.length >= 2) {
                        socket.emit('join_error', 'Game room is full.');
                        return;
                    }
                    player = {
                        id: Math.random().toString(36).substring(2, 11),
                        name: playerName,
                        socketId: socket.id,
                        faction: null,
                    };
                    state.players.push(player);
                }
                await (0, db_1.dbSaveGame)(state);
                socket.join(code);
                socket.emit('room_joined', { gameId, roomCode: code, playerId: player.id });
                io.to(code).emit('state_updated', state);
                console.log(`${playerName} joined room: ${code}`);
            }
            catch (err) {
                socket.emit('join_error', err.message);
            }
        });
        // Select faction
        socket.on('select_faction', async ({ gameId, faction }) => {
            try {
                const state = await (0, db_1.mapDbToGameState)(gameId);
                if (!state)
                    return;
                const player = state.players.find(p => p.socketId === socket.id);
                if (!player)
                    return;
                // Check if other player already has this faction
                const factionTaken = state.players.some(p => p.id !== player.id && p.faction === faction);
                if (factionTaken) {
                    socket.emit('action_error', 'This faction is already selected by another player.');
                    return;
                }
                player.faction = faction;
                await (0, db_1.dbSaveGame)(state);
                io.to(state.code).emit('state_updated', state);
            }
            catch (err) {
                socket.emit('action_error', err.message);
            }
        });
        // Start game
        socket.on('start_game', async ({ gameId }) => {
            try {
                const state = await (0, db_1.mapDbToGameState)(gameId);
                if (!state)
                    return;
                if (state.players.length < 2) {
                    socket.emit('action_error', 'Need 2 players to start game.');
                    return;
                }
                const p1 = state.players[0];
                const p2 = state.players[1];
                if (!p1.faction || !p2.faction) {
                    socket.emit('action_error', 'Both players must select a faction.');
                    return;
                }
                state.status = 'PLAYING';
                await (0, db_1.dbSaveGame)(state);
                io.to(state.code).emit('state_updated', state);
                console.log(`Game started: ${state.code}`);
            }
            catch (err) {
                socket.emit('action_error', err.message);
            }
        });
        // Perform turn action
        socket.on('game_action', async ({ gameId, actionType, args, }) => {
            try {
                let state = await (0, db_1.mapDbToGameState)(gameId);
                if (!state)
                    return;
                const player = state.players.find(p => p.socketId === socket.id);
                if (!player) {
                    socket.emit('action_error', 'Player not found in game state.');
                    return;
                }
                if (actionType === 'CLEAR_COMBAT') {
                    // Attacker wants to clear the combat overlay after viewing result
                    const nextState = (0, game_engine_1.clearCombatState)(state);
                    await (0, db_1.dbSaveGame)(nextState);
                    io.to(nextState.code).emit('state_updated', nextState);
                    return;
                }
                const playerFaction = player.faction;
                if (!playerFaction) {
                    socket.emit('action_error', 'Player has no assigned faction.');
                    return;
                }
                if (actionType === 'EXCHANGE') {
                    const nextState = (0, game_engine_1.performExchangeAction)(state, playerFaction, args);
                    await (0, db_1.dbSaveGame)(nextState);
                    io.to(state.code).emit('state_updated', nextState);
                }
                else if (actionType === 'ATTACK') {
                    const nextState = (0, game_engine_1.initiateAttack)(state, playerFaction, args);
                    await (0, db_1.dbSaveGame)(nextState);
                    io.to(state.code).emit('state_updated', nextState);
                }
            }
            catch (err) {
                socket.emit('action_error', err.message);
                console.error('Action error:', err.message);
            }
        });
        // Relocate Capital
        socket.on('relocate_capital', async ({ gameId, args, }) => {
            try {
                const state = await (0, db_1.mapDbToGameState)(gameId);
                if (!state)
                    return;
                const player = state.players.find(p => p.socketId === socket.id);
                if (!player)
                    return;
                const playerFaction = player.faction;
                if (!playerFaction)
                    return;
                const nextState = (0, game_engine_1.relocateCapital)(state, playerFaction, args);
                await (0, db_1.dbSaveGame)(nextState);
                io.to(state.code).emit('state_updated', nextState);
                console.log(`Capital relocated: game ${gameId}`);
            }
            catch (err) {
                socket.emit('action_error', err.message);
                console.error('Relocation error:', err.message);
            }
        });
        // Handle Disconnect
        socket.on('disconnect', async () => {
            console.log(`Socket disconnected: ${socket.id}`);
            try {
                // Find player with this socket ID
                const dbPlayer = await db_1.prisma.player.findFirst({
                    where: { socketId: socket.id },
                    include: { game: true },
                });
                if (dbPlayer) {
                    // Set player's socketId to null in db
                    await db_1.prisma.player.update({
                        where: { id: dbPlayer.id },
                        data: { socketId: null },
                    });
                    // Fetch full updated game state and notify room
                    const state = await (0, db_1.mapDbToGameState)(dbPlayer.gameId);
                    if (state) {
                        io.to(state.code).emit('state_updated', state);
                        // Set a timer for 60 seconds. If they don't reconnect, the game could be declared abandoned or closed.
                        setTimeout(async () => {
                            const freshState = await (0, db_1.mapDbToGameState)(dbPlayer.gameId);
                            if (freshState) {
                                const disconnectedPlayer = freshState.players.find(p => p.id === dbPlayer.id);
                                if (disconnectedPlayer && !disconnectedPlayer.socketId && freshState.status === 'PLAYING') {
                                    // Declare opponent as winner
                                    freshState.status = 'FINISHED';
                                    freshState.winnerFaction = (disconnectedPlayer.faction === 'CHATOU' ? 'VILLE_IMPERIALE' : 'CHATOU');
                                    await (0, db_1.dbSaveGame)(freshState);
                                    io.to(freshState.code).emit('state_updated', freshState);
                                }
                            }
                        }, 60000);
                    }
                }
            }
            catch (err) {
                console.error('Disconnect handling error:', err);
            }
        });
    });
}
