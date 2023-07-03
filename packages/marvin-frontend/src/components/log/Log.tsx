import React, { useEffect, useMemo, useRef, useState } from 'react';
import './LogStyles.scss';

export function Log({ log, filter }: { log: string; filter: string }) {
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
  }, [log]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesEndRef?.current) {
      if (
        logsRef?.current.scrollTop >
        logsRef?.current.scrollHeight - logsRef?.current.offsetHeight - 300
      ) {
        messagesEndRef?.current.scrollIntoView();
      }
    }
  };

  const filteredData = useMemo(() => {
    return filter && messages
      ? messages?.filter(
          (v) =>
            !filter || v?.[1]?.toLowerCase().indexOf(filter.toLowerCase()) > -1
        )
      : messages;
  }, [messages, filter]);

  return (
    <div className="log-panel" ref={logsRef}>
      {filteredData.map((message: string, index: number) => (
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
