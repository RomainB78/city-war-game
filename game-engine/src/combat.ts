import { CombatRound } from 'shared';

export interface CombatResult {
  rounds: CombatRound[];
  attackerRemaining: number;
  defenderRemaining: number;
  winner: 'ATTACKER' | 'DEFENDER';
}

export function simulateCombat(
  attackerSoldiers: number,
  defenderSoldiers: number,
  isDeterministic: boolean = false // retained for compatibility, but logic is deterministic now
): CombatResult {
  // 10% damage calculations
  const attackerDamage = attackerSoldiers >= 10 ? Math.floor(attackerSoldiers * 0.10) : 0;
  const defenderDamage = defenderSoldiers >= 10 ? Math.floor(defenderSoldiers * 0.10) : 0;

  const attackerRemaining = Math.max(0, attackerSoldiers - defenderDamage);
  const defenderRemaining = Math.max(0, defenderSoldiers - attackerDamage);

  const rounds: CombatRound[] = [
    {
      round: 1,
      attackerLosses: attackerSoldiers - attackerRemaining,
      defenderLosses: defenderSoldiers - defenderRemaining,
      attackerRemaining,
      defenderRemaining,
    }
  ];

  // Winner is ATTACKER if defender is destroyed, else DEFENDER (held their ground)
  const winner = defenderRemaining <= 0 ? 'ATTACKER' : 'DEFENDER';

  return {
    rounds,
    attackerRemaining,
    defenderRemaining,
    winner,
  };
}
