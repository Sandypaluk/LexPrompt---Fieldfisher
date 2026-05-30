import { useState } from "react";

const PERSONAS = [
  { id: "fee-earner", label: "Fee earner", accent: "#D4A853", bg: "rgba(212,168,83,0.12)", border: "rgba(212,168,83,0.3)" },
  { id: "bd-comms", label: "BD & comms", accent: "#7EB8D4", bg: "rgba(126,184,212,0.12)", border: "rgba(126,184,212,0.3)" },
  { id: "hr-people", label: "HR & people", accent: "#7EC8A4", bg: "rgba(126,200,164,0.12)", border: "rgba(126,200,164,0.3)" },
  { id: "km-hub", label: "KM & hub", accent: "#A99BE8", bg: "rgba(169,155,232,0.12)", border: "rgba(169,155,232,0.3)" },
  { id: "operations", label: "Operations", accent: "#C4B8A8", bg: "rgba(196,184,168,0.12)", border: "rgba(196,184,168,0.3)" },
];

const PROMPTS = [
  { id: 1, persona: "fee-earner", title: "Contract risk summary", category: "summarisation", complexity: "Intermediate", text: "You are assisting a corporate lawyer at a UK law firm. I will paste a commercial contract below. Provide a structured summary: (1) parties and key dates, (2) main obligations of each party, (3) notable risk clauses or unusual provisions. One page max, plain English, suitable for an internal file note. Do not provide legal advice — flag anything requiring qualified review. [Paste contract here]" },
  { id: 2, persona: "fee-earner", title: "Plain English clause explainer", category: "drafting", complexity: "Starter", text: "I am a solicitor at an international law firm. Explain the following contract clause in plain English for a non-lawyer client. Keep it under 100 words. Do not provide legal advice — note that the client should seek qualified guidance before acting. [Paste clause here]" },
  { id: 3, persona: "fee-earner", title: "Client update email", category: "communication", complexity: "Starter", text: "Draft a client update email on the following matter development: [describe update]. Tone: clear, professional, reassuring. Structure: what happened, what it means for the client, next steps. Max 200 words. Do not include legal advice. A qualified lawyer must review before sending. [Add matter context]" },
  { id: 4, persona: "bd-comms", title: "Pitch intro paragraph", category: "communication", complexity: "Starter", text: "You are helping a BD manager at Fieldfisher, an international law firm. Write a compelling two-paragraph pitch introduction for [client sector] targeting [company name]. Tone: confident, approachable, international — not stuffy. Avoid legal jargon. End with a question that opens a conversation." },
  { id: 5, persona: "bd-comms", title: "Directory submission overview", category: "drafting", complexity: "Intermediate", text: "Write a 150-word practice overview for a legal directory submission for Fieldfisher's [practice group] team. Highlight: key capabilities, notable recent work (use [matter description]), and what differentiates the team. Tone: authoritative but readable. British English. No superlatives without evidence." },
  { id: 6, persona: "bd-comms", title: "Thought leadership post", category: "communication", complexity: "Intermediate", text: "Write a 300-word thought leadership article for LinkedIn from the perspective of a Fieldfisher partner on [topic]. Take a clear, opinionated point of view. Use plain English. No legal jargon. End with a question to drive engagement. British English. [Add topic and partner name/practice]" },
  { id: 7, persona: "hr-people", title: "Job description", category: "drafting", complexity: "Starter", text: "Draft a job description for a [job title] role at an international law firm. Structure: (1) About the role, (2) Key responsibilities (max 8 bullets), (3) About you (max 6 bullets), (4) About Fieldfisher. Plain English, no HR jargon. Inclusive language throughout. [Add level, team, location]" },
  { id: 8, persona: "hr-people", title: "Sensitive manager communication", category: "communication", complexity: "Intermediate", text: "Help me draft a message from a line manager to a team member regarding [topic]. Provide three versions: formal, supportive, and neutral. Keep each under 150 words. Employment law varies by jurisdiction — confirm applicability before sending. [Add topic and jurisdiction]" },
  { id: 9, persona: "km-hub", title: "Know-how article", category: "analysis", complexity: "Intermediate", text: "Write a know-how article for Fieldfisher's internal knowledge base on [legal topic]. Structure: (1) headline summary (2 sentences), (2) key points (3–5 bullets), (3) detail (2–3 paragraphs), (4) related resources, (5) last reviewed date. Plain English. Flag where jurisdiction-specific variants may be needed. [Add topic and jurisdiction]" },
  { id: 10, persona: "km-hub", title: "AI session recap", category: "summarisation", complexity: "Starter", text: "Summarise the following AI knowledge-sharing session for the Fieldfisher intranet. Include: (1) what was covered, (2) three key takeaways, (3) one action contributors can take this week. Friendly, encouraging tone. Max 200 words. [Paste session notes here]" },
  { id: 11, persona: "operations", title: "Process documentation", category: "drafting", complexity: "Starter", text: "Document the following process as a step-by-step guide for internal use at a law firm. Use numbered steps. Include: purpose, who this applies to, the steps, and who to contact with questions. Plain English. Flag any steps that require sign-off or approval. [Describe the process here]" },
  { id: 12, persona: "operations", title: "Vendor comparison", category: "analysis", complexity: "Intermediate", text: "Compare the following [number] vendors for [service type] across these criteria: [list criteria]. Present as a structured summary with a recommendation and rationale. Note any information gaps. Flag if a legal or compliance review is recommended before proceeding. [Add vendor names and criteria]" },
];

