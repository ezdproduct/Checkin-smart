import React, { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PresentationProvider, usePresentation } from '@/src/context/PresentationContext';
import { PresentationView } from '@/src/components/PresentationView';
import { EditorView } from '@/src/pages/EditorView';
import { DataView } from '@/src/pages/DataView';
import { MainLayout } from '@/src/layouts/MainLayout';
import { usePresentationWindow } from '@/src/hooks/usePresentationWindow';
import type { Slide, PresentationState } from './types';
import toast from 'react-hot-toast';

const AppContent: React.FC = () => {
  const { state, dispatch } = usePresentation();
  const [presentationProps, setPresentationProps] = useState<{ 
    slides: Slide[]; 
    settings: { mode: 'manual' | 'autoplay' };
    initialSlideIndex: number;
  } | null>(null);
  const [presentationKey, setPresentationKey] = useState(0);
  
  const handleExitPresentation = useCallback(() => {
    setPresentationProps(null);
  }, []);

  const { openPresentationWindow, container } = usePresentationWindow(handleExitPresentation);

  const startPresentation = useCallback((settings: { mode: 'manual' | 'autoplay' }, options?: { startSlideId?: string, startIndex?: number }) => {
    const slidesToPresent = state.slides;
    
    if (slidesToPresent.length === 0) {
        toast.error("Không có gì để trình chiếu.");
        return;
    }

    let initialSlideIndex = options?.startIndex ?? 0;
    if (options?.startSlideId) {
        const foundIndex = slidesToPresent.findIndex(s => s.id === options.startSlideId);
        if (foundIndex > -1) initialSlideIndex = foundIndex;
    }

    setPresentationProps({ 
      slides: slidesToPresent, 
      settings,
      initialSlideIndex 
    });
    setPresentationKey(Date.now()); // Reset the presentation view component
    openPresentationWindow();
  }, [state.slides, openPresentationWindow]);

  const handlePresentQueue = useCallback(() => {
    if (state.slides.length < 2) {
      toast.error("Cần có ít nhất 2 slide: 1 slide chào mừng và 1 slide mẫu dữ liệu.");
      return;
    }
    startPresentation({ mode: 'autoplay' });
  }, [startPresentation, state.slides.length]);

  return (
    <>
      <div className="flex flex-col min-h-screen font-sans bg-surface-200 text-text-900 overflow-hidden">
        <Routes>
          <Route element={<MainLayout onStartPresentation={(opts) => startPresentation({ mode: 'manual' }, opts)} />}>
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
          key={presentationKey}
          slides={presentationProps.slides}
          onExit={handleExitPresentation}
          initialSlideIndex={presentationProps.initialSlideIndex}
          autoFullscreen={true}
          mode={presentationProps.settings.mode}
          dataSources={state.dataSources}
          dispatch={dispatch}
          autoplayDuration={state.autoplayDuration}
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