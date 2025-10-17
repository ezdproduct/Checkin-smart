import React, { createContext, useContext, useReducer, Dispatch } from 'react';
import type { PresentationState, Slide, PresentationElement, DataSource } from '@/src/types';
import { ElementType } from '@/src/types';

type Action =
  | { type: 'SET_STATE'; payload: PresentationState }
  | { type: 'ADD_SLIDE' }
  | { type: 'ADD_IMPORTED_SLIDE'; payload: { slide: Slide } }
  | { type: 'DELETE_SLIDE'; payload: { slideId: string } }
  | { type: 'SELECT_SLIDE'; payload: { slideId: string } }
  | { type: 'ADD_ELEMENT'; payload: { slideId:string; elementType: ElementType } }
  | { type: 'ADD_ELEMENTS'; payload: { slideId: string; elements: PresentationElement[] } }
  | { type: 'UPDATE_ELEMENT'; payload: { slideId: string; element: PresentationElement } }
  | { type: 'DELETE_SELECTED_ELEMENT'; payload: { slideId: string } }
  | { type: 'SELECT_ELEMENT'; payload: { elementId: string | null } }
  | { type: 'UPDATE_SLIDE_BACKGROUND'; payload: { slideId: string; background: Partial<Pick<Slide, 'backgroundColor' | 'backgroundImage' | 'backgroundPositionX' | 'backgroundPositionY' | 'backgroundSize'>> } }
  | { type: 'UPDATE_TITLE'; payload: { title: string } }
  | { type: 'UPDATE_DATA_SOURCE'; payload: { id: string; data: Record<string, any>[] } }
  | { type: 'ADD_TO_QUEUE'; payload: { item: Record<string, any> } }
  | { type: 'REMOVE_FROM_QUEUE'; payload: { itemIndex: number } }
  | { type: 'CLEAR_QUEUE' }
  | { type: 'PROCESS_FETCHED_DATA'; payload: { data: Record<string, any>[] } };

const createNewSlide = (): Slide => ({
  id: `slide-${Date.now()}`,
  elements: [
     {
      id: `element-${Date.now()}-1`,
      type: ElementType.TEXT,
      text: 'Tiêu đề Slide mới',
      x: 50, y: 50, width: 700, height: 80, rotation: 0,
      fontSize: 48, fontFamily: 'Arial', color: '#000000', align: 'center',
      fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', textTransform: 'none'
    }
  ],
  backgroundColor: '#FFFFFF',
});

const initialState: PresentationState = {
  id: 'local-presentation',
  slides: [createNewSlide()],
  activeSlideId: null,
  selectedElementId: null,
  title: 'Bài thuyết trình',
  dataSources: [
    { id: 'data-input', name: 'Dữ liệu đầu vào', data: [] },
    { id: 'presentation-queue', name: 'Hàng đợi trình chiếu', data: [] }
  ],
};
initialState.activeSlideId = initialState.slides[0].id;


