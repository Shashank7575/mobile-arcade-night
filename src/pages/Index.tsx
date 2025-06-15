
import { useState } from 'react';
import { GameGrid } from '../components/GameGrid';
import { TicTacToe } from '../components/games/TicTacToe';
import { FlappyBird } from '../components/games/FlappyBird';
import { Snake } from '../components/games/Snake';
import { CarRacing } from '../components/games/CarRacing';
import { ArrowLeft } from 'lucide-react';

type GameType = 'menu' | 'tictactoe' | 'flappybird' | 'snake' | 'carracing';

const Index = () => {
  const [currentGame, setCurrentGame] = useState<GameType>('menu');

  const renderGame = () => {
    switch (currentGame) {
      case 'tictactoe':
        return <TicTacToe />;
      case 'flappybird':
        return <FlappyBird />;
      case 'snake':
        return <Snake />;
      case 'carracing':
        return <CarRacing />;
      default:
        return <GameGrid onGameSelect={setCurrentGame} />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Header */}
      <div className="relative z-10 p-4">
        <div className="flex items-center justify-between max-w-md mx-auto">
          {currentGame !== 'menu' && (
            <button
              onClick={() => setCurrentGame('menu')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="text-sm">Menu</span>
            </button>
          )}
          <h1 className="text-2xl font-bold neon-text text-cyan-400 flex-1 text-center">
            🕹️ ARCADE NIGHT
          </h1>
        </div>
      </div>

      {/* Game Content */}
      <div className="flex-1">
        {renderGame()}
      </div>
    </div>
  );
};

export default Index;
