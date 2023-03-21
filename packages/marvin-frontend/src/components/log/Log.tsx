import React, { useEffect, useRef, useState } from 'react';
import './LogStyles.scss';
export function Log({ log }: { log: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const logsRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    const asyncFn = async () => {
      const messages = await window.electron.getLogs(log);
      setMessages(messages);
    };
    asyncFn();

    window.ipcRender.removeAllListeners('log');
    window.ipcRender.receive('log', (section: string, message: any[]) => {
      if (section === log) {
        setMessages((messages) => {
          const newMessages = message[2] ? messages.slice(0, -1) : messages;

          return [...newMessages, message];
        });
        scrollToBottom();
      }
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef?.current?.scrollIntoView();
  };

  return (
    <div className="log-panel" ref={logsRef}>
      {messages.map((message: string, index: number) => (
        <pre
          style={{ color: message[0] }}
          key={index}
          dangerouslySetInnerHTML={{ __html: message[1] }}
        ></pre>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
