# NanAgi 代码目录

> 每个文件的用途，以及它们之间的调用关系。

---

## 全景图

```
用户浏览器
  │
  ▼
┌── Next.js ──────────────────────────────────────────┐
│                                                       │
│  src/middleware.ts  ← 门卫，拦截/api/chat             │
│  src/lib/auth.ts    ← JWT工具箱，middleware和API共用  │
│                                                       │
│  ┌─ 前端 ────────────────────────────────────────┐   │
│  │  src/app/layout.tsx    全局框架（字体+扫描线）  │   │
│  │  src/app/page.tsx      首页（只有一行）         │   │
│  │  src/app/globals.css   视觉主题（像素风+米白）  │   │
│  │                                                │   │
│  │  src/components/                               │   │
│  │  ├── AgentDialog.tsx   主UI组件                 │   │
│  │  ├── ChatMessage.tsx   消息气泡                 │   │
│  │  └── ChatInput.tsx     输入框                   │   │
│  └────────────────────────────────────────────────┘   │
│                                                       │
│  ┌─ 后端 API ────────────────────────────────────┐   │
│  │  src/app/api/auth/route.ts   POST=登录 GET=状态│   │
│  │  src/app/api/chat/route.ts   POST=流式对话     │   │
│  └────────────────────────────────────────────────┘   │
│                                                       │
└───────────────────────────────────────────────────────┘
```

---

## 前端层：用户看到的

### `src/app/layout.tsx`
**全局框架。** 所有页面的外壳。

做的事：加载 Geist Mono 字体、设置页面标题（NanAgi \| 南志锦 AI Portfolio）、渲染子页面内容、在页面最上层铺一层 CSS 扫描线效果。

```tsx
<html lang="zh-CN">
  <body>
    {children}           ← 这里就是 page.tsx 的内容
    <div class="scanlines"/>  ← 扫描线叠加层
  </body>
</html>
```

### `src/app/page.tsx`
**首页。** 整个文件就一行有意义的内容：

```tsx
<AgentDialog />
```

没有导航栏、没有侧边栏、没有项目列表。Agent 对话框就是整个网站的 UI。

### `src/app/globals.css`
**视觉主题。** 定义了网站的全部外观，不需要改组件代码就能换风格。

- `:root {}` → 配色变量：米白底(`#FBF7F0`)、深棕字(`#2D2420`)、暖橙强调(`#D4745C`)
- `.pixel-border` → 像素风双层边框 + 阴影
- `.pixel-btn` → 像素按钮（hover 时浮起，active 时按下）
- `.pixel-input` → 像素输入框（focus 时橙色边框）
- `.rpg-dialog` → RPG 对话框（粗边框 + 四角色块装饰）
- `.msg-agent` / `.msg-user` → 消息气泡（Agent 米白底，用户黑底白字）
- `.scanlines` → 像素扫描线（每4px一条半透明横线）
- `::-webkit-scrollbar` → 像素风滚动条

### `src/components/AgentDialog.tsx`
**主 UI 组件。** 整个网站的交互逻辑都在这里。三种状态：

| 状态 | 触发条件 | 显示 |
|------|---------|------|
| 检查中 | 页面刚加载，正在 `/api/auth` 确认登录态 | `◆ 系统启动中...` 闪烁 |
| 未登录 | 没有有效 cookie | 密码输入框 + 引导文字 |
| 已登录 | cookie 有效 | 聊天历史 + 消息输入 + 发送按钮 |

关键逻辑：
- `handleLogin(password)` → `POST /api/auth` → 成功则切换到已登录态
- `handleSend(text)` → `POST /api/chat` → 读 `ReadableStream` → 逐字更新消息 → 打字机效果
- 聊天 API 返回 401 时自动踢回未登录态

### `src/components/ChatMessage.tsx`
**消息气泡。** 纯展示组件，接收三个参数：

| 参数 | 类型 | 说明 |
|------|------|------|
| `role` | `"agent"` 或 `"user"` | Agent 靠左、用户靠右 |
| `content` | `string` | 消息正文，支持 Markdown |
| `isStreaming` | `boolean` | 正在打字中时显示闪烁光标 |

### `src/components/ChatInput.tsx`
**输入框。** 双模式组件：
- `isPassword=true` → 密码模式（`type="password"`，placeholder="输入面试密码..."）
- `isPassword=false` → 聊天模式（`type="text"`，placeholder="问任何关于南志锦或项目的问题..."）

Enter 发送，Shift+Enter 换行。

---

## 后端层：API 路由

### `src/app/api/auth/route.ts`
**登录验证。** 两个 HTTP 方法：

| 方法 | 功能 | 输入 | 输出 |
|------|------|------|------|
| `GET` | 检查登录状态 | cookie 中的 JWT | `{authenticated: true/false}` |
| `POST` | 密码登录 | `{password: string}` | 成功：`{success: true}` + 种 cookie；失败：`{error: "密码错误"}` |

