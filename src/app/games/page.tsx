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
import MobileControls from '@/components/Games/MobileControls';
import { motion } from 'framer-motion';

type ControlMode = 'joystick' | 'arrows';

const GamesPage: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState<GameType | null>(null);
  const [showTimer] = useState<boolean>(true);
  const [controlMode, setControlMode] = useState<ControlMode>('joystick');
  const gameAreaRef = useRef<HTMLDivElement | null>(null);

  const handleTimerEnd = () => console.log('Break time is over!');

  useEffect(() => {
    if (selectedGame) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedGame]);

  useEffect(() => {
    if (selectedGame === 'snake' || selectedGame === 'tetris') {
      setControlMode('joystick');
    }
  }, [selectedGame]);

  const dispatchKey = useCallback((key: string) => {
    (document.activeElement as HTMLElement | null)?.blur?.();
    window.dispatchEvent(new KeyboardEvent('keydown', { key }));
  }, []);

  const renderGame = () => {
    switch (selectedGame) {
      case 'snake': return <SnakeGame />;
      case 'tetris': return <TetrisGame />;
      case 'spider': return <SpiderSolitaire />;
      case 'memory': return <MemoryGame />;
      default: return null;
    }
  };

  const isArcadeGame = selectedGame === 'snake' || selectedGame === 'tetris';

  return (
    <GameLayout>
      <div className="flex flex-col w-full bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1e293b] text-white relative min-h-full">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.25),transparent_40%),radial-gradient(circle_at_70%_60%,rgba(168,85,247,0.25),transparent_40%)] pointer-events-none" />

        <header className="relative z-10 w-full px-4 py-4 sm:py-6">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Gamepad2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base sm:text-xl font-semibold">The XPosiGuide</h1>
                <p className="text-[10px] sm:text-xs text-slate-400">Focus Reset Zone</p>
              </div>
            </div>
            <Link href="/projections-studio">
              <Button variant="outline" className="rounded-2xl border-slate-600 h-9 text-xs sm:text-sm">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
            </Link>
          </div>
        </header>

        <main className="relative z-10 flex-1 max-w-6xl mx-auto px-4 pb-10 w-full">
          {!selectedGame && (
            <>
              <div className="text-center mt-6 mb-10">
                <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl sm:text-4xl font-bold mb-2">
                  Recharge Your Brain
                </motion.h2>
                <p className="text-slate-400 text-sm max-w-md mx-auto">Short breaks improve retention.</p>
              </div>
              {showTimer && (
                <div className="max-w-md mx-auto mb-10">
                  <BreakTimer onTimerEnd={handleTimerEnd} />
                </div>
              )}
              <GameSelector selectedGame={selectedGame} onSelectGame={setSelectedGame} />
            </>
          )}

          {selectedGame && (
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold capitalize">{selectedGame}</h3>
                <Button variant="ghost" size="sm" onClick={() => setSelectedGame(null)}>Close</Button>
              </div>

              {/* Responsive Container */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-2 sm:p-6 flex flex-col items-center">
                <div ref={gameAreaRef} className="w-full flex justify-center overflow-hidden">
                  {/* AGGRESSIVE SCALING FOR MOBILE */}
                  <div className="origin-top scale-[0.65] min-[380px]:scale-[0.75] min-[440px]:scale-[0.85] sm:scale-100 transition-transform duration-300">
                    {renderGame()}
                  </div>
                </div>

                {isArcadeGame && (
                  /* NEGATIVE MARGIN on mobile to pull controls up into the space created by scaling */
                  <div className="w-full -mt-20 sm:mt-6 transition-all">
                    <div className="flex items-center justify-center mb-4">
                      <div className="inline-flex rounded-xl bg-black/40 p-1">
                        <button onClick={() => setControlMode('joystick')} className={`px-3 py-1 text-xs rounded-lg ${controlMode === 'joystick' ? 'bg-indigo-500 text-white' : 'text-slate-400'}`}>Joystick</button>
                        <button onClick={() => setControlMode('arrows')} className={`px-3 py-1 text-xs rounded-lg ${controlMode === 'arrows' ? 'bg-indigo-500 text-white' : 'text-slate-400'}`}>Arrows</button>
                      </div>
                    </div>

                    {controlMode === 'joystick' ? (
                      <MobileGamepadDock mode={selectedGame as 'snake' | 'tetris'} onKey={dispatchKey} swipeTargetRef={gameAreaRef} />
                    ) : (
                      <MobileControls onKeyPress={dispatchKey} />
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </GameLayout>
  );
};

export default GamesPage;