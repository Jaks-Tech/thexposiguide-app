'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RotateCw, CornerDownLeft, ArrowDown } from 'lucide-react';

type Mode = 'snake' | 'tetris';

type Props = {
  mode: Mode;
  /** Dispatch to your existing keyboard-based game logic */
  onKey: (key: string) => void;

  /** Optional: attach swipe controls to a container (e.g., the game wrapper) */
  swipeTargetRef?: React.RefObject<HTMLElement | null>;

  /** Optional: disable audio if you want */
  enableSound?: boolean;

  /** Optional: disable haptics */
  enableHaptics?: boolean;
};

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

function useAudioFeedback(enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);
  const unlockedRef = useRef(false);

  const unlock = useCallback(async () => {
    if (!enabled) return;
    try {
      if (!ctxRef.current) ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (ctxRef.current.state === 'suspended') await ctxRef.current.resume();
      unlockedRef.current = true;
    } catch {
      // ignore
    }
  }, [enabled]);

  const beep = useCallback(
    (freq = 420, ms = 24, gain = 0.025) => {
      if (!enabled) return;
      const ctx = ctxRef.current;
      if (!ctx || !unlockedRef.current) return;

      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = freq;
      g.gain.value = gain;
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      setTimeout(() => {
        o.stop();
        o.disconnect();
        g.disconnect();
      }, ms);
    },
    [enabled]
  );

  return { unlock, beep };
}

export default function MobileGamepadDock({
  mode,
  onKey,
  swipeTargetRef,
  enableSound = true,
  enableHaptics = true,
}: Props) {
  // only mobile
  const isClient = typeof window !== 'undefined';
  const isCoarsePointer = isClient ? window.matchMedia?.('(pointer: coarse)')?.matches : false;

  const showDock = isClient && isCoarsePointer;

  const { unlock, beep } = useAudioFeedback(enableSound && showDock);

  const vibrate = useCallback(
    (ms = 10) => {
      if (!enableHaptics || !showDock) return;
      if (navigator.vibrate) navigator.vibrate(ms);
    },
    [enableHaptics, showDock]
  );

  const fire = useCallback(
    (key: string, soundFreq = 420) => {
      // blur any focused button so games listening to keydown are consistent
      (document.activeElement as HTMLElement | null)?.blur?.();
      onKey(key);
      vibrate(10);
      beep(soundFreq, 22, 0.02);
    },
    [onKey, vibrate, beep]
  );

  /**
   * ─────────────────────────────────────────────────────────────
   * Swipe gestures (Snake)
   * ─────────────────────────────────────────────────────────────
   * Attach to your game wrapper so user can swipe anywhere
   */
  useEffect(() => {
    if (!showDock) return;
    if (mode !== 'snake') return;
    const el = swipeTargetRef?.current;
    if (!el) return;

    let sx = 0;
    let sy = 0;
    let active = false;

    const onStart = (e: TouchEvent) => {
      // avoid when user touches the dock itself
      if ((e.target as HTMLElement)?.closest?.('[data-gamepad-dock]')) return;
      active = true;
      sx = e.touches[0]?.clientX ?? 0;
      sy = e.touches[0]?.clientY ?? 0;
    };

    const onMove = (e: TouchEvent) => {
      if (!active) return;
      const x = e.touches[0]?.clientX ?? 0;
      const y = e.touches[0]?.clientY ?? 0;
      const dx = x - sx;
      const dy = y - sy;

      const threshold = 28; // px
      if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) return;

      // decide direction
      if (Math.abs(dx) > Math.abs(dy)) {
        fire(dx > 0 ? 'ArrowRight' : 'ArrowLeft', 520);
      } else {
        fire(dy > 0 ? 'ArrowDown' : 'ArrowUp', 520);
      }

      // reset origin so continuous swipes work
      sx = x;
      sy = y;
      e.preventDefault();
    };

    const onEnd = () => {
      active = false;
    };

    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchmove', onMove, { passive: false });
    el.addEventListener('touchend', onEnd);
    el.addEventListener('touchcancel', onEnd);

    return () => {
      el.removeEventListener('touchstart', onStart as any);
      el.removeEventListener('touchmove', onMove as any);
      el.removeEventListener('touchend', onEnd as any);
      el.removeEventListener('touchcancel', onEnd as any);
    };
  }, [showDock, mode, swipeTargetRef, fire]);

  /**
   * ─────────────────────────────────────────────────────────────
   * Circular joystick (drag to direction)
   * ─────────────────────────────────────────────────────────────
   */
  const baseRef = useRef<HTMLDivElement | null>(null);
  const [thumb, setThumb] = useState({ x: 0, y: 0 });
  const lastDirRef = useRef<string | null>(null);
  const lastFireRef = useRef(0);

  const JOY_RADIUS = 28; // thumb max offset
  const DEADZONE = 10;
  const REPEAT_MS = 110;

  const getDirFromVector = (x: number, y: number) => {
    if (Math.hypot(x, y) < DEADZONE) return null;
    if (Math.abs(x) > Math.abs(y)) return x > 0 ? 'ArrowRight' : 'ArrowLeft';
    return y > 0 ? 'ArrowDown' : 'ArrowUp';
  };

  const onJoyStart = async (e: React.TouchEvent | React.MouseEvent) => {
    await unlock(); // allow sound
    (document.activeElement as HTMLElement | null)?.blur?.();
    lastDirRef.current = null;
    lastFireRef.current = 0;
  };

  const onJoyMove = (clientX: number, clientY: number) => {
    const base = baseRef.current;
    if (!base) return;

    const r = base.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;

    const dx = clientX - cx;
    const dy = clientY - cy;

    // clamp thumb within radius
    const dist = Math.hypot(dx, dy) || 1;
    const clamped = dist > JOY_RADIUS ? JOY_RADIUS / dist : 1;

    const x = dx * clamped;
    const y = dy * clamped;

    setThumb({ x, y });

    const dir = getDirFromVector(x, y);
    const now = Date.now();

    // fire on direction change or repeat while held
    if (dir && (dir !== lastDirRef.current || now - lastFireRef.current > REPEAT_MS)) {
      fire(dir, 440);
      lastDirRef.current = dir;
      lastFireRef.current = now;
    }
  };

  const onJoyEnd = () => {
    setThumb({ x: 0, y: 0 });
    lastDirRef.current = null;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const t = e.touches[0];
    if (!t) return;
    onJoyMove(t.clientX, t.clientY);
    e.preventDefault();
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if ((e.buttons ?? 0) !== 1) return;
    onJoyMove(e.clientX, e.clientY);
  };

  const DockButtons = useMemo(() => {
    // Tetris: rotate + hard drop + soft drop
    if (mode === 'tetris') {
      return (
        <div className="flex items-center gap-3">
          <FancyButton
            label="Rotate"
            icon={<RotateCw className="w-5 h-5" />}
            onPress={() => fire('ArrowUp', 640)}
          />
          <FancyButton
            label="Drop"
            icon={<CornerDownLeft className="w-5 h-5" />}
            onPress={() => fire('Space', 720)} // assumes hard drop is Space
          />
          <FancyButton
            label="Down"
            icon={<ArrowDown className="w-5 h-5" />}
            onPress={() => fire('ArrowDown', 520)}
            holdRepeat
            onKeyHold={() => fire('ArrowDown', 520)}
          />
        </div>
      );
    }

    // Snake: optional quick buttons (none required; swipe + joystick is enough)
    return (
      <div className="text-xs text-slate-300/80">
        Swipe on the game area or use the joystick.
      </div>
    );
  }, [mode, fire]);

  if (!showDock) return null;

  return (
    <div
      data-gamepad-dock
      className="
        md:hidden
        mt-5
        w-full
        rounded-2xl
        border border-white/10
        bg-black/20
        backdrop-blur-xl
        shadow-[0_0_40px_rgba(99,102,241,0.22)]
        p-4
      "
      onTouchStart={unlock}
      onMouseDown={unlock}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Joystick */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div
              ref={baseRef}
              className="
                relative
                w-[92px] h-[92px]
                rounded-full
                bg-gradient-to-br from-indigo-500/20 to-purple-500/20
                border border-indigo-400/25
                shadow-[0_0_28px_rgba(168,85,247,0.25)]
                overflow-hidden
                touch-none
              "
              onTouchStart={onJoyStart as any}
              onTouchMove={onTouchMove}
              onTouchEnd={onJoyEnd}
              onTouchCancel={onJoyEnd}
              onMouseDown={onJoyStart as any}
              onMouseMove={onMouseMove}
              onMouseUp={onJoyEnd}
              onMouseLeave={onJoyEnd}
            >
              {/* inner glow */}
              <div className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.25),transparent_55%)]" />

              {/* thumb */}
              <div
                className="
                  absolute left-1/2 top-1/2
                  w-[44px] h-[44px]
                  -translate-x-1/2 -translate-y-1/2
                  rounded-full
                  bg-white/10
                  border border-white/20
                  backdrop-blur-xl
                  shadow-[0_0_25px_rgba(99,102,241,0.45)]
                  transition-transform duration-75
                "
                style={{ transform: `translate(calc(-50% + ${thumb.x}px), calc(-50% + ${thumb.y}px))` }}
              />
            </div>
            <div className="mt-2 text-center text-[11px] text-slate-300/70">Move</div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-2">
            <div className="text-[11px] text-slate-300/70">Actions</div>
            {DockButtons}
          </div>
        </div>

        {/* Right side helper */}
        <div className="hidden xs:block text-right">
          <div className="text-[11px] text-slate-300/70">Tip</div>
          <div className="text-xs text-slate-200/80 leading-snug">
            Rotate your phone for a bigger play area.
          </div>
        </div>
      </div>
    </div>
  );
}

