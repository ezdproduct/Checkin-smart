import React, { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PresentationProvider, usePresentation } from '@/src/context/PresentationContext';
import { PresentationView } from '@/src/components/PresentationView';
import { EditorView } from '@/src/pages/EditorView';
import { DataView } from '@/src/pages/DataView';
import { MainLayout } from '@/src/layouts/MainLayout';
import { usePresentationWindow } from '@/src/hooks/usePresentationWindow';
import { useBroadcastChannel } from '@/src/hooks/useBroadcastChannel';
import { ElementType } from './types';
import type { Slide, TextElement, ImageElement, PresentationState } from './types';
import toast from 'react-hot-toast';

const AppContent: React.FC = () => {
  const { state } = usePresentation();
  const [presentationProps, setPresentationProps] = useState<{ 
    slides: Slide[]; 
    initialSlideIndex: number;
  } | null>(null);
  
  const handleExitPresentation = useCallback(() => {
    setPresentationProps(null);
  }, []);

  const { openPresentationWindow, container } = usePresentationWindow(handleExitPresentation);
  const { postMessage } = useBroadcastChannel(() => {});

  const generateSlidesForPresentation = useCallback((currentState: PresentationState): Slide[] => {
    const presentationQueue = currentState.dataSources.find(ds => ds.id === 'presentation-queue');
    const templateSlide = currentState.slides.find(s => s.elements.some(e => e.dataSourceId));
    
    if (presentationQueue && presentationQueue.data.length > 0 && templateSlide) {
        const generatedSlides = presentationQueue.data.map((row, index) => {
            const newSlide: Slide = JSON.parse(JSON.stringify(templateSlide));
            newSlide.id = `${templateSlide.id}-presented-${index}`;
            newSlide.dataSourceId = presentationQueue.id;
            newSlide.dataRowIndex = index;

            newSlide.elements = newSlide.elements.map(el => {
                const newEl = { ...el };
                if ((newEl.type === ElementType.TEXT || newEl.type === ElementType.IMAGE) && newEl.dataColumn) {
                    const valueFromData = row[newEl.dataColumn];
                    if (valueFromData !== undefined) {
                        if (newEl.type === ElementType.TEXT) (newEl as TextElement).text = String(valueFromData);
                        else if (newEl.type === ElementType.IMAGE) (newEl as ImageElement).src = String(valueFromData);
                    }
                }
                return newEl;
            });
            return newSlide;
        });
        
        const otherSlides = currentState.slides.filter(s => s.id !== templateSlide.id);
        return [...generatedSlides, ...otherSlides];
    }
    
    return currentState.slides;
  }, []);

  const startPresentation = useCallback((options?: { startSlideId?: string, startIndex?: number }) => {
    const slidesToPresent = generateSlidesForPresentation(state);
    
    if (slidesToPresent.length === 0) {
        alert("Không có gì để trình chiếu.");
        return;
    }

    let initialSlideIndex = options?.startIndex ?? 0;
    if (options?.startSlideId) {
        const foundIndex = slidesToPresent.findIndex(s => s.id === options.startSlideId || (options.startSlideId && s.id.startsWith(options.startSlideId)));
        if (foundIndex > -1) initialSlideIndex = foundIndex;
    }

    setPresentationProps({ 
      slides: slidesToPresent, 
      initialSlideIndex 
    });
    openPresentationWindow();
  }, [state, generateSlidesForPresentation, openPresentationWindow]);

  const handlePresentQueue = useCallback((options?: { startIndex?: number }) => {
    if (presentationProps && container) {
      // Nếu cửa sổ đang mở, chỉ gửi lệnh chuyển slide
      postMessage({ type: 'GOTO_SLIDE', payload: { index: options?.startIndex ?? 0 } });
    } else {
      // Nếu cửa sổ chưa mở, bắt đầu trình chiếu
      startPresentation(options);
    }
  }, [presentationProps, container, startPresentation, postMessage]);

  return (
    <>
      <div className="flex flex-col min-h-screen font-sans bg-surface-200 text-text-900 overflow-hidden">
        <Routes>
          <Route element={<MainLayout onStartPresentation={startPresentation} />}>
            <Route path="/" element={<Navigate to="/editor" replace />} />
            <Route path="editor" element={<EditorView />} />
            <Route path="data" element={
              <DataView 
                onPresentQueue={handlePresentQueue}
              />
            } />
          </Route>
        </Routes>
      </div>
      {container && presentationProps && createPortal(
        <PresentationView
          slides={presentationProps.slides}
          onExit={handleExitPresentation}
          initialSlideIndex={presentationProps.initialSlideIndex}
          autoFullscreen={true}
        />,
        container
      )}
    </>
  );
};

export default function App() {
  return (
    <PresentationProvider>
      <AppContent />
    </PresentationProvider>
  );
}