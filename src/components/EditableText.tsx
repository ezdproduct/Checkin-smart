import React, { useRef, useEffect } from 'react';
import type { TextElement } from '@/src/types';

interface EditableTextProps {
    element: TextElement;
    onUpdate: (newText: string) => void;
    onExit: () => void;
}

export const EditableText: React.FC<EditableTextProps> = ({ element, onUpdate, onExit }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.select();
        }
    }, []);

    return (
        <textarea
            ref={textareaRef}
            value={element.text}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onUpdate(e.target.value)}
            onBlur={onExit}
            onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                if (e.key === 'Escape') {
                    onExit();
                }
            }}
            onMouseDown={(e: React.MouseEvent<HTMLTextAreaElement>) => e.stopPropagation()}
            style={{
                fontSize: element.fontSize,
                color: element.color,
                fontFamily: element.fontFamily,
                textAlign: element.align,
                fontWeight: element.fontWeight,
                fontStyle: element.fontStyle,
                textDecoration: element.textDecoration,
                textTransform: element.textTransform,
                width: '100%',
                height: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                resize: 'none',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                padding: 0,
                margin: 0,
                boxSizing: 'border-box',
                overflow: 'hidden',
            }}
        />
    );
};