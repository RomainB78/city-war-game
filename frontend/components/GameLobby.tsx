import React, { useState } from 'react';
import { Faction, GameState } from 'shared';
import { Shield, Swords, User, Users, Copy, Check } from 'lucide-react';

interface GameLobbyProps {
  gameState: GameState | null;
  playerId: string | null;
  roomCode: string | null;
  createRoom: (name: string) => void;
  joinRoom: (code: string, name: string) => void;
  selectFaction: (gameId: string, faction: Faction) => void;
  startGame: (gameId: string) => void;
  error: string | null;
}

export default function GameLobby({
  gameState,
  playerId,
  roomCode,
  createRoom,
  joinRoom,
  selectFaction,
  startGame,
  error
}: GameLobbyProps) {
  const [name, setName] = useState('');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [copied, setCopied] = useState(false);

  const activePlayer = gameState?.players.find(p => p.id === playerId);
  const otherPlayer = gameState?.players.find(p => p.id !== playerId);

  const copyRoomCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSelectFaction = (faction: Faction) => {
    if (gameState && activePlayer) {
      selectFaction(gameState.id, faction);
    }
  };

  const handleStartGame = () => {
    if (gameState) {
      startGame(gameState.id);
    }
  };

  // 1. Enter Name & Choose Room
  if (!roomCode) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#090807] bg-grid relative overflow-hidden">
        {/* Decorative Compass Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-amber-900/10 rounded-full pointer-events-none flex items-center justify-center animate-[spin_120s_linear_infinite]">
          <div className="w-[780px] h-[780px] border border-amber-900/5 rounded-full flex items-center justify-center">
            <div className="w-[600px] h-[600px] border-2 border-dashed border-amber-900/5 rounded-full"></div>
          </div>
        </div>

        <div className="max-w-md w-full bg-[#161412]/95 border-2 border-amber-800/30 p-8 rounded-xl shadow-2xl relative z-10 glow-gold">
          {/* Logo / Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold tracking-widest text-amber-500 font-serif mb-1">CHRONIQUES DE LA BOUCLE</h1>
            <p className="text-xs uppercase tracking-wider text-stone-500 font-mono">Territoires et Conquêtes</p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-950/40 border border-red-800/40 text-red-300 rounded text-sm text-center">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Player Name Input */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-stone-400 font-mono block">Votre Nom de Seigneur</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-amber-700 pointer-events-none">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  maxLength={15}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Dagobert, Richard..."
                  className="w-full bg-[#0d0c0b] border border-amber-900/40 rounded-lg py-2.5 pl-10 pr-4 text-stone-200 placeholder-stone-700 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-serif"
                />
              </div>
            </div>

            <div className="border-t border-amber-950/20 my-4"></div>

            {/* Create Room Button */}
            <button
              onClick={() => name.trim() && createRoom(name.trim())}
              disabled={!name.trim()}
              className="w-full bg-gradient-to-r from-amber-800 to-amber-700 hover:from-amber-700 hover:to-amber-600 disabled:from-stone-900 disabled:to-stone-900 disabled:text-stone-600 disabled:border-stone-800/50 text-stone-900 font-serif font-bold py-3 px-4 rounded-lg border border-amber-600/30 transition-all shadow-lg active:translate-y-[1px]"
            >
              FONDEZ UN NOUVEAU ROYAUME
            </button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-amber-950/30"></div>
              <span className="flex-shrink mx-4 text-xs font-mono text-stone-600">OU REJOINDRE</span>
              <div className="flex-grow border-t border-amber-950/30"></div>
            </div>

            {/* Join Room Controls */}
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={5}
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                placeholder="CODE"
                className="w-24 text-center bg-[#0d0c0b] border border-amber-900/40 rounded-lg py-2.5 text-stone-200 focus:outline-none focus:border-amber-500 font-mono tracking-widest text-lg"
              />
              <button
                onClick={() => name.trim() && joinCodeInput.trim() && joinRoom(joinCodeInput.trim(), name.trim())}
                disabled={!name.trim() || joinCodeInput.length < 5}
                className="flex-1 bg-stone-900 hover:bg-stone-850 disabled:bg-stone-950 border border-amber-900/30 text-amber-500 disabled:text-stone-700 disabled:border-stone-900 font-serif font-bold py-2.5 px-4 rounded-lg transition-all"
              >
                REJOINDRE
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Faction Selection & Waiting inside the Lobby
  const isP1 = gameState?.players[0]?.id === playerId;
  const canStart = gameState?.players.length === 2 && 
                   gameState.players[0].faction && 
                   gameState.players[1].faction;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#090807] bg-grid relative overflow-hidden">
      {/* Decorative Compass */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-amber-900/10 rounded-full pointer-events-none flex items-center justify-center animate-[spin_120s_linear_infinite]">
        <div className="w-[780px] h-[780px] border border-amber-900/5 rounded-full flex items-center justify-center"></div>
      </div>

      <div className="max-w-2xl w-full bg-[#161412]/95 border-2 border-amber-800/30 p-8 rounded-xl shadow-2xl relative z-10 glow-gold">
        {/* Lobby Top Banner */}
        <div className="flex justify-between items-center mb-8 border-b border-amber-900/20 pb-4">
          <div>
            <span className="text-xs font-mono text-stone-500 uppercase tracking-wider">Salle de Rassemblement</span>
            <h2 className="text-2xl font-bold font-serif text-stone-200">SEIGNEURS EN PRÉSENCE</h2>
          </div>
          
          {/* Room Code Display */}
          <div className="bg-[#0c0a09] border border-amber-900/30 px-4 py-2 rounded-lg flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] font-mono text-stone-500 uppercase block tracking-wider">Code de la salle</span>
              <span className="text-lg font-mono text-amber-500 font-bold tracking-wider">{roomCode}</span>
            </div>
            <button 
              onClick={copyRoomCode} 
              className="p-1.5 hover:bg-stone-800 rounded transition-colors text-amber-700 hover:text-amber-500"
              title="Copier le code"
            >
              {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-950/40 border border-red-800/40 text-red-300 rounded text-sm text-center">
            {error}
          </div>
        )}

        {/* Players List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-[#0e0c0b] border border-amber-900/10 p-4 rounded-lg flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-900/20 flex items-center justify-center text-amber-500 border border-amber-800/30">
              <Users size={16} />
            </div>
            <div>
              <span className="text-[10px] font-mono text-stone-500 block uppercase">Hôte (Seigneur 1)</span>
              <span className="font-semibold text-stone-200 font-serif">
                {gameState?.players[0]?.name || 'Attente...'}
              </span>
              {gameState?.players[0]?.faction && (
                <span className={`text-[10px] uppercase font-mono ml-2 font-bold px-1.5 py-0.5 rounded ${
                  gameState.players[0].faction === 'CHATOU' 
                    ? 'bg-blue-950/50 text-blue-400 border border-blue-800/30' 
                    : 'bg-red-950/50 text-red-400 border border-red-800/30'
                }`}>
                  {gameState.players[0].faction === 'CHATOU' ? 'Chatou' : 'Impérial'}
                </span>
              )}
            </div>
          </div>

          <div className="bg-[#0e0c0b] border border-amber-900/10 p-4 rounded-lg flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-900/20 flex items-center justify-center text-amber-500 border border-amber-800/30">
              <Users size={16} />
            </div>
            <div>
              <span className="text-[10px] font-mono text-stone-500 block uppercase">Adversaire (Seigneur 2)</span>
              <span className="font-semibold text-stone-200 font-serif">
                {gameState?.players[1]?.name || 'En attente de connexion...'}
              </span>
              {gameState?.players[1]?.faction && (
                <span className={`text-[10px] uppercase font-mono ml-2 font-bold px-1.5 py-0.5 rounded ${
                  gameState.players[1].faction === 'CHATOU' 
                    ? 'bg-blue-950/50 text-blue-400 border border-blue-800/30' 
                    : 'bg-red-950/50 text-red-400 border border-red-800/30'
                }`}>
                  {gameState.players[1].faction === 'CHATOU' ? 'Chatou' : 'Impérial'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Faction Selector */}
        <div className="space-y-4 mb-8">
          <h3 className="text-sm font-bold font-serif uppercase tracking-widest text-amber-500 text-center mb-4">
            CHOISISSEZ VOTRE ALLÉGEANCE
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Chatou Button */}
            <button
              onClick={() => handleSelectFaction('CHATOU')}
              disabled={otherPlayer?.faction === 'CHATOU'}
              className={`p-6 rounded-xl border-2 transition-all flex flex-col items-center justify-center text-center relative overflow-hidden group ${
                activePlayer?.faction === 'CHATOU'
                  ? 'bg-blue-950/30 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                  : otherPlayer?.faction === 'CHATOU'
                  ? 'bg-stone-950/40 border-stone-900 text-stone-600 cursor-not-allowed opacity-50'
                  : 'bg-stone-900/50 border-amber-900/20 hover:border-blue-700/50'
              }`}
            >
              <Swords className={`w-12 h-12 mb-3 ${
                activePlayer?.faction === 'CHATOU' 
                  ? 'text-blue-400' 
                  : otherPlayer?.faction === 'CHATOU' 
                  ? 'text-stone-700' 
                  : 'text-blue-900 group-hover:text-blue-500 transition-colors'
              }`} />
              <span className="font-serif text-lg font-bold block text-stone-100 mb-1">CHATOU (BLEU)</span>
              <span className="text-[10px] font-mono text-stone-400">9 villes, 53 bastions concentrés</span>
              
              {otherPlayer?.faction === 'CHATOU' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[1px]">
                  <span className="text-xs uppercase tracking-wider text-stone-500 font-mono font-bold">Déjà Réclamée</span>
                </div>
              )}
            </button>

            {/* Saint Germain Button */}
            <button
              onClick={() => handleSelectFaction('VILLE_IMPERIALE')}
              disabled={otherPlayer?.faction === 'VILLE_IMPERIALE'}
              className={`p-6 rounded-xl border-2 transition-all flex flex-col items-center justify-center text-center relative overflow-hidden group ${
                activePlayer?.faction === 'VILLE_IMPERIALE'
                  ? 'bg-red-950/30 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                  : otherPlayer?.faction === 'VILLE_IMPERIALE'
                  ? 'bg-stone-950/40 border-stone-900 text-stone-600 cursor-not-allowed opacity-50'
                  : 'bg-stone-900/50 border-amber-900/20 hover:border-red-700/50'
              }`}
            >
              <Shield className={`w-12 h-12 mb-3 ${
                activePlayer?.faction === 'VILLE_IMPERIALE' 
                  ? 'text-red-400' 
                  : otherPlayer?.faction === 'VILLE_IMPERIALE' 
                  ? 'text-stone-700' 
                  : 'text-red-900 group-hover:text-red-500 transition-colors'
              }`} />
              <span className="font-serif text-lg font-bold block text-stone-100 mb-1">IMPÉRIAL (ROUGE)</span>
              <span className="text-[10px] font-mono text-stone-400">10 villes, 96 bastions dispersés</span>
              
              {otherPlayer?.faction === 'VILLE_IMPERIALE' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[1px]">
                  <span className="text-xs uppercase tracking-wider text-stone-500 font-mono font-bold">Déjà Réclamée</span>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Start Game Action */}
        <div className="mt-8 border-t border-amber-900/20 pt-6 text-center">
          {canStart ? (
            isP1 ? (
              <button
                onClick={handleStartGame}
                className="w-full max-w-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-serif font-black text-xl py-3.5 px-8 rounded-lg transition-all shadow-[0_0_20px_rgba(217,119,6,0.3)] hover:shadow-[0_0_25px_rgba(217,119,6,0.5)] tracking-widest active:translate-y-[1px] glow-gold uppercase"
              >
                DÉCLARER LA GUERRE
              </button>
            ) : (
              <div className="text-sm font-serif text-amber-500 animate-pulse">
                Le Seigneur Hôte s'apprête à lancer les hostilités...
              </div>
            )
          ) : (
            <div className="text-sm font-mono text-stone-500">
              {gameState?.players.length === 2
                ? 'Les deux Seigneurs doivent choisir leur faction.'
                : 'En attente de connexion du second Seigneur...'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
