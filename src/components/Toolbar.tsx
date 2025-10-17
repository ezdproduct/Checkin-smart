import React from 'react';
import { DownloadIcon, UploadIcon } from './Icons';
import { PresentationButton } from './PresentationButton';
import { ViewTabs } from './ViewTabs';

interface ToolbarProps {
  title: string;
  dispatch: React.Dispatch<any>;
  onExportPresentation: () => void;
  onImportPresentation: () => void;
  onPresent: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ title, dispatch, onExportPresentation, onImportPresentation, onPresent }) => {

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'UPDATE_TITLE', payload: { title: e.target.value } });
  };

  return (
    <header className="flex-shrink-0 w-full bg-surface-100 border-b border-gray-200 p-3 flex items-center justify-between text-text-900 shadow-sm">
        <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-primary-600">Điểm danh</h1>
            <div className="h-6 w-px bg-gray-300"></div>
            <input 
              type="text" 
              value={title}
              onChange={handleTitleChange}
              className="font-semibold bg-transparent outline-none ring-2 ring-transparent focus:ring-primary-500 rounded px-2 py-1 transition-all w-64"
              aria-label="Tiêu đề bài thuyết trình"
            />
        </div>
        <div className="absolute left-1/2 -translate-x-1/2">
            <ViewTabs />
        </div>
        <div className="flex items-center space-x-4">
            <button
                onClick={onImportPresentation}
                className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors text-gray-700 hover:text-gray-900"
                title="Tải lên bài thuyết trình hoặc slide mẫu"
            >
                <UploadIcon className="w-5 h-5" />
            </button>
            <button
                onClick={onExportPresentation}
                className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors text-gray-700 hover:text-gray-900"
                title="Xuất bài thuyết trình"
            >
                <DownloadIcon className="w-5 h-5" />
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <PresentationButton onClick={onPresent} />
        </div>
    </header>
  );
};