function FancyButton({
  label,
  icon,
  onPress,
  holdRepeat,
  onKeyHold,
}: {
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
  holdRepeat?: boolean;
  onKeyHold?: () => void;
}) {
  const tRef = useRef<number | null>(null);
  const iRef = useRef<number | null>(null);

  const start = () => {
    onPress();

    if (!holdRepeat || !onKeyHold) return;

    tRef.current = window.setTimeout(() => {
      iRef.current = window.setInterval(() => onKeyHold(), 90);
    }, 160);
  };

  const stop = () => {
    if (tRef.current) window.clearTimeout(tRef.current);
    if (iRef.current) window.clearInterval(iRef.current);
    tRef.current = null;
    iRef.current = null;
  };

  return (
    <button
      className="
        group
        w-[72px] h-[56px]
        rounded-2xl
        bg-gradient-to-br from-indigo-500/20 to-purple-500/20
        border border-indigo-400/25
        backdrop-blur-xl
        shadow-[0_0_22px_rgba(99,102,241,0.25)]
        active:scale-95
        transition-all
        flex flex-col items-center justify-center
        gap-1
        touch-none
      "
      onTouchStart={(e) => {
        e.preventDefault();
        start();
      }}
      onTouchEnd={(e) => {
        e.preventDefault();
        stop();
      }}
      onTouchCancel={stop}
      onMouseDown={start}
      onMouseUp={stop}
      onMouseLeave={stop}
    >
      <span className="text-white/90 group-active:text-indigo-200 transition">{icon}</span>
      <span className="text-[10px] text-slate-200/80">{label}</span>
    </button>
  );
}