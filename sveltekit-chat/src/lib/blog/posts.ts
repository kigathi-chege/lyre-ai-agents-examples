export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
};

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
