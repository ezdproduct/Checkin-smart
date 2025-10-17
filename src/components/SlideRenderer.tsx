import React from 'react';
import type { Slide, PresentationElement, TextElement, ImageElement } from '@/src/types';
import { ElementType } from '@/src/types';
import { getSlideDimensions, convertToDirectUrl, getAnimationClass } from '@/src/utils/presentationUtils';

interface SlideRendererProps {
    slide: Slide;
    autoplayDuration: number;
    mode: 'manual' | 'autoplay';
    className?: string;
}

export const SlideRenderer: React.FC<SlideRendererProps> = ({ slide, autoplayDuration, mode, className }) => {
    const slideDesignDimensions = getSlideDimensions('16:9');

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