import { PrismaClient } from '@prisma/client';
import { GameState, Faction, GameStatus, City, Bastion, Player, GameActionLog } from 'shared';

export const prisma = new PrismaClient();

// Helper to convert database representation to GameState object
export async function mapDbToGameState(gameId: string): Promise<GameState | null> {
  const game = await prisma.game.findUnique({
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

  if (!game) return null;

  const citiesMap: Record<string, City> = {};
  for (const dbCity of game.cities) {
    citiesMap[dbCity.cityKey] = {
      id: dbCity.id,
      cityKey: dbCity.cityKey,
      name: dbCity.name,
      faction: dbCity.faction as Faction,
      capitalId: dbCity.capitalId,
      bastions: dbCity.bastions.map((b: any) => ({
        id: b.id,
        soldiers: b.soldiers,
        initialSoldiers: b.initialSoldiers,
      })),
    };
  }

  const players: Player[] = game.players.map((p: any) => ({
    id: p.id,
    socketId: p.socketId,
    name: p.name,
    faction: p.faction as Faction | null,
  }));

  const history: GameActionLog[] = game.history.map((h: any) => ({
    id: h.id,
    type: h.type as 'EXCHANGE' | 'ATTACK' | 'CAPITAL_RELOCATION',
    faction: h.faction as Faction,
    details: h.details,
    timestamp: h.timestamp.getTime(),
  }));

  const combat = game.combatState ? JSON.parse(game.combatState) : null;

  return {
    id: game.id,
    code: game.code,
    status: game.status as GameStatus,
    turn: game.turn,
    activeFaction: game.activeFaction as Faction,
    winnerFaction: game.winnerFaction as Faction | null,
    players,
    cities: citiesMap,
    combat,
    history,
  };
}

// Create a new game in database
export async function dbCreateGame(state: GameState): Promise<void> {
  await prisma.game.create({
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
export async function dbSaveGame(state: GameState): Promise<void> {
  const dbOps: Promise<any>[] = [];

  // Update Game base info
  dbOps.push(
    prisma.game.update({
      where: { id: state.id },
      data: {
        status: state.status,
        turn: state.turn,
        activeFaction: state.activeFaction,
        winnerFaction: state.winnerFaction,
        combatState: state.combat ? JSON.stringify(state.combat) : null,
      },
    })
  );

  // Load existing cities and bastions from DB for this game to know what to delete
  const dbCities = await prisma.city.findMany({
    where: { gameId: state.id },
    include: { bastions: true },
  });

  // Sync cities and bastions
  for (const city of Object.values(state.cities)) {
    const dbCity = dbCities.find((c: any) => c.cityKey === city.cityKey);

    if (dbCity) {
      // Update city ownership and capital
      dbOps.push(
        prisma.city.update({
          where: { id: dbCity.id },
          data: {
            faction: city.faction,
            capitalId: city.capitalId,
          },
        })
      );

      // Update/Delete/Create bastions
      const existingBastions = dbCity.bastions;
      const currentBastionIds = new Set(city.bastions.map(b => b.id));

      // 1. Delete bastions that are no longer in state (destroyed)
      const toDelete = existingBastions.filter((b: any) => !currentBastionIds.has(b.id));
      if (toDelete.length > 0) {
        dbOps.push(
          prisma.bastion.deleteMany({
            where: { id: { in: toDelete.map((b: any) => b.id) } },
          })
        );
      }

      // 2. Update existing or insert new bastions
      for (const b of city.bastions) {
        const exist = existingBastions.find((eb: any) => eb.id === b.id);
        if (exist) {
          dbOps.push(
            prisma.bastion.update({
              where: { id: b.id },
              data: { soldiers: b.soldiers },
            })
          );
        } else {
          dbOps.push(
            prisma.bastion.create({
              data: {
                id: b.id,
                soldiers: b.soldiers,
                initialSoldiers: b.initialSoldiers,
                cityId: dbCity.id,
              },
            })
          );
        }
      }
    }
  }

  // Sync players (they might change factions in lobby)
  for (const p of state.players) {
    dbOps.push(
      prisma.player.upsert({
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
      })
    );
  }

  // Sync actions history (only write new actions)
  const dbActionsCount = await prisma.gameAction.count({ where: { gameId: state.id } });
  if (state.history.length > dbActionsCount) {
    const newActions = state.history.slice(dbActionsCount);
    for (const h of newActions) {
      dbOps.push(
        prisma.gameAction.create({
          data: {
            id: h.id,
            type: h.type,
            faction: h.faction,
            details: h.details,
            timestamp: new Date(h.timestamp),
            gameId: state.id,
          },
        })
      );
    }
  }

  // Wait for all database operations to complete in parallel
  await Promise.all(dbOps);
}

// Find game ID by room code
export async function getGameIdByCode(code: string): Promise<string | null> {
  const game = await prisma.game.findUnique({
    where: { code },
    select: { id: true },
  });
  return game?.id || null;
}
