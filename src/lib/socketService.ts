
import { toast } from "@/components/ui/sonner";

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

interface GameEvent {
  type: string;
  payload?: any;
}

type GameEventCallback = (state: GameState) => void;

class SocketService {
  private callbacks: GameEventCallback[] = [];
  private gameState: GameState;
  private playerId: string;
  private playerSymbol: Player | null = null;

  constructor() {
    // Initial game state
    this.gameState = {
      board: Array(3).fill(null).map(() => Array(3).fill(null)),
      currentPlayer: 'X',
      players: { X: null, O: null },
      status: 'waiting',
      winner: null,
      roomCode: '',
    };
    
    // Generate a unique ID for this player
    this.playerId = this.generatePlayerId();
  }

  private generatePlayerId(): string {
    return Math.random().toString(36).substring(2, 9);
  }

  // In a real app, this would connect to a server
  // For now, we're simulating local multiplayer
  public connect(): void {
    console.log('Socket connected with player ID:', this.playerId);
  }

  private updateGameState(newState: Partial<GameState>): void {
    this.gameState = { ...this.gameState, ...newState };
    this.notifyListeners();
  }

  private notifyListeners(): void {
    this.callbacks.forEach(callback => callback(this.gameState));
  }

  public subscribe(callback: GameEventCallback): () => void {
    this.callbacks.push(callback);
    // Return unsubscribe function
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
    };
  }

  public createRoom(): string {
    const roomCode = this.generateRoomCode();
    this.playerSymbol = 'X';
    
    this.updateGameState({
      roomCode,
      status: 'waiting',
      players: {
        X: this.playerId,
        O: null
      },
      board: Array(3).fill(null).map(() => Array(3).fill(null)),
      currentPlayer: 'X',
      winner: null,
      winningCells: undefined
    });
    
    return roomCode;
  }

  public joinRoom(roomCode: string): boolean {
    // In a real app, this would validate the room on the server
    if (roomCode.length !== 4) {
      toast.error('Invalid room code');
      return false;
    }
    
    // If the room is "full" (both X and O are taken)
    if (this.gameState.players.X && this.gameState.players.O) {
      toast.error('Room is full');
      return false;
    }
    
    // Assign the player to the available symbol
    this.playerSymbol = !this.gameState.players.X ? 'X' : 'O';
    
    const updatedPlayers = { ...this.gameState.players };
    updatedPlayers[this.playerSymbol] = this.playerId;
    
    this.updateGameState({
      roomCode,
      players: updatedPlayers,
      status: updatedPlayers.X && updatedPlayers.O ? 'playing' : 'waiting'
    });
    
    toast.success(`Joined room as Player ${this.playerSymbol}`);
    return true;
  }

  public makeMove(row: number, col: number): boolean {
    // Check if it's not the player's turn
    if (this.gameState.currentPlayer !== this.playerSymbol) {
      toast.error('Not your turn');
      return false;
    }
    
    // Check if the game is not in playing state
    if (this.gameState.status !== 'playing') {
      toast.error('Game not in progress');
      return false;
    }
    
    // Check if the cell is already filled
    if (this.gameState.board[row][col] !== null) {
      toast.error('Cell already filled');
      return false;
    }
    
    // Create a new board with the move
    const newBoard = this.gameState.board.map(row => [...row]);
    newBoard[row][col] = this.playerSymbol;
    
    // Check for a winner
    const { winner, winningCells } = this.checkWinner(newBoard);
    
    // Switch the current player
    const nextPlayer = this.gameState.currentPlayer === 'X' ? 'O' : 'X';
    
    this.updateGameState({
      board: newBoard,
      currentPlayer: nextPlayer,
      winner,
      winningCells,
      status: winner ? 'ended' : 'playing'
    });
    
    return true;
  }

  public restartGame(): void {
    this.updateGameState({
      board: Array(3).fill(null).map(() => Array(3).fill(null)),
      currentPlayer: 'X',
      status: 'playing',
      winner: null,
      winningCells: undefined
    });
    
    toast.success('Game restarted');
  }

  public leaveRoom(): void {
    // In a real app, we would notify the server that the player is leaving
    if (!this.playerSymbol) return;
    
    const updatedPlayers = { ...this.gameState.players };
    updatedPlayers[this.playerSymbol] = null;
    
    this.updateGameState({
      players: updatedPlayers,
      status: 'waiting'
    });
    
    this.playerSymbol = null;
    toast.info('Left the game room');
  }

  private generateRoomCode(): string {
    // Generate a 4-character alphanumeric code
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 4; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  public getCurrentPlayer(): Player | null {
    return this.playerSymbol;
  }

  public getGameState(): GameState {
    return this.gameState;
  }

  private checkWinner(board: GameBoard): { winner: Player | 'draw' | null, winningCells?: [number, number][] } {
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
  }
}

// Singleton instance
export const socketService = new SocketService();
export default socketService;
