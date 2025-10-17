import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Slide, PresentationElement, TextElement, ImageElement, DataSource } from '@/src/types';
import { ElementType } from '@/src/types';
import { getSlideDimensions, convertToDirectUrl } from '@/src/utils/presentationUtils';
import { MaximizeIcon, MinimizeIcon } from './Icons';

const populateSlideWithData = (templateSlide: Slide, dataRow: Record<string, any>): Slide => {
    const newSlide: Slide = JSON.parse(JSON.stringify(templateSlide));
    newSlide.id = `${templateSlide.id}-presented-${Date.now()}`;

    newSlide.elements = newSlide.elements.map(el => {
        const newEl = { ...el };
        if ((newEl.type === ElementType.TEXT || newEl.type === ElementType.IMAGE) && newEl.dataColumn) {
            const valueFromData = dataRow[newEl.dataColumn];
            if (valueFromData !== undefined) {
                if (newEl.type === ElementType.TEXT) (newEl as TextElement).text = String(valueFromData);
                else if (newEl.type === ElementType.IMAGE) (newEl as ImageElement).src = String(valueFromData);
            }
        }
        return newEl;
    });
    return newSlide;
};

interface PresentationViewProps {
  slides: Slide[];
  onExit: () => void;
  initialSlideIndex: number;
  autoFullscreen?: boolean;
  mode: 'manual' | 'autoplay';
  dataSources: DataSource[];
  dispatch: React.Dispatch<any>;
}

export const PresentationView: React.FC<PresentationViewProps> = ({ slides, onExit, initialSlideIndex, autoFullscreen, mode, dataSources, dispatch }) => {
  const [currentSlide, setCurrentSlide] = useState<Slide>(slides[initialSlideIndex]);
  const [manualSlideIndex, setManualSlideIndex] = useState(initialSlideIndex);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scale, setScale] = useState(1);
  const presentationRootRef = useRef<HTMLDivElement>(null);
  const presentationQueue = dataSources.find(ds => ds.id === 'presentation-queue')?.data || [];

  const slideDesignDimensions = getSlideDimensions('16:9');

  useEffect(() => {
    if (mode !== 'autoplay') {
        setCurrentSlide(slides[manualSlideIndex]);
        return;
    }

    const welcomeSlide = slides[0];
    const templateSlide = slides[1]; 
    const currentQueueItem = presentationQueue[0];

    if (currentQueueItem && templateSlide) {
        const populatedSlide = populateSlideWithData(templateSlide, currentQueueItem);
        setCurrentSlide(populatedSlide);

        const timer = setTimeout(() => {
            dispatch({ type: 'PROCESS_FIRST_QUEUE_ITEM' });
        }, 3000);

        return () => clearTimeout(timer);
    } else {
        setCurrentSlide(welcomeSlide);
    }
  }, [mode, presentationQueue, slides, manualSlideIndex, dispatch]);

  const nextSlide = useCallback(() => {
    setManualSlideIndex(prev => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setManualSlideIndex(prev => (prev - 1 + slides.length) % slides.length);
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
      if (mode === 'manual') {
        if (e.key === 'ArrowRight') nextSlide();
        else if (e.key === 'ArrowLeft') prevSlide();
      }
      if (e.key === 'Escape') {
        onExit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, nextSlide, prevSlide, onExit]);

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
    if (!isFullscreen) doc.requestFullscreen().catch(console.error);
    else document.exitFullscreen();
  };

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
      <div className="absolute bottom-4 right-4 flex items-center space-x-2 p-2 bg-black/50 rounded-lg text-white z-20">
        <button 
            onClick={toggleFullscreen}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
            title={isFullscreen ? 'Thoát toàn màn hình' : 'Vào toàn màn hình'}
        >
            {isFullscreen ? <MinimizeIcon className="w-5 h-5" /> : <MaximizeIcon className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
};