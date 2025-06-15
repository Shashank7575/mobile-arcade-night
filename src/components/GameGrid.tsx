
import { Gamepad2, Zap, Target, Car } from 'lucide-react';

interface GameGridProps {
  onGameSelect: (game: 'tictactoe' | 'flappybird' | 'snake' | 'carracing') => void;
}

export const GameGrid = ({ onGameSelect }: GameGridProps) => {
  const games = [
    {
      id: 'tictactoe' as const,
      name: 'Tic Tac Toe',
      icon: Target,
      color: 'from-pink-500 to-purple-600',
      description: 'Classic strategy game'
    },
    {
      id: 'flappybird' as const,
      name: 'Flappy Bird',
      icon: Zap,
      color: 'from-yellow-400 to-orange-500',
      description: 'Navigate through pipes'
    },
    {
      id: 'snake' as const,
      name: 'Snake',
      icon: Gamepad2,
      color: 'from-green-400 to-emerald-600',
      description: 'Grow your snake'
    },
    {
      id: 'carracing' as const,
      name: 'Car Racing',
      icon: Car,
      color: 'from-blue-400 to-cyan-500',
      description: 'Race and dodge cars'
    }
  ];

  return (
    <div className="px-4 pb-8">
      <div className="max-w-md mx-auto">
        <p className="text-center text-gray-300 mb-8 text-lg">
          Choose your game and start playing!
        </p>
        
        <div className="grid grid-cols-1 gap-4">
          {games.map((game) => {
            const IconComponent = game.icon;
            return (
              <button
                key={game.id}
                onClick={() => onGameSelect(game.id)}
                className={`
                  relative p-6 rounded-xl border-2 border-transparent
                  bg-gradient-to-r ${game.color}
                  hover:scale-105 active:scale-95
                  transition-all duration-200
                  neon-border
                `}
                style={{ borderColor: 'currentColor' }}
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <IconComponent size={40} className="text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-bold text-white mb-1">
                      {game.name}
                    </h3>
                    <p className="text-white/80 text-sm">
                      {game.description}
                    </p>
                  </div>
                </div>
                
                {/* Animated glow effect */}
                <div className="absolute inset-0 rounded-xl opacity-0 hover:opacity-20 transition-opacity duration-200 bg-white pulse-neon"></div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
