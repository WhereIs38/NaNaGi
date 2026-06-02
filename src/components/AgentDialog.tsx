"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";

interface Message {
  role: "agent" | "user";
  content: string;
}

const WELCOME_MESSAGE: Message = {
  role: "agent",
  content: "你好，我是南志锦的AI分身。\n\n请输入面试密码开始对话。",
};

export default function AgentDialog() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [streaming, setStreaming] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check auth status on mount
  useEffect(() => {
    fetch("/api/auth")
      .then((r) => r.json())
      .then((data) => {
        setAuthenticated(data.authenticated);
        if (data.authenticated) {
          setMessages([]);
        }
      })
      .catch(() => setAuthenticated(false))
      .finally(() => setChecking(false));
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleLogin = useCallback(async (password: string) => {
    setLoginLoading(true);
    setLoginError("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        setAuthenticated(true);
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

  const handleSend = useCallback(
    async (text: string) => {
      if (streaming) return;

      const userMsg: Message = { role: "user", content: text };
      const agentMsg: Message = { role: "agent", content: "" };
      setMessages((prev) => [...prev, userMsg, agentMsg]);
      setStreaming(true);

      try {
        const history = [...messages.filter((m) => m !== WELCOME_MESSAGE), userMsg];
        const apiMessages = history.map((m) => ({
          role: m.role === "agent" ? "assistant" : "user",
          content: m.content,
        }));

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: apiMessages }),
        });

        if (res.status === 401) {
          setAuthenticated(false);
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

          const chunk = decoder.decode(value, { stream: true });
          fullContent += chunk;

          setMessages((prev) => {
            const copy = [...prev];
            copy[copy.length - 1] = {
              role: "agent",
              content: fullContent,
            };
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
    },
    [messages, streaming]
  );

  // Loading state
  if (checking) {
    return (
      <div className="rpg-dialog w-full max-w-2xl mx-4">
        <p className="text-ink-muted text-sm animate-pulse">
          ◆ 系统启动中...
        </p>
      </div>
    );
  }

  // Locked state — password prompt
  if (!authenticated) {
    return (
      <div className="w-full max-w-2xl mx-4">
        <div className="rpg-dialog">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold tracking-wider mb-2">
              NanAgi
            </h1>
            <p className="text-ink-muted text-sm tracking-wider">
              ◆ 南志锦 AI 作品集 ◆
            </p>
          </div>

          {/* Agent intro */}
          <div className="msg-agent mb-5">
            <div className="text-xs font-bold mb-1 opacity-50 tracking-wider">
              ◆ NanAgi
            </div>
            <p className="text-sm leading-relaxed">
              {WELCOME_MESSAGE.content}
            </p>
          </div>

          {/* Password input */}
          <ChatInput
            onSend={handleLogin}
            disabled={loginLoading}
            placeholder="输入面试密码..."
            isPassword
          />

          {/* Error */}
          {loginError && (
            <p className="text-accent text-xs mt-3 font-bold tracking-wider">
              ✗ {loginError}
            </p>
          )}

          {/* Loading */}
          {loginLoading && (
            <p className="text-ink-muted text-xs mt-3 animate-pulse tracking-wider">
              ◆ 验证中...
            </p>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-ink-muted text-xs mt-6 tracking-wider">
          仅供面试使用 · 密码请联系南志锦获取
        </p>
      </div>
    );
  }

  // Authenticated — chat interface
  return (
    <div className="w-full max-w-2xl mx-4 flex flex-col" style={{ height: "calc(100vh - 4rem)" }}>
      {/* Header bar */}
      <div className="pixel-border-light bg-cream-card px-4 py-2 mb-3 flex items-center justify-between">
        <span className="text-xs font-bold tracking-wider">◆ NanAgi 在线</span>
        <span className="text-xs text-ink-muted">
          {streaming ? "回复中..." : "就绪"}
        </span>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-1 py-2 space-y-3 mb-3">
        {messages.length === 0 && (
          <div className="msg-agent text-center">
            <div className="text-xs font-bold mb-1 opacity-50 tracking-wider">
              ◆ NanAgi
            </div>
            <p className="text-sm leading-relaxed">
              欢迎！我是南志锦，一名AI/ML工程师。
              <br />
              <br />
              我的技术栈覆盖机器学习全流程：从数据分析、特征工程到模型训练和部署落地。
              <br />
              <br />
              你可以问我：
              <br />
              • 技术问题（ML算法、系统设计）
              <br />
              • 我的项目细节（CNN分类、音频召回、GNN预测）
              <br />
              • 设计决策背后的思考
              <br />
              <br />
              从哪里开始？
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <ChatMessage
            key={i}
            role={msg.role}
            content={msg.content}
            isStreaming={streaming && i === messages.length - 1 && msg.role === "agent"}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="pixel-border-light bg-cream-card px-4 py-3">
        <ChatInput
          onSend={handleSend}
          disabled={streaming}
          placeholder="问任何关于南志锦或项目的问题..."
        />
        <p className="text-ink-muted text-xs mt-2 text-center tracking-wider">
          Enter 发送 · 南志锦 AI 分身
        </p>
      </div>
    </div>
  );
}