const CLEAR_CRITERIA = [
  { key: "C", name: "Context", desc: "Does it give Claude enough background — role, task, and purpose?" },
  { key: "L", name: "Language", desc: "Is it plain and unambiguous enough for any contributor to use?" },
  { key: "E", name: "Expected output", desc: "Does it specify format, length, tone, or scope?" },
  { key: "A", name: "Aligned", desc: "Does it comply with responsible AI and confidentiality standards?" },
  { key: "R", name: "Repeatable", desc: "Will it produce consistent results across different users?" },
];

function scoreCLEAR(text) {
  const len = text.length;
  const hasRole = /lawyer|solicitor|partner|associate|BD|HR|manager|analyst|fee earner|counsel|you are/i.test(text);
  const hasFormat = /bullet|table|paragraph|summary|list|format|structure|numbered|one page|\d+ word/i.test(text);
  const hasScope = /jurisdiction|UK|EU|English|German|max|only|focus|limit|brief|no more than/i.test(text);
  const hasConfidentiality = /anonymi|client name|confidential|remove|redact|matter/i.test(text);
  const hasReviewCaveat = /review|qualified|sign.?off|before sending|before use|must review/i.test(text);
  const hasBrackets = /\[.+?\]/.test(text);
  const isVague = len < 60;
  const C = hasRole && len > 80 ? "pass" : hasRole || len > 150 ? "warn" : "fail";
  const L = isVague ? "warn" : len > 40 ? "pass" : "warn";
  const E = (hasFormat && hasScope) ? "pass" : (hasFormat || hasScope || hasBrackets) ? "warn" : "fail";
  const A = (hasConfidentiality && hasReviewCaveat) ? "pass" : (hasConfidentiality || hasReviewCaveat) ? "warn" : "fail";
  const R = (hasBrackets && (hasFormat || len > 150) && (hasRole || len > 200)) ? "pass" : (hasBrackets || len > 150) ? "warn" : "fail";
  const scores = { C, L, E, A, R };
  const vals = Object.values(scores);
  const fails = vals.filter(v => v === "fail").length;
  const passes = vals.filter(v => v === "pass").length;
  const verdict = fails >= 2 ? "returned" : passes >= 4 ? "approved" : "review";
  return { scores, verdict };
}

function getFeedback(key, score) {
  const map = {
    C: { pass: "Role and task context are well established.", warn: "Some context provided but role or purpose could be more specific.", fail: "No role or context provided — Claude won't know who is asking or why." },
    L: { pass: "Language is plain and unambiguous.", warn: "Key action word is slightly ambiguous — specify what kind of output you mean.", fail: "Too vague for reliable reuse across contributors." },
    E: { pass: "Format and scope are clearly specified.", warn: "Partially specified — add length, structure, or output format guidance.", fail: "No format, length, or scope specified. Output will be unpredictable." },
    A: { pass: "Confidentiality reminder and review caveat both present.", warn: "Partially aligned — add either a confidentiality note or a review caveat.", fail: "No confidentiality reminder or review caveat. Risk for matter-specific use." },
    R: { pass: "Uses placeholders and specifies format — reliable across users.", warn: "Would produce variable results. Add more structure or [placeholders].", fail: "Will produce inconsistent results. Add [placeholders] and specify format." },
  };
  return map[key][score];
}

