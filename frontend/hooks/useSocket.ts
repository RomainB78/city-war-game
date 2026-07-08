import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameState } from 'shared';

const SOCKET_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [roomCode, setRoomCode] = useState<string | null>(null);

  useEffect(() => {
    // Load existing playerId from localStorage
    const savedPlayerId = localStorage.getItem('boucle_player_id');
    const savedRoomCode = localStorage.getItem('boucle_room_code');

    if (savedPlayerId) setPlayerId(savedPlayerId);
    if (savedRoomCode) setRoomCode(savedRoomCode);

    // Initialize socket connection
    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to websocket server');
      // If we had a saved room code, try to rejoin
      if (savedRoomCode && savedPlayerId) {
        socket.emit('join_room', {
          roomCode: savedRoomCode,
          playerName: localStorage.getItem('boucle_player_name') || 'Joueur',
          playerId: savedPlayerId,
        });
      }
    });

    socket.on('room_created', ({ gameId, roomCode, playerId: newPlayerId }) => {
      localStorage.setItem('boucle_player_id', newPlayerId);
      localStorage.setItem('boucle_room_code', roomCode);
      setPlayerId(newPlayerId);
      setRoomCode(roomCode);
    });

    socket.on('room_joined', ({ gameId, roomCode: joinedCode, playerId: newPlayerId }) => {
      localStorage.setItem('boucle_player_id', newPlayerId);
      localStorage.setItem('boucle_room_code', joinedCode);
      setPlayerId(newPlayerId);
      setRoomCode(joinedCode);
    });

    socket.on('state_updated', (state: GameState) => {
      setGameState(state);
      setError(null);
    });

    socket.on('action_error', (msg: string) => {
      setError(msg);
      // Auto-clear error after 4 seconds
      setTimeout(() => setError(null), 4000);
    });

    socket.on('join_error', (msg: string) => {
      setError(msg);
      // Reset saved credentials on failure to join
      localStorage.removeItem('boucle_room_code');
      setRoomCode(null);
    });

    socket.on('error', (msg: any) => {
      setError(String(msg));
      console.error('Socket backend error:', msg);
    });

    socket.on('connect_error', (err: any) => {
      console.error('Socket connection failure:', err);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const createRoom = (playerName: string) => {
    localStorage.setItem('boucle_player_name', playerName);
    socketRef.current?.emit('create_room', { playerName });
  };

  const joinRoom = (roomCode: string, playerName: string) => {
    localStorage.setItem('boucle_player_name', playerName);
    socketRef.current?.emit('join_room', { roomCode, playerName });
  };

  const selectFaction = (gameId: string, faction: 'CHATOU' | 'VILLE_IMPERIALE') => {
    socketRef.current?.emit('select_faction', { gameId, faction });
  };

  const startGame = (gameId: string) => {
    socketRef.current?.emit('start_game', { gameId });
  };

  const sendAction = (gameId: string, actionType: 'EXCHANGE' | 'ATTACK' | 'CLEAR_COMBAT', args?: any) => {
    socketRef.current?.emit('game_action', { gameId, actionType, args });
  };

  const sendRelocateCapital = (gameId: string, cityId: string, newBastionId: string) => {
    socketRef.current?.emit('relocate_capital', {
      gameId,
      args: { cityId, newBastionId },
    });
  };

  const quitRoom = () => {
    localStorage.removeItem('boucle_player_id');
    localStorage.removeItem('boucle_room_code');
    setPlayerId(null);
    setRoomCode(null);
    setGameState(null);
    window.location.reload();
  };

  return {
    socket: socketRef.current,
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
  };
}
