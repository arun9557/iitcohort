import React, { useRef, useState, useEffect } from "react";
const DEFAULT_PEN_COLOR = "#222";
const COLOR_PALETTE = ["#222", "#e11d48", "#2563eb", "#059669", "#f59e42", "#fbbf24", "#fff", "#000"];
const TOOLS = [
    { key: 'pen', label: 'Pen', icon: '✏️', shortcut: 'P', tooltip: 'Freehand drawing (P)' },
    { key: 'eraser', label: 'Eraser', icon: '🧽', shortcut: 'E', tooltip: 'Erase (E)' },
    { key: 'line', label: 'Line', icon: '📏', shortcut: 'L', tooltip: 'Draw line (L)' },
    { key: 'rect', label: 'Rectangle', icon: '▭', shortcut: 'R', tooltip: 'Draw rectangle (R)' },
    { key: 'circle', label: 'Circle', icon: '⚪', shortcut: 'C', tooltip: 'Draw circle (C)' },
    { key: 'text', label: 'Text', icon: '🔤', shortcut: 'T', tooltip: 'Add text (T)' },
];
export default function Whiteboard() {
    console.log('Whiteboard mounted');
    const canvasRef = useRef(null);
    const overlayCanvasRef = useRef(null);
    const [tool, setTool] = useState('pen');
    const [penColor, setPenColor] = useState(DEFAULT_PEN_COLOR);
    const [penSize, setPenSize] = useState(3);
    const [eraserSize, setEraserSize] = useState(24);
    const [isDrawing, setIsDrawing] = useState(false);
    const [start, setStart] = useState(null);
    const [history, setHistory] = useState([]);
    const [redoStack, setRedoStack] = useState([]);
    const [textInput, setTextInput] = useState("");
    const [textPos, setTextPos] = useState(null);
    const [fillShape, setFillShape] = useState(false);
    const [dashed, setDashed] = useState(false);
    const [eraserCursor, setEraserCursor] = useState(null);
    // Keyboard shortcuts
    useEffect(() => {
        const handler = (e) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
                return;
            if (e.ctrlKey && e.key.toLowerCase() === 'z') {
                handleUndo();
                return;
            }
            if (e.ctrlKey && e.key.toLowerCase() === 'y') {
                handleRedo();
                return;
            }
            for (const t of TOOLS) {
                if (e.key.toUpperCase() === t.shortcut)
                    setTool(t.key);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    });
    // Save canvas state to history
    const saveHistory = () => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        setHistory(prev => [...prev.slice(-29), canvas.toDataURL()]);
        setRedoStack([]);
    };
    // Drawing logic
    // For smooth pen drawing
    const [penPoints, setPenPoints] = useState([]);
    const handlePointerDown = (e) => {
        const pos = getPos(e);
        setIsDrawing(true);
        setStart(pos);
        if (tool === 'pen') {
            setPenPoints([pos]);
        }
        if (tool === 'eraser') {
            const ctx = canvasRef.current?.getContext('2d');
            if (ctx) {
                ctx.save();
                ctx.globalCompositeOperation = 'destination-out';
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, eraserSize / 2, 0, 2 * Math.PI);
                ctx.fill();
                ctx.restore();
            }
        }
        if (tool === 'text') {
            setTextPos(pos);
            setTextInput("");
        }
    };
    const handlePointerMove = (e) => {
        if (!isDrawing)
            return;
        const pos = getPos(e);
        if (tool === 'pen') {
            setPenPoints(prev => {
                const newPoints = [...prev, pos];
                // Draw smooth path
                const ctx = canvasRef.current?.getContext('2d');
                if (ctx && newPoints.length > 1) {
                    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                    // Redraw all history
                    if (history.length > 0) {
                        const img = new window.Image();
                        img.src = history[history.length - 1];
                        img.onload = () => {
                            ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height);
                            drawSmoothPath(ctx, newPoints);
                        };
                    }
                    else {
                        drawSmoothPath(ctx, newPoints);
                    }
                }
                return newPoints;
            });
        }
        else if (tool === 'eraser') {
            const ctx = canvasRef.current?.getContext('2d');
            if (ctx) {
                ctx.save();
                ctx.globalCompositeOperation = 'destination-out';
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, eraserSize / 2, 0, 2 * Math.PI);
                ctx.fill();
                ctx.restore();
            }
        }
        else if ((tool === 'line' || tool === 'rect' || tool === 'circle') && start) {
            drawShapeOnOverlay(start, pos);
        }
    };
    // Helper to draw a smooth path using quadraticCurveTo
    function drawSmoothPath(ctx, points) {
        if (points.length < 2)
            return;
        ctx.save();
        ctx.strokeStyle = penColor;
        ctx.lineWidth = penSize;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length - 1; i++) {
            const mid = {
                x: (points[i].x + points[i + 1].x) / 2,
                y: (points[i].y + points[i + 1].y) / 2
            };
            ctx.quadraticCurveTo(points[i].x, points[i].y, mid.x, mid.y);
        }
        ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
        ctx.stroke();
        ctx.restore();
    }
    const handlePointerUp = (e) => {
        setIsDrawing(false);
        if (!start)
            return;
        const pos = getPos(e);
        if (tool === 'line' || tool === 'rect' || tool === 'circle') {
            drawShapeOnMain(start, pos);
            clearOverlay();
            saveHistory();
        }
        if (tool === 'pen') {
            // Finalize the smooth path
            const ctx = canvasRef.current?.getContext('2d');
            if (ctx && penPoints.length > 1) {
                drawSmoothPath(ctx, penPoints);
            }
            setPenPoints([]);
            saveHistory();
        }
        if (tool === 'eraser') {
            saveHistory();
        }
        setStart(null);
    };
    function getPos(e) {
        const rect = e.target.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    }
    function drawShapeOnOverlay(start, end) {
        const overlay = overlayCanvasRef.current;
        if (!overlay)
            return;
        const ctx = overlay.getContext('2d');
        if (!ctx)
            return;
        ctx.clearRect(0, 0, overlay.width, overlay.height);
        ctx.setLineDash(dashed ? [8, 6] : []);
        ctx.strokeStyle = penColor;
        ctx.lineWidth = penSize;
        ctx.lineCap = "round";
        ctx.fillStyle = penColor;
        if (tool === 'line') {
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
        }
        else if (tool === 'rect') {
            if (fillShape) {
                ctx.fillRect(start.x, start.y, end.x - start.x, end.y - start.y);
            }
            else {
                ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
            }
        }
        else if (tool === 'circle') {
            ctx.beginPath();
            const r = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
            ctx.arc(start.x, start.y, r, 0, 2 * Math.PI);
            if (fillShape)
                ctx.fill();
            else
                ctx.stroke();
        }
        ctx.setLineDash([]);
    }
    function drawShapeOnMain(start, end) {
        const ctx = canvasRef.current?.getContext("2d");
        if (!ctx)
            return;
        console.log('drawShapeOnMain', { tool, start, end });
        ctx.setLineDash(dashed ? [8, 6] : []);
        ctx.strokeStyle = penColor;
        ctx.lineWidth = penSize;
        ctx.lineCap = "round";
        ctx.fillStyle = penColor;
        if (tool === 'line') {
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
        }
        else if (tool === 'rect') {
            if (fillShape) {
                ctx.fillRect(start.x, start.y, end.x - start.x, end.y - start.y);
            }
            else {
                ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
            }
        }
        else if (tool === 'circle') {
            ctx.beginPath();
            const r = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
            ctx.arc(start.x, start.y, r, 0, 2 * Math.PI);
            if (fillShape)
                ctx.fill();
            else
                ctx.stroke();
        }
        ctx.setLineDash([]);
    }
    function clearOverlay() {
        const overlay = overlayCanvasRef.current;
        if (!overlay)
            return;
        const ctx = overlay.getContext('2d');
        if (!ctx)
            return;
        ctx.clearRect(0, 0, overlay.width, overlay.height);
    }
    // Text tool
    function commitText() {
        if (textInput && textPos) {
            const ctx = canvasRef.current?.getContext("2d");
            if (!ctx)
                return;
            ctx.save();
            ctx.font = `${16 + penSize * 2}px sans-serif`;
            ctx.fillStyle = penColor;
            ctx.fillText(textInput, textPos.x, textPos.y);
            ctx.restore();
            setTextInput("");
            setTextPos(null);
            saveHistory();
        }
    }
    // Custom cursor for eraser
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        if (tool === "eraser") {
            canvas.style.cursor = "none";
        }
        else {
            canvas.style.cursor = "crosshair";
        }
    }, [tool]);
    // Clear canvas
    const handleClear = () => {
        const ctx = canvasRef.current?.getContext("2d");
        if (ctx)
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        clearOverlay();
        saveHistory();
    };
    // Undo/Redo
    const handleUndo = () => {
        if (history.length === 0)
            return;
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const prev = history[history.length - 1];
        setRedoStack(r => [canvas.toDataURL(), ...r]);
        setHistory(h => h.slice(0, -1));
        const img = new window.Image();
        img.src = prev;
        img.onload = () => {
            const ctx = canvas.getContext("2d");
            if (!ctx)
                return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        clearOverlay();
    };
    const handleRedo = () => {
        if (redoStack.length === 0)
            return;
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const next = redoStack[0];
        setHistory(h => [...h, canvas.toDataURL()]);
        setRedoStack(r => r.slice(1));
        const img = new window.Image();
        img.src = next;
        img.onload = () => {
            const ctx = canvas.getContext("2d");
            if (!ctx)
                return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        clearOverlay();
    };
    // Save as image
    const handleSave = () => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const url = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = url;
        a.download = "whiteboard.png";
        a.click();
    };
    // Responsive canvas size
    useEffect(() => {
        const canvas = canvasRef.current;
        const overlay = overlayCanvasRef.current;
        if (!canvas || !overlay)
            return;
        function resizeAndGrid() {
            if (!canvas || !overlay)
                return;
            const parent = canvas.parentElement;
            let width = parent?.clientWidth || 900;
            let height = parent?.clientHeight || 600;
            if (width === 0)
                width = 900;
            if (height === 0)
                height = 600;
            // Save main canvas content only if width/height > 0
            const hasContent = canvas.width > 0 && canvas.height > 0;
            const temp = document.createElement("canvas");
            temp.width = canvas.width;
            temp.height = canvas.height;
            if (hasContent) {
                const tempCtx = temp.getContext("2d");
                if (tempCtx && canvas)
                    tempCtx.drawImage(canvas, 0, 0);
            }
            // Resize both canvases
            canvas.width = width;
            canvas.height = height;
            overlay.width = width;
            overlay.height = height;
            // Restore main canvas content only if both temp and canvas have size
            if (hasContent && width > 0 && height > 0 && canvas) {
                const ctx = canvas.getContext("2d");
                if (ctx)
                    ctx.drawImage(temp, 0, 0, width, height);
            }
            // Draw grid
            const ctx = overlay.getContext('2d');
            if (ctx) {
                ctx.save();
                ctx.globalAlpha = 0.5;
                ctx.clearRect(0, 0, overlay.width, overlay.height);
                ctx.strokeStyle = "#e5e7eb";
                ctx.lineWidth = 1;
                for (let x = 0; x < overlay.width; x += 32) {
                    ctx.beginPath();
                    ctx.moveTo(x, 0);
                    ctx.lineTo(x, overlay.height);
                    ctx.stroke();
                }
                for (let y = 0; y < overlay.height; y += 32) {
                    ctx.beginPath();
                    ctx.moveTo(0, y);
                    ctx.lineTo(overlay.width, y);
                    ctx.stroke();
                }
                ctx.restore();
            }
        }
        resizeAndGrid();
        window.addEventListener("resize", resizeAndGrid);
        // Force a second resize after mount to ensure canvas is visible and sized
        setTimeout(resizeAndGrid, 100);
        setTimeout(resizeAndGrid, 500);
        return () => window.removeEventListener("resize", resizeAndGrid);
    }, []);
    // Draw eraser cursor
    useEffect(() => {
        if (tool !== "eraser")
            return;
        const overlay = overlayCanvasRef.current;
        if (!overlay)
            return;
        const move = (e) => {
            const rect = overlay.getBoundingClientRect();
            overlay.style.setProperty("--x", `${e.clientX - rect.left}px`);
            overlay.style.setProperty("--y", `${e.clientY - rect.top}px`);
        };
        overlay.addEventListener("mousemove", move);
        return () => overlay.removeEventListener("mousemove", move);
    }, [tool, eraserSize]);
    // Track mouse for eraser cursor
    const handleMouseMove = (e) => {
        if (tool === 'eraser') {
            const rect = e.target.getBoundingClientRect();
            setEraserCursor({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        }
    };
    const handleMouseLeave = () => {
        setEraserCursor(null);
    };
    return (<div className="w-full h-full relative bg-white rounded-xl overflow-hidden select-none" style={{
            background: '#f0f0f0',
            minHeight: 800,
            minWidth: 600, // changed from 400 to 600 for better default size
            width: '100%',
            height: '80vh',
            boxSizing: 'border-box',
            display: 'block',
        }}>
      {/* Toolbar */}
      <div className="absolute top-2 left-2 z-10 flex flex-wrap gap-2 bg-white/60 backdrop-blur-md rounded-2xl shadow-xl p-3 items-center border border-gray-200 transition-all duration-300" style={{ minWidth: 320, maxWidth: 700 }}>
        {TOOLS.map(t => (<button key={t.key} className={`px-2 py-1 rounded-xl flex flex-col items-center text-xs font-semibold transition-all duration-200 transform hover:scale-110 hover:shadow-lg focus:outline-none ${tool === t.key ? "bg-blue-600 text-white scale-110 shadow-xl" : "bg-gray-100 text-gray-700 hover:bg-blue-100"}`} onClick={() => setTool(t.key)} title={t.tooltip} style={{ boxShadow: tool === t.key ? '0 4px 24px 0 #2563eb33' : undefined }}>
            <span className="text-lg mb-1" style={{ transition: 'color 0.2s' }}>{t.icon}</span>
            {t.label}
          </button>))}
        {/* Color palette */}
        {tool !== 'eraser' && (<div className="flex items-center gap-1 ml-2">
            {COLOR_PALETTE.map(color => (<button key={color} className="w-6 h-6 rounded-full border-2 border-white shadow transition-all duration-200 hover:scale-125" style={{ background: color, outline: penColor === color ? '2px solid #2563eb' : 'none', boxShadow: penColor === color ? '0 0 0 4px #2563eb22' : undefined, transform: penColor === color ? 'scale(1.2)' : undefined }} onClick={() => setPenColor(color)} title={color}/>))}
            <input type="color" value={penColor} onChange={e => setPenColor(e.target.value)} className="w-7 h-7 border-0 bg-transparent cursor-pointer" style={{ verticalAlign: 'middle' }} title="Custom color"/>
          </div>)}
        {tool === "pen" && (<>
            <label className="ml-2 text-xs">Size</label>
            <input type="range" min={1} max={16} value={penSize} onChange={e => setPenSize(Number(e.target.value))} className="mx-1 accent-blue-500"/>
            <span className="text-xs">{penSize}px</span>
          </>)}
        {tool === "eraser" && (<div className="flex items-center gap-2 ml-2">
            <span className="text-xs">Size</span>
            <input type="range" min={8} max={64} value={eraserSize} onChange={e => setEraserSize(Number(e.target.value))} className="accent-blue-500"/>
            <span className="text-xs">{eraserSize}px</span>
          </div>)}
        {(tool === 'rect' || tool === 'circle') && (<button className={`px-2 py-1 rounded-xl ml-2 text-xs font-semibold transition-all duration-200 ${fillShape ? 'bg-blue-500 text-white scale-105' : 'bg-gray-200 text-gray-700 hover:bg-blue-100'}`} onClick={() => setFillShape(f => !f)} title="Toggle fill">
            {fillShape ? 'Filled' : 'Outline'}
          </button>)}
        {(tool === 'line' || tool === 'rect' || tool === 'circle') && (<button className={`px-2 py-1 rounded-xl ml-2 text-xs font-semibold transition-all duration-200 ${dashed ? 'bg-blue-500 text-white scale-105' : 'bg-gray-200 text-gray-700 hover:bg-blue-100'}`} onClick={() => setDashed(d => !d)} title="Dashed/Solid">
            {dashed ? 'Dashed' : 'Solid'}
          </button>)}
        <button className="px-3 py-1 rounded-xl bg-gray-300 text-gray-800 ml-2 transition-all duration-200 hover:bg-gray-400" onClick={handleUndo} disabled={history.length === 0} title="Undo (Ctrl+Z)">
          Undo
        </button>
        <button className="px-3 py-1 rounded-xl bg-gray-300 text-gray-800 transition-all duration-200 hover:bg-gray-400" onClick={handleRedo} disabled={redoStack.length === 0} title="Redo (Ctrl+Y)">
          Redo
        </button>
        <button className="px-3 py-1 rounded-xl bg-red-500 text-white ml-2 transition-all duration-200 hover:bg-red-600" onClick={handleClear}>
          Clear
        </button>
        <button className="px-3 py-1 rounded-xl bg-green-500 text-white ml-2 transition-all duration-200 hover:bg-green-600" onClick={handleSave}>
          Save as Image
        </button>
      </div>
      {/* Main Canvas and Overlay Canvas */}
      <div className="w-full h-full" style={{ position: 'relative' }}>
        {canvasRef ? null : <div style={{ color: 'red' }}>Canvas not rendered</div>}
        <canvas ref={canvasRef} className="w-full h-full block bg-white absolute left-0 top-0" style={{ zIndex: 2, pointerEvents: 'auto' }} onPointerDown={e => { console.log('PointerDown', e); handlePointerDown(e); }} onPointerUp={e => { console.log('PointerUp', e); handlePointerUp(e); }} onPointerOut={e => { console.log('PointerOut', e); handlePointerUp(e); }} onPointerMove={e => { console.log('PointerMove', e); handlePointerMove(e); }} onMouseMove={e => { console.log('MouseMove', e); handleMouseMove(e); }} onMouseLeave={e => { console.log('MouseLeave', e); handleMouseLeave(); }}/>
        <canvas ref={overlayCanvasRef} className="w-full h-full block absolute left-0 top-0" style={{ zIndex: 1, pointerEvents: 'none' }}/>
        {/* Eraser Cursor */}
        {tool === "eraser" && eraserCursor && (<div style={{
                pointerEvents: "none",
                position: "absolute",
                left: eraserCursor.x - eraserSize / 2,
                top: eraserCursor.y - eraserSize / 2,
                width: eraserSize,
                height: eraserSize,
                borderRadius: "50%",
                border: "2px solid #2563eb",
                background: "rgba(37,99,235,0.08)",
                zIndex: 30,
                transition: "width 0.1s, height 0.1s, left 0.05s, top 0.05s",
                boxShadow: '0 0 0 4px #2563eb22',
            }}/>)}
        {/* Text Input Overlay */}
        {tool === 'text' && textPos && (<input autoFocus type="text" className="absolute z-30 border border-blue-400 rounded px-2 py-1 text-sm bg-white/90 shadow-lg" style={{ left: textPos.x, top: textPos.y, minWidth: 80, transition: 'box-shadow 0.2s' }} value={textInput} onChange={e => setTextInput(e.target.value)} onBlur={commitText} onKeyDown={e => {
                if (e.key === 'Enter')
                    commitText();
            }} placeholder="Type here..."/>)}
      </div>
    </div>);
}
