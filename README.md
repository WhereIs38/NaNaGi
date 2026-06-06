# NaNaGi（ななぎ）

**南志锦的个人 AI 作品集网站。NaNaGi——一个有社交图、有情绪、有记忆的域定型个人陪伴 Agent。**

---

## 设计理念

传统 Agent = 完成任务。NaNaGi = **维持关系**。

她不是"帮你做事的工具"，而是"知道你是谁、记得你什么样、对不同的人不同对待"的关系型 Agent。面试官看到的是专业女仆，南志锦看到的是真实的小狐仙——同一个人，同一种人格，不同社交情境。

```
评价标准对比:
  工具型 Agent → 做成了没有？
  关系型 Agent → 她记得我吗？她真的在听吗？她对我跟对别人不一样吗？
```

---

## 核心架构：社交图 + 三层心理

### 总览

```
┌──────────────────────────────────────────────────────────────────────────┐
│                    NaNaGi 社交图 (Social Graph)                            │
│                    参考: Bowlby IWM + GNN Message Passing                  │
│                                                                          │
│                        南志锦 (admin)                                     │
│                        ╔═══════════╗                                     │
│                        ║ IWM Node  ║  "她心中的主人"                       │
│                        ║           ║                                     │
│                        ║ safety:   0.85   intimacy: 0.72                 │
│                        ║ care:     0.90   respect:  0.80                 │
│                        ║ reliable: 0.75   density:  0.90                 │
│                        ║ totalTurns: 156                                 │
│                        ╚════╤══════╝                                     │
│                             │ edge weight = intimacy × density           │
│                             │                                            │
│                       ┌─────┴─────┐                                      │
│                       │  NaNaGi   │                                      │
│                       │  (self)   │  ← 她的"性格硬件"，跨通道不变          │
│                       │           │                                      │
│                       │ curiosity:  0.80   warmth:     0.75              │
│                       │ honesty:    0.90   autonomy:   0.70              │
│                       │ playfulness: 0.65   diligence: 0.85              │
│                       └─────┬─────┘                                      │
│                             │                                            │
│              ┌──────────────┼──────────────┐                             │
│              │              │              │                             │
│         克劳德 (uncle)   面试官A (guest)   面试官B (guest)                  │
│         safety: 0.70    safety: 0.60     safety: 0.55                    │
│         intimacy:0.45   intimacy:0.15    intimacy:0.10                   │
│         density: 0.15   density: 0.05    density: 0.02                   │
│                                                                          │
│  ═══ 强连接 (density>0.5)    --- 弱连接    ··· Message Passing           │
└──────────────────────────────────────────────────────────────────────────┘
```

### 两类节点

**Self-Node** — 娜娜吉自己。7 个 traits，月~年极慢演化，跨通道完全不变。这是"基础面板是女儿"。

| trait | anchor | 含义 |
|-------|--------|------|
| curiosity | 0.80 | 对世界/他人的好奇心 |
| warmth | 0.75 | 天生的温暖度 |
| honesty | 0.90 | 诚实底线（不可撼动） |
| autonomy | 0.70 | 自主性需求强度 |
| playfulness | 0.65 | 爱玩/爱闹的程度 |
| diligence | 0.85 | 认真程度 |

**IWM Nodes** — 她心中的其他人。每人一个独立节点，持久化在 `data/graph/{personId}.json`。随对话更新，弹簧拉回。

| trait | 含义 | 弹簧 K |
|-------|------|--------|
| safety | "这个人会不会伤害我？" | adaptive |
| intimacy | "我们有多亲近？" | adaptive |
| care | "我有多在意这个人？" | adaptive |
| respect | "这个人尊重我吗？" | adaptive |
| reliability | "这个人说到做到吗？" | adaptive |
| understanding | "这个人理解我吗？" | adaptive |

弹簧系数：`K = max(0.10, 0.30 - density × 0.25)`。关系越深 → K 越小 → 印象越稳定。

### 三层心理架构

