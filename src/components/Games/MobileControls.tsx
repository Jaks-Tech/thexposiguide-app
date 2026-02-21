'use client';

import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface Props {
  onKeyPress: (key: string) => void;
}

const MobileControls: React.FC<Props> = ({ onKeyPress }) => {
  const handlePress = (key: string) => {
    onKeyPress(key);
  };

  const Button = ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick: () => void;
  }) => (
    <button
      onTouchStart={onClick}
      onClick={onClick}
      className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center active:scale-95 transition"
    >
      {children}
    </button>
  );

  return (
    <div className="flex flex-col items-center gap-3 mt-6 md:hidden">
      <Button onClick={() => handlePress('ArrowUp')}>
        <ArrowUp />
      </Button>

      <div className="flex gap-6">
        <Button onClick={() => handlePress('ArrowLeft')}>
          <ArrowLeft />
        </Button>

        <Button onClick={() => handlePress('ArrowDown')}>
          <ArrowDown />
        </Button>

        <Button onClick={() => handlePress('ArrowRight')}>
          <ArrowRight />
        </Button>
      </div>
    </div>
  );
};

export default MobileControls;