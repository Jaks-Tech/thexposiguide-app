'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, Trophy } from 'lucide-react';

interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank: number;
  faceUp: boolean;
  id: string;
}

interface Column {
  cards: Card[];
}

const RANKS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

const getSuitColor = (suit: Card['suit']): string => {
  return suit === 'hearts' || suit === 'diamonds' ? 'text-red-500' : 'text-slate-300';
};

const getSuitSymbol = (suit: Card['suit']): string => {
  switch (suit) {
    case 'hearts': return '♥';
    case 'diamonds': return '♦';
    case 'clubs': return '♣';
    case 'spades': return '♠';
  }
};

const getRankDisplay = (rank: number): string => {
  switch (rank) {
    case 1: return 'A';
    case 11: return 'J';
    case 12: return 'Q';
    case 13: return 'K';
    default: return rank.toString();
  }
};

const SpiderSolitaire: React.FC = () => {
  const [columns, setColumns] = useState<Column[]>([]);
  const [stock, setStock] = useState<Card[]>([]);
  const [completed, setCompleted] = useState<number>(0);
  const [score, setScore] = useState<number>(500);
  const [selectedCard, setSelectedCard] = useState<{ colIndex: number; cardIndex: number } | null>(null);
  const [gameWon, setGameWon] = useState<boolean>(false);
  const [moves, setMoves] = useState<number>(0);

  const createDeck = useCallback((): Card[] => {
    const deck: Card[] = [];
    const suit = 'spades';
    
    for (let d = 0; d < 2; d++) {
      for (const rank of RANKS) {
        for (let s = 0; s < 4; s++) {
          deck.push({
            suit,
            rank,
            faceUp: false,
            id: `${suit}-${rank}-${d}-${s}-${Math.random().toString(36).substr(2, 9)}`
          });
        }
      }
    }
    
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    
    return deck;
  }, []);

  const initGame = useCallback(() => {
    const deck = createDeck();
    const newColumns: Column[] = [];
    
    for (let col = 0; col < 10; col++) {
      const cards: Card[] = [];
      const numCards = col < 4 ? 6 : 5;
      
      for (let i = 0; i < numCards; i++) {
        const card = deck.pop()!;
        card.faceUp = i === numCards - 1;
        cards.push(card);
      }
      
      newColumns.push({ cards });
    }
    
    setColumns(newColumns);
    setStock(deck);
    setCompleted(0);
    setScore(500);
    setSelectedCard(null);
    setGameWon(false);
    setMoves(0);
  }, [createDeck]);

  const checkCompletedSequence = useCallback((cols: Column[]): { newColumns: Column[]; completedCount: number } => {
    let completedCount = 0;
    const newColumns = cols.map(col => {
      const cards = [...col.cards];
      
      if (cards.length >= 13) {
        const last13 = cards.slice(-13);
        const isSequence = last13.every((card, i) => {
          if (!card.faceUp) return false;
          return card.rank === 13 - i;
        });
        
        if (isSequence) {
          cards.splice(-13);
          if (cards.length > 0) {
            cards[cards.length - 1].faceUp = true;
          }
          completedCount++;
        }
      }
      
      return { cards };
    });
    
    return { newColumns, completedCount };
  }, []);

  const handleCardClick = useCallback((colIndex: number, cardIndex: number) => {
    if (gameWon) return;
    
    const col = columns[colIndex];
    const card = col.cards[cardIndex];
    
    if (!card.faceUp) return;
    
    if (!selectedCard) {
      const canSelect = cardIndex === col.cards.length - 1 || 
        col.cards.slice(cardIndex).every((c, i, arr) => {
          if (i === 0) return true;
          return c.rank === arr[i - 1].rank - 1;
        });
      
      if (canSelect) {
        setSelectedCard({ colIndex, cardIndex });
      }
      return;
    }
    
    if (selectedCard.colIndex === colIndex && selectedCard.cardIndex === cardIndex) {
      setSelectedCard(null);
      return;
    }
    
    const sourceCol = columns[selectedCard.colIndex];
    const cardsToMove = sourceCol.cards.slice(selectedCard.cardIndex);
    const topCard = cardsToMove[0];
    
    const targetCol = columns[colIndex];
    const targetCard = targetCol.cards[targetCol.cards.length - 1];
    
    const canPlace = !targetCard || targetCard.rank === topCard.rank + 1;
    
    if (canPlace) {
      const newColumns = columns.map((c, i) => {
        if (i === selectedCard.colIndex) {
          const newCards = c.cards.slice(0, selectedCard.cardIndex);
          if (newCards.length > 0) {
            newCards[newCards.length - 1].faceUp = true;
          }
          return { cards: newCards };
        }
        if (i === colIndex) {
          return { cards: [...c.cards, ...cardsToMove] };
        }
        return c;
      });
      
      const { newColumns: checkedColumns, completedCount } = checkCompletedSequence(newColumns);
      
      setColumns(checkedColumns);
      setCompleted(prev => prev + completedCount);
      setScore(prev => prev + 10 + (completedCount * 100));
      setMoves(prev => prev + 1);
      
      if (completed + completedCount === 8) {
        setGameWon(true);
      }
    }
    
    setSelectedCard(null);
  }, [columns, selectedCard, gameWon, completed, checkCompletedSequence]);

  const dealFromStock = useCallback(() => {
    if (stock.length < 10 || gameWon) return;
    
    const newStock = [...stock];
    const newColumns = columns.map(col => {
      if (newStock.length > 0) {
        const card = newStock.pop()!;
        card.faceUp = true;
        return { cards: [...col.cards, card] };
      }
      return col;
    });
    
    const { newColumns: checkedColumns, completedCount } = checkCompletedSequence(newColumns);
    
    setColumns(checkedColumns);
    setStock(newStock);
    setScore(prev => prev - 10);
    setMoves(prev => prev + 1);
    
    if (completed + completedCount === 8) {
      setGameWon(true);
    }
  }, [stock, columns, gameWon, completed, checkCompletedSequence]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex gap-4 mb-4 flex-wrap justify-center">
        <div className="flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700">
          <Trophy className="w-4 h-4 text-yellow-500" />
          <span className="text-slate-400 text-sm">Score:</span>
          <span className="text-white font-mono font-bold">{score}</span>
        </div>
        <div className="flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700">
          <span className="text-slate-400 text-sm">Completed:</span>
          <span className="text-green-400 font-mono font-bold">{completed}/8</span>
        </div>
        <div className="flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700">
          <span className="text-slate-400 text-sm">Moves:</span>
          <span className="text-blue-400 font-mono font-bold">{moves}</span>
        </div>
        <div className="flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700">
          <span className="text-slate-400 text-sm">Stock:</span>
          <span className="text-purple-400 font-mono font-bold">{stock.length}</span>
        </div>
      </div>

      <div className="relative bg-slate-800/30 p-4 rounded-xl border-2 border-slate-700">
        <div className="flex gap-1 md:gap-2 justify-center">
          {columns.map((col, colIndex) => (
            <div 
              key={colIndex} 
              className="flex flex-col items-center min-w-[40px] md:min-w-[50px]"
            >
              {col.cards.map((card, cardIndex) => (
                <div
                  key={card.id}
                  onClick={() => handleCardClick(colIndex, cardIndex)}
                  className={`
                    w-[40px] h-[56px] md:w-[50px] md:h-[70px] rounded-md cursor-pointer
                    transition-all duration-200 -mt-[42px] md:-mt-[52px] first:mt-0
                    ${card.faceUp 
                      ? 'bg-white shadow-md' 
                      : 'bg-gradient-to-br from-blue-600 to-blue-800 shadow-md'
                    }
                    ${selectedCard?.colIndex === colIndex && 
                      cardIndex >= selectedCard.cardIndex && card.faceUp
                      ? 'ring-2 ring-yellow-400 transform -translate-y-1' 
                      : ''
                    }
                    ${card.faceUp ? 'hover:shadow-lg' : ''}
                  `}
                >
                  {card.faceUp && (
                    <div className={`w-full h-full flex flex-col items-center justify-center p-1 ${getSuitColor(card.suit)}`}>
                      <span className="text-[10px] md:text-xs font-bold leading-none">{getRankDisplay(card.rank)}</span>
                      <span className="text-sm md:text-lg leading-none">{getSuitSymbol(card.suit)}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="absolute -left-16 md:-left-20 top-4">
          <button
            onClick={dealFromStock}
            disabled={stock.length < 10 || gameWon}
            className={`
              w-[40px] h-[56px] md:w-[50px] md:h-[70px] rounded-md
              bg-gradient-to-br from-purple-600 to-purple-800
              shadow-md flex items-center justify-center
              transition-all duration-200
              ${stock.length >= 10 && !gameWon 
                ? 'hover:shadow-lg hover:scale-105 cursor-pointer' 
                : 'opacity-50 cursor-not-allowed'
              }
            `}
          >
            <span className="text-white text-xs font-bold">{Math.floor(stock.length / 10)}</span>
          </button>
        </div>

        {gameWon && (
          <div className="absolute inset-0 bg-slate-900/90 rounded-xl flex flex-col items-center justify-center">
            <h3 className="text-3xl font-bold text-green-500 mb-2">You Won!</h3>
            <p className="text-slate-400 mb-1">Final Score: {score}</p>
            <p className="text-slate-400 mb-4">Moves: {moves}</p>
            <Button onClick={initGame} className="bg-green-600 hover:bg-green-700">
              <RotateCcw className="w-4 h-4 mr-2" />
              Play Again
            </Button>
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <Button onClick={initGame} variant="outline" className="border-slate-600 text-slate-300">
          <RotateCcw className="w-4 h-4 mr-2" />
          New Game
        </Button>
      </div>

      <div className="mt-4 text-xs text-slate-500 text-center max-w-md">
        <p>Click a card to select, then click destination to move.</p>
        <p>Build descending sequences (K-Q-J-10-9-8-7-6-5-4-3-2-A).</p>
        <p>Click stock pile to deal more cards.</p>
      </div>
    </div>
  );
};

export default SpiderSolitaire;