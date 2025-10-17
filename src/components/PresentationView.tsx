import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Slide, DataSource } from '@/src/types';
import { getSlideDimensions } from '@/src/utils/presentationUtils';
import { MaximizeIcon, MinimizeIcon } from './Icons';
import { ContextMenu, ContextMenuItem } from './ContextMenu';
import { SlideRenderer } from './SlideRenderer';
import { useAutoplay } from '@/src/hooks/useAutoplay';

interface PresentationViewProps {
  slides: Slide[];
  onExit: () => void;
  initialSlideIndex: number;
  autoFullscreen?: boolean;
  mode: 'manual' | 'autoplay';
  dataSources: DataSource[];
  dispatch: React.Dispatch<any>;
  autoplayDuration: number;
}

export const PresentationView: React.FC<PresentationViewProps> = (props) => {
  const { slides, onExit, autoFullscreen, mode, autoplayDuration } = props;
  const { slideState, goToNextSlide, goToPrevSlide } = useAutoplay(props);
  
  const [scale, setScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number }>({ visible: false, x: 0, y: 0 });
  const presentationRootRef = useRef<HTMLDivElement>(null);
  
  const slideDesignDimensions = getSlideDimensions('16:9');

  useEffect(() => {
    const calculateScale = () => {
      if (presentationRootRef.current) {
        const viewportWidth = presentationRootRef.current.offsetWidth;
        const viewportHeight = presentationRootRef.current.offsetHeight;
        const designWidth = slideDesignDimensions.width;
        const designHeight = slideDesignDimensions.height;
        const scaleX = viewportWidth / designWidth;
        const scaleY = viewportHeight / designHeight;
        setScale(Math.min(scaleX, scaleY));
      }
    };
    window.addEventListener('resize', calculateScale);
    calculateScale();
    return () => window.removeEventListener('resize', calculateScale);
  }, [slideDesignDimensions]);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (mode === 'manual') {
        if (e.key === 'ArrowRight') goToNextSlide();
        else if (e.key === 'ArrowLeft') goToPrevSlide();
      }
      if (e.key === 'Escape') {
        onExit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, goToNextSlide, goToPrevSlide, onExit]);

  useEffect(() => {
    const doc = presentationRootRef.current?.ownerDocument;
    if (!doc) return;

    const handleFullscreenChange = () => setIsFullscreen(!!doc.fullscreenElement);
    doc.addEventListener('fullscreenchange', handleFullscreenChange);

    if (autoFullscreen) {
      const timer = setTimeout(() => {
        if (doc.documentElement && !doc.fullscreenElement) {
          doc.documentElement.requestFullscreen().catch(err => {
            console.warn(`Tự động toàn màn hình thất bại: ${err.message}.`);
          });
        }
      }, 100);
      return () => {
        clearTimeout(timer);
        doc.removeEventListener('fullscreenchange', handleFullscreenChange);
      };
    }
    return () => doc.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [autoFullscreen]);

  const toggleFullscreen = () => {
    const doc = presentationRootRef.current?.ownerDocument?.documentElement;
    if (!doc) return;
    if (!isFullscreen) {
      doc.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen();
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY });
  };

  const closeContextMenu = () => setContextMenu({ ...contextMenu, visible: false });

  return (
    <div 
      ref={presentationRootRef} 
      className="fixed inset-0 bg-black overflow-hidden"
      onContextMenu={handleContextMenu}
    >
      <div 
        className="relative"
        style={{
          width: `${slideDesignDimensions.width}px`,
          height: `${slideDesignDimensions.height}px`,
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) scale(${scale})`,
        }}
      >
        {slideState.previous && (
            <SlideRenderer 
                key={slideState.previous.id}
                slide={slideState.previous}
                autoplayDuration={autoplayDuration}
                mode={mode}
            />
        )}
        <SlideRenderer 
            key={slideState.current.id}
            slide={slideState.current}
            autoplayDuration={autoplayDuration}
            mode={mode}
            className={slideState.isTransitioning ? 'animate-ripple-in' : ''}
        />
      </div>
      {contextMenu.visible && (
        <ContextMenu x={contextMenu.x} y={contextMenu.y} onClose={closeContextMenu}>
          <ContextMenuItem onClick={() => { toggleFullscreen(); closeContextMenu(); }}>
            {isFullscreen ? <MinimizeIcon className="h-4 w-4" /> : <MaximizeIcon className="h-4 w-4" />}
            <span>{isFullscreen ? 'Thoát Toàn màn hình' : 'Toàn màn hình'}</span>
          </ContextMenuItem>
        </ContextMenu>
      )}
    </div>
  );
};