function presentationReducer(state: PresentationState, action: Action): PresentationState {
  switch (action.type) {
    case 'SET_STATE':
        return { ...action.payload };
    case 'UPDATE_TITLE':
      return { ...state, title: action.payload.title };
    case 'ADD_SLIDE': {
      const newSlide = createNewSlide();
      return {
        ...state,
        slides: [...state.slides, newSlide],
        activeSlideId: newSlide.id,
        selectedElementId: null,
      };
    }
    case 'ADD_IMPORTED_SLIDE': {
      const { slide } = action.payload;
      return {
        ...state,
        slides: [...state.slides, slide],
        activeSlideId: slide.id,
        selectedElementId: null,
      };
    }
    case 'SELECT_SLIDE':
      return { ...state, activeSlideId: action.payload.slideId, selectedElementId: null };
    case 'DELETE_SLIDE': {
        const newSlides = state.slides.filter((s: Slide) => s.id !== action.payload.slideId);
        let newActiveSlideId = state.activeSlideId;
        if(state.activeSlideId === action.payload.slideId) {
            const currentIndex = state.slides.findIndex(s => s.id === action.payload.slideId);
            if (newSlides.length > 0) {
                newActiveSlideId = newSlides[Math.max(0, currentIndex - 1)].id;
            } else {
                newActiveSlideId = null;
            }
        }
        return {
            ...state,
            slides: newSlides,
            activeSlideId: newActiveSlideId,
            selectedElementId: null
        }
    }
    case 'ADD_ELEMENT': {
        let newElement: PresentationElement;
        const now = Date.now();
        switch(action.payload.elementType) {
            case ElementType.TEXT:
                newElement = { 
                    id: `el-${now}`, type: ElementType.TEXT, text: 'Văn bản mới', 
                    x: 100, y: 100, width: 200, height: 50, rotation: 0, 
                    fontSize: 16, fontFamily: 'Arial', color: '#000000', align: 'left',
                    fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', textTransform: 'none'
                };
                break;
            case ElementType.IMAGE:
                newElement = { id: `el-${now}`, type: ElementType.IMAGE, src: 'https://picsum.photos/200/300', x: 250, y: 250, width: 200, height: 300, rotation: 0 };
                break;
            default:
                return state;
        }
        const slides = state.slides.map((slide: Slide) => 
            slide.id === action.payload.slideId
                ? { ...slide, elements: [...slide.elements, newElement] }
                : slide
        );
        return { ...state, slides, selectedElementId: newElement.id };
    }
    case 'ADD_ELEMENTS': {
        const { slideId, elements } = action.payload;
        const slides = state.slides.map((slide: Slide) => 
            slide.id === slideId
                ? { ...slide, elements: [...slide.elements, ...elements] }
                : slide
        );
        const lastElementId = elements.length > 0 ? elements[elements.length - 1].id : state.selectedElementId;
        return { ...state, slides, selectedElementId: lastElementId };
    }
    case 'UPDATE_ELEMENT': {
        const slides = state.slides.map((slide: Slide) => 
            slide.id === action.payload.slideId
                ? { ...slide, elements: slide.elements.map((el: PresentationElement) => el.id === action.payload.element.id ? action.payload.element : el) }
                : slide
        );
        return { ...state, slides };
    }
    case 'DELETE_SELECTED_ELEMENT': {
        if (!state.selectedElementId) return state;
        const slides = state.slides.map((slide: Slide) =>
            slide.id === action.payload.slideId
                ? { ...slide, elements: slide.elements.filter((el: PresentationElement) => el.id !== state.selectedElementId)}
                : slide
        );
        return {...state, slides, selectedElementId: null};
    }
    case 'SELECT_ELEMENT':
      return { ...state, selectedElementId: action.payload.elementId };
    case 'UPDATE_SLIDE_BACKGROUND': {
      const { slideId, background } = action.payload;
      const slides = state.slides.map((slide: Slide) => 
          slide.id === slideId
              ? { ...slide, ...background }
              : slide
      );
      return { ...state, slides };
    }
    case 'UPDATE_DATA_SOURCE': {
      const { id, data } = action.payload;
      return {
        ...state,
        dataSources: state.dataSources.map(ds => ds.id === id ? { ...ds, data } : ds),
      };
    }
    case 'ADD_TO_QUEUE': {
        const { item } = action.payload;
        const queue = state.dataSources.find(ds => ds.id === 'presentation-queue');
        const dataInput = state.dataSources.find(ds => ds.id === 'data-input');

        if (!queue || !dataInput) return state;
        
        const newQueueData = [...queue.data, item];
        const newDataInputData = dataInput.data.filter(d => d.Stt !== item.Stt);
        
        return {
            ...state,
            dataSources: state.dataSources.map(ds => {
                if (ds.id === 'presentation-queue') return { ...ds, data: newQueueData };
                if (ds.id === 'data-input') return { ...ds, data: newDataInputData };
                return ds;
            }),
        };
    }
    case 'REMOVE_FROM_QUEUE': {
        const { itemIndex } = action.payload;
        const queue = state.dataSources.find(ds => ds.id === 'presentation-queue');
        if (!queue) return state;
        const newQueueData = queue.data.filter((_, index) => index !== itemIndex);
        return {
            ...state,
            dataSources: state.dataSources.map(ds => 
                ds.id === 'presentation-queue' ? { ...ds, data: newQueueData } : ds
            ),
        };
    }
    case 'CLEAR_QUEUE': {
        return {
            ...state,
            dataSources: state.dataSources.map(ds => 
                ds.id === 'presentation-queue' ? { ...ds, data: [] } : ds
            ),
        };
    }
    case 'PROCESS_FETCHED_DATA': {
        const { data: fetchedData } = action.payload;
        
        const currentQueue = state.dataSources.find(ds => ds.id === 'presentation-queue')?.data || [];
        const currentInput = state.dataSources.find(ds => ds.id === 'data-input')?.data || [];

        const existingIds = new Set([
            ...currentQueue.map(item => item.Stt),
            ...currentInput.map(item => item.Stt)
        ]);

        const newItemsForQueue = fetchedData.filter(item => !existingIds.has(item.Stt));
        
        const newQueueData = [...currentQueue, ...newItemsForQueue];
        const newQueueIds = new Set(newQueueData.map(item => item.Stt));

        const updatedInputData = fetchedData.filter(item => !newQueueIds.has(item.Stt));

        return {
            ...state,
            dataSources: state.dataSources.map(ds => {
                if (ds.id === 'presentation-queue') return { ...ds, data: newQueueData };
                if (ds.id === 'data-input') return { ...ds, data: updatedInputData };
                return ds;
            }),
        };
    }
    default:
      return state;
  }
}

const usePresentationReducer = () => {
  const [state, dispatch] = useReducer(presentationReducer, initialState);
  return { state, dispatch };
};

interface PresentationContextType {
  state: PresentationState;
  dispatch: Dispatch<Action>;
}

const PresentationContext = createContext<PresentationContextType | undefined>(undefined);

export const PresentationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state, dispatch } = usePresentationReducer();

  return (
    <PresentationContext.Provider value={{ state, dispatch }}>
      {children}
    </PresentationContext.Provider>
  );
};

export const usePresentation = (): PresentationContextType => {
  const context = useContext(PresentationContext);
  if (!context) {
    throw new Error('usePresentation phải được sử dụng trong một PresentationProvider');
  }
  return context;
};