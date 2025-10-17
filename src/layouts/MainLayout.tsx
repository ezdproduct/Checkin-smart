import React, { useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { usePresentation } from '@/src/context/PresentationContext';
import { Toolbar } from '@/src/components/Toolbar';
import { ViewTabs } from '@/src/components/ViewTabs';
import type { PresentationState, Slide } from '@/src/types';
import toast from 'react-hot-toast';

interface MainLayoutProps {
  onStartPresentation: (options?: { startSlideId?: string; startIndex?: number }) => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ onStartPresentation }) => {
  const { state, dispatch } = usePresentation();
  const importFileInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();

  const handleFetchData = async () => {
    const fetchDataPromise = fetch('https://n8n.probase.tech/webhook/checkin')
      .then(response => {
        if (!response.ok) {
          throw new Error(`Lỗi mạng: ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          dispatch({ type: 'UPDATE_DATA_SOURCE', payload: { id: 'data-input', data } });
        } else {
          throw new Error("Dữ liệu trả về không phải là một mảng.");
        }
      });

    toast.promise(fetchDataPromise, {
      loading: 'Đang tải dữ liệu...',
      success: 'Tải dữ liệu thành công!',
      error: (err) => `Không thể tải dữ liệu: ${err.message}`,
    });
  };

  const handleExportPresentation = () => {
    const presentationData = {
      title: state.title,
      slides: state.slides,
    };
    const jsonString = JSON.stringify(presentationData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const filename = `${state.title.replace(/ /g, '_') || 'presentation'}.json`;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportPresentation = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text);

        if (data.slides && Array.isArray(data.slides) && data.title) {
          const newState: PresentationState = {
            ...state,
            id: `imported-${Date.now()}`,
            title: data.title,
            slides: data.slides,
            activeSlideId: data.slides[0]?.id || null,
            selectedElementId: null,
          };
          dispatch({ type: 'SET_STATE', payload: newState });
          toast.success('Đã tải bài thuyết trình thành công!');
        } else if (data.id && data.elements && Array.isArray(data.elements)) {
          const newSlide: Slide = {
            ...data,
            id: `imported-slide-${Date.now()}`,
          };
          dispatch({ type: 'ADD_IMPORTED_SLIDE', payload: { slide: newSlide } });
          toast.success('Đã thêm slide mẫu thành công!');
        } else {
          throw new Error('Định dạng tệp không hợp lệ.');
        }
      } catch (error) {
        console.error('Lỗi khi tải tệp:', error);
        toast.error('Không thể tải tệp. Vui lòng kiểm tra định dạng.');
      }
    };
    reader.readAsText(file);
    
    if (event.target) {
      event.target.value = '';
    }
  };

  const triggerImport = () => {
    importFileInputRef.current?.click();
  };

  const handlePresent = () => {
    onStartPresentation();
  };

  return (
    <>
      <input
        type="file"
        ref={importFileInputRef}
        onChange={handleImportPresentation}
        accept="application/json"
        style={{ display: 'none' }}
      />
      <Toolbar
        title={state.title}
        dispatch={dispatch}
        onExportPresentation={handleExportPresentation}
        onImportPresentation={triggerImport}
        onPresent={handlePresent}
        onFetchData={handleFetchData}
        showDataButton={location.pathname.includes('/data')}
      />
      <Outlet context={{ onStartPresentation }} />
    </>
  );
};