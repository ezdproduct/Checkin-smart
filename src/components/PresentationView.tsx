import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Slide, PresentationElement, TextElement, ImageElement } from '@/src/types';
import { ElementType } from '@/src/types';
import { getSlideDimensions, convertToDirectUrl } from '@/src/utils/presentationUtils';
import { MaximizeIcon, MinimizeIcon } from './Icons';
import { useBroadcastChannel } from '@/src/hooks/useBroadcastChannel';

interface PresentationViewProps {
  slides: Slide[];
  onExit: () => void;
  initialSlideIndex: number;
  autoFullscreen?: boolean;
}

export const PresentationView: React.FC<PresentationViewProps> = ({ slides, onExit, initialSlideIndex, autoFullscreen }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(initialSlideIndex);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scale, setScale] = useState(1);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const presentationRootRef = useRef<HTMLDivElement>(null);

  useBroadcastChannel(useCallback((message) => {
    if (message.type === 'GOTO_SLIDE') {
      setCurrentSlideIndex(message.payload.index);
    }
  }, []));

  const slideDesignDimensions = getSlideDimensions('16:9');

  const nextSlide = useCallback(() => {
    setCurrentSlideIndex(prev => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlideIndex(prev => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goToFirstSlide = useCallback(() => {
    setCurrentSlideIndex(0);
  }, []);

  const goToLastSlide = useCallback(() => {
    setCurrentSlideIndex(slides.length - 1);
  }, [slides.length]);

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
      if (e.key === 'ArrowRight') {
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === 'Home') {
        e.preventDefault();
        goToFirstSlide();
      } else if (e.key === 'End') {
        e.preventDefault();
        goToLastSlide();
      } else if (e.key === 'Escape') {
        window.close();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide, goToFirstSlide, goToLastSlide]);

  useEffect(() => {
    const doc = presentationRootRef.current?.ownerDocument;
    if (!doc) return;

    const handleFullscreenChange = () => setIsFullscreen(!!doc.fullscreenElement);
    doc.addEventListener('fullscreenchange', handleFullscreenChange);

    if (autoFullscreen) {
      const timer = setTimeout(() => {
        if (!doc.fullscreenElement) {
          doc.documentElement.requestFullscreen().catch(err => {
            console.warn(`Tự động toàn màn hình thất bại: ${err.message}. Cần có tương tác của người dùng.`);
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
    const doc = presentationRootRef.current?.ownerDocument;
    if (!doc) return;

    if (!doc.fullscreenElement) {
      doc.documentElement.requestFullscreen().catch(err => {
        console.error(`Lỗi toàn màn hình: ${err.message}`);
      });
    } else {
      doc.exitFullscreen();
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleClick = () => {
    if (contextMenu) {
      setContextMenu(null);
    }
  };

  const currentSlide = slides[currentSlideIndex];
  if (!currentSlide) return null;

  const renderElement = (element: PresentationElement) => {
    const style: React.CSSProperties = {
      position: 'absolute',
      left: `${(element.x / slideDesignDimensions.width) * 100}%`,
      top: `${(element.y / slideDesignDimensions.height) * 100}%`,
      width: `${(element.width / slideDesignDimensions.width) * 100}%`,
      height: `${(element.height / slideDesignDimensions.height) * 100}%`,
      transform: `rotate(${element.rotation}deg)`,
      whiteSpace: 'pre-wrap', 
      wordBreak: 'break-word'
    };

    switch (element.type) {
        case ElementType.TEXT: {
            const textEl = element as TextElement;
            const textStyle: React.CSSProperties = {
                ...style,
                fontSize: `${textEl.fontSize}px`,
                color: textEl.color,
                fontFamily: textEl.fontFamily,
                textAlign: textEl.align,
                fontWeight: textEl.fontWeight,
                fontStyle: textEl.fontStyle,
                textDecoration: textEl.textDecoration,
                textTransform: textEl.textTransform,
            };
            return <div style={textStyle}>{textEl.text}</div>;
        }
        case ElementType.IMAGE: {
            const imgEl = element as ImageElement;
            return <img src={convertToDirectUrl(imgEl.src)} alt="" style={style} className="object-cover" referrerPolicy="no-referrer" />;
        }
        default:
            return null;
    }
  }
  
  const slideStyle: React.CSSProperties = {
    backgroundColor: currentSlide.backgroundColor,
    backgroundImage: currentSlide.backgroundImage ? `url(${convertToDirectUrl(currentSlide.backgroundImage)})` : 'none',
    backgroundSize: currentSlide.backgroundSize ? `${currentSlide.backgroundSize}%` : 'cover',
    backgroundPosition: `${currentSlide.backgroundPositionX || 50}% ${currentSlide.backgroundPositionY || 50}%`,
    width: `${slideDesignDimensions.width}px`,
    height: `${slideDesignDimensions.height}px`,
  };

  return (
    <div 
      ref={presentationRootRef} 
      className="fixed inset-0 bg-black overflow-hidden"
      onContextMenu={handleContextMenu}
      onClick={handleClick}
    >
      <div 
        className="relative overflow-hidden"
        style={{
          ...slideStyle,
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) scale(${scale})`,
        }}
      >
        {currentSlide.elements.map(el => <div key={el.id}>{renderElement(el)}</div>)}
      </div>

      {contextMenu && (
        <div 
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="absolute flex items-center space-x-4 p-2 bg-black/60 rounded-lg backdrop-blur-sm text-white z-20"
        >
            <span className="font-mono px-2">{currentSlideIndex + 1} / {slides.length}</span>
            <div className="w-px h-6 bg-white/30"></div>
            <button 
                onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                title={isFullscreen ? 'Thoát toàn màn hình' : 'Vào toàn màn hình'}
            >
                {isFullscreen ? <MinimizeIcon className="w-6 h-6" /> : <MaximizeIcon className="w-6 h-6" />}
            </button>
        </div>
      )}
    </div>
  );
};