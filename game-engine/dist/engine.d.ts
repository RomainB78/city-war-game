import { GameState, Faction, ExchangeActionArgs, AttackActionArgs, RelocateCapitalArgs, Player } from 'shared';
export declare function createInitialState(gameId: string, code: string, players: Player[]): GameState;
export declare function validateExchangeAction(state: GameState, playerFaction: Faction, args: ExchangeActionArgs): {
    valid: boolean;
    error?: string;
};
export declare function performExchangeAction(state: GameState, playerFaction: Faction, args: ExchangeActionArgs): GameState;
export declare function validateAttackAction(state: GameState, playerFaction: Faction, args: AttackActionArgs): {
    valid: boolean;
    error?: string;
};
export declare function initiateAttack(state: GameState, playerFaction: Faction, args: AttackActionArgs): GameState;
export declare function validateRelocateCapital(state: GameState, playerFaction: Faction, args: RelocateCapitalArgs): {
    valid: boolean;
    error?: string;
};
export declare function relocateCapital(state: GameState, playerFaction: Faction, args: RelocateCapitalArgs): GameState;
export declare function resolveCombat(state: GameState): GameState;
export declare function clearCombatState(state: GameState): GameState;
