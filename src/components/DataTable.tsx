import React from 'react';
import { isPotentialImageUrl, convertToDirectUrl } from '@/src/utils/presentationUtils';
import { PlayIcon } from './Icons';

interface DataTableProps {
  data: Record<string, any>[];
  onPresentRow: (rowIndex: number) => void;
}

export const DataTable: React.FC<DataTableProps> = ({ data, onPresentRow }) => {
  if (!data || data.length === 0) {
    return <div className="text-center text-gray-500 py-10">Chưa có dữ liệu. Hãy kết nối với một nguồn dữ liệu.</div>;
  }

  const headers = Object.keys(data[0]);

  return (
    <div className="overflow-x-auto bg-surface-100 rounded-lg shadow border border-gray-200">
      <table className="w-full text-sm text-left text-gray-700">
        <thead className="text-xs text-gray-800 uppercase bg-gray-50 border-b">
          <tr>
            {headers.map(header => (
              <th key={header} scope="col" className="px-6 py-3 font-semibold">
                {header}
              </th>
            ))}
            <th scope="col" className="px-6 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="bg-white border-b hover:bg-gray-50">
              {headers.map(header => {
                const cellData = row[header];
                return (
                  <td key={`${rowIndex}-${header}`} className="px-6 py-4 align-middle">
                    {isPotentialImageUrl(cellData) ? (
                      <img src={convertToDirectUrl(cellData)} alt={`Ảnh xem trước cho ${header}`} className="w-16 h-16 object-cover rounded-md shadow-sm" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="break-words">{String(cellData)}</span>
                    )}
                  </td>
                )
              })}
              <td className="px-6 py-4 text-right">
                <button 
                  onClick={() => onPresentRow(rowIndex)}
                  className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-600/10 rounded-full transition-colors"
                  title={`Trình chiếu từ hàng ${rowIndex + 1}`}
                >
                  <PlayIcon className="w-5 h-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};