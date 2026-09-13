import React, { useRef, useEffect, useState } from 'react';
import {
  ToolType,
  BackgroundGridType,
  DrawingStroke,
  DrawingPoint,
  TextBlockItem,
  PhoneticDisplayMode,
  CharacterPhonetic,
} from '../types';
import { TextBlockView } from './TextBlockView';

interface CanvasBoardProps {
  tool: ToolType;
  color: string;
  strokeWidth: number;
  gridType: BackgroundGridType;
  strokes: DrawingStroke[];
  onAddStroke: (stroke: DrawingStroke) => void;
  textBlocks: TextBlockItem[];
  selectedBlockId: string | null;
  onSelectBlock: (id: string | null) => void;
  onUpdateBlock: (block: TextBlockItem) => void;
  onDeleteBlock: (id: string) => void;
  globalDisplayMode: PhoneticDisplayMode;
  onOpenPronunciation: (charData: CharacterPhonetic, blockId: string, charIndex: number) => void;
  onOpenStrokeOrder: (char: string) => void;
  boardRef: React.RefObject<HTMLDivElement | null>;
  onQuickAddTextAt: (x: number, y: number) => void;
}

export const CanvasBoard: React.FC<CanvasBoardProps> = ({
  tool,
  color,
  strokeWidth,
  gridType,
  strokes,
  onAddStroke,
  textBlocks,
  selectedBlockId,
  onSelectBlock,
  onUpdateBlock,
  onDeleteBlock,
  globalDisplayMode,
  onOpenPronunciation,
  onOpenStrokeOrder,
  boardRef,
  onQuickAddTextAt,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const currentPointsRef = useRef<DrawingPoint[]>([]);
  const [laserPos, setLaserPos] = useState<{ x: number; y: number } | null>(null);

  // Dragging state for text blocks
  const [draggingBlockId, setDraggingBlockId] = useState<string | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Render all committed strokes to the HTML5 canvas
  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const stroke of strokes) {
      if (stroke.points.length < 2) continue;

      ctx.save();
      ctx.beginPath();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = stroke.width;
      ctx.strokeStyle = stroke.color;
      ctx.globalAlpha = stroke.opacity;

      const pts = stroke.points;
      ctx.moveTo(pts[0].x, pts[0].y);

      for (let i = 1; i < pts.length; i++) {
        // Smooth quadratic curve midpoint interpolation
        const midX = (pts[i - 1].x + pts[i].x) / 2;
        const midY = (pts[i - 1].y + pts[i].y) / 2;
        ctx.quadraticCurveTo(pts[i - 1].x, pts[i - 1].y, midX, midY);
      }

      ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
      ctx.stroke();
      ctx.restore();
    }
  };

  // Resize canvas to match container size
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = boardRef.current;
    if (!canvas || !container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        canvas.width = width;
        canvas.height = height;
        redrawCanvas();
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  // Redraw whenever strokes change
  useEffect(() => {
    redrawCanvas();
  }, [strokes]);

  // Pointer event handlers for drawing
  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>): DrawingPoint => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      pressure: e.pressure || 0.5,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (tool === 'select') {
      onSelectBlock(null);
      return;
    }

    if (tool === 'text') {
      const pt = getCanvasCoords(e);
      onQuickAddTextAt(pt.x, pt.y);
      return;
    }

    if (tool === 'laser') {
      const pt = getCanvasCoords(e);
      setLaserPos(pt);
      return;
    }

    setIsDrawing(true);
    const pt = getCanvasCoords(e);
    currentPointsRef.current = [pt];
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (tool === 'laser') {
      const pt = getCanvasCoords(e);
      setLaserPos(pt);
      return;
    }

    if (!isDrawing) return;
    const pt = getCanvasCoords(e);
    currentPointsRef.current.push(pt);

    // Live preview drawing on canvas
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pts = currentPointsRef.current;
    if (pts.length >= 2) {
      ctx.save();
      ctx.beginPath();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = strokeWidth;
      ctx.strokeStyle = color;
      ctx.globalAlpha = tool === 'highlighter' ? 0.35 : 1.0;

      const p1 = pts[pts.length - 2];
      const p2 = pts[pts.length - 1];
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
      ctx.restore();
    }
  };

  const handlePointerUp = () => {
    if (tool === 'laser') {
      setLaserPos(null);
      return;
    }

    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentPointsRef.current.length >= 2) {
      const newStroke: DrawingStroke = {
        id: `stroke_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        type: 'stroke',
        tool: tool === 'highlighter' ? 'highlighter' : 'pen',
        points: [...currentPointsRef.current],
        color: tool === 'eraser' ? '#ffffff' : color,
        width: tool === 'eraser' ? strokeWidth * 3 : strokeWidth,
        opacity: tool === 'highlighter' ? 0.35 : 1.0,
      };
      onAddStroke(newStroke);
    }
    currentPointsRef.current = [];
  };

  // Dragging logic for TextBlockView (mouse & touch/pointer)
  const handleDragStart = (e: React.MouseEvent | React.PointerEvent, blockId: string) => {
    const block = textBlocks.find((b) => b.id === blockId);
    if (!block) return;
    setDraggingBlockId(blockId);
    dragOffsetRef.current = {
      x: e.clientX - block.x,
      y: e.clientY - block.y,
    };
  };

  const handleContainerPointerMove = (e: React.PointerEvent) => {
    if (!draggingBlockId) return;
    const block = textBlocks.find((b) => b.id === draggingBlockId);
    if (!block) return;

    const newX = Math.max(10, e.clientX - dragOffsetRef.current.x);
    const newY = Math.max(10, e.clientY - dragOffsetRef.current.y);
    onUpdateBlock({
      ...block,
      x: newX,
      y: newY,
    });
  };

  const handleContainerPointerUp = () => {
    if (draggingBlockId) {
      setDraggingBlockId(null);
    }
  };

  // Background Grid CSS pattern generator
  const getGridBackgroundClass = () => {
    switch (gridType) {
      case 'tianzige':
        return 'bg-tianzige-pattern';
      case 'mizige':
        return 'bg-mizige-pattern';
      case 'lines':
        return 'bg-lines-pattern';
      case 'dots':
        return 'bg-dots-pattern';
      default:
        return 'bg-white';
    }
  };

  return (
    <div
      ref={boardRef}
      onPointerMove={handleContainerPointerMove}
      onPointerUp={handleContainerPointerUp}
      onPointerCancel={handleContainerPointerUp}
      onDoubleClick={(e) => {
        const rect = boardRef.current?.getBoundingClientRect();
        if (rect) {
          onQuickAddTextAt(e.clientX - rect.left, e.clientY - rect.top);
        }
      }}
      className={`relative w-full h-full overflow-hidden select-none touch-none ${getGridBackgroundClass()}`}
      style={{
        backgroundColor: '#fbfbfa',
      }}
    >
      {/* Visual Tianzige SVG Background overlay if selected */}
      {gridType === 'tianzige' && (
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage: `
              linear-gradient(to right, #f87171 1px, transparent 1px),
              linear-gradient(to bottom, #f87171 1px, transparent 1px),
              linear-gradient(to right, rgba(248, 113, 113, 0.4) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(248, 113, 113, 0.4) 1px, transparent 1px)
            `,
            backgroundSize: '120px 120px, 120px 120px, 60px 60px, 60px 60px',
          }}
        />
      )}

      {gridType === 'mizige' && (
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage: `
              radial-gradient(circle, #ef4444 1px, transparent 1px),
              linear-gradient(to right, #f87171 1px, transparent 1px),
              linear-gradient(to bottom, #f87171 1px, transparent 1px)
            `,
            backgroundSize: '30px 30px, 120px 120px, 120px 120px',
          }}
        />
      )}

      {gridType === 'lines' && (
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage: 'linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)',
            backgroundSize: '100% 48px',
          }}
        />
      )}

      {/* HTML5 Canvas for Freehand Drawing */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="absolute inset-0 w-full h-full z-10 cursor-crosshair"
      />

      {/* Laser pointer beacon */}
      {laserPos && (
        <div
          style={{
            left: `${laserPos.x - 8}px`,
            top: `${laserPos.y - 8}px`,
          }}
          className="absolute z-40 w-4 h-4 rounded-full bg-red-600 ring-4 ring-red-400/60 shadow-[0_0_15px_#dc2626] pointer-events-none transition-transform animate-ping"
        />
      )}

      {/* Text Blocks Layer */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        {textBlocks.map((block) => (
          <div key={block.id} className="pointer-events-auto">
            <TextBlockView
              block={block}
              isSelected={selectedBlockId === block.id}
              globalDisplayMode={globalDisplayMode}
              onSelect={() => onSelectBlock(block.id)}
              onUpdate={onUpdateBlock}
              onDelete={() => onDeleteBlock(block.id)}
              onOpenPronunciation={onOpenPronunciation}
              onOpenStrokeOrder={onOpenStrokeOrder}
              onDragStart={handleDragStart}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
