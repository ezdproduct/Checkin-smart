import React from 'react';
import type { Slide } from '@/src/types';
import { convertToDirectUrl } from '@/src/utils/presentationUtils';

interface SlideBackgroundProps {
  slide: Slide;
  className?: string;
}

export const SlideBackground: React.FC<SlideBackgroundProps> = ({ slide, className }) => {
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
    </div>
  );
};