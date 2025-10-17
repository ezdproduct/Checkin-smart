import React from 'react';
import type { Slide, PresentationElement } from '@/src/types';
import { getSlideDimensions, renderThumbnailElement, getAspectRatioClass } from '@/src/utils/presentationUtils';
import { DownloadIcon } from './Icons';

interface SlideThumbnailProps {
  slide: Slide;
  index: number;
  isActive: boolean;
  onClick: () => void;
}

const aspectRatio = '16:9';
const slideDimensions = getSlideDimensions(aspectRatio);

export const SlideThumbnail: React.FC<SlideThumbnailProps> = ({ slide, index, isActive, onClick }) => {
  const aspectRatioClass = getAspectRatioClass(aspectRatio);

  const handleExport = (e: React.MouseEvent) => {
    e.stopPropagation();
    const jsonString = JSON.stringify(slide, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `slide-template.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      onClick={onClick}
      className={`w-32 flex-shrink-0 ${aspectRatioClass} ring-2 rounded-md cursor-pointer transition-all duration-200 ${
          isActive ? 'ring-primary-500 shadow-md' : 'ring-transparent hover:ring-primary-500/50 hover:shadow-sm'
      } bg-white flex items-center justify-center p-1 overflow-hidden relative group`}
    >
      <div 
          className="w-full h-full bg-cover bg-center rounded relative overflow-hidden"
          style={{
              backgroundColor: slide.backgroundColor,
              backgroundImage: slide.backgroundImage ? `url(${slide.backgroundImage})` : 'none',
              backgroundSize: slide.backgroundSize ? `${slide.backgroundSize}%` : 'cover',
              backgroundPosition: `${slide.backgroundPositionX || 50}% ${slide.backgroundPositionY || 50}%`,
          }}
      >
        {slide.elements.map((el: PresentationElement) => renderThumbnailElement(el, slideDimensions, 128))}
      </div>
      <span className="absolute bottom-1 right-1 text-xs font-semibold bg-black/60 text-white rounded px-1.5 py-0.5">
          {index + 1}
      </span>
      <div className="absolute top-1 right-1 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleExport}
          className="p-1.5 bg-black/50 text-white rounded-full hover:bg-primary-600 transition-all"
          title="Xuất mẫu"
        >
          <DownloadIcon className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};