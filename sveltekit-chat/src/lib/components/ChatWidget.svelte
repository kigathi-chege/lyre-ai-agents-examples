<script lang="ts">
  import { onMount } from "svelte";

  type ChatMessage = { role: "assistant" | "user"; text: string };

  let isOpen = false;
  let isSending = false;
  let input = "";
  let useStreaming = true;
  let statusText = "";
  let lastReplyingTo: string | null = null;
  let conversationId: number | null = null;
  let messages: ChatMessage[] = [
    { role: "assistant", text: "Hi, how can I help you today?" },
  ];

  onMount(() => {
    conversationId =
      Number(localStorage.getItem("sveltekit_chat_conversation_id")) || null;
  });

  async function sendMessage() {
    const text = input.trim();
    if (!text || isSending) return;

    input = "";
    messages = [...messages, { role: "user", text }];
    isSending = true;
    statusText = "Preprocessing context...";

    try {
      if (useStreaming) {
        await sendStream(text);
      } else {
        await sendRun(text);
      }
    } catch (error: any) {
      messages = [
        ...messages,
        { role: "assistant", text: error?.message || "Network error." },
      ];
    } finally {
      isSending = false;
      statusText = "";
    }
  }

  async function sendRun(text: string) {
    statusText = "Calling model...";
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: text,
        conversation_id: conversationId,
        replying_to: lastReplyingTo,
        metadata: { session_source: "widget" },
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      messages = [
        ...messages,
        { role: "assistant", text: data?.message || "Request failed." },
      ];
      return;
    }

    if (data?.conversation_id) {
      conversationId = Number(data.conversation_id);
      localStorage.setItem(
        "sveltekit_chat_conversation_id",
        String(conversationId),
      );
    }

    if (data?.response_id) {
      lastReplyingTo = data.response_id;
    } else if (data?.output_message_id) {
      lastReplyingTo = data.output_message_id;
    }

    messages = [
      ...messages,
      { role: "assistant", text: data?.output_text || "No response text returned." },
    ];
  }

  async function sendStream(text: string) {
    const response = await fetch("/api/chat/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: text,
        conversation_id: conversationId,
        replying_to: lastReplyingTo,
        metadata: { session_source: "widget" },
      }),
    });

    if (!response.ok || !response.body) {
      const body = await response.text();
      throw new Error(body || "Streaming request failed.");
    }

    const assistantIndex = messages.length;
    messages = [...messages, { role: "assistant", text: "" }];

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let splitIndex;
      while ((splitIndex = buffer.indexOf("\n\n")) !== -1) {
        const frame = buffer.slice(0, splitIndex);
        buffer = buffer.slice(splitIndex + 2);

        const eventMatch = frame.match(/^event:\s*(.+)$/m);
        const dataMatch = frame.match(/^data:\s*(.+)$/m);
        if (!eventMatch || !dataMatch) continue;

        const eventType = eventMatch[1].trim();
        let payload: any = {};
        try {
          payload = JSON.parse(dataMatch[1]);
        } catch {
          payload = {};
        }

        if (eventType === "status") {
          statusText = payload?.text || "Working...";
        } else if (eventType === "delta") {
          const chunk = payload?.text || "";
          messages[assistantIndex].text += chunk;
          messages = [...messages];
        } else if (eventType === "done") {
          statusText = "";
        } else if (eventType === "error") {
          messages[assistantIndex].text = payload?.message || "Streaming failed.";
          messages = [...messages];
        }
      }
    }
  }
</script>

<button
  class="fixed bottom-4 right-4 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-slate-900 text-white shadow-lg transition hover:bg-slate-800"
  type="button"
  aria-label="Toggle chat widget"
  on:click={() => (isOpen = !isOpen)}
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
  >
    <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path>
  </svg>
</button>

{#if isOpen}
  <section class="fixed bottom-20 right-4 z-50 h-[min(72vh,640px)] w-[min(92vw,420px)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
    <div class="border-b border-slate-200 px-4 py-3">
      <div class="flex items-center justify-between">
        <h2 class="text-sm font-semibold text-slate-900">Assistant</h2>
        <div class="flex items-center gap-1 rounded-full bg-slate-100 p-1 text-xs">
          <button
            type="button"
            class={`rounded-full px-2.5 py-1 ${useStreaming ? "bg-slate-900 text-white" : "text-slate-600"}`}
            on:click={() => (useStreaming = true)}
          >
            Stream
          </button>
          <button
            type="button"
            class={`rounded-full px-2.5 py-1 ${!useStreaming ? "bg-slate-900 text-white" : "text-slate-600"}`}
            on:click={() => (useStreaming = false)}
          >
            Run
          </button>
        </div>
      </div>
      {#if statusText}
        <p class="mt-1 text-xs text-slate-500">{statusText}</p>
      {/if}
    </div>

    <div class="h-[calc(100%-136px)] overflow-y-auto px-4 py-3">
      {#each messages as message}
        <div class={`mb-3 flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
          <div class={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
            message.role === "user"
              ? "bg-slate-900 text-white"
              : "border border-slate-200 bg-slate-50 text-slate-700"
          }`}>
            {message.text}
          </div>
        </div>
      {/each}
    </div>

    <form
      class="border-t border-slate-200 p-3"
      on:submit|preventDefault={sendMessage}
    >
      <div class="flex items-center gap-2">
        <input
          bind:value={input}
          class="h-11 flex-1 rounded-xl border border-slate-300 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
          placeholder="Type your message"
        />
        <button
          disabled={isSending}
          class="inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
          type="submit"
        >
          {isSending ? "..." : "Send"}
        </button>
      </div>
    </form>
  </section>
{/if}

