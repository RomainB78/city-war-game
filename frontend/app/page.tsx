'use client';

import React from 'react';
import { useSocket } from '../hooks/useSocket';
import GameLobby from '../components/GameLobby';
import GameBoard from '../components/GameBoard';

export default function Home() {
  const {
    gameState,
    playerId,
    roomCode,
    error,
    createRoom,
    joinRoom,
    selectFaction,
    startGame,
    sendAction,
    sendRelocateCapital,
    quitRoom,
  } = useSocket();

  // Show lobby if room isn't started or state hasn't loaded 'PLAYING'
  if (!gameState || gameState.status === 'LOBBY') {
    return (
      <GameLobby
        gameState={gameState}
        playerId={playerId}
        roomCode={roomCode}
        createRoom={createRoom}
        joinRoom={joinRoom}
        selectFaction={selectFaction}
        startGame={startGame}
        error={error}
      />
    );
  }

  // Show interactive tactical map board if game is running or finished
  return (
    <GameBoard
      gameState={gameState}
      playerId={playerId || ''}
      sendAction={sendAction}
      sendRelocateCapital={sendRelocateCapital}
      quitRoom={quitRoom}
      error={error}
    />
  );
}
