import { useEffect, useRef } from 'react';

const CHANNEL_NAME = 'deckgenius-presentation-channel';

interface BroadcastMessage {
  type: 'GOTO_SLIDE';
  payload: {
    index: number;
  };
}

export const useBroadcastChannel = (onMessage: (message: BroadcastMessage) => void) => {
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    channelRef.current = new BroadcastChannel(CHANNEL_NAME);
    
    const handleMessage = (event: MessageEvent<BroadcastMessage>) => {
      onMessage(event.data);
    };

    channelRef.current.addEventListener('message', handleMessage);

    return () => {
      channelRef.current?.removeEventListener('message', handleMessage);
      channelRef.current?.close();
    };
  }, [onMessage]);

  const postMessage = (message: BroadcastMessage) => {
    // Tạo một kênh tạm thời để gửi tin nhắn
    const postChannel = new BroadcastChannel(CHANNEL_NAME);
    postChannel.postMessage(message);
    // Đóng kênh ngay sau khi gửi để tránh rò rỉ
    postChannel.close();
  };

  return { postMessage };
};