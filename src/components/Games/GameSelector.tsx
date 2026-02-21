'use client';

import React from 'react';
import type { GameType, GameOption } from '@/types/games';
import { Gamepad2 as SnakeIcon, Box, Bug as SpiderIcon, Brain, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface GameSelectorProps {
  selectedGame: GameType | null;
  onSelectGame: (game: GameType) => void;
}

const games: GameOption[] = [
  {
    id: 'snake',
    name: 'Snake Reloaded',
    description: 'Reflex & spatial awareness boost',
    icon: 'snake',
    color: '#22c55e',
  },
  {
    id: 'tetris',
    name: 'Neuro Tetris',
    description: 'Strategic stacking challenge',
    icon: 'tetris',
    color: '#3b82f6',
  },
  {
    id: 'spider',
    name: 'Spider Solitaire',
    description: 'Classic card mastery',
    icon: 'spider',
    color: '#a855f7',
  },
  {
    id: 'memory',
    name: 'Memory Matrix',
    description: 'Pattern recognition training',
    icon: 'memory',
    color: '#f59e0b',
  },
];

const GameIcon: React.FC<{ type: string; color: string }> = ({ type, color }) => {
  const baseClass = 'w-7 h-7';

  switch (type) {
    case 'snake':
      return <SnakeIcon className={baseClass} style={{ color }} />;
    case 'tetris':
      return <Box className={baseClass} style={{ color }} />;
    case 'spider':
      return <SpiderIcon className={baseClass} style={{ color }} />;
    case 'memory':
      return <Brain className={baseClass} style={{ color }} />;
    default:
      return null;
  }
};

const GameSelector: React.FC<GameSelectorProps> = ({ selectedGame, onSelectGame }) => {
  return (
    <div className="w-full">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 text-indigo-400 mb-3">
          <Sparkles className="w-5 h-5" />
          <span className="uppercase tracking-widest text-xs">Choose Your Challenge</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          Pick a Brain Boost Game
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {games.map((game) => {
          const isSelected = selectedGame === game.id;

          return (
            <motion.button
              key={game.id}
              whileHover={{ y: -6 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelectGame(game.id)}
              className={`
                group relative p-6 rounded-2xl
                backdrop-blur-xl bg-white/5
                border transition-all duration-300
                shadow-xl
                ${isSelected
                  ? 'border-indigo-500 shadow-indigo-500/30'
                  : 'border-white/10 hover:border-indigo-400/60'}
              `}
            >
              {/* Glow Effect */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl"
                style={{ backgroundColor: `${game.color}33` }}
              />

              <div className="relative z-10 flex flex-col items-center text-center gap-4">
                <div
                  className={`
                    w-16 h-16 rounded-2xl flex items-center justify-center
                    transition-all duration-300
                    ${isSelected ? 'scale-110' : 'group-hover:scale-105'}
                  `}
                  style={{
                    background: `linear-gradient(135deg, ${game.color}30, transparent)`,
                    boxShadow: isSelected
                      ? `0 0 25px ${game.color}55`
                      : 'none',
                  }}
                >
                  <GameIcon type={game.icon} color={game.color} />
                </div>

                <div>
                  <h3
                    className={`text-lg font-semibold transition-colors ${
                      isSelected ? 'text-indigo-400' : 'text-white'
                    }`}
                  >
                    {game.name}
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">
                    {game.description}
                  </p>
                </div>

                <div
                  className={`mt-3 w-full text-sm font-medium rounded-xl py-2 transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white/10 text-slate-300 group-hover:bg-white/20'
                  }`}
                >
                  {isSelected ? 'Selected' : 'Play Now'}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default GameSelector;