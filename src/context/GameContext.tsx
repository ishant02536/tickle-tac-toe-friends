
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import socketService from '@/lib/socketService';
import { toast } from 'sonner';
import { getAIMove, Difficulty } from '@/lib/aiLogic';

type Player = 'X' | 'O';
type Cell = Player | null;
type GameBoard = Cell[][];
type GameStatus = 'waiting' | 'playing' | 'ended';
type GameMode = 'multiplayer' | 'ai';

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
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [playerSymbol, setPlayerSymbol] = useState<Player | null>(null);
  
  // Function to check for a winner
  const checkWinner = useCallback((board: GameBoard): { winner: Player | 'draw' | null, winningCells?: [number, number][] } => {
    // Check rows
    for (let i = 0; i < 3; i++) {
      if (board[i][0] && board[i][0] === board[i][1] && board[i][0] === board[i][2]) {
        return { 
          winner: board[i][0] as Player, 
          winningCells: [[i, 0], [i, 1], [i, 2]] 
        };
      }
    }
    
    // Check columns
    for (let j = 0; j < 3; j++) {
      if (board[0][j] && board[0][j] === board[1][j] && board[0][j] === board[2][j]) {
        return { 
          winner: board[0][j] as Player, 
          winningCells: [[0, j], [1, j], [2, j]] 
        };
      }
    }
    
    // Check diagonals
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
    
    // Check for a draw (all cells filled)
    const isBoardFull = board.every(row => row.every(cell => cell !== null));
    if (isBoardFull) {
      return { winner: 'draw' };
    }
    
    // No winner yet
    return { winner: null };
  }, []);
  
  // AI move logic
  useEffect(() => {
    if (
      gameState.gameMode === 'ai' && 
      gameState.status === 'playing' && 
      gameState.currentPlayer === 'O' &&
      gameState.aiDifficulty
    ) {
      // Add a small delay to make the AI move feel more natural
      const timer = setTimeout(() => {
        const [row, col] = getAIMove(gameState.board, gameState.aiDifficulty as Difficulty);
        
        // Update the board with AI's move
        const newBoard = gameState.board.map(row => [...row]);
        newBoard[row][col] = 'O';
        
        // Check for winner after AI move
        const { winner, winningCells } = checkWinner(newBoard);
        
        setGameState(prev => ({
          ...prev,
          board: newBoard,
          currentPlayer: 'X',
          winner,
          winningCells,
          status: winner ? 'ended' : 'playing'
        }));
      }, 700); // 700ms delay
      
      return () => clearTimeout(timer);
    }
  }, [gameState, checkWinner]);
  
  useEffect(() => {
    // Connect to socket service for multiplayer
    socketService.connect();
    
    // Subscribe to game state updates from socket service
    const unsubscribe = socketService.subscribe((state) => {
      // Only update if in multiplayer mode
      if (gameState.gameMode === 'multiplayer') {
        setGameState(prev => ({
          ...state,
          gameMode: prev.gameMode,
          aiDifficulty: prev.aiDifficulty
        }));
      }
    });
    
    // Set initial player symbol for multiplayer
    if (gameState.gameMode === 'multiplayer') {
      setPlayerSymbol(socketService.getCurrentPlayer());
    }
    
    return () => {
      unsubscribe();
    };
  }, [gameState.gameMode]);
  
  // Update player symbol when it changes in the socket service
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
    // Setup a game against AI
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
      aiDifficulty: difficulty
    });
    
    setPlayerSymbol('X');
    toast.success(`Started new game against ${difficulty} AI`);
  };
  
  const makeMove = (row: number, col: number): boolean => {
    if (gameState.gameMode === 'multiplayer') {
      return socketService.makeMove(row, col);
    } else {
      // Handle move in AI mode locally
      if (
        gameState.status !== 'playing' || 
        gameState.currentPlayer !== playerSymbol ||
        gameState.board[row][col] !== null
      ) {
        return false;
      }
      
      // Update the board with player's move
      const newBoard = gameState.board.map(r => [...r]);
      newBoard[row][col] = playerSymbol as Player;
      
      // Check for winner after player move
      const { winner, winningCells } = checkWinner(newBoard);
      
      setGameState(prev => ({
        ...prev,
        board: newBoard,
        currentPlayer: 'O',
        winner,
        winningCells,
        status: winner ? 'ended' : 'playing'
      }));
      
      return true;
    }
  };
  
  const restartGame = (): void => {
    if (gameState.gameMode === 'multiplayer') {
      socketService.restartGame();
    } else {
      // Restart AI game locally
      setGameState(prev => ({
        ...prev,
        board: Array(3).fill(null).map(() => Array(3).fill(null)),
        currentPlayer: 'X',
        status: 'playing',
        winner: null,
        winningCells: undefined
      }));
      toast.success('Game restarted');
    }
  };
  
  const leaveRoom = (): void => {
    if (gameState.gameMode === 'multiplayer') {
      socketService.leaveRoom();
    }
    
    // Reset game state
    setGameState(initialGameState);
    setPlayerSymbol(null);
    toast.info('Left the game');
  };
  
  // Calculate if it's the current player's turn
  const isYourTurn = playerSymbol !== null && gameState.currentPlayer === playerSymbol;
  
  // Calculate if we're waiting for an opponent to join
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
