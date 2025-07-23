'use client';

import React, { useState, useEffect, useRef, memo, forwardRef } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Trash2, ArrowUp, ArrowDown, XCircle, Bold, Italic, Code2, Heading1, Heading2, Heading3, List, ListOrdered, Quote, Image as ImageIcon, Smile, Link2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// A simple markdown renderer component
const SimpleMarkdown: React.FC<{ content: string }> = ({ content }) => {
    const html = content
        .replace(/###### (.*)/g, '<h6 class="text-lg font-semibold mt-2 mb-1 text-gray-800">$1</h6>')
        .replace(/##### (.*)/g, '<h5 class="text-xl font-semibold mt-2 mb-1 text-gray-800">$1</h5>')
        .replace(/#### (.*)/g, '<h4 class="text-2xl font-bold mt-3 mb-2 text-gray-800">$1</h4>')
        .replace(/### (.*)/g, '<h3 class="text-3xl font-bold mt-4 mb-2 text-gray-900">$1</h3>')
        .replace(/## (.*)/g, '<h2 class="text-4xl font-extrabold mt-5 mb-3 text-gray-900">$1</h2>')
        .replace(/# (.*)/g, '<h1 class="text-5xl font-extrabold mt-6 mb-4 text-gray-900">$1</h1>')
        .replace(/\*\*(.*)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*)\*/g, '<em>$1</em>')
        .replace(/`([^`]+)`/g, '<code class="bg-gray-200 text-purple-700 px-1 rounded">$1</code>')
        .replace(/\n/g, '<br/>');

    return (
        <div className="prose max-w-none p-6 min-h-[80px] text-[1.25rem] leading-relaxed" style={{fontSize: '1.25rem'}} dangerouslySetInnerHTML={{ __html: html }} />
    );
};


export type Cell = {
  id: string;
  type: 'code' | 'text';
  content: string;
  isRunning?: boolean;
  output?: string | null;
  executionCount?: number | null;
};

interface ColabCellProps {
  cell: Cell;
  onChange: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onRun: (id: string) => void;
  onClearOutput: (id: string) => void;
}

function insertAtCursor(textarea: HTMLTextAreaElement, before: string, after: string = '', placeholder: string = '') {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;
    const selected = value.substring(start, end) || placeholder;
    const newValue = value.substring(0, start) + before + selected + after + value.substring(end);
    textarea.value = newValue;
    textarea.selectionStart = textarea.selectionEnd = start + before.length + selected.length + after.length;
    textarea.focus();
    const event = new Event('input', { bubbles: true });
    textarea.dispatchEvent(event);
}

const ColabCell = forwardRef<HTMLDivElement, ColabCellProps>(({ cell, onChange, onDelete, onMoveUp, onMoveDown, onRun, onClearOutput }, ref) => {
  const [isEditing, setIsEditing] = useState(cell.type === 'text' && !cell.content);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textAreaRef.current) {
      textAreaRef.current.focus();
    }
  }, [isEditing]);

  return (
    <div ref={ref} className="group relative my-2 rounded-lg bg-white border border-transparent hover:border-gray-300 transition-colors duration-200">
      <div className="flex items-start gap-3 p-2">
        <div className="flex flex-col items-center h-full pt-1">
          {cell.type === 'code' ? (
            <div className="flex flex-col items-center">
                <div className="w-8 h-8 flex items-center justify-center text-xs text-gray-500">
                    {cell.executionCount !== null ? `[${cell.executionCount}]` : `[ ]`}
                </div>
                <button
                    onClick={() => onRun(cell.id)}
                    className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-blue-600 hover:bg-gray-200 rounded-full"
                    title="Run cell"
                >
                    <Play size={16} />
                </button>
            </div>
          ) : (
            <div className="w-8 h-8" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          {cell.type === 'code' ? (
            <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <Editor
                height="150px"
                path={cell.id}
                language="python"
                value={cell.content}
                onChange={(value) => onChange(cell.id, value || '')}
                theme="light"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: 'on',
                  scrollBeyondLastLine: false,
                  scrollbar: {
                      verticalScrollbarSize: 10,
                      horizontalScrollbarSize: 10
                  }
                }}
              />
            </div>
          ) : (
            isEditing ? (
              <div className="border border-blue-400 rounded-lg">
                 <div className="bg-gray-100 p-1 flex items-center gap-2 text-gray-700 overflow-x-auto">
                    <button className="p-1 hover:bg-gray-200 rounded" title="Heading 1" onMouseDown={e => {e.preventDefault(); if(textAreaRef.current) insertAtCursor(textAreaRef.current, '# ', '', 'Heading 1');}}><Heading1 size={18}/></button>
                    <button className="p-1 hover:bg-gray-200 rounded" title="Heading 2" onMouseDown={e => {e.preventDefault(); if(textAreaRef.current) insertAtCursor(textAreaRef.current, '## ', '', 'Heading 2');}}><Heading2 size={18}/></button>
                    <button className="p-1 hover:bg-gray-200 rounded" title="Heading 3" onMouseDown={e => {e.preventDefault(); if(textAreaRef.current) insertAtCursor(textAreaRef.current, '### ', '', 'Heading 3');}}><Heading3 size={18}/></button>
                    <button className="p-1 hover:bg-gray-200 rounded font-bold" title="Bold" onMouseDown={e => {e.preventDefault(); if(textAreaRef.current) insertAtCursor(textAreaRef.current, '**', '**', 'bold');}}><Bold size={18}/></button>
                    <button className="p-1 hover:bg-gray-200 rounded italic" title="Italic" onMouseDown={e => {e.preventDefault(); if(textAreaRef.current) insertAtCursor(textAreaRef.current, '*', '*', 'italic');}}><Italic size={18}/></button>
                    <button className="p-1 hover:bg-gray-200 rounded" title="Code" onMouseDown={e => {e.preventDefault(); if(textAreaRef.current) insertAtCursor(textAreaRef.current, '`', '`', 'code');}}><Code2 size={18}/></button>
                    <button className="p-1 hover:bg-gray-200 rounded" title="Link" onMouseDown={e => {e.preventDefault(); if(textAreaRef.current) insertAtCursor(textAreaRef.current, '[', '](url)', 'text');}}><Link2 size={18}/></button>
                    <button className="p-1 hover:bg-gray-200 rounded" title="Image" onMouseDown={e => {e.preventDefault(); if(textAreaRef.current) insertAtCursor(textAreaRef.current, '![', '](url)', 'alt');}}><ImageIcon size={18}/></button>
                    <button className="p-1 hover:bg-gray-200 rounded" title="Quote" onMouseDown={e => {e.preventDefault(); if(textAreaRef.current) insertAtCursor(textAreaRef.current, '> ', '', 'quote');}}><Quote size={18}/></button>
                    <button className="p-1 hover:bg-gray-200 rounded" title="Bulleted List" onMouseDown={e => {e.preventDefault(); if(textAreaRef.current) insertAtCursor(textAreaRef.current, '- ', '', 'list item');}}><List size={18}/></button>
                    <button className="p-1 hover:bg-gray-200 rounded" title="Numbered List" onMouseDown={e => {e.preventDefault(); if(textAreaRef.current) insertAtCursor(textAreaRef.current, '1. ', '', 'list item');}}><ListOrdered size={18}/></button>
                    <button className="p-1 hover:bg-gray-200 rounded" title="Divider" onMouseDown={e => {e.preventDefault(); if(textAreaRef.current) insertAtCursor(textAreaRef.current, '\n---\n');}}>— —</button>
                    <button className="p-1 hover:bg-gray-200 rounded" title="Math" onMouseDown={e => {e.preventDefault(); if(textAreaRef.current) insertAtCursor(textAreaRef.current, '$$', '$$', 'math');}}><span className="font-mono text-lg">∑</span></button>
                    <button className="p-1 hover:bg-gray-200 rounded" title="Emoji" onMouseDown={e => {e.preventDefault(); if(textAreaRef.current) insertAtCursor(textAreaRef.current, '😊');}}><Smile size={18}/></button>
                 </div>
                <textarea
                    ref={textAreaRef}
                    className="w-full p-4 text-lg bg-white text-gray-800 rounded-b-lg h-24 focus:outline-none min-h-[80px]"
                    value={cell.content}
                    onChange={(e) => onChange(cell.id, e.target.value)}
                    onBlur={() => setIsEditing(false)}
                    placeholder="Enter text (Markdown supported)..."
                />
              </div>
            ) : (
              <div onDoubleClick={() => setIsEditing(true)} className="p-1 cursor-pointer text-gray-800">
                <SimpleMarkdown content={cell.content} />
              </div>
            )
          )}
          <AnimatePresence>
            {cell.isRunning && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 text-sm text-gray-500"
              >
                Running...
              </motion.div>
            )}
            {cell.output && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap">{cell.output}</pre>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white p-1 rounded-md shadow-lg flex gap-1 border border-gray-300">
        <button onClick={() => onMoveUp(cell.id)} className="p-1 text-gray-500 hover:text-black" title="Move cell up"><ArrowUp size={16} /></button>
        <button onClick={() => onMoveDown(cell.id)} className="p-1 text-gray-500 hover:text-black" title="Move cell down"><ArrowDown size={16} /></button>
        {cell.output && <button onClick={() => onClearOutput(cell.id)} className="p-1 text-gray-500 hover:text-black" title="Clear output"><XCircle size={16} /></button>}
        <button onClick={() => onDelete(cell.id)} className="p-1 text-gray-500 hover:text-red-600" title="Delete cell"><Trash2 size={16} /></button>
      </div>
    </div>
  );
});

ColabCell.displayName = 'ColabCell';

export default memo(ColabCell); 