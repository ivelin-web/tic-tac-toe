class GameService {
    joinGameRoom = (socket, roomId) => {
        return new Promise((resolve, reject) => {
            socket.emit("join_game", { roomId });
            socket.on("room_joined", () => resolve(true));
            socket.on("room_join_error", ({ error }) => reject(error));
        });
    };

    updateGame = (socket, gameMatrix) => {
        socket.emit("update_game", { matrix: gameMatrix });
    };

    onGameUpdate = (socket, callback) => {
        socket.on("on_game_update", ({ matrix }) => callback(matrix));
    };

    onStartGame = (socket, callback) => {
        socket.on("start_game", callback);
    };

    gameEnd = (socket, message) => {
        socket.emit("game_end", message);
    };

    onGameEnd = (socket, callback) => {
        socket.on("on_game_end", (message) => callback(message));
    };
}

export default new GameService();
