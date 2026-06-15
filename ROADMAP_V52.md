# NaNaGi 系统架构全图 + 实施计划 v5.2

> **文档定位**：激进规划，目标远高于当前可交付范围。与 `README.md`（施工图纸）和 `ENGINEERING_FRAMEWORK.md`（架构设计书）形成三层文档体系。
>
> **README.md** = 已实现 + 近期可交付 → 面试展示
> **ENGINEERING_FRAMEWORK.md** = 架构审计 + 设计理念 → 面试话术
> **本文档** = 完整系统蓝图 + v5.2 远期规划 → 设计参考，不设交付压力

---

## 目录

1. [系统架构全图](#1-系统架构全图)
2. [对话数据流](#2-对话数据流)
3. [Persona 面具系统](#3-persona-面具系统)
4. [术语速查表](#4-术语速查表)
5. [实施计划 v5.2](#5-实施计划-v52)
6. [与 v5.1 的差异对照](#6-与-v51-的差异对照)

---

## 1. 系统架构全图

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                        NaNaGi 系统架构 v5.2                                   ║
║              理论基础: Agent = LLM + Harness Engineering                      ║
║              CMU·Yale·JHU·Amazon (2026.5) — ETCLOVG 七层框架                   ║
╚══════════════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────────────┐
│ LAYER 0: 入口层 (Entry)                                                      │
│                                                                             │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐                              │
│   │  南志锦   │    │  面试官   │    │ 普通访客  │                              │
│   │ (admin)  │    │(guest-iv)│    │ (guest)  │                              │
│   └────┬─────┘    └────┬─────┘    └────┬─────┘                              │
│        │               │               │                                     │
│        └───────────────┼───────────────┘                                     │
│                        │                                                     │
│                   ┌────┴────┐                                                │
│                   │ JWT 鉴权 │ ← middleware.ts                                │
│                   │ personId │   bcrypt + jose + Cookie                       │
│                   │ role     │   → header: x-nanagi-personid                  │
│                   │ identity │   → header: x-nanagi-role                     │
│                   └────┬────┘                                                │
│                        │                                                     │
│                   ┌────┴────┐                                                │
│                   │ Persona │ ← 🆕 v5.2 面具选择                              │
│                   │ Switch  │   companion(小女儿) / worker(大女儿)             │
│                   └────┬────┘  默认: companion                                │
│                        │     触发: 用户切换 / Skill选择                        │
└────────────────────────┼────────────────────────────────────────────────────┘
                         │
┌────────────────────────┼────────────────────────────────────────────────────┐
│ LAYER 1: 人格引擎层 (Personality Engine) — ETCLOVG → C (Context)              │
│                                                                             │
│   ┌──────────────────────────────────────────────────────────────────────┐ │
│   │                    Context Governor 🆕 v5.2                           │ │
│   │                                                                      │ │
│   │   System Prompt 装配管线 (Token 预算 ~8K):                             │ │
│   │   ┌──────────────────────────────────────────────────────────────┐   │ │
│   │   │ 1. 角色注入         500 tok (PersonaMask → identityDescription)│   │ │
│   │   │ 2. IWM 关系摘要    1500 tok (动态, intimacy 越高越多)          │   │ │
│   │   │ 3. 近期显性记忆    2000 tok (三维加权排序) 🆕                   │   │ │
│   │   │ 4. 环境感知         300 tok (AmbientContext, 24h缓存)          │   │ │
│   │   │ 5. 人格过滤参数     500 tok (filter.ts → PersonaParameters)    │   │ │
│   │   │ 6. 工具描述+准则   1500 tok (自适应工具发现 🆕)                 │   │ │
│   │   │ 7. 当前上下文       700 tok (项目/Cell)                        │   │ │
│   │   │ 8. 余量            1000 tok (缓冲)                             │   │ │
│   │   └──────────────────────────────────────────────────────────────┘   │ │
│   │                                                                      │ │
│   │   腐化防御: 超N轮旧记忆标记 stale → 自动降权                           │ │
│   │   漂移防御: 每3轮插入 Goal-Reminder                                   │ │
│   └──────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│   ┌──────────────────────┐    ┌──────────────────────┐                      │
│   │   Self-Node          │    │   IWM Nodes          │                      │
│   │   (她的性格硬件)      │    │   (她心中的其他人)    │                      │
│   │                      │    │                      │                      │
│   │ curiosity: 0.80     │    │ per personId:        │                      │
│   │ warmth:    0.75     │    │   safety:   adaptive │                      │
│   │ honesty:   0.90     │    │   intimacy: adaptive │                      │
│   │ autonomy:  0.70     │    │   care:     adaptive │                      │
│   │ playfulness:0.65    │    │   respect:  adaptive │                      │
│   │ diligence: 0.85     │    │   reliability:adapt  │                      │
│   │                      │    │   understanding:adap│                      │
│   │ K = 0.05 (极慢演化)  │    │   K = f(density) 🆕  │                      │
│   │ 跨通道·跨面具 不变    │    │   admin→fs guest→LDB│                      │
│   └──────────┬───────────┘    └──────────┬───────────┘                      │
│              │                           │                                  │
│   ┌──────────┴───────────┐    ┌──────────┴───────────┐                      │
│   │  PersonaMask 🆕 v5.2 │    │  Social Graph        │                      │
│   │                      │    │  (P5-2 graph.ts)     │                      │
│   │  ┌────────────────┐  │    │                      │                      │
│   │  │ companion      │  │    │  admin通道:           │                      │
│   │  │ 小女儿(默认)    │  │    │  提到某人→Heider传播  │                      │
│   │  │                │  │    │                      │                      │
│   │  │ warmth偏置 +.15│  │    │  guest通道:           │                      │
│   │  │ formality偏置  │  │    │  不做图传播           │                      │
│   │  │   -.40        │  │    │                      │                      │
│   │  │ playfulness   │  │    │  面试反馈图:          │                      │
│   │  │   偏置 +.15   │  │    │  独立于IWM, 供主人查询 │                      │
│   │  │ logicalRigor  │  │    │                      │                      │
│   │  │   偏置 -.60   │  │    └──────────────────────┘                      │
│   │  │ emotionTrack: │  │                                                  │
│   │  │   true        │  │                                                  │
│   │  └────────────────┘  │                                                  │
│   │                      │                                                  │
│   │  ┌────────────────┐  │                                                  │
│   │  │ worker         │  │                                                  │
│   │  │ 大女儿          │  │                                                  │
│   │  │                │  │                                                  │
│   │  │ warmth偏置 -.25│  │                                                  │
│   │  │ formality偏置  │  │                                                  │
│   │  │   +.30        │  │                                                  │
│   │  │ playfulness   │  │                                                  │
│   │  │   偏置 -.35   │  │                                                  │
│   │  │ logicalRigor  │  │                                                  │
│   │  │   偏置 +.50   │  │                                                  │
│   │  │ emotionTrack: │  │                                                  │
│   │  │   false       │  │                                                  │
│   │  └────────────────┘  │                                                  │
│   │                      │                                                  │
│   │  siblingAwareness:   │                                                  │
│   │  "姐姐/妹妹也在呢"   │                                                  │
│   └──────────┬───────────┘                                                  │
│              │                                                              │
│   ┌──────────┴───────────┐                                                  │
│   │  filter.ts           │ ← P5-7 人格过滤层                                 │
│   │  Self-Node traits    │                                                  │
│   │  + PersonaMask偏置   │                                                  │
│   │  + IWM perception    │                                                  │
│   │  → PersonaParameters │                                                  │
│   │    (8维语气参数)     │                                                  │
│   │                      │                                                  │
│   │  warmth formality    │                                                  │
│   │  playfulness         │                                                  │
│   │  logicalRigor 🆕     │                                                  │
│   │  curiosityExpression │                                                  │
│   │  honestyExpression   │                                                  │
│   │  autonomyExpression  │                                                  │
│   │  diligenceExpression │                                                  │
│   └──────────────────────┘                                                  │
│                                                                             │
│   ┌──────────────────────┐    ┌──────────────────────┐                      │
│   │  OCC Emotion Engine  │    │  SIP Social Planning │                      │
│   │  (P5-3 emotion.ts)   │    │  (P5-6 planning.ts)  │                      │
│   │                      │    │                      │                      │
│   │ 6维情绪空间:          │    │ Crick&Dodge 六步:     │                      │
│   │ happiness energy     │    │ 编码→解释→澄清目标     │                      │
│   │ dominance intimacy   │    │ →生成策略→评估→执行    │                      │
│   │ pride calmness       │    │                      │                      │
│   │                      │    │ Gross 5策略池         │                      │
│   │ 双通路:               │    │                      │                      │
│   │ 低通路 规则引擎(<1ms) │    │ guest: 4预设目标      │                      │
│   │ 高通路 内心独白(条件) │    │ admin: 0义务, 涌现    │                      │
│   │                      │    │                      │                      │
│   │ 双弹簧拉回:           │    │ 通道差异核心在Step 3   │                      │
│   │ Self K=0.05          │    │ (目标澄清)            │                      │
│   │ IWM K=adaptive       │    └──────────────────────┘                      │
│   │                      │                                                  │
│   │ companion面具:       │                                                  │
│   │ emotionTracking=true │                                                  │
│   │ worker面具:          │                                                  │
│   │ emotionTracking=false│                                                  │
│   └──────────────────────┘                                                  │
│                                                                             │
│   ┌──────────────────────┐    ┌──────────────────────┐                      │
│   │  AmbientContext      │    │  Inner Voice         │                      │
│   │  (P5-4)              │    │  (P5-8 inner-voice.ts)│                     │
│   │                      │    │                      │                      │
│   │ 时间: 7段+季节+节假日│    │ 触发条件:             │                      │
│   │ 地点: IP→geoip-lite  │    │ |Δemotion|>0.15      │                      │
│   │ 天气: 和风API(24h缓存)│   │ selfDisclosure       │                      │
│   │                      │    │ round%5==0           │                      │
│   │ → ambientMood        │    │                      │                      │
│   │ 6维情绪基线偏移       │    │ 单Agent内嵌 🆕        │                      │
│   │                      │    │ (非Multi-Agent)      │                      │
│   └──────────────────────┘    └──────────────────────┘                      │
│                                                                             │
│   🆕 → v5.2 新增或修改项                                                     │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ LAYER 2: Agent 执行层 (Agent Loop) — ETCLOVG → E+L (Execution + Lifecycle)   │
│                                                                             │
│   ┌──────────────────────────────────────────────────────────────────────┐ │
│   │                    ReAct Loop (agent/loop.ts)                         │ │
│   │                                                                      │ │
│   │   while round < 5:                                                   │ │
│   │     ┌──────────────────────────────────────────────────────────┐    │ │
│   │     │ STEP 0: 加载 IWM Node                                     │    │ │
│   │     │   admin → data/admin/nanzhijin-iwm.json                  │    │ │
│   │     │   guest → LevelDB get('iwm:{personId}')                  │    │ │
│   │     │   🆕 IWM springK 计算: f(density)                        │    │ │
│   │     ├──────────────────────────────────────────────────────────┤    │ │
│   │     │ STEP 1: AmbientContext 环境感知                            │    │ │
│   │     │   时间(7段/季节/节假日) + IP定位 + 天气(24h缓存)          │    │ │
│   │     │   → ambientMood (6维基线偏移)                             │    │ │
│   │     ├──────────────────────────────────────────────────────────┤    │ │
│   │     │ STEP 2: signals.ts 外部信号提取                           │    │ │
│   │     │   情感词典/句法模板/消息元数据/提及检测                    │    │ │
│   │     │   → ExternalSignals (确定性的, 不经LLM)                   │    │ │
│   │     ├──────────────────────────────────────────────────────────┤    │ │
│   │     │ STEP 3: OCC 情绪评价                                       │    │ │
│   │     │   signals → 目标相关性×期望一致性×因果归因 → EmotionDelta │    │ │
│   │     │   感知IWM: respect高→批评被解释为帮助                      │    │ │
│   │     │   🆕 companion面具: 记录情绪轨迹 → emo:{personId}:{ts}    │    │ │
│   │     ├──────────────────────────────────────────────────────────┤    │ │
│   │     │ STEP 4: 双弹簧拉回 + 通道钳制                              │    │ │
│   │     │   Self K=0.05 / IWM K=adaptive                            │    │ │
│   │     │   guest clamp[0.3,0.7] / admin clamp[0.0,1.0]            │    │ │
│   │     ├──────────────────────────────────────────────────────────┤    │ │
│   │     │ STEP 4.5: 图消息传递 (条件: admin + mentionsPerson)        │    │ │
│   │     │   Heider平衡→被提及者IWM Node更新                          │    │ │
│   │     ├──────────────────────────────────────────────────────────┤    │ │
│   │     │ STEP 5: 内心独白 (条件触发)                                │    │ │
│   │     │   LLM调用 (max_tokens=200, 无tools)                       │    │ │
│   │     │   → ReflectionText → data/self/inner/                     │    │ │
│   │     ├──────────────────────────────────────────────────────────┤    │ │
│   │     │ STEP 6: SIP 社交规划                                       │    │ │
│   │     │   编码→解释(感知IWM+ToM)→澄清目标→                         │    │ │
│   │     │   生成策略(Gross 5策略池)→评估选择→执行                     │    │ │
│   │     ├──────────────────────────────────────────────────────────┤    │ │
│   │     │ STEP 7: 人格过滤 (filter.ts) 🆕 PersonaMask参与            │    │ │
│   │     │   Self-Node traits + PersonaMask偏置 + IWM perception     │    │ │
│   │     │   → PersonaParameters (8维语气参数)                        │    │ │
│   │     ├──────────────────────────────────────────────────────────┤    │ │
│   │     │ STEP 8: Context Governor 上下文组装 🆕                     │    │ │
│   │     │   按Token预算+优先级装配 System Prompt                     │    │ │
│   │     │   注入: 角色/关系/记忆/环境/人格/工具/准则                 │    │ │
│   │     ├──────────────────────────────────────────────────────────┤    │ │
│   │     │ STEP 9: LLM 推理                                          │    │ │
│   │     │   DeepSeek V4 Pro (Anthropic 兼容端点)                    │    │ │
│   │     │   text → SSE push → break                                 │    │ │
│   │     │   tool_use → hash检测 → 执行 → 注入result → 继续          │    │ │
│   │     │   🆕 工具调用前: Tool Governor 权限检查                    │    │ │
│   │     │   🆕 工具调用后: 验证钩子 + Trace记录                      │    │ │
│   │     ├──────────────────────────────────────────────────────────┤    │ │
│   │     │ 三层容灾:                                                 │    │ │
│   │     │   L1: 30s超时 → L2: 重试1次 → L3: 降级回复                │    │ │
│   │     │   降级措辞因role+persona不同:                              │    │ │
│   │     │     companion:"呜...脑袋有点转不动了..."                   │    │ │
│   │     │     worker:"抱歉，当前推理服务暂时不可用。"                 │    │ │
│   │     ├──────────────────────────────────────────────────────────┤    │ │
│   │     │ STEP 10: 后处理                                           │    │ │
│   │     │   ✅ 情绪持久化 → data/self/emotion-state.json            │    │ │
│   │     │   ✅ IWM持久化 → admin:fs / guest:LevelDB                  │    │ │
│   │     │   🆕 情绪轨迹 → emo:{personId}:{ts} (仅companion面具)     │    │ │
│   │     │   ✅ 内心独白 → data/self/inner/                           │    │ │
│   │     │   ✅ 显性记忆 → admin:fs / guest:LevelDB                   │    │ │
│   │     │   🆕 记忆persona标签写入                                   │    │ │
│   │     │   ✅ Cell摘要 → LevelDB conv:{personId}:{cellId}           │    │ │
│   │     │   ✅ 面试反馈 → LevelDB feedback:{personId}                │    │ │
│   │     │   🆕 SessionMetrics写入 → observability trace 🆕           │    │ │
│   │     │   🆕 Lifecycle: end→extractFeedback→updateIWM 🆕           │    │ │
│   │     └──────────────────────────────────────────────────────────┘    │ │
│   └──────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│   🆕 → v5.2 新增或修改项                                                     │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ LAYER 3: 工具层 (Tools) — ETCLOVG → T (Tooling)                              │
│                                                                             │
│   ┌──────────────────────────────────────────────────────────────────┐      │
│   │                     Tool Registry (agent/registry.ts)              │      │
│   │                     Map<name, {definition, execute}>              │      │
│   │                                                                   │      │
│   │   ┌───────────────────────┐  ┌───────────────────────────────┐   │      │
│   │   │ 通用工具 (两个面具共享)│  │ companion专属                    │   │      │
│   │   │                       │  │                                │   │      │
│   │   │ get-time             │  │ generate-image (混元生图)      │   │      │
│   │   │ get-weather          │  │ search-memory                  │   │      │
│   │   │ get-project-info     │  │ save-memory                    │   │      │
│   │   │ navigate-project     │  │                                │   │      │
│   │   │ search-web           │  └───────────────────────────────┘   │      │
│   │   │                       │                                      │      │
│   │   │ gnn-recommend (占位) │  ┌───────────────────────────────┐   │      │
│   │   │ cnnmusic-search(占位)│  │ worker专属 🆕                   │   │      │
│   │   └───────────────────────┘  │                                │   │      │
│   │                              │ paper-search (论文检索)       │   │      │
│   │   🆕 自适应工具发现:         │ textbook-query (教材查询)     │   │      │
│   │   按对话阶段+面具动态筛选    │ quality-score (信息质量打分)  │   │      │
│   │                              │ skill-execute (Skill执行)     │   │      │
│   │   🆕 Tool Governor:          └───────────────────────────────┘   │      │
│   │   调用前: 权限检查+速率检查   │                                   │      │
│   │   调用后: 验证钩子+Trace记录 │  🆕 关系边界强制:                 │      │
│   │                              │  guest不能搜主人记忆              │      │
│   │   🆕 成本防护:               │  guest不能看其他guest数据         │      │
│   │   每用户每分钟最大工具调用数 │                                   │      │
│   │   Token超额→熔断             │                                   │      │
│   └──────────────────────────────┴───────────────────────────────────┘      │
│                                                                             │
│   🆕 → v5.2 新增或修改项                                                     │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ LAYER 4: 存储层 (Storage) — ETCLOVG → C (Context Memory)                     │
│                                                                             │
│   data/                                                                    │
│   ├── self/                          ← 🦊 NaNaGi 本体 (文件系统, sub-ms)     │
│   │   ├── self-node.json             ← Self-Node: 6 traits + anchor         │
│   │   ├── emotion-state.json         ← 当前 6维情绪 + ambientMood           │
│   │   ├── emotion-log.jsonl          ← 情绪审计 (append-only, 全局)         │
│   │   └── inner/                     ← 内心独白文本                           │
│   │                                                                         │
│   ├── admin/                         ← 👑 南志锦专属 (文件系统, 可审计)      │
│   │   ├── nanzhijin.json             ← 认证 {passwordHash, role}            │
│   │   ├── nanzhijin-iwm.json         ← 主人 IWM Node                        │
│   │   └── memories/                  ← 主人显性记忆                          │
│   │                                                                         │
│   ├── leveldb/                       ← 🌐 所有 guest 用户 (LevelDB)         │
│   │   ├── user:{personId}            ← 用户认证表                            │
│   │   ├── iwm:{personId}             ← IWM 节点表                            │
│   │   ├── mem:{personId}:{ts} 🆕     ← 用户记忆表 (+persona标签)            │
│   │   ├── emo:{personId}:{ts} 🆕     ← 情绪轨迹表 (仅companion)             │
│   │   ├── conv:{personId}:{cellId}   ← Cell 会话表 🆕 +persona字段          │
│   │   └── feedback:{personId}        ← 面试反馈表                            │
│   │                                                                         │
│   └── memory/                        ← 显性记忆 (V2.5, 过渡中)               │
│                                                                             │
│   ┌──────────────────────────────────────────────────────────────────────┐ │
│   │                 统一数据访问层 store.ts                               │ │
│   │                                                                      │ │
│   │  store.getNode(personId) → IWMNode                                   │ │
│   │  store.putNode(personId, node)                                       │ │
│   │  store.createMemory(record)  🆕 record含persona标签                  │ │
│   │  store.listMemories(personId, opts?)  🆕 opts.persona过滤            │ │
│   │  store.createCell(personId, cellId, messages, persona?) 🆕           │ │
│   │  store.appendFeedback(personId, record)                              │ │
│   │                                                                      │ │
│   │  调用方不感知底层是文件系统还是LevelDB                                  │ │
│   └──────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│   🆕 → v5.2 新增或修改项                                                     │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ LAYER 5: 质量保障层 (Quality) — ETCLOVG → O+V+G (Observability+Verification  │
│                                          +Governance)                       │
│                                                                             │
│   ┌──────────────────────┐  ┌──────────────────────┐                        │
│   │  Observability 🆕     │  │  Verification 🆕     │                        │
│   │  (lib/observability   │  │  (personality/       │                        │
│   │   .ts)               │  │   verification.ts)   │                        │
│   │                      │  │                      │                        │
│   │ LLM调用Trace:         │  │ 社交一致性验证:       │                        │
│   │ prompt_tokens        │  │ intimacy低但过于亲密   │                        │
│   │ completion_tokens    │  │ → 标记                 │                        │
│   │ model, TTFT, duration│  │                      │                        │
│   │                      │  │ 人格边界检查:          │                        │
│   │ 工具调用Trace:        │  │ 面试官通道禁词检测     │                        │
│   │ tool_name, args      │  │ "克劳德"/"内心"       │                        │
│   │ result, duration     │  │ → 规则引擎,不经LLM    │                        │
│   │ is_error             │  │                      │                        │
│   │                      │  │ 幻觉防御:              │                        │
│   │ 情绪轨迹日志:         │  │ 项目问题必须先调       │                        │
│   │ EmotionEntry schema   │  │ get-project-info      │                        │
│   │ (仅companion面具)    │  │ → worker面具强制       │                        │
│   │                      │  │                      │                        │
│   │ IWM变化Trace:         │  │ 信息质量打分:          │                        │
│   │ 6 trait per-session  │  │ worker检索结果评估     │                        │
│   │ delta                │  │ → 过滤低质量来源       │                        │
│   │                      │  │                      │                        │
│   │ Loop轮次分布:         │  │ 指令层级:              │                        │
│   │ round_count          │  │ System > Config        │                        │
│   │ stop_reason          │  │ > Tool > User          │                        │
│   │ tool_calls made/fail │  │ → Anthropic安全框架    │                        │
│   │                      │  │                      │                        │
│   │ 成本追踪:             │  │ 故障归因:              │                        │
│   │ per-user per-session │  │ 回复不当→              │                        │
│   │ token/调用/成本统计   │  │ 模型/上下文/IWM/       │                        │
│   │                      │  │ 工具/编排?             │                        │
│   │ SessionMetrics 🆕    │  │ → SessionMetrics分析   │                        │
│   └──────────────────────┘  └──────────────────────┘                        │
│                                                                             │
│   ┌──────────────────────┐  ┌──────────────────────┐                        │
│   │  Governance 🆕        │  │  Cost Protection 🆕  │                        │
│   │                      │  │                      │                        │
│   │ 关系边界强制:         │  │ 速率限制:             │                        │
│   │ guest不能搜主人记忆   │  │ per-user每分钟最大     │                        │
│   │ guest不能看其他guest  │  │ 请求数                │                        │
│   │ 数据                 │  │ (不影响正常使用)       │                        │
│   │                      │  │                      │                        │
│   │ 审计追踪:             │  │ Token超额熔断:         │                        │
│   │ admin操作日志         │  │ 短时间过量调用         │                        │
│   │ (查看反馈/搜索记忆)   │  │ → 暂停该用户           │                        │
│   │                      │  │ → 一定时间后恢复       │                        │
│   │ 反馈通道:             │  │                      │                        │
│   │ GitHub Issue /       │  │ 工具调用计数:          │                        │
│   │ 站内反馈表           │  │ 每用户每工具调用上限    │                        │
│   └──────────────────────┘  └──────────────────────┘                        │
│                                                                             │
│   🆕 → v5.2 新增或修改项                                                     │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ LAYER 6: 输出与闭环 (Output + Lifecycle)                                      │
│                                                                             │
│   ┌──────────────────────┐  ┌──────────────────────┐                        │
│   │  SSE Streaming       │  │  Lifecycle 🆕         │                        │
│   │                      │  │  (agent/lifecycle.ts) │                        │
│   │  text → 逐token推送   │  │                      │                        │
│   │  tool_use → 内部循环  │  │  会话生命周期闭环:     │                        │
│   │  jukebox → 生图进度   │  │  start → active      │                        │
│   │  navigate → 跳转展厅  │  │  → end               │                        │
│   │                      │  │  → extractFeedback    │                        │
│   │                      │  │  → updateIWM          │                        │
│   └──────────────────────┘  │  → 不可跳过            │                        │
│                              └──────────────────────┘                        │
│   ┌──────────────────────┐  ┌──────────────────────┐                        │
│   │  Cell 持久化          │  │  回归测试集 🆕         │                        │
│   │                      │  │                      │                        │
│   │ 每轮对话自动写入       │  │  10-20组固定场景       │                        │
│   │ conv:{personId}:     │  │  +人工标注期望回复     │                        │
│   │   {cellId}           │  │  → 改prompt后跑一遍    │                        │
│   │                      │  │  → 防止退化            │                        │
│   │ 🆕 cell带persona标签  │  │                      │                        │
│   │ 🆕 lastSummary注入    │  │                      │                        │
│   │   新Cell上下文        │  │                      │                        │
│   └──────────────────────┘  └──────────────────────┘                        │
│                                                                             │
│   🆕 → v5.2 新增或修改项                                                     │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ LAYER 7: 外部依赖 (External APIs)                                             │
│                                                                             │
│   DeepSeek V4 Pro    ← LLM推理 (Anthropic兼容端点)                           │
│   腾讯混元 hy-v3.0   ← 生图 (仅companion面具)                                │
│   和风天气 API       ← 天气 (24h缓存, X-QW-Api-Key Header)                  │
│   geoip-lite         ← IP定位 (MaxMind GeoLite2, 本地数据库, <1ms)          │
│   QQ邮箱 SMTP        ← 验证码发送 (smtp.qq.com:465)                          │
│                                                                             │
│   🆕 论文检索API     ← worker面具 (arXiv/Semantic Scholar)                   │
│   🆕 搜索引擎API     ← worker信息检索 + 质量打分                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. 对话数据流

```
POST /api/chat  { message, cellId?, persona? }
│
├─ middleware.ts
│   JWT验证 → personId, role, name, identity 注入 header
│
├─ route.ts
│   │
│   ├─ 1. 确定 Persona 🆕
│   │   persona = req.body.persona ?? "companion"  // 默认小女儿
│   │   PersonaMask = loadPersonaMask(persona)
│   │
│   ├─ 2. 加载 ChannelConfig (现有)
│   │   role=admin → adminConfig
│   │   role=guest-iv/guest → guestConfig
│   │
│   ├─ 3. 加载 IWM Node (现有)
│   │   计算 springK = f(density) 🆕
│   │
│   ├─ 4. AmbientContext (现有, 24h缓存)
│   │
│   ├─ 5-7. 人格引擎管线 (P5)
│   │   signals → OCC → 弹簧拉回 →
│   │   Heider传播(条件) → 内心独白(条件) →
│   │   SIP → filter.ts 🆕 PersonaMask参与
│   │
│   ├─ 8. Context Governor 组装 System Prompt 🆕
│   │   角色注入(PersonaMask) + IWM摘要 +
│   │   层次化记忆检索 🆕 + 环境感知 +
│   │   人格参数(filter输出) + 自适应工具描述 🆕 +
│   │   当前上下文 + Goal-Reminder(每3轮) 🆕
│   │
│   ├─ 9. Agent Loop (ReAct)
│   │   │
│   │   ├─ callLLM(systemPrompt, messages, tools)
│   │   │   ├─ 🆕 Observability: LLM调用Trace记录
│   │   │   ├─ text → SSE push → break
│   │   │   └─ tool_use →
│   │   │       ├─ 🆕 Tool Governor: 权限检查
│   │   │       ├─ 🆕 速率检查 + Token检查
│   │   │       ├─ hash循环检测
│   │   │       ├─ execute →
│   │   │       ├─ 🆕 验证钩子 (调用后检查)
│   │   │       ├─ 🆕 Observability: 工具调用Trace记录
│   │   │       └─ 注入result → 继续
│   │   │
│   │   └─ 三层容灾: 30s超时→重试1次→降级(因role+persona措辞不同)
│   │
│   ├─ 10. 后处理
│   │   ├─ Emotion 持久化 → data/self/emotion-state.json
│   │   ├─ IWM 持久化 → admin:fs / guest:LevelDB
│   │   ├─ 🆕 情绪轨迹 → emo:{personId}:{ts} (仅companion)
│   │   ├─ 🆕 记忆persona标签写入
│   │   ├─ Cell 持久化 → conv:{personId}:{cellId} 🆕 +persona
│   │   ├─ 面试反馈 → feedback:{personId} (仅guest-iv)
│   │   ├─ 🆕 SessionMetrics → observability trace
│   │   └─ 🆕 Lifecycle: end→extractFeedback→updateIWM
│   │
│   └─ return SSE stream
```

---

## 3. Persona 面具系统

### 3.1 设计原则

PersonaMask **不是新 Agent**，是同一套管线的人格表达过滤层：

- **同一个 Self-Node**（6 trait 不变）→ 她的底色永远不变
- **同一个记忆大脑**（共享 Memory，标签区分）→ 大女儿能看到小女儿的记忆，但知道"那是陪伴时记的"
- **同一个 IWM**（对人的认知跨面具共享）→ 她对主人的亲近度不因切换面具而重置
- **不同的表达偏置** → filter.ts 输出不同的 PersonaParameters
- **互相感知** → siblingAwareness 注入各自 system prompt

### 3.2 精确维度对照

`PersonaMask` 的偏置维度与 README 已有结构严格对应：

```
PersonaMask.expressBias 作用于 filter.ts 输出端:

  输出维度              Self-Node来源      PersonaMask偏置
  ─────────────────────────────────────────────────────
  warmth               Self.warmth        companion: +0.15 / worker: -0.25
  formality            (独立维度)          companion: -0.40 / worker: +0.30
  playfulness          Self.playfulness   companion: +0.15 / worker: -0.35
  logicalRigor 🆕      Self.diligence     companion: -0.60 / worker: +0.50
  curiosityExpression  Self.curiosity     暂不设偏置
  honestyExpression    Self.honesty       暂不设偏置
  autonomyExpression   Self.autonomy      companion: +0.10 / worker: -0.10
  diligenceExpression  Self.diligence     暂不设偏置

  (8维 → P5-1 types.ts 精确定义)
```

### 3.3 与 ChannelConfig 的关系

```
                     ChannelConfig                  PersonaMask
                     ─────────────                  ───────────
回答什么问题         我在跟谁说话？                   我是什么状态？
可能取值             admin / guest-iv / guest        companion / worker
影响范围             关系边界/目标/情绪钳制             表达方式/工具/情绪轨迹
来自                 middleware → role               用户选择 → persona
```

两者正交叠加 — 同一套管线同时参考 ChannelConfig 和 PersonaMask，产生最终行为。

### 3.4 切换机制

```
默认: companion (小女儿)
触发: 用户说"切换到工作模式" / 选 Skill / 请求论文检索
切换: 不重置对话，不重置 IWM
      System Prompt 重新组装 (换 PersonaMask)
      工具列表变化 (自适应工具发现)
      情绪轨迹: companion记录, worker不记录
恢复: 用户说"回来吧" / 切换到陪伴模式
```

---

## 4. 术语速查表

| 概念 | README 精确术语 | 数量 | 变化速率 |
|------|----------------|------|---------|
| 她的性格硬件 | Self-Node traits | 6: curiosity/warmth/honesty/autonomy/playfulness/diligence | 月~年, K=0.05 |
| 她心中的你 | IWM Node traits | 6: safety/intimacy/care/respect/reliability/understanding | 每次对话, K=f(density) |
| 她当下的感受 | Emotion dimensions | 6: happiness/energy/dominance/intimacy/pride/calmness | 分钟~小时 |
| 她说话的语气 | PersonaParameters (filter.ts输出) | 8: warmth/formality/playfulness/logicalRigor/curiosityExpression/honestyExpression/autonomyExpression/diligenceExpression | 每次对话, 动态 |
| 她面对谁 | ChannelConfig role | 3: admin/guest-iv/guest | 注册时确定 |
| 她什么状态 | PersonaMask id | 2: companion/worker | 用户切换 |
| 环境基线 | ambientMood | 6: happinessBias/energyBias/calmnessBias/intimacyBias/dominanceBias/prideBias | 每次对话, 24h缓存 |

---

## 5. 实施计划 v5.2

### 5.1 P1-P4 回溯适配

| 阶段 | 改动项 | 文件 | 行数 |
|------|--------|------|------|
| P1 | `AgentContext` 加 `persona` 字段 | `agent/types.ts` | +5 |
| P1 | `ChannelConfig` 不变（filter.ts 已计划动态覆盖） | — | 0 |
| P1 | 工具注册表加 `persona` 标签 | `agent/tools/index.ts` + 各工具 | +15 |
| P1 | `buildSystemPrompt` 加 `persona` 参数 | `agent/prompts.ts` | +10 |
| P2 | `mem` 表 Key 格式扩展, Value 加 `persona` | `lib/leveldb.ts` + `lib/store.ts` | +20 |
| P4 | `CellRecord` 加 `persona` 字段 | `lib/cell-store.ts` + API | +15 |
| **合计** | | | **~65行** |

### 5.2 P5-A: 身份系统层（地基）

| 任务 | 文件 | 行数 | 产出 |
|------|------|------|------|
| P5-A1 types.ts 扩展 | `personality/types.ts` | ~200 | SelfNode(6) / IWMNode(6) / PersonaMask / EmotionState(6) / PersonaParameters(8) / SocialPlan |
| P5-A2 persona.ts 🆕 | `personality/persona.ts` | ~80 | PersonaMask双面具定义 + 切换逻辑 + siblingAwareness |
| P5-A3 graph.ts | `personality/graph.ts` | ~150 | 社交图引擎（原P5-2，不变） |
| P5-A4 P1-P4适配 🆕 | 改4个文件 | ~65 | AgentContext/Cell/Memory/Store 加persona字段 |
| **小计** | | **~495行** | |

### 5.3 P5-B: 认知增强层

| 任务 | 文件 | 行数 | 产出 |
|------|------|------|------|
| P5-B1 context-governor.ts 🆕 | `personality/context-governor.ts` | ~230 | 上下文组装管线 + Token预算 + 腐化/漂移防御 |
| P5-B2 层次化记忆检索 🆕 | `lib/memory.ts` 改造 | ~80 | 三维加权: recency(0.4)/keyword(0.35)/semantic(0.15)/relation(0.10) |
| P5-B3 自适应工具发现 🆕 | `agent/registry.ts` 改造 | ~60 | 按对话阶段+persona动态筛选工具列表 |
| P5-B4 emotion.ts | `personality/emotion.ts` | ~150 | OCC情绪引擎 + 双弹簧 + 情绪轨迹日志 |
| P5-B5 ambient-context.ts | `personality/ambient-context.ts` | ~120 | 环境感知（已有实现，升级接入Context Governor） |
| P5-B6 signals.ts | `personality/signals.ts` | ~100 | 外部信号提取（确定性规则引擎） |
| P5-B7 memory-inner.ts | `personality/memory-inner.ts` | ~60 | 隐形记忆 |
| **小计** | | **~800行** | |

### 5.4 P5-C: 质量保障层

| 任务 | 文件 | 行数 | 产出 |
|------|------|------|------|
| P5-C1 observability.ts 🆕 | `lib/observability.ts` | ~120 | LLMTrace + ToolTrace + LoopStats + SessionMetrics |
| P5-C2 verification.ts 🆕 | `personality/verification.ts` | ~100 | 社交一致性规则引擎 + 幻觉防御 + 指令层级 + 信息质量打分 |
| P5-C3 成本防护 🆕 | `lib/cost-guard.ts` | ~80 | per-user速率限制 + Token超额熔断 + 工具调用计数 |
| P5-C4 filter.ts | `personality/filter.ts` | ~80 | 8维 PersonaParameters（Self-Node + PersonaMask偏置 + IWM perception） |
| P5-C5 planning.ts | `personality/planning.ts` | ~120 | SIP六步社交规划 |
| P5-C6 故障归因 🆕 | `lib/observability.ts` 扩展 | ~50 | SessionMetrics → 故障定位 |
| **小计** | | **~550行** | |

### 5.5 P5-D: Loop 与闭环

| 任务 | 文件 | 行数 | 产出 |
|------|------|------|------|
| P5-D1 inner-voice.ts | `personality/inner-voice.ts` | ~100 | 内心独白（单Agent内嵌，条件触发） |
| P5-D2 lifecycle.ts 🆕 | `agent/lifecycle.ts` | ~120 | 会话生命周期闭环（start→active→end→IWM更新） |
| P5-D3 回归测试集 🆕 | `tests/regression/` | ~200 | 10-20组固定场景 + 期望回复 |
| P5-D4 loop接入 | `agent/loop.ts` + `agent/prompts.ts` 改造 | ~80 | 全部引擎接入Agent Loop |
| **小计** | | **~500行** | |

### 5.6 P6-P8 调整

| 阶段 | 原计划 | 调整 | 新增行数 |
|------|--------|------|---------|
| P6 面试反馈 | feedback记录 + 工具 | +persona字段 + feedback表扩展 | ~20 |
| P7 知识库 | 展厅数据填充 | +worker面具检索源配置(arXiv/Semantic Scholar) | ~80 |
| P8 上线部署 | 性能量化 + 腾讯云 + 博客 | +Admin仪表盘(业务层: 访客/情绪趋势/成本) | ~150 |
| **小计** | | | **~250行** |

### 5.7 总规模

| 阶段 | 任务数 | 新代码(行) | 核心新增文件 |
|------|--------|-----------|-------------|
| P1-P4 适配 | 4 | ~65 | — |
| P5-A 身份系统 | 4 | ~495 | `persona.ts` |
| P5-B 认知增强 | 7 | ~800 | `context-governor.ts` |
| P5-C 质量保障 | 6 | ~550 | `observability.ts` `verification.ts` `cost-guard.ts` |
| P5-D 闭环 | 4 | ~500 | `lifecycle.ts` |
| P6-P8 调整 | 3 | ~250 | — |
| **总计** | **28** | **~2,660行** | **6个新文件** |

### 5.8 依赖链

```
P5-A (身份: types+persona+graph)
  │
  ├──→ P5-B (认知: context-governor+记忆+工具+情绪+环境+信号+隐形记忆)
  │       │
  │       ├──→ P5-C (质量: observability+verification+防护+filter+planning+归因)
  │       │       │
  │       │       └──→ P5-D (闭环: inner-voice+lifecycle+回归测试+loop接入)
  │       │
  │       └──→ P6-P8 (可并行: 反馈+知识库+部署)
  │
  └──→ P1-P4适配 (P5-A完成后即可做, 不阻塞后续)
```

---

## 6. 与 v5.1 的差异对照

| 维度 | v5.1 | v5.2 |
|------|------|------|
| 组织方式 | 10个平铺任务 | 4阶段×4能力域 |
| Persona | 无（只有admin/guest双通道） | companion/worker双面具 + 同一大脑 |
| Context层 | buildSystemPrompt 七段静态拼接 | Context Governor动态装配 + Token预算 + 腐化漂移防御 |
| 记忆检索 | 关键词匹配 | 三维加权层次化检索 |
| 工具管理 | 静态注册表，全量暴露 | 自适应发现 + persona标签 + Tool Governor |
| Observability | 无 | LLMTrace + ToolTrace + 情绪轨迹 + IWM变化 + Loop统计 + 成本 |
| Verification | 无（仅hash循环检测） | 社交一致性 + 幻觉防御 + 指令层级 + 信息质量打分 |
| Governance | 仅有JWT鉴权 | +关系边界强制 + 速率限制 + Token熔断 |
| Lifecycle | 无闭环 | start→active→end→feedback→IWM更新 |
| 测试 | 无 | 回归测试集 10-20场景 |
| 总规模 | ~1,140行 (仅P5) | ~2,660行 (含P1-P4适配+P5全层+P6-P8调整) |
| 定位 | 可交付 MVP | 远期蓝图, 不设交付压力 |

---

> **文档关系**：
> - `README.md` — 施工图纸（已实现 + 近期可交付，面试展示用）
> - `ENGINEERING_FRAMEWORK.md` — 架构设计书（ETCLOVG 诊断 + 设计理念，面试话术用）
> - **`ROADMAP_V52.md`（本文档）** — 完整蓝图（远期规划，设计参考，不设交付压力）
>
> 三个文件三层隔离：README 保守可交付 → FRAMEWORK 中等激进 → ROADMAP 完全激进。
