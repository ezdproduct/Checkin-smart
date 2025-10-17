import { useState, useEffect, useRef } from 'react';
import type { Slide, DataSource } from '@/src/types';
import { populateSlideWithData } from '@/src/utils/presentationUtils';

interface UseAutoplayProps {
    slides: Slide[];
    dataSources: DataSource[];
    autoplayDuration: number;
    dispatch: React.Dispatch<any>;
    mode: 'manual' | 'autoplay';
    initialSlideIndex: number;
}

export const useAutoplay = ({ slides, dataSources, autoplayDuration, dispatch, mode, initialSlideIndex }: UseAutoplayProps) => {
    const [slideState, setSlideState] = useState<{
        current: Slide;
        previous: Slide | null;
        isTransitioning: boolean;
    }>({
        current: slides[initialSlideIndex],
        previous: null,
        isTransitioning: false,
    });
    const [manualSlideIndex, setManualSlideIndex] = useState(initialSlideIndex);
    const presentationQueue = dataSources.find(ds => ds.id === 'presentation-queue')?.data || [];
    const prevQueueLength = useRef(presentationQueue.length);

    useEffect(() => {
        if (mode !== 'autoplay') {
            setSlideState({ current: slides[manualSlideIndex], previous: null, isTransitioning: false });
            return;
        }

        const welcomeSlide = slides[0];
        const maleTemplateSlide = slides[1];
        const femaleTemplateSlide = slides[2];
        const nextItemInQueue = presentationQueue[0];

        if (presentationQueue.length === 0 && prevQueueLength.current > 0) {
            setSlideState(prevState => ({
                previous: prevState.current,
                current: welcomeSlide,
                isTransitioning: true,
            }));
            const timer = setTimeout(() => {
                setSlideState(prevState => ({ ...prevState, previous: null, isTransitioning: false }));
            }, 1000);
            return () => clearTimeout(timer);
        }
        
        if (nextItemInQueue) {
            let templateSlide: Slide | undefined;
            if (String(nextItemInQueue['Giới tính']).trim().toLowerCase() === 'nữ' && femaleTemplateSlide) {
                templateSlide = femaleTemplateSlide;
            } else if (maleTemplateSlide) {
                templateSlide = maleTemplateSlide;
            }

            if (templateSlide) {
                const populatedSlide = populateSlideWithData(templateSlide, nextItemInQueue);
                
                setSlideState(prevState => ({
                    previous: prevState.current,
                    current: populatedSlide,
                    isTransitioning: true,
                }));

                const transitionTimer = setTimeout(() => {
                    setSlideState(prevState => ({ ...prevState, previous: null, isTransitioning: false }));
                }, 1000);

                const slideTimer = setTimeout(() => {
                    dispatch({ type: 'MOVE_QUEUE_ITEM_TO_PRESENTED', payload: { item: nextItemInQueue } });
                }, autoplayDuration);

                return () => {
                    clearTimeout(transitionTimer);
                    clearTimeout(slideTimer);
                };
            } else {
                setSlideState({ current: welcomeSlide, previous: null, isTransitioning: false });
            }
        } else {
            setSlideState({ current: welcomeSlide, previous: null, isTransitioning: false });
        }

        prevQueueLength.current = presentationQueue.length;

    }, [mode, presentationQueue, slides, manualSlideIndex, dispatch, autoplayDuration]);

    const goToNextSlide = () => setManualSlideIndex(prev => (prev + 1) % slides.length);
    const goToPrevSlide = () => setManualSlideIndex(prev => (prev - 1 + slides.length) % slides.length);

    return { slideState, goToNextSlide, goToPrevSlide };
};