import db from './db';
import { ModelConfig } from './types';

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIOptions {
  temperature?: number;
  max_tokens?: number;
  response_format?: 'json' | 'text';
}

export function getActiveModel(): ModelConfig {
  const row = db.prepare('SELECT * FROM models_config WHERE is_active = 1 LIMIT 1').get() as any;
  if (row) {
    return {
      ...row,
      is_active: Boolean(row.is_active)
    };
  }
  // Fallback to first available model
  const first = db.prepare('SELECT * FROM models_config LIMIT 1').get() as any;
  if (first) {
    return {
      ...first,
      is_active: true
    };
  }
  return {
    id: 'default-gemini',
    name: 'Gemini 2.5 Flash',
    provider: 'gemini',
    model_id: 'gemini-2.5-flash',
    is_active: true,
    temperature: 0.7,
    max_tokens: 3000
  };
}

export async function callAI(
  messages: AIMessage[],
  options: AIOptions = {},
  overrideModel?: ModelConfig
): Promise<string> {
  const model = overrideModel || getActiveModel();
  const apiKey = model.api_key || process.env[`${model.provider.toUpperCase()}_API_KEY`] || '';

  // If no API key is set and it's not Ollama or LM Studio local, provide rich built-in mock response for testing
  if (!apiKey && model.provider !== 'ollama' && model.provider !== 'lmstudio') {
    return generateFallbackResponse(messages, options);
  }

  try {
    if (model.provider === 'gemini') {
      return await callGemini(model, apiKey, messages, options);
    } else if (model.provider === 'anthropic') {
      return await callAnthropic(model, apiKey, messages, options);
    } else {
      // OpenAI, DeepSeek, Groq, Ollama, OpenRouter, Custom
      return await callOpenAICompatible(model, apiKey, messages, options);
    }
  } catch (err: any) {
    console.error(`AI API call failed with model ${model.name}:`, err);
    // Graceful fallback if API fails
    return generateFallbackResponse(messages, options, err.message);
  }
}

async function callGemini(
  model: ModelConfig,
  apiKey: string,
  messages: AIMessage[],
  options: AIOptions
): Promise<string> {
  const systemMessage = messages.find(m => m.role === 'system')?.content;
  const conversationMessages = messages.filter(m => m.role !== 'system');

  const contents = conversationMessages.map(m => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }]
  }));

  const url = `${model.base_url || 'https://generativelanguage.googleapis.com/v1beta'}/models/${model.model_id}:generateContent?key=${apiKey}`;

  const body: any = {
    contents,
    generationConfig: {
      temperature: options.temperature ?? model.temperature ?? 0.7,
      maxOutputTokens: options.max_tokens ?? model.max_tokens ?? 3000,
    }
  };

  if (systemMessage) {
    body.systemInstruction = {
      parts: [{ text: systemMessage }]
    };
  }

  if (options.response_format === 'json') {
    body.generationConfig.responseMimeType = 'application/json';
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('No candidate content received from Gemini');
  return text;
}

