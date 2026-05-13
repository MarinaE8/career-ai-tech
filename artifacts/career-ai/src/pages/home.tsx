import { useState, useEffect } from "react";
import { useGenerateDocument, useScoreDocument, usePrepareInterview } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

const STEPS = ["Your Profile", "The Job", "Generate", "Result"];

const DOC_TYPES = [
  { id: "cover", label: "Cover Letter", icon: "✉", desc: "ATS-optimised, tailored to the role" },
  { id: "resume", label: "Resume Summary", icon: "⚡", desc: "Punchy 5-line professional profile" },
  { id: "linkedin", label: "LinkedIn About", icon: "in", desc: "Human, scroll-stopping, memorable" },
];

const TONES = [
  { id: "faang", label: "FAANG-Ready", desc: "Big tech energy, metric-driven" },
  { id: "startup", label: "Startup Vibe", desc: "Scrappy, fast, ownership mindset" },
  { id: "senior", label: "Senior / Staff", desc: "Strategic, leadership-focused" },
  { id: "pivot", label: "Career Pivot", desc: "Transferable skills, new direction" },
];

const ROLES = [
  "Software Engineer", "Senior SWE", "Staff Engineer", "Frontend Engineer",
  "Backend Engineer", "Full-Stack Engineer", "ML/AI Engineer", "Data Engineer",
  "DevOps / SRE", "Platform Engineer", "Engineering Manager", "Product Manager",
  "Data Scientist", "Security Engineer", "Mobile Engineer", "Other",
];

const loadingSteps = [
  "Reading your profile…",
  "Matching keywords to the job…",
  "Crafting your story…",
  "Polishing every word…",
  "Almost ready…",
];

