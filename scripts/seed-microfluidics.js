const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(path.join(dataDir, 'tutor.db'));

const studyPathId = 'sp-microfluidics-master';

// Check if already seeded
const existing = db.prepare('SELECT id FROM study_paths WHERE id = ?').get(studyPathId);
if (existing) {
  console.log('Microfluidics master curriculum already seeded.');
  process.exit(0);
}

const prerequisites = [
  {
    id: "pre-1",
    question: "When the characteristic Reynolds number Re is much less than 1 (Re << 1), which physical forces govern fluid momentum?",
    options: [
      "Inertial forces (convective acceleration)",
      "Viscous forces (shear stress dissipation)",
      "Turbulent eddy cascade",
      "Gravitational buoyancy"
    ],
    correctIndex: 1,
    conceptTested: "Low-Reynolds Stokes Regime",
    explanation: "At Re << 1, convective inertial terms (u · ∇)u vanish relative to viscous shear stresses μ ∇²u, resulting in linear, time-reversible Stokes flow."
  },
  {
    id: "pre-2",
    question: "What physical condition is universally imposed at the solid channel walls in classic continuum fluid dynamics?",
    options: [
      "Slip velocity proportional to pressure drop",
      "No-slip boundary condition (fluid velocity u = 0 at wall)",
      "Infinite shear stress singularity",
      "Capillary evaporation condition"
    ],
    correctIndex: 1,
    conceptTested: "No-Slip Boundary Condition",
    explanation: "At continuum length scales, attractive intermolecular interactions between the fluid and solid boundary force the relative fluid velocity to zero at the wall (u_fluid = u_wall)."
  },
  {
    id: "pre-3",
    question: "How does the surface area-to-volume ratio (A/V) scale as a characteristic dimension L decreases to the micrometer level?",
    options: [
      "Decreases proportionally (A/V ~ L)",
      "Remains constant",
      "Increases inversely (A/V ~ 1/L)",
      "Scales quadratically (A/V ~ L²)"
    ],
    correctIndex: 2,
    conceptTested: "Scaling Laws & Surface Dominance",
    explanation: "Because surface area scales as L² and volume scales as L³, the ratio A/V scales as 1/L. At micron scales, surface effects (surface tension, wall charge) completely dominate volumetric forces (gravity, inertia)."
  }
];

