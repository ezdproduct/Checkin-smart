import React from 'react';
import { 
    Plus, Trash2, Image, Type, Sparkles, X, Clipboard, Expand, GripVertical, Database, Palette, SidebarOpen, SidebarClose, Send, ChevronsRight, Search, ToggleLeft, ToggleRight, Check as CheckLucide, Square as SquareLucide, Maximize, Minimize, Lightbulb, Upload, Download, Save, Library, Eraser, ChevronDown, Loader2, Bold, Italic, Underline, Strikethrough, CaseSensitive, AlignLeft, AlignCenter, AlignRight, AlignJustify, ChevronLeft, ChevronRight
} from 'lucide-react';

export const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Plus {...props} />;
export const PlayIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
);
export const PauseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
);
export const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Trash2 {...props} />;
export const ImageIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Image {...props} />;
export const TextIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Type {...props} />;
export const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Sparkles {...props} />;
export const CloseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <X {...props} />;
export const ClipboardIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Clipboard {...props} />;
export const ResizeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Expand {...props} />;
export const DragHandleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <GripVertical {...props} />;
export const DatabaseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Database {...props} />;
export const PaletteIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Palette {...props} />;
export const SidebarOpenIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <SidebarOpen {...props} />;
export const SidebarCloseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <SidebarClose {...props} />;
export const SendIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Send {...props} />;
export const ChevronsRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <ChevronsRight {...props} />;
export const SearchIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Search {...props} />;
export const ToggleLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <ToggleLeft {...props} />;
export const ToggleRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <ToggleRight {...props} />;
export const Check: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <CheckLucide {...props} />;
export const Square: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <SquareLucide {...props} />;
export const MaximizeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Maximize {...props} />;
export const MinimizeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Minimize {...props} />;
export const LightbulbIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Lightbulb {...props} />;
export const UploadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Upload {...props} />;
export const DownloadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Download {...props} />;
export const SaveIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Save {...props} />;
export const LibraryIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Library {...props} />;
export const EraserIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Eraser {...props} />;
export const ChevronDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <ChevronDown {...props} />;
export const LoaderIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Loader2 {...props} />;
export const BoldIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Bold {...props} />;
export const ItalicIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Italic {...props} />;
export const UnderlineIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Underline {...props} />;
export const StrikethroughIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Strikethrough {...props} />;
export const CaseSensitiveIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <CaseSensitive {...props} />;
export const AlignLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <AlignLeft {...props} />;
export const AlignCenterIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <AlignCenter {...props} />;
export const AlignRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <AlignRight {...props} />;
export const AlignJustifyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <AlignJustify {...props} />;
export const ChevronLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <ChevronLeft {...props} />;
export const ChevronRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <ChevronRight {...props} />;