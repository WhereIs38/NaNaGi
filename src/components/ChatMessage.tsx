"use client";

interface ChatMessageProps {
  role: "agent" | "user";
  content: string;
  isStreaming?: boolean;
}

export default function ChatMessage({
  role,
  content,
  isStreaming = false,
}: ChatMessageProps) {
  const isAgent = role === "agent";

  return (
    <div className={`flex ${isAgent ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[85%] ${
          isAgent ? "msg-agent" : "msg-user"
        } ${isStreaming ? "cursor-blink" : ""}`}
      >
        <div className="text-xs font-bold mb-1 opacity-50 tracking-wider uppercase">
          {isAgent ? "◆ NanAgi" : "◆ 面试官"}
        </div>
        <div className="chat-content text-sm leading-relaxed whitespace-pre-wrap break-words">
          {content}
        </div>
        {isStreaming && content === "" && (
          <span className="inline-block w-2 h-4 bg-accent animate-pulse" />
        )}
      </div>
    </div>
  );
}
