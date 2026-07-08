export * from './constants';
export type GameStatus = 'LOBBY' | 'PLAYING' | 'FINISHED';

export type Faction = 'CHATOU' | 'VILLE_IMPERIALE';

export interface Bastion {
  id: string;
  soldiers: number;
  initialSoldiers: number;
}

export interface City {
  id: string;
  cityKey: string;
  name: string;
  faction: Faction;
  bastions: Bastion[];
  capitalId: string | null; // Id of the bastion holding the capital
}

export interface Player {
  id: string;
  socketId?: string | null;
  name: string;
  faction: Faction | null;
}

export interface CombatRound {
  round: number;
  attackerLosses: number;
  defenderLosses: number;
  attackerRemaining: number;
  defenderRemaining: number;
}

export interface CombatState {
  attackerCityId: string;
  attackerBastionId: string;
  defenderCityId: string;
  defenderBastionId: string;
  attackerInitialSoldiers: number;
  defenderInitialSoldiers: number;
  attackerRemainingSoldiers: number;
  defenderRemainingSoldiers: number;
  rounds: CombatRound[];
  winnerFaction: Faction | null;
  isRelocatingCapital: boolean;
  relocationDone: boolean;
}

export interface GameState {
  id: string;
  code: string;
  status: GameStatus;
  turn: number;
  activeFaction: Faction;
  winnerFaction: Faction | null;
  players: Player[];
  cities: Record<string, City>;
  combat: CombatState | null;
  history: GameActionLog[];
}

export interface GameActionLog {
  id: string;
  type: 'EXCHANGE' | 'ATTACK' | 'CAPITAL_RELOCATION';
  faction: Faction;
  details: string; // JSON or human readable details
  timestamp: number;
}

// Action arguments sent by client
export interface ExchangeActionArgs {
  sourceCityId: string;
  sourceBastionId: string;
  targetCityId: string;
  targetBastionId: string;
}

export interface AttackActionArgs {
  sourceCityId: string;
  sourceBastionId: string;
  targetCityId: string;
  targetBastionId: string;
}

export interface RelocateCapitalArgs {
  cityId: string;
  newBastionId: string;
}
