import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare } from "lucide-react";

interface RoomJoinProps {
  onJoinRoom: (roomCode: string) => void;
}

const RoomJoin = ({ onJoinRoom }: RoomJoinProps) => {
  const [roomCode, setRoomCode] = useState("");
  const { toast } = useToast();

  const generateRoomCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomCode(code);
    toast({
      title: "Room code generated!",
      description: `Share this code: ${code}`,
    });
  };

  const handleJoinRoom = () => {
    if (!roomCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a room code",
        variant: "destructive",
      });
      return;
    }
    onJoinRoom(roomCode.toUpperCase());
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Animated background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 animate-pulse" />
      <div className="absolute top-20 left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-glow" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-glow" style={{ animationDelay: "1s" }} />
      
      <Card className="w-full max-w-md p-8 bg-card/80 backdrop-blur-xl border-border/50 shadow-2xl relative z-10 animate-fade-in">
        <div className="flex flex-col items-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg animate-glow">
            <MessageSquare className="w-10 h-10 text-primary-foreground" />
          </div>
          
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              PECO
            </h1>
            <p className="text-muted-foreground">
              Create or join a temporary chat room
            </p>
          </div>

          <div className="w-full space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="Enter room code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === "Enter" && handleJoinRoom()}
                className="text-center text-lg tracking-widest font-mono bg-muted/50 border-border/50 focus:border-primary transition-all"
                maxLength={6}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Button
                onClick={handleJoinRoom}
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity shadow-lg"
                size="lg"
              >
                Join Room
              </Button>
              
              <Button
                onClick={generateRoomCode}
                variant="outline"
                className="w-full border-primary/30 hover:border-primary transition-colors"
                size="lg"
              >
                Generate New Code
              </Button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Messages disappear when you leave the room. <br />
            No data is permanently stored.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default RoomJoin;
