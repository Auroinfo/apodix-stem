import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { ModelConfig, StudyPath, Module, Milestone } from './types';

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'tutor.db');
const db = new Database(dbPath, { timeout: 10000 });

// Enable busy timeout and WAL mode for high concurrency
db.pragma('busy_timeout = 10000');
try {
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
} catch (e) {
  // Ignored if already set by another worker
}

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS models_config (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    provider TEXT NOT NULL,
    api_key TEXT,
    base_url TEXT,
    model_id TEXT NOT NULL,
    is_active INTEGER DEFAULT 0,
    temperature REAL DEFAULT 0.7,
    max_tokens INTEGER DEFAULT 3000,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS study_paths (
    id TEXT PRIMARY KEY,
    topic TEXT NOT NULL,
    target_audience TEXT DEFAULT 'Undergraduate / Advanced',
    overview TEXT NOT NULL,
    prerequisites TEXT, -- JSON
    current_milestone_id TEXT,
    progress_percent REAL DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS modules (
    id TEXT PRIMARY KEY,
    study_path_id TEXT NOT NULL,
    tier_level INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    FOREIGN KEY(study_path_id) REFERENCES study_paths(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS milestones (
    id TEXT PRIMARY KEY,
    module_id TEXT NOT NULL,
    title TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    concept_summary TEXT NOT NULL,
    governing_equations TEXT, -- JSON
    simulation_type TEXT DEFAULT 'none',
    simulation_config TEXT, -- JSON
    socratic_challenge TEXT NOT NULL,
    solution_rubric TEXT NOT NULL,
    is_completed INTEGER DEFAULT 0,
    mastery_score INTEGER DEFAULT 0,
    FOREIGN KEY(module_id) REFERENCES modules(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS tutor_sessions (
    id TEXT PRIMARY KEY,
    milestone_id TEXT NOT NULL,
    derivation_steps TEXT, -- JSON
    struggle_score INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(milestone_id) REFERENCES milestones(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    hint_level INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(session_id) REFERENCES tutor_sessions(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS misconceptions_log (
    id TEXT PRIMARY KEY,
    study_path_id TEXT,
    milestone_id TEXT,
    concept TEXT NOT NULL,
    student_faulty_premise TEXT NOT NULL,
    resolved INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed default models if table is empty
const modelCount = db.prepare('SELECT COUNT(*) as count FROM models_config').get() as { count: number };
if (modelCount.count === 0) {
  const seedModels: Partial<ModelConfig>[] = [
    {
      id: 'gemini-2-5-flash',
      name: 'Google Gemini 2.5 Flash',
      provider: 'gemini',
      api_key: process.env.GEMINI_API_KEY || '',
      base_url: 'https://generativelanguage.googleapis.com/v1beta',
      model_id: 'gemini-2.5-flash',
      is_active: true,
      temperature: 0.7,
      max_tokens: 4000,
    },
    {
      id: 'openai-gpt-4o',
      name: 'OpenAI GPT-4o',
      provider: 'openai',
      api_key: process.env.OPENAI_API_KEY || '',
      base_url: 'https://api.openai.com/v1',
      model_id: 'gpt-4o',
      is_active: false,
      temperature: 0.7,
      max_tokens: 4000,
    },
    {
      id: 'claude-3-5-sonnet',
      name: 'Anthropic Claude 3.5 Sonnet',
      provider: 'anthropic',
      api_key: process.env.ANTHROPIC_API_KEY || '',
      base_url: 'https://api.anthropic.com/v1',
      model_id: 'claude-3-5-sonnet-20241022',
      is_active: false,
      temperature: 0.7,
      max_tokens: 4000,
    },
    {
      id: 'deepseek-chat',
      name: 'DeepSeek Chat (V3)',
      provider: 'deepseek',
      api_key: process.env.DEEPSEEK_API_KEY || '',
      base_url: 'https://api.deepseek.com/v1',
      model_id: 'deepseek-chat',
      is_active: false,
      temperature: 0.6,
      max_tokens: 4000,
    },
    {
      id: 'groq-llama-3-3',
      name: 'Groq Llama 3.3 70B Versatile',
      provider: 'groq',
      api_key: process.env.GROQ_API_KEY || '',
      base_url: 'https://api.groq.com/openai/v1',
      model_id: 'llama-3.3-70b-versatile',
      is_active: false,
      temperature: 0.7,
      max_tokens: 4000,
    },
    {
      id: 'lmstudio-local',
      name: 'LM Studio Local (Qwen 3.6 / Local LLMs)',
      provider: 'lmstudio',
      api_key: '',
      base_url: 'http://localhost:1234/v1',
      model_id: 'qwen/qwen3.6-35b-a3b',
      is_active: false,
      temperature: 0.6,
      max_tokens: 3000,
    },
    {
      id: 'ollama-local',
      name: 'Ollama Local (Llama 3 / Mistral / DeepSeek)',
      provider: 'ollama',
      api_key: '',
      base_url: 'http://localhost:11434/v1',
      model_id: 'llama3.2',
      is_active: false,
      temperature: 0.7,
      max_tokens: 3000,
    },
    {
      id: 'openrouter-unified',
      name: 'OpenRouter (All Models)',
      provider: 'openrouter',
      api_key: process.env.OPENROUTER_API_KEY || '',
      base_url: 'https://openrouter.ai/api/v1',
      model_id: 'anthropic/claude-3.5-sonnet',
      is_active: false,
      temperature: 0.7,
      max_tokens: 4000,
    }
  ];

  const insertStmt = db.prepare(`
    INSERT INTO models_config (id, name, provider, api_key, base_url, model_id, is_active, temperature, max_tokens)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const m of seedModels) {
    insertStmt.run(
      m.id,
      m.name,
      m.provider,
      m.api_key || null,
      m.base_url || null,
      m.model_id,
      m.is_active ? 1 : 0,
      m.temperature || 0.7,
      m.max_tokens || 3000
    );
  }
}

// Seed default settings
const socraticRigor = db.prepare('SELECT value FROM app_settings WHERE key = ?').get('socratic_rigor');
if (!socraticRigor) {
  const insertSetting = db.prepare('INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)');
  insertSetting.run('socratic_rigor', 'strict');
  insertSetting.run('tutor_persona', 'apodix_first_principles');
  insertSetting.run('enable_simulations', 'true');
}

export default db;