const scoreIcon = { pass: "✅", warn: "⚠️", fail: "❌" };

const verdictConfig = {
  approved: { label: "Approved for Prompt Bank", bg: "rgba(126,200,164,0.15)", color: "#7EC8A4", border: "rgba(126,200,164,0.25)", icon: "✅" },
  review: { label: "Approved with edits", bg: "rgba(212,168,83,0.15)", color: "#D4A853", border: "rgba(212,168,83,0.25)", icon: "⚠️" },
  returned: { label: "Returned for revision", bg: "rgba(220,80,80,0.15)", color: "#E07070", border: "rgba(220,80,80,0.25)", icon: "❌" },
};

const glass = {
  background: "rgba(255,255,255,0.05)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 14,
};

function PersonaBadge({ persona }) {
  const p = PERSONAS.find(x => x.id === persona);
  if (!p) return null;
  return (
    <span style={{
      fontSize: 11, padding: "2px 10px", borderRadius: 20,
      background: p.bg, color: p.accent, border: `1px solid ${p.border}`,
      whiteSpace: "nowrap", flexShrink: 0, fontWeight: 500
    }}>{p.label}</span>
  );
}

function BrowseScreen({ onCopy, copiedId, extraPrompts = [] }) {
  const [filter, setFilter] = useState("all");
  const allPrompts = [...PROMPTS, ...extraPrompts];
  const filtered = filter === "all" ? allPrompts : allPrompts.filter(p => p.persona === filter);

  return (
    <div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {[{ id: "all", label: "All prompts", accent: "#D4A853" }, ...PERSONAS].map(p => {
          const persona = PERSONAS.find(x => x.id === p.id);
          const isActive = filter === p.id;
          const ac = persona?.accent || "#D4A853";
          return (
            <button key={p.id} onClick={() => setFilter(p.id)} style={{
              fontSize: 12, padding: "5px 16px", borderRadius: 20, cursor: "pointer",
              border: isActive ? `1.5px solid ${ac}` : "1px solid rgba(255,255,255,0.1)",
              background: isActive ? `rgba(${ac === "#D4A853" ? "212,168,83" : ac === "#7EB8D4" ? "126,184,212" : ac === "#7EC8A4" ? "126,200,164" : ac === "#A99BE8" ? "169,155,232" : "196,184,168"},0.15)` : "rgba(255,255,255,0.04)",
              color: isActive ? ac : "rgba(240,232,213,0.5)",
              fontWeight: isActive ? 500 : 400, transition: "all 0.15s",
              fontFamily: "inherit"
            }}>{p.label}</button>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
        {filtered.map(p => {
          const persona = PERSONAS.find(x => x.id === p.persona);
          return (
            <div key={p.id} style={{
              ...glass, padding: "1rem 1.1rem",
              display: "flex", flexDirection: "column", gap: 8,
              transition: "border-color 0.15s", cursor: "default"
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: "#F0E8D5", lineHeight: 1.4 }}>{p.title}</div>
                <PersonaBadge persona={p.persona} />
              </div>
              <div style={{
                fontSize: 12.5, color: "rgba(240,232,213,0.45)", lineHeight: 1.6,
                display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden"
              }}>{p.text}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
                <span style={{ fontSize: 11, color: "rgba(240,232,213,0.3)" }}>#{p.category} · {p.complexity}</span>
                <button onClick={() => onCopy(p)} style={{
                  fontSize: 12, padding: "3px 12px", borderRadius: 6,
                  border: `1px solid ${copiedId === p.id ? "rgba(126,200,164,0.4)" : "rgba(255,255,255,0.1)"}`,
                  background: copiedId === p.id ? "rgba(126,200,164,0.15)" : "transparent",
                  color: copiedId === p.id ? "#7EC8A4" : "rgba(240,232,213,0.5)",
                  cursor: "pointer", transition: "all 0.2s", fontFamily: "inherit"
                }}>
                  {copiedId === p.id ? "✓ Copied" : "Copy"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SubmitScreen({ onSubmit, onAddPrompt }) {
  const [persona, setPersona] = useState("");
  const [promptText, setPromptText] = useState("");
  const [result, setResult] = useState(null);
  const [scoring, setScoring] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const selectedPersona = PERSONAS.find(p => p.id === persona);

  const handleScore = () => {
    if (!promptText.trim()) return;
    setScoring(true);
    setResult(null);
    setTimeout(() => {
      const r = scoreCLEAR(promptText);
      setResult(r);
      setScoring(false);
      onSubmit();
      document.getElementById("result-anchor")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 900);
  };

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ ...glass, padding: "1.25rem" }}>
        <label style={{ fontSize: 12, fontWeight: 500, color: "rgba(240,232,213,0.5)", display: "block", marginBottom: 6, letterSpacing: "0.02em" }}>
          Your persona
        </label>
        <select value={persona} onChange={e => setPersona(e.target.value)} style={{
          width: "100%", marginBottom: 16, fontSize: 14, padding: "9px 12px",
          borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)",
          background: "rgba(4,33,63,0.6)", color: "#F0E8D5", fontFamily: "inherit"
        }}>
          <option value="">Select your role...</option>
          {PERSONAS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>

        <label style={{ fontSize: 12, fontWeight: 500, color: "rgba(240,232,213,0.5)", display: "block", marginBottom: 6, letterSpacing: "0.02em" }}>
          Your prompt
        </label>
        <textarea value={promptText} onChange={e => setPromptText(e.target.value)}
          placeholder="Paste your prompt here to score it against the CLEAR framework..."
          style={{
            width: "100%", minHeight: 110, fontSize: 13.5, padding: "10px 12px",
            borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(4,33,63,0.6)", color: "#F0E8D5",
            resize: "vertical", fontFamily: "inherit", lineHeight: 1.55, marginBottom: 16,
            outline: "none"
          }} />

        <button onClick={handleScore} disabled={!promptText.trim() || scoring} style={{
          width: "100%", padding: "11px 0", borderRadius: 10, border: "none",
          background: !promptText.trim() || scoring
            ? "rgba(255,255,255,0.08)"
            : "linear-gradient(135deg, #D4A853, #B8882A)",
          color: !promptText.trim() || scoring ? "rgba(255,255,255,0.25)" : "#04213F",
          fontSize: 14, fontWeight: 600,
          cursor: !promptText.trim() || scoring ? "not-allowed" : "pointer",
          fontFamily: "inherit", transition: "all 0.2s",
          boxShadow: promptText.trim() && !scoring ? "0 4px 20px rgba(212,168,83,0.25)" : "none"
        }}>
          {scoring ? "Scoring..." : "Score with CLEAR framework"}
        </button>
      </div>

      <div id="result-anchor" />

      {result && (
        <div style={{ marginTop: 16, animation: "fadeIn 0.3s ease" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8, marginBottom: 14 }}>
            {CLEAR_CRITERIA.map(c => {
              const score = result.scores[c.key];
              const color = score === "pass" ? "#7EC8A4" : score === "warn" ? "#D4A853" : "#E07070";
              const bg = score === "pass" ? "rgba(126,200,164,0.1)" : score === "warn" ? "rgba(212,168,83,0.1)" : "rgba(220,80,80,0.1)";
              const border = score === "pass" ? "rgba(126,200,164,0.2)" : score === "warn" ? "rgba(212,168,83,0.2)" : "rgba(220,80,80,0.2)";
              return (
                <div key={c.key} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 10, padding: "10px 6px", textAlign: "center" }}>
                  <div style={{ fontSize: 17, fontWeight: 600, color }}>{c.key}</div>
                  <div style={{ fontSize: 9, color: "rgba(240,232,213,0.35)", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.04em" }}>{c.name}</div>
                  <div style={{ fontSize: 17, marginTop: 4 }}>{scoreIcon[score]}</div>
                </div>
              );
            })}
          </div>

          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 14px", borderRadius: 10, marginBottom: 14,
            background: verdictConfig[result.verdict].bg,
            border: `1px solid ${verdictConfig[result.verdict].border}`,
            color: verdictConfig[result.verdict].color,
            fontSize: 14, fontWeight: 500
          }}>
            {verdictConfig[result.verdict].icon} {verdictConfig[result.verdict].label}
          </div>

          <div style={{ ...glass, overflow: "hidden", marginBottom: 14 }}>
            {CLEAR_CRITERIA.map((c, i) => (
              <div key={c.key} style={{
                padding: "10px 14px", display: "flex", gap: 10, alignItems: "flex-start",
                borderBottom: i < CLEAR_CRITERIA.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none"
              }}>
                <span style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }}>{scoreIcon[result.scores[c.key]]}</span>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 500, color: "#F0E8D5" }}>{c.key} — {c.name}: </span>
                  <span style={{ fontSize: 13, color: "rgba(240,232,213,0.55)" }}>{getFeedback(c.key, result.scores[c.key])}</span>
                </div>
              </div>
            ))}
          </div>

          {result.verdict === "approved" && (
            <div style={{ marginBottom: 14 }}>
              {!showAddForm ? (
                <button onClick={() => setShowAddForm(true)} style={{
                  width: "100%", padding: "11px 0", borderRadius: 10,
                  border: "1.5px solid rgba(212,168,83,0.4)",
                  background: "rgba(212,168,83,0.1)",
                  color: "#D4A853", fontSize: 14, fontWeight: 500, cursor: "pointer",
                  fontFamily: "inherit", transition: "all 0.2s"
                }}>+ Add to Prompt Bank</button>
              ) : (
                <div style={{ ...glass, padding: "1rem" }}>
                  <label style={{ fontSize: 12, color: "rgba(240,232,213,0.5)", display: "block", marginBottom: 6 }}>Prompt title</label>
                  <input value={newTitle} onChange={e => setNewTitle(e.target.value)}
                    placeholder="e.g. Contract risk summary"
                    style={{
                      width: "100%", fontSize: 14, padding: "9px 12px",
                      borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)",
                      background: "rgba(4,33,63,0.6)", color: "#F0E8D5",
                      fontFamily: "inherit", marginBottom: 12, outline: "none"
                    }} />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => {
                      if (!newTitle.trim()) return;
                      onAddPrompt({ title: newTitle, text: promptText, persona, category: "drafting", complexity: "Intermediate" });
                      setShowAddForm(false); setNewTitle(""); setPromptText(""); setResult(null);
                    }} style={{
                      padding: "8px 20px", borderRadius: 8, border: "none",
                      background: "linear-gradient(135deg, #D4A853, #B8882A)",
                      color: "#04213F", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit"
                    }}>Confirm add</button>
                    <button onClick={() => setShowAddForm(false)} style={{
                      padding: "8px 20px", borderRadius: 8,
                      border: "1px solid rgba(255,255,255,0.1)", background: "transparent",
                      color: "rgba(240,232,213,0.5)", fontSize: 13, cursor: "pointer", fontFamily: "inherit"
                    }}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {result.verdict !== "approved" && (
            <div style={{
              borderLeft: "2px solid #D4A853", borderRadius: "0 10px 10px 0",
              background: "rgba(212,168,83,0.06)", padding: "12px 14px"
            }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: "#D4A853", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                Suggested approach
              </div>
              <div style={{ fontSize: 13, color: "rgba(240,232,213,0.6)", lineHeight: 1.6 }}>
                Strengthen your prompt by: opening with your role ("You are assisting a [role] at Fieldfisher..."), specifying the output format and length, using [placeholders] for variable content, and adding a review caveat such as "A qualified lawyer must review before use."
              </div>
            </div>
          )}
        </div>
      )}
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } } select option { background: #082E58; color: #F0E8D5; }`}</style>
    </div>
  );
}

function StatsScreen({ sessionCount, extraCount }) {
  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { num: PROMPTS.length + extraCount, label: "Approved prompts" },
          { num: PERSONAS.length, label: "Personas covered" },
          { num: sessionCount, label: "Scored this session" },
        ].map(s => (
          <div key={s.label} style={{ ...glass, padding: "16px 12px", textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 500, color: "#D4A853" }}>{s.num}</div>
            <div style={{ fontSize: 12, color: "rgba(240,232,213,0.4)", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ ...glass, padding: "1.25rem", marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: "#F0E8D5", marginBottom: 12 }}>The CLEAR framework</div>
        {CLEAR_CRITERIA.map((c, i) => (
          <div key={c.key} style={{
            display: "flex", gap: 12, padding: "8px 0",
            borderBottom: i < CLEAR_CRITERIA.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none"
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#D4A853", width: 16, flexShrink: 0 }}>{c.key}</span>
            <div>
              <span style={{ fontSize: 13, fontWeight: 500, color: "#F0E8D5" }}>{c.name} — </span>
              <span style={{ fontSize: 13, color: "rgba(240,232,213,0.5)" }}>{c.desc}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: "rgba(212,168,83,0.08)", border: "1px solid rgba(212,168,83,0.15)", borderRadius: 12, padding: "12px 14px" }}>
        <div style={{ fontSize: 12, color: "rgba(212,168,83,0.8)", lineHeight: 1.6 }}>
          <strong>Maintained by:</strong> Fieldfisher AI Knowledge Hub, Berlin.<br />
          Every prompt is reviewed against the CLEAR framework before approval.
        </div>
      </div>
    </div>
  );
}

export default function LexPrompt() {
  const [screen, setScreen] = useState("browse");
  const [copiedId, setCopiedId] = useState(null);
  const [sessionCount, setSessionCount] = useState(0);
  const [extraPrompts, setExtraPrompts] = useState([]);

  const handleCopy = (prompt) => {
    navigator.clipboard.writeText(prompt.text).then(() => {
      setCopiedId(prompt.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleSubmit = () => setSessionCount(c => c + 1);

  const handleAddPrompt = (prompt) => {
    setExtraPrompts(p => [...p, { ...prompt, id: Date.now() }]);
    setScreen("browse");
  };

  const navItems = [
    { id: "browse", label: "Browse" },
    { id: "submit", label: "Submit & score" },
    { id: "stats", label: "Stats" },
  ];

  return (
    <div style={{
      fontFamily: "'Georgia', serif", minHeight: "100vh",
      background: "linear-gradient(135deg, #04213F 0%, #082E58 40%, #0A3566 70%, #062847 100%)",
      position: "relative", overflow: "hidden"
    }}>
      {/* Background orbs */}
      <div style={{ position: "fixed", top: -100, right: -100, width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, rgba(212,168,83,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: -60, left: -60, width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(126,184,212,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* Header */}
      <div style={{
        background: "rgba(4,20,40,0.6)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(212,168,83,0.12)",
        padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 100
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 9,
            background: "linear-gradient(135deg, #D4A853, #B8882A)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, color: "#04213F", fontWeight: 700,
            boxShadow: "0 2px 12px rgba(212,168,83,0.3)"
          }}>L</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 500, color: "#F0E8D5", letterSpacing: "0.01em" }}>
              Lex<span style={{ color: "#D4A853" }}>Prompt</span>
            </div>
            <div style={{ fontSize: 10, color: "rgba(240,232,213,0.35)", marginTop: 1, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Fieldfisher AI Prompt Bank
            </div>
          </div>
        </div>

        <nav style={{ display: "flex", gap: 6 }}>
          {navItems.map(n => (
            <button key={n.id} onClick={() => setScreen(n.id)} style={{
              fontSize: 13, padding: "6px 16px", borderRadius: 20, cursor: "pointer",
              border: screen === n.id ? "1.5px solid rgba(212,168,83,0.6)" : "1px solid rgba(255,255,255,0.1)",
              background: screen === n.id ? "rgba(212,168,83,0.15)" : "rgba(255,255,255,0.04)",
              color: screen === n.id ? "#D4A853" : "rgba(240,232,213,0.5)",
              fontFamily: "inherit", transition: "all 0.15s", fontWeight: screen === n.id ? 500 : 400
            }}>{n.label}</button>
          ))}
        </nav>
      </div>

      <div style={{ padding: "28px" }}>
        {screen === "browse" && <BrowseScreen onCopy={handleCopy} copiedId={copiedId} extraPrompts={extraPrompts} />}
        {screen === "submit" && <SubmitScreen sessionCount={sessionCount} onSubmit={handleSubmit} onAddPrompt={handleAddPrompt} />}
        {screen === "stats" && <StatsScreen sessionCount={sessionCount} extraCount={extraPrompts.length} />}
      </div>

      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } ::placeholder { color: rgba(240,232,213,0.2) !important; } ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: rgba(212,168,83,0.3); border-radius: 2px; }`}</style>
    </div>
  );
}
