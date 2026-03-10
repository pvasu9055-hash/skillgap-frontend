import { useState } from "react";

export default function App() {
  const [studentSkills, setStudentSkills] = useState("");
  const [jobSkills, setJobSkills] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function analyze() {
    setError("");
    setResult(null);
    if (!studentSkills.trim() || !jobSkills.trim()) {
      setError("Please fill in both fields.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("https://skillgap-api-0u28.onrender.com/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentSkills, jobSkills }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.errors?.join(" · ") || "Server error.");
        return;
      }
      setResult(data);
    } catch {
      setError("Cannot reach backend. Is Spring Boot running on port 8080?");
    } finally {
      setLoading(false);
    }
  }

  // Support both {summary:{...}} and flat response shapes
  const summary = result?.summary ?? result ?? {};
  const pct = summary?.matchScorePercent ?? 0;
  const color =
    pct >= 85 ? "#a8ff78" :
    pct >= 60 ? "#ffd54f" :
    pct >= 35 ? "#ff9800" : "#ff6b6b";
  const circ = 2 * Math.PI * 54;
  const offset = circ * (1 - pct / 100);

  return (
    <div style={styles.body}>
      <div style={styles.wrap}>

        {/* Header */}
        <div style={styles.header}>
          <div style={styles.badge}>Career Intelligence</div>
          <h1 style={styles.h1}>
            Skill Gap{" "}
            <span style={{
              background: "linear-gradient(90deg,#00e5ff,#a8ff78)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              Analyzer
            </span>
          </h1>
          <p style={styles.sub}>Find exactly what's missing between you and your dream job.</p>
        </div>

        {/* Student Skills Input */}
        <div style={styles.card}>
          <div style={styles.label}>Your Current Skills</div>
          <textarea
            style={styles.textarea}
            value={studentSkills}
            onChange={(e) => setStudentSkills(e.target.value)}
            placeholder="java, spring boot, sql, git, docker ..."
          />
          <div style={styles.hint}>// separate each skill with a comma</div>
        </div>

        {/* Job Skills Input */}
        <div style={styles.card}>
          <div style={styles.label}>Job Required Skills</div>
          <textarea
            style={styles.textarea}
            value={jobSkills}
            onChange={(e) => setJobSkills(e.target.value)}
            placeholder="java, kubernetes, react, aws, microservices ..."
          />
          <div style={styles.hint}>// paste skills from the job posting</div>
        </div>

        {/* Analyze Button */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <button
            style={{ ...styles.btn, opacity: loading ? 0.5 : 1 }}
            onClick={analyze}
            disabled={loading}
          >
            {loading ? "Analyzing…" : "Analyze Gap"}
          </button>
        </div>

        {/* Error Message */}
        {error && <div style={styles.errorBox}>⚠ {error}</div>}

        {/* Results */}
        {result && (
          <div style={styles.card}>
            <div style={styles.label}>Match Report</div>

            {/* Score Gauge */}
            <div style={styles.scoreRow}>
              <div style={{ position: "relative", width: 130, height: 130, flexShrink: 0 }}>
                <svg width="130" height="130" viewBox="0 0 130 130"
                  style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="65" cy="65" r="54" fill="none"
                    stroke="#1e2d40" strokeWidth="10" />
                  <circle cx="65" cy="65" r="54" fill="none"
                    stroke={color} strokeWidth="10" strokeLinecap="round"
                    strokeDasharray={circ} strokeDashoffset={offset}
                    style={{ transition: "stroke-dashoffset 1.2s ease, stroke 1.2s ease" }} />
                </svg>
                <div style={styles.gaugeLabel}>
                  <div style={{ fontSize: "1.9rem", fontWeight: 800, color }}>{pct}%</div>
                  <div style={{ fontFamily: "monospace", fontSize: ".65rem",
                    color: "#718096", textTransform: "uppercase", letterSpacing: ".1em" }}>
                    match
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div>
                <div style={{ fontSize: "1.3rem", fontWeight: 700, color, marginBottom: 10 }}>
                  {summary?.readinessLevel}
                </div>
                <div style={styles.statRow}>
                  {[
                    ["#a8ff78", (summary?.exactMatches ?? 0) + " exact"],
                    ["#ffd54f", (summary?.fuzzyMatches ?? 0) + " close"],
                    ["#ff6b6b", (summary?.missingSkills ?? 0) + " missing"],
                    ["#4a5568", (summary?.totalJobSkills ?? 0) + " total"],
                  ].map(([c, t]) => (
                    <div key={t} style={styles.stat}>
                      <div style={{ ...styles.dot, background: c }} />
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Skill Sections */}
            <ChipSection title="Matched Skills"    items={result.matched}      type="exact" />
            <ChipSection title="Close Matches"     items={result.fuzzyMatched} type="fuzzy" />
            <ChipSection title="Skills to Acquire" items={result.missing}      type="missing" />
          </div>
        )}

      </div>
    </div>
  );
}

function ChipSection({ title, items, type }) {
  const colors = {
    exact:   { bg: "rgba(168,255,120,.08)", border: "rgba(168,255,120,.3)", text: "#a8ff78" },
    fuzzy:   { bg: "rgba(255,213,79,.08)",  border: "rgba(255,213,79,.3)",  text: "#ffd54f" },
    missing: { bg: "rgba(255,107,107,.08)", border: "rgba(255,107,107,.3)", text: "#ff6b6b" },
  };
  const icons = { exact: "✓", fuzzy: "≈", missing: "✕" };
  const c = colors[type];

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={styles.sectionTitle}>{title}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {!items || items.length === 0 ? (
          <span style={{ color: "#718096", fontFamily: "monospace",
            fontSize: ".82rem", fontStyle: "italic" }}>none</span>
        ) : (
          items.map((item) => (
            <div key={item.skill} style={{
              ...styles.chip,
              background: c.bg,
              borderColor: c.border,
              color: c.text,
            }}>
              <span>{icons[type]}</span>
              <span>{item.skill}</span>
              {type === "fuzzy" && item.matchedWith && (
                <span style={{ fontSize: ".7rem", opacity: 0.7, fontStyle: "italic" }}>
                  ≈ {item.matchedWith}
                </span>
              )}
              {item.learningResource && (
                <a href={item.learningResource} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: ".7rem", color: "inherit",
                    border: "1px solid currentColor", borderRadius: 100,
                    padding: "1px 7px", textDecoration: "none", opacity: 0.8 }}>
                  learn →
                </a>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  body: {
    background: "#0b0f1a", minHeight: "100vh",
    color: "#e2e8f0", fontFamily: "'Segoe UI', sans-serif",
  },
  wrap: { maxWidth: 860, margin: "0 auto", padding: "48px 24px 80px" },
  header: { textAlign: "center", marginBottom: 52 },
  badge: {
    display: "inline-block", fontSize: 11, letterSpacing: ".18em",
    textTransform: "uppercase", color: "#00e5ff",
    border: "1px solid rgba(0,229,255,.3)", padding: "5px 14px",
    borderRadius: 100, marginBottom: 20,
  },
  h1: { fontSize: "clamp(2rem,5vw,3.2rem)", fontWeight: 800, letterSpacing: "-.02em" },
  sub: { marginTop: 14, color: "#718096", fontSize: "1rem" },
  card: {
    background: "#111827", border: "1px solid #1e2d40",
    borderRadius: 12, padding: "28px 28px 32px", marginBottom: 24,
  },
  label: {
    fontFamily: "monospace", fontSize: 10, letterSpacing: ".2em",
    textTransform: "uppercase", color: "#00e5ff", marginBottom: 12,
  },
  textarea: {
    width: "100%", background: "rgba(0,0,0,.35)", border: "1px solid #1e2d40",
    borderRadius: 8, color: "#e2e8f0", fontFamily: "monospace",
    fontSize: ".88rem", lineHeight: 1.6, padding: "14px 16px",
    resize: "vertical", minHeight: 90, outline: "none",
    boxSizing: "border-box",
  },
  hint: { fontSize: ".78rem", color: "#718096", marginTop: 8, fontFamily: "monospace" },
  btn: {
    background: "#00e5ff", color: "#000", border: "none", borderRadius: 8,
    fontSize: "1rem", fontWeight: 700, padding: "14px 40px", cursor: "pointer",
    boxShadow: "0 0 24px rgba(0,229,255,.25)",
  },
  errorBox: {
    background: "rgba(255,107,107,.1)", border: "1px solid rgba(255,107,107,.35)",
    borderRadius: 8, color: "#ff6b6b", fontFamily: "monospace",
    fontSize: ".85rem", padding: "14px 18px", marginBottom: 24,
  },
  scoreRow: { display: "flex", alignItems: "center", gap: 32, marginBottom: 32, flexWrap: "wrap" },
  gaugeLabel: {
    position: "absolute", inset: 0, display: "flex",
    flexDirection: "column", alignItems: "center", justifyContent: "center",
  },
  statRow: { display: "flex", gap: 20, flexWrap: "wrap" },
  stat: { display: "flex", alignItems: "center", gap: 8, fontFamily: "monospace", fontSize: ".8rem" },
  dot: { width: 8, height: 8, borderRadius: "50%" },
  sectionTitle: {
    fontFamily: "monospace", fontSize: 10, letterSpacing: ".2em",
    textTransform: "uppercase", color: "#718096", marginBottom: 14,
  },
  chip: {
    display: "flex", alignItems: "center", gap: 8,
    padding: "8px 14px", borderRadius: 100,
    fontFamily: "monospace", fontSize: ".8rem", border: "1px solid transparent",
  },
};