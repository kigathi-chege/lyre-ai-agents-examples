# SvelteKit Chat Sample

This sample uses SvelteKit server endpoints to call `@kigathi/ai-agents` in direct mode with backend persistence.
OpenAI handles the model response, while Axis stores conversations, messages, and related metadata.

Required environment variables:

- `OPENAI_API_KEY`
- `AXIS_BACKEND_URL`
- `LYRE_AGENT_ID`

## Run

```bash
cp .env.example .env
npm install
npm run dev
```
