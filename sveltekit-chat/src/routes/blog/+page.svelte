<script lang="ts">
  export let data: {
    posts: Array<{
      slug: string;
      title: string;
      excerpt: string;
    }>;
  };
</script>

<svelte:head>
  <title>Blog | Lyre Agents SvelteKit Example</title>
</svelte:head>

<main class="min-h-screen bg-slate-50">
  <div class="mx-auto max-w-6xl px-6 py-12 md:py-16">
    <header class="mb-10 md:mb-14">
      <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Editorial Demo</p>
      <h1 class="mt-3 text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">Product Blog</h1>
      <p class="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg">
        A minimal blog surface to test rich content rendering and read-aloud behavior with the local
        <code class="rounded bg-slate-200 px-1 py-0.5 text-sm">@kigathi/ai-agents</code> package.
      </p>
    </header>

    <section class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {#each data.posts as post}
        <article class="group rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <h2 class="text-xl font-semibold tracking-tight text-slate-900">{post.title}</h2>
          <p class="mt-4 text-sm leading-7 text-slate-600">{post.excerpt}</p>

          <a
            href={`/blog/${post.slug}`}
            class="mt-6 inline-flex items-center gap-2 text-sm font-medium text-slate-900 transition group-hover:text-slate-700"
          >
            Open article
            <span aria-hidden="true">→</span>
          </a>
        </article>
      {/each}
    </section>
  </div>
</main>
