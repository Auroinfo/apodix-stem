export type AIProvider = 
  | 'gemini' 
  | 'openai' 
  | 'anthropic' 
  | 'deepseek' 
  | 'groq' 
  | 'ollama' 
  | 'lmstudio'
  | 'openrouter' 
  | 'custom';

export interface ModelConfig {
  id: string;
  name: string;
  provider: AIProvider;
  api_key?: string;
  base_url?: string;
  model_id: string;
  is_active: boolean;
  temperature: number;
  max_tokens: number;
  created_at?: string;
}

export interface AppSettings {
  socratic_rigor: 'strict' | 'balanced' | 'guided';
  tutor_persona: 'apodix_first_principles' | 'patient_prof' | 'socratic_inquisitor';
  enable_simulations: boolean;
  default_provider?: string;
}

export interface PrerequisiteQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  conceptTested: string;
  explanation: string;
}

export interface GoverningEquation {
  title: string;
  latex: string;
  description: string;
  variables: { symbol: string; meaning: string; unit?: string }[];
}

export interface Milestone {
  id: string;
  module_id: string;
  title: string;
  order_index: number;
  concept_summary: string;
  governing_equations: GoverningEquation[];
  simulation_type?: 'microfluidics_flow' | 'diffusion' | 'generic_parametric' | 'none';
  simulation_config?: Record<string, any>;
  socratic_challenge: string;
  solution_rubric: string; // Used by evaluator to score derivations without exposing to user
  is_completed: boolean;
  mastery_score: number;
}

export interface Module {
  id: string;
  study_path_id: string;
  tier_level: number; // 1: Foundations, 2: Principles, 3: Derivations, 4: Systems, 5: Frontier
  title: string;
  description: string;
  order_index: number;
  milestones: Milestone[];
}

export interface StudyPath {
  id: string;
  topic: string;
  target_audience: string;
  overview: string;
  prerequisites: PrerequisiteQuestion[];
  current_milestone_id?: string;
  progress_percent: number;
  created_at: string;
  modules?: Module[];
}

export interface DerivationStep {
  step_number: number;
  math_or_text: string;
  status: 'valid' | 'warning' | 'faulty' | 'pending';
  feedback: string;
  nudge_hint?: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  hint_level?: number;
  created_at: string;
}
