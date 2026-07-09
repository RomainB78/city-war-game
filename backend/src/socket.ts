import { Server, Socket } from 'socket.io';
import {
  createInitialState,
  performExchangeAction,
  initiateAttack,
  relocateCapital,
  clearCombatState
} from 'game-engine';
import {
  getGameIdByCode,
  mapDbToGameState,
  dbCreateGame,
  dbSaveGame,
  prisma
} from './db';
import { GameState, Faction, Player } from 'shared';

// Generate short random code
function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 7).toUpperCase();
}

export function setupSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Create a new game room
    socket.on('create_room', async ({ playerName }: { playerName: string }) => {
      try {
        const roomCode = generateRoomCode();
        const gameId = Math.random().toString(36).substring(2, 11);

        const hostPlayer: Player = {
          id: Math.random().toString(36).substring(2, 11),
          name: playerName,
          socketId: socket.id,
          faction: null,
        };

        const initialState = createInitialState(gameId, roomCode, [hostPlayer]);
        await dbCreateGame(initialState);

        socket.join(roomCode);
        socket.emit('room_created', { gameId, roomCode, playerId: hostPlayer.id });
        io.to(roomCode).emit('state_updated', initialState);
        console.log(`Room created: ${roomCode} by ${playerName}`);
      } catch (err: any) {
        socket.emit('error', err.message);
      }
    });

    // Join an existing game room
    socket.on('join_room', async ({ roomCode, playerName, playerId }: { roomCode: string; playerName: string; playerId?: string }) => {
      try {
        const code = roomCode.toUpperCase();
        const gameId = await getGameIdByCode(code);

        if (!gameId) {
          socket.emit('join_error', 'Game room not found.');
          return;
        }

        const state = await mapDbToGameState(gameId);
        if (!state) {
          socket.emit('join_error', 'Failed to retrieve game state.');
          return;
        }

        let player: Player | undefined;

        // 1. Try to reconnect if playerId is provided
        if (playerId) {
          player = state.players.find(p => p.id === playerId);
        }

        // 2. Try to match by current socketId
        if (!player) {
          player = state.players.find(p => p.socketId === socket.id);
        }

        // 3. Try to match by exact name (reconnecting after refresh or lost playerId)
        if (!player && playerName) {
          player = state.players.find(
            p => p.name.trim().toLowerCase() === playerName.trim().toLowerCase()
          );
        }

        if (player) {
          player.socketId = socket.id;
        } else {
          // New player joining
          if (state.status !== 'LOBBY') {
            socket.emit('join_error', 'La partie a déjà commencé.');
            return;
          }
          if (state.players.length >= 2) {
            socket.emit('join_error', 'La salle est déjà complète (2/2 joueurs).');
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

        await dbSaveGame(state);

        socket.join(code);
        socket.emit('room_joined', { gameId, roomCode: code, playerId: player.id });
        io.to(code).emit('state_updated', state);

        console.log(`${playerName} joined room: ${code}`);
      } catch (err: any) {
        socket.emit('join_error', err.message);
      }
    });

    // Select faction
    socket.on('select_faction', async ({ gameId, faction, playerId }: { gameId: string; faction: Faction; playerId?: string }) => {
      try {
        const state = await mapDbToGameState(gameId);
        if (!state) return;

        const player = state.players.find(p => (playerId && p.id === playerId) || p.socketId === socket.id);
        if (!player) return;
        player.socketId = socket.id;

        // Check if other player already has this faction
        const factionTaken = state.players.some(p => p.id !== player.id && p.faction === faction);
        if (factionTaken) {
          socket.emit('action_error', 'Cette faction est déjà sélectionnée par l\'autre joueur.');
          return;
        }

        player.faction = faction;
        await dbSaveGame(state);

        io.to(state.code).emit('state_updated', state);
      } catch (err: any) {
        socket.emit('action_error', err.message);
      }
    });

    // Start game
    socket.on('start_game', async ({ gameId }: { gameId: string }) => {
      try {
        const state = await mapDbToGameState(gameId);
        if (!state) return;

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
        await dbSaveGame(state);

        io.to(state.code).emit('state_updated', state);
        console.log(`Game started: ${state.code}`);
      } catch (err: any) {
        socket.emit('action_error', err.message);
      }
    });

    // Perform turn action
    socket.on('game_action', async ({
      gameId,
      actionType,
      args,
      playerId,
    }: {
      gameId: string;
      actionType: 'EXCHANGE' | 'ATTACK' | 'CLEAR_COMBAT';
      args: any;
      playerId?: string;
    }) => {
      try {
        let state = await mapDbToGameState(gameId);
        if (!state) return;

        const player = state.players.find(p => (playerId && p.id === playerId) || p.socketId === socket.id);
        if (!player && actionType !== 'CLEAR_COMBAT') {
          socket.emit('action_error', 'Joueur non trouvé dans la partie.');
          return;
        }
        if (player) {
          player.socketId = socket.id;
        }

        if (actionType === 'CLEAR_COMBAT') {
          // Attacker wants to clear the combat overlay after viewing result
          const nextState = clearCombatState(state);
          await dbSaveGame(nextState);
          io.to(nextState.code).emit('state_updated', nextState);
          return;
        }

        if (!player) return;

        const playerFaction = player.faction;
        if (!playerFaction) {
          socket.emit('action_error', 'Player has no assigned faction.');
          return;
        }

        if (actionType === 'EXCHANGE') {
          const nextState = performExchangeAction(state, playerFaction, args);
          await dbSaveGame(nextState);
          io.to(state.code).emit('state_updated', nextState);
        } else if (actionType === 'ATTACK') {
          const nextState = initiateAttack(state, playerFaction, args);
          await dbSaveGame(nextState);
          io.to(state.code).emit('state_updated', nextState);
        }
      } catch (err: any) {
        socket.emit('action_error', err.message);
        console.error('Action error:', err.message);
      }
    });

    // Relocate Capital
    socket.on('relocate_capital', async ({
      gameId,
      args,
      playerId,
    }: {
      gameId: string;
      args: { cityId: string; newBastionId: string };
      playerId?: string;
    }) => {
      try {
        const state = await mapDbToGameState(gameId);
        if (!state) return;

        const player = state.players.find(p => (playerId && p.id === playerId) || p.socketId === socket.id);
        if (!player) return;
        player.socketId = socket.id;

        const playerFaction = player.faction;
        if (!playerFaction) return;

        const nextState = relocateCapital(state, playerFaction, args);
        await dbSaveGame(nextState);

        io.to(state.code).emit('state_updated', nextState);
        console.log(`Capital relocated: game ${gameId}`);
      } catch (err: any) {
        socket.emit('action_error', err.message);
        console.error('Relocation error:', err.message);
      }
    });

    // Handle Disconnect
    socket.on('disconnect', async () => {
      console.log(`Socket disconnected: ${socket.id}`);
      try {
        // Find player with this socket ID
        const dbPlayer = await prisma.player.findFirst({
          where: { socketId: socket.id },
          include: { game: true },
        });

        if (dbPlayer) {
          // Set player's socketId to null in db
          await prisma.player.update({
            where: { id: dbPlayer.id },
            data: { socketId: null },
          });

          // Fetch full updated game state and notify room
          const state = await mapDbToGameState(dbPlayer.gameId);
          if (state) {
            io.to(state.code).emit('state_updated', state);

            // Set a timer for 60 seconds. If they don't reconnect, the game could be declared abandoned or closed.
            setTimeout(async () => {
              const freshState = await mapDbToGameState(dbPlayer.gameId);
              if (freshState) {
                const disconnectedPlayer = freshState.players.find(p => p.id === dbPlayer.id);
                if (disconnectedPlayer && !disconnectedPlayer.socketId && freshState.status === 'PLAYING') {
                  // Declare opponent as winner
                  freshState.status = 'FINISHED';
                  freshState.winnerFaction = (disconnectedPlayer.faction === 'CHATOU' ? 'VILLE_IMPERIALE' : 'CHATOU') as Faction;
                  await dbSaveGame(freshState);
                  io.to(freshState.code).emit('state_updated', freshState);
                }
              }
            }, 60000);
          }
        }
      } catch (err) {
        console.error('Disconnect handling error:', err);
      }
    });
  });
}
