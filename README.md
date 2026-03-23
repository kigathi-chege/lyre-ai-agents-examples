# Examples

Production-style sample apps using `@kigathi/ai-agents` in direct mode with backend persistence:

- `express-chat`
- `nuxt-chat`
- `sveltekit-chat`

Each sample:

- Uses a Tailwind chat widget UI
- Calls OpenAI directly from a server-side route
- Sends `conversation_id` on follow-up turns to maintain context
- Persists messages and tool events to Axis through `backendUrl`
- Sends metadata (`client_app`, `session_source`) for Axis-side event/audit flow