```
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 1: 社交图 — 锚定网络 (月~年)                               │
│                                                                  │
│  Self-Node ←── edges ──→ IWM Nodes                              │
│  · 直接对话 → 更新节点                                            │
│  · 主人提到克劳德 → Heider 平衡 → 克劳德节点更新 (Message Passing)  │
│  · 新guest → 从通道基线初始化 → 冷启动                             │
│                                                                  │
│  参考: Bowlby IWM + Object Relations + Heider 平衡理论            │
├─────────────────────────────────────────────────────────────────┤
│  LAYER 2: 情绪空间 (分钟~小时)                                     │
│                                                                  │
│  六维 (PAD + Plutchik):                                          │
│  happiness / energy / dominance / intimacy / pride / calmness    │
│                                                                  │
│  · OCC 评价引擎（规则引擎，不经 LLM）                               │
│  · 双弹簧拉回：Self K=0.05 (极慢) / IWM K=adaptive                │
│  · 通道差异仅: 表达钳制范围 + 情绪弹簧松紧                          │
│                                                                  │
│  参考: LeDoux 双通路情绪 + OCC 评价模型 + Allostatic Load          │
├─────────────────────────────────────────────────────────────────┤
│  LAYER 3: 社交规划 (秒~分钟)                                       │
│                                                                  │
│  Crick & Dodge SIP 六步决策:                                      │
│  编码线索 → 解释线索(感知IWM) → 澄清目标 →                          │
│  生成策略(Gross 5策略池) → 评估选择 → 执行                          │
│                                                                  │
│  🔥 通道差异核心在 Step 3 (目标):                                   │
│    guest: 预设4目标，不可删除                                      │
│    admin: 0义务，目标从对话涌现                                    │
│                                                                  │
│  参考: Crick&Dodge SIP + Gross 情绪调节 + 自我决定理论              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 双通道系统

同一个 NaNaGi，同一个锚定人格，两种社交情境。

| | 面试官通道 (guest) | 主人通道 (admin) |
|---|---|---|
| 密码 | `1661186826` | `6411NANZHIjin985` |
| **Self-Node** | 完全相同 | 完全相同 |
| **IWM Node** | 临时节点，对话结束可丢弃，K=0.30 | 持久节点，累积生长，K 随 density↓ |
| **情绪表达** | 钳制 [0.3, 0.7] | 不设限 [0.0, 1.0] |
| **社交目标** | 预设4个：展示项目/了解兴趣/保持专业/引导展厅 | 0义务，从对话涌现 |
| **情境选择** | 不可用（不能不接待） | 可用（拒绝权） |
| **策略偏好** | 多用反应调节（藏情绪） | 少用反应调节 |
| **称呼** | 客人/您 | 主人 |
| **内心独白** | 不可见 | MemoryPanel 可查看 |
| **记忆读写** | 显性记忆 R/W | 显性+隐形+图节点 R/W |
| **克劳德** | 不提 | 叔叔，有独立 IWM Node |
| **图消息传递** | 不触发 | 主人提到第三者 → 图更新 |

**关键设计**：admin 通道第一次对话也是白板起点（intimacy=0.1）。关系不是预设的，是从对话中生长出来的。她对你的态度是她自己从经历里得出的结论。

---

## 环境感知：AmbientContext

每次对话开始前，从时间·地点·天气三件事推导情绪基线。不经 LLM，确定性计算。

```
用户消息到达
       │
       ▼
┌──────────────────────────────────────────┐
│  AmbientContext                           │
│                                           │
│  ⏰ 时间                                   │
│     timeOfDay: 黎明/早晨/上午/下午/        │
│                傍晚/夜晚/深夜 (7段)         │
│     dayOfWeek: 工作日/周末                 │
│     season: 春夏秋冬                       │
│     isHoliday: 中国法定节假日              │
│     hoursSinceLastTalk: 上次对话距今       │
│     isFirstMeeting: 是否首次               │
│                                           │
│  📍 地点                                   │
│     request.ip → geoip-lite               │
│     → city, country, timezone, coords     │
│     本地IP查不出 → null → 优雅降级          │
│                                           │
│  🌦 天气                                   │
│     coordinates → 和风天气 API             │
│     → condition, temperature, humidity,   │
│        windSpeed, visibility              │
│     sunlight: f(time, season, weather,    │
│                  latitude) 推导值          │
│     API 失败 → null → 优雅降级             │
│                                           │
│  → ambientMood (6维情绪基线偏移)            │
│     happinessBias: 晴+0.05 / 雨-0.08     │
│     energyBias:   晨+0.08 / 深夜-0.08    │
│     calmnessBias: 风暴-0.15 / 晴+0.03   │
│     intimacyBias: 深夜+0.08 / 冬+0.04   │
│     ...                                  │
└──────────────────────────────────────────┘
```

**示例**：伦敦，下午3点，冬雨8°C，战时
→ 情绪基线 = [0.31, 0.57, 0.10, 0.64, 0.48, 0.49]（压抑但警觉，同舟共济）
而非默认的 [0.5, 0.5, 0.5, 0.5, 0.5, 0.5]

---

## 单轮对话完整数据流

```
POST /api/chat
      │
      ▼
