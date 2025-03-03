// AI difficulty levels
export type Difficulty = 'easy' | 'medium' | 'hard';

// Get AI move based on current board state and difficulty
export const getAIMove = (
  board: (string | null)[][],
  difficulty: Difficulty
): [number, number] => {
  switch (difficulty) {
    case 'easy':
      return getEasyMove(board);
    case 'medium':
      return getMediumMove(board);
    case 'hard':
      return getHardMove(board);
    default:
      return getEasyMove(board);
  }
};

// Easy: Just random moves
const getEasyMove = (board: (string | null)[][]): [number, number] => {
  const availableMoves = getAvailableMoves(board);
  const randomIndex = Math.floor(Math.random() * availableMoves.length);
  return availableMoves[randomIndex];
};

// Medium: 50% chance to block or win, otherwise random
const getMediumMove = (board: (string | null)[][]): [number, number] => {
  // Try to find winning move
  const winningMove = findWinningMove(board, 'O');
  if (winningMove && Math.random() > 0.5) {
    return winningMove;
  }
  
  // Try to block opponent's winning move
  const blockingMove = findWinningMove(board, 'X');
  if (blockingMove && Math.random() > 0.5) {
    return blockingMove;
  }
  
  // Otherwise make a random move
  return getEasyMove(board);
};

// Hard: Always try to win, block, or make the best move
const getHardMove = (board: (string | null)[][]): [number, number] => {
  // Try to find winning move
  const winningMove = findWinningMove(board, 'O');
  if (winningMove) {
    return winningMove;
  }
  
  // Try to block opponent's winning move
  const blockingMove = findWinningMove(board, 'X');
  if (blockingMove) {
    return blockingMove;
  }
  
  // Take center if available
  if (board[1][1] === null) {
    return [1, 1];
  }
  
  // Take corners if available
  const corners: [number, number][] = [[0, 0], [0, 2], [2, 0], [2, 2]];
  const availableCorners = corners.filter(([r, c]) => board[r][c] === null);
  if (availableCorners.length > 0) {
    return availableCorners[Math.floor(Math.random() * availableCorners.length)];
  }
  
  // Otherwise take any available move
  return getEasyMove(board);
};

// Helper: Get all available moves on the board
const getAvailableMoves = (board: (string | null)[][]): [number, number][] => {
  const moves: [number, number][] = [];
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[r].length; c++) {
      if (board[r][c] === null) {
        moves.push([r, c]);
      }
    }
  }
  return moves;
};

// Helper: Find a winning move for the given player
const findWinningMove = (
  board: (string | null)[][],
  player: string
): [number, number] | null => {
  // Check each empty cell to see if it would result in a win
  const availableMoves = getAvailableMoves(board);
  
  for (const [r, c] of availableMoves) {
    // Make a copy of the board with the potential move
    const boardCopy = board.map(row => [...row]);
    boardCopy[r][c] = player;
    
    // Check if this move would win
    if (checkWin(boardCopy, player)) {
      return [r, c];
    }
  }
  
  return null;
};

// Helper: Check if the given player has won
const checkWin = (board: (string | null)[][], player: string): boolean => {
  // Check rows
  for (let i = 0; i < 3; i++) {
    if (board[i][0] === player && board[i][1] === player && board[i][2] === player) {
      return true;
    }
  }
  
  // Check columns
  for (let j = 0; j < 3; j++) {
    if (board[0][j] === player && board[1][j] === player && board[2][j] === player) {
      return true;
    }
  }
  
  // Check diagonals
  if (board[0][0] === player && board[1][1] === player && board[2][2] === player) {
    return true;
  }
  
  if (board[0][2] === player && board[1][1] === player && board[2][0] === player) {
    return true;
  }
  
  return false;
};
