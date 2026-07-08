"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInitialState = createInitialState;
exports.validateExchangeAction = validateExchangeAction;
exports.performExchangeAction = performExchangeAction;
exports.validateAttackAction = validateAttackAction;
exports.initiateAttack = initiateAttack;
exports.validateRelocateCapital = validateRelocateCapital;
exports.relocateCapital = relocateCapital;
exports.resolveCombat = resolveCombat;
exports.clearCombatState = clearCombatState;
const shared_1 = require("shared");
const combat_1 = require("./combat");
// Helper to generate unique ID
function generateId() {
    return Math.random().toString(36).substring(2, 11);
}
// Create initial state
function createInitialState(gameId, code, players) {
    const cities = {};
    for (const [key, config] of Object.entries(shared_1.INITIAL_CITIES_CONFIG)) {
        const bastions = [];
        for (let i = 0; i < config.bastionCount; i++) {
            bastions.push({
                id: `${key}_bastion_${i + 1}`,
                soldiers: config.soldiersPerBastion,
                initialSoldiers: config.soldiersPerBastion,
            });
        }
        cities[key] = {
            id: key,
            cityKey: key,
            name: config.name,
            faction: config.faction,
            bastions,
            // Capital is initially placed on the first bastion
            capitalId: bastions[0]?.id || null,
        };
    }
    return {
        id: gameId,
        code,
        status: 'LOBBY',
        turn: 1,
        activeFaction: 'VILLE_IMPERIALE', // Saint-Germain-en-Laye starts
        winnerFaction: null,
        players,
        cities,
        combat: null,
        history: [],
    };
}
// Validate Exchange Action
function validateExchangeAction(state, playerFaction, args) {
    if (state.status !== 'PLAYING') {
        return { valid: false, error: 'Game is not in PLAYING state' };
    }
    if (state.activeFaction !== playerFaction) {
        return { valid: false, error: "It is not your turn" };
    }
    if (state.combat) {
        return { valid: false, error: 'Combat is currently in progress' };
    }
    const { sourceCityId, sourceBastionId, targetCityId, targetBastionId } = args;
    const sourceCity = state.cities[sourceCityId];
    const targetCity = state.cities[targetCityId];
    if (!sourceCity || !targetCity) {
        return { valid: false, error: 'Source or target city not found' };
    }
    if (sourceCity.faction !== playerFaction) {
        return { valid: false, error: 'You do not own the source city' };
    }
    if (targetCity.faction !== playerFaction) {
        return { valid: false, error: 'You do not own the target city' };
    }
    // Check if they are neighbors
    const neighbors = shared_1.ADJACENCY_MAP[sourceCityId] || [];
    if (!neighbors.includes(targetCityId)) {
        return { valid: false, error: 'Cities are not neighbors' };
    }
    const sourceBastion = sourceCity.bastions.find(b => b.id === sourceBastionId);
    const targetBastion = targetCity.bastions.find(b => b.id === targetBastionId);
    if (!sourceBastion || !targetBastion) {
        return { valid: false, error: 'Source or target bastion not found' };
    }
    // Uncontrolled cities check
    if (sourceCity.capitalId === null) {
        return { valid: false, error: 'Uncontrolled source city cannot participate in exchanges' };
    }
    if (targetCity.capitalId === null) {
        return { valid: false, error: 'Uncontrolled target city cannot participate in exchanges' };
    }
    // Capital check
    if (sourceCity.capitalId === sourceBastionId) {
        return { valid: false, error: 'Cannot exchange the capital bastion' };
    }
    if (targetCity.capitalId === targetBastionId) {
        return { valid: false, error: 'Cannot exchange the capital bastion' };
    }
    return { valid: true };
}
// Perform Exchange Action
function performExchangeAction(state, playerFaction, args) {
    const validation = validateExchangeAction(state, playerFaction, args);
    if (!validation.valid) {
        throw new Error(validation.error || 'Invalid exchange action');
    }
    const newState = JSON.parse(JSON.stringify(state));
    const { sourceCityId, sourceBastionId, targetCityId, targetBastionId } = args;
    const sourceCity = newState.cities[sourceCityId];
    const targetCity = newState.cities[targetCityId];
    const sourceBastionIdx = sourceCity.bastions.findIndex(b => b.id === sourceBastionId);
    const targetBastionIdx = targetCity.bastions.findIndex(b => b.id === targetBastionId);
    const sourceBastion = sourceCity.bastions[sourceBastionIdx];
    const targetBastion = targetCity.bastions[targetBastionIdx];
    // Swap bastions between cities
    sourceCity.bastions.splice(sourceBastionIdx, 1);
    targetCity.bastions.splice(targetBastionIdx, 1);
    sourceCity.bastions.push(targetBastion);
    targetCity.bastions.push(sourceBastion);
    // Add to history
    newState.history.push({
        id: generateId(),
        type: 'EXCHANGE',
        faction: playerFaction,
        details: `Exchanged bastion in ${sourceCity.name} with bastion in ${targetCity.name}`,
        timestamp: Date.now(),
    });
    // Switch turn
    newState.activeFaction = playerFaction === 'CHATOU' ? 'VILLE_IMPERIALE' : 'CHATOU';
    newState.turn += 1;
    return newState;
}
// Validate Attack Action
function validateAttackAction(state, playerFaction, args) {
    if (state.status !== 'PLAYING') {
        return { valid: false, error: 'Game is not in PLAYING state' };
    }
    if (state.activeFaction !== playerFaction) {
        return { valid: false, error: "It is not your turn" };
    }
    if (state.combat) {
        return { valid: false, error: 'Combat is already in progress' };
    }
    const { sourceCityId, sourceBastionId, targetCityId, targetBastionId } = args;
    const sourceCity = state.cities[sourceCityId];
    const targetCity = state.cities[targetCityId];
    if (!sourceCity || !targetCity) {
        return { valid: false, error: 'Source or target city not found' };
    }
    if (sourceCity.faction !== playerFaction) {
        return { valid: false, error: 'You do not own the source city' };
    }
    if (targetCity.faction === playerFaction) {
        return { valid: false, error: 'You cannot attack an allied city' };
    }
    // Check neighbors
    const neighbors = shared_1.ADJACENCY_MAP[sourceCityId] || [];
    if (!neighbors.includes(targetCityId)) {
        return { valid: false, error: 'Cities are not neighbors' };
    }
    // Uncontrolled cities check
    if (sourceCity.capitalId === null) {
        return { valid: false, error: 'Uncontrolled cities cannot attack' };
    }
    // Attacking city must own at least 2 bastions
    if (sourceCity.bastions.length < 2) {
        return { valid: false, error: 'Attacking city must own at least 2 bastions' };
    }
    const sourceBastion = sourceCity.bastions.find(b => b.id === sourceBastionId);
    const targetBastion = targetCity.bastions.find(b => b.id === targetBastionId);
    if (!sourceBastion || !targetBastion) {
        return { valid: false, error: 'Source or target bastion not found' };
    }
    // Attacking bastion cannot be a capital
    if (sourceCity.capitalId === sourceBastionId) {
        return { valid: false, error: 'Attacking bastion cannot be a capital' };
    }
    // Attacking bastion must contain at least 10 soldiers
    if (sourceBastion.soldiers < 10) {
        return { valid: false, error: 'Attacking bastion must contain at least 10 soldiers' };
    }
    if (targetBastion.soldiers <= 0) {
        return { valid: false, error: 'Target bastion has no soldiers' };
    }
    return { valid: true };
}
// Initiate Attack
function initiateAttack(state, playerFaction, args) {
    const validation = validateAttackAction(state, playerFaction, args);
    if (!validation.valid) {
        throw new Error(validation.error || 'Invalid attack action');
    }
    const newState = JSON.parse(JSON.stringify(state));
    const { sourceCityId, sourceBastionId, targetCityId, targetBastionId } = args;
    const sourceCity = newState.cities[sourceCityId];
    const targetCity = newState.cities[targetCityId];
    const sourceBastion = sourceCity.bastions.find(b => b.id === sourceBastionId);
    const targetBastion = targetCity.bastions.find(b => b.id === targetBastionId);
    // Check if target is capital
    const isTargetCapital = targetCity.capitalId === targetBastionId;
    const otherDefendingBastions = targetCity.bastions.filter(b => b.id !== targetBastionId && b.soldiers > 0);
    const combatState = {
        attackerCityId: sourceCityId,
        attackerBastionId: sourceBastionId,
        defenderCityId: targetCityId,
        defenderBastionId: targetBastionId,
        attackerInitialSoldiers: sourceBastion.soldiers,
        defenderInitialSoldiers: targetBastion.soldiers,
        attackerRemainingSoldiers: sourceBastion.soldiers,
        defenderRemainingSoldiers: targetBastion.soldiers,
        rounds: [],
        winnerFaction: null,
        isRelocatingCapital: isTargetCapital && otherDefendingBastions.length > 0,
        relocationDone: false,
    };
    newState.combat = combatState;
    // If we need relocation, we pause and wait. Otherwise we resolve combat directly!
    if (!combatState.isRelocatingCapital) {
        return resolveCombat(newState);
    }
    return newState;
}
// Relocate Capital
function validateRelocateCapital(state, playerFaction, args) {
    if (!state.combat || !state.combat.isRelocatingCapital) {
        return { valid: false, error: 'No capital relocation pending' };
    }
    const defenderFaction = state.activeFaction === 'CHATOU' ? 'VILLE_IMPERIALE' : 'CHATOU';
    if (playerFaction !== defenderFaction) {
        return { valid: false, error: 'Only the defender can relocate their capital' };
    }
    const { cityId, newBastionId } = args;
    if (cityId !== state.combat.defenderCityId) {
        return { valid: false, error: 'Must relocate capital in the attacked city' };
    }
    const city = state.cities[cityId];
    if (!city) {
        return { valid: false, error: 'City not found' };
    }
    const newBastion = city.bastions.find(b => b.id === newBastionId);
    if (!newBastion) {
        return { valid: false, error: 'New capital bastion not found' };
    }
    if (newBastionId === state.combat.defenderBastionId) {
        return { valid: false, error: 'Cannot relocate capital to the bastion currently under attack' };
    }
    if (newBastion.soldiers <= 0) {
        return { valid: false, error: 'New capital bastion must contain soldiers' };
    }
    return { valid: true };
}
function relocateCapital(state, playerFaction, args) {
    const validation = validateRelocateCapital(state, playerFaction, args);
    if (!validation.valid) {
        throw new Error(validation.error || 'Invalid capital relocation');
    }
    const newState = JSON.parse(JSON.stringify(state));
    const { cityId, newBastionId } = args;
    const city = newState.cities[cityId];
    city.capitalId = newBastionId;
    if (newState.combat) {
        newState.combat.isRelocatingCapital = false;
        newState.combat.relocationDone = true;
    }
    newState.history.push({
        id: generateId(),
        type: 'CAPITAL_RELOCATION',
        faction: playerFaction,
        details: `Relocated capital of ${city.name} to bastion ${newBastionId}`,
        timestamp: Date.now(),
    });
    // Now that relocation is done, resolve the combat!
    return resolveCombat(newState);
}
// Helper to check victory conditions
function checkVictory(state) {
    // Count capitals for Chatou and Ville Imperiale
    let chatouCapitals = 0;
    let villeImperialeCapitals = 0;
    for (const city of Object.values(state.cities)) {
        if (city.capitalId) {
            if (city.faction === 'CHATOU') {
                chatouCapitals++;
            }
            else if (city.faction === 'VILLE_IMPERIALE') {
                villeImperialeCapitals++;
            }
        }
    }
    if (chatouCapitals === 0) {
        return 'VILLE_IMPERIALE';
    }
    if (villeImperialeCapitals === 0) {
        return 'CHATOU';
    }
    return null;
}
// Resolve Combat
function resolveCombat(state) {
    if (!state.combat) {
        throw new Error('No combat to resolve');
    }
    const newState = JSON.parse(JSON.stringify(state));
    const combat = newState.combat;
    const attackerCity = newState.cities[combat.attackerCityId];
    const defenderCity = newState.cities[combat.defenderCityId];
    const attackerBastion = attackerCity.bastions.find(b => b.id === combat.attackerBastionId);
    const defenderBastion = defenderCity.bastions.find(b => b.id === combat.defenderBastionId);
    // Pre-combat capital destruction if defender cannot relocate (no other bastions)
    const isTargetCapital = defenderCity.capitalId === defenderBastion.id;
    if (isTargetCapital && !combat.relocationDone) {
        defenderCity.capitalId = null;
        newState.history.push({
            id: generateId(),
            type: 'CAPITAL_RELOCATION',
            faction: defenderCity.faction,
            details: `Capital of ${defenderCity.name} was destroyed (no relocation bastion available)`,
            timestamp: Date.now(),
        });
        // Check if defeat condition is met immediately
        const winner = checkVictory(newState);
        if (winner) {
            newState.status = 'FINISHED';
            newState.winnerFaction = winner;
        }
    }
    // Run simulation
    const result = (0, combat_1.simulateCombat)(attackerBastion.soldiers, defenderBastion.soldiers);
    combat.rounds = result.rounds;
    combat.attackerRemainingSoldiers = result.attackerRemaining;
    combat.defenderRemainingSoldiers = result.defenderRemaining;
    combat.winnerFaction = result.winner === 'ATTACKER' ? attackerCity.faction : defenderCity.faction;
    // Apply updates to the bastions
    attackerBastion.soldiers = result.attackerRemaining;
    defenderBastion.soldiers = result.defenderRemaining;
    // Check if attacker is destroyed
    if (attackerBastion.soldiers <= 0) {
        attackerCity.bastions = attackerCity.bastions.filter(b => b.id !== attackerBastion.id);
        // If the attacker bastion held the capital of attackerCity, that capital is destroyed!
        if (attackerCity.capitalId === attackerBastion.id) {
            attackerCity.capitalId = null;
        }
    }
    // Check if defender is destroyed
    if (defenderBastion.soldiers <= 0) {
        defenderCity.bastions = defenderCity.bastions.filter(b => b.id !== defenderBastion.id);
        // If it was capital, remove it
        if (defenderCity.capitalId === defenderBastion.id) {
            defenderCity.capitalId = null;
        }
        // Check if the defender city has lost all of its bastions (meaning it is conquered!)
        if (defenderCity.bastions.length === 0) {
            defenderCity.faction = attackerCity.faction;
            // The victorious attacker bastion moves to the conquered city (only if it survived)
            if (attackerBastion.soldiers > 0) {
                attackerCity.bastions = attackerCity.bastions.filter(b => b.id !== attackerBastion.id);
                defenderCity.bastions.push(attackerBastion);
                // The newly moved bastion becomes the first bastion and capital of the conquered city
                defenderCity.capitalId = attackerBastion.id;
            }
        }
    }
    // Add history log
    newState.history.push({
        id: generateId(),
        type: 'ATTACK',
        faction: attackerCity.faction,
        details: `Attacked ${defenderCity.name} from ${attackerCity.name}. Winner: ${combat.winnerFaction}. Attacker remaining: ${result.attackerRemaining}. Defender remaining: ${result.defenderRemaining}`,
        timestamp: Date.now(),
    });
    // Check victory
    const winner = checkVictory(newState);
    if (winner) {
        newState.status = 'FINISHED';
        newState.winnerFaction = winner;
    }
    // Switch turn
    newState.activeFaction = newState.activeFaction === 'CHATOU' ? 'VILLE_IMPERIALE' : 'CHATOU';
    newState.turn += 1;
    // Keep combat state attached so the client can animate it, but set state.combat to be archived or cleared.
    // Actually, keeping the combat state in `combat` helps the frontend play the animation.
    // The server can clear `combat` state on the next turn or action. We will keep it for now and clear it when the next turn begins.
    // Wait, let's keep `newState.combat` until the players click "Continue" or let's clear it on the next action. That's perfect.
    return newState;
}
// Clear combat state when starting a new turn/action
function clearCombatState(state) {
    const newState = JSON.parse(JSON.stringify(state));
    newState.combat = null;
    return newState;
}
