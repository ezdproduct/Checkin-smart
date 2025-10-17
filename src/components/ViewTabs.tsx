import React from 'react';
import { NavLink } from 'react-router-dom';
import { DatabaseIcon, PaletteIcon } from './Icons';

export const ViewTabs: React.FC = () => {
  const getLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
      isActive
        ? 'bg-primary-600 text-white shadow-sm'
        : 'text-gray-600 hover:bg-gray-200 hover:text-gray-800'
    }`;

  return (
    <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg">
      <NavLink to="/editor" className={getLinkClass}>
        <PaletteIcon className="w-4 h-4" />
        <span>Trình chỉnh sửa</span>
      </NavLink>
      <NavLink to="/data" className={getLinkClass}>
        <DatabaseIcon className="w-4 h-4" />
        <span>Dữ liệu</span>
      </NavLink>
    </div>
  );
};