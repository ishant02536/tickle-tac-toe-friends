// AI difficulty levels
export type Difficulty = 'easy' | 'medium' | 'hard' | 'adaptive';

// Get AI move based on current board state and difficulty
export const getAIMove = (
  board: (string | null)[][],
  difficulty: Difficulty,
  moveHistory?: Array<{board: (string | null)[][], move: [number, number], player: string}>
): [number, number] => {
  switch (difficulty) {
    case 'easy':
      return getEasyMove(board);
    case 'medium':
      return getMediumMove(board);
    case 'hard':
      return getHardMove(board);
    case 'adaptive':
      return getAdaptiveMove(board, moveHistory || []);
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

// Adaptive: Learn from player's previous moves and counter their patterns
const getAdaptiveMove = (
  board: (string | null)[][],
  moveHistory: Array<{board: (string | null)[][], move: [number, number], player: string}>
): [number, number] => {
  // First, check if we can win
  const winningMove = findWinningMove(board, 'O');
  if (winningMove) {
    return winningMove;
  }
  
  // Then check if we need to block
  const blockingMove = findWinningMove(board, 'X');
  if (blockingMove) {
    return blockingMove;
  }
  
  // Look for patterns in player's move history
  if (moveHistory.length >= 2) {
    // Get only the player's moves
    const playerMoves = moveHistory.filter(item => item.player === 'X');
    
    // Try to find a pattern: if the player tends to play in corners, edges, or center
    const cornerMoves = playerMoves.filter(({move}) => 
      (move[0] === 0 && move[1] === 0) || 
      (move[0] === 0 && move[1] === 2) || 
      (move[0] === 2 && move[1] === 0) || 
      (move[0] === 2 && move[1] === 2)
    ).length;
    
    const edgeMoves = playerMoves.filter(({move}) => 
      (move[0] === 0 && move[1] === 1) || 
      (move[0] === 1 && move[1] === 0) || 
      (move[0] === 1 && move[1] === 2) || 
      (move[0] === 2 && move[1] === 1)
    ).length;
    
    const centerMoves = playerMoves.filter(({move}) => 
      move[0] === 1 && move[1] === 1
    ).length;
    
    // Find their most common move type and counter it
    const movePreferences = [
      { type: 'corner', count: cornerMoves },
      { type: 'edge', count: edgeMoves },
      { type: 'center', count: centerMoves }
    ].sort((a, b) => b.count - a.count);
    
    // If player prefers corners, take center and edges
    if (movePreferences[0].type === 'corner' && movePreferences[0].count > 0) {
      // Take center if available
      if (board[1][1] === null) {
        return [1, 1];
      }
      
      // Otherwise take an edge
      const edges: [number, number][] = [[0, 1], [1, 0], [1, 2], [2, 1]];
      const availableEdges = edges.filter(([r, c]) => board[r][c] === null);
      if (availableEdges.length > 0) {
        return availableEdges[Math.floor(Math.random() * availableEdges.length)];
      }
    }
    
    // If player prefers edges, take center and corners
    if (movePreferences[0].type === 'edge' && movePreferences[0].count > 0) {
      // Take center if available
      if (board[1][1] === null) {
        return [1, 1];
      }
      
      // Otherwise take a corner
      const corners: [number, number][] = [[0, 0], [0, 2], [2, 0], [2, 2]];
      const availableCorners = corners.filter(([r, c]) => board[r][c] === null);
      if (availableCorners.length > 0) {
        return availableCorners[Math.floor(Math.random() * availableCorners.length)];
      }
    }
    
    // If player prefers center, take corners
    if (movePreferences[0].type === 'center' && movePreferences[0].count > 0) {
      const corners: [number, number][] = [[0, 0], [0, 2], [2, 0], [2, 2]];
      const availableCorners = corners.filter(([r, c]) => board[r][c] === null);
      if (availableCorners.length > 0) {
        return availableCorners[Math.floor(Math.random() * availableCorners.length)];
      }
    }
  }
  
  // If we don't have enough data yet or can't find patterns, use hard strategy
  return getHardMove(board);
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
