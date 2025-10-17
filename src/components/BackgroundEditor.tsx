import React, { useState, useRef, useEffect } from 'react';
import type { Slide } from '@/src/types';
import { CloseIcon } from '@/src/components/Icons';

interface BackgroundEditorProps {
  imageSrc: string;
  initialSettings: {
    posX: number;
    posY: number;
    size: number;
  };
  onSave: (updates: Partial<Pick<Slide, 'backgroundImage' | 'backgroundPositionX' | 'backgroundPositionY' | 'backgroundSize'>>) => void;
  onClose: () => void;
}

export const BackgroundEditor: React.FC<BackgroundEditorProps> = ({ imageSrc, initialSettings, onSave, onClose }) => {
  const [pos, setPos] = useState({ x: initialSettings.posX, y: initialSettings.posY });
  const [size, setSize] = useState(initialSettings.size);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const initialPosRef = useRef({ x: 0, y: 0 });
  const previewRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    initialPosRef.current = pos;
  };
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !previewRef.current) return;
      
      const previewRect = previewRef.current.getBoundingClientRect();
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      
      const dxPercent = (dx / previewRect.width) * 100;
      const dyPercent = (dy / previewRect.height) * 100;

      const newX = initialPosRef.current.x - dxPercent;
      const newY = initialPosRef.current.y - dyPercent;

      setPos({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleSave = () => {
    onSave({
      backgroundImage: imageSrc,
      backgroundPositionX: pos.x,
      backgroundPositionY: pos.y,
      backgroundSize: size,
    });
  };

  const previewStyle: React.CSSProperties = {
    backgroundImage: `url(${imageSrc})`,
    backgroundPosition: `${pos.x}% ${pos.y}%`,
    backgroundSize: `${size}%`,
    backgroundRepeat: 'no-repeat',
    cursor: isDragging ? 'grabbing' : 'grab',
  };
  
  const aspectRatioClass = 'aspect-[16/9]';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-surface-100 rounded-lg shadow-xl w-full max-w-4xl text-text-900 flex flex-col" style={{maxHeight: '90vh'}}>
        <div className="flex justify-between items-center p-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-bold">Điều chỉnh ảnh nền</h2>
          <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-200"><CloseIcon /></button>
        </div>
        
        <div className="p-4 flex-grow flex flex-col md:flex-row gap-6 overflow-hidden">
          <div className="flex-grow flex flex-col">
            <p className="text-sm text-gray-500 mb-2 flex-shrink-0">Kéo ảnh để định vị. Dùng thanh trượt để phóng to.</p>
            <div className="flex-grow w-full flex items-center justify-center bg-gray-100 rounded-lg p-2 border border-gray-200">
                <div 
                  ref={previewRef}
                  className={`w-full rounded overflow-hidden select-none shadow-inner ${aspectRatioClass}`}
                  style={previewStyle}
                  onMouseDown={handleMouseDown}
                />
            </div>
          </div>
          <div className="w-full md:w-56 flex-shrink-0 flex flex-col justify-center space-y-6">
             <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Thu phóng</label>
                <div className="flex items-center space-x-3">
                    <input
                        type="range"
                        min="100" 
                        max="300"
                        step="1"
                        value={size}
                        onChange={(e) => setSize(parseInt(e.target.value, 10))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:bg-primary-600 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-sm"
                    />
                    <span className="text-sm font-medium w-12 text-center tabular-nums text-gray-700">{size}%</span>
                </div>
             </div>
             <div className="text-sm text-gray-500 space-y-2">
                <div className="flex justify-between">
                    <span>Vị trí X:</span>
                    <span className="font-mono">{Math.round(pos.x)}%</span>
                </div>
                <div className="flex justify-between">
                    <span>Vị trí Y:</span>
                    <span className="font-mono">{Math.round(pos.y)}%</span>
                </div>
             </div>
          </div>
        </div>

        <div className="p-4 flex justify-end space-x-2 border-t border-gray-200 flex-shrink-0 bg-gray-50 rounded-b-lg">
          <button onClick={onClose} className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 font-medium text-gray-700">Hủy</button>
          <button onClick={handleSave} className="px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700 font-medium">Lưu thay đổi</button>
        </div>
      </div>
    </div>
  );
};