# NanAgi

**南志锦的个人AI作品集网站。Agent-first设计——AI分身代替传统导航，面试官通过对话了解你的技术能力。**

---

## 设计理念

传统作品集 = 静态页面 + 项目列表。面试官只能被动浏览。

NanAgi = **AI Agent 引导一切**。面试官输入密码进入后，Agent以第一人称自我介绍，引导对话，主动展示项目。不是"看网站"，是"跟南志锦聊"。

```
访问 → 密码登录 → Agent自我介绍 → 面试官自由提问
  → Agent流式回答 → 引导进入项目互动页面（V2）
```

---

## 技术栈

| 层 | 技术 |
|---|------|
| 框架 | Next.js 16 + TypeScript |
| 样式 | Tailwind CSS 4（像素风 + 米白色主题） |
| 鉴权 | bcryptjs + jose (JWT) + httpOnly cookie |
| AI Agent | DeepSeek API（Anthropic兼容端点）流式SSE |
| 部署 | Docker standalone → 腾讯云 |

---

## 项目结构

```
src/
├── app/
│   ├── page.tsx              ← 首页（Agent对话框）
│   ├── layout.tsx            ← 全局框架 + 扫描线效果
│   ├── globals.css           ← 像素风米白色主题
│   ├── api/
│   │   ├── auth/route.ts     ← 密码验证 + JWT签发
│   │   └── chat/route.ts     ← Agent流式对话（System Prompt大脑）
│   └── components/
│       ├── AgentDialog.tsx   ← 主UI（登录/聊天双态）
│       ├── ChatMessage.tsx   ← 消息气泡
│       └── ChatInput.tsx     ← 输入框（密码/聊天双模式）
├── lib/auth.ts               ← JWT工具函数
└── middleware.ts              ← 鉴权门卫（保护/api/chat）
```

---

## 本地运行

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local，填入真实值

# 3. 启动开发服务器
npm run dev
# 打开 http://localhost:3000
```

---

## 环境变量

`.env.local`（不提交到Git）：

| 变量 | 说明 |
|------|------|
| `NANAGI_PASSWORD_HASH` | 登录密码的 bcrypt hash（10轮salt） |
| `DEEPSEEK_API_KEY` | DeepSeek API Key（Anthropic兼容端点） |

---

## Docker 部署

```bash
docker build -t nanagi:latest .
docker run -d --name nanagi --restart unless-stopped \
  -p 3000:3000 \
  --env NANAGI_PASSWORD_HASH="\$2b\$10\$..." \
  --env DEEPSEEK_API_KEY="sk-..." \
  nanagi:latest
```

---

## 路线图

- [x] V1 — 网站框架 + 密码鉴权 + Agent对话
- [ ] V2 — 项目互动页面（水果识别ONNX、CnnMusic音频检索、GNN仪表盘）
- [ ] V3 — Python FastAPI微服务（实时音频推理）

---

## License

Private — 仅供面试使用。
