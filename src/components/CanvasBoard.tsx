import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Plus,
  Minus,
  ArrowUp,
  RotateCcw,
  Maximize2,
  ArrowRight,
  Hand,
  Scan,
  Compass,
} from 'lucide-react';
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
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Whiteboard expandable space state
  const [boardExtraWidth, setBoardExtraWidth] = useState(0);
  const [boardExtraHeight, setBoardExtraHeight] = useState(0);
  const [viewportSize, setViewportSize] = useState({ width: 1200, height: 800 });

  // Pan & Zoom state (Mobile & Tablet touch friendly)
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);

  // Synchronous refs for event handlers to prevent stale closure lag
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
  const panRef = useRef(pan);
  panRef.current = pan;

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const isDrawingRef = useRef(false);
  isDrawingRef.current = isDrawing;
  const currentPointsRef = useRef<DrawingPoint[]>([]);
  const [laserPos, setLaserPos] = useState<{ x: number; y: number } | null>(null);

  // Touch gesture & pinch tracking
  const isPinchingRef = useRef(false);
  const gestureStartRef = useRef<{
    startDist: number;
    startMidX: number;
    startMidY: number;
    initialZoom: number;
    initialPan: { x: number; y: number };
  } | null>(null);
  const ignoreSingleTouchUntilRef = useRef<number>(0);
  const panStartRef = useRef<{
    x: number;
    y: number;
    initialPanX: number;
    initialPanY: number;
  } | null>(null);

  // Dragging state for text blocks
  const [draggingBlockId, setDraggingBlockId] = useState<string | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Measure viewport size of outer container
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setViewportSize({ width: Math.round(rect.width), height: Math.round(rect.height) });
      }
    };

    updateSize();

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setViewportSize({ width: Math.round(width), height: Math.round(height) });
        }
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  const totalWidth = Math.max(viewportSize.width, 900) + boardExtraWidth;
  const totalHeight = Math.max(viewportSize.height, 600) + boardExtraHeight;

  // Auto-fit on small screens (mobile & tablet) upon initial mount
  const hasAutoFittedRef = useRef(false);
  useEffect(() => {
    if (hasAutoFittedRef.current) return;
    if (viewportSize.width > 0 && viewportSize.height > 0) {
      hasAutoFittedRef.current = true;
      if (viewportSize.width < totalWidth) {
        const availableW = viewportSize.width - 24;
        const availableH = viewportSize.height - 24;
        const fitScale = Math.min(availableW / totalWidth, availableH / totalHeight, 1.0);
        const clampedFit = Math.max(0.25, Math.min(fitScale, 1.0));
        const initialPanX = Math.round((viewportSize.width - totalWidth * clampedFit) / 2);
        const initialPanY = 16;
        setZoom(clampedFit);
        setPan({ x: initialPanX, y: initialPanY });
      }
    }
  }, [viewportSize.width, viewportSize.height, totalWidth, totalHeight]);

  // Render all committed strokes to the HTML5 canvas
  const redrawCanvas = useCallback(() => {
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
        const midX = (pts[i - 1].x + pts[i].x) / 2;
        const midY = (pts[i - 1].y + pts[i].y) / 2;
        ctx.quadraticCurveTo(pts[i - 1].x, pts[i - 1].y, midX, midY);
      }

      ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
      ctx.stroke();
      ctx.restore();
    }
  }, [strokes]);

  // Resize canvas when board total dimensions change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = totalWidth;
    canvas.height = totalHeight;
    redrawCanvas();
  }, [totalWidth, totalHeight, redrawCanvas]);

  // Redraw whenever strokes change
  useEffect(() => {
    redrawCanvas();
  }, [strokes, redrawCanvas]);

  // Two-Finger Pinch-to-Zoom & Pan native gesture listener for Mobile & Tablet
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        // Second finger touched down!
        // Immediately abort any active drawing and erase preliminary stroke dot
        if (isDrawingRef.current) {
          isDrawingRef.current = false;
          setIsDrawing(false);
          currentPointsRef.current = [];
          redrawCanvas();
        }
        isPinchingRef.current = true;
        setIsPanning(false);

        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        const midX = (t1.clientX + t2.clientX) / 2;
        const midY = (t1.clientY + t2.clientY) / 2;

        gestureStartRef.current = {
          startDist: dist,
          startMidX: midX,
          startMidY: midY,
          initialZoom: zoomRef.current,
          initialPan: { ...panRef.current },
        };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length >= 2 && isPinchingRef.current && gestureStartRef.current) {
        if (e.cancelable) e.preventDefault(); // Stop mobile browser viewport zoom / page scroll

        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const currentDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        const currentMidX = (t1.clientX + t2.clientX) / 2;
        const currentMidY = (t1.clientY + t2.clientY) / 2;

        const { startDist, startMidX, startMidY, initialZoom, initialPan } = gestureStartRef.current;
        if (startDist > 0) {
          const scaleRatio = currentDist / startDist;
          const nextZoom = Math.min(3.5, Math.max(0.2, initialZoom * scaleRatio));

          const containerRect = container.getBoundingClientRect();
          const boardFocalX = (startMidX - containerRect.left - initialPan.x) / initialZoom;
          const boardFocalY = (startMidY - containerRect.top - initialPan.y) / initialZoom;

          const deltaX = currentMidX - startMidX;
          const deltaY = currentMidY - startMidY;

          const nextPanX = (startMidX - containerRect.left + deltaX) - boardFocalX * nextZoom;
          const nextPanY = (startMidY - containerRect.top + deltaY) - boardFocalY * nextZoom;

          setZoom(nextZoom);
          setPan({ x: nextPanX, y: nextPanY });
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2 && isPinchingRef.current) {
        isPinchingRef.current = false;
        gestureStartRef.current = null;
        // Cooldown so lifting one finger slightly before the other does not draw an accidental mark
        ignoreSingleTouchUntilRef.current = Date.now() + 250;
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    container.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [redrawCanvas]);

  // Trackpad / Mouse Wheel Zooming and Panning
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const containerRect = container.getBoundingClientRect();

      if (e.ctrlKey || e.metaKey) {
        // Pinch zoom on trackpad or Ctrl + Mouse Wheel
        const zoomFactor = Math.exp(-e.deltaY * 0.005);
        const currentZoom = zoomRef.current;
        const nextZoom = Math.min(3.5, Math.max(0.2, currentZoom * zoomFactor));

        const mouseX = e.clientX - containerRect.left;
        const mouseY = e.clientY - containerRect.top;

        const boardPointX = (mouseX - panRef.current.x) / currentZoom;
        const boardPointY = (mouseY - panRef.current.y) / currentZoom;

        const nextPanX = mouseX - boardPointX * nextZoom;
        const nextPanY = mouseY - boardPointY * nextZoom;

        setZoom(nextZoom);
        setPan({ x: nextPanX, y: nextPanY });
      } else {
        // Two-finger scroll / mouse wheel panning
        setPan((prev) => ({
          x: prev.x - e.deltaX,
          y: prev.y - e.deltaY,
        }));
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Single-finger or mouse drag panning (when in hand tool or dragging blank space)
  useEffect(() => {
    if (!isPanning) return;

    const onGlobalPointerMove = (e: PointerEvent) => {
      if (!panStartRef.current) return;
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      setPan({
        x: Math.round(panStartRef.current.initialPanX + dx),
        y: Math.round(panStartRef.current.initialPanY + dy),
      });
    };

    const onGlobalPointerUp = () => {
      setIsPanning(false);
      panStartRef.current = null;
    };

    window.addEventListener('pointermove', onGlobalPointerMove);
    window.addEventListener('pointerup', onGlobalPointerUp);
    window.addEventListener('pointercancel', onGlobalPointerUp);

    return () => {
      window.removeEventListener('pointermove', onGlobalPointerMove);
      window.removeEventListener('pointerup', onGlobalPointerUp);
      window.removeEventListener('pointercancel', onGlobalPointerUp);
    };
  }, [isPanning]);

  // Calculate exact canvas coordinate considering scale and position
  const getCanvasCoords = (clientX: number, clientY: number): DrawingPoint => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width / canvas.width;
    const scaleY = rect.height / canvas.height;
    return {
      x: Math.round((clientX - rect.left) / scaleX),
      y: Math.round((clientY - rect.top) / scaleY),
      pressure: 0.5,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.pointerType === 'touch' && Date.now() < ignoreSingleTouchUntilRef.current) {
      return;
    }
    if (isPinchingRef.current) {
      return;
    }

    if (tool === 'hand') {
      setIsPanning(true);
      panStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        initialPanX: pan.x,
        initialPanY: pan.y,
      };
      return;
    }

    if (tool === 'select') {
      onSelectBlock(null);
      setIsPanning(true);
      panStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        initialPanX: pan.x,
        initialPanY: pan.y,
      };
      return;
    }

    if (tool === 'text') {
      const pt = getCanvasCoords(e.clientX, e.clientY);
      onQuickAddTextAt(pt.x, pt.y);
      return;
    }

    if (tool === 'laser') {
      const pt = getCanvasCoords(e.clientX, e.clientY);
      setLaserPos(pt);
      return;
    }

    setIsDrawing(true);
    isDrawingRef.current = true;
    const pt = getCanvasCoords(e.clientX, e.clientY);
    currentPointsRef.current = [pt];
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isPinchingRef.current) return;

    if (tool === 'laser') {
      const pt = getCanvasCoords(e.clientX, e.clientY);
      setLaserPos(pt);
      return;
    }

    if (!isDrawing) return;
    const pt = getCanvasCoords(e.clientX, e.clientY);
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
      ctx.lineWidth = tool === 'eraser' ? strokeWidth * 3 : strokeWidth;
      ctx.strokeStyle = tool === 'eraser' ? '#fbfbfa' : color;
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
    if (isPanning) {
      setIsPanning(false);
      panStartRef.current = null;
    }

    if (tool === 'laser') {
      setLaserPos(null);
      return;
    }

    if (!isDrawing) return;
    setIsDrawing(false);
    isDrawingRef.current = false;

    if (currentPointsRef.current.length >= 2) {
      const newStroke: DrawingStroke = {
        id: `stroke_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        type: 'stroke',
        tool: tool === 'highlighter' ? 'highlighter' : 'pen',
        points: [...currentPointsRef.current],
        color: tool === 'eraser' ? '#fbfbfa' : color,
        width: tool === 'eraser' ? strokeWidth * 3 : strokeWidth,
        opacity: tool === 'highlighter' ? 0.35 : 1.0,
      };
      onAddStroke(newStroke);
    }
    currentPointsRef.current = [];
  };

  // Dragging logic for TextBlockView (mouse, touch & pen)
  const handleDragStart = (e: React.MouseEvent | React.PointerEvent, blockId: string) => {
    if (isPinchingRef.current) return;
    const block = textBlocks.find((b) => b.id === blockId);
    if (!block) return;
    onSelectBlock(blockId);
    setDraggingBlockId(blockId);

    const board = boardRef.current;
    const rect = board ? board.getBoundingClientRect() : { left: 0, top: 0, width: totalWidth, height: totalHeight };
    const currentScale = rect.width / totalWidth || 1;

    const pointerX = (e.clientX - rect.left) / currentScale;
    const pointerY = (e.clientY - rect.top) / currentScale;

    dragOffsetRef.current = {
      x: pointerX - block.x,
      y: pointerY - block.y,
    };
  };

  // Global window listeners for text block dragging
  useEffect(() => {
    if (!draggingBlockId) return;

    const onGlobalPointerMove = (e: PointerEvent) => {
      const block = textBlocks.find((b) => b.id === draggingBlockId);
      if (!block) return;

      const board = boardRef.current;
      const rect = board ? board.getBoundingClientRect() : { left: 0, top: 0, width: totalWidth, height: totalHeight };
      const currentScale = rect.width / totalWidth || 1;

      const pointerX = (e.clientX - rect.left) / currentScale;
      const pointerY = (e.clientY - rect.top) / currentScale;

      const newX = Math.max(10, Math.min(totalWidth - 60, Math.round(pointerX - dragOffsetRef.current.x)));
      const newY = Math.max(10, Math.min(totalHeight - 60, Math.round(pointerY - dragOffsetRef.current.y)));

      onUpdateBlock({
        ...block,
        x: newX,
        y: newY,
      });
    };

    const onGlobalPointerUp = () => {
      setDraggingBlockId(null);
    };

    window.addEventListener('pointermove', onGlobalPointerMove);
    window.addEventListener('pointerup', onGlobalPointerUp);
    window.addEventListener('pointercancel', onGlobalPointerUp);

    return () => {
      window.removeEventListener('pointermove', onGlobalPointerMove);
      window.removeEventListener('pointerup', onGlobalPointerUp);
      window.removeEventListener('pointercancel', onGlobalPointerUp);
    };
  }, [draggingBlockId, textBlocks, onUpdateBlock, totalWidth, totalHeight, boardRef]);

  // Space extension actions
  const handleAddSpace = (direction: 'vertical' | 'horizontal', amount = 800) => {
    if (direction === 'vertical') {
      setBoardExtraHeight((prev) => prev + amount);
      setPan((prev) => ({ ...prev, y: Math.max(-totalHeight + viewportSize.height - 200, prev.y - 150) }));
    } else {
      setBoardExtraWidth((prev) => prev + amount);
      setPan((prev) => ({ ...prev, x: Math.max(-totalWidth + viewportSize.width - 200, prev.x - 150) }));
    }
  };

  const handleResetSpace = () => {
    setBoardExtraWidth(0);
    setBoardExtraHeight(0);
    handleFitToScreen();
  };

  const handleScrollToTop = () => {
    setPan({
      x: Math.round(Math.max(16, (viewportSize.width - totalWidth * zoom) / 2)),
      y: 16,
    });
  };

  // Zoom control helpers
  const handleZoomChange = (delta: number) => {
    const currentZoom = zoomRef.current;
    const nextZoom = Math.min(3.5, Math.max(0.2, Math.round((currentZoom + delta) * 100) / 100));

    const centerX = viewportSize.width / 2;
    const centerY = viewportSize.height / 2;

    const boardPointX = (centerX - panRef.current.x) / currentZoom;
    const boardPointY = (centerY - panRef.current.y) / currentZoom;

    const nextPanX = centerX - boardPointX * nextZoom;
    const nextPanY = centerY - boardPointY * nextZoom;

    setZoom(nextZoom);
    setPan({ x: nextPanX, y: nextPanY });
  };

  const handleResetZoom = () => {
    const currentZoom = zoomRef.current;
    const nextZoom = 1.0;

    const centerX = viewportSize.width / 2;
    const centerY = viewportSize.height / 2;

    const boardPointX = (centerX - panRef.current.x) / currentZoom;
    const boardPointY = (centerY - panRef.current.y) / currentZoom;

    const nextPanX = centerX - boardPointX * nextZoom;
    const nextPanY = centerY - boardPointY * nextZoom;

    setZoom(nextZoom);
    setPan({ x: nextPanX, y: nextPanY });
  };

  const handleFitToScreen = () => {
    const availableW = viewportSize.width - 32;
    const availableH = viewportSize.height - 32;
    const fitScale = Math.min(availableW / totalWidth, availableH / totalHeight, 1.0);
    const clampedFit = Math.max(0.2, Math.min(fitScale, 1.0));
    const centerX = Math.round((viewportSize.width - totalWidth * clampedFit) / 2);
    const centerY = Math.max(16, Math.round((viewportSize.height - totalHeight * clampedFit) / 2));
    setZoom(clampedFit);
    setPan({ x: centerX, y: centerY });
  };

  return (
    <div
      ref={scrollContainerRef}
      id="whiteboard-viewport-container"
      className="relative w-full h-full overflow-hidden select-none bg-stone-200/70 touch-none"
      style={{
        cursor: tool === 'hand' ? (isPanning ? 'grabbing' : 'grab') : 'default',
      }}
    >
      {/* Floating Whiteboard Space Controller Widget (Top-Right) */}
      <div
        className="absolute top-3 right-3 z-30 flex items-center gap-1 sm:gap-1.5 p-1 sm:px-3 sm:py-1.5 rounded-xl shadow-lg border text-xs transition-colors backdrop-blur-md bg-white/95 text-stone-700 border-stone-200/90"
      >
        <div
          className="flex items-center gap-1 sm:gap-1.5 font-medium pr-1 sm:pr-1.5 border-r border-stone-200 text-stone-700"
        >
          <Maximize2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span className="font-semibold text-[11px] hidden sm:inline">白板空間</span>
          {boardExtraHeight > 0 && (
            <span
              className="px-1 py-0.5 font-bold rounded text-[10px] bg-indigo-50 text-indigo-700"
            >
              +{boardExtraHeight}
            </span>
          )}
          {boardExtraWidth > 0 && (
            <span
              className="px-1 py-0.5 font-bold rounded text-[10px] bg-emerald-50 text-emerald-700"
            >
              寬+{boardExtraWidth}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => handleAddSpace('vertical', 800)}
          className="px-1.5 sm:px-2 py-1 font-semibold rounded-lg transition-colors flex items-center gap-0.5 sm:gap-1 text-[11px] cursor-pointer bg-stone-100 hover:bg-indigo-50 hover:text-indigo-600 text-stone-700"
          title="增加下方畫布高度 (+800px)"
        >
          <Plus className="w-3.5 h-3.5 text-indigo-500" />
          <span>加長</span>
        </button>

        <button
          type="button"
          onClick={() => handleAddSpace('horizontal', 800)}
          className="px-1.5 sm:px-2 py-1 font-semibold rounded-lg transition-colors flex items-center gap-0.5 sm:gap-1 text-[11px] cursor-pointer bg-stone-100 hover:bg-indigo-50 hover:text-indigo-600 text-stone-700"
          title="增加右方畫布寬度 (+800px)"
        >
          <Plus className="w-3.5 h-3.5 text-indigo-500" />
          <span>加寬</span>
        </button>

        {(boardExtraHeight > 0 || boardExtraWidth > 0) && (
          <>
            <button
              type="button"
              onClick={handleScrollToTop}
              className="p-1 rounded-lg transition-colors cursor-pointer hover:bg-stone-100 text-stone-500 hover:text-stone-800"
              title="回到白板起點"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResetSpace}
              className="p-1 hover:bg-stone-100 rounded-lg text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
              title="重設為原始大小"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>

      {/* Floating Zoom & Viewport Controller (Bottom-Right, mobile and tablet touch friendly) */}
      <div
        id="whiteboard-zoom-controller"
        className="absolute bottom-20 right-3 sm:bottom-5 sm:right-5 z-40 flex items-center gap-1 p-1 sm:p-1.5 rounded-2xl shadow-xl border backdrop-blur-md bg-white/95 text-stone-700 border-stone-200/90 text-xs"
      >
        <button
          type="button"
          onClick={() => handleZoomChange(-0.15)}
          className="p-1.5 sm:p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 active:scale-95 transition-all cursor-pointer"
          title="縮小畫面 (Pinch In 或滑鼠滾輪)"
        >
          <Minus className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleResetZoom}
          className="px-1.5 sm:px-2 py-1 font-mono font-bold text-[11px] sm:text-xs text-stone-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
          title="點擊重設為 100% 原始大小"
        >
          {Math.round(zoom * 100)}%
        </button>

        <button
          type="button"
          onClick={() => handleZoomChange(0.15)}
          className="p-1.5 sm:p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 active:scale-95 transition-all cursor-pointer"
          title="放大畫面 (Pinch Out 或滑鼠滾輪)"
        >
          <Plus className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-stone-200 mx-0.5" />

        <button
          type="button"
          onClick={handleFitToScreen}
          className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-[11px] transition-colors cursor-pointer active:scale-95"
          title="適應螢幕 / 看白板全貌 (自動計算縮放)"
        >
          <Scan className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">看全貌</span>
        </button>

        <button
          type="button"
          onClick={handleScrollToTop}
          className="p-1.5 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer"
          title="置中白板起點"
        >
          <Compass className="w-4 h-4" />
        </button>

        <div className="hidden md:flex items-center gap-1 pl-1 text-[10px] text-stone-400 select-none border-l border-stone-200">
          <Hand className="w-3 h-3 text-stone-400" />
          <span>雙指滑動移動</span>
        </div>
      </div>

      {/* Expandable Whiteboard Inner Stage with Hardware Accelerated Transform */}
      <div
        ref={stageRef}
        id="whiteboard-stage-wrapper"
        style={{
          transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
          transformOrigin: '0 0',
          willChange: 'transform',
        }}
        className="absolute left-0 top-0 select-none"
      >
        <div
          ref={boardRef}
          id="whiteboard-inner-stage"
          onDoubleClick={(e) => {
            const board = boardRef.current;
            if (!board) return;
            const rect = board.getBoundingClientRect();
            const currentScale = rect.width / totalWidth || 1;
            onQuickAddTextAt(
              Math.round((e.clientX - rect.left) / currentScale),
              Math.round((e.clientY - rect.top) / currentScale)
            );
          }}
          style={{
            width: `${totalWidth}px`,
            height: `${totalHeight}px`,
            backgroundColor: '#fbfbfa',
          }}
          className="relative transition-[width,height] duration-200 select-none shadow-2xl border border-stone-300/80 rounded-sm"
        >
          {/* Visual Tianzige Background overlay if selected */}
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

          {/* Visual Mizige Background overlay if selected */}
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

          {/* Visual Lines overlay if selected */}
          {gridType === 'lines' && (
            <div
              className="absolute inset-0 pointer-events-none opacity-40"
              style={{
                backgroundImage: 'linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)',
                backgroundSize: '100% 48px',
              }}
            />
          )}

          {/* Visual Dots overlay if selected */}
          {gridType === 'dots' && (
            <div
              className="absolute inset-0 pointer-events-none opacity-40"
              style={{
                backgroundImage: 'radial-gradient(circle, #94a3b8 1.5px, transparent 1.5px)',
                backgroundSize: '32px 32px',
              }}
            />
          )}

          {/* HTML5 Canvas for Freehand Drawing */}
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className={`absolute inset-0 w-full h-full z-10 ${
              tool === 'hand'
                ? isPanning
                  ? 'cursor-grabbing'
                  : 'cursor-grab'
                : tool === 'select'
                ? 'cursor-default'
                : 'cursor-crosshair'
            }`}
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
                  isDragging={draggingBlockId === block.id}
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

          {/* Right Expansion Button */}
          <div
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
            }}
            className="z-30 pointer-events-auto opacity-75 hover:opacity-100 transition-opacity"
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleAddSpace('horizontal', 800);
              }}
              title="向右擴展白板空間 (+800px)"
              className="flex flex-col items-center gap-1 px-2 py-3 text-xs font-semibold rounded-xl shadow-md border transition-all cursor-pointer backdrop-blur-md bg-white/95 hover:bg-white text-stone-700 hover:text-indigo-600 border-stone-200 hover:border-indigo-400"
            >
              <ArrowRight className="w-4 h-4 text-indigo-500" />
              <span className="text-[10px] [writing-mode:vertical-lr]">加寬空間</span>
            </button>
          </div>

          {/* Bottom Space Expansion Action Banner */}
          <div
            style={{
              position: 'absolute',
              bottom: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
            }}
            className="z-30 pointer-events-auto flex flex-col items-center justify-center gap-1.5"
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleAddSpace('vertical', 800);
              }}
              className="flex items-center gap-2.5 px-6 py-3 font-semibold rounded-2xl shadow-md hover:shadow-lg border-2 border-dashed transition-all hover:scale-[1.02] active:scale-95 group cursor-pointer backdrop-blur-md bg-white/95 hover:bg-white text-stone-700 hover:text-indigo-600 border-stone-300 hover:border-indigo-400"
            >
              <Plus
                className="w-5 h-5 group-hover:rotate-90 transition-transform text-indigo-500"
              />
              <span className="text-sm">增加下方空間 (+800px) — 繼續打字或使用畫筆書寫</span>
            </button>
            <span className="text-[11px] select-none text-stone-400">
              雙擊白板任意位置即可直接打字輸入 ‧ 手機平板隨時可用雙指移動與縮放
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
