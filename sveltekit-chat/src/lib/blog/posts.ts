export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
};

const LARGE_OPERATIONS_SECTIONS = [
  `
<h3>1. Why long-form operations writing matters</h3>
<p>Teams can run brilliant experiments and still fail to improve if the lessons never become usable knowledge. Long-form operational writing exists to preserve decision context: what was attempted, what changed, what costs were accepted, and what confidence level is attached to each conclusion. A short status note can tell you whether a launch happened. A detailed narrative can tell you why that launch either raised trust or created hidden debt that will surface next quarter.</p>
<p>In AI programs this distinction is critical because outcomes depend on many moving parts that shift together: retrieval quality, prompt discipline, escalation logic, monitoring thresholds, and user education. If a team records only final outcomes, people joining later repeat old debates with incomplete evidence. If a team records assumptions, alternatives considered, and post-release observations, future decisions get faster and safer.</p>
<blockquote>The value of long-form ops notes is not prose quality; it is decision memory with enough detail to be reused.</blockquote>
<ul>
  <li>Capture what changed, not only what shipped.</li>
  <li>Capture risks accepted, not only risks avoided.</li>
  <li>Capture confidence and uncertainty in plain language.</li>
</ul>
`,
  `
<h3>2. Define operating principles before scaling</h3>
<p>Before teams add more tools, more workflows, or more handoffs, they need principles that survive pressure. A principle should be concrete enough to guide implementation choices and broad enough to remain valid across products. For example, “default to explainable behavior over clever behavior” directly influences prompt design, error messaging, and fallback strategy. “Protect user momentum during uncertainty” influences timeout handling, draft responses, and partial progress UX.</p>
<p>When principles are explicit, tradeoffs become discussable instead of political. Engineers can describe why a safer path is chosen even when it appears slower. Product managers can explain why a launch was narrowed in scope to preserve reliability. Designers can prioritize comprehension when visual polish conflicts with readable structure. The common frame reduces unnecessary conflict because teams are evaluating against shared standards rather than personal preference.</p>
<p>Without principles, every difficult decision is renegotiated. That slows delivery and encourages inconsistent outcomes between squads.</p>
`,
  `
<h3>3. Architecture choices that age well</h3>
<p>Early architecture should optimize for observability and reversibility, not only speed. Teams often overfit to ideal-path demos and underinvest in failure-path clarity. A resilient architecture exposes enough intermediate signals to explain why a response was produced, why a fallback was chosen, and where latency is concentrated. This matters when customers report “it felt wrong” and teams must diagnose whether retrieval, reasoning, tool use, or policy constraints caused the issue.</p>
<p>Systems that age well separate policy from orchestration, orchestration from provider implementation, and provider implementation from UI behavior. This layering allows teams to improve one surface without destabilizing everything else. It also allows risk-limited experimentation: new models, new ranking logic, and new guardrails can be trialed behind explicit flags while production paths remain stable.</p>
<ol>
  <li>Instrument the full request lifecycle with correlation IDs.</li>
  <li>Persist lightweight traces for representative sessions.</li>
  <li>Design graceful degradation before peak traffic arrives.</li>
</ol>
`,
  `
<h3>4. Prompt governance in production teams</h3>
<p>Prompts should be treated as versioned operational assets, not ad hoc text. A mature team tracks prompt intent, expected behavior, known edge cases, and release history. This allows incident response to identify when behavior drift came from model changes, context packing changes, or prompt edits. Without that discipline, teams end up “fixing” symptoms repeatedly while root causes remain hidden.</p>
<p>Good prompt governance is lightweight: short design notes, explicit acceptance criteria, and release tags linked to observed metrics. It is not bureaucracy for its own sake. The goal is to create a chain from design intent to runtime behavior so that changes can be reasoned about quickly and reversed safely when needed.</p>
<p>As programs grow, prompt governance also improves onboarding. New contributors understand why constraints exist and when exceptions are acceptable.</p>
`,
  `
<h3>5. Retrieval quality beyond top-k metrics</h3>
<p>Retrieval quality is often summarized with aggregate scores, but production quality depends on scenario-level reliability. Teams should evaluate retrieval on difficult user intents: ambiguous wording, mixed language, outdated terminology, and multi-document synthesis. A retrieval stack can look strong in benchmark dashboards while still failing when users phrase questions as stories rather than keywords.</p>
<p>Operational teams build retrieval scorecards that combine quantitative measures with qualitative examples. They keep a rotating set of “known hard prompts” and rerun them after index updates, embedding upgrades, and chunking changes. This practice catches silent regressions that would otherwise appear as support volume increases weeks later.</p>
<ul>
  <li>Track false confidence cases separately from obvious misses.</li>
  <li>Prefer explainable ranking signals where possible.</li>
  <li>Audit source freshness and citation integrity regularly.</li>
</ul>
`,
  `
<h3>6. Human escalation design</h3>
<p>Escalation is not failure; it is part of a trustworthy system. Users lose trust when escalation feels random, late, or context-free. They gain trust when escalation is predictable, quick, and informed by what has already happened. A strong escalation path includes clear triggers, rich context transfer, and outcome feedback that improves future automation decisions.</p>
<p>Teams should define escalation taxonomies with practical granularity: policy ambiguity, billing exception, legal request, sensitive personal context, and unresolved technical incident are not interchangeable. Routing logic should reflect this reality. Escalation logs should include whether automation gathered the right context and whether handoff burden was reduced for the receiving team.</p>
<p>When teams treat escalations as learning inputs, automation quality improves without pretending every request should be fully automated.</p>
`,
  `
<h3>7. Reliability playbooks and incident learning</h3>
<p>Incident response quality depends on preparation done before incidents occur. A useful playbook includes detection thresholds, response ownership, user communication templates, rollback options, and post-incident review cadence. Teams that prepare these assets in advance avoid improvising under pressure, which reduces both outage time and secondary mistakes.</p>
<p>Post-incident reviews are most valuable when they focus on system behavior and decision context instead of blame. Questions should include: Which signals were available early? Which assumptions proved false? What made mitigation slower than expected? Which preventive change offers the highest leverage? These questions drive practical fixes and cultural safety at the same time.</p>
<blockquote>Reliability improves when incidents are treated as expensive research, not reputational events to hide.</blockquote>
`,
  `
<h3>8. Latency budgeting for real users</h3>
<p>Latency work should start with user-perceived milestones rather than infrastructure-only metrics. Users care about when they feel progress, when they receive a trustworthy answer, and whether waiting is explained. A team can reduce backend latency but still lose trust if the interface appears frozen or if partial progress is hidden.</p>
<p>Practical latency budgeting allocates time across phases: context fetch, ranking, model generation, tool actions, and formatting. Each phase gets a target and a fallback path. If a phase misses budget, the system should degrade gracefully by returning a scoped response with clear next actions instead of timing out silently.</p>
<p>For long read-aloud workflows, progressive chunk playback follows the same principle: deliver meaningful output early while continuing work in the background.</p>
`,
  `
<h3>9. Cost governance without quality collapse</h3>
<p>Cost governance works when it is proactive, transparent, and connected to quality outcomes. Reactive cost cuts often damage trust because they remove capabilities without revising success criteria. Better practice is to define quality floors first, then optimize architecture and model routing to stay above those floors at lower cost.</p>
<p>Teams should track cost per successful outcome, not only cost per request. This exposes where cheap responses are actually expensive because they trigger retries, escalations, or abandonment. It also highlights where a slightly higher-cost path prevents downstream support load and improves retention.</p>
<p>Healthy governance reports include spend trend, quality trend, and decision rationale so stakeholders can evaluate tradeoffs with full context.</p>
`,
  `
<h3>10. Evaluation cadence and release gates</h3>
<p>Evaluation is most effective as a recurring operational habit, not a one-time certification step. Teams should run pre-release checks, weekly drift reviews, and monthly strategic evaluations. Each layer answers a different question: “Is this safe to ship?”, “Is this still behaving as intended?”, and “Is this still aligned with product goals?”</p>
<p>Release gates should include a balanced set of checks: policy adherence, factual reliability, latency bounds, and user comprehension. A release that passes technical correctness but fails clarity can still generate operational burden. Conversely, a release that is beautifully worded but policy-unsafe is unacceptable.</p>
<ol>
  <li>Define gate thresholds before implementation starts.</li>
  <li>Record exceptions explicitly with time-bounded owners.</li>
  <li>Review gate quality after incidents and major launches.</li>
</ol>
`,
  `
<h3>11. Writing standards for assistant responses</h3>
<p>Response quality in production depends heavily on editorial standards. Teams should define target voice, structure, and brevity guidance for different response types: quick confirmations, complex explanations, sensitive escalations, and instructional walkthroughs. These standards reduce variance across features and make outputs easier to evaluate objectively.</p>
<p>Editorial standards also improve multimodal features such as read-aloud. Clear headings, concise paragraphs, and intentional list structure make spoken output easier to follow. Weak structure forces listeners to infer hierarchy from tone alone, increasing cognitive load and reducing comprehension.</p>
<p>The strongest teams treat writing quality as infrastructure: measured, reviewed, and improved continuously.</p>
`,
  `
<h3>12. Data lifecycle and retention boundaries</h3>
<p>Operational maturity includes clear decisions about what conversational data is retained, for how long, and for which purposes. Teams should document retention classes, deletion guarantees, and access boundaries with concrete ownership. Ambiguity here creates legal risk and erodes internal trust even before external issues surface.</p>
<p>Retention policy should align with debugging needs: enough signal to diagnose issues, not unlimited collection by default. Access controls should reflect least privilege and include audit trails. Teams should routinely test deletion paths, not assume they work because the API returns success.</p>
<p>A clear data lifecycle policy allows teams to innovate quickly without creating unbounded governance debt.</p>
`,
  `
<h3>13. Multi-team operating model</h3>
<p>As AI initiatives expand, delivery rarely stays within one squad. Platform, product, design, policy, legal, support, and analytics all influence outcomes. A multi-team model succeeds when responsibilities are explicit and interfaces are clean. Shared ownership without role clarity often leads to duplicated work, unclear accountability, and slow incident response.</p>
<p>Teams should define service-level expectations between groups: response times for dependency requests, ownership of quality gates, escalation paths for policy uncertainty, and handoff artifacts required for launches. This reduces friction and enables parallel progress without hidden blockers.</p>
<p>Good operating models are boring by design: people know where to go, what to provide, and how decisions are recorded.</p>
`,
  `
<h3>14. Launch communication strategy</h3>
<p>Users judge reliability partly by how changes are communicated. Launch notes should state what changed, who benefits, known limitations, and what to do when behavior looks wrong. Overly promotional communication sets unrealistic expectations and increases disappointment when edge cases appear.</p>
<p>Internal communication is equally important. Sales, support, and operations teams need concise enablement materials that map new behavior to real user questions. When internal teams learn by discovering issues in production, avoidable confusion spreads quickly.</p>
<ul>
  <li>Publish concise release notes with practical examples.</li>
  <li>Share support-ready troubleshooting guidance.</li>
  <li>Record follow-up checkpoints after launch.</li>
</ul>
`,
  `
<h3>15. Training and onboarding for operators</h3>
<p>Systems are only as reliable as the people running them. Operator onboarding should include architectural mental models, common failure signatures, and escalation exercises. Teams should teach not only “which button to press” but also “why this decision path exists,” so operators can reason under novel conditions.</p>
<p>Scenario-based drills are particularly effective: sudden latency spikes, retrieval drift after reindexing, policy trigger false positives, and external provider degradation. Rehearsing these scenarios builds confidence and lowers mean time to recovery when real incidents occur.</p>
<p>Onboarding materials should be continuously updated based on recent incidents and product changes, not treated as static documentation.</p>
`,
  `
<h3>16. Regionalization and language operations</h3>
<p>Global deployments introduce subtle operational complexity. Terminology differs by region, policy expectations vary, and user tolerance for formality shifts across markets. Teams should localize not only output language but also examples, fallback guidance, and escalation instructions.</p>
<p>Read-aloud quality also requires regional awareness. Voice choice, pacing, and pronunciation expectations differ meaningfully. A one-size-fits-all narration profile may be technically acceptable yet perceived as low quality in key markets. Region-aware defaults and override controls improve both comprehension and trust.</p>
<p>Regional operations should include local feedback loops so model and UX tuning reflect real usage rather than assumptions from headquarters.</p>
`,
  `
<h3>17. Security posture for assistant tooling</h3>
<p>Assistant systems frequently touch sensitive workflows, so security posture must be designed in, not bolted on. Teams should harden tool invocation boundaries, sanitize untrusted inputs, and enforce scoped credentials for all backend integrations. Prompt-injection resilience should be tested in realistic scenarios where malicious inputs blend with valid requests.</p>
<p>Operationally, security teams need visibility into high-risk action paths and unusual invocation patterns. Product and engineering teams need practical security guidance that maps directly to their architecture choices. Shared language between these teams prevents “security as afterthought” behaviors.</p>
<p>Strong security posture supports innovation because teams can move quickly within clearly defined safe boundaries.</p>
`,
  `
<h3>18. Governance metrics that executives can use</h3>
<p>Executive reporting should summarize quality, cost, reliability, and risk posture without collapsing nuance. A useful dashboard highlights directional trends, major incidents, key mitigations, and confidence in current operating assumptions. It should support decision-making, not just visibility theater.</p>
<p>Metrics should connect to outcomes leadership cares about: conversion quality, support load, time-to-resolution, and policy incident frequency. Teams should accompany metrics with short narrative context explaining what changed and what actions are planned next.</p>
<blockquote>Good governance metrics reduce surprises because they connect technical signals to business decisions early.</blockquote>
`,
  `
<h3>19. Experimentation discipline at scale</h3>
<p>As teams run more experiments, uncontrolled overlap can hide causal signals. Programs should maintain an experiment registry with hypothesis, target segment, guardrails, and stop conditions. This prevents conflicting changes from landing simultaneously and producing misleading conclusions.</p>
<p>High-quality experiments include pre-registered success metrics and clear interpretation plans. Teams should decide in advance what outcomes trigger rollout, iterate, or rollback. Post-experiment writeups should document not only winners but also null results and lessons learned.</p>
<p>Experiment discipline compounds value by turning each test into reusable organizational knowledge.</p>
`,
  `
<h3>20. Vendor strategy and portability</h3>
<p>Provider capabilities and pricing evolve quickly, so architecture should preserve reasonable portability. Teams should isolate provider-specific assumptions, centralize adapters, and test fallback providers regularly. Portability is not about switching constantly; it is about avoiding lock-in that prevents risk-aware decision-making.</p>
<p>Portability planning should include model evaluation parity, feature compatibility mapping, and operational runbooks for failover scenarios. Teams that delay this work until an outage or pricing shock usually discover migration risk too late.</p>
<p>A pragmatic vendor strategy balances deep optimization for current needs with enough abstraction to keep strategic options open.</p>
`,
  `
<h3>21. Product analytics for trust, not clicks</h3>
<p>Traditional engagement metrics can mask declining trust. Users might click repeatedly because answers are unclear, not because the experience is successful. AI product analytics should include trust-oriented measures: clarification loops, contradiction reports, escalation rates after confident answers, and task completion quality.</p>
<p>Teams should pair behavioral metrics with qualitative sampling. Reading real conversations exposes tone issues, context misses, and interaction friction that aggregate charts cannot fully capture. This mixed-method approach helps teams prioritize improvements that users actually feel.</p>
<p>When trust metrics improve, downstream outcomes such as retention and referral often improve as a consequence.</p>
`,
  `
<h3>22. Design systems for assistant interfaces</h3>
<p>Assistant UI patterns benefit from a dedicated design system layer: response containers, citation blocks, uncertainty indicators, correction affordances, and escalation cards. Consistent components reduce cognitive load for users and implementation complexity for teams.</p>
<p>Read-aloud experiences should also align with design-system thinking. Controls, highlight treatments, and progress cues should feel coherent across pages. Inconsistency between article views creates confusion and undermines confidence in what state the player is currently in.</p>
<p>Design systems evolve through feedback from real usage. Teams should treat them as living assets with clear ownership and release discipline.</p>
`,
  `
<h3>23. What teams usually get wrong in year two</h3>
<p>Year one focuses on proving value; year two tests operational depth. Common mistakes include expanding scope faster than governance, ignoring documentation debt, over-optimizing benchmarks at the expense of user clarity, and underfunding monitoring improvements. These issues are rarely visible in early demos but become painful at scale.</p>
<p>Teams that navigate year two well keep fundamentals visible: explicit ownership, clear release gates, grounded metrics, and disciplined incident learning. They resist the urge to chase every new capability without integration planning.</p>
<p>Maturity is not about moving slower. It is about reducing unforced errors so speed remains sustainable.</p>
`,
  `
<h3>24. Closing operating checklist</h3>
<p>A long-form operating checklist helps teams audit readiness before major launches and during quarterly reviews. It should cover principles, architecture, reliability, escalation, evaluation, governance, and training. The goal is not perfection; it is to surface hidden assumptions early enough to act.</p>
<ol>
  <li>Can we explain why each major default exists?</li>
  <li>Can we detect and diagnose failures quickly?</li>
  <li>Can users recover momentum when uncertainty appears?</li>
  <li>Can internal teams support releases without confusion?</li>
  <li>Can leadership evaluate risk with current evidence?</li>
</ol>
<p>Teams that can answer these questions with concrete artifacts usually operate AI programs with more confidence and less drama. Long-form operational writing then becomes not a side activity, but a core capability that keeps execution coherent as complexity grows.</p>
`,
];

