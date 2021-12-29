import express from "express";
import morgan from "morgan";
import cors from "cors";
import http from "http";
import helmet from "helmet";
import { Server } from "socket.io";
import loadEnvironments from "./utils/loadEnvironments/index.js";

// App config
loadEnvironments();

const app = express();
const port = process.env.PORT || 5050;
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.ORIGIN,
    },
});

// Middlewares
app.use(express.json());
app.use(
    cors({
        origin: process.env.ORIGIN,
    })
);
app.use(helmet());
app.use(morgan("dev"));

// Listener
io.on("connection", (socket) => {
    const getSocketGameRoom = () => {
        const socketRooms = [...socket.rooms.values()].filter((room) => room !== socket.id);
        const gameRoom = socketRooms && socketRooms[0];

        return gameRoom;
    };

    socket.on("join_game", async (message) => {
        const connectedSockets = io.sockets.adapter.rooms.get(message.roomId);
        const socketRooms = [...socket.rooms.values()].filter((room) => room !== socket.id);

        if (socketRooms.length > 0) {
            socket.emit("room_join_error", {
                error: "You already joined in some room!",
            });

            return;
        }

        if (connectedSockets?.size === 2) {
            socket.emit("room_join_error", {
                error: "Room is full please choose another room to play!",
            });

            return;
        }

        await socket.join(message.roomId);
        socket.emit("room_joined");

        if (io.sockets.adapter.rooms.get(message.roomId).size === 2) {
            const randomNumberSymbol = Math.round(Math.random());
            const randomNumberStart = Math.round(Math.random());
            const players = {};

            players.first = {
                symbol: randomNumberSymbol === 0 ? "x" : "o",
                start: randomNumberStart === 0 ? true : false,
            };

            players.second = {
                symbol: randomNumberSymbol === 1 ? "x" : "o",
                start: randomNumberStart === 1 ? true : false,
            };

            socket.emit("start_game", { start: players.first.start, symbol: players.first.symbol });
            socket.to(message.roomId).emit("start_game", { start: players.second.start, symbol: players.second.symbol });
        }
    });

    socket.on("update_game", (message) => {
        const gameRoom = getSocketGameRoom();
        socket.to(gameRoom).emit("on_game_update", message);
    });

    socket.on("game_end", (message) => {
        const gameRoom = getSocketGameRoom();
        socket.to(gameRoom).emit("on_game_end", message);

        io.socketsLeave(gameRoom);
    });
});

server.listen(port, () => {
    console.log(`Server is listening on ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
});
