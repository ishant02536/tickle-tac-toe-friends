
import React from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { RefreshCw, LogOut, Bot, User, Brain } from 'lucide-react';

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
          <div className="flex items-center gap-2">
            <div className="chip">
              {playerSymbol === 'X' ? 'You are X' : 'You are O'}
            </div>
            {gameState.gameMode === 'ai' && (
              <div className={`chip ${gameState.aiDifficulty === 'adaptive' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                {gameState.aiDifficulty === 'adaptive' ? (
                  <>
                    <Brain className="w-3 h-3 mr-1" />
                    AI: Adaptive
                  </>
                ) : (
                  <>
                    <Bot className="w-3 h-3 mr-1" />
                    AI: {gameState.aiDifficulty}
                  </>
                )}
              </div>
            )}
          </div>
          <div className={`text-lg font-medium ${isYourTurn ? 'text-primary animate-pulse-light' : 'text-muted-foreground'}`}>
            {isYourTurn ? "Your turn" : 
              gameState.gameMode === 'ai' ? "AI is thinking..." : "Opponent's turn"}
          </div>
          {gameState.aiDifficulty === 'adaptive' && gameState.moveHistory.length > 0 && (
            <div className="text-xs text-purple-600 mt-1">
              AI has learned from {Math.floor(gameState.moveHistory.length / 2)} of your moves
            </div>
          )}
        </div>
      );
    }
    
    return <div>Connecting to game...</div>;
  };
  
  const renderPlayers = () => {
    if (gameState.gameMode === 'multiplayer' && gameState.status === 'playing') {
      return (
        <div className="flex justify-center gap-8 mb-4 text-sm">
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" /> 
            <span>Player X</span>
          </div>
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" /> 
            <span>Player O</span>
          </div>
        </div>
      );
    } else if (gameState.gameMode === 'ai' && gameState.status === 'playing') {
      return (
        <div className="flex justify-center gap-8 mb-4 text-sm">
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" /> 
            <span>You (X)</span>
          </div>
          <div className="flex items-center gap-1">
            <Bot className="w-3 h-3" /> 
            <span>AI (O)</span>
          </div>
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <div className="flex flex-col items-center justify-center gap-6 w-full max-w-sm">
      {renderPlayers()}
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
