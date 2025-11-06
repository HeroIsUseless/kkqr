import React, { useEffect } from 'react';
import {
  loadFromLocalStore,
  saveToLocalStore,
} from './localStore';

// 简单的toast通知函数
export const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 24px;
    background: ${type === 'success' ? '#10b981' : '#ef4444'};
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 9999;
    animation: slideIn 0.3s ease-out;
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => document.body.removeChild(toast), 300);
  }, 2000);
};

export interface Res {
  id: string;
  url: string;
  time: string;
  name: string; // 生成二维码的自定义名字，如果为空则为"生成链接"
}
let bottomTimer: any;
export const changeOneResName = (id: string, name: string) => {
  loadFromLocalStore('fragment-qrcode-res').then(res => {
    try {
      const localRess: any[] = JSON.parse(res);
      if (localRess && localRess.length) {
        localRess.forEach(localRes => {
          if (localRes.id === id) {
            localRes.name = name;
          }
        });
        saveToLocalStore('fragment-qrcode-res', JSON.stringify(localRess));
      }
    } catch (error) {}
  });
};

export function useHooks () {
  const [text, setText] = React.useState('');
  const [ress, setRess] = React.useState<Res[]>([]);
  const [isRessLoaded, setIsRessLoaded] = React.useState(false);
  const bottomDivRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    loadFromLocalStore('fragment-qrcode-res').then(res => {
      try {
        const localRess: any[] = JSON.parse(res);
        setRess(localRess);
        setIsRessLoaded(true);
      } catch (error) {}
    });
    loadFromLocalStore('fragment-qrcode-text').then(res => {
      if (res) {
        setText(res);
      }
    });
    bottomDivRef.current?.addEventListener('scroll', onScroll);
    return () => {
      bottomDivRef.current?.removeEventListener('scroll', onScroll);
    };
  }, []);

  useEffect(() => {
    if (isRessLoaded) {
      loadFromLocalStore('fragment-qrcode-scroll').then(res => {
        if (res) {
          const scrollTop = parseInt(res, 10);
          bottomDivRef.current?.scrollTo(0, scrollTop);
        }
      });
    }
  }, [isRessLoaded]);

  const onScroll = () => {
    clearTimeout(bottomTimer);
    bottomTimer = setTimeout(() => {
      const scrollTop: number = bottomDivRef.current?.scrollTop || 0;
      saveToLocalStore('fragment-qrcode-scroll', String(scrollTop));
    }, 500);
  };

  const onGenBtnClick = () => {
    if (!text) {
      showToast('Link must be not null', 'error');
      return;
    }
    let newRess = [
      {
        id: (Math.random() * 10000).toString(),
        url: text,
        time: new Date().toLocaleString(),
        name: '',
      },
      ...ress,
    ];
    newRess = newRess.slice(0, 20);
    setRess(newRess);
    saveToLocalStore('fragment-qrcode-res', JSON.stringify(newRess));
    saveToLocalStore('fragment-qrcode-text', text);
  };

  return {
    text,
    setText,
    ress,
    setRess,
    bottomDivRef,
    onGenBtnClick,
  };
}
