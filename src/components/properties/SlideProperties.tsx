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
    onUpdateSlide: (updates: Partial<Slide>) => void;
    onOpenBackgroundEditor: (imageSrc: string) => void;
}

export const SlideProperties: React.FC<SlidePropertiesProps> = ({ slide, onUpdateSlide, onOpenBackgroundEditor }) => {
    const imageInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const base64Src = event.target?.result as string;
            if (type === 'image') {
                onOpenBackgroundEditor(base64Src);
            } else {
                onUpdateSlide({ backgroundVideo: base64Src, backgroundImage: undefined });
            }
        };
        reader.readAsDataURL(file);

        if (e.target) {
            e.target.value = '';
        }
    };

    const handleRemoveBackground = () => {
        onUpdateSlide({
            backgroundImage: undefined,
            backgroundVideo: undefined,
            backgroundPositionX: 50,
            backgroundPositionY: 50,
            backgroundSize: 100,
        });
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
            
            <PropInput label="Nền đa phương tiện">
                <input
                    type="file"
                    ref={imageInputRef}
                    onChange={(e) => handleFileUpload(e, 'image')}
                    accept="image/png, image/jpeg, image/gif, image/webp"
                    style={{ display: 'none' }}
                />
                <input
                    type="file"
                    ref={videoInputRef}
                    onChange={(e) => handleFileUpload(e, 'video')}
                    accept="video/mp4,video/webm"
                    style={{ display: 'none' }}
                />
                {slide.backgroundImage ? (
                    <div className="space-y-2">
                        <img src={slide.backgroundImage} alt="Xem trước ảnh nền" className="w-full rounded border" />
                        <div className="flex space-x-2">
                            <button onClick={handleRemoveBackground} className={`${baseButtonClasses} border border-red-500/50 text-red-500 hover:bg-red-500/10`}>Xóa</button>
                            <button onClick={() => onOpenBackgroundEditor(slide.backgroundImage!)} className={`${baseButtonClasses} border border-primary-500/50 text-primary-500 hover:bg-primary-500/10`}>Điều chỉnh</button>
                        </div>
                    </div>
                ) : slide.backgroundVideo ? (
                    <div className="space-y-2">
                        <video src={slide.backgroundVideo} muted autoPlay loop className="w-full rounded border" />
                        <button onClick={handleRemoveBackground} className={`${baseButtonClasses} border border-red-500/50 text-red-500 hover:bg-red-500/10`}>Xóa video</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => imageInputRef.current?.click()} className="p-4 border-2 border-dashed border-gray-300 rounded-md hover:bg-gray-100 hover:border-primary-500 transition-colors text-sm">
                            Tải ảnh lên
                        </button>
                        <button onClick={() => videoInputRef.current?.click()} className="p-4 border-2 border-dashed border-gray-300 rounded-md hover:bg-gray-100 hover:border-primary-500 transition-colors text-sm">
                            Tải video lên
                        </button>
                    </div>
                )}
            </PropInput>
        </>
    );
};