import React from 'react';
import type { Slide } from '@/src/types';
import { PlusIcon } from './Icons';
import { SlideThumbnail } from './SlideThumbnail';
import { PresentationButton } from './PresentationButton';

interface BottomBarProps {
  slides: Slide[];
  activeSlideId: string | null;
  dispatch: React.Dispatch<any>;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onPresent: () => void;
}

export const BottomBar: React.FC<BottomBarProps> = ({ slides, activeSlideId, dispatch, zoom, onZoomChange, onPresent }) => {

  const handleAddSlide = () => {
    dispatch({ type: 'ADD_SLIDE' });
  };

  return (
    <>
      <footer className="flex-shrink-0 w-full bg-surface-100 border-t border-gray-200 p-2 flex flex-col shadow-sm space-y-2">
        <div className="flex items-center justify-end px-2">
          <div className="flex items-center space-x-3">
              <PresentationButton onClick={onPresent} />
              <span className="text-sm font-medium w-12 text-right tabular-nums text-gray-700">{Math.round(zoom * 100)}%</span>
              <input 
                  type="range"
                  min="0.2"
                  max="2"
                  step="0.05"
                  value={zoom}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => onZoomChange(parseFloat(e.target.value))}
                  className="w-40 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:bg-primary-600 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-sm"
                  aria-label="Thanh trượt thu phóng"
              />
          </div>
        </div>
        <div className="flex items-center space-x-2 w-full">
          <div className="flex items-center space-x-2 overflow-x-auto p-2 flex-grow" style={{minHeight: '90px'}}>
            {slides.map((slide: Slide, index: number) => (
                <SlideThumbnail
                  key={slide.id}
                  slide={slide}
                  index={index}
                  isActive={activeSlideId === slide.id}
                  onClick={() => dispatch({ type: 'SELECT_SLIDE', payload: { slideId: slide.id } })}
                />
            ))}
          </div>
          <button
              onClick={handleAddSlide}
              className="w-32 h-full flex-shrink-0 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center text-gray-500 hover:border-primary-500 hover:text-primary-500 transition-colors duration-200 hover:shadow-sm"
              title="Thêm slide"
          >
              <PlusIcon className="w-6 h-6" />
          </button>
        </div>
      </footer>
    </>
  );
};