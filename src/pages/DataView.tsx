import React from 'react';
import { usePresentation } from '@/src/context/PresentationContext';
import { DataTable } from '@/src/components/DataTable';
import { PlayIcon } from '@/src/components/Icons';

interface DataViewProps {
  onPresentQueue: (options?: { startIndex?: number }) => void;
}

export const DataView: React.FC<DataViewProps> = ({ onPresentQueue }) => {
  const { state } = usePresentation();
  const presentationQueue = state.dataSources.find(ds => ds.id === 'presentation-queue');

  return (
    <div className="flex-grow p-4 sm:p-6 lg:p-8 overflow-y-auto bg-surface-200">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold text-text-900">Dữ liệu trình chiếu</h2>
          <p className="text-gray-600 mt-1">
            Nếu có dữ liệu và slide mẫu, chế độ trình chiếu sẽ tự động tạo slide từ đây.
          </p>
        </div>
        <button
          onClick={() => onPresentQueue()}
          disabled={!presentationQueue || presentationQueue.data.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md shadow-sm hover:bg-primary-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          title="Bắt đầu trình chiếu từ dữ liệu trong hàng đợi"
        >
          <PlayIcon className="w-5 h-5" />
          <span className="font-medium">Trình chiếu Dữ liệu</span>
        </button>
      </div>
      <DataTable 
        data={presentationQueue?.data || []} 
        onPresentRow={(rowIndex) => onPresentQueue({ startIndex: rowIndex })}
      />
    </div>
  );
};