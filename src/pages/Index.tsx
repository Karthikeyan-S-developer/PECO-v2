import { useState } from "react";
import RoomJoin from "@/components/RoomJoin";
import ChatRoom from "@/components/ChatRoom";

const Index = () => {
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);

  const handleJoinRoom = (roomCode: string) => {
    setCurrentRoom(roomCode);
  };

  const handleLeaveRoom = () => {
    setCurrentRoom(null);
  };

  return (
    <>
      {!currentRoom ? (
        <RoomJoin onJoinRoom={handleJoinRoom} />
      ) : (
        <ChatRoom roomCode={currentRoom} onLeaveRoom={handleLeaveRoom} />
      )}
    </>
  );
};

export default Index;
