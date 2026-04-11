<script lang="ts">
  import { onMount } from "svelte";
  import { env as publicEnv } from "$env/dynamic/public";
  import { attachReadAloud, createClient } from "@kigathi/ai-agents";

  type ReadState = "idle" | "loading" | "playing" | "error";
  type BaseMode =
    | "browser"
    | "endpoint"
    | "data-api"
    | "datasource-api"
    | "data-direct"
    | "datasource-direct";
  type Variant = "minimal" | "full";

  export let data: {
    mode: string;
    post: {
      slug: string;
      title: string;
      excerpt: string;
      content: string;
      textContent: string;
    };
  };

  function resolveMode(mode: string): { baseMode: BaseMode; variant: Variant } {
    if (mode.endsWith("-full")) {
      return { baseMode: mode.slice(0, -5) as BaseMode, variant: "full" };
    }
    return { baseMode: mode.replace(/-minimal$/, "") as BaseMode, variant: "minimal" };
  }

  const { baseMode, variant } = resolveMode(data.mode);
  const isFull = variant === "full";
  const modeLabel = `${baseMode} (${variant})`;

  const browserDemoApiKey = String(publicEnv.PUBLIC_OPENAI_API_KEY || "").trim();
  const browserDemoSdk = createClient({
    apiKey: browserDemoApiKey,
    maxRetries: 0,
  });

  let controller: ReturnType<typeof attachReadAloud> | null = null;
  let statePoller: number | null = null;
  let readState: ReadState = "idle";
  let readError = "";
  let initializing = false;
  let useManualToggle = baseMode === "data-api" || baseMode === "data-direct";
  let showFloatingTrigger = false;
  let triggerObserver: IntersectionObserver | null = null;
  let primaryTriggerEl: HTMLButtonElement | null = null;

  let instructions = "Custom narration instructions...";
  let speechRate = 0.96;
  let speechPitch = 1.0;
  let speechVolume = 1.0;
  let highlightColor = "#fde68a";
  let highlightTextColor = "inherit";
  let highlightRadius = "0.6em";
  let highlightPadding = "0.04em 0.24em";
  let progressiveEnabled = true;
  let maxChunkChars = 1600;
  let prefetchAhead = 1;
  let retryCount = 0;
  let retryDelayMs = 700;
  let autoScrollEnabled = true;
  let autoScrollBehavior: "smooth" | "auto" = "smooth";
  let autoScrollBlock: "center" | "start" | "end" = "center";
  let autoScrollMarginRatio = 0.24;
  let autoScrollThrottleMs = 96;
  const optionsStorageKey = `read_aloud_mode_options:${baseMode}:${variant}`;

  function saveFullOptions() {
    if (!isFull || typeof localStorage === "undefined") return;
    const payload = {
      instructions,
      speechRate,
      speechPitch,
      speechVolume,
      highlightColor,
      highlightTextColor,
      highlightRadius,
      highlightPadding,
      progressiveEnabled,
      maxChunkChars,
      prefetchAhead,
      retryCount,
      retryDelayMs,
      autoScrollEnabled,
      autoScrollBehavior,
      autoScrollBlock,
      autoScrollMarginRatio,
      autoScrollThrottleMs,
    };
    localStorage.setItem(optionsStorageKey, JSON.stringify(payload));
  }

  function loadFullOptions() {
    if (!isFull || typeof localStorage === "undefined") return;
    try {
      const raw = localStorage.getItem(optionsStorageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      instructions = String(parsed.instructions ?? instructions);
      speechRate = Number(parsed.speechRate ?? speechRate);
      speechPitch = Number(parsed.speechPitch ?? speechPitch);
      speechVolume = Number(parsed.speechVolume ?? speechVolume);
      highlightColor = String(parsed.highlightColor ?? highlightColor);
      highlightTextColor = String(parsed.highlightTextColor ?? highlightTextColor);
      highlightRadius = String(parsed.highlightRadius ?? highlightRadius);
      highlightPadding = String(parsed.highlightPadding ?? highlightPadding);
      progressiveEnabled = Boolean(parsed.progressiveEnabled ?? progressiveEnabled);
      maxChunkChars = Number(parsed.maxChunkChars ?? maxChunkChars);
      prefetchAhead = Number(parsed.prefetchAhead ?? prefetchAhead);
      retryCount = Number(parsed.retryCount ?? retryCount);
      retryDelayMs = Number(parsed.retryDelayMs ?? retryDelayMs);
      autoScrollEnabled = Boolean(parsed.autoScrollEnabled ?? autoScrollEnabled);
      autoScrollBehavior = parsed.autoScrollBehavior === "auto" ? "auto" : "smooth";
      autoScrollBlock =
        parsed.autoScrollBlock === "start" || parsed.autoScrollBlock === "end"
          ? parsed.autoScrollBlock
          : "center";
      autoScrollMarginRatio = Number(parsed.autoScrollMarginRatio ?? autoScrollMarginRatio);
      autoScrollThrottleMs = Number(parsed.autoScrollThrottleMs ?? autoScrollThrottleMs);
    } catch {
      // ignore invalid saved settings
    }
  }

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

  function buildAttachSharedOptions() {
    const base: Record<string, any> = {
      content: "#mode-read-content",
      trigger: "#mode-read-trigger",
    };

    if (!isFull) return base;

    return {
      ...base,
      instructions,
      highlight: {
        mode: "css",
        color: highlightColor,
        textColor: highlightTextColor,
        radius: highlightRadius,
        padding: highlightPadding,
      },
      progressive: {
        enabled: progressiveEnabled,
        maxChunkChars,
        prefetchAhead,
        retryCount,
        retryDelayMs,
      },
      autoScroll: {
        enabled: autoScrollEnabled,
        behavior: autoScrollBehavior,
        block: autoScrollBlock,
        marginRatio: autoScrollMarginRatio,
        throttleMs: autoScrollThrottleMs,
      },
      speechOptions: {
        rate: speechRate,
        pitch: speechPitch,
        volume: speechVolume,
      },
    };
  }

  async function fetchSpeechPayload() {
    const response = await fetch("/api/read-aloud", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: data.post.textContent,
        instructions: isFull ? instructions : undefined,
      }),
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload?.message || `API request failed (${response.status}).`);
    }
    return await response.json();
  }

  async function fetchSpeechPayloadDirect() {
    if (!browserDemoApiKey) {
      throw new Error("PUBLIC_OPENAI_API_KEY is missing for direct browser mode.");
    }
    return await browserDemoSdk.tts.speak({
      text: data.post.textContent,
      instructions: isFull ? instructions : undefined,
    });
  }

  async function ensureController() {
    if (controller || initializing) return;
    initializing = true;
    readError = "";

    try {
      const shared = buildAttachSharedOptions();

      if (baseMode === "browser") {
        controller = attachReadAloud(shared);
        useManualToggle = false;
        return;
      }

      if (baseMode === "endpoint") {
        controller = attachReadAloud({
          ...shared,
          endpoint: "/api/read-aloud",
        });
        useManualToggle = false;
        return;
      }

      if (baseMode === "datasource-api") {
        controller = attachReadAloud({
          ...shared,
          dataSource: async ({ text, chunk_index, total_chunks, instructions }) => {
            const response = await fetch("/api/read-aloud", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                text,
                chunk_index,
                total_chunks,
                instructions,
              }),
            });
            if (!response.ok) {
              const payload = await response.json().catch(() => ({}));
              throw new Error(payload?.message || `Chunk failed (${response.status}).`);
            }
            return await response.json();
          },
        });
        useManualToggle = false;
        return;
      }

      if (baseMode === "datasource-direct") {
        if (!browserDemoApiKey) {
          throw new Error("PUBLIC_OPENAI_API_KEY is missing for direct browser mode.");
        }
        controller = attachReadAloud({
          ...shared,
          dataSource: async ({ text }) => {
            return await browserDemoSdk.tts.speak({
              text,
              instructions: isFull ? instructions : undefined,
            });
          },
        });
        useManualToggle = false;
        return;
      }

      if (baseMode === "data-api") {
        const payload = await fetchSpeechPayload();
        controller = attachReadAloud({
          ...shared,
          data: payload,
        });
        useManualToggle = false;
        return;
      }

      if (baseMode === "data-direct") {
        const payload = await fetchSpeechPayloadDirect();
        controller = attachReadAloud({
          ...shared,
          data: payload,
        });
        useManualToggle = false;
      }
    } finally {
      initializing = false;
    }
  }

  async function rebuildController() {
    controller?.destroy();
    controller = null;
    readState = "idle";
    readError = "";
    useManualToggle = baseMode === "data-api" || baseMode === "data-direct";
    if (!useManualToggle) {
      await ensureController();
    }
    saveFullOptions();
  }

  async function toggleReadAloud() {
    try {
      if (!controller) {
        readState = "loading";
        await ensureController();
      }
      if (!controller) {
        throw new Error("Read-aloud controller could not be initialized.");
      }
      await controller.toggle();
      syncReadState();
    } catch (error: any) {
      readState = "error";
      readError = error?.message || "Unable to toggle read-aloud.";
    }
  }

  onMount(() => {
    loadFullOptions();

    if (baseMode !== "data-api" && baseMode !== "data-direct") {
      ensureController().catch((error: any) => {
        readState = "error";
        readError = error?.message || "Unable to initialize read-aloud.";
      });
    }

    if (typeof IntersectionObserver !== "undefined" && primaryTriggerEl) {
      triggerObserver = new IntersectionObserver(
        ([entry]) => {
          showFloatingTrigger = !entry.isIntersecting;
        },
        { threshold: 0.08 },
      );
      triggerObserver.observe(primaryTriggerEl);
    }

    statePoller = window.setInterval(syncReadState, 120);
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

  $: if (isFull) {
    saveFullOptions();
  }

  $: readLabel =
    readState === "loading"
      ? "Preparing..."
      : readState === "playing"
        ? "Pause"
        : "Read Aloud";
</script>

<svelte:head>
  <title>{data.post.title} | {modeLabel}</title>
</svelte:head>

<main class="min-h-screen bg-slate-50">
  <div class="mx-auto max-w-4xl px-6 py-12 md:py-16">
    <a
      href="/read-aloud-modes"
      class="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
    >
      <span aria-hidden="true">←</span>
      Back to mode demos
    </a>

    <header class="mt-7 rounded-2xl border border-slate-200 bg-white px-6 py-7 shadow-sm md:px-8">
      <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        {modeLabel}
      </p>
      <h1 class="mt-3 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
        {data.post.title}
      </h1>
      <p class="mt-4 max-w-3xl text-base leading-relaxed text-slate-600">
        {data.post.excerpt}
      </p>

      <div class="mt-7 flex flex-wrap items-center gap-3">
        <button
          bind:this={primaryTriggerEl}
          id="mode-read-trigger"
          type="button"
          on:click={useManualToggle ? toggleReadAloud : undefined}
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

      {#if isFull}
        <div class="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Full Mode Controls
          </p>
          <div class="mt-3 space-y-4">
            <label class="text-xs font-medium uppercase tracking-[0.1em] text-slate-500">
              Instructions
              <textarea
                bind:value={instructions}
                rows={3}
                class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-700"
              ></textarea>
            </label>

            <div class="grid gap-2 md:grid-cols-2">
              <label class="text-xs font-medium uppercase tracking-[0.1em] text-slate-500">
                Highlight Color
                <input bind:value={highlightColor} class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm normal-case" />
              </label>
              <label class="text-xs font-medium uppercase tracking-[0.1em] text-slate-500">
                Text Color
                <input bind:value={highlightTextColor} class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm normal-case" />
              </label>
              <label class="text-xs font-medium uppercase tracking-[0.1em] text-slate-500">
                Radius
                <input bind:value={highlightRadius} class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm normal-case" />
              </label>
              <label class="text-xs font-medium uppercase tracking-[0.1em] text-slate-500">
                Padding
                <input bind:value={highlightPadding} class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm normal-case" />
              </label>
            </div>

            <div class="flex flex-wrap gap-5">
              <label class="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.1em] text-slate-600">
                <input bind:checked={progressiveEnabled} type="checkbox" class="h-4 w-4 rounded border-slate-300 accent-slate-700" />
                Progressive Enabled
              </label>
              <label class="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.1em] text-slate-600">
                <input bind:checked={autoScrollEnabled} type="checkbox" class="h-4 w-4 rounded border-slate-300 accent-slate-700" />
                Auto Scroll Enabled
              </label>
            </div>

            <div class="grid gap-2 md:grid-cols-2">
              <label class="text-xs font-medium uppercase tracking-[0.1em] text-slate-500">
                Max Chunk Chars
                <input bind:value={maxChunkChars} type="number" class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm normal-case" />
              </label>
              <label class="text-xs font-medium uppercase tracking-[0.1em] text-slate-500">
                Prefetch Ahead
                <input bind:value={prefetchAhead} type="number" class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm normal-case" />
              </label>
              <label class="text-xs font-medium uppercase tracking-[0.1em] text-slate-500">
                Retry Count
                <input bind:value={retryCount} type="number" class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm normal-case" />
              </label>
              <label class="text-xs font-medium uppercase tracking-[0.1em] text-slate-500">
                Retry Delay (ms)
                <input bind:value={retryDelayMs} type="number" class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm normal-case" />
              </label>
            </div>

            <div class="grid gap-2 md:grid-cols-2">
              <label class="text-xs font-medium uppercase tracking-[0.1em] text-slate-500">
                Scroll Behavior
                <select bind:value={autoScrollBehavior} class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm normal-case">
                  <option value="smooth">smooth</option>
                  <option value="auto">auto</option>
                </select>
              </label>
              <label class="text-xs font-medium uppercase tracking-[0.1em] text-slate-500">
                Scroll Block
                <select bind:value={autoScrollBlock} class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm normal-case">
                  <option value="center">center</option>
                  <option value="start">start</option>
                  <option value="end">end</option>
                </select>
              </label>
              <label class="text-xs font-medium uppercase tracking-[0.1em] text-slate-500">
                Margin Ratio
                <input bind:value={autoScrollMarginRatio} type="number" step="0.01" class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm normal-case" />
              </label>
              <label class="text-xs font-medium uppercase tracking-[0.1em] text-slate-500">
                Throttle (ms)
                <input bind:value={autoScrollThrottleMs} type="number" class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm normal-case" />
              </label>
            </div>

            <div class="grid gap-2 md:grid-cols-3">
              <label class="text-xs font-medium uppercase tracking-[0.1em] text-slate-500">
                Speech Rate
                <input bind:value={speechRate} type="number" step="0.01" class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm normal-case" />
              </label>
              <label class="text-xs font-medium uppercase tracking-[0.1em] text-slate-500">
                Speech Pitch
                <input bind:value={speechPitch} type="number" step="0.01" class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm normal-case" />
              </label>
              <label class="text-xs font-medium uppercase tracking-[0.1em] text-slate-500">
                Speech Volume
                <input bind:value={speechVolume} type="number" step="0.01" class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm normal-case" />
              </label>
            </div>
          </div>
          <button
            type="button"
            on:click={rebuildController}
            class="mt-4 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Apply full settings
          </button>
        </div>
      {/if}
    </header>

    <article
      id="mode-read-content"
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
        class="fixed bottom-24 right-4 z-40 inline-flex items-center gap-2 rounded-full border border-slate-300 bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-200 disabled:text-slate-500"
      >
        {readLabel}
      </button>
    {/if}
  </div>
</main>
