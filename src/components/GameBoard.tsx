
import React from 'react';
import { useGame } from '@/context/GameContext';
import { X, Circle } from 'lucide-react';

const GameBoard: React.FC = () => {
  const { gameState, makeMove, isYourTurn } = useGame();
  
  const handleCellClick = (row: number, col: number) => {
    makeMove(row, col);
  };

  // Create a board outline to show the winning line
  const renderWinningLine = () => {
    if (!gameState.winningCells || gameState.winningCells.length !== 3) return null;

    const [[r1, c1], [r2, c2], [r3, c3]] = gameState.winningCells;
    
    // Check if it's a row win
    if (r1 === r2 && r2 === r3) {
      return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
          <line 
            x1="5%" 
            y1={`${(r1 * 100 / 3) + (100 / 6)}%`} 
            x2="95%" 
            y2={`${(r1 * 100 / 3) + (100 / 6)}%`} 
            stroke={gameState.winner === 'X' ? '#3B82F6' : '#10B981'} 
            strokeWidth="3"
            className="winning-line"
          />
        </svg>
      );
    }
    
    // Check if it's a column win
    if (c1 === c2 && c2 === c3) {
      return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
          <line 
            x1={`${(c1 * 100 / 3) + (100 / 6)}%`} 
            y1="5%" 
            x2={`${(c1 * 100 / 3) + (100 / 6)}%`} 
            y2="95%" 
            stroke={gameState.winner === 'X' ? '#3B82F6' : '#10B981'} 
            strokeWidth="3"
            className="winning-line"
          />
        </svg>
      );
    }
    
    // Check if it's a diagonal win (top-left to bottom-right)
    if (r1 === 0 && c1 === 0 && r3 === 2 && c3 === 2) {
      return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
          <line 
            x1="5%" y1="5%" 
            x2="95%" y2="95%" 
            stroke={gameState.winner === 'X' ? '#3B82F6' : '#10B981'} 
            strokeWidth="3"
            className="winning-line"
          />
        </svg>
      );
    }
    
    // Check if it's a diagonal win (top-right to bottom-left)
    if (r1 === 0 && c1 === 2 && r3 === 2 && c3 === 0) {
      return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
          <line 
            x1="95%" y1="5%" 
            x2="5%" y2="95%" 
            stroke={gameState.winner === 'X' ? '#3B82F6' : '#10B981'} 
            strokeWidth="3"
            className="winning-line"
          />
        </svg>
      );
    }
    
    return null;
  };
  
  const renderCell = (row: number, col: number) => {
    const value = gameState.board[row][col];
    const isWinningCell = gameState.winningCells?.some(
      ([r, c]) => r === row && c === col
    );
    
    // Determine if the cell should be interactive
    const isInteractive = 
      gameState.status === 'playing' && 
      value === null && 
      isYourTurn;
    
    return (
      <div 
        key={`${row}-${col}`}
        className={`game-cell-container ${isInteractive ? 'cursor-pointer' : 'cursor-default'} ${
          isWinningCell ? 'bg-secondary/30' : ''
        }`}
        onClick={() => isInteractive && handleCellClick(row, col)}
        style={{ opacity: isInteractive ? 1 : value ? 1 : 0.6 }}
      >
        <div className={`game-cell ${value ? `game-cell-${value.toLowerCase()}` : ''}`}>
          {value === 'X' && <X className="w-12 h-12 stroke-game-x" strokeWidth={2.5} />}
          {value === 'O' && <Circle className="w-10 h-10 stroke-game-o" strokeWidth={2.5} />}
        </div>
      </div>
    );
  };

  return (
    <div className="game-board">
      {gameState.board.map((row, rowIndex) => (
        row.map((_, colIndex) => (
          renderCell(rowIndex, colIndex)
        ))
      ))}
      {renderWinningLine()}
    </div>
  );
};

export default GameBoard;
