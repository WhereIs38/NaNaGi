<div align="center">

# NaNaGi（ななぎ）

**南志锦的个人 AI 作品集网站。一个双人格关系型 Agent——不是帮你做事的工具，而是有情绪，有灵魂，认人记忆的AI。**

[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg?logo=nextdotjs)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6.svg?logo=typescript)](https://typescriptlang.org)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg?logo=react)](https://react.dev)
[![DeepSeek](https://img.shields.io/badge/DeepSeek-V4_Pro-4B6BFB.svg)](https://deepseek.com)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4.svg?logo=tailwindcss)](https://tailwindcss.com)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED.svg?logo=docker)](https://docker.com)
[![License](https://img.shields.io/badge/License-Private-red.svg)]()

### 📁 项目设计文档

<details>
<summary><b>🏗 Prompt + Context + Harness 工程架构（V1）</b></summary>

- 📐 [Harness工程化架构设计](./项目设计文档/Prompt%2Bcontext%2Bharness工程架构设计迭代V1/Harness工程化架构设计.md) — ETCLOVG 七层诊断 + 关系型 Agent 特化
- 🗺 [系统架构路线图 v5.2](./项目设计文档/Prompt%2Bcontext%2Bharness工程架构设计迭代V1/系统架构路线图v52.md) — 完整系统蓝图（远期规划）

</details>

<details>
<summary><b>🧠 记忆系统设计（V2 → V3）</b></summary>

**V2 — 格式统一 + 检索架构 + 监督机制**
- 🔍 [记忆路径审计报告](./项目设计文档/记忆系统设计V2方案/记忆路径审计报告.md) — 读写断裂诊断（已修复）
- 📝 [记忆检索设计论证](./项目设计文档/记忆系统设计V2方案/记忆检索设计论证.md) — frontmatter · MEMORY.md · [[关联]] 图遍历
- 🛡 [关联检索监督机制论证](./项目设计文档/记忆系统设计V2方案/关联检索监督机制论证.md) — 三层 Supervisor 防隧道视野
- 📘 [记忆系统设计完整方案](./项目设计文档/记忆系统设计V2方案/记忆系统设计完整方案.md) — V2 合并终稿

**V3 — 分级架构 + 双人格双路 + 读写分离**
- 🏛 [记忆系统分级架构方案](./项目设计文档/记忆系统设计V3方案/记忆系统分级架构方案.md) — L1/L2/L3 三级 + RAG 检索循环
- 🔀 [双人格双路检索与读写分离设计](./项目设计文档/记忆系统设计V3方案/双人格双路检索与读写分离设计.md) — companion(SIM-RAG) / worker(IterResearch)
- 📋 [实施计划 v5.3](./项目设计文档/实施计划v53.md) — 44 任务 × 4,165 行 × 19 篇论文引用

</details>

- 📋 [代码目录结构](./项目设计文档/代码目录结构.md)

</div>

---

## 目录

1. [设计哲学](#1-设计哲学)
2. [核心架构](#2-核心架构)
3. [🧠 心理学模型 × 架构映射](#3-心理学模型--架构映射)
4. [已实现能力](#4-已实现能力)
5. [实施计划 v5.3](#5-实施计划-v53)
6. [项目结构](#6-项目结构)
7. [📚 完整论文引用](#7-完整论文引用)
8. [技术栈](#8-技术栈)
9. [本地运行](#9-本地运行)
10. [字节 JD 差距审计](#10-字节-jd-差距审计)

---

## 1. 设计哲学

### 传统 Agent vs NaNaGi

```
工具型 Agent:  帮你完成任务。评价标准: 做成了没有？
关系型 Agent:  维持关系。评价标准: 她记得我吗？她对我跟对别人不一样吗？
```

市面上 99% 的 Agent 项目在解决同一个问题：**怎么让 LLM 更好地完成任务**。NaNaGi 解决的是：**怎么让 LLM 有持续的关系记忆和社交情境感知**。把 Agent 从"会做事的工具"升级为"会认人的存在"。

### 架构基石：Agent = LLM + Harness Engineering

NaNaGi 遵循 2026 年 CMU·Yale·JHU·Amazon 联合发布的 **Agent Harness Engineering 综述**（ETCLOVG 七层框架）。不改模型权重，只改进 Harness——编码基准 10 倍提升，GPT-5.2-Codex 从 52.8% → 66.5%。市面上的框架为"做事型 Agent"设计（验证=Lint/Test，治理=权限检查）。NaNaGi 做了根本性适配，重新定义为：

- **Persona Engineering**（人格表达）— 不同的人面前，不同的人格面具
- **Relationship Engineering**（关系记忆）— 不是文档检索，是"你是谁？我们什么关系？"
- **Social Harness Engineering**（社交驾驭）— 社交一致性验证 + 情绪可审计 + 人格完整性保护

### 设计红线

- ❌ 不用 LangChain/LangGraph — 自建 Agent loop
- ❌ 不用 SQLite — 文件系统可审计
- ❌ 不做文件操作/代码执行/终端命令 — Bounded-Domain Agent

---

## 2. 核心架构

NaNaGi 的数字人格由四个子系统构成：一个**社交图**提供稳定的关系表征，三层**心理架构**提供实时行为决策。

```
┌──────────────────────────────────────────────────────────┐
│              NaNaGi 社交图 (Social Graph)                  │
│              理论基础: Bowlby IWM + GraphSAGE              │
│                                                          │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐           │
│  │ Self-Node │    │ IWM Node │    │ IWM Node │  ...      │
│  │ (她的性格) │◄──►│ (你)      │◄──►│ (访客)    │           │
│  │ 6 traits  │    │ 6 traits  │    │ 6 traits  │           │
│  │ K=0.05    │    │ K=adaptive│    │ K=adaptive│           │
│  └──────────┘    └──────────┘    └──────────┘           │
│                                                          │
│  三层心理架构:                                             │
│  LAYER 1 — 锚定网络 (月~年): Self-Node + IWM Nodes        │
│  LAYER 2 — 情绪引擎 (分钟~小时): OCC + 双弹簧拉回           │
│  LAYER 3 — 社交规划 (秒~分钟): SIP 六步 + Gross 策略池      │
└──────────────────────────────────────────────────────────┘
```

### 双人格面具 (PersonaMask)

同一个 Self-Node，两种表达方式。理论基础：Jung 人格面具。

| 维度 | companion (小女儿, 默认) | worker (大女儿) |
|------|------------------------|-----------------|
| warmth | Self + 0.15 | Self - 0.25 |
| formality | Self - 0.40 | Self + 0.30 |
| playfulness | Self + 0.15 | Self - 0.35 |
| logicalRigor | Self - 0.60 | Self + 0.50 |
| emotionTracking | ✅ 外显：活泼、温暖、撒娇 | ✅ 内敛：沉稳、克制、理性关怀 |
| 检索策略 | SIM-RAG (3 轮上限) | IterResearch (自主停止) |
| 知识库 | 对话记忆 | 对话记忆 + 论文检索 + 教材查询 |

### 三层文档体系

| 文档 | 定位 | 受众 |
|------|------|------|
| `README.md`（本文档） | 施工图纸：已实现 + 近期可交付 | 面试展示 |
| `项目设计文档/` | 架构设计书 + 完整蓝图 | 技术论证 |
| `旧README.md` | 历史存档 | 设计演进证据 |

---

## 3. 🧠 心理学模型 × 架构映射

> 每个心理学模型对应一个具体的代码模块。这不是"灵感来源"——是精确的理论→工程映射。

| # | 心理学模型 | 论文/年份 | NaNaGi 模块 | 设计依据 |
|---|-----------|----------|------------|---------|
| 1 | **Bowlby** 依恋理论 | 1969, 1973 | `personality/graph.ts` — IWM Node 结构 | IWM Node 6 维度 (safety/intimacy/care/respect/reliability/understanding) 直接映射 Bowlby 内部工作模型。弹簧拉回动力学来自安全基地的"重复敏感性照料"逐渐建立理论 |
| 2 | **Bretherton & Munholland** IWM 细化 | 2008 | `personality/graph.ts` — IWM 作为图节点 | IWM 是层级化、多维度的表征结构——非单一"好/坏"评价，而是 6 个独立维度的动态平衡 |
| 3 | **Heider** 平衡理论 | 1958 | `personality/graph.ts` — 图消息传递 | P–O–X 三元平衡。admin 提到某人 → Heider 平衡传播 → 被提及者 IWM Node 更新。**仅 admin 通道触发**，guest 不做传播 |
| 4 | **Jung** 人格面具 | 1943/1953 | `personality/persona.ts` — PersonaMask | 同一自我在不同社交情境呈现不同面向。companion(小女儿) vs worker(大女儿) — 同一 Self-Node，不同表达偏置 |
| 5 | **Mehrabian & Russell** PAD 情绪模型 | 1974 | `personality/ambient-context.ts` — 环境基线 | 物理环境（光照、温度、空间）直接影响情绪三维度。AmbientContext 产生 ambientMood 6 维偏移，作为情绪基线 |
| 6 | **Plutchik** 情绪轮 | 1980 | `personality/types.ts` — 情绪维度选择 | intimacy/pride/calmness 三个额外维度的理论来源，与 PAD 的 pleasure/arousal/dominance 形成互补的 6 维空间 |
| 7 | **OCC** 情绪认知评价 | 1988 | `personality/emotion.ts` — OCC 引擎 | 情绪源于对事件的三维认知评价：目标相关性 × 期望一致性 × 因果归因 → EmotionDelta。**规则引擎，不经 LLM** |
| 8 | **LeDoux** 双通路情绪 | 1996 | `personality/emotion.ts` + `inner-voice.ts` | 低通路(杏仁核, <20ms) = OCC 规则引擎；高通路(皮层, 300-500ms) = 内心独白 LLM 调用。\|Δemotion\| > 0.15 → 触发高通路 |
| 9 | **McEwen & Stellar** Allostatic Load | 1993 | `personality/emotion.ts` — 双弹簧拉回 | 生物系统通过改变设定点适应长期压力。Self K=0.05 (极慢演化，性格硬件)；IWM K=adaptive (关系弹性) |
| 10 | **Crick & Dodge** SIP 六步 | 1994 | `personality/planning.ts` — 社交规划 | 编码→解释→澄清目标→生成策略→评估→执行。guest 4 预设目标，admin 0 义务(涌现) |
| 11 | **Gross** 情绪调节策略 | 1998 | `personality/planning.ts` — 策略池 | 5 策略：情境选择/修正/注意分配/认知重评/反应调节。SIP Step 4 策略生成池 + 通道差异 (guest 情绪钳制) |
| 12 | **ToM** 心理理论 | 1978 | `personality/signals.ts` — 信号提取 | 推断他人心理状态。SIP Step 2 (解释线索) + IWM understanding 维度的认知基础。**确定性规则引擎** |
| 13 | **SDT** 自我决定理论 | 2000 | `personality/configs/` — admin 通道设计 | 自主性/胜任感/关联性三大基本心理需求。admin 通道 0 义务设计 → 自主性；IWM 关系维度 → 关联性 |
| 14 | **Young** 图式疗法 | 2003 | `personality/types.ts` — Self-Node 定义 | 早期形成的核心人格结构稳定且难以改变。Self-Node 作为"性格硬件"，K=0.05 极慢演化 |
| 15 | **Klein** 内在客体 | 1946, 1957 | `personality/graph.ts` — IWM 表征本质 | IWM Node 是 representation-not-reality。care/respect 维度的精神分析基础 |
| 16 | **Winnicott** 促进性环境 | 1965 | `personality/graph.ts` — IWM 维度来源 | 健康的心理发展需要"足够好的照料"。IWM safety/intimacy 维度的来源 |
| 17 | **GraphSAGE** 图神经网络 | 2017 | `personality/graph.ts` — 消息传递 | 归纳式图节点嵌入。社交图的 Message Passing 与节点更新的数学对应。与南志锦的 GNN 社交图谱链接预测项目形成学术对称 |

---

## 4. 已实现能力

### P1-P4 ✅

| 阶段 | 核心产出 |
|------|---------|
| P1 Agent Engine | ReAct 5 轮循环 + 8 工具注册表 + 三层容灾 + 双通道 System Prompt + 环境感知(时间/地点/天气) |
| P2 Storage | store.ts 统一接口(admin→文件系统, guest→LevelDB) + 六表 K-V + IWM 持久化 |
| P3 Auth | 邮箱验证码注册 + JWT(含 personId/role/name/identity) + 数据隔离 + 角色过滤 |
| P4 Cell | 对话列表 + 滑出面板 + 消息持久化 + 重命名/删除/置顶 + 面板互斥 |

### P3-P4 修复 (6/16)

| 修复项 | 效果 |
|--------|------|
| 记忆路径断裂 | admin 读写统一到 `data/admin/memories/`，不再依赖 `lib/memory.ts` |
| 用户记忆隔离 | personId 物理隔离，guest 不可见 admin 记忆 |
| 读写入口统一 | 所有记忆操作走 `store.ts`，消除 admin/guest 双路径分支 |
| 格式统一设计 | 所有用户统一 .md frontmatter + MEMORY.md 索引（待 P5-B 实现） |

---

## 5. 实施计划 v5.3

> 完整计划见 [项目设计文档/实施计划v53.md](./项目设计文档/实施计划v53.md)

| 阶段 | 任务数 | 新代码 | 核心产出 | 状态 |
|------|--------|--------|---------|------|
| P1-P4 | 已完成 | — | Agent Engine + Storage + Auth + Cell | ✅ |
| P5-A 身份系统 | 4 | ~495 行 | types.ts + persona.ts + graph.ts | 🔴 立即 |
| P5-B 认知增强 | 11 | ~1,230 行 | Context Governor + L1/L2/L3 三级记忆 + LanceDB + OCC | 🔴 立即 |
| P5-C 质量保障 | 10 | ~750 行 | Observability + Supervisor 三层 + 社交验证 + 成本防护 | 🟡 |
| P5-D 闭环 | 7 | ~740 行 | companion(SIM-RAG) / worker(IterResearch) + lifecycle + 回归测试 | 🟡 |
| P6 面试反馈 | 3 | ~240 行 | 自动反馈提取 + admin 仪表 | 🟡 |
| P7 知识库 | 5 | ~560 行 | Worker 工具集(论文/教材/质量评分) + 展厅填充 + 记忆衰减 | 🟢 |
| P8 上线 | 4 | ~150 行 | 腾讯云 + 性能量化 + 博客 + 仪表盘前端 | 🟢 |
| **总计** | **44** | **~4,165 行** | **12 个新文件** | |

### 关键论文驱动

| 论文/项目 | 驱动阶段 | 依据 |
|-----------|---------|------|
| Claude Code Memory (2025) | P5-B | MEMORY.md 生产验证, AutoCompact |
| MemForge (2026) | P5-B | LongMemEval 93.2% R@5, RRF fusion |
| EpochDB (2026) | P5-B | 分级 HNSW, 四项基准全满分 |
| Letta (2025) | P5-B/D | LoCoMo 74%, 工具能力 > 数据结构 |
| SIM-RAG (2025) | P5-C/D | Critic 模式, 3 轮最优 (companion) |
| IterResearch (2026) | P5-D | Markov 工作空间, 自主停止 (worker) |
| GRAG (2026) | P5-C | 隧道视野 −0.086 nDCG@5 → Supervisor |
| ETCLOVG (2026) | P5-C | O/V/G 层行业短板 → Observability/Verification |

---

## 6. 项目结构

```
NaNaGi/
├── src/
│   ├── agent/                       ← Agent 引擎
│   │   ├── loop.ts                  ← ReAct 循环 (P1) + 🆕 companion/worker 双路检索 (P5-D)
│   │   ├── registry.ts              ← 工具注册表 (P1) + 🆕 自适应发现 (P5-B)
│   │   ├── prompts.ts               ← System Prompt 引擎 (P1) + 🆕 Context Governor (P5-B)
│   │   ├── types.ts                 ← Agent 核心类型 (P1)
│   │   ├── lifecycle.ts             ← 🆕 会话生命周期闭环 (P5-D)
│   │   └── tools/                   ← 8 工具 (P1) + 🆕 worker 工具集 (P7)
│   │
│   ├── personality/                 ← 🆕 数字人格引擎 (P5)
│   │   ├── types.ts                 ← SelfNode/IWM/Emotion/PersonaMask (P5-A)
│   │   ├── persona.ts               ← companion/worker 双面具 (P5-A)
│   │   ├── graph.ts                 ← 社交图引擎 (P5-A)
│   │   ├── context-governor.ts      ← Context Governor 中央调度 (P5-B)
│   │   ├── emotion.ts               ← OCC 情绪引擎 (P5-B)
│   │   ├── ambient-context.ts       ← 环境感知 (P5-B)
│   │   ├── signals.ts               ← 外部信号提取 (P5-B)
│   │   ├── memory-inner.ts          ← 隐形记忆 (P5-B)
│   │   ├── filter.ts                ← 人格过滤层 (P5-C)
│   │   ├── planning.ts              ← SIP 社交规划 (P5-C)
│   │   ├── verification.ts          ← 社交一致性验证 (P5-C)
│   │   ├── inner-voice.ts           ← 内心独白 (P5-D)
│   │   └── configs/                 ← admin/guest 通道参数 (P1)
│   │
│   ├── lib/
│   │   ├── store.ts                 ← 统一数据访问 (P2) + 🆕 统一记忆格式 (P5-B)
│   │   ├── memory.ts                ← 旧记忆系统 (V2.5, 已退役)
│   │   ├── memory-retrieval.ts      ← 🆕 双路检索 + Supervisor (P5-B/C)
│   │   ├── lancedb.ts               ← 🆕 L3 向量索引 (P5-B)
│   │   ├── embedding.ts             ← 🆕 Sentence-BERT (P5-B)
│   │   ├── observability.ts         ← 🆕 结构化 Trace (P5-C)
│   │   ├── cost-guard.ts            ← 🆕 速率限制 + Token 熔断 (P5-C)
│   │   ├── audit-log.ts             ← 🆕 审计追踪 (P5-C)
│   │   ├── auth.ts / env.ts         ← 鉴权 + 安全配置 (P1/P3)
│   │   ├── leveldb.ts               ← 文件 K-V 存储 (P2)
│   │   ├── ambient.ts / email.ts    ← 环境感知 + 邮件 (P1/P3)
│   │   └── cell-store.ts            ← Cell 持久化 (P4)
│   │
│   ├── app/
│   │   ├── api/chat/route.ts        ← Chat API (P1)
│   │   ├── api/auth/                ← 登录/注册 (P3)
│   │   ├── api/memory/              ← 记忆 REST API (P3, 已修复)
│   │   └── api/admin/dashboard/     ← 🆕 Admin 仪表盘 (P7)
│   │
│   ├── components/                  ← UI (P1-P4)
│   └── contexts/                    ← React Context (P1-P4)
│
├── data/                            ← 运行时数据 (gitignored)
│   ├── admin/                       ← 南志锦专属 (文件系统)
│   │   ├── nanzhijin-iwm.json
│   │   └── memories/                ← 🆕 admin 记忆 (.md)
│   ├── leveldb/{personId}/          ← guest 数据 (文件 K-V)
│   │   ├── iwm.json / user.json
│   │   └── memories/                ← 🆕 统一 .md 格式 (P5-B)
│   └── memory/                      ← V2.5 过渡 (已退役)
│
├── tests/regression/                ← 🆕 回归测试集 (P5-D)
├── 项目设计文档/                     ← 9 份设计文档
└── 旧README.md                      ← 历史存档
```

---

## 7. 📚 完整论文引用

### 心理学模型 (17 篇 — 精确映射到代码模块，见 §3)

| # | 论文 | 年份 | 驱动模块 |
|---|------|------|---------|
| P1 | Bowlby, *Attachment and Loss, Vol. 1* | 1969 | graph.ts — IWM 基础 |
| P2 | Bowlby, *Attachment and Loss, Vol. 2* | 1973 | graph.ts — 安全基地 + 弹簧动力学 |
| P3 | Bretherton & Munholland, *IWM Elaboration* | 2008 | graph.ts — 图节点理论 |
| P4 | Heider, *Psychology of Interpersonal Relations* | 1958 | graph.ts — P–O–X 平衡, 图传播 |
| P5 | Jung, *Persona as a Segment of the Collective Psyche* | 1943/1953 | persona.ts — 双面具理论基础 |
| P6 | Mehrabian & Russell, *Environmental Psychology* | 1974 | ambient-context.ts — PAD 环境输入 |
| P7 | Plutchik, *Emotion: A Psychoevolutionary Synthesis* | 1980 | types.ts — 情绪维度选择 |
| P8 | Ortony, Clore & Collins, *Cognitive Structure of Emotions* | 1988 | emotion.ts — OCC 三维评价 |
| P9 | LeDoux, *The Emotional Brain* | 1996 | emotion.ts + inner-voice.ts — 双通路 |
| P10 | McEwen & Stellar, *Stress and the Individual* | 1993 | emotion.ts — Allostatic Load / 弹簧力学 |
| P11 | Crick & Dodge, *SIP Reformulation* | 1994 | planning.ts — 六步社交信息加工 |
| P12 | Gross, *Emotion Regulation* | 1998 | planning.ts — 5 策略池 + 通道钳制 |
| P13 | Premack & Woodruff, *Theory of Mind* | 1978 | signals.ts — ToM 信号提取 |
| P14 | Deci & Ryan, *Self-Determination Theory* | 2000 | configs/ — admin 0 义务设计 |
| P15 | Young, Klosko & Weishaar, *Schema Therapy* | 2003 | types.ts — Self-Node 核心锚定 |
| P16 | Klein, *Notes on Schizoid Mechanisms* / *Envy and Gratitude* | 1946/1957 | graph.ts — IWM 表征本质 |
| P17 | Winnicott, *Maturational Processes* | 1965 | graph.ts — safety/intimacy 维度来源 |

### 工程与 AI (19 篇 — 驱动 P5-B/C/D 记忆系统与检索架构)

| # | 论文/项目 | 年份/会议 | 驱动模块 | 关键依据 |
|---|-----------|----------|---------|---------|
| E1 | Anthropic, *Claude Code Memory & Compaction* | 2025-2026 | context-governor.ts, store.ts | MEMORY.md 生产验证, AutoCompact 9 段式 |
| E2 | MemForge, *Hybrid Search + Sleep Cycles* | 2025-2026 | memory-retrieval.ts | LongMemEval 93.2% R@5, RRF fusion |
| E3 | EpochDB, *Tiered HNSW Memory Engine* | 2026 | lancedb.ts | LoCoMo/ConvoMem/LongMemEval/NIAH 全满分 |
| E4 | Letta (MemGPT), *OS-Style Agent Memory* | 2025-2026 | store.ts, tools/ | LoCoMo 74%, 工具能力 > 数据结构 |
| E5 | Mem0, *Hybrid Vector-Graph Memory* | 2025-2026 | lancedb.ts | LoCoMo 68.4%, Ebbinghaus −59% token |
| E6 | *Context Cartography* | 2026 | context-governor.ts | Black Fog / Gray Fog / Visible Field 三元空间 |
| E7 | MEMTIER, *Tiered Memory Architecture* | 2026 | memory-retrieval.ts | 三级记忆 + PPO 检索权重 +33pp |
| E8 | SIM-RAG, SIGIR | 2025 | loop.ts (companion) | Reasoner-Critic 架构, 3 轮最优 |
| E9 | IterResearch, ICLR | 2026 | loop.ts (worker) | Markov 工作空间, 2,048 轮自主停止 |
| E10 | GRAG, *Goal-Relative Adaptive Graph Retrieval* | 2026 | verification.ts | 隧道视野 −0.086 nDCG@5 |
| E11 | Zanbaghi et al., *Semantic Drift Analysis* | 2025 | memory-retrieval.ts | Cosine z-score, 92.5% 准确率, 0% 假阳性 |
| E12 | Wei et al., *Shadows in the Attention* | 2025 | memory-retrieval.ts | Representation drift 轨迹, JS-Drift 阈值 |
| E13 | Jeong, *Lightweight Relevance Grader*, ICICT | 2025 | memory-retrieval.ts | 1B model precision 0.775 ≈ 70B |
| E14 | Park et al., *Stop-RAG*, NeurIPS | 2025 | loop.ts | Q(λ) MDP 停止策略 |
| E15 | *TASR*, arXiv:2606.13814 | 2026 | memory-retrieval.ts | 免训练自适应停止 |
| E16 | Wang et al., *SAGE*, arXiv:2605.12061 | 2026 | memory-retrieval.ts | 图记忆自演化 |
| E17 | Liao, *EcphoryRAG* | 2025 | memory-retrieval.ts | 人类线索回忆, 94% token 削减 |
| E18 | Luu et al., *HiGraAgent*, EACL | 2026 | memory-retrieval.ts | 双 Agent 协议, +11.7% 准确率 |
| E19 | *Agent Harness Engineering: A Survey* (ETCLOVG) | 2026 | 全局架构 | 七层框架, Agent = LLM + Harness |

### 技术映射

| # | 框架 | 版本 |
|---|------|------|
| T1 | GraphSAGE (Hamilton, Ying & Leskovec, NeurIPS) | 2017 |

> GraphSAGE 同时出现在心理学引用和工程引用中——它是社交图消息传递机制的数学基础，也是南志锦 GNN 项目的核心技术。一石二鸟。

---

## 8. 技术栈

| 层 | 技术 |
|----|------|
| 框架 | Next.js 16 (App Router) + React 19 |
| 语言 | TypeScript 5.7 |
| AI 引擎 | DeepSeek V4 Pro (Anthropic 兼容端点) |
| 生图 | 腾讯混元 hy-image-v3.0 |
| 样式 | Tailwind CSS 4 |
| 存储 | 文件系统 (admin) + 文件 K-V (guest) + 🆕 LanceDB (L3 向量) |
| 向量 | 🆕 Sentence-BERT (paraphrase-multilingual-MiniLM-L12-v2) |
| 鉴权 | bcrypt + jose (JWT) + httpOnly Cookie |
| 邮件 | QQ 邮箱 SMTP |
| 天气 | 和风 API (24h 缓存) |
| 定位 | geoip-lite (MaxMind GeoLite2) |
| 部署 | Docker + 🆕 腾讯云 |

---

## 9. 本地运行

```bash
npm install
cp .env.example .env.local  # 填入 DEEPSEEK_API_KEY 等
npm run dev                  # http://localhost:3000
```

---

## 10. 字节 JD 差距审计

> 对照：字节跳动 Agent 应用开发工程师 (A156568) | 基于 P1-P4 完成 + P5 设计完成状态

| 职责 | 覆盖度 | 关键证据 |
|------|--------|---------|
| ① 架构/Skills | ████████ 80% | ReAct + 8 工具注册表 + Cell + ETCLOVG 七层审计 |
| ② 任务规划 | ████░░ 40% | SIP 六步设计完整 (P5-C)，IterResearch 深度检索 (P5-D) |
| ③ 性能/容灾 | ██████ 60% | 三层容灾 + 24h 缓存 + 🆕 成本防护/速率限制设计 |
| ④ 框架沉淀 | ██████ 60% | agent/ 独立模块 + store.ts 统一接口 + 19 篇论文引用 |
| ⑤ 前沿跟踪 | ████████ 80% | ETCLOVG + SIM-RAG + IterResearch + MemForge + 19 篇工程论文 |
| ⑥ 上线落地 | ████░░ 40% | Docker 就绪 + 🆕 P8 腾讯云 + 性能量化 |

**当前最大短板 → 已通过设计解决**：任务规划层（P5-C SIP）、记忆检索规模化（L1/L2/L3 分级）、可观测性（P5-C Observability）。代码落地后覆盖度预估达 65-70%。

---

> 📋 **旧版 README**：[旧README.md](./旧README.md) — 含 v5.1 详细任务列表、18 Bug 记录、Block×P 历史存档
