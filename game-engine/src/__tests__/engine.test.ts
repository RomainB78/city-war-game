import { createInitialState, performExchangeAction, initiateAttack, relocateCapital, validateAttackAction } from '../engine';
import { Player } from 'shared';

describe('Game Engine', () => {
  const players: Player[] = [
    { id: '1', name: 'Player 1', faction: 'VILLE_IMPERIALE' },
    { id: '2', name: 'Player 2', faction: 'CHATOU' },
  ];

  it('should initialize game state correctly', () => {
    const state = createInitialState('g1', 'CODE123', players);
    expect(state.id).toBe('g1');
    expect(state.code).toBe('CODE123');
    expect(state.status).toBe('LOBBY');
    expect(state.activeFaction).toBe('VILLE_IMPERIALE');

    // Chatou should have 5 bastions
    const chatouCity = state.cities['chatou'];
    expect(chatouCity.faction).toBe('CHATOU');
    expect(chatouCity.bastions.length).toBe(5);
    expect(chatouCity.bastions[0].soldiers).toBe(5836);
    expect(chatouCity.capitalId).toBe(chatouCity.bastions[0].id);

    // Saint Germain should have 52 bastions
    const sgCity = state.cities['saint_germain'];
    expect(sgCity.faction).toBe('VILLE_IMPERIALE');
    expect(sgCity.bastions.length).toBe(52);
    expect(sgCity.bastions[0].soldiers).toBe(854);
    expect(sgCity.capitalId).toBe(sgCity.bastions[0].id);
  });

  it('should prevent capital exchange', () => {
    const state = createInitialState('g1', 'CODE123', players);
    state.status = 'PLAYING';

    const sgCity = state.cities['saint_germain'];
    const lePecqCity = state.cities['le_pecq'];

    const capBastion = sgCity.capitalId!;
    const normalBastion = lePecqCity.bastions[1].id;

    // Sg and Le Pecq are neighbors, both owned by Ville Imperiale.
    // Try exchanging the capital bastion.
    expect(() => {
      performExchangeAction(state, 'VILLE_IMPERIALE', {
        sourceCityId: 'saint_germain',
        sourceBastionId: capBastion,
        targetCityId: 'le_pecq',
        targetBastionId: normalBastion,
      });
    }).toThrow('Cannot exchange the capital bastion');
  });

  it('should swap bastions during valid exchange', () => {
    const state = createInitialState('g1', 'CODE123', players);
    state.status = 'PLAYING';

    const sgCity = state.cities['saint_germain'];
    const lePecqCity = state.cities['le_pecq'];

    const srcBastionId = sgCity.bastions[1].id; // not capital
    const targetBastionId = lePecqCity.bastions[1].id; // not capital

    const srcOriginalCount = sgCity.bastions.length;
    const tgtOriginalCount = lePecqCity.bastions.length;

    const nextState = performExchangeAction(state, 'VILLE_IMPERIALE', {
      sourceCityId: 'saint_germain',
      sourceBastionId: srcBastionId,
      targetCityId: 'le_pecq',
      targetBastionId: targetBastionId,
    });

    expect(nextState.cities['saint_germain'].bastions.length).toBe(srcOriginalCount);
    expect(nextState.cities['le_pecq'].bastions.length).toBe(tgtOriginalCount);

    // Verify they swapped
    expect(nextState.cities['saint_germain'].bastions.some(b => b.id === targetBastionId)).toBe(true);
    expect(nextState.cities['le_pecq'].bastions.some(b => b.id === srcBastionId)).toBe(true);
    expect(nextState.activeFaction).toBe('CHATOU'); // Turn toggled
    expect(nextState.turn).toBe(2);
  });

  it('should trigger capital relocation when attacking capital', () => {
    const state = createInitialState('g1', 'CODE123', players);
    state.status = 'PLAYING';

    // Montesson (Blue, 7 bastions) and Le Pecq (Red, 3 bastions) are neighbors.
    // Setup Chatou turn (active)
    state.activeFaction = 'CHATOU';

    const montessonCity = state.cities['montesson'];
    const lePecqCity = state.cities['le_pecq'];

    const attackerBastionId = montessonCity.bastions[1].id;
    const defenderCapitalId = lePecqCity.capitalId!; // Le Pecq's capital bastion (which is under attack)

    const nextState = initiateAttack(state, 'CHATOU', {
      sourceCityId: 'montesson',
      sourceBastionId: attackerBastionId,
      targetCityId: 'le_pecq',
      targetBastionId: defenderCapitalId,
    });

    expect(nextState.combat).not.toBeNull();
    expect(nextState.combat?.isRelocatingCapital).toBe(true);
    expect(nextState.combat?.relocationDone).toBe(false);

    // Relocate capital to another bastion
    const newCapitalBastionId = lePecqCity.bastions[1].id;
    const postRelocationState = relocateCapital(nextState, 'VILLE_IMPERIALE', {
      cityId: 'le_pecq',
      newBastionId: newCapitalBastionId,
    });

    expect(postRelocationState.combat?.isRelocatingCapital).toBe(false);
    expect(postRelocationState.combat?.relocationDone).toBe(true);
    expect(postRelocationState.cities['le_pecq'].capitalId).toBe(newCapitalBastionId);
    expect(postRelocationState.activeFaction).toBe('VILLE_IMPERIALE'); // turn toggled after combat resolves
  });

  it('should enforce attack validations', () => {
    const state = createInitialState('g1', 'CODE123', players);
    state.status = 'PLAYING';
    state.activeFaction = 'CHATOU';

    // Chatou (5 bastions, 5836 soldiers) tries to attack Croissy (allied)
    expect(() => {
      initiateAttack(state, 'CHATOU', {
        sourceCityId: 'chatou',
        sourceBastionId: state.cities['chatou'].bastions[1].id,
        targetCityId: 'croissy',
        targetBastionId: state.cities['croissy'].bastions[0].id,
      });
    }).toThrow('You cannot attack an allied city');

    // Setup an attack where the attacking city only has 1 bastion
    const oneBastionState = JSON.parse(JSON.stringify(state));
    oneBastionState.cities['chatou'].bastions = [oneBastionState.cities['chatou'].bastions[0]];
    expect(() => {
      initiateAttack(oneBastionState, 'CHATOU', {
        sourceCityId: 'chatou',
        sourceBastionId: oneBastionState.cities['chatou'].bastions[0].id,
        targetCityId: 'le_vesinet', // enemy neighbor
        targetBastionId: oneBastionState.cities['le_vesinet'].bastions[0].id,
      });
    }).toThrow('Attacking city must own at least 2 bastions');

    // Attacking bastion has < 10 soldiers
    const weakBastionState = JSON.parse(JSON.stringify(state));
    weakBastionState.cities['chatou'].bastions[1].soldiers = 9;
    expect(() => {
      initiateAttack(weakBastionState, 'CHATOU', {
        sourceCityId: 'chatou',
        sourceBastionId: weakBastionState.cities['chatou'].bastions[1].id,
        targetCityId: 'le_vesinet',
        targetBastionId: weakBastionState.cities['le_vesinet'].bastions[0].id,
      });
    }).toThrow('Attacking bastion must contain at least 10 soldiers');
  });

  it('should apply simultaneous 10% combat damage correctly', () => {
    const state = createInitialState('g1', 'CODE123', players);
    state.status = 'PLAYING';
    state.activeFaction = 'CHATOU';

    const attackerId = state.cities['montesson'].bastions[1].id;
    const defenderId = state.cities['le_pecq'].bastions[1].id;

    const nextState = initiateAttack(state, 'CHATOU', {
      sourceCityId: 'montesson',
      sourceBastionId: attackerId,
      targetCityId: 'le_pecq',
      targetBastionId: defenderId,
    });

    const postAttacker = nextState.cities['montesson'].bastions.find(b => b.id === attackerId)!;
    const postDefender = nextState.cities['le_pecq'].bastions.find(b => b.id === defenderId)!;

    expect(postAttacker.soldiers).toBe(1415);
    expect(postDefender.soldiers).toBe(5378);
  });

  it('should handle pre-combat capital destruction and uncontrolled state', () => {
    const state = createInitialState('g1', 'CODE123', players);
    state.status = 'PLAYING';
    state.activeFaction = 'CHATOU';

    const portMarly = state.cities['port_marly'];
    portMarly.bastions = [{
      id: 'pm_last_bastion',
      soldiers: 15,
      initialSoldiers: 3894,
    }];
    portMarly.capitalId = 'pm_last_bastion';

    const nextState = initiateAttack(state, 'CHATOU', {
      sourceCityId: 'croissy',
      sourceBastionId: state.cities['croissy'].bastions[1].id,
      targetCityId: 'port_marly',
      targetBastionId: 'pm_last_bastion',
    });

    expect(nextState.cities['port_marly'].capitalId).toBeNull();
    expect(nextState.cities['port_marly'].faction).toBe('CHATOU');
    expect(nextState.cities['port_marly'].bastions.length).toBe(1);
    expect(nextState.cities['port_marly'].bastions[0].id).toBe('g1_croissy_bastion_2');
    expect(nextState.cities['port_marly'].bastions[0].soldiers).toBe(3022);
  });

  it('should allow targeting and attacking a city whose capital has already been destroyed if its bastion survived', () => {
    const state = createInitialState('g1', 'CODE123', players);
    state.status = 'PLAYING';
    state.activeFaction = 'CHATOU';

    const portMarly = state.cities['port_marly'];
    portMarly.bastions = [{
      id: 'pm_last_bastion',
      soldiers: 5000,
      initialSoldiers: 5000,
    }];
    portMarly.capitalId = 'pm_last_bastion';

    // 1st Attack: destroys capital status, but PM bastion survives combat
    const afterFirstAttack = initiateAttack(state, 'CHATOU', {
      sourceCityId: 'croissy',
      sourceBastionId: state.cities['croissy'].bastions[1].id,
      targetCityId: 'port_marly',
      targetBastionId: 'pm_last_bastion',
    });

    const pmAfterFirst = afterFirstAttack.cities['port_marly'];
    expect(pmAfterFirst.capitalId).toBeNull(); // Capital destroyed
    expect(pmAfterFirst.faction).toBe('VILLE_IMPERIALE'); // Still belongs to VILLE_IMPERIALE
    expect(pmAfterFirst.bastions.length).toBe(1); // Bastion survived
    expect(pmAfterFirst.bastions[0].soldiers).toBeGreaterThan(0);

    // Simulate CHATOU's next turn
    afterFirstAttack.activeFaction = 'CHATOU';

    // Verify it remains a valid target for a subsequent attack
    const validation = validateAttackAction(afterFirstAttack, 'CHATOU', {
      sourceCityId: 'croissy',
      sourceBastionId: afterFirstAttack.cities['croissy'].bastions[1].id,
      targetCityId: 'port_marly',
      targetBastionId: 'pm_last_bastion',
    });
    expect(validation.valid).toBe(true);

    // 2nd Attack executes cleanly against the uncontrolled city
    const afterSecondAttack = initiateAttack(afterFirstAttack, 'CHATOU', {
      sourceCityId: 'croissy',
      sourceBastionId: afterFirstAttack.cities['croissy'].bastions[1].id,
      targetCityId: 'port_marly',
      targetBastionId: 'pm_last_bastion',
    });
    expect(afterSecondAttack.cities['port_marly']).toBeDefined();
  });
});
