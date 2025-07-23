'use client';

import React, { useState, useRef, useCallback, createRef } from 'react';
import { Plus, Share2, Wifi, Menu, Download, Edit2, Trash2, Play } from 'lucide-react';
import { Cell } from './ColabCell';
import dynamic from 'next/dynamic';

// Dynamically import ColabCell to avoid SSR issues with Monaco Editor
const ColabCell = dynamic(() => import('./ColabCell'), { ssr: false });

export default function GoogleColab() {
  const [notebookTitle, setNotebookTitle] = useState('Untitled Notebook');
  const [editingTitle, setEditingTitle] = useState(false);
  const [cells, setCells] = useState<Cell[]>([
    { id: '1', type: 'text', content: '# Welcome to your interactive Colab notebook!', isRunning: false, output: null, executionCount: null },
    { id: '2', type: 'code', content: 'print("Hello, interactive world!")', isRunning: false, output: null, executionCount: null },
  ]);
  const cellRefs = useRef<React.RefObject<HTMLDivElement>[]>([]);
  cellRefs.current = cells.map((_, i) => cellRefs.current[i] ?? createRef());

  const addCell = useCallback((type: 'code' | 'text') => {
    const newCell: Cell = {
      id: new Date().toISOString(),
      type,
      content: type === 'code' ? '# New code cell' : '',
      isRunning: false, output: null, executionCount: null
    };
    setCells(prev => [...prev, newCell]);
  }, []);

  const updateCell = useCallback((id: string, content: string) => {
    setCells(prev => prev.map(cell => cell.id === id ? { ...cell, content } : cell));
  }, []);

  const deleteCell = useCallback((id: string) => {
    setCells(prev => prev.filter(cell => cell.id !== id));
  }, []);

  const moveCell = useCallback((id: string, direction: 'up' | 'down') => {
    setCells(prev => {
        const index = prev.findIndex(cell => cell.id === id);
        if (index === -1) return prev;
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= prev.length) return prev;
        const newCells = [...prev];
        const [movedCell] = newCells.splice(index, 1);
        newCells.splice(newIndex, 0, movedCell);
        return newCells;
    });
  }, []);

  const runCell = useCallback((id: string) => {
    setCells(prev => prev.map(c => c.id === id ? { ...c, isRunning: true, output: null } : c));
    setTimeout(() => {
        setCells(prev => prev.map(c => c.id === id ? { ...c, isRunning: false, output: `Hello from cell ${id.substring(0,5)}!`, executionCount: (c.executionCount || 0) + 1 } : c));
    }, 1500);
  }, []);
  
  const clearCellOutput = useCallback((id: string) => {
    setCells(prev => prev.map(c => c.id === id ? { ...c, output: null } : c));
  }, []);

  const runAllCells = () => {
    cells.forEach((cell, index) => {
        if(cell.type === 'code'){
            setTimeout(() => {
                runCell(cell.id);
            }, index * 1600);
        }
    });
  };

  const handleSaveExport = () => {
    // TODO: Implement save/export functionality
    alert('Save/Export feature coming soon!');
  };
  const handleClearAllOutputs = () => {
    setCells(prev => prev.map(cell => cell.type === 'code' ? { ...cell, output: null } : cell));
  };

  return (
    <div className="flex flex-col h-full bg-[#f8f9fa] text-black font-sans">
      {/* Notebook Title and Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-white border-b border-gray-300">
        <div className="flex items-center gap-3">
          <Menu size={20} />
          {editingTitle ? (
            <input
              className="text-lg font-bold text-gray-800 border-b border-blue-400 bg-transparent outline-none px-1 w-64"
              value={notebookTitle}
              onChange={e => setNotebookTitle(e.target.value)}
              onBlur={() => setEditingTitle(false)}
              onKeyDown={e => { if (e.key === 'Enter') setEditingTitle(false); }}
              autoFocus
            />
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-800 cursor-pointer" onClick={() => setEditingTitle(true)}>{notebookTitle}</span>
              <button className="text-gray-400 hover:text-blue-600" onClick={() => setEditingTitle(true)} title="Edit title"><Edit2 size={16}/></button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleSaveExport} className="flex items-center gap-1 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200 rounded" title="Save/Export"><Download size={16}/>Export</button>
          <button onClick={handleClearAllOutputs} className="flex items-center gap-1 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200 rounded" title="Clear all outputs"><Trash2 size={16}/>Clear Outputs</button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#1a73e8] text-white rounded hover:bg-blue-700 transition">
            <Share2 size={16} />
            Share
          </button>
          <button className="flex items-center gap-2 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200 rounded">
            <Wifi size={16} />
            Connect
          </button>
        </div>
      </div>
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-3 py-1 bg-white border-b border-gray-300 text-sm text-gray-800">
        <button onClick={() => addCell('code')} className="flex items-center gap-1.5 hover:bg-gray-200 px-2 py-1 rounded"><Plus size={16}/> Code</button>
        <button onClick={() => addCell('text')} className="flex items-center gap-1.5 hover:bg-gray-200 px-2 py-1 rounded"><Plus size={16}/> Text</button>
        <button onClick={runAllCells} className="flex items-center gap-1.5 hover:bg-gray-200 px-2 py-1 rounded"><Play size={16}/> Run all</button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-white">
          <div className="max-w-4xl mx-auto p-4">
              {cells.map((cell, idx) => (
                  <ColabCell
                      key={cell.id}
                      ref={cellRefs.current[idx]}
                      cell={cell}
                      onChange={updateCell}
                      onDelete={deleteCell}
                      onMoveUp={() => moveCell(cell.id, 'up')}
                      onMoveDown={() => moveCell(cell.id, 'down')}
                      onRun={runCell}
                      onClearOutput={clearCellOutput}
                  />
              ))}
          </div>
      </div>
    </div>
  );
} 