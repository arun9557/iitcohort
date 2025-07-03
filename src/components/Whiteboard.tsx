'use client';

import React, { useRef, useState } from 'react';

// Types for drawing objects
interface PenObject {
  type: 'pen';
  points: [number, number][];
}
interface RectObject {
  type: 'rect';
  start: [number, number];
  end: [number, number];
}
interface CircleObject {
  type: 'circle';
  start: [number, number];
  end: [number, number];
}
interface ArrowObject {
  type: 'arrow';
  start: [number, number];
  end: [number, number];
}
interface TextObject {
  type: 'text';
  pos: [number, number];
  text: string;
}
type DrawObject = PenObject | RectObject | CircleObject | ArrowObject | TextObject;

type ToolKey = 'pen' | 'rect' | 'circle' | 'arrow' | 'text' | 'eraser';

const tools = [
  { name: 'Pen', key: 'pen', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256"><path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM51.31,160l90.35-90.35,16.68,16.69L68,176.68ZM48,179.31,76.69,208H48Zm48,25.38L79.31,188l90.35-90.35h0l16.68,16.69Z" /></svg>
  ) },
  { name: 'Rectangle', key: 'rect', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256"><path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,160H40V56H216V200Z" /></svg>
  ) },
  { name: 'Circle', key: 'circle', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Z" /></svg>
  ) },
  { name: 'Arrow', key: 'arrow', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256"><path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" /></svg>
  ) },
  { name: 'Text', key: 'text', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256"><path d="M170.48,115.7A44,44,0,0,0,140,40H72a8,8,0,0,0-8,8V200a8,8,0,0,0,8,8h80a48,48,0,0,0,18.48-92.3ZM80,56h60a28,28,0,0,1,0,56H80Zm72,136H80V128h72a32,32,0,0,1,0,64Z" /></svg>
  ) },
  { name: 'Eraser', key: 'eraser', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256"><path d="M225,80.4,183.6,39a24,24,0,0,0-33.94,0L31,157.66a24,24,0,0,0,0,33.94l30.06,30.06A8,8,0,0,0,66.74,224H216a8,8,0,0,0,0-16h-84.7L225,114.34A24,24,0,0,0,225,80.4ZM108.68,208H70.05L42.33,180.28a8,8,0,0,1,0-11.31L96,115.31,148.69,168Zm105-105L160,156.69,107.31,104,161,50.34a8,8,0,0,1,11.32,0l41.38,41.38a8,8,0,0,1,0,11.31Z" /></svg>
  ) },
];

function getSvgElement(obj: DrawObject) {
  if (obj.type === 'pen') {
    return <polyline points={obj.points.map((p) => p.join(',')).join(' ')} fill="none" stroke="#222" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />;
  }
  if (obj.type === 'rect') {
    const [x, y] = obj.start;
    const [x2, y2] = obj.end;
    return <rect x={Math.min(x, x2)} y={Math.min(y, y2)} width={Math.abs(x2 - x)} height={Math.abs(y2 - y)} fill="none" stroke="#222" strokeWidth={2} rx={8} />;
  }
  if (obj.type === 'circle') {
    const [x, y] = obj.start;
    const [x2, y2] = obj.end;
    const r = Math.sqrt((x2 - x) ** 2 + (y2 - y) ** 2);
    return <circle cx={x} cy={y} r={r} fill="none" stroke="#222" strokeWidth={2} />;
  }
  if (obj.type === 'arrow') {
    const [x, y] = obj.start;
    const [x2, y2] = obj.end;
    const angle = Math.atan2(y2 - y, x2 - x);
    const headlen = 12;
    const arrowX = x2 - headlen * Math.cos(angle - Math.PI / 6);
    const arrowY = y2 - headlen * Math.sin(angle - Math.PI / 6);
    const arrowX2 = x2 - headlen * Math.cos(angle + Math.PI / 6);
    const arrowY2 = y2 - headlen * Math.sin(angle + Math.PI / 6);
    return (
      <g>
        <line x1={x} y1={y} x2={x2} y2={y2} stroke="#222" strokeWidth={2} markerEnd="url(#arrowhead)" />
        <polygon points={`${x2},${y2} ${arrowX},${arrowY} ${arrowX2},${arrowY2}`} fill="#222" />
      </g>
    );
  }
  if (obj.type === 'text') {
    return <text x={obj.pos[0]} y={obj.pos[1]} fontSize={20} fill="#222">{obj.text}</text>;
  }
  return null;
}

