'use client';

import React from 'react';
import type { GameType, GameOption } from '@/types/games';
import { Gamepad2 as SnakeIcon, Box, Bug as SpiderIcon, Brain } from 'lucide-react';

interface GameSelectorProps {
  selectedGame: GameType | null;
  onSelectGame: (game: GameType) => void;
}

const games: GameOption[] = [
  {
    id: 'snake',
    name: 'Snake',
    description: 'Classic grid-based snake game',
    icon: 'snake',
    color: '#22c55e'
  },
  {
    id: 'tetris',
    name: 'Tetris',
    description: 'Stack falling blocks strategically',
    icon: 'tetris',
    color: '#3b82f6'
  },
  {
    id: 'spider',
    name: 'Spider Solitaire',
    description: 'Classic card stacking game',
    icon: 'spider',
    color: '#a855f7'
  },
  {
    id: 'memory',
    name: 'Memory Match',
    description: 'Flip cards and find pairs',
    icon: 'memory',
    color: '#f59e0b'
  }
];

const GameIcon: React.FC<{ type: string; color: string; className?: string }> = ({ type, color, className = 'w-6 h-6' }) => {
  switch (type) {
    case 'snake':
      return <SnakeIcon className={className} style={{ color }} />;
    case 'tetris':
      return <Box className={className} style={{ color }} />;
    case 'spider':
      return <SpiderIcon className={className} style={{ color }} />;
    case 'memory':
      return <Brain className={className} style={{ color }} />;
    default:
      return null;
  }
};

const GameSelector: React.FC<GameSelectorProps> = ({ selectedGame, onSelectGame }) => {
  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold text-white mb-4 text-center">Choose Your Game</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {games.map((game) => {
          const isSelected = selectedGame === game.id;
          return (
            <button
              key={game.id}
              onClick={() => onSelectGame(game.id)}
              className={`
                relative p-4 rounded-xl border-2 transition-all duration-300
                ${isSelected 
                  ? 'border-blue-500 bg-blue-500/20 shadow-lg shadow-blue-500/20' 
                  : 'border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800'
                }
              `}
            >
              <div className="flex flex-col items-center gap-3">
                <div 
                  className={`
                    w-12 h-12 rounded-lg flex items-center justify-center
                    transition-transform duration-300
                    ${isSelected ? 'scale-110' : 'group-hover:scale-105'}
                  `}
                  style={{ backgroundColor: `${game.color}20` }}
                >
                  <GameIcon type={game.icon} color={game.color} className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <h3 className={`font-semibold ${isSelected ? 'text-blue-400' : 'text-slate-300'}`}>
                    {game.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">{game.description}</p>
                </div>
              </div>
              
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default GameSelector;