"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.simulateCombat = simulateCombat;
function simulateCombat(attackerSoldiers, defenderSoldiers, isDeterministic = false // retained for compatibility, but logic is deterministic now
) {
    // 10% damage calculations
    const attackerDamage = attackerSoldiers >= 10 ? Math.floor(attackerSoldiers * 0.10) : 0;
    const defenderDamage = defenderSoldiers >= 10 ? Math.floor(defenderSoldiers * 0.10) : 0;
    const attackerRemaining = Math.max(0, attackerSoldiers - defenderDamage);
    const defenderRemaining = Math.max(0, defenderSoldiers - attackerDamage);
    const rounds = [
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
