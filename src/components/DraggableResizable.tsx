import React, { useRef, useEffect } from 'react';
import type { PresentationElement, TextElement } from '@/src/types';
import { ElementType } from '@/src/types';

const GRID_SIZE = 10;

interface DraggableResizableProps {
  element: PresentationElement;
  onUpdate: (el: PresentationElement) => void;
  isSelected: boolean;
  onSelect: (id: string | null) => void;
  onClick: (id: string) => void;
  children: React.ReactNode;
}

export const DraggableResizable: React.FC<DraggableResizableProps> = ({ element, onUpdate, isSelected, onSelect, onClick, children }) => {
  const actionRef = useRef({
      isDragging: false,
      isResizing: false,
      dragStartX: 0,
      dragStartY: 0,
      resizeHandle: '',
      elementStartX: 0,
      elementStartY: 0,
      elementStartWidth: 0,
      elementStartHeight: 0,
      elementStartFontSize: 0,
  });

  const handleMouseDownOnElement = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(element.id);
    
    actionRef.current.isDragging = true;
    actionRef.current.isResizing = false;
    actionRef.current.dragStartX = e.clientX;
    actionRef.current.dragStartY = e.clientY;
    actionRef.current.elementStartX = element.x;
    actionRef.current.elementStartY = element.y;
  };

  const handleMouseDownOnResizeHandle = (e: React.MouseEvent, handle: string) => {
    e.stopPropagation();
    onSelect(element.id);
    
    actionRef.current.isResizing = true;
    actionRef.current.isDragging = false;
    actionRef.current.resizeHandle = handle;
    actionRef.current.dragStartX = e.clientX;
    actionRef.current.dragStartY = e.clientY;
    actionRef.current.elementStartX = element.x;
    actionRef.current.elementStartY = element.y;
    actionRef.current.elementStartWidth = element.width;
    actionRef.current.elementStartHeight = element.height;
    if (element.type === ElementType.TEXT) {
        actionRef.current.elementStartFontSize = (element as TextElement).fontSize;
    } else {
        actionRef.current.elementStartFontSize = 0;
    }
  };
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!actionRef.current.isDragging && !actionRef.current.isResizing) return;
      e.preventDefault();
      
      const dx = e.clientX - actionRef.current.dragStartX;
      const dy = e.clientY - actionRef.current.dragStartY;
      
      if (actionRef.current.isDragging) {
        onUpdate({ 
            ...element, 
            x: actionRef.current.elementStartX + dx, 
            y: actionRef.current.elementStartY + dy 
        });
      } else if (actionRef.current.isResizing) {
        let { x, y, width, height } = {
            x: actionRef.current.elementStartX,
            y: actionRef.current.elementStartY,
            width: actionRef.current.elementStartWidth,
            height: actionRef.current.elementStartHeight,
        };

        const handle = actionRef.current.resizeHandle;

        if (handle.includes('bottom')) {
            height = actionRef.current.elementStartHeight + dy;
        }
        if (handle.includes('top')) {
            y = actionRef.current.elementStartY + dy;
            height = actionRef.current.elementStartHeight - dy;
        }
        if (handle.includes('right')) {
            width = actionRef.current.elementStartWidth + dx;
        }
        if (handle.includes('left')) {
            x = actionRef.current.elementStartX + dx;
            width = actionRef.current.elementStartWidth - dx;
        }

        if (width > GRID_SIZE && height > GRID_SIZE) {
            const updatedElement: PresentationElement = { 
                ...element, 
                x: Math.round(x), 
                y: Math.round(y), 
                width: Math.round(width), 
                height: Math.round(height) 
            };

            if (updatedElement.type === ElementType.TEXT && actionRef.current.elementStartFontSize > 0) {
                const startHeight = actionRef.current.elementStartHeight;
                if (startHeight > 0) {
                    const heightRatio = height / startHeight;
                    const newFontSize = Math.max(1, Math.round(actionRef.current.elementStartFontSize * heightRatio));
                    (updatedElement as TextElement).fontSize = newFontSize;
                }
            }

            onUpdate(updatedElement);
        }
      }
    };

    const handleMouseUp = () => {
      actionRef.current.isDragging = false;
      actionRef.current.isResizing = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [element, onUpdate]);


  const resizeHandles = [
    'top-left', 'top-center', 'top-right',
    'middle-left', 'middle-right',
    'bottom-left', 'bottom-center', 'bottom-right'
  ];

  const getHandleStyle = (handle: string): React.CSSProperties => {
    const style: React.CSSProperties = {
      position: 'absolute',
      width: '10px',
      height: '10px',
      backgroundColor: '#4f46e5',
      border: '1px solid #fff',
      borderRadius: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 10,
    };
    if (handle.includes('top')) style.top = '0%';
    if (handle.includes('bottom')) style.top = '100%';
    if (handle.includes('middle')) style.top = '50%';
    if (handle.includes('left')) style.left = '0%';
    if (handle.includes('right')) style.left = '100%';
    if (handle.includes('center')) style.left = '50%';

    const cursors: { [key: string]: string } = {
        'top-left': 'nwse-resize',
        'top-center': 'ns-resize',
        'top-right': 'nesw-resize',
        'middle-left': 'ew-resize',
        'middle-right': 'ew-resize',
        'bottom-left': 'nesw-resize',
        'bottom-center': 'ns-resize',
        'bottom-right': 'nwse-resize',
    };
    style.cursor = cursors[handle];

    return style;
  };
  
  return (
    <div
      onMouseDown={handleMouseDownOnElement}
      onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
          onClick(element.id);
      }}
      style={{
        position: 'absolute',
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        transform: `rotate(${element.rotation}deg)`,
        cursor: actionRef.current.isDragging ? 'grabbing' : 'grab',
        border: isSelected ? '2px solid #4f46e5' : '1px dashed transparent',
        boxSizing: 'border-box'
      }}
    >
        <div 
          style={{width: '100%', height: '100%'}}
        >
            {children}
        </div>
        {isSelected && resizeHandles.map((handle: string) => (
            <div 
                key={handle}
                style={getHandleStyle(handle)}
                onMouseDown={(e: React.MouseEvent) => handleMouseDownOnResizeHandle(e, handle)}
            />
        ))}
    </div>
  );
}