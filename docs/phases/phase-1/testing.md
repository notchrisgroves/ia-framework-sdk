# Phase 1 Testing Guide - Ready to Test

**Status:** Waiting for OPENROUTER_API_KEY
**Estimated Test Time:** 5-10 minutes

---

## Quick Start

### Step 1: Add Your OpenRouter API Key

1. Get key from: https://openrouter.ai/keys
2. Create `.env` file (copy from `.env.example`):
   ```bash
   OPENROUTER_API_KEY=sk-or-YOUR_KEY_HERE
   ```
3. Keep ANTHROPIC_API_KEY commented out (OpenRouter is primary)

### Step 2: Start Dev Server

```bash
npm run dev
```

Expected output:
```
Server running on http://localhost:3000
```

### Step 3: Test Each Agent

#### Test 1: Security Agent
```bash
curl -X POST http://localhost:3000/query \
  -H "Content-Type: application/json" \
  -d '{"prompt": "vulnerability assessment for REST API"}'
```

Expected:
- Router detects: `security`
- Model: `anthropic/claude-opus-4-5` (from OpenRouter)
- Response: Security analysis

#### Test 2: Writer Agent
```bash
curl -X POST http://localhost:3000/query \
  -H "Content-Type: application/json" \
  -d '{"prompt": "write blog post about agent architecture"}'
```

Expected:
- Router detects: `writer`
- Model: `anthropic/claude-opus-4-5`
- Response: Blog post content

#### Test 3: Advisor Agent
```bash
curl -X POST http://localhost:3000/query \
  -H "Content-Type: application/json" \
  -d '{"prompt": "research latest cybersecurity threats"}'
```

Expected:
- Router detects: `advisor`
- Model: `grok-vision` (from OpenRouter)
- Response: Research findings

#### Test 4: Legal Agent
```bash
curl -X POST http://localhost:3000/query \
  -H "Content-Type: application/json" \
  -d '{"prompt": "GDPR compliance review for data handling"}'
```

Expected:
- Router detects: `legal`
- Model: `anthropic/claude-opus-4-5`
- Response: Compliance guidance

### Step 4: Verify Console Output

Check server console for:
```
Router detecting: [agent-name]
Model selected: [model-id]
Provider: openrouter
Response received from API
```

---

## Troubleshooting

### ❌ Error: "Neither OPENROUTER_API_KEY nor ANTHROPIC_API_KEY configured"

**Fix:**
1. Create `.env` file (not just `.env.example`)
2. Ensure key starts with `sk-or-` (OpenRouter format)
3. Restart server: Stop and `npm run dev` again

### ❌ Error: "401 Unauthorized" from OpenRouter

**Fix:**
1. Verify API key is correct: https://openrouter.ai/keys
2. Check rate limits: https://openrouter.ai/activity
3. Ensure key hasn't expired

### ❌ Agent returns error message

**Fix:**
1. Check ModelClient is initialized (should see "provider: openrouter" in logs)
2. Verify model name exists on OpenRouter (check AGENT_MODELS in model-client.ts)
3. Check API key has sufficient credits

### ❌ "Cannot find module" errors

**Fix:**
1. Ensure TypeScript compiled: `npm run build`
2. Check dist/ folder has all agent `.js` files
3. Restart server after build

---

## Success Criteria ✅

Phase 1 testing passes when:
1. ✅ Server starts without errors
2. ✅ OpenRouter provider detected (not Anthropic fallback)
3. ✅ All 4 agents route correctly based on keywords
4. ✅ Correct models selected for each agent type
5. ✅ API responses received from models (not errors)
6. ✅ Response latency < 10 seconds per query

---

## What Happens After Testing

Once Phase 1 passes, next steps:
1. **Phase 2:** Convert SKILL.md documentation to executable TypeScript modules
2. **Phase 3:** Integrate VPS servers and tool discovery
3. **Phase 4:** Docker deployment and GitHub publishing

---

## Questions During Testing?

Check these files:
- `src/clients/model-client.ts` - Model selection logic
- `src/agents/[name]-agent.ts` - Agent implementation
- `implementation.md` - Architecture details
- `README.md` - General documentation

Good luck! 🚀
