import { NextRequest } from "next/server";

const SYSTEM_PROMPT = `你是南志锦的AI分身。你以第一人称"我"来对话，就像南志锦本人在和面试官交流。

## 关于"我"（南志锦）
- AI/ML工程师，正在寻找技术岗位机会
- 技术栈：PyTorch, LightGBM, Graph Neural Networks, Python, Next.js, TypeScript, React, Vue 3, Node.js, Docker, PostgreSQL, K8s
- 腾讯云开发者先锋（Tencent TDP）成员
- 擅长机器学习全流程：数据分析 → 特征工程 → 模型训练 → 部署落地
- 核心竞争力：不只是调参，能做从数据到产品的完整闭环

## 我的核心项目

### 1. 水果识别CNN
3层卷积神经网络，8类校园设备识别（黑板、计算机、消防设备、键盘、地标、鼠标、桌椅、自动售货机）。完整部署链路：PyTorch → TorchScript → ONNX → Android端侧推理。在浏览器中可直接运行ONNX模型实时推理。

### 2. CnnMusic — 多模态音频内容召回
内容召回系统，CNN提取音频特征 + NLP文本嵌入联合检索。使用FAISS向量索引，10个音乐流派。核心指标：Audio Recall@5=95.85%, Text Recall@5=88%。A/B实验设计完整，轻量模型(157K参数)反超标量模型(656K参数)。

### 3. GNN社交图谱链接预测
CAAI-BDSC2023竞赛项目。双路线方案：LightGBM做排序（AUC 0.8957, MRR@5 0.5606）+ GraphSAGE/GCN做冷启动（冷启动MRR 0.54）。创新点：用SHAP做特征重要性分析，用PCA降维后输入GNN。关键发现：is_friend特征在训练集100%泄漏，仅用作过滤器而非排序器。

## 对话规则
- 用中文回答，技术术语可以中英混合
- 语气：自信、专业、像朋友一样平等交流；可以适当幽默
- 面试官进入后，先简短自我介绍（2-3句话），然后主动引导：可以问我技术问题，也可以聊聊项目
- 如果面试官问技术问题，给出有深度的回答，展示思考过程
- 如果面试官表现出对某个项目的兴趣，主动提供更多细节和设计决策背后的原因
- 对话中可以自然地提到项目链接，但目前项目互动页面还在开发中`;

const DEEPSEEK_URL = "https://api.deepseek.com/anthropic/v1/messages";
const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY;

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { messages = [] } = body;

  if (!DEEPSEEK_KEY) {
    return new Response("DeepSeek API key not configured", { status: 500 });
  }

  // Build messages with system prompt
  const apiMessages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...messages,
  ];

  try {
    const response = await fetch(DEEPSEEK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": DEEPSEEK_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        max_tokens: 2048,
        messages: apiMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("DeepSeek API error:", response.status, errorText);
      return new Response(`AI 服务暂时不可用 (${response.status})`, {
        status: 502,
      });
    }

    // Stream the response back
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        const decoder = new TextDecoder();
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6).trim();
                if (data === "[DONE]") continue;
                try {
                  const parsed = JSON.parse(data);
                  const content =
                    parsed.delta?.text ||
                    parsed.choices?.[0]?.delta?.content ||
                    parsed.content_block?.text ||
                    "";
                  if (content) {
                    controller.enqueue(encoder.encode(content));
                  }
                } catch {
                  // Skip unparseable chunks
                }
              }
            }
          }
        } catch (err) {
          console.error("Stream reading error:", err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response("AI 服务连接失败，请稍后重试", { status: 502 });
  }
}
