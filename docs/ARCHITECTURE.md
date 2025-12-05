# Agent SDK Architecture - Complete Overview

**Framework:** Intelligence Adjacent (IA)
**Build:** Node.js + TypeScript
**Deployment:** Docker, Cloud Run, VPS
**Status:** Phase 1 Complete - Phase 2 Ready

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Request                            │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ Router Agent │ (Llama 3.8B)
                    │              │
                    │ Keyword      │
                    │ Detection    │
                    └──────┬───────┘
                           │
           ┌───────────────┼───────────────┬───────────────┐
           │               │               │               │
           ▼               ▼               ▼               ▼
     ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌──────────┐
     │ Security  │  │  Writer   │  │  Advisor  │  │  Legal   │
     │ Agent     │  │  Agent    │  │  Agent    │  │  Agent   │
     │           │  │           │  │           │  │          │
     │ Claude    │  │  Claude   │  │  Grok-    │  │  Claude  │
     │ Opus 4.5  │  │  Opus 4.5 │  │  Vision   │  │  Opus4.5 │
     └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └────┬─────┘
           │              │              │             │
           └──────────────┼──────────────┼─────────────┘
                          │
                    ┌─────▼──────────┐
                    │ ModelClient    │
                    │                │
                    │ • Lazy Init    │
                    │ • Model Sel.   │
                    │ • Provider Sel.│
                    └─────┬──────────┘
                          │
          ┌───────────────┴────────────────┐
          │                                │
    OpenRouter (Primary)            Anthropic (Fallback)
    200+ Models                      Claude Opus 4.5
    - Claude Opus 4.5
    - Grok Vision
    - Llama 3.8B
    - Perplexity
    - And 200+ more
```

---

## Component Breakdown

### 1. Router Agent (`src/agents/router-agent.ts`)
**Purpose:** Route user queries to appropriate specialist agent

**Keywords Detected:**
- **Security:** "pentest", "vulnerability", "exploit", "security", "audit", "scan"
- **Writer:** "blog", "post", "article", "write", "documentation", "report", "newsletter"
- **Advisor:** "osint", "research", "intelligence", "career", "resume", "interview", "review"
- **Legal:** "gdpr", "compliance", "legal", "contract", "risk", "liability"

**Output:** Decision with target agent name + confidence

---

### 2. Security Agent (`src/agents/security-agent.ts`)
**Purpose:** Handle penetration testing, code review, vulnerability assessment

**Model:** `anthropic/claude-opus-4-5` (complex analysis, security focus)

**Modes:**
- Penetration Testing (exploitation)
- Vulnerability Scanning (detection)
- Network Segmentation Testing
- Code Review (security-focused)
- Architecture Review

**System Prompt Includes:**
- EXPLORE-PLAN-CODE-COMMIT workflow
- MITRE ATT&CK + OWASP methodologies
- Scope verification requirements
- Authorization checks

---

### 3. Writer Agent (`src/agents/writer-agent.ts`)
**Purpose:** Content creation - blog posts, technical docs, security reports

**Model:** `anthropic/claude-opus-4-5` (quality content generation)

**Content Types:**
- Blog Posts (10-15% public, 70-75% free, 10-15% paid)
- Technical Writing (tutorials, how-tos, guides)
- Security Reports (PTES format)
- Newsletters (weekly digests)

**System Prompt Includes:**
- Content tier differentiation
- File organization standards
- Frontmatter requirements
- Intelligence Adjacent framework

---

### 4. Advisor Agent (`src/agents/advisor-agent.ts`)
**Purpose:** OSINT research, career development, QA review

**Model:** `grok-vision` (research + vision for OSINT)

**Modes:**
- OSINT Research (dual-source: Claude WebSearch + Grok)
- Career Development (job analysis, resume, interview prep)
- QA Review (peer review, hallucination detection, standards validation)

**System Prompt Includes:**
- Mandatory citations (every claim with source URL)
- Ethical OSINT practices
- CliftonStrengths career framework
- Cross-validation methodology

---

### 5. Legal Agent (`src/agents/legal-agent.ts`)
**Purpose:** Legal compliance, contract analysis, regulatory research

**Model:** `anthropic/claude-opus-4-5` (legal accuracy critical)

**Modes:**
- Compliance Review (GDPR, HIPAA, SOC 2, PCI-DSS, ISO 27001)
- Contract Analysis (risk identification, legal language)
- Risk Assessment (legal exposure analysis)
- Jurisdictional Research (country/state-specific requirements)

**System Prompt Includes:**
- Critical disclaimer: "Provides information, NOT legal advice"
- Authoritative sources only
- Attorney consultation recommendation
- Framework cross-reference mapping

---

### 6. ModelClient (`src/clients/model-client.ts`)
**Purpose:** Unified API abstraction for OpenRouter and Anthropic

**Key Features:**
1. **Provider Detection** (automatic, in order):
   - OpenRouter (if OPENROUTER_API_KEY set)
   - Anthropic (if ANTHROPIC_API_KEY set)
   - Error if neither configured

2. **Model Selection by Agent:**
   - Router → `meta-llama/llama-3-8b-instruct` (fast, cheap)
   - Security → `anthropic/claude-opus-4-5`
   - Writer → `anthropic/claude-opus-4-5`
   - Advisor → `grok-vision`
   - Legal → `anthropic/claude-opus-4-5`
   - Default → `anthropic/claude-opus-4-5`

3. **Lazy Initialization:**
   - Credentials NOT checked at module load time
   - Deferred to first API call (when env vars guaranteed loaded)
   - Fixes timing issue with singleton agent initialization

4. **Dual API Support:**
   - **OpenRouter:** POST to `https://openrouter.ai/api/v1/chat/completions`
   - **Anthropic:** Uses `@anthropic-ai/sdk` package

