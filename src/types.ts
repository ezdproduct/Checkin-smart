export enum ElementType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
}

export interface ElementBase {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  dataSourceId?: string;
  dataColumn?: string;
}

export interface TextElement extends ElementBase {
  type: ElementType.TEXT;
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  align: 'left' | 'center' | 'right' | 'justify';
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline' | 'line-through';
  textTransform: 'none' | 'uppercase' | 'lowercase';
  entryAnimation?: 'none' | 'fadeIn' | 'slideInBottom' | 'zoomIn';
}

export interface ImageElement extends ElementBase {
  type: ElementType.IMAGE;
  src: string;
}

export type PresentationElement = TextElement | ImageElement;

export interface Slide {
  id: string;
  elements: PresentationElement[];
  backgroundColor: string;
  backgroundImage?: string;
  backgroundVideo?: string;
  backgroundPositionX?: number;
  backgroundPositionY?: number;
  backgroundSize?: number;
  dataSourceId?: string;
  dataRowIndex?: number;
}

export interface DataSource {
  id: string;
  name: string;
  data: Record<string, any>[];
}

export interface PresentationState {
  id: string | null;
  slides: Slide[];
  activeSlideId: string | null;
  selectedElementId: string | null;
  title: string;
  dataSources: DataSource[];
}