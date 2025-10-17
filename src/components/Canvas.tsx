import React, { useState } from 'react';
import type { Slide, PresentationElement, TextElement, ImageElement } from '@/src/types';
import { ElementType } from '@/src/types';
import { DraggableResizable } from './DraggableResizable';
import { EditableText } from './EditableText';
import { convertToDirectUrl } from '@/src/utils/presentationUtils';
import { ImageIcon } from './Icons';

interface CanvasProps {
  slide: Slide;
  dispatch: React.Dispatch<any>;
  selectedElementId: string | null;
}

export const Canvas: React.FC<CanvasProps> = ({ slide, dispatch, selectedElementId }) => {
  const [editingElementId, setEditingElementId] = useState<string | null>(null);

  const handleElementUpdate = (el: PresentationElement) => {
      dispatch({ type: 'UPDATE_ELEMENT', payload: { slideId: slide.id, element: el } });
  }

  const handleSelectElement = (id: string | null) => {
    if (id !== selectedElementId) {
        setEditingElementId(null);
    }
    dispatch({ type: 'SELECT_ELEMENT', payload: { elementId: id } });
  }

  const handleClickElement = (id: string) => {
    const element = slide.elements.find((e: PresentationElement) => e.id === id);
    if (element?.type === ElementType.TEXT) {
        setEditingElementId(id);
    }
  }

  const handleMouseDownOnCanvas = () => {
    handleSelectElement(null);
  };

  const renderElement = (element: PresentationElement) => {
    switch (element.type) {
      case ElementType.TEXT: {
        const textEl = element as TextElement;

        if (editingElementId === textEl.id) {
            return (
                <EditableText
                    element={textEl}
                    onUpdate={(newText: string) => handleElementUpdate({ ...textEl, text: newText })}
                    onExit={() => setEditingElementId(null)}
                />
            );
        }

        const textStyle: React.CSSProperties = {
            fontSize: textEl.fontSize,
            color: textEl.color,
            fontFamily: textEl.fontFamily,
            textAlign: textEl.align,
            fontWeight: textEl.fontWeight,
            fontStyle: textEl.fontStyle,
            textDecoration: textEl.textDecoration,
            textTransform: textEl.textTransform,
            width: '100%',
            height: '100%',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            overflow: 'hidden'
        };
        
        const displayText = textEl.dataColumn ? `<<${textEl.dataColumn}>>` : textEl.text;

        return <div style={textStyle}>{displayText}</div>;
      }
      case ElementType.IMAGE: {
        const imgEl = element as ImageElement;
        if (imgEl.dataColumn) {
            return (
                <div className="w-full h-full bg-gray-100 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center text-gray-500 p-2">
                    <ImageIcon className="w-8 h-8 mb-2" />
                    <span className="text-xs font-semibold text-center break-all">
                        &lt;&lt;{imgEl.dataColumn}&gt;&gt;
                    </span>
                </div>
            );
        }
        return <img src={convertToDirectUrl(imgEl.src)} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />;
      }
      default:
        return null;
    }
  };

  const slideStyle: React.CSSProperties = {
    backgroundColor: slide.backgroundColor,
    backgroundImage: slide.backgroundImage ? `url(${convertToDirectUrl(slide.backgroundImage)})` : 'none',
    backgroundSize: slide.backgroundSize ? `${slide.backgroundSize}%` : 'cover',
    backgroundPosition: `${slide.backgroundPositionX || 50}% ${slide.backgroundPositionY || 50}%`,
  };

  return (
    <div
      className="w-full h-full relative select-none"
      style={slideStyle}
      onMouseDown={handleMouseDownOnCanvas}
    >
      {/* Safe Zone Outline */}
      <div className="absolute top-4 left-4 right-4 bottom-4 border-2 border-dashed border-gray-300 pointer-events-none rounded-md"></div>
      
      {slide.elements.map((element: PresentationElement) => (
        <DraggableResizable 
          key={element.id} 
          element={element}
          onUpdate={handleElementUpdate}
          isSelected={selectedElementId === element.id}
          onSelect={handleSelectElement}
          onClick={handleClickElement}
        >
          {renderElement(element)}
        </DraggableResizable>
      ))}
    </div>
  );
};