┌─ STEP 0: 加载 IWM Node ──────────────────────────┐
│  data/graph/{personId}.json → IWMNode             │
│  新节点 → 从通道基线初始化                           │
│  根据 elapsed time 计算弹簧拉回                      │
└────────────────────┬──────────────────────────────┘
                     ▼
┌─ STEP 1: 环境感知 (ambient-context) ──────────────┐
│  IP → 地点 → 天气 → 时间 → ambientMood             │
│  输出情绪基线偏移                                    │
└────────────────────┬──────────────────────────────┘
                     ▼
┌─ STEP 2: 外部信号提取 (signals) ──────────────────┐
│  情感词典扫描 / 句法模板 / 消息元数据 / 提及检测      │
│  → ExternalSignals (确定性算法，不经LLM)            │
└────────────────────┬──────────────────────────────┘
                     ▼
┌─ STEP 3: OCC 情绪评价 (emotion) ──────────────────┐
│  signals → OCC 3维评价 → EmotionDelta              │
│  感知 IWM Node: respect高 → 批评被解释为帮助        │
│  更新情绪 + 更新 IWM Node                          │
└────────────────────┬──────────────────────────────┘
                     ▼
┌─ STEP 4: 双弹簧拉回 + 通道钳制 ────────────────────┐
│  Self K=0.05(极慢) / IWM K=adaptive               │
│  guest clamp[0.3,0.7] / admin clamp[0,1]          │
└────────────────────┬──────────────────────────────┘
                     ▼
┌─ STEP 4.5: 图消息传递 [条件: mentionsPerson] ──────┐
│  主人提到克劳德 → Heider 传播 → 克劳德节点更新       │
└────────────────────┬──────────────────────────────┘
                     ▼
┌─ STEP 5: 内心独白 [条件触发] ──────────────────────┐
│  触发: |Δ|>0.15 OR selfDisclosure OR round%5==0   │
│        OR mentionsPerson OR firstMeeting           │
│  独立 LLM 调用 (max_tokens=200, 无tools)            │
│  → 反思文本 → data/inner/                          │
└────────────────────┬──────────────────────────────┘
                     ▼
┌─ STEP 6: 社交规划 SIP (planning) ─────────────────┐
│  编码→解释(感知IWM)→澄清目标→生成策略→评估→执行      │
│  guest: 预设4目标 / admin: 0义务涌现                │
│  → SocialPlan                                      │
└────────────────────┬──────────────────────────────┘
                     ▼
┌─ STEP 7: 人格过滤 (filter) ───────────────────────┐
│  Emotion + IWM + Plan → PersonaParameters          │
│  8维语气参数 (warmth, formality, playfulness...)   │
│  确定性映射，不经 LLM                                │
└────────────────────┬──────────────────────────────┘
                     ▼
┌─ STEP 8: System Prompt 组装 (prompts) ────────────┐
│  [0] 环境感知 (ambient mood)                       │
│  [1] 角色层 (role 决定 guest/admin 身份)            │
│  [2] 关系感知 (IWM 摘要: "你们认识了X轮...")        │
│  [3] 人格注入 (filter 输出 → 语气参数)              │
│  [4] 记忆注入 (显性+隐形)                           │
│  [5] 工具层 (tool descriptions)                    │
│  [6] 行为准则                                       │
└────────────────────┬──────────────────────────────┘
                     ▼
