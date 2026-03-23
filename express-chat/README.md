# Express Chat Sample

This sample uses `@kigathi/ai-agents` in direct mode with backend persistence.
OpenAI handles model execution, while Axis still receives conversation and message events.

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

Open `http://localhost:3100`.
