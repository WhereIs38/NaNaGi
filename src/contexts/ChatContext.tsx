"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
} from "react";

// —— Types ——

export interface Message {
  role: "agent" | "user";
  content: string;
}

interface ChatContextType {
  messages: Message[];
  streaming: boolean;
  isAuthenticated: boolean;
  checking: boolean;
  loginError: string;
  loginLoading: boolean;
  login: (password: string) => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
}

const WELCOME_MESSAGE: Message = {
  role: "agent",
  content: "你好，我是南志锦的AI分身。\n\n请输入面试密码开始对话。",
};

// —— Context ——

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [streaming, setStreaming] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const messagesRef = useRef<Message[]>([]);

  // Keep ref in sync for the streaming callback
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Check auth on mount
  useEffect(() => {
    fetch("/api/auth")
      .then((r) => r.json())
      .then((data) => {
        setIsAuthenticated(data.authenticated);
        if (data.authenticated) setMessages([]);
      })
      .catch(() => setIsAuthenticated(false))
      .finally(() => setChecking(false));
  }, []);

  // —— Login ——
  const login = useCallback(async (password: string) => {
    setLoginLoading(true);
    setLoginError("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        setIsAuthenticated(true);
        setMessages([]);
      } else {
        const data = await res.json().catch(() => ({}));
        setLoginError(data.error || "密码错误");
      }
    } catch {
      setLoginError("连接失败，请稍后重试");
    } finally {
      setLoginLoading(false);
    }
  }, []);

  // —— Send Message ——
  const sendMessage = useCallback(async (text: string) => {
    if (streaming) return;

    const userMsg: Message = { role: "user", content: text };
    const agentMsg: Message = { role: "agent", content: "" };

    setMessages((prev) => {
      const filtered = prev[0] === WELCOME_MESSAGE ? [] : prev;
      return [...filtered, userMsg, agentMsg];
    });
    setStreaming(true);

    try {
      const history = messagesRef.current.filter((m) => m !== WELCOME_MESSAGE);
      const apiMessages = [...history, userMsg].map((m) => ({
        role: m.role === "agent" ? "assistant" : "user",
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (res.status === 401) {
        setIsAuthenticated(false);
        setMessages([WELCOME_MESSAGE]);
        setStreaming(false);
        return;
      }

      if (!res.ok) {
        const errorText = await res.text();
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = {
            role: "agent",
            content: `抱歉，${errorText || "AI服务暂时不可用"}`,
          };
          return copy;
        });
        setStreaming(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        setStreaming(false);
        return;
      }

      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullContent += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "agent", content: fullContent };
          return copy;
        });
      }
    } catch {
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = {
          role: "agent",
          content: "抱歉，连接中断，请重试。",
        };
        return copy;
      });
    } finally {
      setStreaming(false);
    }
  }, [streaming]);

  return (
    <ChatContext.Provider
      value={{
        messages,
        streaming,
        isAuthenticated,
        checking,
        loginError,
        loginLoading,
        login,
        sendMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
}
