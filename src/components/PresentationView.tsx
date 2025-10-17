import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Slide, PresentationElement, TextElement, ImageElement, DataSource } from '@/src/types';
import { ElementType } from '@/src/types';
import { getSlideDimensions, convertToDirectUrl } from '@/src/utils/presentationUtils';
import { MaximizeIcon, MinimizeIcon } from './Icons';
import { ContextMenu, ContextMenuItem } from './ContextMenu';

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

const getAnimationClass = (animation?: TextElement['entryAnimation']) => {
    switch (animation) {
        case 'fadeIn': return 'animate-fade-in';
        case 'slideInBottom': return 'animate-slide-in-bottom';
        case 'zoomIn': return 'animate-zoom-in';
        default: return '';
    }
};

interface SlideComponentProps {
    slide: Slide;
    slideDesignDimensions: { width: number; height: number };
    autoplayDuration: number;
    mode: 'manual' | 'autoplay';
    className?: string;
}

const SlideComponent: React.FC<SlideComponentProps> = ({ slide, slideDesignDimensions, autoplayDuration, mode, className }) => {
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
                const animationClass = getAnimationClass(textEl.entryAnimation);
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
                if (animationClass && mode === 'autoplay') {
                    textStyle.animationDuration = `${autoplayDuration}ms`;
                }
                return <div style={textStyle} className={animationClass}>{textEl.text}</div>;
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
        backgroundColor: slide.backgroundColor,
        backgroundImage: slide.backgroundVideo ? 'none' : (slide.backgroundImage ? `url(${convertToDirectUrl(slide.backgroundImage)})` : 'none'),
        backgroundSize: slide.backgroundSize ? `${slide.backgroundSize}%` : 'cover',
        backgroundPosition: `${slide.backgroundPositionX || 50}% ${slide.backgroundPositionY || 50}%`,
        width: '100%',
        height: '100%',
    };

    return (
        <div className={`absolute top-0 left-0 w-full h-full overflow-hidden ${className || ''}`} style={slideStyle}>
            {slide.backgroundVideo && (
                <video
                    key={slide.id}
                    src={convertToDirectUrl(slide.backgroundVideo)}
                    muted
                    autoPlay
                    loop
                    className="absolute top-0 left-0 w-full h-full object-cover"
                />
            )}
            {slide.elements.map(el => <div key={`${slide.id}-${el.id}`}>{renderElement(el)}</div>)}
        </div>
    );
};


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

export const PresentationView: React.FC<PresentationViewProps> = ({ slides, onExit, initialSlideIndex, autoFullscreen, mode, dataSources, dispatch, autoplayDuration }) => {
  const [slideState, setSlideState] = useState<{
      current: Slide;
      previous: Slide | null;
      isTransitioning: boolean;
  }>({
      current: slides[initialSlideIndex],
      previous: null,
      isTransitioning: false,
  });
  const [manualSlideIndex, setManualSlideIndex] = useState(initialSlideIndex);
  const [scale, setScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number }>({ visible: false, x: 0, y: 0 });
  const presentationRootRef = useRef<HTMLDivElement>(null);
  const presentationQueue = dataSources.find(ds => ds.id === 'presentation-queue')?.data || [];

  const slideDesignDimensions = getSlideDimensions('16:9');

  useEffect(() => {
    if (mode !== 'autoplay') {
        setSlideState({ current: slides[manualSlideIndex], previous: null, isTransitioning: false });
        return;
    }

    const welcomeSlide = slides[0];
    const templateSlide = slides[1]; 
    const nextItemInQueue = presentationQueue[0];

    if (nextItemInQueue && templateSlide) {
        const populatedSlide = populateSlideWithData(templateSlide, nextItemInQueue);
        
        setSlideState(prevState => ({
            previous: prevState.current,
            current: populatedSlide,
            isTransitioning: true,
        }));

        const transitionTimer = setTimeout(() => {
            setSlideState(prevState => ({ ...prevState, previous: null, isTransitioning: false }));
        }, 1000); // Duration of the ripple animation

        const slideTimer = setTimeout(() => {
            dispatch({ type: 'MOVE_QUEUE_ITEM_TO_PRESENTED', payload: { item: nextItemInQueue } });
        }, autoplayDuration);

        return () => {
            clearTimeout(transitionTimer);
            clearTimeout(slideTimer);
        };
    } else {
        setSlideState({ current: welcomeSlide, previous: null, isTransitioning: false });
    }
  }, [mode, presentationQueue, slides, manualSlideIndex, dispatch, autoplayDuration]);

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
            <SlideComponent 
                key={slideState.previous.id}
                slide={slideState.previous}
                slideDesignDimensions={slideDesignDimensions}
                autoplayDuration={autoplayDuration}
                mode={mode}
            />
        )}
        <SlideComponent 
            key={slideState.current.id}
            slide={slideState.current}
            slideDesignDimensions={slideDesignDimensions}
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