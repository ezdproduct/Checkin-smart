import React, { useRef } from 'react';
import type { Slide } from '@/src/types';

const PropInput: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="mb-3">
    <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
    {children}
  </div>
);

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
    <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-2">
        <h3 className="text-lg font-semibold text-text-900">{title}</h3>
    </div>
);

const baseButtonClasses = "w-full p-2 rounded-md text-sm font-medium transition-colors";

interface SlidePropertiesProps {
    slide: Slide;
    onUpdateSlide: (updates: Partial<Pick<Slide, 'backgroundColor' | 'backgroundImage' | 'backgroundPositionX' | 'backgroundPositionY' | 'backgroundSize'>>) => void;
    onOpenBackgroundEditor: (imageSrc: string) => void;
}

export const SlideProperties: React.FC<SlidePropertiesProps> = ({ slide, onUpdateSlide, onOpenBackgroundEditor }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleBgImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const base64Src = event.target?.result as string;
            onOpenBackgroundEditor(base64Src);
        };
        reader.readAsDataURL(file);

        if (e.target) {
            e.target.value = '';
        }
    };

    return (
        <>
            <SectionHeader title="Nền slide" />
            <PropInput label="Màu nền">
                <div className="relative">
                    <input 
                        type="color" 
                        value={slide.backgroundColor} 
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdateSlide({ backgroundColor: e.target.value })} 
                        className="w-full p-0 border-none h-10 cursor-pointer"
                    />
                    <div className="absolute inset-0 pointer-events-none rounded-md border border-gray-300 flex items-center justify-end px-2" style={{ backgroundColor: slide.backgroundColor }}>
                        <span className="text-sm font-mono" style={{ color: 'rgba(255,255,255,0.8)', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>{slide.backgroundColor.toUpperCase()}</span>
                    </div>
                </div>
            </PropInput>
            
            <PropInput label="Ảnh nền">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleBgImageUpload}
                    accept="image/png, image/jpeg, image/gif, image/webp"
                    style={{ display: 'none' }}
                />
                {slide.backgroundImage ? (
                    <div className="space-y-2">
                        <img src={slide.backgroundImage} alt="Xem trước ảnh nền" className="w-full rounded border" />
                        <div className="flex space-x-2">
                            <button onClick={() => onUpdateSlide({ backgroundImage: undefined, backgroundPositionX: 50, backgroundPositionY: 50, backgroundSize: 100 })} className={`${baseButtonClasses} border border-red-500/50 text-red-500 hover:bg-red-500/10`}>Xóa</button>
                            <button onClick={() => onOpenBackgroundEditor(slide.backgroundImage!)} className={`${baseButtonClasses} border border-primary-500/50 text-primary-500 hover:bg-primary-500/10`}>Điều chỉnh</button>
                        </div>
                    </div>
                ) : (
                    <button onClick={() => fileInputRef.current?.click()} className="w-full p-4 border-2 border-dashed border-gray-300 rounded-md hover:bg-gray-100 hover:border-primary-500 transition-colors">
                        Tải ảnh lên
                    </button>
                )}
            </PropInput>
        </>
    );
};