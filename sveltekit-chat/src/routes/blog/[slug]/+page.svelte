<script lang="ts">
  import { onMount } from "svelte";
  import {
    attachReadAloud,
    READ_ALOUD_DEFAULTS,
  } from "@kigathi/ai-agents/browser";

  type ReadState = "idle" | "loading" | "playing" | "error";

  type VoiceOption = {
    name: string;
    lang: string;
    default: boolean;
  };

  const DEFAULT_INSTRUCTIONS = READ_ALOUD_DEFAULTS.instructions;

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

  let voices: VoiceOption[] = [];
  let voiceName = READ_ALOUD_DEFAULTS.speechOptions.voiceName;
  let rate = READ_ALOUD_DEFAULTS.speechOptions.rate;
  let pitch = READ_ALOUD_DEFAULTS.speechOptions.pitch;
  let volume = READ_ALOUD_DEFAULTS.speechOptions.volume;
  let instructions = DEFAULT_INSTRUCTIONS;

  let controller: ReturnType<typeof attachReadAloud> | null = null;

  let statePoller: number | null = null;

  function syncReadState() {
    if (!controller) return;

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
      content: "#blog-read-content",
      trigger: "#read-aloud-trigger",
      instructions,
      speechOptions: {
        voiceName: voiceName || undefined,
        rate,
        pitch,
        volume,
      },
    });

    readState = "idle";
    readError = "";
  }

  function refreshVoices() {
    const raw = window.speechSynthesis?.getVoices?.() || [];
    voices = raw.map((voice) => ({
      name: voice.name,
      lang: voice.lang,
      default: voice.default,
    }));

    if (voices.length) {
      const hasSelectedVoice = voices.some((voice) => voice.name === voiceName);
      if (!hasSelectedVoice) {
        const enUS = voices.find((voice) => voice.lang === "en-US");
        const fallback = voices.find((voice) => voice.default) || enUS || voices[0];
        voiceName = fallback.name;
      }
    }
  }

  function applyVoiceSettings() {
    try {
      createController();
    } catch (error: any) {
      readState = "error";
      readError = error?.message || "Unable to apply voice settings.";
    }
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
      refreshVoices();
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = () => {
          refreshVoices();
        };
      }

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

      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }

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
  <title>{data.post.title} | Lyre Agents Blog Demo</title>
</svelte:head>

<main class="min-h-screen bg-slate-50">
  <div class="mx-auto max-w-4xl px-6 py-12 md:py-16">
    <a
      href="/blog"
      class="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
    >
      <span aria-hidden="true">←</span>
      Back to blog
    </a>

    <header
      class="mt-7 rounded-2xl border border-slate-200 bg-white px-6 py-7 shadow-sm md:px-8"
    >
      <p
        class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500"
      >
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
          id="read-aloud-trigger"
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

      <div
        class="mt-6 grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-4"
      >
        <label
          class="flex flex-col gap-1 text-xs font-medium uppercase tracking-[0.12em] text-slate-500"
        >
          Voice
          <select
            bind:value={voiceName}
            class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-700"
          >
            {#each voices as voice}
              <option value={voice.name}>{voice.name} ({voice.lang})</option>
            {/each}
          </select>
        </label>

        <label
          class="flex flex-col gap-1 text-xs font-medium uppercase tracking-[0.12em] text-slate-500"
        >
          Speed
          <input
            bind:value={rate}
            type="range"
            min="0.7"
            max="1.2"
            step="0.02"
            class="accent-slate-700"
          />
          <span class="text-xs normal-case tracking-normal text-slate-600"
            >{rate.toFixed(2)}x</span
          >
        </label>

        <label
          class="flex flex-col gap-1 text-xs font-medium uppercase tracking-[0.12em] text-slate-500"
        >
          Pitch
          <input
            bind:value={pitch}
            type="range"
            min="0.8"
            max="1.2"
            step="0.02"
            class="accent-slate-700"
          />
          <span class="text-xs normal-case tracking-normal text-slate-600"
            >{pitch.toFixed(2)}</span
          >
        </label>

        <div class="flex items-end">
          <button
            type="button"
            on:click={applyVoiceSettings}
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Apply voice
          </button>
        </div>
      </div>

      <label
        class="mt-4 flex flex-col gap-2 text-xs font-medium uppercase tracking-[0.12em] text-slate-500"
      >
        Narration instructions
        <textarea
          bind:value={instructions}
          rows={3}
          class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-700"
          placeholder="Add custom narration instructions"
        ></textarea>
        <span class="text-xs normal-case tracking-normal text-slate-500">
          Used by OpenAI-backed narration when an endpoint is configured.
        </span>
      </label>
    </header>

    <article
      id="blog-read-content"
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
