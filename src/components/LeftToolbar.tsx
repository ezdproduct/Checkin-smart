import React, { useRef } from 'react';
import { ElementType } from '@/src/types';
import type { ImageElement } from '@/src/types';
import { TrashIcon, ImageIcon, TextIcon } from './Icons';
import { usePresentation } from '@/src/context/PresentationContext';

const ToolButton: React.FC<{
    onClick?: () => void;
    disabled?: boolean;
    title: string;
    isActive?: boolean;
    children: React.ReactNode;
}> = ({ onClick, disabled, title, isActive, children }) => {
    const baseClasses = "w-16 h-16 p-2 rounded-lg flex flex-col items-center justify-center transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700";
    const activeClasses = "bg-primary-600 text-white";
    const inactiveClasses = "hover:bg-gray-100";
    
    return (
        <button 
            onClick={onClick} 
            disabled={disabled} 
            className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`} 
            title={title}
        >
            {children}
        </button>
    );
};

export const LeftToolbar: React.FC = () => {
  const { state, dispatch } = usePresentation();
  const { activeSlideId } = state;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addElement = (elementType: ElementType) => {
    if (activeSlideId) {
      dispatch({ type: 'ADD_ELEMENT', payload: { slideId: activeSlideId, elementType } });
    }
  };

  const deleteSlide = () => {
    if (activeSlideId && window.confirm('Bạn có chắc chắn muốn xóa slide này không?')) {
      dispatch({ type: 'DELETE_SLIDE', payload: { slideId: activeSlideId } });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeSlideId) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const base64Src = event.target?.result as string;
        
        const img = new Image();
        img.onload = () => {
            const MAX_WIDTH = 400;
            const MAX_HEIGHT = 400;
            let width = img.naturalWidth;
            let height = img.naturalHeight;

            if (width > MAX_WIDTH) {
                const ratio = MAX_WIDTH / width;
                width = MAX_WIDTH;
                height = height * ratio;
            }
            if (height > MAX_HEIGHT) {
                const ratio = MAX_HEIGHT / height;
                height = MAX_HEIGHT;
                width = width * ratio;
            }

            const newImageElement: ImageElement = {
                id: `el-${Date.now()}`,
                type: ElementType.IMAGE,
                src: base64Src,
                x: 100,
                y: 100,
                width: Math.round(width),
                height: Math.round(height),
                rotation: 0
            };
            
            dispatch({ type: 'ADD_ELEMENTS', payload: { slideId: activeSlideId, elements: [newImageElement] } });
        };
        img.src = base64Src;
    };
    reader.readAsDataURL(file);

    if(e.target) {
        e.target.value = '';
    }
  };

  return (
    <>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImageUpload} 
        accept="image/png, image/jpeg, image/gif, image/webp" 
        style={{ display: 'none' }}
      />
      <aside className="w-24 flex-shrink-0 bg-surface-100 p-2 flex flex-col items-center space-y-2 border-r border-gray-200 shadow-sm">
        <ToolButton onClick={() => addElement(ElementType.TEXT)} disabled={!activeSlideId} title="Thêm văn bản">
          <TextIcon className="w-6 h-6" />
          <span className="text-xs mt-1">Văn bản</span>
        </ToolButton>
        <ToolButton onClick={() => fileInputRef.current?.click()} disabled={!activeSlideId} title="Tải ảnh lên">
          <ImageIcon className="w-6 h-6" />
          <span className="text-xs mt-1">Ảnh</span>
        </ToolButton>
        
        <div className="w-full h-px bg-gray-200 my-2"></div>
        
        <ToolButton onClick={deleteSlide} disabled={!activeSlideId} title="Xóa slide">
            <TrashIcon className="w-6 h-6" />
            <span className="text-xs mt-1">Xóa</span>
        </ToolButton>
      </aside>
    </>
  );
};