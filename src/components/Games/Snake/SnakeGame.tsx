'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, Trophy } from 'lucide-react';

interface Position {
  x: number;
  y: number;
}

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const CANVAS_WIDTH = GRID_SIZE * CELL_SIZE;
const CANVAS_HEIGHT = GRID_SIZE * CELL_SIZE;

// --- SPEED SETTINGS ---
const INITIAL_SPEED = 400; // Starting interval (ms). Higher is slower.
const MIN_SPEED = 60;     // Fastest the game can go.
const SPEED_INCREMENT = 1; // How many ms to subtract per fruit eaten. 
                           // (Since score adds 10, total reduction per fruit = 20ms)

const SnakeGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const directionRef = useRef<Position>({ x: 1, y: 0 });
  
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [, setDirection] = useState<Position>({ x: 1, y: 0 });
  const [score, setScore] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [highScore, setHighScore] = useState<number>(0);

  const generateFood = useCallback((currentSnake: Position[]): Position => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
    } while (currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, []);

  const resetGame = useCallback(() => {
    const initialSnake = [{ x: 10, y: 10 }];
    setSnake(initialSnake);
    setFood(generateFood(initialSnake));
    setDirection({ x: 1, y: 0 });
    directionRef.current = { x: 1, y: 0 };
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
  }, [generateFood]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver) return;
      
      const keyMap: { [key: string]: Position } = {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 }
      };

      if (keyMap[e.key]) {
        e.preventDefault();
        const newDirection = keyMap[e.key];
        const currentDir = directionRef.current;
        
        // Prevent 180-degree turns
        if (newDirection.x !== -currentDir.x || newDirection.y !== -currentDir.y) {
          setDirection(newDirection);
          directionRef.current = newDirection;
        }
      }

      if (e.key === ' ') {
        e.preventDefault();
        setIsPaused(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver]);

  useEffect(() => {
    if (gameOver || isPaused) {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      return;
    }

    /** * GRADUAL SPEED LOGIC:
     * We subtract SPEED_INCREMENT for every fruit point.
     * Capped so it never goes faster than MIN_SPEED.
     */
    const speedReduction = score * SPEED_INCREMENT;
    const currentSpeed = Math.max(MIN_SPEED, INITIAL_SPEED - speedReduction);

    gameLoopRef.current = setInterval(() => {
      setSnake(currentSnake => {
        const newSnake = [...currentSnake];
        const head = { ...newSnake[0] };
        const currentDir = directionRef.current;
        
        head.x += currentDir.x;
        head.y += currentDir.y;

        // Wall collision
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          setGameOver(true);
          setHighScore(prev => Math.max(prev, score));
          return currentSnake;
        }

        // Self collision
        if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
          setGameOver(true);
          setHighScore(prev => Math.max(prev, score));
          return currentSnake;
        }

        newSnake.unshift(head);

        // Eating food
        if (head.x === food.x && head.y === food.y) {
          setScore(prev => prev + 10);
          setFood(generateFood(newSnake));
          // Note: When score updates, this useEffect will trigger again, 
          // restarting the interval with the new faster speed.
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, currentSpeed);

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [gameOver, isPaused, food, score, generateFood]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw Grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, CANVAS_HEIGHT);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(CANVAS_WIDTH, i * CELL_SIZE);
      ctx.stroke();
    }

    // Draw Food
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(
      food.x * CELL_SIZE + CELL_SIZE / 2,
      food.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2 - 2,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw Snake
    snake.forEach((segment, index) => {
      const isHead = index === 0;
      ctx.fillStyle = isHead ? '#22c55e' : '#16a34a';
      ctx.shadowColor = '#22c55e';
      ctx.shadowBlur = isHead ? 10 : 5;
      
      ctx.fillRect(
        segment.x * CELL_SIZE + 1,
        segment.y * CELL_SIZE + 1,
        CELL_SIZE - 2,
        CELL_SIZE - 2
      );
      
      ctx.shadowBlur = 0;

      if (isHead) {
        ctx.fillStyle = '#ffffff';
        const eyeSize = 3;
        const eyeOffset = 5;
        ctx.fillRect(
          segment.x * CELL_SIZE + eyeOffset,
          segment.y * CELL_SIZE + eyeOffset,
          eyeSize,
          eyeSize
        );
        ctx.fillRect(
          segment.x * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize,
          segment.y * CELL_SIZE + eyeOffset,
          eyeSize,
          eyeSize
        );
      }
    });
  }, [snake, food]);

  return (
    <div className="flex flex-col items-center">
      <div className="flex gap-6 mb-4">
        <div className="flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700">
          <Trophy className="w-4 h-4 text-yellow-500" />
          <span className="text-slate-400 text-sm">Score:</span>
          <span className="text-white font-mono font-bold">{score}</span>
        </div>
        <div className="flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700">
          <span className="text-slate-400 text-sm">High Score:</span>
          <span className="text-yellow-400 font-mono font-bold">{highScore}</span>
        </div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="rounded-xl border-2 border-slate-700 shadow-lg shadow-black/50"
        />
        
        {gameOver && (
          <div className="absolute inset-0 bg-slate-900/90 rounded-xl flex flex-col items-center justify-center">
            <h3 className="text-3xl font-bold text-red-500 mb-2">Game Over!</h3>
            <p className="text-slate-400 mb-4">Final Score: {score}</p>
            <Button onClick={resetGame} className="bg-green-600 hover:bg-green-700">
              <RotateCcw className="w-4 h-4 mr-2" />
              Play Again
            </Button>
          </div>
        )}

        {isPaused && !gameOver && (
          <div className="absolute inset-0 bg-slate-900/80 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-blue-400 mb-2">Paused</h3>
              <p className="text-slate-400 text-sm">Press SPACE to resume</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-col items-center gap-2">
        <div className="flex gap-2">
          <Button
            onClick={() => setIsPaused(!isPaused)}
            disabled={gameOver}
            variant="outline"
            className="border-slate-600 text-slate-300"
          >
            {isPaused ? 'Resume' : 'Pause'}
          </Button>
          <Button onClick={resetGame} variant="outline" className="border-slate-600 text-slate-300">
            <RotateCcw className="w-4 h-4 mr-2" />
            Restart
          </Button>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Use Arrow Keys to move • SPACE to pause
        </p>
      </div>
    </div>
  );
};

export default SnakeGame;