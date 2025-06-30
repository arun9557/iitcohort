'use client';

import dynamic from 'next/dynamic';

// Dynamically import Excalidraw for Next.js SSR compatibility
const Excalidraw = dynamic(
  () => import('@excalidraw/excalidraw').then(mod => mod.Excalidraw),
  { ssr: false }
);

export default function Whiteboard() {
  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <Excalidraw />
    </div>
  );
} 