
import React from 'react';
import RoomJoin from '@/components/RoomJoin';
import GameBoard from '@/components/GameBoard';
import GameControls from '@/components/GameControls';
import { GameProvider, useGame } from '@/context/GameContext';

// Game UI that's shown when a player is in a room
const GameUI: React.FC = () => {
  const { gameState } = useGame();
  
  // Only show the game board and controls when there's a valid room code
  if (!gameState.roomCode) {
    return <RoomJoin />;
  }
  
  return (
    <div className="glass-panel p-8 animate-fade-in max-w-md w-full">
      <GameBoard />
      <div className="mt-8">
        <GameControls />
      </div>
    </div>
  );
};

const Index = () => {
  return (
    <GameProvider>
      <div className="min-h-screen w-full flex items-center justify-center p-6 bg-gradient-to-b from-white to-gray-50">
        <div className="page-transition-container">
          <div className="relative w-full max-w-md">
            <div className="absolute -z-10 inset-0 bg-gradient-to-r from-blue-50 to-green-50 rounded-[40px] blur-3xl opacity-50 animate-float"></div>
            <GameUI />
          </div>
          <div className="mt-8 text-center text-xs text-muted-foreground">
            <p>Play with friends across different devices</p>
          </div>
          <div className="mt-4 text-center text-xs text-muted-foreground font-semibold">
            <p>Made by Ishant</p>
          </div>
        </div>
      </div>
    </GameProvider>
  );
};

export default Index;
