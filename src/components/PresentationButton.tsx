import React from "react";
import { PlayIcon } from './Icons';

interface PresentationButtonProps {
  onClick: () => void;
}

export const PresentationButton: React.FC<PresentationButtonProps> = ({ onClick }) => {
  return (
    <div className="relative inline-block">
      <button
        onClick={onClick}
        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md shadow-sm hover:bg-primary-700 transition"
        title="Bắt đầu trình chiếu"
      >
        <PlayIcon className="w-5 h-5" />
        <span className="font-medium">Trình chiếu</span>
      </button>
    </div>
  );
};