5. **Response Normalization:**
   - Both providers mapped to consistent `ModelResponse` interface
   - Usage stats captured (tokens consumed)

---

## Integration Points (Future Phases)

### Phase 2: Skills Bridge
Convert documentation to executable modules:
- `security-testing/` → TypeScript module with test methodologies
- `writer/` → Content generation module with tier system
- `osint-research/` → Research module with dual-source validation
- `legal-compliance/` → Compliance module with framework mapping

Decision Tree Implementation:
- EXPLORE → Gather requirements, clarify scope
- PLAN → Design test/content/research approach
- CODE → Execute with tools and methodologies
- COMMIT → Document findings with remediation

### Phase 3: Server Integration
Connect to VPS security testing servers:
- `kali-pentest/` - Kali Linux for pentesting
- `metasploit/` - Metasploit Framework
- `ai-security/` - AI/LLM security testing (Garak)
- `cloud-security/` - Cloud frameworks (Prowler, ScoutSuite)
- `ad-security/` - Active Directory testing
- `mobile-security/` - Mobile security testing

### Phase 4: Tool Discovery & Registry
Expose framework tools to agents:
- Skill-specific tools: `~/.claude/skills/*/tools/`
- Framework tools: `~/.claude/tools/`
- Server wrapper tools: `~/.claude/servers/*/tools/`
- Dynamic tool registration and discovery

### Phase 5: Multi-Turn Conversations
Implement session state management:
- Track conversation history across turns
- Maintain agent context between messages
- EXPLORE-PLAN-CODE-COMMIT workflow state tracking
- Session checkpoints for resumption

---

## Data Flow - Example: Pentesting Request