const modules = [
  {
    id: "mod-1",
    tier_level: 1,
    title: "Tier 1: Continuum Limits & Scale Invariance",
    description: "Foundational breakdown: When does the Navier-Stokes framework hold, and what happens when volume forces yield to surface forces?",
    order_index: 0,
    milestones: [
      {
        id: "ms-1-1",
        title: "The Knudsen Number Criterion & Continuum Validity",
        order_index: 0,
        concept_summary: "In microfluidics, we must first verify whether the fluid behaves as a continuous continuum or as discrete molecular collisions. The Knudsen number Kn = λ / L_c compares the molecular mean free path λ to the channel hydraulic diameter L_c. For liquids, λ is on the order of angstroms (0.3 nm for water), meaning continuum assumptions hold down to channels of tens of nanometers.",
        governing_equations: [
          {
            title: "Knudsen Number",
            latex: "Kn = \\frac{\\lambda}{L_c}",
            description: "Criterion for validity of continuum mechanics (Kn < 0.001) vs slip flow or free-molecular regime.",
            variables: [
              { symbol: "Kn", meaning: "Knudsen number (dimensionless)" },
              { symbol: "\\lambda", meaning: "Molecular mean free path", unit: "m" },
              { symbol: "L_c", meaning: "Characteristic channel dimension", unit: "m" }
            ]
          }
        ],
        simulation_type: "microfluidics_flow",
        simulation_config: { channelWidthUm: 50, flowRateUlMin: 2.0, fluid: "water" },
        socratic_challenge: "For liquid water at 25°C, the mean molecular spacing λ ≈ 0.3 nm. If you design a microchannel of width w = 10 μm, determine the Knudsen number. Does the Navier-Stokes equation hold, and why can we confidently apply the no-slip boundary condition at the channel walls?",
        solution_rubric: "Kn = 0.3e-9 / 10e-6 = 3.0e-5. Because Kn << 10^-3, the continuum hypothesis is rigorously satisfied. The fluid behaves as a continuum, ensuring Navier-Stokes equations and no-slip boundary conditions hold without slip corrections."
      }
    ]
  },
  {
    id: "mod-2",
    tier_level: 2,
    title: "Tier 2: Creeping Flow & Hagen-Poiseuille Hydrodynamics",
    description: "Analytical derivations of steady, pressure-driven viscous flow in microchannels: velocity profiles, hydrodynamic resistance, and Stokes reversibility.",
    order_index: 1,
    milestones: [
      {
        id: "ms-2-1",
        title: "Derivation of the Parabolic Velocity Profile (Hagen-Poiseuille)",
        order_index: 0,
        concept_summary: "Under low Reynolds numbers (Re << 1), convective acceleration (u · ∇)u is negligible. The steady Navier-Stokes momentum equation simplifies to a pure balance between the applied axial pressure gradient and viscous shear stress. In a channel bounded by parallel plates at y = ±h, integrating the governing differential equation yields a parabolic velocity distribution.",
        governing_equations: [
          {
            title: "Simplified 1D Navier-Stokes",
            latex: "\\mu \\frac{d^2 u}{d y^2} = \\frac{d P}{d x}",
            description: "Balance between viscous shear stress gradient and driving pressure gradient in creeping flow.",
            variables: [
              { symbol: "\\mu", meaning: "Dynamic viscosity", unit: "Pa·s" },
              { symbol: "u(y)", meaning: "Axial flow velocity as a function of vertical coordinate y", unit: "m/s" },
              { symbol: "\\frac{dP}{dx}", meaning: "Axial pressure gradient along channel length", unit: "Pa/m" }
            ]
          },
          {
            title: "Parabolic Velocity Profile",
            latex: "u(y) = \\frac{1}{2\\mu} \\left(-\\frac{dP}{dx}\\right) (h^2 - y^2)",
            description: "Resulting quadratic velocity distribution with maximum at centerline y = 0 and zero at walls y = ±h.",
            variables: [
              { symbol: "h", meaning: "Half-height of channel", unit: "m" },
              { symbol: "y", meaning: "Distance from channel center", unit: "m" }
            ]
          }
        ],
        simulation_type: "microfluidics_flow",
        simulation_config: { channelWidthUm: 80, flowRateUlMin: 5.0, fluid: "water" },
        socratic_challenge: "Starting from the 1D balance μ (d²u/dy²) = dP/dx with constant dP/dx < 0, carry out the integration with respect to y. What are the two physical boundary conditions at the channel centerline (y = 0) and at the wall (y = h) that allow you to determine the integration constants?",
        solution_rubric: "1. Integrate once: μ du/dy = (dP/dx)y + C1. Centerline symmetry requires du/dy = 0 at y = 0, which forces C1 = 0. 2. Integrate again: μ u(y) = (1/2)(dP/dx)y^2 + C2. Apply no-slip at wall: u(h) = 0 => C2 = -(1/2)(dP/dx)h^2. 3. Result: u(y) = -(dP/dx)/(2μ) * (h^2 - y^2)."
      }
    ]
  },
  {
    id: "mod-3",
    tier_level: 3,
    title: "Tier 3: Interfacial Physics & Young-Laplace Capillarity",
    description: "Multiphase microfluidics: Surface tension dominance, contact angles, Laplace pressure, and droplet generation.",
    order_index: 2,
    milestones: [
      {
        id: "ms-3-1",
        title: "Young-Laplace Discontinuity & Passive Capillary Pumping",
        order_index: 0,
        concept_summary: "At micron scales, surface tension γ (typically 20-72 mN/m) generates enormous pressure discontinuities across curved fluid interfaces. The Young-Laplace equation relates this pressure jump ΔP to the principal radii of curvature. This enables passive capillary pumping without external syringes.",
        governing_equations: [
          {
            title: "Young-Laplace Equation",
            latex: "\\Delta P = \\gamma \\left( \\frac{1}{R_1} + \\frac{1}{R_2} \\right)",
            description: "Pressure jump sustained across a static or dynamic curved fluid interface.",
            variables: [
              { symbol: "\\Delta P", meaning: "Laplace pressure difference (P_inside - P_outside)", unit: "Pa" },
              { symbol: "\\gamma", meaning: "Interfacial / surface tension", unit: "N/m" },
              { symbol: "R_1, R_2", meaning: "Principal radii of curvature", unit: "m" }
            ]
          }
        ],
        simulation_type: "diffusion",
        simulation_config: { peclet: 80, diffusionCoeff: 1e-9 },
        socratic_challenge: "Suppose droplet A has radius R_A = 10 μm and droplet B has radius R_B = 100 μm in water with γ = 0.072 N/m. If a microfluidic channel connects the two droplets, calculate the Laplace pressure of each droplet. In which direction will fluid flow, and why does this seem counterintuitive to casual intuition?",
        solution_rubric: "ΔP_A = 2γ/R_A = 2(0.072)/10e-6 = 14,400 Pa (14.4 kPa). ΔP_B = 2γ/R_B = 2(0.072)/100e-6 = 1,440 Pa (1.44 kPa). Because ΔP_A is 10 times higher than ΔP_B, fluid will flow from the smaller droplet into the larger droplet until the small droplet vanishes. This is counterintuitive because people expect smaller objects to absorb fluid from larger ones, but high curvature dictates higher internal pressure."
      }
    ]
  },
  {
    id: "mod-4",
    tier_level: 4,
    title: "Tier 4: Convective-Diffusive Transport & Péclet Scaling",
    description: "Mass transport without turbulence: How to mix fluids in laminar regimes using Taylor dispersion, chaotic advection, and herringbone grooves.",
    order_index: 3,
    milestones: [
      {
        id: "ms-4-1",
        title: "Taylor Dispersion & The Péclet Mixing Length",
        order_index: 0,
        concept_summary: "In laminar microchannels, Reynolds numbers remain below critical transition values (Re << 2000), making turbulent vortex mixing impossible. Molecular mixing occurs purely by diffusion across parallel laminar streams. The Péclet number Pe = u L / D measures the ratio of advective transport to molecular diffusion.",
        governing_equations: [
          {
            title: "Péclet Number",
            latex: "Pe = \\frac{u \\cdot w}{D}",
            description: "Ratio of advection rate to diffusion rate across channel width w.",
            variables: [
              { symbol: "Pe", meaning: "Péclet number (dimensionless)" },
              { symbol: "u", meaning: "Mean axial velocity", unit: "m/s" },
              { symbol: "w", meaning: "Channel diffusion distance / width", unit: "m" },
              { symbol: "D", meaning: "Molecular diffusion coefficient", unit: "m²/s" }
            ]
          }
        ],
        simulation_type: "diffusion",
        simulation_config: { peclet: 120, diffusionCoeff: 5e-10 },
        socratic_challenge: "A fluorescein dye (D = 5 × 10^-10 m²/s) is injected alongside a buffer stream in a Y-junction microchannel of width w = 100 μm flowing at mean velocity u = 1 mm/s. Calculate the Péclet number Pe and determine the minimum channel length L_mix required for the dye to diffuse completely across the channel.",
        solution_rubric: "1. Pe = (10^-3 m/s * 100e-6 m) / (5e-10 m²/s) = 200. 2. Characteristic diffusion time across width w is t_diff ≈ w² / (2D) = (100e-6)² / (2 * 5e-10) = 1e-8 / 1e-9 = 10 seconds. 3. Required channel length L_mix = u * t_diff = (10^-3 m/s) * 10 s = 10 mm (1.0 cm)."
      }
    ]
  },
  {
    id: "mod-5",
    tier_level: 5,
    title: "Tier 5: Lab-on-a-Chip Architecture & Digital Droplet Genomics",
    description: "Capstone integration: Design high-throughput droplet generators for single-cell sequencing and digital PCR.",
    order_index: 4,
    milestones: [
      {
        id: "ms-5-1",
        title: "Flow-Focusing Droplet Generation & Capillary Number Dynamics",
        order_index: 0,
        concept_summary: "Digital droplet microfluidics encapsulates single cells or DNA molecules inside picoliter water-in-oil emulsion droplets. In a flow-focusing geometry, the continuous oil phase pinches the dispersed aqueous stream through an orifice. The transition between squeezing, dripping, and jetting regimes is governed by the Capillary number Ca and Weber number.",
        governing_equations: [
          {
            title: "Capillary Number",
            latex: "Ca = \\frac{\\mu_{oil} \\cdot v_{oil}}{\\gamma}",
            description: "Balance between viscous shearing forces and interfacial tension forces promoting pinch-off.",
            variables: [
              { symbol: "Ca", meaning: "Capillary number (dimensionless)" },
              { symbol: "\\mu_{oil}", meaning: "Dynamic viscosity of continuous oil phase", unit: "Pa·s" },
              { symbol: "v_{oil}", meaning: "Velocity of oil stream at the orifice", unit: "m/s" },
              { symbol: "\\gamma", meaning: "Interfacial tension between water and fluorinated oil with surfactant", unit: "N/m" }
            ]
          }
        ],
        simulation_type: "microfluidics_flow",
        simulation_config: { channelWidthUm: 35, flowRateUlMin: 8.0, fluid: "fluorinated_oil" },
        socratic_challenge: "In a flow-focusing droplet junction, why does the addition of a fluorosurfactant (reducing γ from 50 mN/m to 5 mN/m) allow mono-disperse droplets to form at much lower continuous phase flow rates? Formulate your argument using the critical Capillary number Ca_crit.",
        solution_rubric: "Droplet break-off requires viscous shear forces to overcome surface tension, characterized by reaching a critical Capillary number Ca_crit ≈ μ*v/γ. By lowering γ by an order of magnitude, the denominator decreases tenfold, allowing Ca_crit to be reached at a tenfold lower velocity v_oil (and thus a much lower pump throughput), avoiding jetting instabilities."
      }
    ]
  }
];

