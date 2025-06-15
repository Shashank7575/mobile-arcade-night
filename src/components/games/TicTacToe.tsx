
import { useState } from 'react';
import { RotateCcw } from 'lucide-react';

type Player = 'X' | 'O' | null;
type GameResult = Player | 'draw';
type Board = Player[];

export const TicTacToe = () => {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<'X' | 'O'>('X');
  const [winner, setWinner] = useState<GameResult>(null);
  const [winningLine, setWinningLine] = useState<number[]>([]);

  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6] // diagonals
  ];

  const checkWinner = (newBoard: Board): Player => {
    for (const combination of winningCombinations) {
      const [a, b, c] = combination;
      if (newBoard[a] && newBoard[a] === newBoard[b] && newBoard[a] === newBoard[c]) {
        setWinningLine(combination);
        return newBoard[a];
      }
    }
    return null;
  };

  const handleCellClick = (index: number) => {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    const gameWinner = checkWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
    } else if (newBoard.every(cell => cell !== null)) {
      setWinner('draw');
    } else {
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
    setWinningLine([]);
  };

  const getCellColor = (index: number) => {
    if (winningLine.includes(index)) {
      return 'bg-green-500 text-white';
    }
    if (board[index] === 'X') {
      return 'bg-pink-500 text-white';
    }
    if (board[index] === 'O') {
      return 'bg-cyan-500 text-white';
    }
    return 'bg-gray-800 hover:bg-gray-700 text-white';
  };

  return (
    <div className="px-4 pb-8">
      <div className="max-w-md mx-auto">
        {/* Game Status */}
        <div className="text-center mb-6">
          {winner ? (
            <div className="space-y-2">
              <h2 className="text-2xl font-bold neon-text text-green-400">
                {winner === 'draw' ? "It's a Draw!" : `Player ${winner} Wins!`}
              </h2>
              <button
                onClick={resetGame}
                className="arcade-button flex items-center gap-2 mx-auto"
              >
                <RotateCcw size={20} />
                Play Again
              </button>
            </div>
          ) : (
            <h2 className="text-xl font-bold neon-text text-cyan-400">
              Player {currentPlayer}'s Turn
            </h2>
          )}
        </div>

        {/* Game Board */}
        <div className="grid grid-cols-3 gap-2 mb-6 game-canvas rounded-lg p-4">
          {board.map((cell, index) => (
            <button
              key={index}
              onClick={() => handleCellClick(index)}
              className={`
                aspect-square rounded-lg border-2 border-cyan-400/50
                text-4xl font-bold transition-all duration-200
                ${getCellColor(index)}
                ${!cell && !winner ? 'hover:scale-105 active:scale-95' : ''}
              `}
              disabled={!!cell || !!winner}
            >
              {cell}
            </button>
          ))}
        </div>

        {/* Game Instructions */}
        <div className="text-center text-gray-300 text-sm">
          <p>Tap a cell to place your mark</p>
          <p>Get three in a row to win!</p>
        </div>
      </div>
    </div>
  );
};
