// src/components/GameLayout.tsx
'use client';

import React from 'react';

export default function GameLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full flex-1 flex flex-col bg-slate-950 text-white overflow-x-hidden">
      
      {/* Background Layers */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        {/* Page specific glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* Content wrapper - flex-1 ensures it pushes the footer down */}
      <div className="relative z-10 flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}