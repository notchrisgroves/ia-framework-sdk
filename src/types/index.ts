/**
 * Core type definitions for IA Framework
 */

// Agent types
export type AgentName = 'security' | 'writer' | 'advisor' | 'legal' | 'director';

export type EngagementPhase = 'explore' | 'plan' | 'code' | 'commit';

export type EngagementMode = 'Director' | 'Mentor' | 'Demo';

// Security types
export type FindingSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type TestCategory =
  | 'vpn-infrastructure'
  | 'api-security'
  | 'web-application'
  | 'cloud-storage';

// Message types
export interface UserMessage {
  role: 'user';
  content: string;
}

export interface AgentMessage {
  role: 'assistant';
  content: string;
  agent: AgentName;
}

export type Message = UserMessage | AgentMessage;

// Routing types
export interface RoutingRule {
  keywords: string[];
  agent: AgentName;
}

export interface RoutingDecision {
  agent: AgentName;
  confidence: number;
  reason: string;
}

// Security engagement types
export interface SecurityFinding {
  id: string;
  severity: FindingSeverity;
  title: string;
  description: string;
  remediation: string;
  evidence: string[];
  cve?: string;
}

export interface HackerOneScope {
  programId: string;
  programName: string;
  inScope: string[];
  outOfScope: string[];
}

export interface TestCase {
  id: string;
  category: TestCategory;
  title: string;
  description: string;
  tools: string[];
  riskLevel: 'high' | 'medium' | 'low';
}

// Agent configuration types
export interface AgentConfig {
  name: AgentName;
  description: string;
  model: string;
  skills: string[];
  tools: string[];
  maxTurns?: number;
}

export interface AgentState {
  agent: AgentName;
  phase: EngagementPhase;
  mode: EngagementMode;
  conversationHistory: Message[];
  state: Record<string, unknown>;
}

// Server response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface QueryResponse {
  agent: AgentName;
  message: string;
  routing_confidence?: number;
}

// Skill types
export interface Skill {
  name: string;
  description: string;
  phases: EngagementPhase[];
  execute: (context: SkillContext) => Promise<void>;
}

export interface SkillContext {
  agent: AgentName;
  phase: EngagementPhase;
  input: Record<string, unknown>;
  state: AgentState;
}

// Tool types
export interface Tool {
  name: string;
  description: string;
  execute: (params: Record<string, unknown>) => Promise<unknown>;
}

// Configuration types
export interface AppConfig {
  port: number;
  nodeEnv: 'development' | 'production' | 'test';
  anthropicApiKey: string;
  resourcesPath: string;
  logLevel: string;
}
