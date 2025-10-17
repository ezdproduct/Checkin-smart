import React, { useState, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { usePresentation } from '@/src/context/PresentationContext';
import { LeftToolbar } from '@/src/components/LeftToolbar';
import { Canvas } from '@/src/components/Canvas';
import { PropertiesPanel } from '@/src/components/PropertiesPanel';
import { BottomBar } from '@/src/components/BottomBar';
import { BackgroundEditor } from '@/src/components/BackgroundEditor';
import type { PresentationElement, Slide } from '@/src/types';

const getSlideDimensions = () => { 
    return { width: 1024, aspect: 'aspect-[16/9]' };
};

interface OutletContext {
  onStartPresentation: (options?: { startSlideId?: string; startIndex?: number }) => void;
}

export const EditorView: React.FC = () => {
  const { state, dispatch } = usePresentation();
  const { onStartPresentation: onPresentFromBeginning } = useOutletContext<OutletContext>();
  const [zoom, setZoom] = useState(1);
  const [backgroundEditorState, setBackgroundEditorState] = useState<{
    isOpen: boolean;
    imageSrc: string | null;
  }>({ isOpen: false, imageSrc: null });

  const activeSlide = state.slides.find((s: Slide) => s.id === state.activeSlideId);
  const selectedElement = activeSlide?.elements.find((e: PresentationElement) => e.id === state.selectedElementId);

  const handleUpdateElement = useCallback((updatedElement: PresentationElement) => {
    if (activeSlide) {
      dispatch({ type: 'UPDATE_ELEMENT', payload: { slideId: activeSlide.id, element: updatedElement } });
    }
  }, [activeSlide, dispatch]);

  const handleUpdateSlide = useCallback((updates: Partial<Pick<Slide, 'backgroundColor' | 'backgroundImage' | 'backgroundPositionX' | 'backgroundPositionY' | 'backgroundSize'>>) => {
    if (activeSlide) {
      dispatch({ type: 'UPDATE_SLIDE_BACKGROUND', payload: { slideId: activeSlide.id, background: updates } });
    }
  }, [activeSlide, dispatch]);

  const handleOpenBackgroundEditor = useCallback((imageSrc: string) => {
    setBackgroundEditorState({ isOpen: true, imageSrc });
  }, []);

  const handleCloseBackgroundEditor = useCallback(() => {
    setBackgroundEditorState({ isOpen: false, imageSrc: null });
  }, []);

  const handleSaveBackground = useCallback((updates: Partial<Pick<Slide, 'backgroundImage' | 'backgroundPositionX' | 'backgroundPositionY' | 'backgroundSize'>>) => {
    handleUpdateSlide(updates);
    handleCloseBackgroundEditor();
  }, [handleUpdateSlide, handleCloseBackgroundEditor]);

  const slideDimensions = getSlideDimensions();

  return (
    <div className="flex flex-col flex-grow overflow-hidden">
      <main className="flex flex-grow overflow-hidden">
        <LeftToolbar />
        <section className="flex-grow grid place-items-center p-4 sm:p-8 overflow-auto bg-surface-200">
          <div style={{ transform: `scale(${zoom})`, transformOrigin: 'center center', transition: 'transform 0.1s ease-in-out' }}>
            {activeSlide ? (
              <div className={`bg-surface-100 shadow-lg rounded-lg ${slideDimensions.aspect}`} style={{ width: `${slideDimensions.width}px` }}>
                <Canvas 
                  slide={activeSlide} 
                  dispatch={dispatch}
                  selectedElementId={state.selectedElementId}
                />
              </div>
            ) : (
              <div className="text-center text-gray-500 bg-surface-100 shadow-lg aspect-[16/9] w-full max-w-4xl flex flex-col items-center justify-center rounded-lg">
                <p>Không có slide nào được chọn.</p>
                <p>Tạo một slide mới để bắt đầu.</p>
              </div>
            )}
          </div>
        </section>
        <aside className="w-72 flex-shrink-0 bg-surface-100 p-4 overflow-y-auto border-l border-gray-200">
          <PropertiesPanel 
            element={selectedElement}
            slide={activeSlide}
            onUpdateElement={handleUpdateElement}
            onUpdateSlide={handleUpdateSlide}
            onOpenBackgroundEditor={handleOpenBackgroundEditor}
          />
        </aside>
      </main>
      <BottomBar
        slides={state.slides}
        activeSlideId={state.activeSlideId}
        dispatch={dispatch}
        zoom={zoom}
        onZoomChange={setZoom}
        onPresent={() => onPresentFromBeginning()}
      />
      {backgroundEditorState.isOpen && backgroundEditorState.imageSrc && activeSlide && (
        <BackgroundEditor
          imageSrc={backgroundEditorState.imageSrc}
          initialSettings={{
            posX: activeSlide.backgroundPositionX || 50,
            posY: activeSlide.backgroundPositionY || 50,
            size: activeSlide.backgroundSize || 100,
          }}
          onSave={handleSaveBackground}
          onClose={handleCloseBackgroundEditor}
        />
      )}
    </div>
  );
};