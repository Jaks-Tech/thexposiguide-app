'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { Gamepad2, ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MobileGamepadDock from '@/components/Games/MobileGamepadDock';
import { motion } from 'framer-motion';

const GamesPage: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState<GameType | null>(null);
  const [showTimer] = useState<boolean>(true);

  const gameAreaRef = useRef<HTMLDivElement | null>(null);

  const handleTimerEnd = () => {
    console.log('Break time is over!');
  };

  // Smooth scroll when game opens
  useEffect(() => {
    if (selectedGame) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedGame]);

  // Dispatch keyboard events (keeps your existing game logic untouched)
  const dispatchKey = useCallback((key: string) => {
    (document.activeElement as HTMLElement | null)?.blur?.();
    window.dispatchEvent(new KeyboardEvent('keydown', { key }));
  }, []);

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

  const isArcadeGame =
    selectedGame === 'snake' || selectedGame === 'tetris';

  return (
    <GameLayout>
      <div className="flex flex-col w-full bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1e293b] text-white relative">
        {/* Glow Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.25),transparent_40%),radial-gradient(circle_at_70%_60%,rgba(168,85,247,0.25),transparent_40%)] pointer-events-none" />

        {/* Header */}
        <header className="relative z-10 w-full px-4 sm:px-6 py-5 sm:py-6">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Gamepad2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-semibold">
                  The XPosiGuide
                </h1>
                <p className="text-xs text-slate-400">
                  Focus Reset Zone
                </p>
              </div>
            </div>

            <Link href="/projections-studio">
              <Button
                variant="outline"
                className="rounded-2xl border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>
        </header>

        {/* Main */}
        <main className="relative z-10 flex-1 max-w-6xl mx-auto px-4 sm:px-6 pb-20 w-full">
          {/* Hero */}
          {!selectedGame && (
            <div className="text-center mt-10 mb-16">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4"
              >
                Recharge Your Brain
              </motion.h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                Take a structured mental reset. Play a quick game and return sharper.
              </p>
            </div>
          )}

          {/* Timer */}
          {showTimer && !selectedGame && (
            <div className="max-w-xl mx-auto mb-16">
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl">
                <BreakTimer onTimerEnd={handleTimerEnd} />
              </div>
            </div>
          )}

          {/* Game Selector */}
          {!selectedGame && (
            <div className="mb-16">
              <GameSelector
                selectedGame={selectedGame}
                onSelectGame={setSelectedGame}
              />
            </div>
          )}

          {/* Active Game */}
          {selectedGame && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl sm:text-2xl font-semibold capitalize">
                  {selectedGame === 'spider'
                    ? 'Spider Solitaire'
                    : selectedGame}
                </h3>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedGame(null)}
                  className="text-slate-300 hover:text-white"
                >
                  Close
                </Button>
              </div>

              {/* Game Area */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl overflow-hidden">
                <div
                  ref={gameAreaRef}
                  className="w-full flex justify-center"
                >
                  <div className="origin-top scale-[0.78] min-[420px]:scale-[0.85] sm:scale-[0.92] md:scale-100">
                    {renderGame()}
                  </div>
                </div>

                {/* 🚀 Arcade Dock */}
                {isArcadeGame && (
                  <MobileGamepadDock
                    mode={selectedGame as 'snake' | 'tetris'}
                    onKey={dispatchKey}
                    swipeTargetRef={gameAreaRef}
                  />
                )}
              </div>

              {!isArcadeGame && (
                <p className="mt-4 text-center text-xs text-slate-400">
                  Rotate your phone for a bigger play area.
                </p>
              )}
            </div>
          )}

          {/* Smart Studying */}
          {!selectedGame && (
            <div className="text-center mt-20">
              <div className="inline-flex items-center gap-2 text-indigo-400 mb-4">
                <Sparkles className="w-5 h-5" />
                <span className="uppercase tracking-wider text-sm">
                  Smart Studying
                </span>
              </div>
              <p className="text-slate-400 max-w-xl mx-auto">
                Short, structured breaks improve retention and reduce burnout.
              </p>
            </div>
          )}
        </main>
      </div>
    </GameLayout>
  );
};

export default GamesPage;