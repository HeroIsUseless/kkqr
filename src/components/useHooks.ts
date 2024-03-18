import React, { useEffect } from 'react';
import {
  loadFromLocalStore,
  saveToLocalStore,
} from './localStore';
import { message } from 'antd';
export interface Res {
  id: string;
  url: string;
  time: string;
  name: string; // 生成二维码的自定义名字，如果为空则为“生成链接”
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
      message.error('Link must be not null');
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
