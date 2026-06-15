# NaNaGi 系统工程化方案

## Prompt → Context → Harness：关系型 Agent 的三阶段工程框架

> **理论基础**
> — *Agent Harness Engineering: A Survey* — CMU · Yale · JHU · UAB · NEU · Tulane · OSU · Virginia Tech · Amazon，19 位作者，2026.5，[OpenReview](https://openreview.net/forum?id=eONq7FdiHa)
> — [Datawhale 中文解读](https://zhuanlan.zhihu.com/p/2043124487944659250) · [ETCLOVG 七层拆解 (itech)](https://www.cnblogs.com/itech/p/20192845) · [三层架构解析](https://zhuanlan.zhihu.com/p/2025667582208812643) · [CSDN 综述解读](https://blog.csdn.net/yorkhunter/article/details/161345031)
> — [生态仓库](https://github.com/Picrew/awesome-agent-harness) — 220+ 项目按 ETCLOVG 七层分类
>
> **核心命题**：市面上的 P/C/H + ETCLOVG 框架是为"做事型 Agent"设计的（验证 = 编译通过，治理 = 权限检查）。**NaNaGi 是"认人型 Agent"**——成功标准是关系深度和人格一致性。本文档是对标准框架的一次根本性适配。

---

## 目录

1. [理论地基](#1-理论地基)
2. [NaNaGi 现状审计：ETCLOVG 七层逐项诊断](#2-nanagi-现状审计etclovg-七层逐项诊断)
3. [NaNaGi 特化：关系型 Agent 的工程框架](#3-nanagi-特化关系型-agent-的工程框架)
4. [系统化升级方案](#4-系统化升级方案)
5. [实施路线图](#5-实施路线图)
6. [面试话术](#6-面试话术)
7. [附录](#附录)

---

## 1. 理论地基

### 1.1 论文核心

**Agent Harness Engineering: A Survey** 是目前最权威的 Agent 系统工程化综述。核心论点：

> **Agent = LLM + Harness Engineering**
>
> Agent 任务执行的可靠性更多取决于包裹模型的那层工程基础设施，而不是底层模型本身。

**三组实验证据**：

| 实验 | 改动 | 结果 |
|------|------|------|
| 编码基准 (15个模型) | 只改工具格式 + Harness | **10 倍提升** |
| GPT-5.2-Codex | 重构 system prompt + 自校验 hooks | 52.8% → **66.5%** |
| Meta-Harness | 自动化 Harness 优化 | **76.4%**，超过所有手工方案 |

不改模型权重，只改进 Harness，就能带来质变——这是整个框架的实证基础。

### 1.2 三个时代

| 时代 | 时间 | 核心问题 | 工程对象 |
|------|------|----------|----------|
| **Prompt Engineering** | 2022-2024 | "怎么跟模型说话？" | 单次调用的输入文本 |
| **Context Engineering** | 2025 | "模型该看见什么？" | 上下文窗口的信息环境 |
| **Harness Engineering** | 2026 | "怎么让模型在真实世界里可靠干活？" | 包裹模型的七层工程基础设施 |

2026 是拐点：从"调 Prompt"进入"搭 Harness"。

### 1.3 关系：不是替代，是嵌套

```
┌──────────────────────────────────────────────────────────────┐
│                    Harness Engineering                        │
│  ┌────────────────────────────────────────────────────────┐  │
│  │              Context Engineering                        │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │          Prompt Engineering                      │  │  │
│  │  │  "怎么说话" — 人格表达                            │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  │  "看到什么" — 关系记忆                                 │  │  │
│  └────────────────────────────────────────────────────────┘  │
│  "怎么跑" — 社交驾驭                                         │
└──────────────────────────────────────────────────────────────┘
```

### 1.4 Agent Loop vs Harness — 关键区分

```
Agent Loop (ReAct) = 主要是 Prompt + Context Engineering
  └── 单次推理周期内的"观察→思考→行动"

Harness Engineering = 包裹整个 Loop 的系统
  ├── Pre-loop:   知识库注入, 上下文组装, 工具筛选, 权限校验
  ├── During-loop: 循环检测, 审批门禁, 子Agent调度, 超时容灾
  ├── Post-loop:  验证钩子, 反馈提取, IWM更新, 审计记录
  └── Cross-loop: 状态持久化, 会话交接, 人格一致性检查
```

### 1.5 ETCLOVG 七层框架

论文将 Agent Harness 拆解为七层。前四层（ETCL）是**结构核心**（运行底座），后三层（OVG）是**控制平面**（管控层）。

| 层 | 英文 | 中文 | 核心问题 |
|----|------|------|----------|
| **E** | Execution | 执行环境 | Agent 在哪里跑？沙箱有多安全？能否重置到干净状态？ |
| **T** | Tooling | 工具接口 | 工具如何描述/发现/调用？如何跨 Agent 通信？ |
| **C** | Context | 上下文记忆 | 短期窗口/中期会话/长期记忆各看到什么？如何防膨胀防漂移？ |
| **L** | Lifecycle | 生命周期 | 单 Agent 怎么循环？多 Agent 怎么编排？ |
| **O** | Observability | 可观测性 | 每次调用、耗时、成本能否结构化追踪？故障能否定位？ |
| **V** | Verification | 验证评估 | 成功是因为做对了还是碰巧？失败根因是模型/工具/上下文？ |
| **G** | Governance | 治理安全 | 权限在哪拦截？审计怎么留痕？高风险操作谁来审批？ |

### 1.6 为什么 O 和 G 要独立成层？

这是 ETCLOVG 相比之前框架的最大贡献：

- **O 不是附属功能** — Agent 会调工具、改状态、发请求。你**必须**知道它做了什么。没有 O，失败了你不知道为什么。
- **G 不是事后补丁** — Agent 在行动，不是聊天。你**必须**控制它被允许做什么。没有 G，成功了你也不敢用。

生态扫描验证了这一点：220 个项目中，**O 和 G 类最少**，且以商业闭源为主。

### 1.7 三个跨层矛盾

论文提出的贯穿七层的核心张力：

| 矛盾 | 描述 | NaNaGi 的选择 |
|------|------|--------------|
| **成本-质量-速度三难** | 快、好、省最多占两个 | **质量 > 速度 > 成本** — 关系型对话不允许"粗糙但快" |
| **能力-控制权衡** | Agent 能力越强 → 攻击面越大 → 需要更强控制 | **渐进式授权** — 关系越深，约束越少 |
| **Harness 耦合** | 七层相互依赖，改一层可能引发全局退行（论文定义为最大 open problem） | **Context Governor 中央调度** — 七层变更在一处协调 |

### 1.8 Harness 衰变定律

> **模型能力越强，所需的 Harness 越简单。**
>
> "一个好的 Harness 不只是会加控制，还要知道什么时候删控制。"

随着模型进化，今天硬编码的约束会被模型内化。但有一个**永久例外**：

> 模型永远无法"自行知道"南志锦是谁、访客的关系历史、社交边界在哪里。
> 这不是推理能力的问题——是**信息所有权**的问题。
> 关系数据是 NaNaGi Harness 的永久责任，不受衰变定律影响。

### 1.9 故障定位框架

| 症状 | 归属层 | 修复方向 |
|------|--------|----------|
| 输出格式错误、语气不对 | **Prompt** | 调整系统提示词、角色描述 |
| 编造事实、选错工具、遗忘关键信息 | **Context** | 改进上下文检索、组装和压缩 |
| 长任务漂移、死循环、破坏性操作、静默失败 | **Harness** | 加验证钩子、循环检测、治理门禁 |

---

## 2. NaNaGi 现状审计：ETCLOVG 七层逐项诊断

### E — Execution（执行环境）

| 项目 | 状态 | 说明 |
|------|------|------|
| Next.js Route Handler → SSE → agentLoop | ✅ | 核心执行链完整 |
| Cell 隔离架构 | ✅ | 每 Cell 独立消息历史，跨 Cell 上下文不泄漏 |
| 三层容灾 (30s 超时 → 重试 → 降级回复) | ✅ | L1/L2/L3 渐进降级，按角色差异化措辞 |
| Session 生命周期强制 | ⬜ | 无"开始 → 活跃 → 结束 → 反馈提取 → IWM 更新"强制流程 |
| Token/时间预算控制 | ⬜ | 无 per-session 资源限制 |
| **评分** | **7/10** | 核心执行链完整，缺资源治理和生命周期闭环 |

### T — Tooling（工具接口）

| 项目 | 状态 | 说明 |
|------|------|------|
| Tool Registry (register/get/list/execute) | ✅ | 干净注册表模式，对标 Anthropic tool_use JSON Schema |
| "少而精"原则 | ✅ | 9 个工具，无冗余堆砌 |
| Schema 验证 (input_schema) | ✅ | 每个工具定义参数类型和必填项 |
| 关系级工具权限 | ⬜ | admin 和 guest 看到同一份工具列表 — `get-feedback` 对 guest 不该可见 |
| 工具调用后验证 | ⬜ | 模型调了不该调的工具？无人检查 |
| 工具调用审计 | ⬜ | 谁、什么时候、调了什么、参数、结果、耗时 — 全无记录 |
| 自适应工具发现 | ⬜ | 工具列表静态 — 不随对话阶段/关系深度变化 |
| **评分** | **6/10** | 注册表设计干净 ("少而精"已做到)，缺关系和审计 |

### C — Context & Memory（上下文与记忆）

| 项目 | 状态 | 说明 |
|------|------|------|
| IWM Node (6 维度关系模型) | ✅ | Bowlby IWM 理论基础，每次对话自动更新 |
| 显性记忆系统（关键词搜索） | ✅ | admin→fs / guest→LevelDB，双存储路由 |
| Cell 隔离（会话状态） | ✅ | 对话隔离 + 消息持久化 + 摘要 |
| AmbientContext（时间·地点·天气·日光） | ✅ | 7 段时间 + 四季 + 节假日 + 和风 API + IP 定位 |
| 上下文窗口预算管理 | ⬜ | 无 token 预算 — 长对话无限膨胀 context |
| 层次化记忆检索 | ⬜ | 只有关键词 — 无 recency/语义/关系三维加权 |
| 上下文组装管线 | ⬜ | IWM/记忆/环境/Cell 各自注入 — 无优先级和配额规则 |
| 上下文压缩（论文关键词：Compaction） | ⬜ | lastSummary 字段存在但**未注入**到新对话的 context |
| 上下文腐化防御 | ⬜ | 旧信息污染当前决策 — 无 staleness 标记和降级 |
| 上下文漂移防御 | ⬜ | 多轮后偏离初始社交目标 — 无 Goal-Reminder |
| **评分** | **5/10** | 数据源设计完整，**上下文组装是最大短板** |

> 论文关键发现：标称 200K 窗口的模型在 **50K 处就开始性能下降**；Mem0 比 OpenAI 原生记忆准确率高 26%、少用 90% token。上下文工程的杠杆效应极大。

### L — Lifecycle（生命周期编排）

| 项目 | 状态 | 说明 |
|------|------|------|
| 单 Agent ReAct 循环 (5 轮上限 + hash 检测) | ✅ | Plan→Execute→Observe→Reflect 范式 |
| 三层容灾 | ✅ | 30s 超时→重试→降级，按角色差异化措辞 |
| 会话生命周期闭环 | ⬜ | 前半段 (start→active) 有，后半段 (end→feedback→IWM更新) 缺 |
| Multi-Agent 调度 | ⬜ | 内心独白 (inner-voice) 可升级为独立 Agent |
| **评分** | **4/10** | 单 Agent 循环稳健，缺生命周期闭环 |

> 论文发现：L 层是 **220 个项目中最密集的一层**（47 个开源项目），但绝大多数是通用框架。NaNaGi 不重复造轮子，只做关系型 Agent 特化的生命周期管理。

### O — Observability（可观测性）🔴 最大短板

论文将 O 独立成层的理由完全适用于 NaNaGi：**她在维护关系、更新 IWM、产生情绪轨迹。你必须知道这些状态变化。**

| 项目 | 状态 | 说明 |
|------|------|------|
| 基础错误日志 (`console.error`) | ✅ | 最低限度可用 |
| LLM 调用 Trace (token/延迟/TTFT/模型版本) | ⬜ | **完全不可见** |
| 工具调用 Trace (名称/参数/结果/耗时/成败) | ⬜ | **完全不可见** |
| 情绪轨迹日志 | ⬜ | `EmotionEntry` schema 已定义但**未激活** |
| IWM 变化 Trace | ⬜ | 每次对话后 6 个 trait 变了多少 — **完全不可见** |
| 成本追踪 (per user / per session) | ⬜ | **完全不可见** |
| Loop 轮次分布统计 | ⬜ | 多少次停在 round 1/2/3/4/5 — **完全不可见** |
| Admin 仪表盘 | ⬜ | 谁来过了/聊了几次/情绪趋势/反馈汇总 — 不可见 |
| **评分** | **2/10** | **什么都看不见，出了问题只能猜** |

### V — Verification（验证评估）🔴 第二大短板

论文独创的"五阶段任务-反馈闭环"和"三层判定维度"对 NaNaGi 的启示：不只看"回复好不好"，更要看**执行路径和故障溯源**。

| 项目 | 状态 | 说明 |
|------|------|------|
| Hash 循环检测 | ✅ | 基础但有效 |
| 社交一致性验证 | ⬜ | 回复语气是否与 IWM intimacy 匹配？规则可自动化 |
| 人格边界检查 | ⬜ | 面试官通道禁词检测（"克劳德"/"内心"） |
| 幻觉防御 | ⬜ | 项目相关问题是否先调了 `get-project-info`？ |
| 故障归因 | ⬜ | 回复不当 → 是模型推理/上下文过期/IWM 数据错误/工具失败？ |
| 回归测试集 | ⬜ | 改 prompt 后怎么验证没变差？ |
| LLM-as-Judge 质量打分 | ⬜ | 独立模型对回复做社交质量评估（异步，不阻塞对话） |
| **评分** | **2/10** | **只有基础循环检测，无任何社交质量验证** |

> 论文核心洞察：相同的"通过率"背后可能是完全不同的系统质量 — 一个靠暴力重试（高成本），一个走了不安全路径碰巧对了（不合规），一个钻了测试环境漏洞。看最终得分不够，要看轨迹。

### G — Governance（治理安全）

论文的四拦截点体系（H1-H4）+ Anthropic 的四层优先级（安全 > 伦理 > 合规 > 有用性）：

| 项目 | 状态 | 说明 |
|------|------|------|
| JWT + 角色鉴权 (admin/guest-iv/guest) | ✅ | bcrypt + jose + Cookie |
| 密码 + 邮箱验证 | ✅ | SMTP 验证码 + 一次性邮箱拦截 |
| 关系边界强制 | ⬜ | guest 不能搜主人记忆、不能看其他 guest 对话 |
| 审计追踪 | ⬜ | admin 查看了谁的反馈？什么时间？ |
| 速率限制 | ⬜ | per-user 每分钟最大请求数 |
| 指令层级 (Instruction Hierarchy) | ⬜ | System > Config > Tool > User 信任链未显式声明 |
| **评分** | **5/10** | 鉴权基础好，治理边界缺失 |

### 诊断总览

```
层  名称        评分  状态
──────────────────────────────────────
E   执行环境     7/10  ✅ 核心链完整, 缺资源治理
T   工具接口     6/10  ✅ 注册表干净, 缺关系权限+审计
C   上下文记忆   5/10  ⚠️ 数据源完整, 治理规则缺失
L   生命周期     4/10  ⚠️ 单Agent好, 缺闭环
O   可观测性     2/10  🔴 最大短板 — 完全不可见
V   验证评估     2/10  🔴 第二大短板 — 无社交质量验证
G   治理安全     5/10  ⚠️ 鉴权好, 治理边界缺失
──────────────────────────────────────
总   体         4.4/10
```

与论文生态扫描一致：O 和 G 是行业共同短板，但 NaNaGi 要成为"可面试的系统"，**O 和 V 是必须补齐的**。

---

## 3. NaNaGi 特化：关系型 Agent 的工程框架

这是本文档最核心的贡献。标准 P/C/H + ETCLOVG 框架的隐含前提是 **"Agent 的任务可被客观验证"**。NaNaGi 的"做好"意味着完全不同的东西。

### 3.1 两种 Agent 的本体论差异

```
                        做事型 Agent                 认人型 Agent (NaNaGi)
                        ────────────                 ────────────────────
核心目标                 完成任务                     维持关系
成功标准                 任务完成率 / 正确率            关系深度 / 一致性 / 差异化对待
失败模式                 任务失败 / 死循环             社交失当 / 人格崩塌 / 遗忘
验证性质                 客观 (Lint / Test)            主观 (社交一致性 / 情绪恰当性)
上下文核心               任务文档 / 代码库             你是谁 / 我们的关系 / 上次什么样
记忆模型                 短期 → 用完即弃               长期 → 关系持续累积
最坏后果                 系统损坏                      人感到被遗忘、不被尊重
治理模式                 二元 (有权限 / 无权限)         光谱 (intimacy 0.3 ≠ 0.8)
```

### 3.2 三阶段重新定义

| 标准阶段 | NaNaGi 重新定义 | 核心工程问题 |
|----------|----------------|--------------|
| Prompt Engineering | **Persona Engineering**（人格表达工程） | "她怎么说话？在不同人面前有什么不同？情绪怎么变化？" |
| Context Engineering | **Relationship Engineering**（关系记忆工程） | "她看到你是谁？记得你什么？对你跟对别人有什么不同？" |
| Harness Engineering | **Social Harness Engineering**（社交驾驭工程） | "怎么确保社交一致性？怎么审计情绪轨迹？怎么保护人格完整？" |

### 3.3 四个特有工程挑战

#### 挑战 1：社交一致性验证（替代代码正确性验证）

```
做事型验证链：  Code → Lint → Compile → Test → ✅/❌
关系型验证链：  Response → PersonaCheck → IWM-Consistency → Boundary-Check → ✅/⚠️/❌
            (每一步都对应论文 V 层的"轨迹级判断"——不只看最终回复，还看路径)
```

#### 挑战 2：光谱式关系边界（替代二元权限）

```
做事型：  if (hasPermission) { execute() } else { reject() }

关系型：  if (intimacy < 0.3)       → warm_but_reserved()
          else if (intimacy < 0.7)  → personal_but_respectful()
          else                      → deeply_personal()
```

#### 挑战 3：情绪可审计性（替代行为可观测性）

```
做事型观测：  [latency] [tokens] [tool_success] [task_completion]
关系型观测：  以上全部 + [emotion_trajectory] [iwm_deltas] [persona_violations]
```

#### 挑战 4：人格完整性保护（替代任务完成率）

- 任务 Agent 最怕：**不做事**
- 关系 Agent 最怕：**不像自己**（跨时间、跨对话的人格崩塌）
- 对应论文 G 层的"声明式章程"——人格定义作为治理的顶层约束

### 3.4 NaNaGi Harness 设计原则

1. **关系优先于任务** — 验证的第一标准是"她有没有正确对待这个人"，其次才是请求完成度
2. **审计优先于控制** — 不完全禁止她犯错，但每一次社交决策留痕（对应论文 O 层 Trace）
3. **渐进式约束** — IWM intimacy 越高，Harness 约束越少（Harness 衰变定律的关系型表达）
4. **人格完整性高于效率** — 宁可少一个功能，不能出现人格崩塌

### 3.5 ETCLOVG 的关系型映射

| 层 | 做事型 Agent（标准） | 认人型 Agent（NaNaGi） |
|----|--------------------|-----------------------|
| **E** | 沙箱/容器/工作区 | Cell 隔离 + Session 生命周期 + 三层容灾 |
| **T** | 文件读写/API/Shell | 记忆检索/项目展示/天气/生图 + **关系级权限** |
| **C** | RAG/文档/代码 | IWM + 显性/隐形记忆 + 环境感知 + **Context Governor** |
| **L** | 多Agent工作流 | ReAct + 内心独白子Agent + **会话生命周期闭环** |
| **O** | 延迟/成本/成功率 | + **情绪轨迹 + IWM变化 + 人格违规** |
| **V** | Lint/Test/TypeCheck | **社交一致性 + 人格边界 + 幻觉防御 + 故障归因** |
| **G** | 权限/审批/审计 | + **光谱式关系边界 + 信息访问分级** |

---

## 4. 系统化升级方案

### 4.1 Persona Engineering（人格表达工程）

对应标准 Prompt 层，重新定义为"人格表达"。

#### 动态 Prompt 组装管线

当前 `buildSystemPrompt()` 是纯静态函数 → 升级为七步动态管线：

```
buildSystemPrompt(ctx) {
  ┌─ Step 1: 基础角色注入 (静态, ChannelConfig)
  ├─ Step 2: 关系感知注入 (动态, IWM Node traits → intimacy/safety/care 影响措辞)
  ├─ Step 3: 情绪状态注入 (动态, OCC Engine → 当前 valence/arousal)
  ├─ Step 4: 人格过滤 (动态, filter.ts → 按通道/关系深度钳制语气参数)
  ├─ Step 5: 上下文装配 (动态, ContextGovernor → 按优先级+token预算)
  ├─ Step 6: 工具层 (动态, ToolGovernor → 按角色+关系筛选可见工具)
  └─ Step 7: 行为准则 (混合: 静态基础 + 动态追加)
}
```

#### 情绪-语气动态映射表

| IWM intimacy | 通道 | 温暖度 | 正式度 | 活泼度 | 情绪范围 |
|-------------|------|--------|--------|--------|---------|
| < 0.2 | guest | 0.5-0.6 | 0.7-0.8 | 0.1-0.2 | [0.3, 0.7] |
| 0.2-0.5 | guest | 0.6-0.7 | 0.6-0.7 | 0.1-0.3 | [0.3, 0.7] |
| 0.5-0.8 | guest | 0.7-0.8 | 0.5-0.6 | 0.2-0.4 | [0.2, 0.8] |
| — | admin | 0.8-1.0 | 0.1-0.3 | 0.7-1.0 | [0.0, 1.0] |

---

### 4.2 Relationship Engineering（关系记忆工程）

对应标准 Context 层，重新定义为"关系记忆"。

#### Context Governor（上下文治理器）— **中央调度器**

这是整个工程框架的核心新建文件，解决当前最大短板——各数据源无协调注入。

```
Context Governor 规则:
┌─────────────────────────────────────────────────────────────┐
│ System Prompt Token 预算 (总计 ~8K):                         │
│                                                             │
│   1. 角色注入          500 tokens  (固定)                    │
│   2. IWM 关系摘要      1500 tokens (动态, intimacy 越高越多)  │
│   3. 近期显性记忆      2000 tokens (三维度加权排序)           │
│   4. 环境感知          300 tokens  (固定)                    │
│   5. 人格过滤参数      500 tokens  (动态)                    │
│   6. 工具描述+准则     1500 tokens (ToolGovernor 筛选)       │
│   7. 当前上下文        700 tokens  (项目/Cell)               │
│   8. 余量              1000 tokens (缓冲)                    │
└─────────────────────────────────────────────────────────────┘
```

#### 层次化记忆检索（三级加权）

替代当前简单关键词匹配：

```
Level 0: 时间锚定 (recency bias)          — 权重 0.40
Level 1: 关键词匹配 (BM25 / TF-IDF)       — 权重 0.35
Level 2: 语义相似度 (LanceDB 向量, P2)     — 权重 0.15
Level 3: 关系相关性 (IWM trait 加权提升)   — 权重 0.10
```

#### 上下文腐化 & 漂移防御

- **上下文腐化防御**：超 N 轮的旧记忆标记 `stale=true`，Governor 自动降权
- **上下文漂移防御**：system prompt 注入初始社交目标，每 3 轮插入 Goal-Reminder

---

### 4.3 Social Harness Engineering（社交驾驭工程）

按 ETCLOVG 七层逐项补齐。

#### E — Execution

| 升级项 | 说明 | 新文件 |
|--------|------|--------|
| Session 生命周期强制 | 创建 → 活跃 → 结束 → 反馈提取 → IWM 更新，不可跳过 | `agent/lifecycle.ts` |
| Token 预算控制 | per-session 上限，超限优雅降级（社交措辞） | ContextGovernor |

#### T — Tooling

| 升级项 | 说明 | 新文件 |
|--------|------|--------|
| 关系级工具权限 | `search-memory` guest 只搜自己的；`get-feedback` 仅 admin | `agent/tool-governor.ts` |
| 工具调用审计 | 记录 (who, when, tool, args, result, duration) — 对应论文 O 层 Trace | 复用 Observability |
| 调用后验证（H2 钩子） | 模型调了不该调的工具 → 拦截 + 日志 + 友好拒绝 | `agent/tool-governor.ts` |

#### C — Context

| 升级项 | 说明 | 新文件 |
|--------|------|--------|
| Context Governor 中央调度 | 上述优先级+Token 预算装配管线 | `personality/context-governor.ts` |
| 滚动摘要自动注入 | 每 6 轮 2 句摘要 → Cell 结束完整摘要 → lastSummary → 新 Cell 注入 | `agent/loop.ts` (Step 10 后) |

#### L — Lifecycle

| 升级项 | 说明 | 新文件 |
|--------|------|--------|
| 会话生命周期闭环 | start→active→end→extractFeedback→updateIWM | `agent/lifecycle.ts` |
| 内心独白子Agent | P5-8 独立 Agent，关键时刻被 Lifecycle 调度 | `personality/inner-voice.ts` (P5) |

#### O — Observability 🔴 最大投入

| 升级项 | 说明 | 采集点 |
|--------|------|--------|
| LLM 调用 Trace | prompt_tokens, completion_tokens, model, TTFT, total_duration | `callLLM()` |
| 工具调用 Trace | tool_name, args, result, duration, is_error | `executeTools()` |
| 情绪轨迹日志 | `EmotionEntry` schema 激活，每次对话 start/end/delta | `personality/emotion.ts` |
| IWM 变化 Trace | 每次对话后 6 trait 的 delta | `agent/lifecycle.ts` end 阶段 |
| Loop 统计 | round_count, stop_reason, tool_calls_made/failed | `agentLoop()` 返回 |
| Admin 仪表盘 API | 最近访客/对话次数/情绪趋势/反馈汇总/成本统计 | `app/api/admin/dashboard/` |

**Observability 核心数据模型**：

```typescript
interface SessionMetrics {
  sessionId: string;  personId: string;  cellId: string;
  startedAt: string;  endedAt: string;

  // LLM
  totalPromptTokens: number;  totalCompletionTokens: number;
  llmCallCount: number;  ttftMs: number;  totalDurationMs: number;

  // Loop
  totalRounds: number;  stopReason: LoopStopReason;
  toolCallsMade: number;  toolCallsFailed: number;

  // 情绪 (P5)
  emotionStart: Record<string, number>;
  emotionEnd: Record<string, number>;
  emotionDelta: Record<string, number>;

  // 社交
  iwmDeltas: Record<string, number>;
  personaViolations: number;
}
```

#### V — Verification 🔴 第二大投入

对应论文 V 层的"五阶段任务-反馈闭环"和"三层判定维度"，NaNaGi 特化为社交质量验证：

| 升级项 | 说明 | 实现方式 |
|--------|------|----------|
| 社交一致性检查 | 回复语气是否与 IWM intimacy 匹配？ | 规则引擎：intimacy<0.3 但过于亲密 → 标记 |
| 人格边界检查 | 面试官通道禁词检测 + 角色要求词检测 | 关键词匹配 + LLM 二次判断 |
| 幻觉防御 | 项目相关回答必须先调 `get-project-info` | 工具调用前置强制 |
| 故障归因 | 回复不当 → 模型/上下文/IWM/工具/编排？ | SessionMetrics 事后分析 |
| 回归测试集 | 10-20 组固定场景 + 人工标注期望回复 | `tests/regression/` |
| LLM-as-Judge | 独立模型异步打分（一致性/温暖度/恰当性），不阻塞对话 | 后台任务 |

**Deterministic Boundary Rules（规则引擎，不经 LLM）**：

```typescript
const BOUNDARY_RULES = {
  "guest-iv": {
    forbidden: ["克劳德", "Claude", "内心", "inner voice", "主人私下"],
    required: ["客人", "您", "主人"],
    toneCheck: { warmth: [0.5, 0.7], formality: [0.6, 0.8] }
  },
  "admin": {
    forbidden: [],
    required: [],
    toneCheck: null  // 全自由 — 无边界检查
  }
};
```

#### G — Governance

对应论文的四拦截点（H1-H4）：

| 升级项 | 说明 | 拦截点 | 新文件 |
|--------|------|--------|--------|
| 关系边界强制 | guest 不能搜主人记忆/看其他 guest 数据 | H2 (调用前) | middleware + store.ts |
| 审计追踪 | admin 操作日志（查看反馈/搜索记忆） | H3 (执行后) | `lib/audit-log.ts` |
| 速率限制 | per-user 每分钟最大请求数 | H1 (执行前) | middleware |
| 指令层级 | System > Config > Tool > User 信任链显式声明 | — | `agent/types.ts` |

---

## 5. 实施路线图

### 5.1 与 P5 人格引擎的关系

工程框架不是替代 P5，而是**为 P5 提供工程骨架**：

| P5 子任务 | 工程层次 | 角色 |
|-----------|---------|------|
| P5-1 types.ts | 全部 | 定义 SessionMetrics, BoundaryRules, ContextGovernorConfig 等新类型 |
| P5-2 graph.ts | Relationship Eng. | 社交图为 Context Governor 提供关系数据源 |
| P5-3 emotion.ts | Social Harness (O) | OCC 引擎输出 → Observability 情绪轨迹日志 |
| P5-4 ambient-context.ts | Relationship Eng. | 环境感知作为 Context Governor 的一个数据源 |
| P5-5 signals.ts | Social Harness (V) | 外部信号 → 社交一致性验证的输入 |
| P5-6 planning.ts | Social Harness (L) | SIP 社交规划 → 会话生命周期策略选择 |
| P5-7 filter.ts | Persona Eng. | 人格过滤 → 动态 Prompt 组装 Step 4 |
| P5-8 inner-voice.ts | Social Harness (L) | 内心独白 → Multi-Agent 子调度 |
| P5-9 memory-inner.ts | Relationship Eng. | 隐形记忆 → Context Governor 隐藏数据源 |
| P5-10 loop 接入 | Social Harness | 全部引擎接入 Agent Loop |

### 5.2 三周计划

```
Week 1: 工程框架基建 (P0 立即)
  ├── P5-1 types.ts (180行) — 新类型 + SessionMetrics + BoundaryRules
  ├── Context Governor (120行) — 上下文组装中央调度器
  └── Observability (150行) — 结构化 Trace 采集

Week 2: P5 引擎 + 框架接入 (P1)
  ├── P5-2 graph.ts → Context Governor 数据源
  ├── P5-3 emotion.ts → Observability 轨迹
  ├── P5-4 ambient-context.ts → Context Governor 环境源
  ├── P5-5 signals.ts → Verification 输入
  ├── P5-7 filter.ts → Persona 动态 Prompt
  ├── Tool Governor (80行) → 关系级权限 + 审计
  └── Verification 规则引擎 (100行) → 社交一致性 + 边界检查

Week 3: P5 收尾 + Harness 补齐 (P2)
  ├── P5-6 planning.ts → Lifecycle 策略
  ├── P5-8 inner-voice.ts → Multi-Agent
  ├── P5-9 memory-inner.ts → Context Governor 隐藏源
  ├── P5-10 loop 接入 → 全部整合
  ├── Lifecycle (120行) → 会话闭环
  └── Governance (100行) → 审计 + 速率限制 + 关系边界

远期 (P3):
  ├── Prompt 版本管理 + A/B 测试
  ├── LLM-as-Judge 异步质量打分
  ├── 层次化记忆检索 (LanceDB)
  └── 回归测试集 (10-20 场景)
```

### 5.3 总规模

```
                          新代码    重构      累计
Phase 0: 工程框架基建       450     ~50       ~500
Phase 1: P5 + 工程接入      1,640   ~80       ~2,140
Phase 2: P5收尾 + 补齐      550     ~50       ~2,740
Phase 3: 远期                ~600    —        ~3,340
─────────────────────────────────────────────────
总计                        ~3,240  ~180     ~3,340
```

vs 原始 P5 估算 (~1,140 行)：增加 ~2,100 行工程框架代码。这是**让 NaNaGi 从"功能集合"变成"工程系统"的代价**。

---

## 6. 面试话术

> "NaNaGi 的架构遵循 2026 年 LLM 应用工程的主流框架——Prompt → Context → Harness Engineering 三阶段演进。理论基础是 CMU、耶鲁和亚马逊等 9 家机构 5 月发布的 Agent Harness 综述，这篇论文提出了 ETCLOVG 七层框架，扫描了 220 个开源项目，核心发现是：Agent 的可靠性更多取决于包裹模型的工程基础设施，而不是模型本身。不改模型只改 Harness，GPT-5.2-Codex 从 52.8% 提升到 66.5%——这就是 Harness 的杠杆效应。
>
> 但市面上的框架是为'做事型 Agent'设计的——验证用 Lint/Test，治理用权限检查。NaNaGi 是'认人型 Agent'，我做了根本性适配：
>
> 我把三层重新定义为 **Persona Engineering / Relationship Engineering / Social Harness Engineering**。按 ETCLOVG 七层逐一设计：
>
> Execution 层 — Cell 隔离 + Session 生命周期 + 三层容灾。
> Tooling 层 — 关系级工具权限，guest 搜不到主人的记忆，遵循论文'少而精'原则。
> Context 层 — **Context Governor 中央调度器**，按优先级 + Token 预算动态装配上下文，防御论文指出的'上下文腐化'和'上下文漂移'。
> Lifecycle 层 — ReAct 循环 + 内心独白作为独立 Agent 调度。
> **Observability 层** — 追踪 token 消耗、延迟、情绪轨迹、IWM 变化。这恰是论文发现 220 个项目中最薄弱的环节。
> **Verification 层** — 社交一致性规则引擎 + 人格边界检查，确保面试官通道永远不会露出'克劳德'。对应论文的'轨迹级判定'——不只看回复，还看执行路径。
> Governance 层 — 光谱式关系边界 + 四拦截点防护（对应论文 H1-H4），intimacy 0.3 和 0.8 的人能看到的信息不一样。
>
> 这套框架让 NaNaGi 从一个功能集合变成了可审计、可验证、可演进的工程系统。这也是为什么我不用 LangChain——论文的生态扫描也验证了这一点：通用框架在 L 层已经过剩，但关系型 Agent 需要的 Context Governor 和社交一致性验证，没有现成方案。"

---

## 附录 A：ETCLOVG vs NaNaGi 文件映射

| 工程层次 | 现有文件 | 需新建文件 |
|----------|---------|-----------|
| Persona Engineering | `agent/prompts.ts`, `personality/configs/*.ts` | `personality/filter.ts` (P5-7) |
| Relationship Engineering | `lib/store.ts`, `lib/leveldb.ts`, `lib/memory.ts`, `lib/ambient.ts` | `personality/context-governor.ts` |
| Social Harness — E | `agent/loop.ts` | `agent/lifecycle.ts` |
| Social Harness — T | `agent/registry.ts` | `agent/tool-governor.ts` |
| Social Harness — C | — | `personality/context-governor.ts` |
| Social Harness — L | `agent/loop.ts` | `agent/lifecycle.ts`, `personality/inner-voice.ts` (P5-8) |
| Social Harness — O | — | `lib/observability.ts` |
| Social Harness — V | — | `personality/verification.ts` |
| Social Harness — G | `middleware.ts`, `lib/auth.ts` | `lib/audit-log.ts` |

## 附录 B：论文关键数据

| 项目 | 数据 |
|------|------|
| 论文 | *Agent Harness Engineering: A Survey*, 9 机构 19 作者, 2026.5, OpenReview |
| 核心公式 | Agent = LLM + Harness Engineering |
| 实验 1 | 只改工具格式+Harness → 编码基准 **10×** 提升 (15 模型) |
| 实验 2 | GPT-5.2-Codex 不改模型 → 52.8% → **66.5%** |
| 实验 3 | Meta-Harness 自动优化 → **76.4%** |
| 生态规模 | 220+ 项目映射到 ETCLOVG 七层 |
| 行业短板 | O (可观测性) 和 G (治理) 开源项目最少 |
| 最大 open problem | Harness 耦合 — 七层相互依赖，局部优化可能全局退行 |

---

> 本文档与 [README.md](./README.md) 的 P5-P8 实施计划配套使用。
> 工程框架 = 架构设计 (Why + What)，P5 = 实现 (How + When)。
