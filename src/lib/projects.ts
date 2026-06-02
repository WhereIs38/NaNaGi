// Project metadata — shown on project pages and referenced by Agent

export interface Project {
  slug: string;
  title: string;
  emoji: string;
  short: string; // one-liner for Agent to mention
  description: string; // longer for project page
  tech: string[];
  metrics: { label: string; value: string }[];
}

export const projects: Record<string, Project> = {
  "fruit-cnn": {
    slug: "fruit-cnn",
    title: "水果识别 CNN",
    emoji: "🍎",
    short: "3层CNN，ONNX浏览器端实时推理，8类校园设备识别",
    description:
      "一个完整的深度学习部署链路：PyTorch 训练 3 层 CNN → TorchScript 转换 → ONNX 导出 → Android 端侧推理。在浏览器中可直接运行 ONNX 模型，实时分类上传的图片。",
    tech: ["PyTorch", "ONNX", "CNN", "TorchScript", "Android"],
    metrics: [
      { label: "类别数", value: "8" },
      { label: "参数量", value: "396K" },
      { label: "输入尺寸", value: "100×100" },
    ],
  },
  "cnn-music": {
    slug: "cnn-music",
    title: "CnnMusic 多模态音频召回",
    emoji: "🎵",
    short: "CNN+NLP双模态内容召回，FAISS向量检索，Audio Recall@5=95.85%",
    description:
      "基于内容的多模态召回系统。CNN 提取音频 Mel 频谱特征，NLP 文本嵌入联合检索。FAISS 索引 10 个音乐流派，支持音频/文本/联合三模态查询。轻量模型(157K参数)反超标量模型(656K参数)，完整的 A/B 实验设计。",
    tech: ["PyTorch", "FAISS", "Sentence Transformers", "Librosa", "A/B Test"],
    metrics: [
      { label: "Audio Recall@5", value: "95.85%" },
      { label: "Text Recall@5", value: "88%" },
      { label: "模型参数", value: "157K" },
    ],
  },
  gnn: {
    slug: "gnn",
    title: "GNN 社交图谱链接预测",
    emoji: "🔗",
    short:
      "LightGBM+GNN双路线，AUC 0.8957，MRR@5 0.5606，CAAI-BDSC2023竞赛",
    description:
      "CAAI-BDSC2023 竞赛项目。双路线方案：LightGBM 做排序（AUC 0.8957, MRR@5 0.5606），GraphSAGE/GCN 做冷启动（冷启动 MRR 0.54）。关键创新：SHAP 做特征重要性分析 → PCA 降维 → 输入 GNN。发现 is_friend 特征在训练集 100% 泄漏，仅用作过滤器而非排序器。",
    tech: ["LightGBM", "GraphSAGE", "GCN", "SHAP", "PCA", "PyTorch Geometric"],
    metrics: [
      { label: "AUC", value: "0.8957" },
      { label: "MRR@5", value: "0.5606" },
      { label: "好友场景 MRR", value: "0.74" },
    ],
  },
};

// Ordered list for display
export const projectList = Object.values(projects);
