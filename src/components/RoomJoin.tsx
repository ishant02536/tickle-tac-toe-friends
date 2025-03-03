
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGame } from '@/context/GameContext';
import { toast } from 'sonner';
import { Plus, ArrowRight, Bot, Users } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Difficulty } from '@/lib/aiLogic';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const RoomJoin: React.FC = () => {
  const [roomCode, setRoomCode] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('easy');
  const { createRoom, joinRoom, startAIGame } = useGame();
  
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
  
  const handleStartAIGame = () => {
    startAIGame(selectedDifficulty);
  };
  
  return (
    <div className="glass-panel p-8 max-w-md w-full animate-scale-in">
      <h1 className="text-2xl font-bold mb-6 text-center">Tic Tac Toe</h1>
      
      <Tabs defaultValue="multiplayer" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="multiplayer" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>Play with Friends</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Bot className="w-4 h-4" />
            <span>Play vs AI</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="multiplayer" className="space-y-8">
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
        </TabsContent>
        
        <TabsContent value="ai" className="space-y-6">
          <div className="space-y-4">
            <div className="chip mx-auto">Play Against AI</div>
            <p className="text-center text-muted-foreground text-sm mb-4">
              Select difficulty level and start a game against the AI
            </p>
            
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <h3 className="font-medium text-sm mb-2">Select Difficulty:</h3>
              
              <RadioGroup 
                value={selectedDifficulty} 
                onValueChange={(value) => setSelectedDifficulty(value as Difficulty)}
                className="flex flex-col space-y-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="easy" id="easy" />
                  <Label htmlFor="easy" className="font-normal">Easy - Random moves</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium" className="font-normal">Medium - Occasionally blocks your moves</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="hard" id="hard" />
                  <Label htmlFor="hard" className="font-normal">Hard - Plays strategically</Label>
                </div>
              </RadioGroup>
            </div>
            
            <Button 
              onClick={handleStartAIGame} 
              className="w-full flex items-center justify-center gap-2 mt-4"
            >
              <Bot className="w-4 h-4" />
              Start Game
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RoomJoin;
