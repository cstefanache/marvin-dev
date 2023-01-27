import React, { useEffect, useRef, useState } from 'react';


export function Log({ log }: { log: string }) {
  const [messages, setMessages] = useState<string[]>([]);

  const logsRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    const asyncFn = async () => {
      const messages = await window.electron.getLogs(log);
      setMessages(messages);
    };
    asyncFn();

    window.ipcRender.removeAllListeners('log');
    window.ipcRender.receive('log', (section: string, message: string) => {
      // console.log(section, message);
      if (section === log) {
        console.log('received log', section, message)
        setMessages((messages) => [...messages, message].slice(-500));
        scrollToBottom();
      }
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    // logsRef.current?.scrollIntoView({ behavior: "smooth" })
    const element = logsRef.current;
    if (element) {
      const scrollHeight = element.scrollHeight;
      const height = element.clientHeight;
      const maxScrollTop = scrollHeight - height;
      element.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
    }
  };

  return (
    <div className="log-panel" ref={logsRef}>
      {messages.map((message: string, index: number) => (
        <p key={index}>{message}</p>
      ))}
    </div>
  );
}
