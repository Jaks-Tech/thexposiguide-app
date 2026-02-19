export type GameType = 'snake' | 'tetris' | 'spider' | 'memory';

export interface GameOption {
  id: GameType;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface Position {
  x: number;
  y: number;
}

export interface SnakeState {
  snake: Position[];
  food: Position;
  direction: Position;
  score: number;
  gameOver: boolean;
  speed: number;
}

export interface TetrisPiece {
  shape: number[][];
  color: string;
  x: number;
  y: number;
}

export interface TetrisState {
  board: number[][];
  currentPiece: TetrisPiece | null;
  score: number;
  gameOver: boolean;
  level: number;
}

export interface Card {
  id: number;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export interface MemoryState {
  cards: Card[];
  flippedCards: number[];
  matchedPairs: number;
  moves: number;
  gameWon: boolean;
}

export interface SpiderCard {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank: number;
  faceUp: boolean;
  id: string;
}

export interface SpiderState {
  tableau: SpiderCard[][];
  stock: SpiderCard[];
  completed: number;
  score: number;
}