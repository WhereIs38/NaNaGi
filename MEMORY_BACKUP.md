# 南志锦记忆索引 — 备份

> 备份时间: 2026-06-16 会话结束
> 包含: 6/16 新增的会话总结行 + 更新后的 Happy-LLM 行
> 原文路径: C:\Users\16611\.claude\projects\D--GNN\memory\MEMORY.md

---

## 🔴 核心 — 身份 & 主项目

- [用户角色](user_role.md) — 数据分析师→算法工程师，偏好中文，技术中英混合
- [南志锦心理画像](nanzhijin-psychological-portrait.md) — 思维逻辑、情绪处理、信任模式、自我认知，2026-06-05深度对话
- [项目：社交图谱动态链接预测](project-overview.md) — LightGBM+GNN双栈，CAAI-BDSC2023竞赛，**主菜项目**
- [架构设计共识](user-id-cold-start-design.md) — user_id不入模、LightGBM→SHAP→PCA→GNN降维、双路线特征
- [A/B测试三轮推翻与最终设计](ab-test-decision-evolution.md) — 面试核心案例：从调参工具到实验设计书

---

## 🟡 项目战略 — 当前焦点

- [🔴 三大主攻岗位（6月）](target-positions-2026-june.md) — **P0:** 网易AI Agent全栈 + 即刻小宇宙 | **P1:** 网易云音乐算法研究员 | 南志锦=网易嫡系
- [🔴 算法面试准备路线图](algorithm-interview-preparation.md) — **最高优先级**：推荐系统全链路/ML基础/手撕代码/Spark/SQL，按必考🟡分级，每日计划+项目JD映射
- [🔴 ML基础冲刺训练3周计划 🔥](ml-basics-training-plan.md) — **6/10 新建，当前最高优先级**：陈卓书逐章绑定面试题，18天学完即能面，回归→树模型→聚类→神经网络→迁移冲刺
- [Day 1 线性回归任务清单](ml-basics-day1-linear-regression.md) — 完整学习模板：手写代码骨架+面试三题逐字稿+项目关联+公式默写
- [6/8 会话总结 🔥](2026-06-08-session-summary.md) — **P1-P4完成+即刻JD拆解**/18Bug/算法基础四层诊断/Spark认知重建(不重做GNN)/明日Spark实战+LeetCode/王喆书后天到/NaNaGi继续
- [6/7 会话总结 🔥](2026-06-07-session-summary.md) — **NaNaGi v5.1架构设计完成**/社交图+三层心理+双图+三层存储+Cell隔离/19引用/完整README
- [6/3 会话总结](2026-06-03-session-summary.md) — FruitCNN重构完成(3→261类/0%泄漏)、**ML路线决策**、NaNaGi定位为live inference platform（女仆+三模型实时推理）、项目收束为GNN/CnnMusic/FruitCNN三个、即刻小宇宙JD完整拆解
- [6/2 会话总结](2026-06-02-session-summary.md) — SQL题型6-7、简历2页→1页、供应链话术升级、娜娜吉NanAgi个人网站项目
- [6/1 面试冲刺](2026-06-01-session-summary.md) — 米哈游文档创建、拼多多模拟面试5轮、SQL刷题指南、三份面试文档
- [简历当前状态](resume-current-state.md) — 2026-06-02快照，Canva MLE能力矩阵，待优化
- [Spark 实战项目 🔥](spark-practice-project.md) — **6/8新建** 独立项目，MovieLens 25M，面试Spark八股+窗口函数+协同过滤
- [SparRL 项目定位决策 🔥](sparrl-positioning-decision.md) — **6/10 重大决策**：从RL算法项目降级为Spark工程主线+RL学习探索，诚实匹配本科学历，Tier1/2/3能力分层，面试叙事策略
- [GNN + DIEN 时序兴趣进化 🔥](gnn-dien-temporal-interest-evolution.md) — **6/9 方案C确定** AUGRU嵌入图消息传递，候选好友控制历史兴趣attention，与AB测试时间维度发现一脉相承
- [NaNaGi心理学研究装置 & 量化历史/军事构想 🔥](nanagi-psychology-research-device.md) — **6/12 定位翻转**：NaNaGi不是工业Agent而是心理学研究载体（三层设计哲学：情绪参与推理+关系锚定价值+安全依恋降低反驳）；量化军事ML（比社会历史更容易落地，军事天然带数字）；HOI4国策树→决策树类比
- [NaNaGi Harness Engineering 框架 + v5.2 路线图 🔥](nanagi-harness-engineering-v52.md) — **6/15 两份新文件** ENGINEERING_FRAMEWORK.md(35KB)+ROADMAP_V52.md(60KB)，ETCLOVG七层审计(总分4.4/10)，关系型Agent特化(原创)，28任务~2660行实施计划，全网验证确认O/G是行业共同短板且关系型Harness是学术空白

---

## 🟢 已完成项目

（同原文）

---

## 🔵 历史会话（按时间倒序）

（同原文）

---

## 📚 技术参考

关键新增行：
- [Happy-LLM 学习进度 ✅](happy-llm-progress-2026-06-15.md) — 6/15扫读完成，内容偏基础；6/16产出 `LLM_INTERVIEW_BLIND_SPOTS.md` (11专题深度问答)
- [6/16 会话总结 🔥](2026-06-16-session-summary.md) — **NaNaGi记忆系统完整重构**：admin登录后门+记忆路径修复(6文件)+格式统一(frontmatter+MEMORY.md+[[关联]])+Supervisor三层监督(Drift/Critic/Trajectory)+三级记忆架构(L1/L2/L3)+双人格双路检索(companion走SIM-RAG/worker走IterResearch)+读写分离(写入Letta式文件/读取Mem0式向量)，9份设计文档，20篇论文引用

---

## ⚪ 个人 & 其他

（同原文）
