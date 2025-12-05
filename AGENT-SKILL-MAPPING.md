# Agent-Skill-Server Mapping

Maps Agent SDK agents to their corresponding skills, workflows, and servers.

## 1. Security Agent

**Purpose:** Penetration testing, vulnerability assessment, security advisory

### Mapped Skills
- `security-testing` - Penetration testing, vulnerability scanning, network segmentation
- `threat-intel` - Threat intelligence gathering and analysis
- `code-review` - Vulnerability detection in code
- `dependency-audit` - Supply chain and dependency vulnerabilities
- `architecture-review` - Security architecture analysis
- `secure-config` - Infrastructure hardening validation

### Mapped Servers
- `kali-pentest` - 20 tools (nmap, burp, sqlmap, etc.)
- `metasploit` - Exploitation framework
- `ai-security` - Garak for AI/LLM security testing
- `cloud-security` - Prowler (AWS), ScoutSuite (Azure/GCP)
- `ad-security` - Active Directory testing
- `mobile-security` - Mobile app security testing

### Integration Points
- Load security-testing skill context on agent invocation
- Reference methodologies for domain-specific testing (network, web, mobile, cloud, AI)
- Use threat-intel skill for reconnaissance and threat modeling
- Delegate to servers for actual tool execution

---

## 2. Writer Agent

**Purpose:** Content creation (blog posts, documentation, reports)

### Mapped Skills
- `writer` - Blog posts, newsletters, content strategy
- `technical-writing` - Tutorials, how-tos, reference guides
- `report-generation` - Security reports (PTES, OWASP, NIST), audit reports
- `blog-workflow` - Project documentation, release notes

### Mapped Servers
- `ghost-blog` - Ghost CMS integration for publishing
- `openrouter` - Multi-model AI for content generation

### Integration Points
- Load writer skill context on agent invocation
- Follow file organization standards: `personal/blog/drafts/{slug}/`
- Generate metadata.json for Ghost integration
- Create hero images using Grok or custom prompts
- Support three-tier content model: Public, Free Members, Paid Members

---

## 3. Advisor Agent

**Purpose:** Research, career development, quality assurance

### Mapped Skills
- `osint-research` - Dual-source intelligence (Claude WebSearch + Grok)
- `personal-development` - Career guidance, resume optimization, interview prep
- `qa-review` - Quality assurance, peer review, standards validation
- `threat-intel` - Threat actor research, intelligence synthesis

### Integration Points
- Load osint-research skill with mandatory citations
- Support dual-source research (Claude + Grok)
- Maintain research files in `professional/engagements/osint/{client}/`
- Follow OSINT ethical standards (public sources only)

---

## 4. Legal Agent

**Purpose:** Legal compliance, contract analysis, regulatory research

### Mapped Skills
- `legal` - Legal information (NOT legal advice)
- `legal-compliance` - GDPR, HIPAA, SOC 2, compliance frameworks
- `report-generation` - Risk assessment reports, compliance audit reports

### Integration Points
- Load legal skill context on agent invocation
- **CRITICAL:** Provide legal INFORMATION only, NOT legal advice
- Always include disclaimers and recommend attorney consultation
- Verify citations via WebSearch
- Support jurisdiction-specific compliance research

---

## Agent Implementation Strategy

1. **Step 1:** Security Agent (highest complexity, highest value)
   - Integrate with security-testing skill workflows
   - Support server-based tool execution
   - Implement EXPLORE-PLAN-CODE-COMMIT workflow

2. **Step 2:** Writer Agent
   - Integrate with blog-workflow skill
   - Connect to Ghost CMS server
   - Support content tier selection

3. **Step 3:** Advisor Agent
   - Integrate with osint-research skill
   - Support dual-source methodology
   - Implement citation tracking

4. **Step 4:** Legal Agent
   - Integrate with legal-compliance skill
   - Add disclaimer management
   - Implement citation verification

---

## File Organization

**Agent implementations:** `src/agents/`
**Skill loading:** Reference via import from `~/.claude/skills/`
**Server coordination:** Via environment variables and configuration
**Type definitions:** Extend in `src/types/index.ts`

