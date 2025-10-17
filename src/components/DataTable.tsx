import React from 'react';
import { isPotentialImageUrl, convertToDirectUrl } from '@/src/utils/presentationUtils';

interface DataTableProps {
  data: Record<string, any>[];
  renderRowActions: (row: Record<string, any>, rowIndex: number) => React.ReactNode;
}

export const DataTable: React.FC<DataTableProps> = ({ data, renderRowActions }) => {
  if (!data || data.length === 0) {
    return <div className="text-center text-gray-500 py-10">Chưa có dữ liệu.</div>;
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
            <th scope="col" className="px-6 py-3 text-right">Hành động</th>
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
                {renderRowActions(row, rowIndex)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};