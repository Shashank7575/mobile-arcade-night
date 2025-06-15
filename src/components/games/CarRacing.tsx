
import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';

interface Car {
  x: number;
  y: number;
  speed: number;
}

export const CarRacing = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('carracing-highscore') || '0');
  });

  const gameState = useRef({
    player: { x: 135, y: 350, width: 30, height: 50 },
    cars: [] as Car[],
    roadLines: [] as { y: number }[],
    speed: 2,
    frameCount: 0
  });

  const CANVAS_WIDTH = 300;
  const CANVAS_HEIGHT = 400;
  const ROAD_WIDTH = 200;
  const ROAD_X = (CANVAS_WIDTH - ROAD_WIDTH) / 2;
  const CAR_WIDTH = 30;
  const CAR_HEIGHT = 50;

  const resetGame = useCallback(() => {
    gameState.current = {
      player: { x: 135, y: 350, width: 30, height: 50 },
      cars: [],
      roadLines: [
        { y: 0 }, { y: 50 }, { y: 100 }, { y: 150 }, 
        { y: 200 }, { y: 250 }, { y: 300 }, { y: 350 }
      ],
      speed: 2,
      frameCount: 0
    };
    setScore(0);
    setGameOver(false);
    setGameStarted(false);
  }, []);

  const movePlayer = useCallback((direction: 'left' | 'right') => {
    if (!gameStarted || gameOver) return;

    const { player } = gameState.current;
    const moveAmount = 30;

    if (direction === 'left' && player.x > ROAD_X + 10) {
      player.x -= moveAmount;
    } else if (direction === 'right' && player.x < ROAD_X + ROAD_WIDTH - CAR_WIDTH - 10) {
      player.x += moveAmount;
    }
  }, [gameStarted, gameOver]);

  const gameLoop = useCallback(() => {
    if (!gameStarted || gameOver) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { player, cars, roadLines, speed } = gameState.current;

    // Add new cars
    if (gameState.current.frameCount % 60 === 0) {
      const lanes = [ROAD_X + 20, ROAD_X + 70, ROAD_X + 120, ROAD_X + 150];
      const randomLane = lanes[Math.floor(Math.random() * lanes.length)];
      cars.push({
        x: randomLane,
        y: -CAR_HEIGHT,
        speed: speed + Math.random() * 2
      });
    }

    // Update cars
    cars.forEach((car, index) => {
      car.y += car.speed;
      if (car.y > CANVAS_HEIGHT) {
        cars.splice(index, 1);
        setScore(s => s + 10);
      }
    });

    // Update road lines
    roadLines.forEach(line => {
      line.y += speed;
      if (line.y > CANVAS_HEIGHT) {
        line.y = -50;
      }
    });

    // Collision detection
    for (const car of cars) {
      if (
        player.x < car.x + CAR_WIDTH &&
        player.x + player.width > car.x &&
        player.y < car.y + CAR_HEIGHT &&
        player.y + player.height > car.y
      ) {
        setGameOver(true);
        if (score > highScore) {
          setHighScore(score);
          localStorage.setItem('carracing-highscore', score.toString());
        }
        return;
      }
    }

    // Increase speed over time
    if (gameState.current.frameCount % 300 === 0) {
      gameState.current.speed += 0.5;
    }

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw grass
    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw road
    ctx.fillStyle = '#333';
    ctx.fillRect(ROAD_X, 0, ROAD_WIDTH, CANVAS_HEIGHT);

    // Draw road lines
    ctx.fillStyle = '#fff';
    roadLines.forEach(line => {
      ctx.fillRect(ROAD_X + ROAD_WIDTH / 2 - 2, line.y, 4, 30);
    });

    // Draw road borders
    ctx.fillStyle = '#fff';
    ctx.fillRect(ROAD_X - 5, 0, 5, CANVAS_HEIGHT);
    ctx.fillRect(ROAD_X + ROAD_WIDTH, 0, 5, CANVAS_HEIGHT);

    // Draw enemy cars
    ctx.fillStyle = '#ff0000';
    cars.forEach(car => {
      ctx.fillRect(car.x, car.y, CAR_WIDTH, CAR_HEIGHT);
      // Car details
      ctx.fillStyle = '#000';
      ctx.fillRect(car.x + 5, car.y + 5, 20, 10);
      ctx.fillRect(car.x + 5, car.y + 35, 20, 10);
      ctx.fillStyle = '#ff0000';
    });

    // Draw player car
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    // Car details
    ctx.fillStyle = '#000';
    ctx.fillRect(player.x + 5, player.y + 5, 20, 10);
    ctx.fillRect(player.x + 5, player.y + 35, 20, 10);

    gameState.current.frameCount++;
  }, [gameStarted, gameOver, score, highScore]);

  useEffect(() => {
    const interval = setInterval(gameLoop, 1000 / 60);
    return () => clearInterval(interval);
  }, [gameLoop]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          movePlayer('left');
          break;
        case 'ArrowRight':
          e.preventDefault();
          movePlayer('right');
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [movePlayer]);

  return (
    <div className="px-4 pb-8">
      <div className="max-w-md mx-auto">
        {/* Score Display */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-center">
            <p className="text-sm text-gray-400">Score</p>
            <p className="text-2xl font-bold neon-text text-blue-400">{score}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-400">Best</p>
            <p className="text-2xl font-bold neon-text text-green-400">{highScore}</p>
          </div>
        </div>

        {/* Game Canvas */}
        <div className="relative mx-auto mb-4" style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}>
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="game-canvas rounded-lg"
          />
          
          {/* Game Over Overlay */}
          {gameOver && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg">
              <div className="text-center">
                <h2 className="text-2xl font-bold neon-text text-red-400 mb-4">Crash!</h2>
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
                <h2 className="text-2xl font-bold neon-text text-blue-400 mb-4">Car Racing</h2>
                <p className="text-sm mb-4">Dodge the cars and survive!</p>
                <button
                  onClick={() => setGameStarted(true)}
                  className="arcade-button flex items-center gap-2 mx-auto"
                >
                  <Play size={20} />
                  Start Race
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Controls */}
        <div className="flex justify-center gap-8">
          <button
            onClick={() => movePlayer('left')}
            className="arcade-button flex items-center gap-2"
            style={{ minWidth: '100px' }}
          >
            <ChevronLeft size={24} />
            Left
          </button>
          <button
            onClick={() => movePlayer('right')}
            className="arcade-button flex items-center gap-2"
            style={{ minWidth: '100px' }}
          >
            Right
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Instructions */}
        <div className="text-center text-gray-300 text-sm mt-4">
          <p>Use arrow keys or buttons to move left and right</p>
          <p>Avoid the red cars and try to survive as long as possible!</p>
        </div>
      </div>
    </div>
  );
};