async function callOpenAICompatible(
  model: ModelConfig,
  apiKey: string,
  messages: AIMessage[],
  options: AIOptions
): Promise<string> {
  let rawBase = model.base_url;
  if (!rawBase) {
    if (model.provider === 'lmstudio') rawBase = 'http://localhost:1234/v1';
    else if (model.provider === 'ollama') rawBase = 'http://localhost:11434/v1';
    else if (model.provider === 'deepseek') rawBase = 'https://api.deepseek.com/v1';
    else if (model.provider === 'groq') rawBase = 'https://api.groq.com/openai/v1';
    else if (model.provider === 'openrouter') rawBase = 'https://openrouter.ai/api/v1';
    else rawBase = 'https://api.openai.com/v1';
  }
  const baseUrl = rawBase.replace(/\/+$/, '');
  const url = `${baseUrl}/chat/completions`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const effectiveMaxTokens = options.max_tokens ?? model.max_tokens ?? 1000;

  const body: any = {
    model: model.model_id,
    messages: messages.map(m => ({
      role: m.role,
      content: m.content
    })),
    temperature: options.temperature ?? model.temperature ?? 0.7,
    max_tokens: effectiveMaxTokens,
  };

  // Only pass type: 'json_object' to providers that support OpenAI's strict json_object format (LM Studio requires json_schema or text)
  if (options.response_format === 'json' && model.provider !== 'lmstudio') {
    body.response_format = { type: 'json_object' };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeoutId);
  }

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`${model.name} API error (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  let text = data?.choices?.[0]?.message?.content;
  if (!text && data?.choices?.[0]?.message?.reasoning_content) {
    text = data.choices[0].message.reasoning_content;
  }
  if (!text) throw new Error('Empty completion from AI provider');
  return text.trim();
}

async function callAnthropic(
  model: ModelConfig,
  apiKey: string,
  messages: AIMessage[],
  options: AIOptions
): Promise<string> {
  const baseUrl = (model.base_url || 'https://api.anthropic.com/v1').replace(/\/+$/, '');
  const url = `${baseUrl}/messages`;

  const systemMessage = messages.find(m => m.role === 'system')?.content;
  const conversationMessages = messages.filter(m => m.role !== 'system');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01'
  };

  const body: any = {
    model: model.model_id,
    messages: conversationMessages.map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content
    })),
    max_tokens: options.max_tokens ?? model.max_tokens ?? 3000,
    temperature: options.temperature ?? model.temperature ?? 0.7,
  };

  if (systemMessage) {
    body.system = systemMessage;
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Anthropic API error (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  const text = data?.content?.[0]?.text;
  if (!text) throw new Error('Empty response from Claude');
  return text;
}

export async function testModelConnection(config: ModelConfig): Promise<{
  success: boolean;
  latencyMs: number;
  message: string;
  responseSnippet?: string;
}> {
  const startTime = Date.now();
  try {
    const response = await callAI(
      [
        { role: 'system', content: 'You are a testing assistant. Reply with one brief sentence stating your identity and that connection is active.' },
        { role: 'user', content: 'Ping test.' }
      ],
      { max_tokens: (config.provider === 'lmstudio' || config.provider === 'ollama') ? 600 : 80 },
      config
    );
    const latencyMs = Date.now() - startTime;
    return {
      success: true,
      latencyMs,
      message: 'Connection successful!',
      responseSnippet: response.trim()
    };
  } catch (err: any) {
    return {
      success: false,
      latencyMs: Date.now() - startTime,
      message: err.message || 'Connection failed'
    };
  }
}

// Fallback generator for zero-configuration instant demo / offline exploration
function generateFallbackResponse(messages: AIMessage[], options: AIOptions, errorNote?: string): string {
  const lastUserMsg = messages[messages.length - 1]?.content || '';
  const isJson = options.response_format === 'json';

  // If curriculum generation is requested
  if (lastUserMsg.toLowerCase().includes('curriculum') || lastUserMsg.toLowerCase().includes('syllabus') || isJson) {
    const topicMatch = lastUserMsg.match(/topic[:\s"]+([^"\n,]+)/i);
    const topic = topicMatch ? topicMatch[1].trim() : 'Microfluidics';
    
    return JSON.stringify({
      topic: topic,
      target_audience: "Undergraduate to Advanced Researcher",
      overview: `A comprehensive Socratic learning path through ${topic}, advancing from governing physical principles to analytical derivations, microfabrication methods, and modern frontiers.`,
      prerequisites: [
        {
          id: "pre-1",
          question: "When the characteristic Reynolds number Re is much less than 1 (Re << 1), which forces dominate the fluid dynamics?",
          options: ["Inertial forces", "Viscous forces", "Turbulent eddy forces", "Gravitational convection"],
          correctIndex: 1,
          conceptTested: "Low Reynolds Hydrodynamics",
          explanation: "At Re << 1, viscous dissipation completely dominates convective inertia, yielding linear, time-reversible Stokes flow."
        },
        {
          id: "pre-2",
          question: "What physical boundary condition is assumed at the solid channel walls in classic continuum fluid mechanics?",
          options: ["Free slip condition", "No-slip condition (u = 0)", "Constant shear rate", "Capillary evaporation"],
          correctIndex: 1,
          conceptTested: "No-Slip Boundary Condition",
          explanation: "In continuum microfluidics, viscous interactions cause the relative velocity of the fluid at the solid boundary to vanish (u = 0)."
        }
      ],
      modules: [
        {
          tier_level: 1,
          title: "Tier 1: Continuum Limits & Scale Invariance",
          description: "Explore the transition from bulk fluid mechanics to microscopic scales, Knudsen numbers, and continuum validity.",
          milestones: [
            {
              title: "Continuum Hypothesis & Knudsen Criterion",
              concept_summary: "Evaluate when fluid can be treated as a continuous medium versus individual molecular collisions. In microfluidics, Knudsen number Kn = lambda / L dictates whether Navier-Stokes equations hold.",
              governing_equations: [
                {
                  title: "Knudsen Number",
                  latex: "Kn = \\frac{\\lambda}{L_c}",
                  description: "Ratio of molecular mean free path lambda to characteristic channel dimension L_c.",
                  variables: [
                    { symbol: "Kn", meaning: "Knudsen number (dimensionless)" },
                    { symbol: "\\lambda", meaning: "Mean free path of fluid molecules", unit: "m" },
                    { symbol: "L_c", meaning: "Characteristic channel height/width", unit: "m" }
                  ]
                }
              ],
              simulation_type: "microfluidics_flow",
              simulation_config: { channelWidthUm: 50, flowRateUlMin: 2.5, fluid: "water" },
              socratic_challenge: "In liquid water at standard conditions, lambda ~ 0.3 nm. For a microfluidic channel of width 20 um, calculate Kn. Does continuum fluid dynamics hold, and what does this imply about the Navier-Stokes equations?",
              solution_rubric: "Kn = 0.3e-9 / 20e-6 = 1.5e-5 << 10^-3. Because Kn << 0.001, the continuum hypothesis holds flawlessly and no-slip boundary conditions remain rigorously valid."
            }
          ]
        },
        {
          tier_level: 2,
          title: "Tier 2: Creeping Flow & Stokes Hydrodynamics",
          description: "Derive the velocity profiles of pressure-driven laminar flow through rectangular and cylindrical microchannels.",
          milestones: [
            {
              title: "Laminar Poiseuille Flow & Parabolic Profile",
              concept_summary: "In microchannels, laminar flow dominates. Viscous shear stresses balance the imposed pressure gradient, establishing a parabolic velocity profile.",
              governing_equations: [
                {
                  title: "Reynolds Number",
                  latex: "Re = \\frac{\\rho v D_h}{\\mu}",
                  description: "Ratio of inertial forces to viscous forces in a microchannel.",
                  variables: [
                    { symbol: "Re", meaning: "Reynolds number (dimensionless)" },
                    { symbol: "\\rho", meaning: "Fluid density", unit: "kg/m³" },
                    { symbol: "v", meaning: "Average flow velocity", unit: "m/s" },
                    { symbol: "D_h", meaning: "Hydraulic diameter", unit: "m" },
                    { symbol: "\\mu", meaning: "Dynamic viscosity", unit: "Pa·s" }
                  ]
                },
                {
                  title: "Hagen-Poiseuille Velocity Profile",
                  latex: "u(r) = \\frac{\\Delta P}{4 \\mu L} (R^2 - r^2)",
                  description: "Radial velocity distribution in a circular microchannel under laminar flow.",
                  variables: [
                    { symbol: "u(r)", meaning: "Axial velocity at radius r", unit: "m/s" },
                    { symbol: "\\Delta P", meaning: "Pressure drop across channel", unit: "Pa" },
                    { symbol: "R", meaning: "Channel inner radius", unit: "m" }
                  ]
                }
              ],
              simulation_type: "microfluidics_flow",
              simulation_config: { channelWidthUm: 100, flowRateUlMin: 10, fluid: "water" },
              socratic_challenge: "Starting from the 1D Navier-Stokes equation in cylindrical coordinates d/dr(r * du/dr) = (1/mu) * dP/dz * r, apply the no-slip condition at r = R and symmetry at r = 0 to derive the parabolic velocity profile.",
              solution_rubric: "Integrate once to get r*du/dr = (1/2mu)(dP/dz)r^2 + C1. Symmetry at r=0 implies C1=0. Integrate again: u(r) = (1/4mu)(dP/dz)r^2 + C2. Apply u(R)=0 to find C2 = -(1/4mu)(dP/dz)R^2. Yields u(r) = -(dP/dz)/(4mu) * (R^2 - r^2)."
            }
          ]
        },
        {
          tier_level: 3,
          title: "Tier 3: Surface Tension & Capillary Transport",
          description: "Understand Young-Laplace pressure, wetting contact angles, and passive capillary pumping.",
          milestones: [
            {
              title: "Young-Laplace Pressure & Droplet Generation",
              concept_summary: "At micro-scales, surface area-to-volume ratio skyrockets (~10^4 to 10^6 m^-1). Interfacial tension governs multiphase flows, droplet formation, and emulsification.",
              governing_equations: [
                {
                  title: "Young-Laplace Equation",
                  latex: "\\Delta P = \\gamma \\left( \\frac{1}{R_1} + \\frac{1}{R_2} \\right)",
                  description: "Pressure difference sustained across a curved fluid-fluid interface.",
                  variables: [
                    { symbol: "\\Delta P", meaning: "Laplace pressure discontinuity", unit: "Pa" },
                    { symbol: "\\gamma", meaning: "Interfacial tension", unit: "N/m" },
                    { symbol: "R_1, R_2", meaning: "Principal radii of curvature", unit: "m" }
                  ]
                }
              ],
              simulation_type: "diffusion",
              simulation_config: { peclet: 50, diffusionCoeff: 1e-9 },
              socratic_challenge: "Two spherical microdroplets of water in oil have radii R_A = 10 um and R_B = 50 um. If connected by a microchannel, which droplet will empty into the other, and what is the thermodynamic driving force?",
              solution_rubric: "Laplace pressure deltaP = 2*gamma/R. The smaller droplet (10 um) has 5x higher internal pressure than the 50 um droplet. Fluid flows from high pressure to low pressure, so the small droplet drains into the large droplet."
            }
          ]
        },
        {
          tier_level: 4,
          title: "Tier 4: Diffusion, Mixing & Péclet Numbers",
          description: "Analyze molecular transport without turbulence: Taylor dispersion, Dean vortices, and laminar diffusion.",
          milestones: [
            {
              title: "Taylor Dispersion & Péclet Number Transition",
              concept_summary: "Because Re << 1, fluids cannot mix via turbulent vortex shedding. Mixing relies purely on molecular diffusion, governed by the Péclet number Pe = v * L / D.",
              governing_equations: [
                {
                  title: "Péclet Number",
                  latex: "Pe = \\frac{u L}{D}",
                  description: "Ratio of advective transport rate to diffusive transport rate.",
                  variables: [
                    { symbol: "Pe", meaning: "Péclet number (dimensionless)" },
                    { symbol: "u", meaning: "Advective flow velocity", unit: "m/s" },
                    { symbol: "D", meaning: "Molecular diffusion coefficient", unit: "m²/s" }
                  ]
                }
              ],
              simulation_type: "diffusion",
              simulation_config: { peclet: 200, diffusionCoeff: 5e-10 },
              socratic_challenge: "A small protein with D = 10^-10 m^2/s flows at 1 mm/s in a 50 um wide channel. Calculate Pe and the required channel length to achieve complete diffusive mixing across the width.",
              solution_rubric: "Pe = (10^-3 m/s * 50*10^-6 m) / 10^-10 m^2/s = 500. Diffusive mixing time t_mix ~ w^2 / (2D) = (2.5e-9)/(2e-10) = 12.5 s. Mixing channel length L = u * t_mix = 1 mm/s * 12.5 s = 12.5 mm."
            }
          ]
        },
        {
          tier_level: 5,
          title: "Tier 5: Lab-on-a-Chip Architecture & Frontiers",
          description: "Design integrated microfluidic systems: soft lithography, acoustic sorting, droplet PCR, and organ-on-a-chip.",
          milestones: [
            {
              title: "Digital Droplet Microfluidics & Capstone Design",
              concept_summary: "Harness droplet generation for single-cell genomics, digital PCR, and high-throughput drug screening at 10,000 droplets/second.",
              governing_equations: [
                {
                  title: "Capillary Number",
                  latex: "Ca = \\frac{\\mu v}{\\gamma}",
                  description: "Balance between viscous shear stress and interfacial tension.",
                  variables: [
                    { symbol: "Ca", meaning: "Capillary number (dimensionless)" },
                    { symbol: "\\gamma", meaning: "Interfacial tension", unit: "N/m" }
                  ]
                }
              ],
              simulation_type: "microfluidics_flow",
              simulation_config: { channelWidthUm: 40, flowRateUlMin: 5, fluid: "fluorinated_oil" },
              socratic_challenge: "Synthesize everything: In a flow-focusing droplet generator, explain why increasing continuous phase viscosity promotes droplet pinch-off at lower flow rates using the Capillary number Ca.",
              solution_rubric: "Droplet pinch-off occurs when viscous shearing forces overcome surface tension forces (high Ca). Higher viscosity increases viscous shear for a given velocity, reaching the critical break-up Ca at lower volume flow rates."
            }
          ]
        }
      ]
    });
  }

  // Socratic conversation response
  return `That's a thoughtful approach! Let's examine your reasoning closely.

You are setting up the momentum equation for the microchannel flow. Consider the characteristic scale: when the channel dimension is on the order of tens of micrometers, what does the Reynolds number ($Re \\ll 1$) tell you about the convective acceleration terms $(u \\cdot \\nabla)u$ compared to the viscous diffusion term $\\nu \\nabla^2 u$?

Can you write down what the simplified Navier-Stokes equation reduces to under steady, creeping flow conditions?`;
}
