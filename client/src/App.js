import React, { useEffect, useState } from "react";
import Game from "./components/game";
import JoinRoom from "./components/joinRoom";
import gameService from "./services/gameService";
import socketService from "./services/socketService";

function App() {
    const [matrix, setMatrix] = useState([
        [null, null, null],
        [null, null, null],
        [null, null, null],
    ]);
    const [isInRoom, setIsInRoom] = useState(false);
    const [playerSymbol, setPlayerSymbol] = useState("x");
    const [isPlayerTurn, setIsPlayerTurn] = useState(false);
    const [isGameStarted, setIsGameStarted] = useState(false);
    const [roomId, setRoomId] = useState("");
    const [wins, setWins] = useState(0);
    const [loses, setLoses] = useState(0);
    const [draws, setDraws] = useState(0);
    const [isGameEnded, setIsGameEnded] = useState(false);
    const [endGameMessage, setEndGameMessage] = useState("");
    const [isJoiningAgain, setIsJoiningAgain] = useState(false);

    useEffect(() => {
        connectSocket();
    }, []);

    const connectSocket = async () => {
        const socket = await socketService.connect(process.env.REACT_APP_API).catch((err) => {
            console.log(`Error: ${err}`);
        });
    };

    const handlePlayAgain = async () => {
        setIsJoiningAgain(true);

        const joined = await gameService.joinGameRoom(socketService.socket, roomId).catch((err) => alert(err));

        if (joined) {
            setIsGameEnded(false);
            setMatrix([
                [null, null, null],
                [null, null, null],
                [null, null, null],
            ]);
        }

        setIsJoiningAgain(false);
    };

    const handleEndGame = (message) => {
        setIsGameEnded(true);
        setEndGameMessage(message);
        setIsGameStarted(false);
    };

    const resetGameState = () => {
        setMatrix([
            [null, null, null],
            [null, null, null],
            [null, null, null],
        ]);
        setIsInRoom(false);
        setIsPlayerTurn(false);
        setIsGameStarted(false);
        setRoomId("");
        setWins(0);
        setLoses(0);
        setDraws(0);
        setIsGameEnded(false);
        setEndGameMessage("");
    };

    return (
        <div className="container">
            <h1 className="title">Welcome to Tic-Tac-Toe</h1>
            {isGameStarted && <p className="playerTurnText">{isPlayerTurn ? "It's your turn..." : "It's opponent turn..."}</p>}
            {isInRoom ? <Game matrix={matrix} setMatrix={setMatrix} isGameEnded={isGameEnded} onEndGame={handleEndGame} setWins={setWins} setLoses={setLoses} setDraws={setDraws} playerSymbol={playerSymbol} setPlayerSymbol={setPlayerSymbol} isPlayerTurn={isPlayerTurn} setIsPlayerTurn={setIsPlayerTurn} isGameStarted={isGameStarted} setIsGameStarted={setIsGameStarted} /> : <JoinRoom roomId={roomId} setRoomId={setRoomId} isInRoom={isInRoom} setIsInRoom={setIsInRoom} />}
            <div>
                {(isGameStarted || isGameEnded) && (
                    <div className="gameStatsContainer">
                        <h4 className="gameStats">Wins: {wins}</h4>
                        <h4 className="gameStats">Loses: {loses}</h4>
                        <h4 className="gameStats">Draws: {draws}</h4>
                    </div>
                )}
            </div>
            {isGameEnded && (
                <div className="gameEndOverlay">
                    <h1 className="gameEndOverlayTitle">{endGameMessage}</h1>
                    <div className="gameEndOverlayButtons">
                        <button disabled={isJoiningAgain} onClick={resetGameState} className="joinRoomButton">
                            HOME
                        </button>
                        <button disabled={isJoiningAgain} onClick={handlePlayAgain} className="joinRoomButton">
                            {isJoiningAgain ? "JOINING..." : "PLAY AGAIN"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
