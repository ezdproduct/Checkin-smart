import React from 'react';
import type { PresentationElement, TextElement, ImageElement } from '@/src/types';
import { ElementType } from '@/src/types';
import { usePresentation } from '@/src/context/PresentationContext';
import { BoldIcon, ItalicIcon, UnderlineIcon, StrikethroughIcon, CaseSensitiveIcon, AlignLeftIcon, AlignCenterIcon, AlignRightIcon, AlignJustifyIcon } from '../Icons';

const PropInput: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="mb-3">
    <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
    {children}
  </div>
);

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
    <h3 className="text-lg font-semibold mb-4 border-b border-gray-200 pb-2 text-text-900">{title}</h3>
);

const baseInputClasses = "w-full p-2 border border-gray-300 rounded-md bg-surface-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow";

const ToggleButton: React.FC<{ onClick: () => void; isActive: boolean; children: React.ReactNode; title: string }> = ({ onClick, isActive, children, title }) => (
    <button
        onClick={onClick}
        title={title}
        className={`p-2 rounded-md transition-colors ${isActive ? 'bg-primary-600 text-white' : 'hover:bg-gray-100'}`}
    >
        {children}
    </button>
);

interface ElementPropertiesProps {
    element: PresentationElement;
    onUpdateElement: (updatedElement: PresentationElement) => void;
}

const DataBinding: React.FC<{ element: PresentationElement, onUpdateElement: (el: PresentationElement) => void }> = ({ element, onUpdateElement }) => {
    const { state } = usePresentation();
    const { dataSources } = state;
    const selectedDataSource = dataSources.find(ds => ds.id === element.dataSourceId);
    const columns = selectedDataSource && selectedDataSource.data.length > 0 ? Object.keys(selectedDataSource.data[0]) : [];

    const handleDataSourceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const dataSourceId = e.target.value;
        onUpdateElement({ ...element, dataSourceId: dataSourceId || undefined, dataColumn: undefined });
    };

    const handleDataColumnChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const dataColumn = e.target.value;
        onUpdateElement({ ...element, dataColumn: dataColumn || undefined });
    };

    return (
        <>
            <hr className="my-4 border-gray-200" />
            <h4 className="text-md font-semibold mb-2 text-text-800">Liên kết dữ liệu</h4>
            <PropInput label="Nguồn dữ liệu">
                <select value={element.dataSourceId || ''} onChange={handleDataSourceChange} className={baseInputClasses}>
                    <option value="">Không có</option>
                    {dataSources.map(ds => (
                        <option key={ds.id} value={ds.id}>{ds.name}</option>
                    ))}
                </select>
            </PropInput>
            {element.dataSourceId && (
                <PropInput label="Cột dữ liệu">
                    <select value={element.dataColumn || ''} onChange={handleDataColumnChange} className={baseInputClasses} disabled={columns.length === 0}>
                        <option value="">Chọn một cột</option>
                        {columns.map(col => (
                            <option key={col} value={col}>{col}</option>
                        ))}
                    </select>
                </PropInput>
            )}
        </>
    );
};

