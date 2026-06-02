"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  isPassword?: boolean;
}

export default function ChatInput({
  onSend,
  disabled = false,
  placeholder = "输入消息...",
  isPassword = false,
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [disabled]);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex gap-2">
      <input
        ref={inputRef}
        type={isPassword ? "password" : "text"}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="pixel-input flex-1"
        autoComplete={isPassword ? "off" : "on"}
      />
      <button
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        className="pixel-btn whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isPassword ? "进入 ▸" : "发送 ▸"}
      </button>
    </div>
  );
}
