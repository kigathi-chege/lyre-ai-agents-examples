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
  <title>Articles | Lyre Agents SvelteKit Example</title>
</svelte:head>

<main class="min-h-screen bg-slate-50">
  <div class="mx-auto max-w-6xl px-6 py-12 md:py-16">
    <header class="mb-10 md:mb-14">
      <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        OpenAI Narration Demo
      </p>
      <h1
        class="mt-3 text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl"
      >
        Articles
      </h1>
      <p class="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg">
        Same content as the blog route, with OpenAI-backed read aloud enabled by
        default.
      </p>
    </header>

    <section class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {#each data.posts as post}
        <article
          class="group rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <h2 class="text-xl font-semibold tracking-tight text-slate-900">
            {post.title}
          </h2>
          <p class="mt-4 text-sm leading-7 text-slate-600">{post.excerpt}</p>

          <a
            href={`/articles/${post.slug}`}
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