```
User: "vulnerability assessment for REST API on production"

1. Router Agent
   - Detects keywords: "vulnerability", "assessment"
   - Target agent: SECURITY
   - Confidence: 0.95

2. Security Agent (Receives request)
   - Detects mode: VULNERABILITY-SCANNING
   - Engagement mode: DIRECTOR (default)
   - Current phase: EXPLORE

3. Security Agent (Build system prompt)
   - Include MITRE ATT&CK methodologies
   - Include OWASP Top 10 framework
   - Set engagement mode context
   - Add scope verification requirement

4. Security Agent (Call ModelClient)
   - Create: new ModelClient('security')
   - Call: generateCompletion(systemPrompt, userMessage, maxTokens)

5. ModelClient (Lazy initialization)
   - Check: Is apiKey already set? No
   - Check: process.env.OPENROUTER_API_KEY? YES
   - Set provider: 'openrouter'
   - Set apiKey: from env

6. ModelClient (Get model)
   - Agent name: 'security'
   - Provider: 'openrouter'
   - Model: AGENT_MODELS['security'] = 'anthropic/claude-opus-4-5'

7. ModelClient (Call OpenRouter)
   - POST to: https://openrouter.ai/api/v1/chat/completions
   - Headers: Authorization: Bearer [apiKey]
   - Body: { model, messages, max_tokens, temperature }

8. OpenRouter API
   - Route to Claude Opus 4.5
   - Generate security assessment
   - Return: { content, model, usage }

9. ModelClient (Normalize response)
   - Map OpenRouter response to ModelResponse interface
   - Extract: content, model, usage tokens

10. Security Agent (Format result)
    - Return AgentMessage:
      { role: 'assistant', content: response.content, agent: 'security' }

11. Express Server (Send response)
    - JSON: { agent: 'security', message: content, model: 'claude-opus-4-5' }

12. User receives response with:
    - Security assessment
    - Vulnerabilities identified
    - Remediation guidance
    - Methodology references (MITRE ATT&CK, OWASP)
```

---

## Error Handling

### Credential Errors
```
Neither OPENROUTER_API_KEY nor ANTHROPIC_API_KEY configured.
Please set one in your .env file.

OpenRouter: https://openrouter.ai/keys
Anthropic: https://console.anthropic.com
```

### API Errors
```
Model API error (openrouter): 401 Unauthorized

Check:
1. API key is valid and not expired
2. Rate limits not exceeded
3. Account has sufficient credits
```

### Agent-Specific Errors
```
Security Agent Error: [error message]
Writer Agent Error: [error message]
Advisor Agent Error: [error message]
Legal Agent Error: [error message]

Please ensure OPENROUTER_API_KEY or ANTHROPIC_API_KEY is configured.
```

---

## Performance Characteristics

| Metric | Value | Notes |
|--------|-------|-------|
| Router latency | <100ms | Keyword detection only |
| API latency | 2-10s | Depends on model and query complexity |
| Model cost | $0.001-0.01 per query | OpenRouter pricing varies by model |
| Response tokens | 100-2000 | Configurable per agent |

---

## Security Considerations

1. **Credential Management:**
   - OpenRouter API key stored in `.env` (not committed)
   - Anthropic API key optional fallback
   - Pre-commit hook blocks hardcoded credentials

2. **Authorization:**
   - Security agent enforces scope verification
   - Requires explicit authorization context
   - EXPLORE-PLAN-CODE-COMMIT workflow

3. **Data Privacy:**
   - User queries sent to external APIs (OpenRouter/Anthropic)
   - No sensitive data should be included without encryption
   - Review terms of service for your use case

---

## File Structure

```
ia-framework/
├── src/
│   ├── agents/
│   │   ├── router-agent.ts
│   │   ├── security-agent.ts
│   │   ├── writer-agent.ts
│   │   ├── advisor-agent.ts
│   │   └── legal-agent.ts
│   ├── clients/
│   │   └── model-client.ts (NEW)
│   ├── types/
│   │   └── index.ts
│   └── index.ts
├── dist/ (compiled JavaScript)
├── .env.example
├── .env (secrets, not committed)
├── package.json
├── tsconfig.json
├── Dockerfile
├── docker-compose.yml
├── docs/ (Documentation)
│   ├── README.md (Documentation index)
│   ├── ARCHITECTURE.md (this file)
│   ├── AGENT-SKILL-MAPPING.md
│   └── phases/
│       └── phase-1/
│           ├── implementation.md
│           └── testing.md
└── README.md (Root level - SDK quickstart)
```

---

## Next Steps

1. **Immediate:** Test Phase 1 with your OpenRouter API key
2. **Phase 2:** Convert SKILL.md files to executable TypeScript modules
3. **Phase 3:** Integrate VPS server APIs for tool execution
4. **Phase 4:** Implement multi-turn conversation support with state tracking
5. **Phase 5:** Docker deployment and public GitHub publishing

See `phases/phase-1/testing.md` for quick start guide.

---

**Last Updated:** 2025-12-04
**Framework:** Intelligence Adjacent (IA) Agent SDK
**Author:** Claude Code
