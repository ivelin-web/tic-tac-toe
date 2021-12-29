import React, { useState } from "react";
import "./JoinRoom.css";
import gameService from "../../services/gameService";
import socketService from "../../services/socketService";

export default function JoinRoom({ roomId, setRoomId, isInRoom, setIsInRoom }) {
    const [isJoiningRoom, setIsJoiningRoom] = useState(false);

    const handleRoomIdChange = (e) => {
        setRoomId(e.target.value);
    };

    const handleJoinRoom = async (e) => {
        e.preventDefault();

        const socket = socketService.socket;

        if (!roomId || roomId.trim().length === 0 || !socket) {
            return;
        }

        setIsJoiningRoom(true);

        const joined = await gameService.joinGameRoom(socket, roomId).catch((err) => {
            alert(err);
        });

        setIsJoiningRoom(false);

        if (joined) {
            setIsInRoom(true);
        }
    };

    return (
        <div className="joinRoomContainer">
            <h5 className="joinRoomTitle">Enter Room ID to Join the Game</h5>
            <form onSubmit={handleJoinRoom} className="joinRoomForm">
                <div className="joinRoomInputWrapper">
                    <input className="joinRoomInput" type="text" placeholder="Room ID" value={roomId} onChange={handleRoomIdChange} />
                </div>
                <button disabled={isJoiningRoom} type="submit" className="joinRoomButton">
                    {isJoiningRoom ? "Joining..." : "Join"}
                </button>
            </form>
        </div>
    );
}
