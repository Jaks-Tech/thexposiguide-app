'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, Trophy, Clock } from 'lucide-react';

interface Card {
  id: number;
  value: string;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const CARD_VALUES = [
  { value: 'apple', emoji: '🍎' },
  { value: 'banana', emoji: '🍌' },
  { value: 'cherry', emoji: '🍒' },
  { value: 'grape', emoji: '🍇' },
  { value: 'lemon', emoji: '🍋' },
  { value: 'melon', emoji: '🍉' },
  { value: 'orange', emoji: '🍊' },
  { value: 'peach', emoji: '🍑' },
];

const MemoryGame: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [gameWon, setGameWon] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [bestMoves, setBestMoves] = useState<number | null>(null);

  const initGame = useCallback(() => {
    const cardPairs = [...CARD_VALUES, ...CARD_VALUES];
    
    for (let i = cardPairs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cardPairs[i], cardPairs[j]] = [cardPairs[j], cardPairs[i]];
    }
    
    const newCards = cardPairs.map((item, index) => ({
      id: index,
      value: item.value,
      emoji: item.emoji,
      isFlipped: false,
      isMatched: false,
    }));
    
    setCards(newCards);
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    setGameWon(false);
    setIsLocked(false);
    setTimer(0);
    setIsRunning(false);
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    
    if (isRunning && !gameWon) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, gameWon]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCardClick = useCallback((cardId: number) => {
    if (isLocked || gameWon) return;
    
    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;
    
    if (!isRunning && moves === 0) {
      setIsRunning(true);
    }
    
    const newCards = cards.map(c => 
      c.id === cardId ? { ...c, isFlipped: true } : c
    );
    setCards(newCards);
    
    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);
    
    if (newFlippedCards.length === 2) {
      setIsLocked(true);
      setMoves(prev => prev + 1);
      
      const [firstId, secondId] = newFlippedCards;
      const firstCard = cards.find(c => c.id === firstId);
      const secondCard = newCards.find(c => c.id === secondId);
      
      if (firstCard && secondCard && firstCard.value === secondCard.value) {
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === firstId || c.id === secondId 
              ? { ...c, isMatched: true } 
              : c
          ));
          setMatchedPairs(prev => {
            const newCount = prev + 1;
            if (newCount === CARD_VALUES.length) {
              setGameWon(true);
              setIsRunning(false);
              setBestTime(prevTime => {
                if (!prevTime || timer < prevTime) return timer;
                return prevTime;
              });
              setBestMoves(prevMoves => {
                const currentMoves = moves + 1;
                if (!prevMoves || currentMoves < prevMoves) return currentMoves;
                return prevMoves;
              });
            }
            return newCount;
          });
          setFlippedCards([]);
          setIsLocked(false);
        }, 500);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === firstId || c.id === secondId 
              ? { ...c, isFlipped: false } 
              : c
          ));
          setFlippedCards([]);
          setIsLocked(false);
        }, 1000);
      }
    }
  }, [cards, flippedCards, isLocked, gameWon, isRunning, moves, timer]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  return (
    <div className="flex flex-col items-center">
      <div className="flex gap-4 mb-4 flex-wrap justify-center">
        <div className="flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700">
          <Trophy className="w-4 h-4 text-yellow-500" />
          <span className="text-slate-400 text-sm">Pairs:</span>
          <span className="text-white font-mono font-bold">{matchedPairs}/{CARD_VALUES.length}</span>
        </div>
        <div className="flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700">
          <span className="text-slate-400 text-sm">Moves:</span>
          <span className="text-blue-400 font-mono font-bold">{moves}</span>
        </div>
        <div className="flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700">
          <Clock className="w-4 h-4 text-green-500" />
          <span className="text-slate-400 text-sm">Time:</span>
          <span className="text-green-400 font-mono font-bold">{formatTime(timer)}</span>
        </div>
      </div>

      {(bestTime !== null || bestMoves !== null) && (
        <div className="flex gap-4 mb-4 text-xs text-slate-500">
          {bestMoves !== null && (
            <span>Best Moves: <span className="text-yellow-400">{bestMoves}</span></span>
          )}
          {bestTime !== null && (
            <span>Best Time: <span className="text-green-400">{formatTime(bestTime)}</span></span>
          )}
        </div>
      )}

      <div className="relative">
        <div className="grid grid-cols-4 gap-3 p-4 bg-slate-800/30 rounded-xl border-2 border-slate-700">
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              disabled={isLocked || card.isFlipped || card.isMatched}
              className={`
                w-16 h-16 md:w-20 md:h-20 rounded-xl
                flex items-center justify-center
                text-3xl md:text-4xl
                transition-all duration-300 transform
                ${card.isMatched 
                  ? 'bg-green-500/20 border-2 border-green-500 cursor-default' 
                  : card.isFlipped 
                    ? 'bg-white border-2 border-blue-400' 
                    : 'bg-gradient-to-br from-blue-600 to-purple-600 border-2 border-slate-600 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/20 cursor-pointer'
                }
                ${!card.isFlipped && !card.isMatched ? 'hover:scale-105' : ''}
              `}
              style={{
                transform: card.isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                transformStyle: 'preserve-3d',
              }}
            >
              <span 
                className={`transition-opacity duration-300 ${card.isFlipped || card.isMatched ? 'opacity-100' : 'opacity-0'}`}
                style={{
                  transform: card.isFlipped ? 'rotateY(180deg)' : 'none',
                }}
              >
                {card.emoji}
              </span>
              {!card.isFlipped && !card.isMatched && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-white/10" />
                </div>
              )}
            </button>
          ))}
        </div>

        {gameWon && (
          <div className="absolute inset-0 bg-slate-900/95 rounded-xl flex flex-col items-center justify-center">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-3xl font-bold text-green-500 mb-2">You Won!</h3>
            <div className="text-center mb-4">
              <p className="text-slate-400">Moves: <span className="text-white font-bold">{moves}</span></p>
              <p className="text-slate-400">Time: <span className="text-white font-bold">{formatTime(timer)}</span></p>
            </div>
            <Button onClick={initGame} className="bg-green-600 hover:bg-green-700">
              <RotateCcw className="w-4 h-4 mr-2" />
              Play Again
            </Button>
          </div>
        )}
      </div>

      <div className="mt-4">
        <Button onClick={initGame} variant="outline" className="border-slate-600 text-slate-300">
          <RotateCcw className="w-4 h-4 mr-2" />
          New Game
        </Button>
      </div>

      <div className="mt-4 text-xs text-slate-500 text-center">
        <p>Flip cards to find matching pairs. Match all pairs to win!</p>
      </div>
    </div>
  );
};

export default MemoryGame;