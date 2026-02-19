'use client';

import React, { useState } from 'react';
import type { GameType } from '@/types/games';
import Link from 'next/link';
import {
  GameLayout,
  GameSelector,
  BreakTimer,
  SnakeGame,
  TetrisGame,
  SpiderSolitaire,
  MemoryGame,
} from '@/components/Games';
import { Gamepad2, BookOpen, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const GamesPage: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState<GameType | null>(null);
  const [showTimer, setShowTimer] = useState<boolean>(true);

  const handleTimerEnd = () => {
    console.log('Break time is over!');
  };

  const renderGame = () => {
    switch (selectedGame) {
      case 'snake':
        return <SnakeGame />;
      case 'tetris':
        return <TetrisGame />;
      case 'spider':
        return <SpiderSolitaire />;
      case 'memory':
        return <MemoryGame />;
      default:
        return null;
    }
  };

  return (
    <GameLayout>
      {/* Header */}
      <header className="w-full p-4 md:p-6 border-b border-slate-800/50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Gamepad2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white">The XPosiGuide</h1>
              <p className="text-xs text-slate-400">Games Break</p>
            </div>
          </div>
          
          <Button
            variant="outline"
            className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
            
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <Link href="/projections-studio" className="flex items-center gap-2">
            <span className="hidden sm:inline">Back to Study</span>
            </Link>
            <BookOpen className="w-4 h-4 sm:hidden" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto p-4 md:p-6">
        <div className="space-y-6">
          {/* Welcome Message */}
          {!selectedGame && (
            <div className="text-center py-8">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                Take a Mental Break
              </h2>
              <p className="text-slate-400 max-w-lg mx-auto">
                Step away from your studies for a moment. Play a quick game, 
                refresh your mind, and return to learning with renewed focus.
              </p>
            </div>
          )}

          {/* Timer Toggle */}
          <div className="flex justify-center">
            <button
              onClick={() => setShowTimer(!showTimer)}
              className="text-sm text-slate-500 hover:text-blue-400 transition-colors"
            >
              {showTimer ? 'Hide Timer' : 'Show Timer'}
            </button>
          </div>

          {/* Break Timer */}
          {showTimer && (
            <div className="max-w-md mx-auto">
              <BreakTimer onTimerEnd={handleTimerEnd} />
            </div>
          )}

          {/* Game Selector */}
          <GameSelector 
            selectedGame={selectedGame} 
            onSelectGame={setSelectedGame} 
          />

          {/* Active Game */}
          {selectedGame && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white capitalize">
                  {selectedGame === 'spider' ? 'Spider Solitaire' : selectedGame}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedGame(null)}
                  className="text-slate-400 hover:text-white"
                >
                  Close Game
                </Button>
              </div>
              
              <div className="bg-slate-800/30 rounded-2xl p-4 md:p-6 border border-slate-700/50">
                {renderGame()}
              </div>
            </div>
          )}

          {/* Tips Section */}
          {!selectedGame && (
            <div className="grid md:grid-cols-3 gap-4 mt-8">
              <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mb-3">
                  <span className="text-2xl">⏱️</span>
                </div>
                <h4 className="font-semibold text-white mb-2">Time Your Break</h4>
                <p className="text-sm text-slate-400">
                  Use the 10-minute timer to keep your break productive. 
                  Short, timed breaks improve retention.
                </p>
              </div>
              
              <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center mb-3">
                  <span className="text-2xl">🧠</span>
                </div>
                <h4 className="font-semibold text-white mb-2">Cognitive Reset</h4>
                <p className="text-sm text-slate-400">
                  Games engage different brain areas, helping you return 
                  to studying with fresh perspective.
                </p>
              </div>
              
              <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center mb-3">
                  <span className="text-2xl">🎯</span>
                </div>
                <h4 className="font-semibold text-white mb-2">Stay Focused</h4>
                <p className="text-sm text-slate-400">
                  When the timer ends, wrap up your game and transition 
                  back to your study session.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>


    </GameLayout>
  );
};

export default GamesPage;