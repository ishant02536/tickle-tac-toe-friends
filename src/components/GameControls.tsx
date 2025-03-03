
import React from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { RefreshCw, LogOut } from 'lucide-react';

const GameControls: React.FC = () => {
  const { gameState, restartGame, leaveRoom, playerSymbol, isYourTurn, waitingForOpponent } = useGame();
  
  const renderStatus = () => {
    if (waitingForOpponent) {
      return (
        <div className="flex flex-col items-center gap-4 animate-pulse-light">
          <div className="chip">Waiting for opponent</div>
          <div className="text-muted-foreground text-sm">
            Share the room code with a friend
          </div>
          <div className="room-code flex items-center justify-center bg-secondary text-secondary-foreground py-3 px-6 rounded-lg font-mono text-xl tracking-wider">
            {gameState.roomCode}
          </div>
        </div>
      );
    }
    
    if (gameState.status === 'ended') {
      if (gameState.winner === 'draw') {
        return <div className="text-xl font-semibold text-center">Game ended in a draw!</div>;
      }
      
      const isWinner = gameState.winner === playerSymbol;
      return (
        <div className="text-xl font-semibold text-center">
          {isWinner 
            ? <span className="text-green-500">You won! 🎉</span> 
            : <span className="text-muted-foreground">You lost. Better luck next time!</span>}
        </div>
      );
    }
    
    if (gameState.status === 'playing') {
      return (
        <div className="flex flex-col items-center gap-3">
          <div className="chip">
            {playerSymbol === 'X' ? 'You are X' : 'You are O'}
          </div>
          <div className={`text-lg font-medium ${isYourTurn ? 'text-primary animate-pulse-light' : 'text-muted-foreground'}`}>
            {isYourTurn ? "Your turn" : "Opponent's turn"}
          </div>
        </div>
      );
    }
    
    return <div>Connecting to game...</div>;
  };
  
  return (
    <div className="flex flex-col items-center justify-center gap-6 w-full max-w-sm">
      {renderStatus()}
      
      <div className="flex gap-3 mt-4">
        {gameState.status === 'ended' && (
          <Button 
            onClick={restartGame}
            className="flex items-center gap-2 px-6"
            variant="outline"
          >
            <RefreshCw className="w-4 h-4" />
            Play Again
          </Button>
        )}
        
        <Button 
          onClick={leaveRoom}
          className="flex items-center gap-2"
          variant="ghost"
        >
          <LogOut className="w-4 h-4" />
          Leave Game
        </Button>
      </div>
    </div>
  );
};

export default GameControls;