const insertPath = db.prepare(`
  INSERT INTO study_paths (id, topic, target_audience, overview, prerequisites, current_milestone_id, progress_percent)
  VALUES (?, ?, ?, ?, ?, ?, 0)
`);

const insertModule = db.prepare(`
  INSERT INTO modules (id, study_path_id, tier_level, title, description, order_index)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const insertMilestone = db.prepare(`
  INSERT INTO milestones (id, module_id, title, order_index, concept_summary, governing_equations, simulation_type, simulation_config, socratic_challenge, solution_rubric, is_completed, mastery_score)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0)
`);

db.transaction(() => {
  insertPath.run(
    studyPathId,
    "Microfluidics",
    "Undergraduate to Advanced Researcher",
    "A rigorous, first-principles exploration of low Reynolds number hydrodynamics, Stokes flow, Young-Laplace capillarity, Taylor dispersion, and Lab-on-a-Chip droplet devices.",
    JSON.stringify(prerequisites),
    "ms-1-1"
  );

  modules.forEach(mod => {
    insertModule.run(
      mod.id,
      studyPathId,
      mod.tier_level,
      mod.title,
      mod.description,
      mod.order_index
    );

    mod.milestones.forEach(ms => {
      insertMilestone.run(
        ms.id,
        mod.id,
        ms.title,
        ms.order_index,
        ms.concept_summary,
        JSON.stringify(ms.governing_equations),
        ms.simulation_type,
        JSON.stringify(ms.simulation_config),
        ms.socratic_challenge,
        ms.solution_rubric
      );
    });
  });
})();

console.log('Successfully seeded master Microfluidics curriculum!');
