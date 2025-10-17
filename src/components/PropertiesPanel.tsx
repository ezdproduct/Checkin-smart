import React from 'react';
import type { PresentationElement, Slide } from '@/src/types';
import { ElementProperties } from './properties/ElementProperties';
import { SlideProperties } from './properties/SlideProperties';

interface PropertiesPanelProps {
  element: PresentationElement | undefined;
  slide: Slide | undefined;
  onUpdateElement: (updatedElement: PresentationElement) => void;
  onUpdateSlide: (updates: Partial<Pick<Slide, 'backgroundColor' | 'backgroundImage' | 'backgroundPositionX' | 'backgroundPositionY' | 'backgroundSize'>>) => void;
  onOpenBackgroundEditor: (imageSrc: string) => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ element, slide, onUpdateElement, onUpdateSlide, onOpenBackgroundEditor }) => {
  if (element) {
    return (
      <ElementProperties 
        element={element}
        onUpdateElement={onUpdateElement}
      />
    );
  }

  if (slide) {
    return (
      <SlideProperties 
        slide={slide}
        onUpdateSlide={onUpdateSlide}
        onOpenBackgroundEditor={onOpenBackgroundEditor}
      />
    );
  }

  return (
    <div className="p-4 text-center text-gray-500">Chọn một phần tử hoặc một slide để xem thuộc tính của nó.</div>
  );
};