流程：`POST` → bcrypt 比对 → 调用 `lib/auth.ts` 签发 JWT → `Set-Cookie` httpOnly cookie（1小时过期）。

### `src/app/api/chat/route.ts`
**Agent 大脑。** 只接受 `POST`。

流程：
```
收到 messages[]
  → 在前面插入 SYSTEM_PROMPT（南志锦身份+3个项目知识+对话规则）
  → fetch DeepSeek API (api.deepseek.com/anthropic/v1/messages)
  → 收到流式响应 → 逐个 SSE chunk 解析
  → 通过 ReadableStream 实时推送给前端
```

**System Prompt 里写了什么：**
- 南志锦的身份（AI/ML 工程师、技术栈、TDP 成员）
- 3 个核心项目的详细知识（水果识别 CNN、CnnMusic、GNN）
- 对话规则（中文回答、主动引导、自信专业但朋友般平等）

改 Agent 说的话就改这里。

---

## 基础设施层

### `src/middleware.ts`
**门卫。** 拦截 `/api/chat` 的所有请求。

```typescript
if (pathname.startsWith("/api/chat")) {
  读取 cookie "nanagi_token"
  → 没有 → 返回 401 "未登录，请输入密码"
  → 有但过期 → 返回 401 "登录已过期"
  → 有效 → 放行
}
```

公开路径不拦截：`/`（首页）、`/api/auth`（登录接口）。未来加项目页 (`/projects/*`) 时在这里添加保护。

### `src/lib/auth.ts`
**JWT 工具箱。** 被 `middleware.ts` 和 `api/auth/route.ts` 共用。

| 函数 | 功能 |
|------|------|
| `createToken()` | 用 `NANAGI_PASSWORD_HASH` 作为密钥签发 JWT，有效期 1 小时 |
| `verifyToken(token)` | 验证 JWT 是否有效 |
| `setAuthCookie(token)` | 种 httpOnly cookie (`nanagi_token`) |
| `getAuthCookie()` | 从请求中读取 cookie |
| `isAuthenticated()` | 一键检查当前请求是否已登录 |

### `src/app/favicon.ico`
浏览器标签页图标。目前是 Next.js 默认的，以后换你自己的。

---

## 配置文件（用得着的时候看一眼）

| 文件 | 说明 |
|------|------|
| `.env.local` | **环境变量。** 密码 hash + DeepSeek Key。不提交 Git |
| `.env.example` | **环境变量模板。** 占位符，可安全提交 GitHub |
| `.gitignore` | **Git 忽略规则。** 声明 `.env.local`、`node_modules/`、`.next/` 不提交 |
| `package.json` | **项目身份证。** 名字、版本、依赖列表、启动命令 |
| `next.config.ts` | **Next.js 设置。** 就一行：`output: "standalone"`（Docker 部署用） |
| `tsconfig.json` | **TypeScript 规则。** `@/*` 映射到 `src/*` |
| `Dockerfile` | **Docker 镜像配方。** 部署到腾讯云时用 |
| `eslint.config.mjs` | 代码格式检查，默认规则 |
| `postcss.config.mjs` | Tailwind CSS 编译插件 |

---

## 一个请求的完整旅程

```
面试官输入密码 "1661186826" 按 Enter
  │
  ▼
AgentDialog.handleLogin("1661186826")
  │
  ▼
POST /api/auth  { password: "1661186826" }
  │
  ├── route.ts: bcrypt.compare(password, hash) → true
  ├── auth.ts: createToken() → JWT
  ├── auth.ts: setAuthCookie() → Set-Cookie 响应头
  └── 返回 { success: true }
  │
  ▼
AgentDialog: setAuthenticated(true) → 切换到聊天界面
  │
  ▼
面试官问："你的GNN项目怎么处理数据泄露的？"
  │
  ▼
AgentDialog.handleSend("你的GNN项目...")
  │
  ▼
POST /api/chat  { messages: [...] }
  Cookie: nanagi_token=eyJ...
  │
  ├── middleware.ts: jwtVerify(token) → 有效 → 放行
  ├── route.ts: 拼接 System Prompt + 用户消息
  ├── fetch DeepSeek → SSE 流式响应
  └── ReadableStream → 逐字推给前端
  │
  ▼
AgentDialog: 逐字更新最后一条消息 → 打字机效果
```

---

## 文件数量

| 类别 | 数量 | 文件 |
|------|------|------|
| 你写的代码 | 9 | `src/` 下的所有 `.ts`/`.tsx`/`.css` |
| 你写的配置 | 1 | `Dockerfile` |
| 环境变量 | 2 | `.env.local`(不提交) + `.env.example`(提交) |
| 自动生成 | 6 | `package.json`、`tsconfig.json`、`next.config.ts`、`eslint.config.mjs`、`postcss.config.mjs`、`next-env.d.ts` |
| 项目文档 | 2 | `README.md`、`CODE_DIRECTORY.md`（本文件） |
| 全部依赖 | 359个包 | `node_modules/`（不提交） |
| 编译产物 | — | `.next/`（不提交） |
