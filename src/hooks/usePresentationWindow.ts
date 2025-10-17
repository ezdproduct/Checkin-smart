import { useState, useEffect, useCallback } from 'react';

export const usePresentationWindow = (onClose: () => void) => {
  const [presentationWindow, setPresentationWindow] = useState<Window | null>(null);
  const [container, setContainer] = useState<HTMLElement | null>(null);

  const openPresentationWindow = useCallback(() => {
    const newWindow = window.open('', 'presentationWindow', 'width=1280,height=720,menubar=no,toolbar=no,location=no,status=no');
    if (newWindow) {
      newWindow.document.title = 'DeckGenius - Trình chiếu';
      
      // Sao chép toàn bộ nội dung <head> từ cửa sổ chính để đảm bảo CSS được tải đúng
      newWindow.document.head.innerHTML = document.head.innerHTML;

      const root = newWindow.document.createElement('div');
      root.id = 'presentation-root';
      newWindow.document.body.appendChild(root);
      newWindow.document.body.style.margin = '0';
      newWindow.document.body.style.overflow = 'hidden';
      
      setPresentationWindow(newWindow);
      setContainer(root);
    }
  }, []);

  useEffect(() => {
    let interval: number;
    if (presentationWindow) {
      interval = window.setInterval(() => {
        if (presentationWindow.closed) {
          onClose();
          setPresentationWindow(null);
          setContainer(null);
          clearInterval(interval);
        }
      }, 500);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
      if (presentationWindow && !presentationWindow.closed) {
        presentationWindow.close();
      }
    };
  }, [presentationWindow, onClose]);

  return { openPresentationWindow, container };
};