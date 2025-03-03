import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import socketService from '@/lib/socketService';
import { toast } from 'sonner';
import { getAIMove, Difficulty } from '@/lib/aiLogic';

type Player = 'X' | 'O';
type Cell = Player | null;
type GameBoard = Cell[][];
type GameStatus = 'waiting' | 'playing' | 'ended';
type GameMode = 'multiplayer' | 'ai';

interface MoveHistoryItem {
  board: GameBoard;
  move: [number, number];
  player: string;
}

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
  gameMode: GameMode;
  aiDifficulty?: Difficulty;
  moveHistory: MoveHistoryItem[];
}

interface GameContextType {
  gameState: GameState;
  playerSymbol: Player | null;
  createRoom: () => string;
  joinRoom: (roomCode: string) => boolean;
  startAIGame: (difficulty: Difficulty) => void;
  makeMove: (row: number, col: number) => boolean;
  restartGame: () => void;
  leaveRoom: () => void;
  isYourTurn: boolean;
  waitingForOpponent: boolean;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const initialGameState: GameState = {
  board: Array(3).fill(null).map(() => Array(3).fill(null)),
  currentPlayer: 'X',
  players: { X: null, O: null },
  status: 'waiting',
  winner: null,
  roomCode: '',
  gameMode: 'multiplayer',
  moveHistory: []
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [playerSymbol, setPlayerSymbol] = useState<Player | null>(null);
  
  const checkWinner = useCallback((board: GameBoard): { winner: Player | 'draw' | null, winningCells?: [number, number][] } => {
    for (let i = 0; i < 3; i++) {
      if (board[i][0] && board[i][0] === board[i][1] && board[i][0] === board[i][2]) {
        return { 
          winner: board[i][0] as Player, 
          winningCells: [[i, 0], [i, 1], [i, 2]] 
        };
      }
    }
    
    for (let j = 0; j < 3; j++) {
      if (board[0][j] && board[0][j] === board[1][j] && board[0][j] === board[2][j]) {
        return { 
          winner: board[0][j] as Player, 
          winningCells: [[0, j], [1, j], [2, j]] 
        };
      }
    }
    
    if (board[0][0] && board[0][0] === board[1][1] && board[0][0] === board[2][2]) {
      return { 
        winner: board[0][0] as Player, 
        winningCells: [[0, 0], [1, 1], [2, 2]] 
      };
    }
    
    if (board[0][2] && board[0][2] === board[1][1] && board[0][2] === board[2][0]) {
      return { 
        winner: board[0][2] as Player, 
        winningCells: [[0, 2], [1, 1], [2, 0]] 
      };
    }
    
    const isBoardFull = board.every(row => row.every(cell => cell !== null));
    if (isBoardFull) {
      return { winner: 'draw' };
    }
    
    return { winner: null };
  }, []);
  
  useEffect(() => {
    if (
      gameState.gameMode === 'ai' && 
      gameState.status === 'playing' && 
      gameState.currentPlayer === 'O' &&
      gameState.aiDifficulty
    ) {
      const timer = setTimeout(() => {
        const [row, col] = getAIMove(
          gameState.board, 
          gameState.aiDifficulty as Difficulty,
          gameState.aiDifficulty === 'adaptive' ? gameState.moveHistory : undefined
        );
        
        const newBoard = gameState.board.map(row => [...row]);
        newBoard[row][col] = 'O';
        
        const newMoveHistory = [...gameState.moveHistory];
        newMoveHistory.push({
          board: gameState.board.map(row => [...row]),
          move: [row, col],
          player: 'O'
        });
        
        const { winner, winningCells } = checkWinner(newBoard);
        
        setGameState(prev => ({
          ...prev,
          board: newBoard,
          currentPlayer: 'X',
          winner,
          winningCells,
          status: winner ? 'ended' : 'playing',
          moveHistory: newMoveHistory
        }));
      }, 700);
      
      return () => clearTimeout(timer);
    }
  }, [gameState, checkWinner]);
  
  useEffect(() => {
    socketService.connect();
    
    const unsubscribe = socketService.subscribe((state) => {
      if (gameState.gameMode === 'multiplayer') {
        setGameState(prev => ({
          ...state,
          gameMode: prev.gameMode,
          aiDifficulty: prev.aiDifficulty
        }));
      }
    });
    
    if (gameState.gameMode === 'multiplayer') {
      setPlayerSymbol(socketService.getCurrentPlayer());
    }
    
    return () => {
      unsubscribe();
    };
  }, [gameState.gameMode]);
  
  useEffect(() => {
    if (gameState.gameMode === 'multiplayer') {
      setPlayerSymbol(socketService.getCurrentPlayer());
    }
  }, [gameState.players, gameState.gameMode]);
  
  const createRoom = (): string => {
    const roomCode = socketService.createRoom();
    setGameState(prev => ({
      ...prev,
      gameMode: 'multiplayer',
      aiDifficulty: undefined
    }));
    setPlayerSymbol(socketService.getCurrentPlayer());
    toast.success(`Room created! Code: ${roomCode}`);
    return roomCode;
  };
  
  const joinRoom = (roomCode: string): boolean => {
    const joined = socketService.joinRoom(roomCode);
    if (joined) {
      setGameState(prev => ({
        ...prev,
        gameMode: 'multiplayer',
        aiDifficulty: undefined
      }));
      setPlayerSymbol(socketService.getCurrentPlayer());
    }
    return joined;
  };
  
  const startAIGame = (difficulty: Difficulty) => {
    setGameState({
      board: Array(3).fill(null).map(() => Array(3).fill(null)),
      currentPlayer: 'X',
      players: { 
        X: 'player', 
        O: `AI (${difficulty})` 
      },
      status: 'playing',
      winner: null,
      roomCode: 'AI-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
      gameMode: 'ai',
      aiDifficulty: difficulty,
      moveHistory: []
    });
    
    setPlayerSymbol('X');
    toast.success(`Started new game against ${difficulty} AI`);
  };
  
  const makeMove = (row: number, col: number): boolean => {
    if (gameState.gameMode === 'multiplayer') {
      return socketService.makeMove(row, col);
    } else {
      if (
        gameState.status !== 'playing' || 
        gameState.currentPlayer !== playerSymbol ||
        gameState.board[row][col] !== null
      ) {
        return false;
      }
      
      const newBoard = gameState.board.map(r => [...r]);
      newBoard[row][col] = playerSymbol as Player;
      
      const newMoveHistory = [...gameState.moveHistory];
      newMoveHistory.push({
        board: gameState.board.map(row => [...row]),
        move: [row, col],
        player: playerSymbol as Player
      });
      
      const { winner, winningCells } = checkWinner(newBoard);
      
      setGameState(prev => ({
        ...prev,
        board: newBoard,
        currentPlayer: 'O',
        winner,
        winningCells,
        status: winner ? 'ended' : 'playing',
        moveHistory: newMoveHistory
      }));
      
      return true;
    }
  };
  
  const restartGame = (): void => {
    if (gameState.gameMode === 'multiplayer') {
      socketService.restartGame();
    } else {
      const moveHistory = gameState.aiDifficulty === 'adaptive' ? gameState.moveHistory : [];
      
      setGameState(prev => ({
        ...prev,
        board: Array(3).fill(null).map(() => Array(3).fill(null)),
        currentPlayer: 'X',
        status: 'playing',
        winner: null,
        winningCells: undefined,
        moveHistory
      }));
      toast.success('Game restarted');
    }
  };
  
  const leaveRoom = (): void => {
    if (gameState.gameMode === 'multiplayer') {
      socketService.leaveRoom();
    }
    
    setGameState(initialGameState);
    setPlayerSymbol(null);
    toast.info('Left the game');
  };
  
  const isYourTurn = playerSymbol !== null && gameState.currentPlayer === playerSymbol;
  
  const waitingForOpponent = 
    gameState.gameMode === 'multiplayer' && 
    gameState.status === 'waiting' && 
    ((playerSymbol === 'X' && !gameState.players.O) || 
    (playerSymbol === 'O' && !gameState.players.X));
  
  return (
    <GameContext.Provider value={{
      gameState,
      playerSymbol,
      createRoom,
      joinRoom,
      startAIGame,
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