const TextProperties: React.FC<{ element: TextElement, onUpdateElement: (el: TextElement) => void }> = ({ element, onUpdateElement }) => {
    const toggleProperty = (prop: keyof TextElement, value1: any, value2: any) => {
        onUpdateElement({ ...element, [prop]: element[prop] === value1 ? value2 : value1 });
    };

    const cycleCase = () => {
        const cases = ['none', 'uppercase', 'lowercase'];
        const currentIndex = cases.indexOf(element.textTransform);
        const nextIndex = (currentIndex + 1) % cases.length;
        onUpdateElement({ ...element, textTransform: cases[nextIndex] as 'none' | 'uppercase' | 'lowercase' });
    };

    return (
        <>
            <PropInput label="Nội dung văn bản">
                <textarea value={element.text} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onUpdateElement({ ...element, text: e.target.value })} className={`${baseInputClasses} h-24 resize-none`} />
            </PropInput>
            <div className="grid grid-cols-2 gap-3">
                <PropInput label="Cỡ chữ">
                    <input type="number" value={element.fontSize} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdateElement({ ...element, fontSize: parseInt(e.target.value) })} className={baseInputClasses} />
                </PropInput>
                <PropInput label="Màu sắc">
                    <input type="color" value={element.color} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdateElement({ ...element, color: e.target.value })} className={`${baseInputClasses} h-10`} />
                </PropInput>
            </div>
            <div className="flex items-center justify-between space-x-1 p-1 bg-gray-50 rounded-lg border">
                <ToggleButton onClick={() => toggleProperty('fontWeight', 'bold', 'normal')} isActive={element.fontWeight === 'bold'} title="In đậm"><BoldIcon className="w-4 h-4" /></ToggleButton>
                <ToggleButton onClick={() => toggleProperty('fontStyle', 'italic', 'normal')} isActive={element.fontStyle === 'italic'} title="In nghiêng"><ItalicIcon className="w-4 h-4" /></ToggleButton>
                <ToggleButton onClick={() => toggleProperty('textDecoration', 'underline', 'none')} isActive={element.textDecoration === 'underline'} title="Gạch chân"><UnderlineIcon className="w-4 h-4" /></ToggleButton>
                <ToggleButton onClick={() => toggleProperty('textDecoration', 'line-through', 'none')} isActive={element.textDecoration === 'line-through'} title="Gạch ngang"><StrikethroughIcon className="w-4 h-4" /></ToggleButton>
                <ToggleButton onClick={cycleCase} isActive={element.textTransform !== 'none'} title="Chuyển đổi kiểu chữ"><CaseSensitiveIcon className="w-4 h-4" /></ToggleButton>
                <div className="w-px h-6 bg-gray-200"></div>
                <ToggleButton onClick={() => onUpdateElement({ ...element, align: 'left' })} isActive={element.align === 'left'} title="Căn trái"><AlignLeftIcon className="w-4 h-4" /></ToggleButton>
                <ToggleButton onClick={() => onUpdateElement({ ...element, align: 'center' })} isActive={element.align === 'center'} title="Căn giữa"><AlignCenterIcon className="w-4 h-4" /></ToggleButton>
                <ToggleButton onClick={() => onUpdateElement({ ...element, align: 'right' })} isActive={element.align === 'right'} title="Căn phải"><AlignRightIcon className="w-4 h-4" /></ToggleButton>
                <ToggleButton onClick={() => onUpdateElement({ ...element, align: 'justify' })} isActive={element.align === 'justify'} title="Căn đều"><AlignJustifyIcon className="w-4 h-4" /></ToggleButton>
            </div>
            <hr className="my-4 border-gray-200" />
            <PropInput label="Hiệu ứng xuất hiện">
                <select 
                    value={element.entryAnimation || 'none'} 
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onUpdateElement({ ...element, entryAnimation: e.target.value as TextElement['entryAnimation'] })} 
                    className={baseInputClasses}
                >
                    <option value="none">Không có</option>
                    <option value="fadeIn">Mờ dần</option>
                    <option value="slideInBottom">Trượt lên</option>
                    <option value="zoomIn">Phóng to</option>
                </select>
            </PropInput>
        </>
    );
};

const ImageProperties: React.FC<{ element: ImageElement, onUpdateElement: (el: ImageElement) => void }> = ({ element, onUpdateElement }) => {
    return (
        <>
            <PropInput label="Nguồn ảnh (URL)">
                <input type="text" value={element.src} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdateElement({ ...element, src: e.target.value })} className={baseInputClasses} />
            </PropInput>
        </>
    );
};

export const ElementProperties: React.FC<ElementPropertiesProps> = ({ element, onUpdateElement }) => {
    const handleGenericChange = (prop: string, value: any) => {
        onUpdateElement({ ...element, [prop]: value });
    };

    return (
        <div>
            <SectionHeader title="Thuộc tính phần tử" />
            <div className="grid grid-cols-2 gap-3">
                <PropInput label="X"><input type="number" value={Math.round(element.x)} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleGenericChange('x', parseInt(e.target.value))} className={baseInputClasses} /></PropInput>
                <PropInput label="Y"><input type="number" value={Math.round(element.y)} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleGenericChange('y', parseInt(e.target.value))} className={baseInputClasses} /></PropInput>
                <PropInput label="Chiều rộng"><input type="number" value={Math.round(element.width)} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleGenericChange('width', parseInt(e.target.value))} className={baseInputClasses} /></PropInput>
                <PropInput label="Chiều cao"><input type="number" value={Math.round(element.height)} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleGenericChange('height', parseInt(e.target.value))} className={baseInputClasses} /></PropInput>
            </div>
            <hr className="my-4 border-gray-200" />
            {element.type === ElementType.TEXT && <TextProperties element={element as TextElement} onUpdateElement={onUpdateElement as (el: TextElement) => void} />}
            {element.type === ElementType.IMAGE && <ImageProperties element={element as ImageElement} onUpdateElement={onUpdateElement as (el: ImageElement) => void} />}
            <DataBinding element={element} onUpdateElement={onUpdateElement} />
        </div>
    );
};