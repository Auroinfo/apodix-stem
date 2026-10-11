# APODIX: Autonomous First-Principles STEM Derivation Engine

> **"Derive the Universe from First Principles."**  
> *Named after ancient Greek ἀπόδειξις (apodeixis) — Aristotle’s foundational epistemological concept in the Posterior Analytics denoting demonstrative, rigorous scientific proof from first principles.*

**APODIX** is an autonomous, multi-model Socratic STEM learning platform and curriculum architect. Designed to eliminate the passive "instant-answer" trap of standard chatbots (like ChatGPT), APODIX enforces **productive struggle** and **cognitive scaffolding**. Students construct mathematical proofs line-by-line, test physical assumptions through interactive laboratories, and receive Socratic guidance anchored in fundamental conservation laws.

---

## 🌟 What Makes APODIX Superior & User-Friendly

### 1. The First-Principles Socratic Engine (Anti-Cheat & Anti-Spoonfeeding)
* **Never Dumps Solutions:** If a student asks "tell me the answer" or "give me the code", APODIX politely declines and prompts an intuitive physical counter-question instead.
* **Line-by-Line Derivation Grader:** Students submit their proof step-by-step. The engine evaluates each line and outputs:
  * `[APODIX Verified ✓]` (Emerald)
  * `[Caution / Incomplete Premise ⚠️]` (Amber)
  * `[Physical or Mathematical Inconsistency ✗]` (Rose)
* **Quick Math & Formula Palette:** Eliminates LaTeX friction. With a single click, students can insert derivatives (`\frac{d}{dy}`, `\frac{\partial}{\partial y}`), integrals (`\int`), operators (`\nabla`, `\Delta P`), and physical parameters (`\mu`, `\rho`, `\gamma`, `Re \ll 1`).

### 2. Autonomous 5-Tier Curriculum Architect
Enter *any* scientific or engineering topic—such as **Microfluidics**, **Quantum Field Theory**, **CRISPR Circuit Design**, or **Hypersonic Aerodynamics**—and APODIX synthesizes a university-grade syllabus:
* **Tier 1:** Foundations & Scale Invariance (Continuum limits, Knudsen numbers)
* **Tier 2:** Governing Mechanics & Analytical Derivations (Hagen-Poiseuille, Stokes flow)
* **Tier 3:** Interfacial & Boundary Dynamics (Young-Laplace pressure, capillarity)
* **Tier 4:** Transport Scaling & Non-Linearities (Péclet numbers, Taylor dispersion)
* **Tier 5:** Integrated Systems & Capstone Challenges (Lab-on-a-Chip droplet devices)

### 3. Integrated Physics & Transport Laboratories
* **Microfluidics Flow Lab:** Real-time Hagen-Poiseuille velocity profiles, dynamic Reynolds numbers ($Re$), pressure drops ($\Delta P$), and creeping flow particle tracers.
* **Péclet Laminar Diffusion Lab:** Visualizes molecular diffusion fronts across laminar stream boundaries.
* **Generic Parametric Visualizer:** Real-time waveform and parameter explorer for custom equations.

### 4. Smart Whiteboard with APODIX Vision
* Built for **Stylus, Apple Pencil, Multi-Touch, and Mouse**.
* Features pen, highlighter, eraser, and an interactive **Background Switcher** (Isometric Dots, Cartesian Grid, or Blank Slate).
* **Inspect Whiteboard:** Submits drawing to the multimodal AI engine to evaluate free-body diagrams, sketches, and handwritten proofs.

### 5. Multi-Model AI Engine & Admin Console (`/admin`)
* Supports any AI model with 1-click hot swapping:
  * **Google Gemini** (`gemini-2.5-flash`, `gemini-1.5-pro`)
  * **OpenAI** (`gpt-4o`, `gpt-4o-mini`, `o1`, `o3-mini`)
  * **Anthropic Claude** (`claude-3-5-sonnet-20241022`)
  * **DeepSeek** (`deepseek-chat` / V3 / R1)
  * **Groq** (`llama-3.3-70b-versatile`)
  * **Ollama** (`http://localhost:11434/v1` for 100% offline, free local inference)
  * **OpenRouter** & **Custom OpenAI-Compatible** endpoints
* **Live Ping & Latency Benchmarks:** Click "Test Connection" to ping models in real-time.
* **Socratic Rigor Controls:** Toggle between *Strict Socratic*, *Balanced Scaffolding*, and *Guided Derivations*.

### 6. The Map of Everything & Hard 30 Arena
* **Concept Library (`/concept`):** An interconnected knowledge map linking prerequisites to downstream concepts with LaTeX mathematical formulations.
* **Hard 30 Arena (`/hard30`):** Daily 30-minute sprint derivation challenges designed for deep cognitive endurance.
* **Active Recall Flashcards (`/flashcards`):** 3D flip cards testing physical intuition, dimensionless numbers, and conservation laws.

---

## 💾 Database Architecture

* **Database Engine:** **SQLite** with **Write-Ahead Logging (WAL mode)** via `better-sqlite3`.
* **Path:** `data/tutor.db`
* **Features:**
  * Zero external Docker or cloud dependency required to run locally.
  * Microsecond query speeds with concurrent reader support.
  * Stores all curricula, LaTeX governing equations, student derivation attempts, and misconceptions.

---

## 🚀 Running APODIX

APODIX is live locally at:
👉 **[http://localhost:3000](http://localhost:3000)**

### Quick Links:
* **Curricula Hub:** [http://localhost:3000](http://localhost:3000)
* **Microfluidics Socratic Studio:** [http://localhost:3000/curriculum/sp-microfluidics-master](http://localhost:3000/curriculum/sp-microfluidics-master)
* **Knowledge Map (Concept Library):** [http://localhost:3000/concept](http://localhost:3000/concept)
* **Hard 30 Derivation Arena:** [http://localhost:3000/hard30](http://localhost:3000/hard30)
* **Active Recall Flashcards:** [http://localhost:3000/flashcards](http://localhost:3000/flashcards)
* **AI Admin Console:** [http://localhost:3000/admin](http://localhost:3000/admin)
