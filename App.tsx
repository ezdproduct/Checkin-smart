import React, { useState, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PresentationProvider, usePresentation } from '@/src/context/PresentationContext';
import { PresentationView } from '@/src/components/PresentationView';
import { EditorView } from '@/src/pages/EditorView';
import { DataView } from '@/src/pages/DataView';
import { FormView } from '@/src/pages/FormView';
import Login from '@/src/pages/Login';
import { ProtectedRoute } from '@/src/components/ProtectedRoute';
import { MainLayout } from '@/src/layouts/MainLayout';
import { ElementType } from './types';
import type { Slide, TextElement, ImageElement, PresentationState } from './types';
import { PRESENTATION_QUEUE_ID } from '@/src/hooks/usePresentation';

const AppContent: React.FC = () => {
  const { state } = usePresentation();
  const [presentationProps, setPresentationProps] = useState<{ 
    slides: Slide[]; 
    settings: { mode: 'manual' | 'autoplay' };
    initialSlideIndex: number;
  } | null>(null);

  const generateSlidesForPresentation = useCallback((currentState: PresentationState): Slide[] => {
    const presentationQueue = currentState.dataSources.find(ds => ds.id === PRESENTATION_QUEUE_ID);
    const templateSlide = currentState.slides.find(s => s.elements.some(e => 'dataSourceId' in e && e.dataSourceId));
    const otherSlides = currentState.slides.filter(s => !s.elements.some(e => 'dataSourceId' in e && e.dataSourceId));

    let generatedSlides: Slide[] = [];

    if (presentationQueue && presentationQueue.data.length > 0 && templateSlide) {
        generatedSlides = presentationQueue.data.map((row, index) => {
            const newSlide: Slide = JSON.parse(JSON.stringify(templateSlide));
            newSlide.id = `${templateSlide.id}-presented-${index}`;
            newSlide.dataSourceId = presentationQueue.id;
            newSlide.dataRowIndex = index;

            newSlide.elements = newSlide.elements.map(el => {
                const newEl = { ...el };
                if ((newEl.type === ElementType.TEXT || newEl.type === ElementType.IMAGE) && newEl.dataColumn) {
                    const valueFromData = row[newEl.dataColumn];
                    if (valueFromData !== undefined) {
                        if (newEl.type === ElementType.TEXT) {
                            (newEl as TextElement).text = String(valueFromData);
                        } else if ((newEl as ImageElement).src) { 
                            (newEl as ImageElement).src = String(valueFromData);
                        }
                    }
                }
                return newEl;
            });
            return newSlide;
        });
    }
    return generatedSlides.length > 0 ? [...generatedSlides, ...otherSlides] : currentState.slides;
  }, []);

  const startPresentation = useCallback((settings: { mode: 'manual' | 'autoplay' }, options?: { startSlideId?: string, startIndex?: number }) => {
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
    setPresentationProps({ slides: slidesToPresent, settings, initialSlideIndex });
  }, [state, generateSlidesForPresentation]);

  const handlePresentQueue = useCallback(() => startPresentation({ mode: 'autoplay' }), [startPresentation]);
  const handleStartPresentationFromSlide = useCallback((slideId: string) => startPresentation({ mode: 'manual' }, { startSlideId: slideId }), [startPresentation]);
  const handleStartPresentationFromQueueIndex = useCallback((index: number) => startPresentation({ mode: 'manual' }, { startIndex: index }), [startPresentation]);

  if (presentationProps) {
    return (
      <PresentationView
        slides={presentationProps.slides}
        onExit={() => setPresentationProps(null)}
        aspectRatio={state.aspectRatio}
        dataSources={state.dataSources}
        initialMode={presentationProps.settings.mode}
        initialSlideIndex={presentationProps.initialSlideIndex}
        autoFullscreen={true}
      />
    );
  }

  return (
    <div className="flex flex-col min-h-screen font-sans bg-surface-200 text-text-900 overflow-hidden">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/form" element={<FormView />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout onStartPresentation={startPresentation} />}>
            <Route path="/" element={<Navigate to="/data" replace />} />
            <Route path="editor" element={<EditorView onStartPresentation={handleStartPresentationFromSlide} />} />
            <Route path="data" element={
              <DataView 
                onStartPresentationFromSlide={handleStartPresentationFromSlide}
                onStartPresentationFromQueueIndex={handleStartPresentationFromQueueIndex}
                onPresentQueue={handlePresentQueue} 
              />
            } />
          </Route>
        </Route>
      </Routes>
    </div>
  );
};

export default function App() {
  return (
    <PresentationProvider>
      <AppContent />
    </PresentationProvider>
  );
}