function buildLargeOperationsPost() {
  const sections = LARGE_OPERATIONS_SECTIONS.join("\n");
  return `
<h2>Operating Reliable AI Programs at Long-Form Scale</h2>
<p>This long-form article is intentionally large so teams can validate read-aloud startup latency, chunk transitions, highlighting continuity, and auto-scroll behavior over sustained playback. Each section is intentionally different in structure and focus so visual and spoken progression are easy to verify during testing.</p>
${sections}
<h3>Closing Synthesis</h3>
<p>The operating advantage comes from compounding clarity: clear defaults, clear ownership, clear evidence, and clear user-facing behavior. When these foundations are present, teams can scale assistant experiences without losing reliability or trust.</p>
`;
}

const BLOG_POSTS: BlogPost[] = [
  {
    slug: "designing-a-clear-onboarding-flow",
    title: "Designing a Clear Onboarding Flow",
    excerpt:
      "A practical framework for improving first-session activation with fewer screens and sharper prompts.",
    content: `
<h2>Why onboarding needs restraint</h2>
<p>Great onboarding should remove friction, not introduce ceremony. Teams often over-explain too early and lose momentum before value appears.</p>
<p>Our principle is simple: <strong>show the first win quickly</strong>, then educate progressively.</p>

<h3>A practical sequence</h3>
<ol>
  <li><strong>Set intent</strong> with one short question.</li>
  <li><em>Deliver one useful result</em> in under 90 seconds.</li>
  <li>Offer optional guidance only after confidence increases.</li>
</ol>

<blockquote>People commit to products when they feel progress, not when they read documentation.</blockquote>

<p>For teams shipping assistant experiences, this means strong defaults, short copy, and clear next actions. For a deeper playbook, review our <a href="https://example.com/onboarding-guide" target="_blank" rel="noopener noreferrer">onboarding checklist</a>.</p>
`,
  },
  {
    slug: "from-support-to-proactive-assistance",
    title: "From Support to Proactive Assistance",
    excerpt:
      "How product teams evolve from reactive ticket handling to proactive, context-aware customer help.",
    content: `
<h2>Move from response to anticipation</h2>
<p>Support workflows are often reactive by design. A proactive assistant can surface likely next steps before users open a ticket.</p>

<h3>Signals worth using</h3>
<ul>
  <li>Recent account activity and feature adoption trends</li>
  <li>Repeated help-center searches in the same session</li>
  <li>Stalled workflows or abandoned setup steps</li>
</ul>

<p>When signals are clear, the assistant can present concise guidance in-line. Keep interventions lightweight and relevant to the user’s current goal.</p>

<blockquote>Proactive guidance works best when it feels helpful, not intrusive.</blockquote>

<p>A good starting point is to map your top three failure points and ship one targeted assistant flow for each.</p>
`,
  },
  {
    slug: "operating-ai-programs-at-long-form-scale",
    title: "Operating AI Programs at Long-Form Scale",
    excerpt:
      "A deliberately long article used to validate read-aloud highlighting, auto-scroll, and large-content handling under realistic structure.",
    content: buildLargeOperationsPost(),
  },
  {
    slug: "editorial-ux-for-ai-products",
    title: "Editorial UX for AI Products",
    excerpt:
      "Applying editorial discipline to AI interfaces: tone, hierarchy, rhythm, and readability that builds trust.",
    content: `
<h2>Editorial thinking improves product trust</h2>
<p>AI responses are content surfaces. If the writing hierarchy is weak, confidence drops even when answers are correct.</p>

<h3>What strong editorial UX looks like</h3>
<ul>
  <li>Clear sectioning and predictable heading scales</li>
  <li>Intentional use of <strong>bold emphasis</strong> and <em>subtle contrast</em></li>
  <li>Readable line lengths and breathing room between ideas</li>
</ul>

<p>These basics make interfaces feel calm and competent. They also make features like <strong>Read Aloud</strong> easier to adopt because content structure is already clean.</p>

<p>As a final pass, audit every article for clarity and consistency. Editorial quality compounds over time.</p>
`,
  },
];

export function getBlogPosts() {
  return BLOG_POSTS.map(({ slug, title, excerpt }) => ({ slug, title, excerpt }));
}

export function getBlogPostBySlug(slug: string) {
  return BLOG_POSTS.find((post) => post.slug === slug) || null;
}

export function stripHtml(input: string) {
  return String(input || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
