<script lang="ts">
  import { onMount } from "svelte";
  import { env as publicEnv } from "$env/dynamic/public";
  import { attachReadAloud, createClient } from "@kigathi/ai-agents";

  type ReadState = "idle" | "loading" | "playing" | "error";

  export let data: {
    post: {
      slug: string;
      title: string;
      excerpt: string;
      content: string;
      textContent: string;
    };
  };

  let readState: ReadState = "idle";
  let readError = "";
  let showFloatingTrigger = false;
  let triggerObserver: IntersectionObserver | null = null;
  let primaryTriggerEl: HTMLButtonElement | null = null;

  let controller: ReturnType<typeof attachReadAloud> | null = null;
  let statePoller: number | null = null;

  const browserDemoApiKey = String(publicEnv.PUBLIC_OPENAI_API_KEY || "").trim();
  const browserDemoSdk = createClient({
    apiKey: browserDemoApiKey,
    maxRetries: 0,
  });

  function syncReadState() {
    if (!controller) return;

    const controllerError = controller.state.error;
    if (controllerError?.message) {
      readState = "error";
      readError = controllerError.message;
      return;
    }

    if (controller.state.loading) {
      readState = "loading";
    } else if (controller.state.playing) {
      readState = "playing";
    } else if (readState !== "error") {
      readState = "idle";
    }
  }

  function createController() {
    controller?.destroy();

    controller = attachReadAloud({
      content: "#read-content",
      trigger: "#read-trigger",
      dataSource: async ({ text }) => {
        return await browserDemoSdk.tts.speak({ text });
      },
    });

    readState = "idle";
    readError = "";
  }

  async function toggleReadAloud() {
    if (!controller) return;
    try {
      await controller.toggle();
      syncReadState();
    } catch (error: any) {
      readState = "error";
      readError = error?.message || "Unable to toggle read-aloud.";
    }
  }

  onMount(() => {
    try {
      createController();
      statePoller = window.setInterval(syncReadState, 120);

      if (typeof IntersectionObserver !== "undefined" && primaryTriggerEl) {
        triggerObserver = new IntersectionObserver(
          ([entry]) => {
            showFloatingTrigger = !entry.isIntersecting;
          },
          { threshold: 0.08 },
        );
        triggerObserver.observe(primaryTriggerEl);
      }
    } catch (error: any) {
      readState = "error";
      readError =
        error?.message || "Read aloud is not available in this browser.";
    }

    return () => {
      if (statePoller !== null) {
        window.clearInterval(statePoller);
      }
      triggerObserver?.disconnect();
      triggerObserver = null;
      showFloatingTrigger = false;

      controller?.destroy();
    };
  });

  $: readLabel =
    readState === "loading"
      ? "Preparing..."
      : readState === "playing"
        ? "Pause"
        : "Read Aloud";
</script>

<svelte:head>
  <title>{data.post.title} | Lyre Agents Articles Demo</title>
</svelte:head>

<main class="min-h-screen bg-slate-50">
  <div class="mx-auto max-w-4xl px-6 py-12 md:py-16">
    <a
      href="/articles"
      class="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
    >
      <span aria-hidden="true">←</span>
      Back to articles
    </a>

    <header
      class="mt-7 rounded-2xl border border-slate-200 bg-white px-6 py-7 shadow-sm md:px-8"
    >
      <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        Article
      </p>
      <h1
        class="mt-3 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl"
      >
        {data.post.title}
      </h1>
      <p class="mt-4 max-w-3xl text-base leading-relaxed text-slate-600">
        {data.post.excerpt}
      </p>

      <div class="mt-7 flex flex-wrap items-center gap-3">
        <button
          bind:this={primaryTriggerEl}
          id="read-trigger"
          type="button"
          disabled={readState === "error"}
          class="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-200 disabled:text-slate-500"
        >
          {readLabel}
        </button>

        <span class="text-sm text-slate-500" aria-live="polite">
          {#if readState === "playing"}
            Reading article aloud
          {:else if readState === "loading"}
            Preparing narration
          {:else if readState === "error"}
            {readError}
          {:else}
            Ready
          {/if}
        </span>
      </div>
      <p class="mt-4 text-xs text-amber-700">
        Demo-only mode: OpenAI key is loaded in the browser and visible in
        client traffic/devtools.
      </p>
    </header>

    <article
      id="read-content"
      class="mt-8 rounded-2xl border border-slate-200 bg-white px-6 py-9 shadow-sm md:px-10"
    >
      <div class="blog-prose">
        {@html data.post.content}
      </div>
    </article>

    {#if showFloatingTrigger}
      <button
        type="button"
        on:click={toggleReadAloud}
        disabled={readState === "error"}
        class="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full border border-slate-300 bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-200 disabled:text-slate-500"
      >
        {readLabel}
      </button>
    {/if}
  </div>
</main>
