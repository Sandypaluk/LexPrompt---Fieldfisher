# LexPrompt — Fieldfisher AI Prompt Bank

> A production-ready AI prompt management and quality assurance tool built for legal professionals. Designed for Fieldfisher's AI Knowledge Hub as part of a firmwide responsible AI adoption programme.

**[Live Demo →](https://lex-prompt-fieldfisher.vercel.app/)** 

---

## What This Is

LexPrompt is a role-based AI prompt library and quality assurance tool designed specifically for a legal professional services environment. It solves a real problem in enterprise AI adoption: when an organisation rolls out AI tools to hundreds of non-technical contributors, prompt quality becomes wildly inconsistent — and inconsistent prompts produce inconsistent, unreliable outputs.

LexPrompt addresses this by giving contributors a curated, approved library of prompts built for their specific role, and a live scoring engine that evaluates new prompt submissions against a structured quality framework before they enter the library.

It was built as a demonstration of how AI enablement infrastructure can be designed for a law firm context — combining knowledge management principles, instructional design methodology, and responsible AI standards into a single, accessible tool.

---

## Features

### Browse
- 12 pre-approved prompts across 5 professional personas
- Filter by role: Fee earner, BD & Comms, HR & People, KM & Hub, Operations
- One-click copy to clipboard
- Complexity and category tagging for each prompt

### Submit & Score
- Paste any prompt and receive an instant CLEAR framework score
- Five-criterion evaluation with criterion-level feedback
- Verdict: Approved / Approved with edits / Returned for revision
- Suggested improvement guidance for prompts that don't pass

### Stats
- Live session tracking
- CLEAR framework reference panel
- Library overview by persona and category

---

## The CLEAR Framework

Every prompt in the LexPrompt library — and every submission — is evaluated against five criteria developed specifically for professional services AI use:

| Criterion | Question |
|---|---|
| **C — Context** | Does the prompt give Claude enough background — role, task, and purpose? |
| **L — Language** | Is it plain and unambiguous enough for any contributor to use reliably? |
| **E — Expected output** | Does it specify format, length, tone, or scope? |
| **A — Aligned** | Does it comply with responsible AI and confidentiality standards? |
| **R — Repeatable** | Will it produce consistent results across different users? |

The CLEAR framework was designed to be explainable to non-technical stakeholders — a Managing Partner can understand it as readily as a developer.

---

## Design Decisions

**Why role-based personas?**
In a law firm, a Corporate Associate and a BD Manager have fundamentally different needs, risk tolerances, and output formats. Generic AI prompts don't account for this. Persona-based filtering ensures every contributor sees prompts that are immediately relevant to how they actually work.

**Why a scoring engine rather than manual QA only?**
A Knowledge Hub team cannot manually review every prompt submission at scale. The CLEAR scoring engine provides instant, consistent first-pass feedback, coaching contributors toward better prompt engineering while freeing the Hub team to focus on edge cases and curriculum design.

**Why a standalone web app rather than a document or spreadsheet?**
A prompt library in a SharePoint folder gets ignored. A tool that gives instant feedback creates a feedback loop — contributors learn what good prompts look like by seeing their own submissions scored in real time.

---

## Tech Stack

- **React 18** with Vite
- **No external UI libraries** — all components hand-built for full design control
- **No backend required** — scoring logic runs entirely client-side
- **Deployed on Vercel** — zero infrastructure overhead

---

## About the Project

This tool was designed and built by **Sandra Paluku** as a pre-start demonstration for the AI Knowledge Hub role at Fieldfisher, an international law firm headquartered in London with offices across Europe and Asia.

The project reflects the core responsibilities of the role:

- **Tooling & Knowledge Infrastructure** — building and maintaining AI resources that are reliable, standards-aligned, and easy for non-technical contributors to use
- **Enablement & Adoption** — designing practical tools that lower the barrier to confident, responsible AI use
- **Responsible AI** — embedding confidentiality reminders, review caveats, and quality standards into the tool itself, not as an afterthought

The CLEAR framework, persona structure, and prompt library were developed in parallel with a full Fieldfisher Skills Library for Claude — a set of reusable AI instruction files that encode the firm's standards, methodology, and role-specific guidance.

---

## What's Next

LexPrompt is a demonstration prototype. A production version for Fieldfisher would include:

- **Authentication** — SSO integration with the firm's Microsoft tenancy
- **Submission workflow** — full review queue for the Knowledge Hub team
- **Analytics dashboard** — usage by persona, approval rates, most-used prompts
- **Copilot integration** — prompts surfaced directly in Microsoft 365 tools
- **Multilingual support** — German language prompts for the Berlin office

---

## Running Locally

```bash
git clone https://github.com/Sandra-Paluku/LexPrompt---Fieldfisher.git
cd LexPrompt---Fieldfisher
npm install
npm run dev
```

Open **http://localhost:5173/**

---

## Contact

**Sandra Paluku**
AI Knowledge & Enablement Professional
Berlin, Germany

[www.linkedin.com/in/sk-paluku](#) 

---

*Built for Fieldfisher's AI Knowledge Hub. Demonstrates responsible, practical, role-appropriate AI enablement infrastructure for a legal professional services environment.*
