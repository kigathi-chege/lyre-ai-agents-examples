import { getBlogPosts } from "$lib/blog/posts";

export const load = () => {
  return {
    posts: getBlogPosts(),
    modes: [
      {
        id: "browser-minimal",
        title: "Browser (Minimal)",
        description: "Native browser speech synthesis with defaults.",
      },
      {
        id: "browser-full",
        title: "Browser (Full)",
        description: "Browser speech synthesis with voice/speech/highlight/autoscroll options.",
      },
      {
        id: "endpoint-minimal",
        title: "Endpoint (Minimal)",
        description: "attachReadAloud fetches /api/read-aloud directly.",
      },
      {
        id: "endpoint-full",
        title: "Endpoint (Full)",
        description: "Endpoint mode with full timed options (instructions/highlight/progressive/autoscroll).",
      },
      {
        id: "data-api-minimal",
        title: "Data + API (Minimal)",
        description: "Fetch one payload from API, then pass as data.",
      },
      {
        id: "data-api-full",
        title: "Data + API (Full)",
        description: "Data mode with full options, payload fetched from API with current instructions.",
      },
      {
        id: "datasource-api-minimal",
        title: "DataSource + API (Minimal)",
        description: "Progressive chunk calls to API via dataSource.",
      },
      {
        id: "datasource-api-full",
        title: "DataSource + API (Full)",
        description: "DataSource API mode with full timed options.",
      },
      {
        id: "data-direct-minimal",
        title: "Data + Direct (Minimal)",
        description: "Direct browser OpenAI call, then pass data payload.",
      },
      {
        id: "data-direct-full",
        title: "Data + Direct (Full)",
        description: "Direct browser data mode with full options and instruction-aware payload generation.",
      },
      {
        id: "datasource-direct-minimal",
        title: "DataSource + Direct (Minimal)",
        description: "Direct browser OpenAI chunk calls via dataSource.",
      },
      {
        id: "datasource-direct-full",
        title: "DataSource + Direct (Full)",
        description: "Direct browser dataSource mode with full timed options.",
      },
    ],
  };
};
