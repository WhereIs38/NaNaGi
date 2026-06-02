import { notFound } from "next/navigation";
import { projects } from "@/lib/projects";
import Link from "next/link";
import ProjectPageClient from "./ProjectPageClient";

// Generate static params for all known projects
export function generateStaticParams() {
  return Object.keys(projects).map((slug) => ({ slug }));
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projects[slug];

  if (!project) notFound();

  return (
    <main className="min-h-screen py-8 px-4">
      {/* Back button */}
      <div className="max-w-3xl mx-auto mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 pixel-btn text-sm"
        >
          ← 回到对话
        </Link>
      </div>

      {/* Project header */}
      <div className="max-w-3xl mx-auto mb-8">
        <div className="rpg-dialog">
          <h1 className="text-2xl font-bold mb-2 tracking-wider">
            {project.emoji} {project.title}
          </h1>
          <p className="text-ink-light leading-relaxed">
            {project.description}
          </p>

          {/* Tech tags */}
          <div className="flex flex-wrap gap-2 mt-4">
            {project.tech.map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 text-xs font-bold tracking-wider border-2 border-border bg-cream-hover"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="max-w-3xl mx-auto mb-8">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {project.metrics.map((m) => (
            <div key={m.label} className="pixel-border-light bg-cream-card p-4 text-center">
              <div className="text-2xl font-bold text-accent">{m.value}</div>
              <div className="text-xs text-ink-muted mt-1 tracking-wider">
                {m.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Demo area — placeholder for V2 */}
      <div className="max-w-3xl mx-auto">
        <div className="pixel-border-light bg-cream-card p-8 text-center">
          <p className="text-ink-muted text-sm tracking-wider">
            ◆ 互动演示区 — 即将上线 ◆
          </p>
          <p className="text-ink-muted text-xs mt-2">
            {project.emoji} {project.title} 的实时互动演示正在开发中
          </p>
        </div>
      </div>

      {/* Right sidebar chat widget handled by PageShell */}
      <ProjectPageClient slug={slug} />
    </main>
  );
}