export default function Home() {
  const [step, setStep] = useState(0);
  const [docType, setDocType] = useState("cover");
  const [tone, setTone] = useState("faang");
  const [form, setForm] = useState({
    name: "", currentRole: "", yearsExp: "", techStack: "",
    achievements: "", jobTitle: "", company: "", jobDesc: "", atsKeywords: "",
  });
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [atsScore, setAtsScore] = useState<{ score: number; matched: string[]; missing: string[]; suggestions: string[] } | null>(null);
  const [interviewQuestions, setInterviewQuestions] = useState<Array<{ question: string; category: string; talkingPoints: string[] }> | null>(null);

  const { toast } = useToast();
  const generateDoc = useGenerateDocument();
  const scoreDoc = useScoreDocument();
  const interviewPrep = usePrepareInterview();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (generateDoc.isPending) {
      interval = setInterval(() => setLoadingStep((s) => (s + 1) % loadingSteps.length), 1200);
    }
    return () => clearInterval(interval);
  }, [generateDoc.isPending]);

  const update = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleGenerate = () => {
    setAtsScore(null);
    setInterviewQuestions(null);
    generateDoc.mutate(
      { data: { docType, tone, ...form } },
      {
        onSuccess: (data) => {
          setOutput(data.text);
          setStep(3);
          scoreDoc.mutate(
            { data: { document: data.text, jobDesc: form.jobDesc, atsKeywords: form.atsKeywords || undefined } },
            { onSuccess: (s) => setAtsScore(s) }
          );
          interviewPrep.mutate(
            { data: { jobTitle: form.jobTitle, company: form.company, jobDesc: form.jobDesc, techStack: form.techStack, tone, achievements: form.achievements } },
            { onSuccess: (r) => setInterviewQuestions(r.questions) }
          );
        },
        onError: () => {
          toast({
            title: "Generation failed",
            description: "Something went wrong. Please try again.",
            variant: "destructive",
          });
          setStep(2);
        },
      }
    );
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleReset = () => {
    setStep(0);
    setOutput("");
    setAtsScore(null);
    setInterviewQuestions(null);
    setForm({ name: "", currentRole: "", yearsExp: "", techStack: "", achievements: "", jobTitle: "", company: "", jobDesc: "", atsKeywords: "" });
    generateDoc.reset();
    scoreDoc.reset();
    interviewPrep.reset();
  };

  const can0 = form.name && form.currentRole && form.yearsExp && form.techStack && form.achievements;
  const can1 = form.jobTitle && form.company && form.jobDesc;

  return (
    <div style={{ minHeight: "100vh", background: "#faf9f7", fontFamily: "'Georgia', 'Times New Roman', serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #faf9f7; }
        ::selection { background: #f0e6d3; }
        input, textarea, select { font-family: 'DM Sans', sans-serif !important; }
        input::placeholder, textarea::placeholder { color: #bbb; }
        input:focus, textarea:focus, select:focus { outline: none; }
        button { font-family: 'DM Sans', sans-serif; cursor: pointer; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.45; } }
        .fade-up { animation: fadeUp 0.38s ease forwards; }
        .card-sel { transition: all 0.18s ease; cursor: pointer; }
        .card-sel:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.08) !important; }
        .btn-primary { transition: all 0.2s ease; }
        .btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(212,140,60,0.38) !important; }
        .btn-back { transition: all 0.18s ease; }
        .btn-back:hover { background: #ece8e2 !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #e0d8ce; border-radius: 4px; }
      `}</style>

      {/* Header */}
      <header style={{
        background: "rgba(250,249,247,0.96)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid #ede9e2", padding: "0 32px",
        position: "sticky", top: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 64,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: "linear-gradient(135deg, #d48c3c, #c4732a)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, color: "#fff", boxShadow: "0 2px 8px rgba(212,140,60,0.3)",
            fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
          }}>⚡</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 700, color: "#1a1a1a" }}>
            CareerAI<span style={{ color: "#d48c3c" }}>.tech</span>
          </div>
        </div>
        <div style={{
          fontSize: 11, fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
          color: "#d48c3c", background: "#fdf4e8", border: "1px solid #f0dbb8",
          padding: "5px 12px", borderRadius: 20,
        }}>
          ATS-Optimised for Tech
        </div>
      </header>

      {/* Hero — only on step 0 */}
      {step === 0 && (
        <div className="fade-up" style={{
          textAlign: "center", padding: "52px 24px 40px",
          background: "linear-gradient(180deg, #fdf8f2 0%, #faf9f7 100%)",
          borderBottom: "1px solid #ede9e2",
        }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "#fdf4e8", border: "1px solid #f0dbb8",
            borderRadius: 20, padding: "5px 14px", marginBottom: 20,
            fontSize: 12, fontFamily: "'DM Sans', sans-serif", color: "#b06820",
          }}>
            1,000+ engineers hired this month
          </div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(28px, 5vw, 44px)",
            fontWeight: 700, color: "#1a1a1a", lineHeight: 1.15,
            marginBottom: 14, letterSpacing: "-0.02em",
          }}>
            Land your next tech role<br />
            <span style={{ color: "#d48c3c" }}>faster than the ATS filter.</span>
          </h1>
          <p style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: "#888",
            maxWidth: 480, margin: "0 auto", lineHeight: 1.65, fontWeight: 300,
          }}>
            AI-powered cover letters, resume summaries, and LinkedIn profiles — tailored to your stack and the exact job you want.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 32, marginTop: 32, flexWrap: "wrap" }}>
            {[["60 sec", "to generate"], ["98%", "ATS pass rate"], ["FAANG", "ready"]].map(([stat, label]) => (
              <div key={stat} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "#1a1a1a" }}>{stat}</div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div style={{ background: "#fff", borderBottom: "1px solid #ede9e2", padding: "0 32px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", display: "flex" }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{
              flex: 1, padding: "14px 0", textAlign: "center",
              borderBottom: i <= step ? "2px solid #d48c3c" : "2px solid transparent",
              transition: "all 0.3s",
            }}>
              <span style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 11,
                fontWeight: i <= step ? 600 : 400,
                color: i <= step ? "#d48c3c" : "#bbb",
                letterSpacing: "0.06em", textTransform: "uppercase",
              }}>
                {i < step ? "✓ " : ""}{s}
              </span>
            </div>
          ))}
        </div>
      </div>

      <main style={{ maxWidth: 640, margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* STEP 0 — Your Profile */}
        {step === 0 && (
          <div className="fade-up">
            <SectionHeader step="Step 1 of 3" title="Tell us about yourself" sub="The more detail you add, the more powerful your document." />

            {/* Doc type */}
            <div style={{ marginBottom: 28 }}>
              <FieldLabel>What would you like to create?</FieldLabel>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                {DOC_TYPES.map((d) => (
                  <div
                    key={d.id}
                    data-testid={`doc-type-${d.id}`}
                    className="card-sel"
                    onClick={() => setDocType(d.id)}
                    style={{
                      padding: "14px 12px", borderRadius: 12, textAlign: "center",
                      background: docType === d.id ? "#fdf4e8" : "#fff",
                      border: docType === d.id ? "2px solid #d48c3c" : "2px solid #ede9e2",
                      boxShadow: docType === d.id ? "0 4px 16px rgba(212,140,60,0.12)" : "0 2px 8px rgba(0,0,0,0.04)",
                    }}
                  >
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700, color: docType === d.id ? "#c4732a" : "#333", marginBottom: 4 }}>{d.icon}</div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, color: docType === d.id ? "#c4732a" : "#333", marginBottom: 3 }}>{d.label}</div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "#aaa", lineHeight: 1.4 }}>{d.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Profile fields */}
            <div style={{ display: "grid", gap: 18 }}>
              <TextField label="Your Full Name" value={form.name} onChange={(v) => update("name", v)} placeholder="e.g. Jordan Chen" testId="input-name" />
              <div>
                <FieldLabel>Your Current / Target Role</FieldLabel>
                <select
                  data-testid="select-role"
                  value={form.currentRole}
                  onChange={(e) => update("currentRole", e.target.value)}
                  style={selectSt}
                >
                  <option value="">Select your role…</option>
                  {ROLES.map((r) => <option key={r}>{r}</option>)}
                </select>
              </div>
              <TextField label="Years of Experience" value={form.yearsExp} onChange={(v) => update("yearsExp", v)} placeholder="e.g. 6 years" testId="input-years" />
              <TextField label="Your Tech Stack" value={form.techStack} onChange={(v) => update("techStack", v)} placeholder="e.g. React, TypeScript, Node.js, PostgreSQL, AWS, Docker" multiline rows={2} testId="input-stack" />
              <TextField
                label="Your Top 2–3 Achievements (with numbers)"
                value={form.achievements}
                onChange={(v) => update("achievements", v)}
                placeholder={"e.g. Reduced API latency by 60% for 2M users\nLed migration cutting deploy time from 4h to 12min\nBuilt tooling used by 40 engineers daily"}
                multiline rows={4}
                testId="input-achievements"
              />
            </div>

            <PrimaryButton onClick={() => setStep(1)} disabled={!can0} testId="button-next-step1">
              Continue to Job Details →
            </PrimaryButton>
            {!can0 && <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#ccc", textAlign: "center", marginTop: 10 }}>Fill in all fields to continue</p>}
          </div>
        )}

        {/* STEP 1 — The Job */}
        {step === 1 && (
          <div className="fade-up">
            <SectionHeader step="Step 2 of 3" title="Tell us about the job" sub="Paste from the listing — we'll match your language to beat the ATS filter." />

            <div style={{ display: "grid", gap: 18 }}>
              <TextField label="Job Title" value={form.jobTitle} onChange={(v) => update("jobTitle", v)} placeholder="e.g. Staff Software Engineer" testId="input-job-title" />
              <TextField label="Company Name" value={form.company} onChange={(v) => update("company", v)} placeholder="e.g. Stripe" testId="input-company" />
              <TextField
                label="Job Description"
                value={form.jobDesc}
                onChange={(v) => update("jobDesc", v)}
                placeholder={"Paste the key bullet points or requirements from the job listing here.\n\nThe more you give us, the better the ATS match."}
                multiline rows={6}
                testId="input-job-desc"
              />
              <TextField label="Extra Keywords to Include (optional)" value={form.atsKeywords} onChange={(v) => update("atsKeywords", v)} placeholder="e.g. distributed systems, gRPC, CI/CD, system design" testId="input-keywords" />
            </div>

            {/* Tone */}
            <div style={{ marginTop: 28 }}>
              <FieldLabel>Choose your tone & positioning</FieldLabel>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {TONES.map((t) => (
                  <div
                    key={t.id}
                    data-testid={`tone-${t.id}`}
                    className="card-sel"
                    onClick={() => setTone(t.id)}
                    style={{
                      padding: "14px 16px", borderRadius: 12,
                      background: tone === t.id ? "#fdf4e8" : "#fff",
                      border: tone === t.id ? "2px solid #d48c3c" : "2px solid #ede9e2",
                      boxShadow: tone === t.id ? "0 4px 16px rgba(212,140,60,0.12)" : "0 2px 8px rgba(0,0,0,0.04)",
                    }}
                  >
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: tone === t.id ? "#c4732a" : "#222", marginBottom: 4 }}>{t.label}</div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#999" }}>{t.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 32 }}>
              <button data-testid="button-back-step0" onClick={() => setStep(0)} className="btn-back" style={backBtnSt}>← Back</button>
              <PrimaryButton onClick={() => setStep(2)} disabled={!can1} style={{ flex: 1, marginTop: 0 }} testId="button-next-step2">
                Review & Generate →
              </PrimaryButton>
            </div>
          </div>
        )}

        {/* STEP 2 — Review / Generate */}
        {step === 2 && (
          <div className="fade-up">
            <SectionHeader step="Step 3 of 3" title="Ready to generate" sub="Everything looks good? Hit the button and we'll craft your document." />

            <div style={{
              background: "#fff", border: "1px solid #ede9e2", borderRadius: 16,
              padding: 24, marginBottom: 28, boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            }}>
              {([
                ["Document", DOC_TYPES.find((d) => d.id === docType)?.label],
                ["Tone", TONES.find((t) => t.id === tone)?.label],
                ["Name", form.name],
                ["Role", form.currentRole],
                ["Experience", form.yearsExp],
                ["Stack", form.techStack?.slice(0, 70) + (form.techStack?.length > 70 ? "…" : "")],
                ["Applying to", `${form.jobTitle} at ${form.company}`],
              ] as [string, string | undefined][]).filter(([, v]) => v).map(([k, v]) => (
                <div key={k} style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 12 }}>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#bbb", minWidth: 88, textTransform: "uppercase", letterSpacing: "0.08em", paddingTop: 2, fontWeight: 500 }}>{k}</span>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#333", fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button data-testid="button-back-step1" onClick={() => setStep(1)} className="btn-back" style={backBtnSt}>← Back</button>
              <PrimaryButton
                onClick={handleGenerate}
                disabled={generateDoc.isPending}
                style={{ flex: 1, marginTop: 0 }}
                testId="button-generate"
              >
                {generateDoc.isPending ? (
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                    <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />
                    {loadingSteps[loadingStep]}
                  </span>
                ) : "Generate My Document"}
              </PrimaryButton>
            </div>

            {generateDoc.isPending && (
              <div style={{ marginTop: 20 }}>
                <div style={{ height: 3, background: "#f0ede8", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 2, background: "linear-gradient(90deg, #d48c3c, #e8a84e)", animation: "pulse 1.5s ease-in-out infinite", width: "70%" }} />
                </div>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#bbb", textAlign: "center", marginTop: 10 }}>Usually takes about 10–15 seconds</p>
              </div>
            )}
          </div>
        )}

        {/* STEP 3 — Result */}
        {step === 3 && (
          <div className="fade-up">
            {/* Success banner */}
            <div style={{
              background: "linear-gradient(135deg, #fdf4e8, #fef9f2)",
              border: "1px solid #f0dbb8", borderRadius: 14,
              padding: "18px 22px", marginBottom: 28,
              display: "flex", alignItems: "center", gap: 14,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                background: "linear-gradient(135deg, #d48c3c, #c4732a)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, color: "#fff", boxShadow: "0 4px 12px rgba(212,140,60,0.3)",
              }}>✓</div>
              <div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 600, color: "#1a1a1a", marginBottom: 2 }}>
                  Your {DOC_TYPES.find((d) => d.id === docType)?.label} is ready!
                </div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#b06820" }}>
                  Tailored for {form.company} · {TONES.find((t) => t.id === tone)?.label} tone · ATS-optimised
                </div>
              </div>
            </div>

            {/* Output text */}
            <div
              data-testid="output-text"
              style={{
                background: "#fff", border: "1px solid #ede9e2", borderRadius: 16,
                padding: 28, marginBottom: 18, boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
                fontSize: 14, lineHeight: 1.85, color: "#333",
                whiteSpace: "pre-wrap", fontFamily: "'Georgia', serif", minHeight: 200,
              }}
            >
              {output}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 10, marginBottom: 24 }}>
              <button
                data-testid="button-copy"
                onClick={handleCopy}
                className="btn-primary"
                style={{
                  padding: "13px 20px", borderRadius: 10,
                  background: copied ? "linear-gradient(135deg, #4caf7d, #3d9669)" : "linear-gradient(135deg, #d48c3c, #c4732a)",
                  border: "none", color: "#fff",
                  fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
                  boxShadow: copied ? "0 4px 16px rgba(76,175,125,0.3)" : "0 4px 16px rgba(212,140,60,0.3)",
                  transition: "all 0.25s",
                }}
              >
                {copied ? "Copied!" : "Copy Text"}
              </button>
              <button
                data-testid="button-redo"
                onClick={() => { setStep(2); setOutput(""); generateDoc.reset(); }}
                className="btn-back"
                style={backBtnSt}
              >
                Redo
              </button>
              <button
                data-testid="button-new-doc"
                onClick={handleReset}
                className="btn-back"
                style={backBtnSt}
              >
                New Doc
              </button>
            </div>

            {/* ATS Score Panel */}
            <div data-testid="ats-score-panel" style={{
              background: "#fff", border: "1px solid #ede9e2", borderRadius: 16,
              padding: 24, marginBottom: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                <div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>ATS Score Checker</div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 600, color: "#1a1a1a" }}>Keyword Match Analysis</div>
                </div>
                {scoreDoc.isPending && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#bbb" }}>
                    <span style={{ width: 14, height: 14, border: "2px solid #f0dbb8", borderTopColor: "#d48c3c", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />
                    Analysing…
                  </div>
                )}
                {atsScore && (
                  <ScoreRing score={atsScore.score} />
                )}
              </div>

              {scoreDoc.isPending && (
                <div style={{ height: 3, background: "#f0ede8", borderRadius: 2, overflow: "hidden", marginBottom: 16 }}>
                  <div style={{ height: "100%", borderRadius: 2, background: "linear-gradient(90deg, #d48c3c, #e8a84e)", animation: "pulse 1.5s ease-in-out infinite", width: "60%" }} />
                </div>
              )}

              {atsScore && (
                <div>
                  {/* Score bar */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ height: 8, background: "#f0ede8", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{
                        height: "100%", borderRadius: 4,
                        width: `${atsScore.score}%`,
                        background: atsScore.score >= 75 ? "linear-gradient(90deg, #4caf7d, #3d9669)"
                          : atsScore.score >= 50 ? "linear-gradient(90deg, #d48c3c, #e8a84e)"
                          : "linear-gradient(90deg, #e57373, #c62828)",
                        transition: "width 1s ease",
                      }} />
                    </div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#aaa", marginTop: 6, textAlign: "right" }}>
                      {atsScore.score >= 75 ? "Strong match" : atsScore.score >= 50 ? "Moderate match — room to improve" : "Weak match — consider revising"}
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                    {/* Matched keywords */}
                    <div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, color: "#3d9669", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                        Found ({atsScore.matched.length})
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {atsScore.matched.map((kw) => (
                          <span key={kw} style={{
                            fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 500,
                            background: "#f0faf5", border: "1px solid #b8e0cc",
                            color: "#2d7a52", borderRadius: 6, padding: "3px 9px",
                          }}>{kw}</span>
                        ))}
                      </div>
                    </div>

                    {/* Missing keywords */}
                    <div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, color: "#c4732a", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                        Missing ({atsScore.missing.length})
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {atsScore.missing.map((kw) => (
                          <span key={kw} style={{
                            fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 500,
                            background: "#fdf4e8", border: "1px solid #f0dbb8",
                            color: "#b06820", borderRadius: 6, padding: "3px 9px",
                          }}>{kw}</span>
                        ))}
                        {atsScore.missing.length === 0 && (
                          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#aaa", fontStyle: "italic" }}>None — great coverage!</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Suggestions */}
                  {atsScore.suggestions.length > 0 && (
                    <div style={{ background: "#faf9f7", borderRadius: 10, padding: "14px 16px", border: "1px solid #ede9e2" }}>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                        Improvement Tips
                      </div>
                      {atsScore.suggestions.map((s, i) => (
                        <div key={i} style={{ display: "flex", gap: 10, marginBottom: i < atsScore.suggestions.length - 1 ? 10 : 0 }}>
                          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#d48c3c", fontWeight: 700, flexShrink: 0, marginTop: 1 }}>{i + 1}.</span>
                          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#555", lineHeight: 1.6 }}>{s}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {!scoreDoc.isPending && !atsScore && (
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#ccc", textAlign: "center", padding: "12px 0" }}>
                  Score analysis will appear here after generation.
                </div>
              )}
            </div>

            {/* Interview Prep Panel */}
            <div data-testid="interview-prep-panel" style={{
              background: "#fff", border: "1px solid #ede9e2", borderRadius: 16,
              padding: 24, marginBottom: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                <div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Interview Prep</div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 600, color: "#1a1a1a" }}>Likely Questions & Talking Points</div>
                </div>
                {interviewPrep.isPending && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#bbb" }}>
                    <span style={{ width: 14, height: 14, border: "2px solid #f0dbb8", borderTopColor: "#d48c3c", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />
                    Generating…
                  </div>
                )}
              </div>

              {interviewPrep.isPending && (
                <div style={{ height: 3, background: "#f0ede8", borderRadius: 2, overflow: "hidden", marginBottom: 16 }}>
                  <div style={{ height: "100%", borderRadius: 2, background: "linear-gradient(90deg, #d48c3c, #e8a84e)", animation: "pulse 1.5s ease-in-out infinite", width: "55%" }} />
                </div>
              )}

              {interviewQuestions && interviewQuestions.length > 0 && (
                <div style={{ display: "grid", gap: 10 }}>
                  {interviewQuestions.map((q, i) => (
                    <InterviewCard key={i} index={i} question={q.question} category={q.category} talkingPoints={q.talkingPoints} />
                  ))}
                </div>
              )}

              {!interviewPrep.isPending && !interviewQuestions && (
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#ccc", textAlign: "center", padding: "12px 0" }}>
                  Interview questions will appear here after generation.
                </div>
              )}
            </div>

            {/* Upsell */}
            <div style={{
              background: "linear-gradient(135deg, #1a1a2e, #16213e)",
              borderRadius: 16, padding: 24, boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    background: "rgba(212,140,60,0.15)", border: "1px solid rgba(212,140,60,0.3)",
                    borderRadius: 20, padding: "3px 10px", marginBottom: 10,
                    fontSize: 10, fontFamily: "'DM Sans', sans-serif", color: "#d48c3c",
                    fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase",
                  }}>Pro Plan</div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, color: "#fff", fontWeight: 600, marginBottom: 8 }}>Unlock everything</div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#888", lineHeight: 1.8 }}>
                    Unlimited documents · ATS score checker<br />
                    Interview prep · Salary negotiation scripts<br />
                    GitHub profile optimizer · Priority support
                  </div>
                </div>
                <div style={{ textAlign: "center", flexShrink: 0 }}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#d48c3c" }}>$29</div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#666", marginBottom: 12 }}>per month</div>
                  <button style={{
                    padding: "11px 22px", borderRadius: 10,
                    background: "linear-gradient(135deg, #d48c3c, #c4732a)",
                    border: "none", color: "#fff",
                    fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600,
                    boxShadow: "0 4px 16px rgba(212,140,60,0.4)",
                  }}>Upgrade Now →</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  Technical:   { bg: "#eef3ff", border: "#c7d7fa", text: "#3b5bdb" },
  Behavioural: { bg: "#fff4e6", border: "#ffd8a8", text: "#c4732a" },
  Background:  { bg: "#f3faf6", border: "#b8e0cc", text: "#2d7a52" },
  Motivation:  { bg: "#fdf4ff", border: "#e9b8fa", text: "#9c36b5" },
};

function InterviewCard({ index, question, category, talkingPoints }: {
  index: number; question: string; category: string; talkingPoints: string[];
}) {
  const [open, setOpen] = useState(false);
  const colors = CATEGORY_COLORS[category] ?? CATEGORY_COLORS.Technical;
  return (
    <div
      data-testid={`interview-card-${index}`}
      style={{
        border: "1px solid #ede9e2", borderRadius: 12, overflow: "hidden",
        transition: "box-shadow 0.18s ease",
        boxShadow: open ? "0 4px 20px rgba(0,0,0,0.07)" : "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%", background: open ? "#fdf8f2" : "#fff",
          border: "none", padding: "14px 18px",
          display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12,
          cursor: "pointer", textAlign: "left", transition: "background 0.15s",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flex: 1 }}>
          <span style={{
            fontFamily: "'Playfair Display', serif", fontSize: 13, fontWeight: 700,
            color: "#d48c3c", flexShrink: 0, minWidth: 20, lineHeight: "22px",
          }}>{index + 1}.</span>
          <div style={{ flex: 1 }}>
            <span style={{
              display: "inline-block", fontFamily: "'DM Sans', sans-serif", fontSize: 10,
              fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em",
              background: colors.bg, border: `1px solid ${colors.border}`,
              color: colors.text, borderRadius: 5, padding: "2px 7px", marginBottom: 6,
            }}>{category}</span>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, color: "#1a1a1a", lineHeight: 1.5 }}>
              {question}
            </div>
          </div>
        </div>
        <span style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: 18, color: "#d48c3c",
          flexShrink: 0, lineHeight: 1, marginTop: 2, transition: "transform 0.2s",
          display: "inline-block", transform: open ? "rotate(180deg)" : "rotate(0deg)",
        }}>›</span>
      </button>

      {open && (
        <div style={{ background: "#fdf8f2", borderTop: "1px solid #f0ede8", padding: "14px 18px 16px 50px" }}>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, color: "#d48c3c", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>
            Talking Points
          </div>
          {talkingPoints.map((pt, j) => (
            <div key={j} style={{ display: "flex", gap: 10, marginBottom: j < talkingPoints.length - 1 ? 8 : 0 }}>
              <span style={{ color: "#d48c3c", fontWeight: 700, flexShrink: 0, fontSize: 12, marginTop: 2 }}>→</span>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#444", lineHeight: 1.6 }}>{pt}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 75 ? "#3d9669" : score >= 50 ? "#d48c3c" : "#e57373";
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div style={{ position: "relative", width: 72, height: 72, flexShrink: 0 }}>
      <svg width={72} height={72} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={36} cy={36} r={r} fill="none" stroke="#f0ede8" strokeWidth={6} />
        <circle
          cx={36} cy={36} r={r} fill="none" stroke={color} strokeWidth={6}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1s ease" }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 700, color, lineHeight: 1 }}>{score}</span>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.05em" }}>/ 100</span>
      </div>
    </div>
  );
}

function SectionHeader({ step, title, sub }: { step: string; title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, color: "#d48c3c", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>{step}</div>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: "#1a1a1a", margin: 0, letterSpacing: "-0.01em", lineHeight: 1.2 }}>{title}</h2>
      {sub && <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#999", marginTop: 8, lineHeight: 1.6, fontWeight: 300 }}>{sub}</p>}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>{children}</div>
  );
}

function TextField({ label, value, onChange, placeholder, multiline, rows = 3, testId }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; multiline?: boolean; rows?: number; testId?: string;
}) {
  const [focused, setFocused] = useState(false);
  const base: React.CSSProperties = {
    width: "100%",
    background: focused ? "#fff" : "#faf9f7",
    border: focused ? "2px solid #d48c3c" : "2px solid #ede9e2",
    borderRadius: 10, padding: "12px 16px", color: "#222", fontSize: 14,
    resize: "vertical" as const, lineHeight: 1.6, transition: "all 0.2s",
    boxShadow: focused ? "0 0 0 4px rgba(212,140,60,0.08)" : "none",
  };
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      {multiline ? (
        <textarea
          data-testid={testId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          style={base}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      ) : (
        <input
          data-testid={testId}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ ...base, height: 46 }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      )}
    </div>
  );
}

function PrimaryButton({ children, onClick, disabled, style = {}, testId }: {
  children: React.ReactNode; onClick: () => void; disabled?: boolean;
  style?: React.CSSProperties; testId?: string;
}) {
  return (
    <button
      data-testid={testId}
      onClick={onClick}
      disabled={disabled}
      className={disabled ? "" : "btn-primary"}
      style={{
        marginTop: 28, width: "100%", padding: "15px 24px",
        background: disabled ? "#f0ede8" : "linear-gradient(135deg, #d48c3c, #c4732a)",
        border: "none", borderRadius: 12, color: disabled ? "#ccc" : "#fff",
        fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        boxShadow: disabled ? "none" : "0 4px 20px rgba(212,140,60,0.35)",
        letterSpacing: "0.01em", transition: "all 0.2s", ...style,
      }}
    >
      {children}
    </button>
  );
}

const selectSt: React.CSSProperties = {
  width: "100%", background: "#faf9f7", border: "2px solid #ede9e2",
  borderRadius: 10, padding: "12px 16px", color: "#222", fontSize: 14,
  height: 48, cursor: "pointer", appearance: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23d48c3c' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat", backgroundPosition: "right 16px center",
  fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s",
};

const backBtnSt: React.CSSProperties = {
  padding: "12px 18px", borderRadius: 10, cursor: "pointer",
  background: "#f5f2ee", border: "2px solid #ede9e2",
  color: "#888", fontFamily: "'DM Sans', sans-serif",
  fontSize: 13, fontWeight: 500, transition: "all 0.2s",
};
