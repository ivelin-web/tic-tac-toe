import React, { useEffect, useState } from "react";
import gameService from "../../services/gameService";
import socketService from "../../services/socketService";
import Cell from "./Cell";
import "./Game.css";

export default function Game({ matrix, setMatrix, isGameEnded, onEndGame, setWins, setLoses, setDraws, playerSymbol, setPlayerSymbol, isPlayerTurn, setIsPlayerTurn, isGameStarted, setIsGameStarted }) {
    useEffect(() => {
        handleGameUpdate();
        handleStartGame();
        handleGameEnd();

        return () => {
            socketService.socket.off("start_game");
            socketService.socket.off("on_game_update");
            socketService.socket.off("on_game_end");
        };
    }, []);

    const checkGameState = (matrix) => {
        // Check for rows and cols
        for (let i = 0; i < matrix.length; i++) {
            const row = [];
            const col = [];

            for (let j = 0; j < matrix[i].length; j++) {
                row.push(matrix[i][j]);
                col.push(matrix[j][i]);
            }

            if (row.every((value) => value && value === playerSymbol) || col.every((value) => value && value === playerSymbol)) {
                return [true, false];
            } else if (row.every((value) => value && value !== playerSymbol) || col.every((value) => value && value !== playerSymbol)) {
                return [false, true];
            }
        }

        // Check for diagonals
        if (matrix[1][1]) {
            // Check first diagonal
            if (matrix[0][0] === matrix[1][1] && matrix[2][2] === matrix[1][1]) {
                return matrix[1][1] === playerSymbol ? [true, false] : [false, true];
            }

            // Check second diagonal
            if (matrix[2][0] === matrix[1][1] && matrix[0][2] === matrix[1][1]) {
                return matrix[1][1] === playerSymbol ? [true, false] : [false, true];
            }
        }

        // Check for tie
        if (matrix.every((row) => row.every((value) => value !== null))) {
            return [true, true];
        }

        return [false, false];
    };

    const updateGameMatrix = (row, col) => {
        const newMatrix = [...matrix];

        // If cell is used then return
        if (newMatrix[row][col] !== null && newMatrix[row][col] !== "null") {
            return;
        }

        newMatrix[row][col] = playerSymbol;
        setMatrix(newMatrix);
        gameService.updateGame(socketService.socket, newMatrix);

        const [currentPlayerWon, otherPlayerWon] = checkGameState(newMatrix);

        if (currentPlayerWon && otherPlayerWon) {
            gameService.gameEnd(socketService.socket, { message: "Draw!", draw: true });
            setDraws((lastDraws) => lastDraws + 1);
            onEndGame("Draw!");
        } else if (currentPlayerWon && !otherPlayerWon) {
            gameService.gameEnd(socketService.socket, { message: "You Lost!", lose: true });
            setWins((lastWins) => lastWins + 1);
            onEndGame("You Won!");
        }

        setIsPlayerTurn(false);
    };

    const handleGameUpdate = () => {
        gameService.onGameUpdate(socketService.socket, (newMatrix) => {
            setMatrix(newMatrix);
            setIsPlayerTurn(true);
        });
    };

    const handleStartGame = () => {
        gameService.onStartGame(socketService.socket, (options) => {
            setIsGameStarted(true);
            setPlayerSymbol(options.symbol);

            if (options.start) {
                setIsPlayerTurn(true);
                return;
            }

            setIsPlayerTurn(false);
        });
    };

    const handleGameEnd = () => {
        gameService.onGameEnd(socketService.socket, (data) => {
            setIsPlayerTurn(false);

            data.draw && setDraws((lastDraws) => lastDraws + 1);
            data.lose && setLoses((lastLoses) => lastLoses + 1);

            onEndGame(data.message);
        });
    };

    return (
        <>
            <div className="gameContainer">
                {(!isGameStarted || !isPlayerTurn) && <div className="playStopper"></div>}
                {matrix.map((rowElement, rowIndex) => {
                    return (
                        <div key={rowIndex} className="rowContainer">
                            {rowElement.map((colElement, colIndex) => {
                                return (
                                    <Cell key={colIndex} playerSymbol={playerSymbol} borderTop={rowIndex > 0} borderLeft={colIndex > 0} borderBottom={rowIndex < 2} borderRight={colIndex < 2} rowIndex={rowIndex} colIndex={colIndex} onUpdateGameMatrix={updateGameMatrix}>
                                        {colElement && colElement !== "null" ? colElement === "x" ? <span className="cross"></span> : <span className="circle"></span> : null}
                                    </Cell>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
            {!isGameStarted && !isGameEnded && <h4 className="gameWaitingText">Waiting for Other Player to Join to Start the Game...</h4>}
        </>
    );
}
