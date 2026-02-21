'use client';

import React, { useRef } from 'react';
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';

interface Props {
  onKeyPress: (key: string) => void;
}

const HOLD_DELAY = 150; // delay before repeat starts
const HOLD_INTERVAL = 80; // repeat speed

const MobileControls: React.FC<Props> = ({ onKeyPress }) => {
  const holdTimeout = useRef<NodeJS.Timeout | null>(null);
  const holdInterval = useRef<NodeJS.Timeout | null>(null);

  const triggerKey = (key: string) => {
    // Optional vibration feedback
    if (navigator.vibrate) navigator.vibrate(10);

    onKeyPress(key);
  };

  const startHold = (key: string) => {
    triggerKey(key); // first press immediately

    holdTimeout.current = setTimeout(() => {
      holdInterval.current = setInterval(() => {
        triggerKey(key);
      }, HOLD_INTERVAL);
    }, HOLD_DELAY);
  };

  const stopHold = () => {
    if (holdTimeout.current) clearTimeout(holdTimeout.current);
    if (holdInterval.current) clearInterval(holdInterval.current);
  };

  const ControlButton = ({
    icon,
    direction,
  }: {
    icon: React.ReactNode;
    direction: string;
  }) => (
    <button
      onTouchStart={() => startHold(direction)}
      onTouchEnd={stopHold}
      onMouseDown={() => startHold(direction)}
      onMouseUp={stopHold}
      onMouseLeave={stopHold}
      className="
        group
        w-16 h-16
        rounded-2xl
        bg-gradient-to-br from-indigo-500/20 to-purple-500/20
        border border-indigo-400/30
        backdrop-blur-xl
        shadow-[0_0_25px_rgba(99,102,241,0.4)]
        flex items-center justify-center
        active:scale-90
        transition-all duration-150
        hover:shadow-[0_0_35px_rgba(168,85,247,0.7)]
      "
    >
      <div className="text-white group-active:text-indigo-300 transition">
        {icon}
      </div>
    </button>
  );

  return (
    <div className="flex flex-col items-center gap-4 mt-6 md:hidden select-none">
      {/* Up */}
      <ControlButton icon={<ArrowUp size={26} />} direction="ArrowUp" />

      {/* Left Down Right */}
      <div className="flex gap-6">
        <ControlButton icon={<ArrowLeft size={26} />} direction="ArrowLeft" />
        <ControlButton icon={<ArrowDown size={26} />} direction="ArrowDown" />
        <ControlButton icon={<ArrowRight size={26} />} direction="ArrowRight" />
      </div>
    </div>
  );
};

export default MobileControls;