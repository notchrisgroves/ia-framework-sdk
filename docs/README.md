# SDK Documentation

Complete documentation for the IA Framework Agent SDK.

## Quick Navigation

### Architecture & Design
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System design, agent architecture, flow diagrams
- **[AGENT-SKILL-MAPPING.md](./AGENT-SKILL-MAPPING.md)** - How agents map to skills and capabilities

### Phase 1: OpenRouter Integration
- **[Phase 1 Implementation](./phases/phase-1/implementation.md)** - Technical architecture, workflow definitions, model discovery service
- **[Phase 1 Testing](./phases/phase-1/testing.md)** - Complete testing guide with curl examples and success criteria

## File Organization

```
docs/
├── README.md                    (You are here - Documentation index)
├── ARCHITECTURE.md              (System design and agent architecture)
├── AGENT-SKILL-MAPPING.md       (Agent-to-skill routing and capabilities)
└── phases/
    └── phase-1/
        ├── implementation.md    (Phase 1 technical details)
        └── testing.md          (Phase 1 testing procedures)
```

## What Each File Is For

### ARCHITECTURE.md
High-level system architecture including:
- Agent types and responsibilities
- Skill workflow structure
- Model selection strategy
- Agent-to-skill routing patterns

### AGENT-SKILL-MAPPING.md
Detailed mapping of:
- Which agents handle which skills
- Capability requirements for each agent
- Router keyword detection patterns
- Fallback and escalation logic

### phases/phase-1/implementation.md
Complete technical documentation for Phase 1 (Workflow-Aware Model Selection):
- Model Discovery Service architecture
- Workflow Configuration system
- ModelClient redesign details
- Capability-based model matching algorithm
- Architecture diagrams

### phases/phase-1/testing.md
Step-by-step testing guide for Phase 1:
- Prerequisites and setup
- Testing with curl examples
- Success criteria
- Debugging checklist

## Getting Started

1. Read **ARCHITECTURE.md** to understand the overall system design
2. Review **AGENT-SKILL-MAPPING.md** to see agent-to-skill routing
3. Follow **phases/phase-1/testing.md** to set up and test Phase 1
4. See **phases/phase-1/implementation.md** for implementation details

## SDK Root Documentation

See the root `README.md` for:
- Quick start guide
- Installation instructions
- Basic usage examples
- Project overview
