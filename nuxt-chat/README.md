# Nuxt Chat Sample

This Nuxt app calls a server route (`/api/chat`) that uses `@kigathi/ai-agents` in direct mode with backend persistence.
OpenAI handles the model call, while Axis stores conversations and messages and can process follow-up events.

Required environment variables:

- `OPENAI_API_KEY`
- `NUXT_AXIS_BACKEND_URL`
- `NUXT_LYRE_AGENT_ID`

## Run

```bash
cp .env.example .env
npm install
npm run dev
```
