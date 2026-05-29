import { useState, useEffect } from "react";

const PERSONAS = [
  { id: "fee-earner", label: "Fee earner", color: "#0C447C", bg: "#E6F1FB" },
  { id: "bd-comms", label: "BD & comms", color: "#BA7517", bg: "#FAEEDA" },
  { id: "hr-people", label: "HR & people", color: "#3B6D11", bg: "#EAF3DE" },
  { id: "km-hub", label: "KM & hub", color: "#534AB7", bg: "#EEEDFE" },
  { id: "operations", label: "Operations", color: "#5F5E5A", bg: "#F1EFE8" },
];

const PROMPTS = [
  {
    id: 1, persona: "fee-earner", title: "Contract risk summary", category: "summarisation", complexity: "Intermediate",
    text: "You are assisting a corporate lawyer at a UK law firm. I will paste a commercial contract below. Provide a structured summary: (1) parties and key dates, (2) main obligations of each party, (3) notable risk clauses or unusual provisions. One page max, plain English, suitable for an internal file note. Do not provide legal advice — flag anything requiring qualified review. [Paste contract here]"
  },
  {
    id: 2, persona: "fee-earner", title: "Plain English clause explainer", category: "drafting", complexity: "Starter",
    text: "I am a solicitor at an international law firm. Explain the following contract clause in plain English for a non-lawyer client. Keep it under 100 words. Do not provide legal advice — note that the client should seek qualified guidance before acting. [Paste clause here]"
  },
  {
    id: 3, persona: "fee-earner", title: "Client update email", category: "communication", complexity: "Starter",
    text: "Draft a client update email on the following matter development: [describe update]. Tone: clear, professional, reassuring. Structure: what happened, what it means for the client, next steps. Max 200 words. Do not include legal advice. A qualified lawyer must review before sending. [Add matter context]"
  },
  {
    id: 4, persona: "bd-comms", title: "Pitch intro paragraph", category: "communication", complexity: "Starter",
    text: "You are helping a BD manager at Fieldfisher, an international law firm. Write a compelling two-paragraph pitch introduction for [client sector] targeting [company name]. Tone: confident, approachable, international — not stuffy. Avoid legal jargon. End with a question that opens a conversation."
  },
  {
    id: 5, persona: "bd-comms", title: "Directory submission overview", category: "drafting", complexity: "Intermediate",
    text: "Write a 150-word practice overview for a legal directory submission for Fieldfisher's [practice group] team. Highlight: key capabilities, notable recent work (use [matter description]), and what differentiates the team. Tone: authoritative but readable. British English. No superlatives without evidence."
  },
  {
    id: 6, persona: "bd-comms", title: "Thought leadership post", category: "communication", complexity: "Intermediate",
    text: "Write a 300-word thought leadership article for LinkedIn from the perspective of a Fieldfisher partner on [topic]. Take a clear, opinionated point of view. Use plain English. No legal jargon. End with a question to drive engagement. British English. [Add topic and partner name/practice]"
  },
  {
    id: 7, persona: "hr-people", title: "Job description", category: "drafting", complexity: "Starter",
    text: "Draft a job description for a [job title] role at an international law firm. Structure: (1) About the role, (2) Key responsibilities (max 8 bullets), (3) About you (max 6 bullets), (4) About Fieldfisher. Plain English, no HR jargon. Inclusive language throughout. [Add level, team, location]"
  },
  {
    id: 8, persona: "hr-people", title: "Sensitive manager communication", category: "communication", complexity: "Intermediate",
    text: "Help me draft a message from a line manager to a team member regarding [topic]. Provide three versions: formal, supportive, and neutral. Keep each under 150 words. Employment law varies by jurisdiction — confirm applicability before sending. [Add topic and jurisdiction]"
  },
  {
    id: 9, persona: "km-hub", title: "Know-how article", category: "analysis", complexity: "Intermediate",
    text: "Write a know-how article for Fieldfisher's internal knowledge base on [legal topic]. Structure: (1) headline summary (2 sentences), (2) key points (3–5 bullets), (3) detail (2–3 paragraphs), (4) related resources, (5) last reviewed date. Plain English. Flag where jurisdiction-specific variants may be needed. [Add topic and jurisdiction]"
  },
  {
    id: 10, persona: "km-hub", title: "AI session recap", category: "summarisation", complexity: "Starter",
    text: "Summarise the following AI knowledge-sharing session for the Fieldfisher intranet. Include: (1) what was covered, (2) three key takeaways, (3) one action contributors can take this week. Friendly, encouraging tone. Max 200 words. [Paste session notes here]"
  },
  {
    id: 11, persona: "operations", title: "Process documentation", category: "drafting", complexity: "Starter",
    text: "Document the following process as a step-by-step guide for internal use at a law firm. Use numbered steps. Include: purpose, who this applies to, the steps, and who to contact with questions. Plain English. Flag any steps that require sign-off or approval. [Describe the process here]"
  },
  {
    id: 12, persona: "operations", title: "Vendor comparison", category: "analysis", complexity: "Intermediate",
    text: "Compare the following [number] vendors for [service type] across these criteria: [list criteria]. Present as a structured summary with a recommendation and rationale. Note any information gaps. Flag if a legal or compliance review is recommended before proceeding. [Add vendor names and criteria]"
  },
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
const scoreColor = { pass: "#3B6D11", warn: "#BA7517", fail: "#A32D2D" };
const scoreBg = { pass: "#EAF3DE", warn: "#FAEEDA", fail: "#FCEBEB" };

const verdictConfig = {
  approved: { label: "Approved for Prompt Bank", bg: "#EAF3DE", color: "#3B6D11", icon: "✅" },
  review: { label: "Approved with edits", bg: "#FAEEDA", color: "#BA7517", icon: "⚠️" },
  returned: { label: "Returned for revision", bg: "#FCEBEB", color: "#A32D2D", icon: "❌" },
};

function PersonaBadge({ persona }) {
  const p = PERSONAS.find(x => x.id === persona);
  if (!p) return null;
  return (
    <span style={{
      fontSize: 11, padding: "2px 9px", borderRadius: 20,
      background: p.bg, color: p.color, whiteSpace: "nowrap", flexShrink: 0, fontWeight: 500
    }}>{p.label}</span>
  );
}

function BrowseScreen({ onCopy, copiedId }) {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? PROMPTS : PROMPTS.filter(p => p.persona === filter);

  return (
    <div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {[{ id: "all", label: "All prompts" }, ...PERSONAS].map(p => (
          <button key={p.id} onClick={() => setFilter(p.id)} style={{
            fontSize: 12, padding: "5px 14px", borderRadius: 20, cursor: "pointer",
            border: filter === p.id ? `1.5px solid ${p.id === "all" ? "#0C447C" : PERSONAS.find(x => x.id === p.id)?.color || "#0C447C"}` : "1px solid #d0d0cc",
            background: filter === p.id ? (p.id === "all" ? "#E6F1FB" : PERSONAS.find(x => x.id === p.id)?.bg || "#E6F1FB") : "transparent",
            color: filter === p.id ? (p.id === "all" ? "#0C447C" : PERSONAS.find(x => x.id === p.id)?.color || "#0C447C") : "#666",
            fontWeight: filter === p.id ? 500 : 400, transition: "all 0.15s"
          }}>{p.label}</button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
        {filtered.map(p => (
          <div key={p.id} style={{
            background: "#fff", border: "0.5px solid #e0dfd8", borderRadius: 12,
            padding: "1rem 1.1rem", display: "flex", flexDirection: "column", gap: 8,
            transition: "border-color 0.15s", cursor: "default"
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "#aaa"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "#e0dfd8"}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: "#1a1a18", lineHeight: 1.4 }}>{p.title}</div>
              <PersonaBadge persona={p.persona} />
            </div>
            <div style={{
              fontSize: 12.5, color: "#666", lineHeight: 1.55,
              display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden"
            }}>{p.text}</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
              <span style={{ fontSize: 11, color: "#999" }}>#{p.category} · {p.complexity}</span>
              <button onClick={() => onCopy(p)} style={{
                fontSize: 12, padding: "3px 10px", borderRadius: 6,
                border: "0.5px solid #d0d0cc", background: copiedId === p.id ? "#EAF3DE" : "transparent",
                color: copiedId === p.id ? "#3B6D11" : "#666", cursor: "pointer", transition: "all 0.2s"
              }}>
                {copiedId === p.id ? "✓ Copied" : "Copy"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SubmitScreen({ sessionCount, onSubmit }) {
  const [persona, setPersona] = useState("");
  const [promptText, setPromptText] = useState("");
  const [result, setResult] = useState(null);
  const [scoring, setScoring] = useState(false);

  const handleScore = () => {
    if (!promptText.trim()) return;
    setScoring(true);
    setResult(null);
    setTimeout(() => {
      const r = scoreCLEAR(promptText);
      setResult(r);
      setScoring(false);
      onSubmit();
    }, 900);
  };

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ background: "#fff", border: "0.5px solid #e0dfd8", borderRadius: 12, padding: "1.25rem" }}>
        <label style={{ fontSize: 13, fontWeight: 500, color: "#555", display: "block", marginBottom: 6 }}>Your persona</label>
        <select value={persona} onChange={e => setPersona(e.target.value)}
          style={{ width: "100%", marginBottom: 16, fontSize: 14, padding: "8px 10px", borderRadius: 8, border: "0.5px solid #d0d0cc" }}>
          <option value="">Select your role...</option>
          {PERSONAS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>

        <label style={{ fontSize: 13, fontWeight: 500, color: "#555", display: "block", marginBottom: 6 }}>Your prompt</label>
        <textarea value={promptText} onChange={e => setPromptText(e.target.value)}
          placeholder="Paste your prompt here to score it against the CLEAR framework..."
          style={{
            width: "100%", minHeight: 110, fontSize: 13.5, padding: "10px 12px",
            borderRadius: 8, border: "0.5px solid #d0d0cc", resize: "vertical",
            fontFamily: "inherit", lineHeight: 1.55, marginBottom: 16
          }} />

        <button onClick={handleScore} disabled={!promptText.trim() || scoring} style={{
          width: "100%", padding: "10px 0", borderRadius: 8, border: "none",
          background: !promptText.trim() || scoring ? "#ccc" : "#0C447C",
          color: "#fff", fontSize: 14, fontWeight: 500, cursor: !promptText.trim() || scoring ? "not-allowed" : "pointer",
          transition: "opacity 0.15s"
        }}>
          {scoring ? "Scoring..." : "Score with CLEAR framework"}
        </button>
      </div>

      {result && (
        <div style={{ marginTop: 20, animation: "fadeIn 0.3s ease" }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: "#1a1a18", marginBottom: 12 }}>CLEAR score</div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8, marginBottom: 16 }}>
            {CLEAR_CRITERIA.map(c => (
              <div key={c.key} style={{
                background: scoreBg[result.scores[c.key]], borderRadius: 8,
                padding: "10px 6px", textAlign: "center"
              }}>
                <div style={{ fontSize: 18, fontWeight: 500, color: scoreColor[result.scores[c.key]] }}>{c.key}</div>
                <div style={{ fontSize: 10, color: "#888", marginTop: 2 }}>{c.name}</div>
                <div style={{ fontSize: 18, marginTop: 4 }}>{scoreIcon[result.scores[c.key]]}</div>
              </div>
            ))}
          </div>

          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 14px", borderRadius: 8, marginBottom: 16,
            background: verdictConfig[result.verdict].bg,
            color: verdictConfig[result.verdict].color,
            fontSize: 14, fontWeight: 500
          }}>
            {verdictConfig[result.verdict].icon} {verdictConfig[result.verdict].label}
          </div>

          <div style={{ background: "#fff", border: "0.5px solid #e0dfd8", borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
            {CLEAR_CRITERIA.map((c, i) => (
              <div key={c.key} style={{
                padding: "10px 14px", display: "flex", gap: 10, alignItems: "flex-start",
                borderBottom: i < CLEAR_CRITERIA.length - 1 ? "0.5px solid #f0efe8" : "none"
              }}>
                <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{scoreIcon[result.scores[c.key]]}</span>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 500, color: "#333" }}>{c.key} — {c.name}: </span>
                  <span style={{ fontSize: 13, color: "#666" }}>{getFeedback(c.key, result.scores[c.key])}</span>
                </div>
              </div>
            ))}
          </div>

          {result.verdict !== "approved" && (
            <div style={{
              borderLeft: "2px solid #0C447C", borderRadius: "0 8px 8px 0",
              background: "#f5f7fb", padding: "12px 14px"
            }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: "#0C447C", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                Suggested approach
              </div>
              <div style={{ fontSize: 13, color: "#333", lineHeight: 1.6 }}>
                Strengthen your prompt by: opening with your role ("You are assisting a [role] at Fieldfisher..."), specifying the output format and length, using [placeholders] for variable content, and adding a review caveat such as "A qualified lawyer must review before use."
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}

function StatsScreen({ sessionCount }) {
  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { num: PROMPTS.length, label: "Approved prompts" },
          { num: PERSONAS.length, label: "Personas covered" },
          { num: sessionCount, label: "Scored this session" },
        ].map(s => (
          <div key={s.label} style={{ background: "#f5f4f0", borderRadius: 10, padding: "14px 12px", textAlign: "center" }}>
            <div style={{ fontSize: 26, fontWeight: 500, color: "#0C447C" }}>{s.num}</div>
            <div style={{ fontSize: 12, color: "#888", marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ background: "#fff", border: "0.5px solid #e0dfd8", borderRadius: 12, padding: "1.25rem", marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: "#1a1a18", marginBottom: 10 }}>The CLEAR framework</div>
        {CLEAR_CRITERIA.map(c => (
          <div key={c.key} style={{ display: "flex", gap: 10, padding: "7px 0", borderBottom: "0.5px solid #f0efe8" }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: "#0C447C", width: 16, flexShrink: 0 }}>{c.key}</span>
            <div>
              <span style={{ fontSize: 13, fontWeight: 500, color: "#333" }}>{c.name} — </span>
              <span style={{ fontSize: 13, color: "#666" }}>{c.desc}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: "#E6F1FB", borderRadius: 10, padding: "12px 14px" }}>
        <div style={{ fontSize: 12, color: "#0C447C", lineHeight: 1.6 }}>
          <strong>Maintained by:</strong> Fieldfisher AI Knowledge Hub, Berlin.<br />
          Every prompt is reviewed against the CLEAR framework before approval. Submit a prompt on the Submit tab for an instant score.
        </div>
      </div>
    </div>
  );
}

export default function LexPrompt() {
  const [screen, setScreen] = useState("browse");
  const [copiedId, setCopiedId] = useState(null);
  const [sessionCount, setSessionCount] = useState(0);

  const handleCopy = (prompt) => {
    navigator.clipboard.writeText(prompt.text).then(() => {
      setCopiedId(prompt.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleSubmit = () => setSessionCount(c => c + 1);

  const navItems = [
    { id: "browse", label: "Browse" },
    { id: "submit", label: "Submit & score" },
    { id: "stats", label: "Stats" },
  ];

  return (
    <div style={{ fontFamily: "'Georgia', serif", minHeight: "100vh", background: "#fafaf7" }}>
      <div style={{
        background: "#fff", borderBottom: "0.5px solid #e0dfd8",
        padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8, background: "#0C447C",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, color: "#fff", fontWeight: 500
          }}>L</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 500, color: "#0C447C", letterSpacing: "-0.01em" }}>LexPrompt</div>
            <div style={{ fontSize: 11, color: "#999", marginTop: 1 }}>Fieldfisher AI Prompt Bank</div>
          </div>
        </div>

        <nav style={{ display: "flex", gap: 6 }}>
          {navItems.map(n => (
            <button key={n.id} onClick={() => setScreen(n.id)} style={{
              fontSize: 13, padding: "5px 14px", borderRadius: 20, cursor: "pointer",
              border: screen === n.id ? "1.5px solid #0C447C" : "1px solid #d0d0cc",
              background: screen === n.id ? "#0C447C" : "transparent",
              color: screen === n.id ? "#fff" : "#666",
              fontFamily: "inherit", transition: "all 0.15s", fontWeight: screen === n.id ? 500 : 400
            }}>{n.label}</button>
          ))}
        </nav>
      </div>

      <div style={{ padding: "24px" }}>
        {screen === "browse" && <BrowseScreen onCopy={handleCopy} copiedId={copiedId} />}
        {screen === "submit" && <SubmitScreen sessionCount={sessionCount} onSubmit={handleSubmit} />}
        {screen === "stats" && <StatsScreen sessionCount={sessionCount} />}
      </div>
    </div>
  );
}