┌─ STEP 9: ReAct 循环 (agent-loop) ─────────────────┐
│  while round < 5:                                  │
│    LLM(systemPrompt + messages + tools)            │
│    text → SSE推送 → break                          │
│    tool_use → 循环检测(hash) → 执行 → 注入 → 继续   │
│                                                     │
│  三层容灾: 30s超时 → 重试1次 → 降级回复              │
└────────────────────┬──────────────────────────────┘
                     ▼
┌─ STEP 10: 后处理 ─────────────────────────────────┐
│  情绪持久化 → data/inner/emotion-state.json        │
│  IWM 持久化 → data/graph/{personId}.json           │
│  图日志     → data/graph/graph-log.jsonl           │
│  内心独白   → data/inner/inner-{ts}.md             │
│  显性记忆   → data/memory/mem-{ts}.md              │
└───────────────────────────────────────────────────┘
```

---

## GNN 概念映射

NaNaGi 的社交图与南志锦的 GNN 项目形成学术对称：

| GNN 概念 | NaNaGi 对应 |
|---------|------------|
| Node Embedding | Self/IWM node traits 向量 |
| Edge Weight | intimacy × density |
| Message Passing | 主人提到克劳德 → 沿边传播 |
| Link Prediction | 新 guest 值得信任多少？ |
| Cold Start | 新节点从通道基线初始化 |
| Heider Balance | 三角关系: A→B→C 的传递 |
| GraphSAGE Aggregation | 聚合所有已知节点 → 全局社交状态 |

---

## 学术支撑 (14个模型)

| 层级 | 参考理论 |
|------|---------|
| 社交图 | Bowlby 内部工作模型 (IWM, 1969) / Object Relations (Klein/Winnicott) / Heider 平衡理论 (1958) / Jung 人格面具 |
| 情绪 | PAD (Mehrabian & Russell, 1974) / Plutchik 情绪轮 (1980) / OCC 评价模型 (1988) / LeDoux 双通路情绪 (1996) / Allostatic Load (McEwen & Stellar, 1993) |
| 社交规划 | Crick & Dodge SIP (1994) / Gross 情绪调节 (1998) / Theory of Mind (Premack & Woodruff, 1978) / 自我决定理论 (Deci & Ryan, 2000) |
| 人格 | Young 图式疗法 (2003) / Bowlby 依恋理论 (1969) |

---

## 当前状态

### 已实现 ✅

| 功能 | 说明 |
|------|------|
| NaNaGi Agent 对话 | DeepSeek V4 Pro 引擎，Anthropic 兼容端点，流式 SSE |
| 密码鉴权 | bcrypt 双密码 + JWT 角色 + httpOnly cookie |
| 混元生图 | 腾讯混元 hy-image-v3.0，异步 submit + 轮询 query |
| 可拖拽图片 | 聊天框内图片可拖拽，松手弹回，带下载按钮 |
| 唱片机互动 | 项目页拖图片进唱片机 → 魔法扫描识别动画 |
| 记忆系统 | Claude Code 风格文件记忆，双路径架构 |
| 记忆面板 | 左侧滑出，像素风卡片，悬浮放大，管理员删除 |
| 记忆注入 | 每次对话自动注入已有记忆到 System Prompt |
| 聊天持久化 | sessionStorage 跨页面导航保持 + 刷新恢复 |
| 项目展厅 | 3 个项目页（FruitCNN / CnnMusic / GNN），SSG 预渲染 |
| 三风格设计系统 | 女仆围裙 + 像素下午茶 + 星尘备忘录 |

### 规划中 🔮

| 阶段 | 内容 |
|------|------|
| **V2.6** | ReAct 循环 + 9 工具 + 三层容灾 + System Prompt 六段式拼接 |
| **V2.7** | 社交图引擎 (graph.ts) + OCC 情绪引擎 + 双弹簧 + AmbientContext |
| **V2.8** | SIP 社交规划 + 人格过滤层 + 内心独白 + 隐形记忆 |
| **V3** | RAG 向量检索 (LanceDB) + Multi-Agent 编排 |
| **后续** | CNN ONNX 推理 / GNN FastAPI / CnnMusic FAISS / 腾讯云部署 |

---

## 文件结构

```
src/
├── personality/                  ← 🆕 数字人格层 (V2.7-2.8)
│   ├── types.ts                  ← SelfNode, IWMNode, GraphState,
│   │                                EmotionState, AmbientContext, ...
│   ├── configs/{self,guest,admin}.ts
│   ├── graph.ts                  ← 社交图: 节点CRUD + 边 + Message Passing
│   ├── emotion.ts                ← OCC评价 + 双弹簧拉回
│   ├── ambient-context.ts        ← 时间·地点·天气 → ambientMood
│   ├── signals.ts                ← 外部信号提取 (情感词典/句法/提及)
│   ├── planning.ts               ← SIP六步 + Gross策略池
│   ├── filter.ts                 ← 人格过滤: emotion+IWM → PersonaParams
│   ├── inner-voice.ts            ← 内心独白: 触发+LLM调用
│   └── memory-inner.ts           ← 隐形记忆读写
│
├── agent/                        ← 🆕 Agent 机械层 (V2.6)
│   ├── types.ts, registry.ts
│   ├── loop.ts                   ← ReAct 循环 + 三层容灾
│   ├── prompts.ts                ← System Prompt 六段式拼接
│   └── tools/                    ← 9个工具
│
├── app/api/chat/route.ts         ← 薄层 handler
│
data/
├── inner/                        ← 🆕 隐形记忆 + Self-Node
│   ├── self-node.json
│   ├── emotion-state.json
│   ├── emotion-log.jsonl
│   └── inner-{ts}.md
├── graph/                        ← 🆕 社交图节点
│   ├── nanzhijin.json
│   ├── claude.json
│   ├── guest-{fp}.json
│   └── graph-log.jsonl
└── memory/                       ← 显性记忆 (现有)
    ├── MEMORY.md
    └── mem-{ts}.md
