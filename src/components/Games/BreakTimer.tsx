'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BreakTimerProps {
  onTimerEnd?: () => void;
}

const BreakTimer: React.FC<BreakTimerProps> = ({ onTimerEnd }) => {
  const [timeLeft, setTimeLeft] = useState<number>(10 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = useCallback(() => {
    setIsRunning(true);
    setIsCompleted(false);
  }, []);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(10 * 60);
    setIsCompleted(false);
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      setIsCompleted(true);
      onTimerEnd?.();
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, timeLeft, onTimerEnd]);

  const progress = ((10 * 60 - timeLeft) / (10 * 60)) * 100;

  return (
    <div className="w-full max-w-md mx-auto">
      <div className={`
        relative p-6 rounded-2xl border-2 transition-all duration-300
        ${isCompleted 
          ? 'border-green-500 bg-green-500/10' 
          : isRunning 
            ? 'border-blue-500 bg-blue-500/10' 
            : 'border-slate-700 bg-slate-800/50'
        }
      `}>
        <div className="flex items-center justify-center gap-2 mb-4">
          <Clock className={`w-5 h-5 ${isRunning ? 'text-blue-400' : 'text-slate-400'}`} />
          <span className="text-sm font-medium text-slate-400">Break Timer</span>
        </div>

        <div className="text-center mb-6">
          <div className={`
            text-5xl font-mono font-bold tracking-wider
            ${isCompleted ? 'text-green-400' : isRunning ? 'text-blue-400' : 'text-slate-300'}
          `}>
            {formatTime(timeLeft)}
          </div>
          <p className="text-sm text-slate-500 mt-2">
            {isCompleted 
              ? 'Break Over — Back to Revision!' 
              : isRunning 
                ? 'Take a breather...' 
                : '10-minute break counter'
            }
          </p>
        </div>

        <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden mb-6">
          <div 
            className={`
              h-full transition-all duration-1000 ease-linear
              ${isCompleted ? 'bg-green-500' : isRunning ? 'bg-blue-500' : 'bg-slate-500'}
            `}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex justify-center gap-3">
          {!isRunning ? (
            <Button
              onClick={startTimer}
              disabled={isCompleted}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6"
            >
              <Play className="w-4 h-4 mr-2" />
              Start
            </Button>
          ) : (
            <Button
              onClick={pauseTimer}
              variant="outline"
              className="border-blue-500 text-blue-400 hover:bg-blue-500/10 px-6"
            >
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </Button>
          )}
          
          <Button
            onClick={resetTimer}
            variant="outline"
            className="border-slate-600 text-slate-400 hover:bg-slate-700"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>

        {isCompleted && (
          <div className="mt-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-center">
            <p className="text-green-400 font-medium">Time to get back to studying!</p>
            <Button 
              onClick={resetTimer}
              className="mt-2 bg-green-600 hover:bg-green-700 text-white text-sm"
            >
              Start Another Break
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BreakTimer;