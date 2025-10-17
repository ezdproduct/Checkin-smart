import React, { useEffect, useRef } from 'react';
import { usePresentation } from '@/src/context/PresentationContext';
import { DataTable } from '@/src/components/DataTable';
import { PlayIcon, TrashIcon, EraserIcon } from '@/src/components/Icons';
import toast from 'react-hot-toast';

interface DataViewProps {
  onPresentQueue: (options?: { startIndex?: number }) => void;
}

export const DataView: React.FC<DataViewProps> = ({ onPresentQueue }) => {
  const { state, dispatch } = usePresentation();
  const presentationQueue = state.dataSources.find(ds => ds.id === 'presentation-queue');
  const presentedItems = state.dataSources.find(ds => ds.id === 'presented-items');

  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const fetchAndProcessData = async () => {
      try {
        const response = await fetch(`https://n8n.probase.tech/webhook/da-checkin?t=${Date.now()}`);
        if (!response.ok) {
          throw new Error(`Lỗi mạng: ${response.statusText}`);
        }
        const data = await response.json();
        
        if (!Array.isArray(data)) {
          console.error("Dữ liệu trả về không phải là một mảng.");
          return; 
        }

        if (data.length > 0 && data[0].row_number === undefined) {
          toast.error("Dữ liệu trả về không hợp lệ (thiếu row_number).");
          console.error("Dữ liệu không chứa thuộc tính 'row_number'.", data[0]);
          return;
        }

        const currentQueue = stateRef.current.dataSources.find(ds => ds.id === 'presentation-queue')?.data || [];
        const currentPresented = stateRef.current.dataSources.find(ds => ds.id === 'presented-items')?.data || [];
        const existingIds = new Set([...currentQueue.map(i => i.row_number), ...currentPresented.map(i => i.row_number)]);
        
        const newItems = data.filter(item => !existingIds.has(item.row_number));
        
        if (newItems.length > 0) {
          dispatch({ type: 'PROCESS_FETCHED_DATA', payload: { data } });
          toast.success(`Đã tự động thêm ${newItems.length} mục mới vào hàng đợi!`);
        }

      } catch (error) {
        toast.error("Không thể tải dữ liệu tự động.");
        console.error("Không thể tải dữ liệu:", error);
      }
    };

    fetchAndProcessData();
    const intervalId = setInterval(fetchAndProcessData, 5000);

    return () => clearInterval(intervalId);
  }, [dispatch]);

  const handleRemoveFromQueue = (rowIndex: number) => {
    dispatch({ type: 'REMOVE_FROM_QUEUE', payload: { itemIndex: rowIndex } });
  };

  const handleClearQueue = () => {
    if (window.confirm('Bạn có chắc muốn xóa toàn bộ hàng đợi và lịch sử đã trình chiếu không?')) {
      dispatch({ type: 'CLEAR_QUEUE' });
    }
  };

  return (
    <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-surface-200">
      {/* Presentation Queue Column */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-start">
            <div>
                <h2 className="text-2xl font-bold text-text-900">Hàng đợi trình chiếu</h2>
                <p className="text-gray-600 mt-1">
                    Dữ liệu mới sẽ tự động được thêm vào đây.
                </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 mt-1">
                <button
                    onClick={handleClearQueue}
                    disabled={(!presentationQueue || presentationQueue.data.length === 0) && (!presentedItems || presentedItems.data.length === 0)}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-white border rounded-md text-red-600 border-red-200 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Xóa hàng đợi và lịch sử"
                >
                    <EraserIcon className="w-4 h-4" />
                    <span>Xóa hết</span>
                </button>
                <button
                    onClick={() => onPresentQueue()}
                    disabled={!presentationQueue || presentationQueue.data.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md shadow-sm hover:bg-primary-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                    title="Bắt đầu trình chiếu từ hàng đợi"
                >
                    <PlayIcon className="w-5 h-5" />
                    <span className="font-medium">Trình chiếu</span>
                </button>
            </div>
        </div>
        <div className="flex-grow">
            <DataTable 
                data={presentationQueue?.data || []} 
                renderRowActions={(_, rowIndex) => (
                    <div className="flex items-center justify-end gap-1">
                        <button 
                            onClick={() => onPresentQueue({ startIndex: rowIndex })}
                            className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-600/10 rounded-full transition-colors"
                            title={`Trình chiếu từ hàng ${rowIndex + 1}`}
                        >
                            <PlayIcon className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={() => handleRemoveFromQueue(rowIndex)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-600/10 rounded-full transition-colors"
                            title="Xóa khỏi hàng đợi"
                        >
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    </div>
                )}
            />
        </div>
      </div>

      {/* Presented Items Column */}
      <div className="flex flex-col gap-4">
        <div>
            <h2 className="text-2xl font-bold text-text-900">Đã trình chiếu</h2>
            <p className="text-gray-600 mt-1">
                Lịch sử các mục đã được hiển thị.
            </p>
        </div>
        <div className="flex-grow">
            <DataTable 
                data={presentedItems?.data || []} 
                renderRowActions={() => <></>}
            />
        </div>
      </div>
    </div>
  );
};