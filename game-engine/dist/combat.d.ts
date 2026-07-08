import { CombatRound } from 'shared';
export interface CombatResult {
    rounds: CombatRound[];
    attackerRemaining: number;
    defenderRemaining: number;
    winner: 'ATTACKER' | 'DEFENDER';
}
export declare function simulateCombat(attackerSoldiers: number, defenderSoldiers: number, isDeterministic?: boolean): CombatResult;
