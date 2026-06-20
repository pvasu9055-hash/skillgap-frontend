import { useState, useEffect, useCallback, useRef } from "react";

const API = "https://skillgap-api.vasutech.online";

const getToken = () => localStorage.getItem("sg_token");
const setToken = (t) => localStorage.setItem("sg_token", t);
const clearToken = () => localStorage.removeItem("sg_token");
const authHeaders = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` });

const PRESETS = {
  "Full Stack Developer": "react, node.js, typescript, postgresql, docker, git, rest api, aws, redis, graphql",
  "Data Scientist": "python, pandas, numpy, scikit-learn, tensorflow, sql, matplotlib, jupyter, statistics, machine learning",
  "DevOps Engineer": "docker, kubernetes, jenkins, terraform, aws, linux, bash, ci/cd, ansible, prometheus",
  "Android Developer": "kotlin, java, android sdk, jetpack compose, firebase, rest api, git, mvvm, retrofit",
  "Backend Java Developer": "java, spring boot, hibernate, postgresql, maven, rest api, jwt, docker, microservices, redis",
  "Frontend Developer": "react, typescript, html, css, tailwind, next.js, git, webpack, jest, figma",
  "Cloud Engineer": "aws, azure, gcp, terraform, kubernetes, docker, linux, networking, security, iam",
  "ML Engineer": "python, pytorch, tensorflow, mlflow, docker, sql, data pipelines, feature engineering, rest api, git",
};

const C = {
  bg: "#080c16", surface: "#0e1420", card: "#111827", border: "#1a2540", borderHover: "#2a3f60",
  cyan: "#00e5ff", green: "#a8ff78", yellow: "#ffd54f", orange: "#ff9800", red: "#ff6b6b", purple: "#b388ff",
  text: "#e2e8f0", muted: "#4a5568", subtle: "#718096",
};

const scoreColor = (pct) => pct >= 85 ? C.green : pct >= 60 ? C.yellow : pct >= 35 ? C.orange : C.red;

const Mono = ({ children, style }) => <span style={{ fontFamily: "monospace", ...style }}>{children}</span>;
const Tag = ({ label, color = C.cyan }) => (
  <span style={{
    display: "inline-block", fontSize: 9, letterSpacing: ".18em", textTransform: "uppercase", color,
    border: `1px solid ${color}40`, padding: "4px 12px", borderRadius: 100, fontFamily: "monospace",
  }}>{label}</span>
);
const Input = ({ label, type = "text", value, onChange, placeholder, hint }) => (
  <div style={{ marginBottom: 20 }}>
    {label && <div style={S.inputLabel}>{label}</div>}
    <input type={type} value={value} onChange={onChange} placeholder={placeholder} style={S.input}
      onFocus={e => e.target.style.borderColor = C.cyan} onBlur={e => e.target.style.borderColor = C.border} />
    {hint && <div style={S.hint}>{hint}</div>}
  </div>
);
const Btn = ({ children, onClick, disabled, variant = "primary", style: extra }) => {
  const base = { border: "none", borderRadius: 8, fontSize: "0.95rem", fontWeight: 700, padding: "13px 32px",
    cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, transition: "all .2s", fontFamily: "'Segoe UI', sans-serif", ...extra };
  const variants = {
    primary: { background: C.cyan, color: "#000", boxShadow: `0 0 20px ${C.cyan}30` },
    ghost: { background: "transparent", color: C.text, border: `1px solid ${C.border}` },
    danger: { background: "transparent", color: C.red, border: `1px solid ${C.red}40` },
  };
  return <button style={{ ...base, ...variants[variant] }} onClick={onClick} disabled={disabled}>{children}</button>;
};
const Card = ({ children, style: extra }) => <div style={{ ...S.card, ...extra }}>{children}</div>;

const Chip = ({ item, type }) => {
  const palette = {
    exact: { bg: `${C.green}10`, border: `${C.green}40`, text: C.green, icon: "✓" },
    fuzzy: { bg: `${C.yellow}10`, border: `${C.yellow}40`, text: C.yellow, icon: "≈" },
    missing: { bg: `${C.red}10`, border: `${C.red}40`, text: C.red, icon: "✕" },
  }[type];
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8, padding: "7px 13px", borderRadius: 100,
      fontFamily: "monospace", fontSize: ".8rem", background: palette.bg, border: `1px solid ${palette.border}`, color: palette.text,
    }}>
      <span>{palette.icon}</span>
      <span>{item.skill}</span>
      {type === "fuzzy" && item.matchedWith && <span style={{ fontSize: ".7rem", opacity: .7, fontStyle: "italic" }}>≈ {item.matchedWith}</span>}
      {item.learningResource && (
        <a href={item.learningResource} target="_blank" rel="noopener noreferrer"
          style={{ fontSize: ".7rem", color: "inherit", border: "1px solid currentColor", borderRadius: 100, padding: "1px 7px", textDecoration: "none", opacity: .8 }}>learn →</a>
      )}
    </div>
  );
};

const SkillBar = ({ label, pct, color, delay = 0 }) => {
  const [width, setWidth] = useState(0);
  useEffect(() => { const t = setTimeout(() => setWidth(pct), 300 + delay); return () => clearTimeout(t); }, [pct, delay]);
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <Mono style={{ fontSize: ".8rem", color: C.text }}>{label}</Mono>
        <Mono style={{ fontSize: ".8rem", color }}>{pct}%</Mono>
      </div>
      <div style={{ height: 6, borderRadius: 99, background: C.border, overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 99, width: `${width}%`, background: `linear-gradient(90deg, ${color}aa, ${color})`,
          transition: "width 1s cubic-bezier(.4,0,.2,1)", boxShadow: `0 0 8px ${color}60`,
        }} />
      </div>
    </div>
  );
};

const Gauge = ({ pct }) => {
  const color = scoreColor(pct);
  const circ = 2 * Math.PI * 54;
  const [offset, setOffset] = useState(circ);
  useEffect(() => { const t = setTimeout(() => setOffset(circ * (1 - pct / 100)), 200); return () => clearTimeout(t); }, [pct, circ]);
  return (
    <div style={{ position: "relative", width: 140, height: 140, flexShrink: 0 }}>
      <svg width="140" height="140" viewBox="0 0 130 130" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="65" cy="65" r="54" fill="none" stroke={C.border} strokeWidth="10" />
        <circle cx="65" cy="65" r="54" fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset} style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(.4,0,.2,1), stroke 1s ease" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: "2rem", fontWeight: 800, color, lineHeight: 1 }}>{pct}%</div>
        <Mono style={{ fontSize: ".6rem", color: C.muted, textTransform: "uppercase", letterSpacing: ".1em", marginTop: 4 }}>match</Mono>
      </div>
    </div>
  );
};

const Roadmap = ({ missing }) => {
  const phases = [
    { label: "Week 1–2", color: C.red, skills: missing.slice(0, 2) },
    { label: "Week 3–4", color: C.orange, skills: missing.slice(2, 4) },
    { label: "Month 2", color: C.yellow, skills: missing.slice(4, 6) },
    { label: "Month 3+", color: C.green, skills: missing.slice(6) },
  ].filter(p => p.skills.length > 0);
  if (missing.length === 0) return <div style={{ color: C.green, fontFamily: "monospace", fontSize: ".85rem", padding: "12px 0" }}>✓ No skill gaps! You're fully qualified.</div>;
  return (
    <div style={{ position: "relative" }}>
      {phases.map((phase, i) => (
        <div key={i} style={{ display: "flex", gap: 20, marginBottom: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0, background: `${phase.color}20`,
              border: `2px solid ${phase.color}`, display: "flex", alignItems: "center", justifyContent: "center",
              color: phase.color, fontSize: ".7rem", fontWeight: 700, fontFamily: "monospace" }}>{i + 1}</div>
            {i < phases.length - 1 && <div style={{ width: 2, flex: 1, background: C.border, marginTop: 4 }} />}
          </div>
          <div style={{ paddingBottom: 8, flex: 1 }}>
            <Mono style={{ fontSize: ".7rem", color: phase.color, letterSpacing: ".12em", textTransform: "uppercase" }}>{phase.label}</Mono>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
              {phase.skills.map(s => (
                <div key={s.skill} style={{
                  padding: "5px 12px", borderRadius: 100, background: `${phase.color}15`, border: `1px solid ${phase.color}40`,
                  color: phase.color, fontFamily: "monospace", fontSize: ".78rem", display: "flex", alignItems: "center", gap: 8,
                }}>
                  {s.skill}
                  {s.learningResource && (
                    <a href={s.learningResource} target="_blank" rel="noopener noreferrer"
                      style={{ color: "inherit", fontSize: ".65rem", opacity: .8, border: "1px solid currentColor",
                        borderRadius: 100, padding: "1px 6px", textDecoration: "none" }}>learn →</a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const HistoryCard = ({ item, onLoad, onDelete }) => {
  const pct = item.match_score ?? 0;
  const color = scoreColor(pct);
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px 20px",
      display: "flex", alignItems: "center", gap: 16, cursor: "pointer", transition: "border-color .2s",
    }} onMouseEnter={e => e.currentTarget.style.borderColor = C.borderHover}
      onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
      <div style={{ width: 48, height: 48, borderRadius: "50%", flexShrink: 0, border: `2px solid ${color}`,
        display: "flex", alignItems: "center", justifyContent: "center", color, fontWeight: 800, fontSize: ".9rem" }}>{pct}%</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: ".9rem", marginBottom: 4 }}>{item.job_role || "Custom Analysis"}</div>
        <Mono style={{ fontSize: ".72rem", color: C.muted }}>
          {new Date(item.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
        </Mono>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <Btn variant="ghost" onClick={() => onLoad(item)} style={{ padding: "7px 14px", fontSize: ".8rem" }}>Load</Btn>
        <Btn variant="danger" onClick={() => onDelete(item.id)} style={{ padding: "7px 14px", fontSize: ".8rem" }}>✕</Btn>
      </div>
    </div>
  );
};

function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const submit = async () => {
    setError("");
    if (!form.email || !form.password) { setError("Fill all fields."); return; }
    if (mode === "register" && !form.name) { setError("Name is required."); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/${mode}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong."); return; }
      setToken(data.token);
      onLogin(data.user);
    } catch { setError("Server waking up... wait a few seconds and retry."); }
    finally { setLoading(false); }
  };
  return (
    <div style={S.body}>
      <div style={{ maxWidth: 440, margin: "0 auto", padding: "80px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <Tag label="Career Intelligence" />
          <h1 style={{ ...S.h1, marginTop: 20, fontSize: "2.2rem" }}>
            Skill<span style={{ color: C.cyan }}>Gap</span> Analyzer
          </h1>
          <p style={{ color: C.subtle, marginTop: 10 }}>
            {mode === "login" ? "Welcome back. Sign in to continue." : "Create your account to get started."}
          </p>
        </div>
        <Card>
          {mode === "register" && <Input label="Full Name" value={form.name} onChange={set("name")} placeholder="Penkey Sri Vasu" />}
          <Input label="Email" type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" />
          <Input label="Password" type="password" value={form.password} onChange={set("password")} placeholder="••••••••" />
          {error && <div style={S.errorBox}>{error}</div>}
          <Btn onClick={submit} disabled={loading} style={{ width: "100%", marginTop: 8 }}>
            {loading ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
          </Btn>
          <div style={{ textAlign: "center", marginTop: 20, color: C.subtle, fontSize: ".85rem" }}>
            {mode === "login" ? "No account? " : "Already have one? "}
            <span onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
              style={{ color: C.cyan, cursor: "pointer", fontWeight: 600 }}>
              {mode === "login" ? "Sign up" : "Sign in"}
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Analyzer({ user, onLogout }) {
  const [tab, setTab] = useState("analyze");
  const [studentSkills, setStudentSkills] = useState("");
  const [jobSkills, setJobSkills] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [view, setView] = useState("chips");
  const [resumeFile, setResumeFile] = useState(null);
  const [jdText, setJdText] = useState("");
  const [coachMessages, setCoachMessages] = useState([]);
  const [coachInput, setCoachInput] = useState("");
  const [coachLoading, setCoachLoading] = useState(false);
  const [interviewQuestions, setInterviewQuestions] = useState([]);
  const [salary, setSalary] = useState(null);
  const [trends, setTrends] = useState([]);
  const [progress, setProgress] = useState([]);
  const fileInputRef = useRef(null);

  const applyPreset = (role) => { setJobRole(role); setJobSkills(PRESETS[role]); };

  const analyze = async () => {
    setError(""); setResult(null);
    if (!studentSkills.trim() || !jobSkills.trim()) { setError("Fill both fields."); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/analyze`, {
        method: "POST", headers: authHeaders(),
        body: JSON.stringify({ studentSkills, jobSkills, jobRole }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.errors?.join(" · ") || "Server error."); return; }
      setResult(data);
    } catch { setError("Server waking up… wait a few seconds and retry."); }
    finally { setLoading(false); }
  };

  const uploadResume = async (file) => {
    const fd = new FormData();
    fd.append("resume", file);
    setLoading(true);
    try {
      const res = await fetch(`${API}/resume/extract`, { method: "POST", headers: { Authorization: `Bearer ${getToken()}` }, body: fd });
      const data = await res.json();
      if (res.ok) setStudentSkills(data.skills);
      else setError(data.error || "Failed to extract resume.");
    } catch { setError("Resume extraction failed."); }
    finally { setLoading(false); }
  };

  const extractJD = async () => {
    if (!jdText.trim()) { setError("Paste job description first."); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/jd/extract`, {
        method: "POST", headers: authHeaders(), body: JSON.stringify({ text: jdText }),
      });
      const data = await res.json();
      if (res.ok) setJobSkills(data.skills);
      else setError(data.error || "Failed to extract skills.");
    } catch { setError("JD extraction failed."); }
    finally { setLoading(false); }
  };

  const sendCoachMessage = async () => {
    if (!coachInput.trim() || !result) return;
    const userMsg = coachInput;
    setCoachInput("");
    setCoachMessages(m => [...m, { role: "user", text: userMsg }]);
    setCoachLoading(true);
    try {
      const res = await fetch(`${API}/ai/coach`, {
        method: "POST", headers: authHeaders(),
        body: JSON.stringify({
          studentSkills, jobSkills, jobRole, matchScore: result.summary.matchScorePercent,
          missingSkills: result.missing.map(s => s.skill).join(", "), message: userMsg,
        }),
      });
      const data = await res.json();
      if (res.ok) setCoachMessages(m => [...m, { role: "assistant", text: data.reply }]);
    } catch { }
    finally { setCoachLoading(false); }
  };

  const getInterviewQuestions = async () => {
    if (!result) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/ai/interview`, {
        method: "POST", headers: authHeaders(),
        body: JSON.stringify({ jobRole, skills: studentSkills }),
      });
      const data = await res.json();
      if (res.ok) setInterviewQuestions(data.questions || []);
    } catch { }
    finally { setLoading(false); }
  };

  const getSalaryEstimate = async () => {
    if (!result) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/ai/salary`, {
        method: "POST", headers: authHeaders(),
        body: JSON.stringify({ jobRole, skills: studentSkills, matchScore: result.summary.matchScorePercent }),
      });
      const data = await res.json();
      if (res.ok) setSalary(data);
    } catch { }
    finally { setLoading(false); }
  };

  const getTrends = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/trends`, { headers: authHeaders() });
      const data = await res.json();
      if (res.ok) setTrends(data.trends || []);
    } catch { }
    finally { setLoading(false); }
  };

  const updateProgress = async (skill, status) => {
    await fetch(`${API}/progress`, {
      method: "POST", headers: authHeaders(),
      body: JSON.stringify({ skill, status }),
    });
    setProgress(p => [...p.filter(x => x.skill !== skill), { skill, status }]);
  };

  const summary = result?.summary ?? {};
  const pct = summary?.matchScorePercent ?? 0;

  return (
    <div style={S.body}>
      <nav style={S.nav}>
        <div style={S.navInner}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontWeight: 800, fontSize: "1rem", color: C.text }}>Skill<span style={{ color: C.cyan }}>Gap</span></span>
            <Tag label="Enterprise" color={C.purple} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            {["analyze", "tools", "insights"].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                background: "none", border: "none", cursor: "pointer", padding: "6px 4px",
                color: tab === t ? C.cyan : C.subtle, fontWeight: tab === t ? 700 : 400,
                fontSize: ".88rem", textTransform: "capitalize",
                borderBottom: tab === t ? `2px solid ${C.cyan}` : "2px solid transparent",
                fontFamily: "'Segoe UI', sans-serif",
              }}>{t}</button>
            ))}
            <div style={{ width: 1, height: 20, background: C.border }} />
            <Mono style={{ fontSize: ".8rem", color: C.subtle }}>{user.email}</Mono>
            <Btn variant="ghost" onClick={onLogout} style={{ padding: "6px 14px", fontSize: ".8rem" }}>Sign out</Btn>
          </div>
        </div>
      </nav>

      <div style={S.wrap}>
        {tab === "analyze" && (
          <>
            <div style={S.header}>
              <Tag label="Career Intelligence" />
              <h1 style={S.h1}>Find Your <span style={{ background: "linear-gradient(90deg,#00e5ff,#a8ff78)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Skill Gap</span></h1>
              <p style={S.sub}>See exactly what's missing between you and your dream job.</p>
            </div>

            <Card style={{ marginBottom: 24 }}>
              <div style={S.cardLabel}>Quick Role Presets</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
                {Object.keys(PRESETS).map(role => (
                  <button key={role} onClick={() => applyPreset(role)} style={{
                    background: jobRole === role ? `${C.cyan}15` : "transparent",
                    border: `1px solid ${jobRole === role ? C.cyan : C.border}`,
                    color: jobRole === role ? C.cyan : C.subtle,
                    borderRadius: 100, padding: "6px 14px",
                    cursor: "pointer", fontFamily: "monospace", fontSize: ".78rem",
                    transition: "all .15s",
                  }}>{role}</button>
                ))}
              </div>
            </Card>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
              <Card>
                <div style={S.cardLabel}>Your Current Skills</div>
                <textarea style={{ ...S.textarea, marginTop: 12 }} value={studentSkills}
                  onChange={e => setStudentSkills(e.target.value)} placeholder="java, spring boot, sql, git, docker ..." />
                <div style={S.hint}>Separate each skill with a comma</div>
              </Card>
              <Card>
                <div style={S.cardLabel}>Job Required Skills</div>
                <textarea style={{ ...S.textarea, marginTop: 12 }} value={jobSkills}
                  onChange={e => setJobSkills(e.target.value)} placeholder="java, kubernetes, react, aws, microservices ..." />
                <div style={S.hint}>Paste skills from the job posting</div>
              </Card>
            </div>

            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <Btn onClick={analyze} disabled={loading}>{loading ? "Analyzing…" : "Analyze Gap"}</Btn>
            </div>

            {error && <div style={S.errorBox}>⚠ {error}</div>}

            {result && (
              <Card>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
                  <div style={S.cardLabel}>Match Report</div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {["chips", "bars", "roadmap", "coach"].map(v => (
                      <button key={v} onClick={() => setView(v)} style={{
                        background: view === v ? `${C.cyan}15` : "transparent",
                        border: `1px solid ${view === v ? C.cyan : C.border}`,
                        color: view === v ? C.cyan : C.subtle, borderRadius: 8,
                        padding: "6px 14px", cursor: "pointer",
                        fontFamily: "monospace", fontSize: ".75rem", textTransform: "capitalize",
                      }}>{v === "chips" ? "Skills" : v === "bars" ? "Chart" : v === "roadmap" ? "Roadmap" : "Coach"}</button>
                    ))}
                  </div>
                </div>

                <div style={S.scoreRow}>
                  <Gauge pct={pct} />
                  <div>
                    <div style={{ fontSize: "1.25rem", fontWeight: 700, color: scoreColor(pct), marginBottom: 12 }}>
                      {summary?.readinessLevel}
                    </div>
                    <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                      {[[C.green, `${summary?.exactMatches ?? 0} exact`], [C.yellow, `${summary?.fuzzyMatches ?? 0} close`],
                        [C.red, `${summary?.missingSkills ?? 0} missing`], [C.muted, `${summary?.totalJobSkills ?? 0} total`]].map(([c, t]) => (
                        <div key={t} style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "monospace", fontSize: ".8rem" }}>
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />
                          {t}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {view === "chips" && (
                  <>
                    {[{ title: "Matched Skills", items: result.matched, type: "exact" },
                      { title: "Close Matches", items: result.fuzzyMatched, type: "fuzzy" },
                      { title: "Skills to Acquire", items: result.missing, type: "missing" }].map(({ title, items, type }) => (
                      <div key={type} style={{ marginBottom: 28 }}>
                        <div style={S.sectionTitle}>{title}</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                          {!items || items.length === 0 ? <Mono style={{ fontSize: ".82rem", color: C.muted, fontStyle: "italic" }}>none</Mono>
                            : items.map(item => <Chip key={item.skill} item={item} type={type} />)}
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {view === "bars" && (
                  <div>
                    <SkillBar label="Exact Matches" pct={Math.round(((summary?.exactMatches ?? 0) / (summary?.totalJobSkills || 1)) * 100)} color={C.green} delay={0} />
                    <SkillBar label="Close Matches" pct={Math.round(((summary?.fuzzyMatches ?? 0) / (summary?.totalJobSkills || 1)) * 100)} color={C.yellow} delay={100} />
                    <SkillBar label="Missing Skills" pct={Math.round(((summary?.missingSkills ?? 0) / (summary?.totalJobSkills || 1)) * 100)} color={C.red} delay={200} />
                    <SkillBar label="Overall Match" pct={pct} color={scoreColor(pct)} delay={300} />
                  </div>
                )}

                {view === "roadmap" && (
                  <div>
                    <div style={S.sectionTitle}>Learning Roadmap</div>
                    <Roadmap missing={result.missing || []} />
                  </div>
                )}

                {view === "coach" && (
                  <div>
                    <div style={S.sectionTitle}>AI Career Coach</div>
                    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16, marginBottom: 16, height: 300, overflowY: "auto" }}>
                      {coachMessages.length === 0 ? (
                        <Mono style={{ color: C.muted, fontSize: ".85rem" }}>Ask me for advice on landing this role...</Mono>
                      ) : (
                        coachMessages.map((msg, i) => (
                          <div key={i} style={{ marginBottom: 12, textAlign: msg.role === "assistant" ? "left" : "right" }}>
                            <div style={{
                              display: "inline-block", padding: "8px 12px", borderRadius: 8,
                              background: msg.role === "assistant" ? C.border : C.cyan,
                              color: msg.role === "assistant" ? C.text : "#000", fontFamily: "monospace", fontSize: ".8rem", maxWidth: "80%"
                            }}>{msg.text}</div>
                          </div>
                        ))
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input type="text" value={coachInput} onChange={e => setCoachInput(e.target.value)} placeholder="Ask for advice..."
                        style={{ ...S.input, flex: 1 }} onKeyPress={e => e.key === "Enter" && sendCoachMessage()} />
                      <Btn onClick={sendCoachMessage} disabled={coachLoading}>{coachLoading ? "..." : "Send"}</Btn>
                    </div>
                  </div>
                )}
              </Card>
            )}
          </>
        )}

        {tab === "tools" && (
          <>
            <div style={S.header}>
              <h1 style={{ ...S.h1, fontSize: "2rem" }}>Enterprise <span style={{ color: C.cyan }}>Tools</span></h1>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
              <Card>
                <div style={S.cardLabel}>📄 Resume Upload</div>
                <input type="file" accept=".pdf" ref={fileInputRef} onChange={e => e.target.files?.[0] && uploadResume(e.target.files[0])}
                  style={{ display: "none" }} />
                <Btn onClick={() => fileInputRef.current?.click()} disabled={loading} style={{ width: "100%", marginTop: 12 }}>
                  {loading ? "Extracting..." : "Upload Resume PDF"}
                </Btn>
                <div style={S.hint}>We'll extract skills automatically</div>
              </Card>

              <Card>
                <div style={S.cardLabel}>📋 Job Description Parser</div>
                <textarea style={{ ...S.textarea, marginTop: 12 }} value={jdText}
                  onChange={e => setJdText(e.target.value)} placeholder="Paste job description here..." />
                <Btn onClick={extractJD} disabled={loading} style={{ width: "100%", marginTop: 8 }}>
                  {loading ? "Extracting..." : "Extract Skills"}
                </Btn>
              </Card>
            </div>

            {result && (
              <>
                <Card style={{ marginBottom: 20 }}>
                  <div style={S.cardLabel}>🎯 Interview Prep</div>
                  <Btn onClick={getInterviewQuestions} disabled={loading} style={{ width: "100%", marginTop: 12 }}>
                    {loading ? "Generating..." : "Generate Interview Questions"}
                  </Btn>
                  {interviewQuestions.length > 0 && (
                    <div style={{ marginTop: 16 }}>
                      {interviewQuestions.map((q, i) => (
                        <div key={i} style={{ marginBottom: 16, padding: 12, background: C.surface, borderRadius: 8 }}>
                          <Mono style={{ fontSize: ".85rem", color: C.cyan, fontWeight: 700 }}>Q{i + 1}: {q.question}</Mono>
                          <div style={{ marginTop: 8, fontSize: ".8rem", color: C.subtle }}>💡 Tip: {q.tip}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                <Card style={{ marginBottom: 20 }}>
                  <div style={S.cardLabel}>💰 Salary Estimator</div>
                  <Btn onClick={getSalaryEstimate} disabled={loading} style={{ width: "100%", marginTop: 12 }}>
                    {loading ? "Calculating..." : "Estimate Salary"}
                  </Btn>
                  {salary && (
                    <div style={{ marginTop: 16, padding: 12, background: C.surface, borderRadius: 8 }}>
                      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                        <div>
                          <Mono style={{ fontSize: ".7rem", color: C.muted, textTransform: "uppercase" }}>Min</Mono>
                          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: C.yellow }}>{salary.min} LPA</div>
                        </div>
                        <div>
                          <Mono style={{ fontSize: ".7rem", color: C.muted, textTransform: "uppercase" }}>Average</Mono>
                          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: C.cyan }}>{salary.average} LPA</div>
                        </div>
                        <div>
                          <Mono style={{ fontSize: ".7rem", color: C.muted, textTransform: "uppercase" }}>Max</Mono>
                          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: C.green }}>{salary.max} LPA</div>
                        </div>
                      </div>
                      <div style={{ marginTop: 12, fontSize: ".8rem", color: C.subtle }}>📝 {salary.note}</div>
                    </div>
                  )}
                </Card>
              </>
            )}
          </>
        )}

        {tab === "insights" && (
          <>
            <div style={S.header}>
              <h1 style={{ ...S.h1, fontSize: "2rem" }}>Market <span style={{ color: C.cyan }}>Insights</span></h1>
            </div>

            <Card>
              <div style={S.cardLabel}>🔥 Top In-Demand Skills 2025</div>
              <Btn onClick={getTrends} disabled={loading} style={{ width: "100%", marginTop: 12 }}>
                {loading ? "Loading..." : "Load Trends"}
              </Btn>
              {trends.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  {trends.map((t, i) => (
                    <div key={i} style={{ padding: 12, background: C.surface, borderRadius: 8, marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <Mono style={{ fontSize: ".85rem", fontWeight: 700, color: C.cyan }}>{t.skill}</Mono>
                        <Tag label={t.demand} color={t.demand === "Critical" ? C.red : C.yellow} />
                      </div>
                      <div style={{ display: "flex", gap: 16, fontSize: ".8rem", color: C.subtle }}>
                        <span>📈 {t.growth}</span>
                        <span>💰 {t.avgSalary}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) { setAuthChecked(true); return; }
    fetch(`${API}/auth/me`, { headers: authHeaders() })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.user) setUser(data.user); else clearToken(); })
      .catch(() => clearToken())
      .finally(() => setAuthChecked(true));
  }, []);

  if (!authChecked) return (
    <div style={{ ...S.body, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <Mono style={{ color: C.subtle }}>Loading…</Mono>
    </div>
  );

  if (!user) return <AuthScreen onLogin={(u) => setUser(u)} />;
  return <Analyzer user={user} onLogout={() => { clearToken(); setUser(null); }} />;
}

const S = {
  body: { background: C.bg, minHeight: "100vh", color: C.text, fontFamily: "'Segoe UI', sans-serif" },
  nav: { borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0, background: `${C.bg}ee`, backdropFilter: "blur(12px)", zIndex: 100 },
  navInner: { maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" },
  wrap: { maxWidth: 1200, margin: "0 auto", padding: "48px 24px 100px" },
  header: { textAlign: "center", marginBottom: 48 },
  h1: { fontSize: "clamp(1.8rem,5vw,3rem)", fontWeight: 800, letterSpacing: "-.02em", marginTop: 16 },
  sub: { marginTop: 12, color: C.subtle, fontSize: "1rem" },
  card: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "24px 28px 28px", marginBottom: 24 },
  cardLabel: { fontFamily: "monospace", fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: C.cyan },
  inputLabel: { fontFamily: "monospace", fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: C.subtle, marginBottom: 8 },
  input: { width: "100%", background: `${C.surface}`, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text,
    fontFamily: "monospace", fontSize: ".88rem", padding: "12px 14px", outline: "none", boxSizing: "border-box", transition: "border-color .2s" },
  textarea: { width: "100%", background: "rgba(0,0,0,.35)", border: `1px solid ${C.border}`, borderRadius: 8, color: C.text,
    fontFamily: "monospace", fontSize: ".88rem", lineHeight: 1.6, padding: "13px 15px", resize: "vertical", minHeight: 90, outline: "none", boxSizing: "border-box" },
  hint: { fontSize: ".76rem", color: C.muted, marginTop: 8, fontFamily: "monospace" },
  errorBox: { background: `${C.red}10`, border: `1px solid ${C.red}35`, borderRadius: 8, color: C.red, fontFamily: "monospace",
    fontSize: ".85rem", padding: "13px 16px", marginBottom: 24 },
  scoreRow: { display: "flex", alignItems: "center", gap: 32, marginBottom: 32, flexWrap: "wrap" },
  sectionTitle: { fontFamily: "monospace", fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: C.subtle, marginBottom: 14 },
};