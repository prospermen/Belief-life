# Backend-Only Deployment

This project can run as a pure AI API backend without Vite frontend.

## 1. Local Run (API only)

1. Install deps:

```bash
npm install --legacy-peer-deps
```

2. Create env file:

```bash
cp .env.example .env
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

3. Set required env values in `.env`:

- `DEEPSEEK_API_KEY=<your key>` (recommended), or `OPENAI_API_KEY`
- `API_ONLY=true`
- `PORT=8787` (or any free port)

4. Start backend:

```bash
npm run start:api
```

5. Health check:

```bash
curl http://localhost:8787/api/health
```

## 2. API Test Example

```bash
curl -X POST http://localhost:8787/api/ai/daily-feedback \
  -H "Content-Type: application/json" \
  -d '{
    "activityType": "thinking_detective",
    "stepId": "thought",
    "userInput": "I feel I will fail again.",
    "context": {
      "stepTitle": "Hot thought",
      "progress": 60
    }
  }'
```

## 3. Render Deployment (Blueprint)

This repo includes `render.yaml` for backend-only deployment.

1. Push code to GitHub.
2. In Render, create a **Blueprint** service from this repo.
3. Add secret env var in Render dashboard:
   - `DEEPSEEK_API_KEY` (or `OPENAI_API_KEY`)
4. Deploy.
5. Verify:
   - `GET /api/health`
   - `POST /api/ai/daily-feedback`

## 4. Railway Deployment (manual)

1. Create a new Railway project from this repo.
2. Set start command:

```bash
npm run start:api
```

3. Add env vars:
- `API_ONLY=true`
- `DEEPSEEK_API_KEY=<your key>`
- `OPENAI_BASE_URL=https://api.deepseek.com`
- `OPENAI_MODEL=deepseek-chat`

4. Railway injects `PORT` automatically; server already supports it.

