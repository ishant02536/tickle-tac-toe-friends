import React, { createContext, useContext, useEffect, useState } from 'react';
import socketService from '@/lib/socketService';
import { toast } from 'sonner';

type Player = 'X' | 'O';
type Cell = Player | null;
type GameBoard = Cell[][];
type GameStatus = 'waiting' | 'playing' | 'ended';

interface GameState {
  board: GameBoard;
  currentPlayer: Player;
  players: {
    X: string | null;
    O: string | null;
  };
  status: GameStatus;
  winner: Player | 'draw' | null;
  winningCells?: [number, number][];
  roomCode: string;
}

interface GameContextType {
  gameState: GameState;
  playerSymbol: Player | null;
  createRoom: () => string;
  joinRoom: (roomCode: string) => boolean;
  makeMove: (row: number, col: number) => boolean;
  restartGame: () => void;
  leaveRoom: () => void;
  isYourTurn: boolean;
  waitingForOpponent: boolean;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>({
    board: Array(3).fill(null).map(() => Array(3).fill(null)),
    currentPlayer: 'X',
    players: { X: null, O: null },
    status: 'waiting',
    winner: null,
    roomCode: '',
  });
  
  const [playerSymbol, setPlayerSymbol] = useState<Player | null>(null);
  
  useEffect(() => {
    // Connect to socket service
    socketService.connect();
    
    // Subscribe to game state updates
    const unsubscribe = socketService.subscribe((state) => {
      setGameState(state);
    });
    
    // Set initial player symbol
    setPlayerSymbol(socketService.getCurrentPlayer());
    
    return () => {
      unsubscribe();
    };
  }, []);
  
  // Update player symbol when it changes in the socket service
  useEffect(() => {
    setPlayerSymbol(socketService.getCurrentPlayer());
  }, [gameState.players]);
  
  const createRoom = (): string => {
    const roomCode = socketService.createRoom();
    setPlayerSymbol(socketService.getCurrentPlayer());
    toast.success(`Room created! Code: ${roomCode}`);
    return roomCode;
  };
  
  const joinRoom = (roomCode: string): boolean => {
    const joined = socketService.joinRoom(roomCode);
    if (joined) {
      setPlayerSymbol(socketService.getCurrentPlayer());
    }
    return joined;
  };
  
  const makeMove = (row: number, col: number): boolean => {
    return socketService.makeMove(row, col);
  };
  
  const restartGame = (): void => {
    socketService.restartGame();
  };
  
  const leaveRoom = (): void => {
    socketService.leaveRoom();
    setPlayerSymbol(null);
  };
  
  // Calculate if it's the current player's turn
  const isYourTurn = playerSymbol !== null && gameState.currentPlayer === playerSymbol;
  
  // Calculate if we're waiting for an opponent to join
  const waitingForOpponent = 
    gameState.status === 'waiting' && 
    ((playerSymbol === 'X' && !gameState.players.O) || 
    (playerSymbol === 'O' && !gameState.players.X));
  
  return (
    <GameContext.Provider value={{
      gameState,
      playerSymbol,
      createRoom,
      joinRoom,
      makeMove,
      restartGame,
      leaveRoom,
      isYourTurn,
      waitingForOpponent
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
