
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGame } from '@/context/GameContext';
import { toast } from 'sonner';
import { Plus, ArrowRight } from 'lucide-react';

const RoomJoin: React.FC = () => {
  const [roomCode, setRoomCode] = useState('');
  const { createRoom, joinRoom } = useGame();
  
  const handleCreateRoom = () => {
    createRoom();
  };
  
  const handleJoinRoom = () => {
    if (!roomCode.trim()) {
      toast.error('Please enter a room code');
      return;
    }
    
    joinRoom(roomCode.toUpperCase());
  };
  
  return (
    <div className="glass-panel p-8 max-w-md w-full animate-scale-in">
      <h1 className="text-2xl font-bold mb-6 text-center">Tic Tac Toe</h1>
      
      <div className="space-y-8">
        <div className="space-y-4">
          <div className="chip mx-auto">Create Room</div>
          <p className="text-center text-muted-foreground text-sm mb-4">
            Start a new game and invite a friend to play
          </p>
          <Button 
            onClick={handleCreateRoom} 
            className="w-full flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create New Game
          </Button>
        </div>
        
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">or</span>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="chip mx-auto">Join Room</div>
          <p className="text-center text-muted-foreground text-sm mb-4">
            Enter a room code to join an existing game
          </p>
          <div className="flex gap-2">
            <Input
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              placeholder="Enter room code"
              className="flex-1 text-center uppercase"
              maxLength={4}
            />
            <Button onClick={handleJoinRoom}>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomJoin;