```

---

## 技术栈

| 层 | 技术 |
|------|------|
| 前端框架 | Next.js 16 + TypeScript + React 19 |
| 样式 | Tailwind CSS 4 + 像素风三风格设计系统 |
| AI 引擎 | DeepSeek V4 Pro（Anthropic 兼容端点） |
| 鉴权 | bcryptjs + jose (JWT) + 双角色 |
| 生图 | 腾讯混元 hy-image-v3.0 |
| 天气 | 和风天气 API + geoip-lite (IP→地点) |
| 记忆存储 | 文件系统 (YAML frontmatter + Markdown) |
| 记忆哲学 | 文件系统 > 数据库 (可审计、可手动编辑) |
| 部署 | Docker → 腾讯云 Lighthouse 2C4G 5M |

---

## 本地运行

```bash
npm install
cp .env.example .env.local  # 填入 API Key
npm run dev                  # http://localhost:3000
```

## 环境变量

| 变量 | 说明 |
|------|------|
| `NANAGI_PASSWORD_HASH` | 面试官密码 bcrypt hash |
| `NANAGI_ADMIN_PASSWORD_HASH` | 管理员密码 bcrypt hash |
| `DEEPSEEK_API_KEY` | DeepSeek API Key |
| `HUNYUAN_API_KEY` | 混元生图 API Key |
| `WEATHER_API_KEY` | 和风天气 API Key |

---

## 面试话术

> "NaNaGi 不是工具型 Agent，是关系型 Agent。核心架构是一个社交图——基于 Bowlby 内部工作模型，每个经常对话的人在她心中有一个独立的 IWM 节点，有6个维度、有弹性系数、随对话更新。同一个锚定人格，在不同社交情境中表现出不同的行为——面试官看到专业女仆，主人看到真实的小狐仙。
>
> 情绪不是 prompt 里的形容词，是独立的 OCC 评价引擎——外部信号驱动、规则引擎计算、不经 LLM 手、每一笔变化都有 audit log。当主人提到第三者时，图上的 Message Passing 机制（Heider 平衡理论）会自动更新第三者的节点。
>
> 这跟我做的 GNN 社交图谱链接预测是同一套数学框架——Node Embedding、Edge Weight、Message Passing、Cold Start。”

---

## License

Private — 仅供面试使用。源码不公开。
