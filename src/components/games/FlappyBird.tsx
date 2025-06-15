
import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, RotateCcw } from 'lucide-react';

interface Pipe {
  x: number;
  gapY: number;
  passed: boolean;
}

export const FlappyBird = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('flappybird-highscore') || '0');
  });

  // Game state
  const gameState = useRef({
    bird: { y: 200, velocity: 0 },
    pipes: [] as Pipe[],
    frameCount: 0
  });

  const CANVAS_WIDTH = 320;
  const CANVAS_HEIGHT = 480;
  const BIRD_SIZE = 20;
  const PIPE_WIDTH = 50;
  const PIPE_GAP = 150;
  const GRAVITY = 0.5;
  const JUMP_FORCE = -8;

  const resetGame = useCallback(() => {
    gameState.current = {
      bird: { y: CANVAS_HEIGHT / 2, velocity: 0 },
      pipes: [],
      frameCount: 0
    };
    setScore(0);
    setGameOver(false);
    setGameStarted(false);
  }, []);

  const jump = useCallback(() => {
    if (!gameStarted) {
      setGameStarted(true);
    }
    if (!gameOver) {
      gameState.current.bird.velocity = JUMP_FORCE;
    }
  }, [gameStarted, gameOver]);

  const gameLoop = useCallback(() => {
    if (!gameStarted || gameOver) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { bird, pipes } = gameState.current;

    // Update bird
    bird.velocity += GRAVITY;
    bird.y += bird.velocity;

    // Add new pipes
    if (gameState.current.frameCount % 90 === 0) {
      pipes.push({
        x: CANVAS_WIDTH,
        gapY: Math.random() * (CANVAS_HEIGHT - PIPE_GAP - 100) + 50,
        passed: false
      });
    }

    // Update pipes
    pipes.forEach((pipe, index) => {
      pipe.x -= 2;
      
      // Check if bird passed pipe
      if (!pipe.passed && pipe.x + PIPE_WIDTH < CANVAS_WIDTH / 2 - BIRD_SIZE / 2) {
        pipe.passed = true;
        setScore(s => s + 1);
      }

      // Remove off-screen pipes
      if (pipe.x + PIPE_WIDTH < 0) {
        pipes.splice(index, 1);
      }
    });

    // Collision detection
    const birdLeft = CANVAS_WIDTH / 2 - BIRD_SIZE / 2;
    const birdRight = CANVAS_WIDTH / 2 + BIRD_SIZE / 2;
    const birdTop = bird.y - BIRD_SIZE / 2;
    const birdBottom = bird.y + BIRD_SIZE / 2;

    // Ground and ceiling collision
    if (bird.y >= CANVAS_HEIGHT - BIRD_SIZE / 2 || bird.y <= BIRD_SIZE / 2) {
      setGameOver(true);
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('flappybird-highscore', score.toString());
      }
      return;
    }

    // Pipe collision
    for (const pipe of pipes) {
      if (birdLeft < pipe.x + PIPE_WIDTH && birdRight > pipe.x) {
        if (birdTop < pipe.gapY || birdBottom > pipe.gapY + PIPE_GAP) {
          setGameOver(true);
          if (score > highScore) {
            setHighScore(score);
            localStorage.setItem('flappybird-highscore', score.toString());
          }
          return;
        }
      }
    }

    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw pipes
    ctx.fillStyle = '#00ff00';
    pipes.forEach(pipe => {
      // Top pipe
      ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.gapY);
      // Bottom pipe
      ctx.fillRect(pipe.x, pipe.gapY + PIPE_GAP, PIPE_WIDTH, CANVAS_HEIGHT - pipe.gapY - PIPE_GAP);
    });

    // Draw bird
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(
      CANVAS_WIDTH / 2 - BIRD_SIZE / 2,
      bird.y - BIRD_SIZE / 2,
      BIRD_SIZE,
      BIRD_SIZE
    );

    gameState.current.frameCount++;
  }, [gameStarted, gameOver, score, highScore]);

  useEffect(() => {
    const interval = setInterval(gameLoop, 1000 / 60);
    return () => clearInterval(interval);
  }, [gameLoop]);

  useEffect(() => {
    const handleTouch = (e: TouchEvent) => {
      e.preventDefault();
      jump();
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        jump();
      }
    };

    document.addEventListener('touchstart', handleTouch);
    document.addEventListener('keydown', handleKeyPress);

    return () => {
      document.removeEventListener('touchstart', handleTouch);
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [jump]);

  return (
    <div className="px-4 pb-8">
      <div className="max-w-md mx-auto">
        {/* Score Display */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-center">
            <p className="text-sm text-gray-400">Score</p>
            <p className="text-2xl font-bold neon-text text-yellow-400">{score}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-400">Best</p>
            <p className="text-2xl font-bold neon-text text-green-400">{highScore}</p>
          </div>
        </div>

        {/* Game Canvas */}
        <div className="relative mx-auto" style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}>
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="game-canvas rounded-lg cursor-pointer"
            onClick={jump}
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
                <h2 className="text-2xl font-bold neon-text text-cyan-400 mb-4">Flappy Bird</h2>
                <button
                  onClick={jump}
                  className="arcade-button flex items-center gap-2 mx-auto"
                >
                  <Play size={20} />
                  Start Game
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="text-center text-gray-300 text-sm mt-4">
          <p>Tap the screen or press space to jump</p>
          <p>Avoid the pipes and try to get the highest score!</p>
        </div>
      </div>
    </div>
  );
};
