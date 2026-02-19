'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, Trophy, RotateCw } from 'lucide-react';

const TETROMINOES = {
  I: {
    shape: [[1, 1, 1, 1]],
    color: '#06b6d4'
  },
  O: {
    shape: [
      [1, 1],
      [1, 1]
    ],
    color: '#eab308'
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1]
    ],
    color: '#a855f7'
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0]
    ],
    color: '#22c55e'
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1]
    ],
    color: '#ef4444'
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1]
    ],
    color: '#3b82f6'
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1]
    ],
    color: '#f97316'
  }
};

type TetrominoType = keyof typeof TETROMINOES;

interface Piece {
  type: TetrominoType;
  shape: number[][];
  color: string;
  x: number;
  y: number;
}

const BOARD_WIDTH = 15;
const BOARD_HEIGHT = 20;
const CELL_SIZE = 25;
const CANVAS_WIDTH = BOARD_WIDTH * CELL_SIZE;
const CANVAS_HEIGHT = BOARD_HEIGHT * CELL_SIZE;

const TetrisGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const boardRef = useRef<(string | 0)[][]>(
    Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0))
  );
  const currentPieceRef = useRef<Piece | null>(null);

  const [board, setBoard] = useState<(string | 0)[][]>(
    Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0))
  );
  const [currentPiece, setCurrentPiece] = useState<Piece | null>(null);
  const [score, setScore] = useState<number>(0);
  const [lines, setLines] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [highScore, setHighScore] = useState<number>(0);

  const createPiece = useCallback((): Piece => {
    const types = Object.keys(TETROMINOES) as TetrominoType[];
    const type = types[Math.floor(Math.random() * types.length)];
    const tetromino = TETROMINOES[type];
    return {
      type,
      shape: tetromino.shape.map(row => [...row]),
      color: tetromino.color,
      x: Math.floor(BOARD_WIDTH / 2) - Math.floor(tetromino.shape[0].length / 2),
      y: 0
    };
  }, []);

  const checkCollision = useCallback((piece: Piece, boardState: (string | 0)[][]): boolean => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const newX = piece.x + x;
          const newY = piece.y + y;
          
          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
            return true;
          }
          
          if (newY >= 0 && boardState[newY][newX] !== 0) {
            return true;
          }
        }
      }
    }
    return false;
  }, []);

  const rotatePiece = useCallback((piece: Piece): Piece => {
    const rotated = piece.shape[0].map((_, i) =>
      piece.shape.map(row => row[i]).reverse()
    );
    return { ...piece, shape: rotated };
  }, []);

  // FIXED: Now stores the piece's color instead of just 1
  const mergePiece = useCallback((piece: Piece, boardState: (string | 0)[][]): (string | 0)[][] => {
    const newBoard = boardState.map(row => [...row]);
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const boardY = piece.y + y;
          const boardX = piece.x + x;
          if (boardY >= 0) {
            newBoard[boardY][boardX] = piece.color; // Store color, not just 1
          }
        }
      }
    }
    return newBoard;
  }, []);

  // FIXED: Now checks for cells that are not 0 (empty)
  const clearLines = useCallback((boardState: (string | 0)[][]): { board: (string | 0)[][]; linesCleared: number } => {
    // Keep only rows that have at least one empty cell (0)
    const newBoard = boardState.filter(row => row.some(cell => cell === 0));
    const linesCleared = BOARD_HEIGHT - newBoard.length;
    
    // Add new empty rows at the top
    while (newBoard.length < BOARD_HEIGHT) {
      newBoard.unshift(Array(BOARD_WIDTH).fill(0));
    }
    
    return { board: newBoard, linesCleared };
  }, []);

  const resetGame = useCallback(() => {
    const newBoard = Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0));
    boardRef.current = newBoard;
    setBoard(newBoard);
    const piece = createPiece();
    currentPieceRef.current = piece;
    setCurrentPiece(piece);
    setScore(0);
    setLines(0);
    setLevel(1);
    setGameOver(false);
    setIsPaused(false);
  }, [createPiece]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver || !currentPieceRef.current) return;

      const piece = currentPieceRef.current;
      let newPiece = { ...piece };

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          newPiece.x -= 1;
          if (!checkCollision(newPiece, boardRef.current)) {
            currentPieceRef.current = newPiece;
            setCurrentPiece(newPiece);
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          newPiece.x += 1;
          if (!checkCollision(newPiece, boardRef.current)) {
            currentPieceRef.current = newPiece;
            setCurrentPiece(newPiece);
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          newPiece.y += 1;
          if (!checkCollision(newPiece, boardRef.current)) {
            currentPieceRef.current = newPiece;
            setCurrentPiece(newPiece);
          }
          break;
        case 'ArrowUp':
        case ' ':
          e.preventDefault();
          const rotated = rotatePiece(piece);
          if (!checkCollision(rotated, boardRef.current)) {
            currentPieceRef.current = rotated;
            setCurrentPiece(rotated);
          }
          break;
        case 'p':
        case 'P':
          setIsPaused(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver, checkCollision, rotatePiece]);

  useEffect(() => {
    if (gameOver || isPaused) {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
      return;
    }

    if (!currentPieceRef.current) {
      const piece = createPiece();
      currentPieceRef.current = piece;
      setCurrentPiece(piece);
    }

    const speed = Math.max(100, 1000 - (level - 1) * 100);

    gameLoopRef.current = setInterval(() => {
      const piece = currentPieceRef.current;
      if (!piece) return;

      const newPiece = { ...piece, y: piece.y + 1 };

      if (checkCollision(newPiece, boardRef.current)) {
        // Piece landed - merge it to board
        const mergedBoard = mergePiece(piece, boardRef.current);
        
        // Clear completed lines
        const { board: clearedBoard, linesCleared } = clearLines(mergedBoard);
        
        boardRef.current = clearedBoard;
        setBoard(clearedBoard);
        
        if (linesCleared > 0) {
          setLines(prevLines => prevLines + linesCleared);
          setScore(prevScore => prevScore + linesCleared * 100 * level);
          setLevel(() => Math.floor((lines + linesCleared) / 10) + 1);
        }

        // Create new piece
        const nextPiece = createPiece();
        if (checkCollision(nextPiece, clearedBoard)) {
          setGameOver(true);
          setHighScore(prev => Math.max(prev, score));
        } else {
          currentPieceRef.current = nextPiece;
          setCurrentPiece(nextPiece);
        }
      } else {
        currentPieceRef.current = newPiece;
        setCurrentPiece(newPiece);
      }
    }, speed);

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameOver, isPaused, level, lines, score, createPiece, checkCollision, mergePiece, clearLines]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let i = 0; i <= BOARD_WIDTH; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let i = 0; i <= BOARD_HEIGHT; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(CANVAS_WIDTH, i * CELL_SIZE);
      ctx.stroke();
    }

    // Draw board - FIXED: uses the stored color
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        const cell = board[y][x];
        if (cell !== 0) {
          ctx.fillStyle = cell; // cell is now the color string
          ctx.shadowColor = cell;
          ctx.shadowBlur = 5;
          ctx.fillRect(x * CELL_SIZE + 1, y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
          ctx.shadowBlur = 0;
        }
      }
    }

    // Draw current piece
    if (currentPiece) {
      ctx.fillStyle = currentPiece.color;
      ctx.shadowColor = currentPiece.color;
      ctx.shadowBlur = 10;
      
      for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
          if (currentPiece.shape[y][x]) {
            ctx.fillRect(
              (currentPiece.x + x) * CELL_SIZE + 1,
              (currentPiece.y + y) * CELL_SIZE + 1,
              CELL_SIZE - 2,
              CELL_SIZE - 2
            );
          }
        }
      }
      
      ctx.shadowBlur = 0;
    }
  }, [board, currentPiece]);

  return (
    <div className="flex flex-col items-center">
      <div className="flex gap-4 mb-4 flex-wrap justify-center">
        <div className="flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700">
          <Trophy className="w-4 h-4 text-yellow-500" />
          <span className="text-slate-400 text-sm">Score:</span>
          <span className="text-white font-mono font-bold">{score}</span>
        </div>
        <div className="flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700">
          <span className="text-slate-400 text-sm">Lines:</span>
          <span className="text-cyan-400 font-mono font-bold">{lines}</span>
        </div>
        <div className="flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700">
          <span className="text-slate-400 text-sm">Level:</span>
          <span className="text-purple-400 font-mono font-bold">{level}</span>
        </div>
        <div className="flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700">
          <span className="text-slate-400 text-sm">Best:</span>
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
            <p className="text-slate-400 mb-1">Final Score: {score}</p>
            <p className="text-slate-400 mb-4">Lines Cleared: {lines}</p>
            <Button onClick={resetGame} className="bg-blue-600 hover:bg-blue-700">
              <RotateCcw className="w-4 h-4 mr-2" />
              Play Again
            </Button>
          </div>
        )}

        {isPaused && !gameOver && (
          <div className="absolute inset-0 bg-slate-900/80 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-blue-400 mb-2">Paused</h3>
              <p className="text-slate-400 text-sm">Press P to resume</p>
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
        <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
          <span>← → Move</span>
          <span>↓ Soft Drop</span>
          <span className="flex items-center gap-1"><RotateCw className="w-3 h-3" /> Rotate</span>
          <span>P Pause</span>
        </div>
      </div>
    </div>
  );
};

export default TetrisGame;