"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
exports.mapDbToGameState = mapDbToGameState;
exports.dbCreateGame = dbCreateGame;
exports.dbSaveGame = dbSaveGame;
exports.getGameIdByCode = getGameIdByCode;
const client_1 = require("@prisma/client");
exports.prisma = new client_1.PrismaClient();
// Helper to convert database representation to GameState object
async function mapDbToGameState(gameId) {
    const game = await exports.prisma.game.findUnique({
        where: { id: gameId },
        include: {
            players: true,
            cities: {
                include: {
                    bastions: true,
                },
            },
            history: {
                orderBy: { timestamp: 'asc' },
            },
        },
    });
    if (!game)
        return null;
    const citiesMap = {};
    for (const dbCity of game.cities) {
        citiesMap[dbCity.cityKey] = {
            id: dbCity.id,
            cityKey: dbCity.cityKey,
            name: dbCity.name,
            faction: dbCity.faction,
            capitalId: dbCity.capitalId,
            bastions: dbCity.bastions.map((b) => ({
                id: b.id,
                soldiers: b.soldiers,
                initialSoldiers: b.initialSoldiers,
            })),
        };
    }
    const players = game.players.map((p) => ({
        id: p.id,
        socketId: p.socketId,
        name: p.name,
        faction: p.faction,
    }));
    const history = game.history.map((h) => ({
        id: h.id,
        type: h.type,
        faction: h.faction,
        details: h.details,
        timestamp: h.timestamp.getTime(),
    }));
    const combat = game.combatState ? JSON.parse(game.combatState) : null;
    return {
        id: game.id,
        code: game.code,
        status: game.status,
        turn: game.turn,
        activeFaction: game.activeFaction,
        winnerFaction: game.winnerFaction,
        players,
        cities: citiesMap,
        combat,
        history,
    };
}
// Create a new game in database
async function dbCreateGame(state) {
    await exports.prisma.game.create({
        data: {
            id: state.id,
            code: state.code,
            status: state.status,
            turn: state.turn,
            activeFaction: state.activeFaction,
            winnerFaction: state.winnerFaction,
            combatState: state.combat ? JSON.stringify(state.combat) : null,
            players: {
                create: state.players.map(p => ({
                    id: p.id,
                    socketId: p.socketId,
                    name: p.name,
                    faction: p.faction,
                })),
            },
            cities: {
                create: Object.values(state.cities).map(city => ({
                    id: city.id,
                    cityKey: city.cityKey,
                    name: city.name,
                    faction: city.faction,
                    capitalId: city.capitalId,
                    bastions: {
                        create: city.bastions.map(b => ({
                            id: b.id,
                            soldiers: b.soldiers,
                            initialSoldiers: b.initialSoldiers,
                        })),
                    },
                })),
            },
        },
    });
}
// Save/update game state in database
async function dbSaveGame(state) {
    // Update Game base info
    await exports.prisma.game.update({
        where: { id: state.id },
        data: {
            status: state.status,
            turn: state.turn,
            activeFaction: state.activeFaction,
            winnerFaction: state.winnerFaction,
            combatState: state.combat ? JSON.stringify(state.combat) : null,
        },
    });
    // Load existing cities and bastions from DB for this game to know what to delete
    const dbCities = await exports.prisma.city.findMany({
        where: { gameId: state.id },
        include: { bastions: true },
    });
    // Sync cities and bastions
    for (const city of Object.values(state.cities)) {
        const dbCity = dbCities.find((c) => c.cityKey === city.cityKey);
        if (dbCity) {
            // Update city ownership and capital
            await exports.prisma.city.update({
                where: { id: dbCity.id },
                data: {
                    faction: city.faction,
                    capitalId: city.capitalId,
                },
            });
            // Update/Delete/Create bastions
            const existingBastions = dbCity.bastions;
            const currentBastionIds = new Set(city.bastions.map(b => b.id));
            // 1. Delete bastions that are no longer in state (destroyed)
            const toDelete = existingBastions.filter((b) => !currentBastionIds.has(b.id));
            if (toDelete.length > 0) {
                await exports.prisma.bastion.deleteMany({
                    where: { id: { in: toDelete.map((b) => b.id) } },
                });
            }
            // 2. Update existing or insert new bastions
            for (const b of city.bastions) {
                const exist = existingBastions.find((eb) => eb.id === b.id);
                if (exist) {
                    await exports.prisma.bastion.update({
                        where: { id: b.id },
                        data: { soldiers: b.soldiers },
                    });
                }
                else {
                    await exports.prisma.bastion.create({
                        data: {
                            id: b.id,
                            soldiers: b.soldiers,
                            initialSoldiers: b.initialSoldiers,
                            cityId: dbCity.id,
                        },
                    });
                }
            }
        }
    }
    // Sync players (they might change factions in lobby)
    for (const p of state.players) {
        await exports.prisma.player.upsert({
            where: { id: p.id },
            update: {
                socketId: p.socketId,
                faction: p.faction,
            },
            create: {
                id: p.id,
                name: p.name,
                socketId: p.socketId,
                faction: p.faction,
                gameId: state.id,
            },
        });
    }
    // Sync actions history (only write new actions)
    const dbActionsCount = await exports.prisma.gameAction.count({ where: { gameId: state.id } });
    if (state.history.length > dbActionsCount) {
        const newActions = state.history.slice(dbActionsCount);
        for (const h of newActions) {
            await exports.prisma.gameAction.create({
                data: {
                    id: h.id,
                    type: h.type,
                    faction: h.faction,
                    details: h.details,
                    timestamp: new Date(h.timestamp),
                    gameId: state.id,
                },
            });
        }
    }
}
// Find game ID by room code
async function getGameIdByCode(code) {
    const game = await exports.prisma.game.findUnique({
        where: { code },
        select: { id: true },
    });
    return game?.id || null;
}
