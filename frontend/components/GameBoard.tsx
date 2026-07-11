import React, { useState, useEffect } from 'react';
import { GameState, Faction, City, Bastion, ADJACENCY_MAP } from 'shared';
import { Settings, LogOut, Shield, Swords, Crown, ChevronRight, HelpCircle } from 'lucide-react';
import InteractiveMap from './InteractiveMap';
import RulesModal from './RulesModal';

interface GameBoardProps {
  gameState: GameState;
  playerId: string;
  sendAction: (gameId: string, actionType: 'EXCHANGE' | 'ATTACK' | 'CLEAR_COMBAT', args?: any) => void;
  sendRelocateCapital: (gameId: string, cityId: string, newBastionId: string) => void;
  quitRoom: () => void;
  error: string | null;
}

export default function GameBoard({
  gameState,
  playerId,
  sendAction,
  sendRelocateCapital,
  quitRoom,
  error
}: GameBoardProps) {
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null);
  const [selectedBastionId, setSelectedBastionId] = useState<string | null>(null);

  // Action flow state
  const [selectionMode, setSelectionMode] = useState<'NONE' | 'EXCHANGE' | 'ATTACK'>('NONE');
  const [targetCityId, setTargetCityId] = useState<string | null>(null);
  const [targetBastionId, setTargetBastionId] = useState<string | null>(null);

  const activePlayer = gameState.players.find(p => p.id === playerId);
  const isMyTurn = gameState.activeFaction === activePlayer?.faction;
  const myFaction = activePlayer?.faction || null;

  // Clear selections when turn changes
  useEffect(() => {
    setSelectedCityId(null);
    setSelectedBastionId(null);
    setSelectionMode('NONE');
    setTargetCityId(null);
    setTargetBastionId(null);
  }, [gameState.turn]);

  const handleSelectCity = (cityId: string) => {
    const city = gameState.cities[cityId];
    if (!city) return;

    if (selectionMode === 'NONE') {
      setSelectedCityId(cityId);
      setSelectedBastionId(null);
    } else if (selectionMode === 'EXCHANGE' || selectionMode === 'ATTACK') {
      // If we are choosing a target city in exchange/attack flow
      const validTargets = getValidTargets();
      if (validTargets.includes(cityId)) {
        setTargetCityId(cityId);
        setTargetBastionId(null);
      }
    }
  };

  const getValidTargets = (): string[] => {
    if (!selectedCityId) return [];
    const neighbors = ADJACENCY_MAP[selectedCityId] || [];

    if (selectionMode === 'EXCHANGE') {
      // Allied neighbors that have capitals or not, wait.
      // Uncontrolled cities cannot participate in exchanges
      return neighbors.filter(nId => {
        const c = gameState.cities[nId];
        return c && c.faction === myFaction && c.capitalId !== null;
      });
    } else if (selectionMode === 'ATTACK') {
      // Enemy neighbors (can be uncontrolled too, they defend automatically)
      return neighbors.filter(nId => {
        const c = gameState.cities[nId];
        return c && c.faction !== myFaction;
      });
    }
    return [];
  };

  // Capital relocation check
  const isDefenderOfRelocation = gameState.combat?.isRelocatingCapital && 
    gameState.cities[gameState.combat.defenderCityId].faction === myFaction;

  const handleConfirmExchange = () => {
    if (selectedCityId && selectedBastionId && targetCityId && targetBastionId) {
      sendAction(gameState.id, 'EXCHANGE', {
        sourceCityId: selectedCityId,
        sourceBastionId: selectedBastionId,
        targetCityId: targetCityId,
        targetBastionId: targetBastionId
      });
      setSelectionMode('NONE');
      setSelectedCityId(null);
      setSelectedBastionId(null);
      setTargetCityId(null);
      setTargetBastionId(null);
    }
  };

  const handleConfirmAttack = () => {
    if (selectedCityId && selectedBastionId && targetCityId && targetBastionId) {
      sendAction(gameState.id, 'ATTACK', {
        sourceCityId: selectedCityId,
        sourceBastionId: selectedBastionId,
        targetCityId: targetCityId,
        targetBastionId: targetBastionId
      });
      setSelectionMode('NONE');
      setSelectedCityId(null);
      setSelectedBastionId(null);
      setTargetCityId(null);
      setTargetBastionId(null);
    }
  };

  const countCapitals = (faction: Faction) => {
    return Object.values(gameState.cities).filter(c => c.faction === faction && c.capitalId).length;
  };

  const selectedCity = selectedCityId ? gameState.cities[selectedCityId] : null;
  const targetCity = targetCityId ? gameState.cities[targetCityId] : null;

  return (
    <div className="min-h-screen bg-[#070605] text-stone-100 flex flex-col relative overflow-hidden font-serif">
      {/* Top Header Navigation */}
      <header className="bg-stone-950/80 border-b border-amber-900/20 px-6 py-4 flex justify-between items-center relative z-20 backdrop-blur-md">
        {/* Left Options Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsRulesOpen(true)}
            className="p-2 bg-stone-900 hover:bg-stone-850 border border-amber-900/30 text-amber-500 rounded-lg transition-all shadow-md hover:scale-105 active:scale-95"
            title="Options / Règles"
          >
            <Settings size={20} />
          </button>
        </div>

        {/* Center Turn/Capitals Info Banner */}
        <div className="flex flex-col items-center justify-center text-center">
          <div className="text-[10px] tracking-[0.2em] font-mono text-stone-500 uppercase">
            Tour {gameState.turn}
          </div>
          <h2 className={`text-lg font-black tracking-wider uppercase flex items-center gap-2 ${
            gameState.activeFaction === 'CHATOU' ? 'text-blue-400' : 'text-red-400'
          }`}>
            {gameState.activeFaction === 'CHATOU' ? <Swords size={18} /> : <Shield size={18} />}
            {gameState.activeFaction === 'CHATOU' ? 'Seigneur de Chatou' : 'Seigneur Impérial'}
          </h2>
          {isMyTurn ? (
            <span className="text-[9px] font-mono text-amber-500 animate-pulse uppercase mt-0.5">À votre commandement</span>
          ) : (
            <span className="text-[9px] font-mono text-stone-600 uppercase mt-0.5">En attente de l'adversaire</span>
          )}
        </div>

        {/* Right Quit Button */}
        <div className="flex items-center gap-4">
          {/* Capitals Indicator */}
          <div className="hidden md:flex gap-6 items-center text-xs font-mono bg-stone-900/40 px-4 py-1.5 rounded-lg border border-stone-900">
            <div className="flex items-center gap-1.5 text-blue-400">
              <Crown size={12} className="fill-blue-500" />
              <span>Chatou: <strong className="text-stone-200">{countCapitals('CHATOU')}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-red-400">
              <Crown size={12} className="fill-red-500" />
              <span>Impérial: <strong className="text-stone-200">{countCapitals('VILLE_IMPERIALE')}</strong></span>
            </div>
          </div>

          <button
            onClick={quitRoom}
            className="p-2 bg-red-950/20 hover:bg-red-950/40 border border-red-900/40 text-red-400 rounded-lg transition-all shadow-md"
            title="Quitter la partie"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Main Board Body */}
      <main className="flex-1 flex flex-col lg:flex-row p-4 gap-4 overflow-hidden relative">
        {/* Error Notification Toast */}
        {error && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-950/90 border-2 border-red-800/80 px-6 py-3 rounded-lg shadow-2xl z-50 text-red-200 text-sm font-semibold tracking-wider font-mono animate-bounce">
            {error}
          </div>
        )}

        {/* Map Area */}
        <div className="flex-1 min-h-[450px] lg:min-h-0 bg-[#0e0c0a] border border-amber-900/10 rounded-xl relative p-2 flex items-center justify-center">
          <InteractiveMap
            cities={gameState.cities}
            activeFaction={gameState.activeFaction}
            playerFaction={myFaction}
            selectedCityId={selectedCityId}
            onSelectCity={handleSelectCity}
            validTargets={getValidTargets()}
            selectionMode={selectionMode}
          />
        </div>

        {/* Right Sidebar City Details Panel */}
        <div className="w-full lg:w-80 bg-gradient-to-b from-[#141210] to-[#0c0a09] border border-amber-900/25 rounded-xl shadow-xl flex flex-col p-5 overflow-y-auto glow-gold relative z-10 shrink-0 lg:max-h-full">
          {selectedCity ? (
            <div className="flex-1 flex flex-col">
              {/* City Title Banner */}
              <div className="mb-5 border-b border-amber-900/20 pb-3 flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold tracking-wide text-stone-200">{selectedCity.name}</h3>
                  <span className={`text-[10px] font-mono uppercase tracking-wider ${
                    selectedCity.capitalId === null 
                      ? 'text-stone-400'
                      : selectedCity.faction === 'CHATOU' 
                      ? 'text-blue-400' 
                      : 'text-red-400'
                  }`}>
                    {selectedCity.capitalId === null 
                      ? 'Territoire Incontrôlable' 
                      : selectedCity.faction === 'CHATOU' 
                      ? 'Souveraineté de Chatou' 
                      : 'Territoire Impérial'}
                  </span>
                </div>
                {selectedCity.capitalId && (
                  <Crown size={20} className="text-amber-500 fill-amber-500 animate-[pulse_3s_infinite]" />
                )}
              </div>

              {/* Bastions List */}
              <div className="flex-grow space-y-3 mb-6">
                <span className="text-[10px] tracking-wider text-stone-500 font-mono block uppercase">Armées en Garnison (Bastions)</span>
                {selectedCity.bastions.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {selectedCity.bastions.map((bastion, index) => {
                      const isCapital = selectedCity.capitalId === bastion.id;
                      const isSelected = selectedBastionId === bastion.id;
                      const canSelect = !isCapital && selectedCity.faction === myFaction && isMyTurn && selectedCity.capitalId !== null;

                      return (
                        <button
                          key={bastion.id}
                          disabled={!canSelect}
                          onClick={() => {
                            if (selectionMode === 'NONE') {
                              setSelectedBastionId(bastion.id);
                            }
                          }}
                          className={`w-full p-3 rounded-lg border flex items-center justify-between text-left transition-all ${
                            isSelected
                              ? 'bg-amber-950/20 border-amber-500 shadow-[0_0_8px_rgba(217,119,6,0.2)]'
                              : isCapital
                              ? 'bg-[#1c140c]/50 border-amber-900/20 cursor-not-allowed opacity-80'
                              : canSelect
                              ? 'bg-[#100e0d] border-stone-850 hover:border-amber-900/40 hover:bg-[#151210]'
                              : 'bg-stone-950/25 border-stone-900 opacity-60 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-mono text-stone-500">#{index + 1}</span>
                            <div>
                              <span className="text-stone-300 font-medium font-mono text-sm">
                                {bastion.soldiers} <span className="text-[10px] text-stone-500">hommes</span>
                                {bastion.soldiers === 0 && (
                                  <span className="text-[10px] font-mono uppercase ml-2 text-stone-500 bg-stone-900 px-1.5 py-0.5 rounded border border-stone-800">Inactif</span>
                                )}
                              </span>
                              <span className="text-[9px] font-mono text-stone-600 block">Initial: {bastion.initialSoldiers}</span>
                            </div>
                          </div>
                          {isCapital && (
                            <span className="flex items-center gap-1 text-[9px] font-mono uppercase text-amber-500">
                              <Crown size={12} className="fill-amber-500" /> Cour royale
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs italic text-stone-600">Aucun bastion dans cette province.</p>
                )}
              </div>

              {/* Actions panel */}
              {isMyTurn && selectedCity.faction === myFaction && selectedCity.capitalId !== null && selectionMode === 'NONE' && (
                <div className="space-y-3">
                  <span className="text-[10px] tracking-wider text-stone-500 font-mono block uppercase">Ordres de Commandement</span>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setSelectionMode('EXCHANGE')}
                      disabled={!selectedBastionId}
                      className="bg-stone-900 hover:bg-stone-850 disabled:bg-stone-950 border border-amber-950/30 text-amber-500 disabled:text-stone-700 py-3 rounded-lg text-sm font-semibold tracking-wider transition-all"
                    >
                      ÉCHANGER
                    </button>
                    <button
                      onClick={() => setSelectionMode('ATTACK')}
                      disabled={!selectedBastionId || selectedCity.bastions.length < 2 || (selectedCity.bastions.find(b => b.id === selectedBastionId)?.soldiers || 0) < 10}
                      title={selectedCity.bastions.length < 2 ? "Requiert au moins 2 bastions dans la ville" : ""}
                      className="bg-stone-900 hover:bg-stone-850 disabled:bg-stone-950 border border-amber-950/30 text-amber-500 disabled:text-stone-700 py-3 rounded-lg text-sm font-semibold tracking-wider transition-all"
                    >
                      ATTAQUER
                    </button>
                  </div>
                  {selectedCity.bastions.length < 2 && (
                    <p className="text-[9px] text-red-500/80 font-mono block text-center mt-1">L'attaque requiert au moins 2 bastions dans cette ville.</p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
              <HelpCircle size={40} className="text-stone-500 mb-3" />
              <p className="font-serif text-sm text-stone-400">Sélectionnez un territoire sur la carte pour inspecter ses garnisons ou donner des ordres.</p>
            </div>
          )}

          {/* Action Overlay Flow Steps */}
          {selectionMode !== 'NONE' && (
            <div className="mt-auto border-t border-amber-900/20 pt-4 space-y-4">
              <div className="bg-[#1c120a]/30 border border-amber-900/30 p-3 rounded-lg">
                <span className="text-[10px] font-mono uppercase text-amber-500 block">Étape Suivante:</span>
                <p className="text-xs text-stone-300">
                  {selectionMode === 'EXCHANGE'
                    ? "Sélectionnez une ville voisine alliée sur la carte, puis choisissez un bastion à échanger."
                    : "Sélectionnez une ville voisine ennemie, puis ciblez un bastion à attaquer."}
                </p>
              </div>

              {/* Target City & Bastion Details */}
              {targetCity && (
                <div className="space-y-3 bg-[#0d0c0b] p-3 rounded-lg border border-stone-850">
                  <span className="text-[10px] font-mono uppercase text-stone-500 block">Cible : {targetCity.name}</span>
                  <div className="space-y-2">
                    {targetCity.bastions.map((b, idx) => {
                      const isCapital = targetCity.capitalId === b.id;
                      const isDisabled = selectionMode === 'EXCHANGE' && isCapital;

                      return (
                        <button
                          key={b.id}
                          disabled={isDisabled}
                          onClick={() => setTargetBastionId(b.id)}
                          className={`w-full p-2 text-xs rounded border text-left flex justify-between items-center ${
                            targetBastionId === b.id
                              ? 'bg-amber-950/20 border-amber-500 text-stone-100'
                              : isDisabled
                              ? 'opacity-30 cursor-not-allowed border-stone-900 text-stone-600'
                              : 'bg-stone-950/40 border-stone-900 hover:border-amber-900/20 text-stone-400'
                          }`}
                        >
                          <span>
                            Bastion #{idx + 1} ({b.soldiers} soldats)
                            {b.soldiers === 0 && <span className="ml-1.5 text-[9px] text-stone-500">[Inactif]</span>}
                          </span>
                          {isCapital && (
                            <span className="text-[9px] uppercase font-mono text-amber-500 flex items-center gap-0.5"><Crown size={10} className="fill-amber-500" /> Capitale</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Confirm Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectionMode('NONE');
                    setTargetCityId(null);
                    setTargetBastionId(null);
                  }}
                  className="flex-1 bg-stone-950 hover:bg-stone-900 text-stone-400 border border-stone-850 py-2.5 rounded text-xs tracking-wider"
                >
                  ANNULER
                </button>
                {selectionMode === 'EXCHANGE' ? (
                  <button
                    onClick={handleConfirmExchange}
                    disabled={!targetBastionId}
                    className="flex-1 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:from-stone-900 disabled:text-stone-700 text-stone-950 font-bold py-2.5 rounded text-xs tracking-wider border border-amber-600/20"
                  >
                    CONFIRMER
                  </button>
                ) : (
                  <button
                    onClick={handleConfirmAttack}
                    disabled={!targetBastionId}
                    className="flex-1 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:from-stone-900 disabled:text-stone-700 text-stone-950 font-bold py-2.5 rounded text-xs tracking-wider border border-amber-600/20"
                  >
                    LANCER L'ATTAQUE
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Defender Capital Relocation Modal Overlay */}
      {isDefenderOfRelocation && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[90] flex items-center justify-center p-4">
          <div className="bg-[#1c1917] border-2 border-amber-500/80 rounded-xl p-8 max-w-md w-full shadow-2xl relative text-center glow-gold space-y-6">
            <Crown className="w-16 h-16 text-amber-500 fill-amber-500 mx-auto animate-bounce" />
            <h3 className="text-xl font-bold font-serif text-amber-400 uppercase tracking-widest">Votre capitale est attaquée !</h3>
            <p className="text-stone-300 text-sm">
              Votre cour royale à <strong className="text-stone-100">{gameState.cities[gameState.combat!.defenderCityId].name}</strong> est assiégée. Choisissez immédiatement un bastion de repli dans cette ville.
            </p>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {gameState.cities[gameState.combat!.defenderCityId].bastions
                .filter(b => b.id !== gameState.combat!.defenderBastionId && b.soldiers > 0)
                .map((b, idx) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      sendRelocateCapital(gameState.id, gameState.combat!.defenderCityId, b.id);
                    }}
                    className="w-full p-3 rounded-lg border border-amber-900/30 bg-[#100e0d] hover:bg-stone-900/80 text-left flex justify-between items-center text-stone-200 hover:border-amber-500 transition-all font-mono"
                  >
                    <span>Bastion #{idx + 1}</span>
                    <span className="text-amber-500 font-bold">{b.soldiers} soldats</span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Active Battle Resolution Popup Overlay */}
      {gameState.combat && !gameState.combat.isRelocatingCapital && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[95] flex items-center justify-center p-4">
          <div className="bg-[#161412] border-2 border-amber-900/50 rounded-2xl max-w-xl w-full p-8 shadow-2xl space-y-6 relative overflow-hidden glow-gold">
            
            {/* Header banner */}
            <div className="text-center">
              <span className="text-[10px] tracking-[0.3em] font-mono text-amber-600 block uppercase animate-pulse">RÉSULTAT DU COMBAT</span>
              <h2 className="text-2xl font-black text-stone-200 mt-1 uppercase tracking-wider font-serif">CHOC SIMULTANÉ</h2>
            </div>

            {/* Combatants Showcase */}
            <div className="grid grid-cols-2 gap-4 items-center relative my-8">
              {/* VS Sword circle overlay */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#1c1917] border border-amber-900/40 flex items-center justify-center text-amber-500 z-10 font-serif italic text-xs shadow-md">
                VS
              </div>

              {/* Attacker panel */}
              <div className="p-4 rounded-xl border border-stone-850 bg-[#0d0c0b] text-center flex flex-col items-center">
                <span className="text-[9px] font-mono text-stone-500 uppercase">Province Attaquante</span>
                <span className="font-bold text-stone-300 truncate max-w-full font-serif mt-0.5">
                  {gameState.cities[gameState.combat.attackerCityId]?.name}
                </span>
                
                {/* Initial vs remaining */}
                <div className="mt-4 flex flex-col items-center">
                  <span className="text-stone-500 text-xs line-through">{gameState.combat.attackerInitialSoldiers}</span>
                  <span className="text-2xl font-mono font-black text-stone-100 mt-1">
                    {gameState.combat.attackerRemainingSoldiers}
                  </span>
                  <span className="text-[9px] font-mono text-red-500 mt-1">
                    -{gameState.combat.attackerInitialSoldiers - gameState.combat.attackerRemainingSoldiers}
                  </span>
                </div>
              </div>

              {/* Defender panel */}
              <div className="p-4 rounded-xl border border-stone-850 bg-[#0d0c0b] text-center flex flex-col items-center">
                <span className="text-[9px] font-mono text-stone-500 uppercase">Province Défendue</span>
                <span className="font-bold text-stone-300 truncate max-w-full font-serif mt-0.5">
                  {gameState.cities[gameState.combat.defenderCityId]?.name}
                </span>

                {/* Initial vs remaining */}
                <div className="mt-4 flex flex-col items-center">
                  <span className="text-stone-500 text-xs line-through">{gameState.combat.defenderInitialSoldiers}</span>
                  <span className="text-2xl font-mono font-black text-stone-100 mt-1">
                    {gameState.combat.defenderRemainingSoldiers}
                  </span>
                  <span className="text-[9px] font-mono text-red-500 mt-1">
                    -{gameState.combat.defenderInitialSoldiers - gameState.combat.defenderRemainingSoldiers}
                  </span>
                </div>
              </div>
            </div>

            {/* Micro-Combat Logs */}
            <div className="bg-[#0b0a09] border border-amber-900/10 p-4 rounded-lg space-y-2 text-stone-400 font-mono text-xs max-h-28 overflow-y-auto">
              <p className="text-stone-500 text-center uppercase tracking-wider text-[9px] font-bold border-b border-stone-900 pb-1 mb-2">Chroniques du Choc</p>
              {gameState.combat.rounds.map((round) => (
                <div key={round.round} className="flex justify-between items-center text-[10px]">
                  <span>Pertes Attaquant: <strong className="text-red-400">-{round.attackerLosses}</strong></span>
                  <span>Pertes Défenseur: <strong className="text-red-400">-{round.defenderLosses}</strong></span>
                </div>
              ))}
              
              {gameState.combat.defenderRemainingSoldiers <= 0 && (
                <p className="text-amber-500 font-serif text-center text-xs mt-3 uppercase tracking-widest font-black animate-pulse">
                  Garnison détruite ! La province est tombée !
                </p>
              )}
            </div>

            {/* Clear combat confirmation */}
            <div className="text-center pt-4 border-t border-amber-900/10">
              <button
                onClick={() => sendAction(gameState.id, 'CLEAR_COMBAT')}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-serif font-black py-3 px-8 rounded-lg tracking-widest uppercase transition-all shadow-md active:translate-y-[1px]"
              >
                CONTINUER
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Finished Game / Victory Screen Overlay */}
      {gameState.status === 'FINISHED' && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex flex-col items-center justify-center p-6 text-center select-none bg-grid">
          {/* Compass rose decorative rotating background */}
          <div className="w-80 h-80 border border-amber-500/10 rounded-full absolute pointer-events-none flex items-center justify-center animate-[spin_60s_linear_infinite]">
            <div className="w-[300px] h-[300px] border border-amber-500/5 rounded-full"></div>
          </div>

          <div className="relative space-y-6 max-w-md w-full p-8 border-2 border-amber-500/60 rounded-xl bg-stone-950/90 shadow-[0_0_50px_rgba(217,119,6,0.2)] glow-gold">
            <Crown className="w-20 h-20 text-amber-500 fill-amber-500 mx-auto animate-pulse" />
            
            {gameState.winnerFaction === myFaction ? (
              <div className="space-y-2">
                <span className="text-[10px] tracking-[0.4em] font-mono text-green-500 uppercase block">VOTRE NOM RESTERA GRAVÉ</span>
                <h2 className="text-3xl font-black text-amber-500 font-serif uppercase tracking-wider">VICTOIRE GLORIEUSE</h2>
                <p className="text-stone-400 text-sm mt-4 font-mono leading-relaxed">
                  Toutes les capitales ennemies ont été détruites. Vous régnez désormais sans partage sur la boucle de la Seine.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <span className="text-[10px] tracking-[0.4em] font-mono text-red-500 uppercase block">LA COUR S'EST EFFONDRÉE</span>
                <h2 className="text-3xl font-black text-red-600 font-serif uppercase tracking-wider">DÉFAITE CUISANTE</h2>
                <p className="text-stone-400 text-sm mt-4 font-mono leading-relaxed">
                  Toutes vos capitales ont été rasées par les armées adverses. Votre règne prend fin aujourd'hui.
                </p>
              </div>
            )}

            <div className="pt-6">
              <button
                onClick={quitRoom}
                className="w-full bg-stone-900 hover:bg-stone-850 text-amber-500 border border-amber-500/40 font-serif font-bold py-3.5 px-6 rounded-lg transition-all active:translate-y-[1px]"
              >
                RETOURNER AU LOBBY
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rules navigation Modal */}
      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />
    </div>
  );
}
