
import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface Position {
  x: number;
  y: number;
}

type Direction = 'up' | 'down' | 'left' | 'right';

export const Snake = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('snake-highscore') || '0');
  });

  const gameState = useRef({
    snake: [{ x: 10, y: 10 }],
    food: { x: 5, y: 5 },
    direction: 'right' as Direction,
    nextDirection: 'right' as Direction
  });

  const CANVAS_SIZE = 320;
  const GRID_SIZE = 20;
  const GRID_COUNT = CANVAS_SIZE / GRID_SIZE;

  const resetGame = useCallback(() => {
    gameState.current = {
      snake: [{ x: 10, y: 10 }],
      food: { x: 5, y: 5 },
      direction: 'right',
      nextDirection: 'right'
    };
    setScore(0);
    setGameOver(false);
    setGameStarted(false);
  }, []);

  const generateFood = useCallback(() => {
    const { snake } = gameState.current;
    let newFood: Position;
    
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_COUNT),
        y: Math.floor(Math.random() * GRID_COUNT)
      };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    
    return newFood;
  }, []);

  const moveSnake = useCallback(() => {
    if (!gameStarted || gameOver) return;

    const { snake, food, nextDirection } = gameState.current;
    gameState.current.direction = nextDirection;

    const head = { ...snake[0] };

    switch (gameState.current.direction) {
      case 'up':
        head.y -= 1;
        break;
      case 'down':
        head.y += 1;
        break;
      case 'left':
        head.x -= 1;
        break;
      case 'right':
        head.x += 1;
        break;
    }

    // Check wall collision
    if (head.x < 0 || head.x >= GRID_COUNT || head.y < 0 || head.y >= GRID_COUNT) {
      setGameOver(true);
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('snake-highscore', score.toString());
      }
      return;
    }

    // Check self collision
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
      setGameOver(true);
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('snake-highscore', score.toString());
      }
      return;
    }

    const newSnake = [head, ...snake];

    // Check food collision
    if (head.x === food.x && head.y === food.y) {
      gameState.current.food = generateFood();
      setScore(s => s + 10);
    } else {
      newSnake.pop();
    }

    gameState.current.snake = newSnake;
  }, [gameStarted, gameOver, score, highScore, generateFood]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { snake, food } = gameState.current;

    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw snake
    ctx.fillStyle = '#00ff00';
    snake.forEach((segment, index) => {
      if (index === 0) {
        ctx.fillStyle = '#00ff88'; // Head color
      } else {
        ctx.fillStyle = '#00ff00'; // Body color
      }
      ctx.fillRect(
        segment.x * GRID_SIZE,
        segment.y * GRID_SIZE,
        GRID_SIZE - 1,
        GRID_SIZE - 1
      );
    });

    // Draw food
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(
      food.x * GRID_SIZE,
      food.y * GRID_SIZE,
      GRID_SIZE - 1,
      GRID_SIZE - 1
    );
  }, []);

  const changeDirection = useCallback((newDirection: Direction) => {
    const { direction } = gameState.current;
    
    // Prevent reverse direction
    if (
      (direction === 'up' && newDirection === 'down') ||
      (direction === 'down' && newDirection === 'up') ||
      (direction === 'left' && newDirection === 'right') ||
      (direction === 'right' && newDirection === 'left')
    ) {
      return;
    }

    gameState.current.nextDirection = newDirection;

    if (!gameStarted) {
      setGameStarted(true);
    }
  }, [gameStarted]);

  useEffect(() => {
    const interval = setInterval(() => {
      moveSnake();
      draw();
    }, 150);

    return () => clearInterval(interval);
  }, [moveSnake, draw]);

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          changeDirection('up');
          break;
        case 'ArrowDown':
          e.preventDefault();
          changeDirection('down');
          break;
        case 'ArrowLeft':
          e.preventDefault();
          changeDirection('left');
          break;
        case 'ArrowRight':
          e.preventDefault();
          changeDirection('right');
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [changeDirection]);

  return (
    <div className="px-4 pb-8">
      <div className="max-w-md mx-auto">
        {/* Score Display */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-center">
            <p className="text-sm text-gray-400">Score</p>
            <p className="text-2xl font-bold neon-text text-green-400">{score}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-400">Best</p>
            <p className="text-2xl font-bold neon-text text-yellow-400">{highScore}</p>
          </div>
        </div>

        {/* Game Canvas */}
        <div className="relative mx-auto mb-4" style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}>
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="game-canvas rounded-lg"
          />
          
          {/* Game Over Overlay */}
          {gameOver && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg">
              <div className="text-center">
                <h2 className="text-2xl font-bold neon-text text-red-400 mb-4">Game Over!</h2>
                <p className="text-lg mb-4">Score: {score}</p>
                <button
                  onClick={resetGame}
                  className="arcade-button flex items-center gap-2 mx-auto"
                >
                  <RotateCcw size={20} />
                  Play Again
                </button>
              </div>
            </div>
          )}

          {/* Start Game Overlay */}
          {!gameStarted && !gameOver && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg">
              <div className="text-center">
                <h2 className="text-2xl font-bold neon-text text-green-400 mb-4">Snake Game</h2>
                <p className="text-sm mb-4">Use arrow keys or buttons to move</p>
                <button
                  onClick={() => setGameStarted(true)}
                  className="arcade-button flex items-center gap-2 mx-auto"
                >
                  <Play size={20} />
                  Start Game
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Controls */}
        <div className="grid grid-cols-3 gap-2 max-w-48 mx-auto">
          <div></div>
          <button
            onClick={() => changeDirection('up')}
            className="aspect-square bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center text-cyan-400 border border-cyan-400/50"
          >
            <ArrowUp size={24} />
          </button>
          <div></div>
          
          <button
            onClick={() => changeDirection('left')}
            className="aspect-square bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center text-cyan-400 border border-cyan-400/50"
          >
            <ArrowLeft size={24} />
          </button>
          <div></div>
          <button
            onClick={() => changeDirection('right')}
            className="aspect-square bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center text-cyan-400 border border-cyan-400/50"
          >
            <ArrowRight size={24} />
          </button>
          
          <div></div>
          <button
            onClick={() => changeDirection('down')}
            className="aspect-square bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center text-cyan-400 border border-cyan-400/50"
          >
            <ArrowDown size={24} />
          </button>
          <div></div>
        </div>

        {/* Instructions */}
        <div className="text-center text-gray-300 text-sm mt-4">
          <p>Eat the red food to grow your snake</p>
          <p>Don't hit the walls or your own tail!</p>
        </div>
      </div>
    </div>
  );
};
