import type { Copy } from "@/lib/i18n";
import { EMAIL, LINKS, REPO } from "@/lib/product";
import { Heading, MoreLink, Section } from "./blocks";
import { ButtonLink } from "./button-link";
import { GitHubIcon, MailIcon } from "./icons";

/** Where each card's link goes: the issues, or a mail with the subject filled in. */
const TARGETS: Record<string, string> = {
  issues: LINKS.issues,
  email: `mailto:${EMAIL}?subject=norte%20sponsorship`,
};

/**
 * The call for help: the repository with GitHub's mark, then what a
 * collaborator and a sponsor would do, and the address to write to.
 */
export function Join({ t, contributing }: { t: Copy["join"]; contributing: string }) {
  return (
    <Section id="join" className="border-t border-line/60">
      <Heading eyebrow={t.eyebrow} title={t.title} body={t.body} />

      <div className="mt-14 grid grid-cols-1 gap-3 lg:grid-cols-[1.1fr_.9fr_.9fr]">
        <a
          href={REPO}
          className="rise group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.09] bg-surface p-6 transition hover:border-phosphor/40 lg:p-8"
        >
          <GitHubIcon className="pointer-events-none absolute -bottom-10 -right-10 h-56 w-56 text-white/[0.04] transition-colors group-hover:text-phosphor/[0.07]" />
          <GitHubIcon className="h-10 w-10 text-ink" />
          <p className="mt-6 font-mono text-lg font-semibold tracking-[-0.02em] text-ink">{t.repo}</p>
          <p className="mt-3 max-w-sm text-[15px] leading-6 text-ink/70">{t.repoBody}</p>
          <span className="mt-8 inline-flex h-11 w-fit items-center gap-2 rounded-full border border-phosphor bg-phosphor px-5 font-mono text-xs font-semibold uppercase tracking-[0.08em] text-[#0a1008] transition group-hover:bg-[#c6ff74]">
            <span aria-hidden>★</span> {t.star}
          </span>
        </a>

        {t.items.map(([title, body, action, target]) => (
          <article key={title} className="rise flex flex-col rounded-2xl border border-white/[0.09] bg-surface p-6 lg:p-8">
            <p className="font-mono text-[14px] font-semibold uppercase tracking-[0.1em] text-phosphor">{title}</p>
            <p className="mt-4 text-[15px] leading-6 text-ink/75">{body}</p>
            <div className="mt-auto pt-8">
              <ButtonLink href={TARGETS[target]} variant="secondary" arrow>{action}</ButtonLink>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-x-10 gap-y-4">
        <p className="inline-flex flex-wrap items-center gap-3 text-lg text-ink/70">
          {t.write}
          <a
            href={`mailto:${EMAIL}`}
            className="inline-flex items-center gap-2 font-mono text-ink underline decoration-white/30 underline-offset-4 hover:decoration-phosphor"
          >
            <MailIcon className="h-5 w-5 text-phosphor" />
            {EMAIL}
          </a>
        </p>
        <MoreLink href={LINKS.contributing}>{contributing}</MoreLink>
      </div>
    </Section>
  );
}
