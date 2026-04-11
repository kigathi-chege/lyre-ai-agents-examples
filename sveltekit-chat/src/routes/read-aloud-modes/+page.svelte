<script lang="ts">
  export let data: {
    posts: Array<{ slug: string; title: string; excerpt: string }>;
    modes: Array<{ id: string; title: string; description: string }>;
  };

  const longPostSlug = "operating-ai-programs-at-long-form-scale";
</script>

<svelte:head>
  <title>Read-Aloud Modes | Lyre Agents SvelteKit Example</title>
</svelte:head>

<main class="min-h-screen bg-slate-50">
  <div class="mx-auto max-w-6xl px-6 py-12 md:py-16">
    <a
      href="/"
      class="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
    >
      <span aria-hidden="true">←</span>
      Back home
    </a>

    <header class="mt-7">
      <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        Mode Lab
      </p>
      <h1 class="mt-3 text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
        Read-Aloud Mode Demos
      </h1>
      <p class="mt-4 max-w-3xl text-base leading-relaxed text-slate-600">
        `/articles` remains the minimal direct OpenAI demo. This page gives dedicated routes for the other documented modes.
      </p>
    </header>

    <section class="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {#each data.modes as mode}
        <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="text-lg font-semibold text-slate-900">{mode.title}</h2>
          <p class="mt-2 text-sm text-slate-600">{mode.description}</p>
          <a
            href={`/read-aloud-modes/${mode.id}/${longPostSlug}`}
            class="mt-4 inline-flex items-center gap-2 text-sm font-medium text-slate-900 hover:text-slate-700"
          >
            Test long post
            <span aria-hidden="true">→</span>
          </a>
        </article>
      {/each}
    </section>

    <section class="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 class="text-lg font-semibold text-slate-900">All Posts Quick Links</h2>
      <div class="mt-4 space-y-4">
        {#each data.posts as post}
          <div class="border-b border-slate-100 pb-4 last:border-b-0 last:pb-0">
            <p class="font-medium text-slate-900">{post.title}</p>
            <p class="mt-1 text-sm text-slate-600">{post.excerpt}</p>
            <div class="mt-2 flex flex-wrap gap-2 text-xs">
              {#each data.modes as mode}
                <a
                  href={`/read-aloud-modes/${mode.id}/${post.slug}`}
                  class="rounded-full border border-slate-300 px-3 py-1 text-slate-700 hover:bg-slate-100"
                >
                  {mode.id}
                </a>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    </section>
  </div>
</main>