export default function Whiteboard() {
  const [activeTool, setActiveTool] = useState<ToolKey>('pen');
  const [drawing, setDrawing] = useState(false);
  const [objects, setObjects] = useState<DrawObject[]>([]);
  const [current, setCurrent] = useState<DrawObject | null>(null);
  const [textInput, setTextInput] = useState('');
  const [textPos, setTextPos] = useState<[number, number] | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Mouse events for drawing
  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (activeTool === 'pen') {
      setCurrent({ type: 'pen', points: [[x, y]] });
      setDrawing(true);
    } else if (activeTool === 'rect' || activeTool === 'circle' || activeTool === 'arrow') {
      setCurrent({ type: activeTool, start: [x, y], end: [x, y] } as DrawObject);
      setDrawing(true);
    } else if (activeTool === 'text') {
      setTextPos([x, y]);
      setTextInput('');
    } else if (activeTool === 'eraser') {
      let found = -1;
      for (let i = objects.length - 1; i >= 0; i--) {
        const obj = objects[i];
        if (obj.type === 'pen') {
          for (const [px, py] of obj.points) {
            if (Math.abs(px - x) < 10 && Math.abs(py - y) < 10) {
              found = i; break;
            }
          }
        } else if (obj.type === 'rect' || obj.type === 'circle' || obj.type === 'arrow') {
          const [sx, sy] = obj.start;
          const [ex, ey] = obj.end;
          if (x >= Math.min(sx, ex) && x <= Math.max(sx, ex) && y >= Math.min(sy, ey) && y <= Math.max(sy, ey)) {
            found = i; break;
          }
        } else if (obj.type === 'text') {
          if (Math.abs(obj.pos[0] - x) < 30 && Math.abs(obj.pos[1] - y) < 20) {
            found = i; break;
          }
        }
      }
      if (found !== -1) {
        setObjects((objs) => objs.filter((_, i) => i !== found));
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!drawing || !current || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (current.type === 'pen') {
      setCurrent({ ...current, points: [...current.points, [x, y]] } as DrawObject);
    } else if (current.type === 'rect' || current.type === 'circle' || current.type === 'arrow') {
      setCurrent({ ...current, end: [x, y] } as DrawObject);
    }
  };

  const handlePointerUp = () => {
    if (!drawing || !current) return;
    setObjects((objs) => [...objs, current]);
    setCurrent(null);
    setDrawing(false);
  };

  const handleTextSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (textInput.trim() && textPos) {
      setObjects((objs) => [...objs, { type: 'text', pos: textPos, text: textInput }]);
      setTextInput('');
      setTextPos(null);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-[#f9fbfa] font-[\'Space Grotesk\',_\'Noto Sans\',_sans-serif] overflow-x-hidden">
      <div className="flex flex-1 flex-col h-full">
        <div className="flex flex-1 justify-center gap-1 py-5 px-6">
          {/* Left Toolbar */}
          <div className="flex flex-col w-24 pt-3">
            <div className="flex flex-col border-b border-[#d7e0db] gap-2 px-2">
              {tools.map((tool) => (
                <button
                  key={tool.key}
                  onClick={() => setActiveTool(tool.key as ToolKey)}
                  className={`flex flex-col items-center justify-center border-b-[3px] transition-all duration-150 ${activeTool === tool.key ? 'border-b-[#121714] text-[#121714] bg-[#e6f0ec] shadow' : 'border-b-transparent text-[#648273] hover:bg-[#f0f4f2]'} gap-1 pb-[7px] pt-2.5 focus:outline-none rounded-lg`}
                  style={{ minHeight: 64 }}
                  title={tool.name}
                >
                  <div className={activeTool === tool.key ? 'text-[#121714]' : 'text-[#648273]'}>{tool.icon}</div>
                  <p className={`text-sm font-bold leading-normal tracking-[0.015em] ${activeTool === tool.key ? 'text-[#121714]' : 'text-[#648273]'}`}>{tool.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex flex-col flex-1 max-w-[1800px] min-w-0 min-h-0">
            {/* Top Menu Bar */}
            <header className="flex items-center justify-between whitespace-nowrap border-b border-[#ebefed] px-10 py-3">
              <div className="flex items-center gap-4 text-[#121714]">
                <div className="w-4 h-4">
                  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_6_535)">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M47.2426 24L24 47.2426L0.757355 24L24 0.757355L47.2426 24ZM12.2426 21H35.7574L24 9.24264L12.2426 21Z"
                        fill="currentColor"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_6_535"><rect width="48" height="48" fill="white" /></clipPath>
                    </defs>
                  </svg>
                </div>
                <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">Whiteboard</h2>
              </div>
              <div className="flex flex-1 justify-end gap-8">
                <div className="flex items-center gap-9">
                  <a className="text-[#121714] text-sm font-medium leading-normal" href="#">File</a>
                  <a className="text-[#121714] text-sm font-medium leading-normal" href="#">Export</a>
                  <a className="text-[#121714] text-sm font-medium leading-normal" href="#">Undo</a>
                  <a className="text-[#121714] text-sm font-medium leading-normal" href="#">Redo</a>
                </div>
                <button className="flex max-w-[480px] items-center justify-center rounded-xl h-10 bg-[#ebefed] text-[#121714] gap-2 text-sm font-bold min-w-0 px-2.5">
                  <div className="text-[#121714]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M244.8,150.4a8,8,0,0,1-11.2-1.6A51.6,51.6,0,0,0,192,128a8,8,0,0,1-7.37-4.89,8,8,0,0,1,0-6.22A8,8,0,0,1,192,112a24,24,0,1,0-23.24-30,8,8,0,1,1-15.5-4A40,40,0,1,1,219,117.51a67.94,67.94,0,0,1,27.43,21.68A8,8,0,0,1,244.8,150.4ZM190.92,212a8,8,0,1,1-13.84,8,57,57,0,0,0-98.16,0,8,8,0,1,1-13.84-8,72.06,72.06,0,0,1,33.74-29.92,48,48,0,1,1,58.36,0A72.06,72.06,0,0,1,190.92,212ZM128,176a32,32,0,1,0-32-32A32,32,0,0,0,128,176ZM72,120a8,8,0,0,0-8-8A24,24,0,1,1,87.24,82a8,8,0,1,0,15.5-4A40,40,0,1,0,37,117.51,67.94,67.94,0,0,0,9.6,139.19a8,8,0,1,0,12.8,9.61A51.6,51.6,0,0,1,64,128,8,8,0,0,0,72,120Z" />
                    </svg>
                  </div>
                </button>
                <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-10 h-10" style={{backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuADx1Im20-01RnOvhwQGPn_HdCYW0qk4_FKrrNhiLEmtk8N54NTkZjH6WJFnOgjautykRUM8VUdTphNjx9Nuo8pBjvCSEi62_M83DKsqfTGwirxFeAEdtSCySLcZ_uHSGrXK8yGeSvFJ9Uv9lC6nhsJD0kpLaGm6LIc1rHssn5zPJotteuLZKZcN1vZtMrBEWj-fYi12x6nv42w4nqVCCCzKOMclLHk-ciZGUpTQ5rCLR9X6ZDlQVE7wyZ-llyWV6Nkm_K4wu7WoTjj'}}></div>
              </div>
            </header>
            {/* Canvas Area */}
            <div className="flex-1 flex flex-col justify-end overflow-hidden px-0 pb-0 relative min-h-0 min-w-0">
              <div className="flex-1 flex items-center justify-center min-h-0 min-w-0">
                <div className="bg-white rounded-2xl shadow border border-[#ebefed] w-full h-full max-w-full max-h-full flex items-center justify-center text-gray-300 text-2xl font-bold relative min-h-0 min-w-0">
                  <svg
                    ref={svgRef}
                    width="100%"
                    height="100%"
                    viewBox="0 0 1800 900"
                    className="absolute left-0 top-0 w-full h-full cursor-crosshair select-none"
                    style={{ zIndex: 2 }}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                  >
                    <defs>
                      <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto" markerUnits="strokeWidth">
                        <polygon points="0 0, 10 3.5, 0 7" fill="#222" />
                      </marker>
                    </defs>
                    {objects.map((obj, i) => (
                      <g key={i}>{getSvgElement(obj)}</g>
                    ))}
                    {current && <g>{getSvgElement(current)}</g>}
                  </svg>
                  {/* Text input overlay */}
                  {activeTool === 'text' && textPos && (
                    <form
                      className="absolute"
                      style={{ left: textPos[0], top: textPos[1], zIndex: 10 }}
                      onSubmit={handleTextSubmit}
                    >
                      <input
                        autoFocus
                        className="border rounded px-2 py-1 text-base shadow"
                        value={textInput}
                        onChange={e => setTextInput(e.target.value)}
                        onBlur={() => {
                          if (textInput.trim() && textPos) {
                            setObjects((objs) => [...objs, { type: 'text', pos: textPos, text: textInput }]);
                            setTextInput('');
                            setTextPos(null);
                          }
                        }}
                        style={{ minWidth: 60 }}
                      />
                    </form>
                  )}
                </div>
              </div>
              {/* Bottom Right Chat Button */}
              <button className="absolute bottom-6 right-6 flex items-center justify-center rounded-xl h-14 bg-[#fbfdfc] text-[#121714] text-base font-bold min-w-0 px-2 gap-4 pl-4 pr-6 shadow">
                <div className="text-[#121714]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M140,128a12,12,0,1,1-12-12A12,12,0,0,1,140,128ZM84,116a12,12,0,1,0,12,12A12,12,0,0,0,84,116Zm88,0a12,12,0,1,0,12,12A12,12,0,0,0,172,116Zm60,12A104,104,0,0,1,79.12,219.82L45.07,231.17a16,16,0,0,1-20.24-20.24l11.35-34.05A104,104,0,1,1,232,128Zm-16,0A88,88,0,1,0,51.81,172.06a8,8,0,0,1,.66,6.54L40,216,77.4,203.53a7.85,7.85,0,0,1,2.53-.42,8,8,0,0,1,4,1.08A88,88,0,0,0,216,128Z" />
                  </svg>
                </div>
                Chat
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 