// src/utils/presentationUtils.ts
import React from 'react';
import type { PresentationElement, TextElement, ImageElement, Slide } from '@/src/types'; // Import Slide
import { ElementType } from '@/src/types';

export const getSlideDimensions = (aspectRatio: '16:9' | '4:3' | '1:1') => {
    switch (aspectRatio) {
        case '16:9': return { width: 1024, height: 576 };
        case '4:3':  return { width: 1024, height: 768 };
        case '1:1':  return { width: 800, height: 800 };
        default:     return { width: 1024, height: 576 };
    }
};

export const isPotentialImageUrl = (value: any): value is string => {
    if (typeof value !== 'string' || value.trim() === '') return false;
    const lowerCaseValue = value.toLowerCase();
    return lowerCaseValue.startsWith('http') || lowerCaseValue.startsWith('data:image') || lowerCaseValue.includes('drive.google.com');
}

export const convertToDirectUrl = (url: string): string => {
    if (typeof url !== 'string' || url.trim() === '') {
        // Trả về một pixel trong suốt cho các URL không hợp lệ/trống để tránh biểu tượng ảnh bị lỗi
        return 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    }
    
    // Biểu thức chính quy để tìm ID tệp Google Drive từ các định dạng URL khác nhau
    const googleDriveRegex = /drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?.*id=)([a-zA-Z0-9_-]+)/;
    const match = url.match(googleDriveRegex);
    
    if (match && match[1]) {
        const fileId = match[1];
        return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }
    
    // Nếu không phải là liên kết Google Drive có thể phân tích, trả về nguyên trạng
    return url;
};

export const renderThumbnailElement = (element: PresentationElement, slideDimensions: {width: number, height: number}, thumbnailWidth: number): React.ReactNode => {
    const style: React.CSSProperties = {
        position: 'absolute',
        left: `${(element.x / slideDimensions.width) * 100}%`,
        top: `${(element.y / slideDimensions.height) * 100}%`,
        width: `${(element.width / slideDimensions.width) * 100}%`,
        height: `${(element.height / slideDimensions.height) * 100}%`,
        transform: `rotate(${element.rotation}deg)`,
        boxSizing: 'border-box',
    };

    switch (element.type) {
        case ElementType.TEXT: {
            const textEl = element as TextElement;
            const scaleFactor = thumbnailWidth / slideDimensions.width;
            const scaledFontSize = textEl.fontSize * scaleFactor;
            
            return (
                <div style={{
                    ...style,
                    fontSize: `${Math.max(scaledFontSize, 1)}px`,
                    color: textEl.color,
                    fontFamily: textEl.fontFamily,
                    textAlign: textEl.align,
                    fontWeight: textEl.fontWeight,
                    fontStyle: textEl.fontStyle,
                    textDecoration: textEl.textDecoration,
                    textTransform: textEl.textTransform,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    overflow: 'hidden',
                    lineHeight: 1.1,
                    padding: '1px',
                }}>
                    {textEl.text}
                </div>
            );
        }
        case ElementType.IMAGE: {
            const imgEl = element as ImageElement;
            return (
                <div style={style}>
                    <img src={convertToDirectUrl(imgEl.src)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
            );
        }
        default:
            return null;
    }
};

export const getAspectRatioClass = (aspectRatio: '16:9' | '4:3' | '1:1') => {
    switch (aspectRatio) {
      case '16:9': return 'aspect-[16/9]';
      case '4:3': return 'aspect-[4/3]';
      case '1:1': return 'aspect-[1/1]';
      default: return 'aspect-[16/9]';
    }
};