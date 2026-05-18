import { useState, useEffect } from "react";

const STRIPE_LINK = "https://buy.stripe.com/3cI9AVbnXc6f0fTccj2wU00";
const FREE_LIMIT = 3;
const STORAGE_KEY = "careerAI_gens";

const MODES = [
  { id: "docs", label: "📄 Documents", desc: "Cover letter, resume summary & LinkedIn" },
  { id: "resume", label: "📋 Full Resume", desc: "Complete resume built section by section" },
];
const DOC_TYPES = [
  { id: "cover", label: "Cover Letter", icon: "✉️", desc: "ATS-optimised, tailored to the role" },
  { id: "summary", label: "Resume Summary", icon: "⚡", desc: "Punchy 5-line professional profile" },
  { id: "linkedin", label: "LinkedIn About", icon: "💼", desc: "Human, scroll-stopping, memorable" },
];
const TONES = [
  { id: "faang", label: "FAANG-Ready", emoji: "🏆", desc: "Big tech energy, metric-driven" },
  { id: "startup", label: "Startup Vibe", emoji: "🚀", desc: "Scrappy, fast, ownership mindset" },
  { id: "senior", label: "Senior / Staff", emoji: "🧠", desc: "Strategic, leadership-focused" },
  { id: "pivot", label: "Career Pivot", emoji: "🔄", desc: "Transferable skills, new direction" },
];
const ROLES = [
  "Software Engineer", "Senior SWE", "Staff Engineer", "Frontend Engineer",
  "Backend Engineer", "Full-Stack Engineer", "ML/AI Engineer", "Data Engineer",
  "DevOps / SRE", "Platform Engineer", "Engineering Manager", "Product Manager",
  "Data Scientist", "Security Engineer", "Mobile Engineer", "Other"
];
const emptyJob = () => ({ title: "", company: "", dates: "", bullets: "" });
const emptyEdu = () => ({ degree: "", school: "", year: "", details: "" });

const getGens = () => {
  try { return parseInt(localStorage.getItem(STORAGE_KEY) || "0"); }
  catch { return 0; }
};
const addGen = () => {
  try { localStorage.setItem(STORAGE_KEY, String(getGens() + 1)); }
  catch {}
};
const isProUser = () => {
  try { return localStorage.getItem("careerAI_pro") === "true"; }
  catch { return false; }
};

function PaywallModal({ onClose }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20,
    }}>
      <div style={{
        background: "#fff", borderRadius: 20, padding: "36px 32px",
        maxWidth: 420, width: "100%",
        boxShadow: "0 24px 80px rgba(0,0,0,0.3)",
        animation: "popIn 0.3s cubic-bezier(0.34,1.56,0.64,1)",
        textAlign: "center",
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: "50%", margin: "0 auto 20px",
          background: "linear-gradient(135deg, #fdf4e8, #fde8c8)",
          border: "2px solid #f0dbb8",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 28,
        }}>🔒</div>
        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 22, fontWeight: 700, color: "#1a1a1a", marginBottom: 10,
        }}>
          You've used your 3 free documents
        </div>
        <p style={{ fontSize: 13, color: "#888", lineHeight: 1.7, marginBottom: 24 }}>
          Upgrade to Pro for unlimited cover letters, resume builders, LinkedIn profiles, and more.
        </p>
        <div style={{
          background: "#faf9f7", borderRadius: 12, padding: "16px 18px",
          marginBottom: 24, textAlign: "left",
        }}>
          {[
            "✓ Unlimited document generations",
            "✓ Full resume builder",
            "✓ ATS score checker",
            "✓ Interview prep questions",
            "✓ Salary negotiation scripts",
            "✓ Priority support",
          ].map(item => (
            <div key={item} style={{
              fontSize: 12, color: "#555", marginBottom: 8,
              fontFamily: "'DM Sans', sans-serif",
            }}>{item}</div>
          ))}
        </div>
        <div style={{ marginBottom: 16 }}>
          <span style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 36, fontWeight: 700, color: "#d48c3c",
          }}>$29</span>
          <span style={{ fontSize: 13, color: "#aaa" }}> / month</span>
        </div>
        <p style={{ fontSize: 11, color: "#ccc", marginBottom: 20 }}>
          Cancel anytime · Secure payment via Stripe
        </p>
        <a href={STRIPE_LINK} target="_blank" rel="noreferrer" style={{
          display: "block", width: "100%", padding: "15px 0",
          background: "linear-gradient(135deg, #d48c3c, #c4732a)",
          border: "none", borderRadius: 12, color: "#fff",
          fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 700,
          cursor: "pointer", textDecoration: "none",
          boxShadow: "0 6px 20px rgba(212,140,60,0.4)",
          marginBottom: 12,
        }}>
          Upgrade to Pro →
        </a>
        <button onClick={onClose} style={{
          background: "none", border: "none", color: "#bbb",
          fontSize: 12, cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif",
        }}>
          Maybe later
        </button>
      </div>
    </div>
  );
}

function UsageBadge({ gens, isPro, onUpgrade }) {
  const remaining = Math.max(FREE_LIMIT - gens, 0);
  if (isPro) return (
    <div style={{
      fontSize: 11, color: "#4ade80", background: "rgba(74,222,128,0.1)",
      border: "1px solid rgba(74,222,128,0.2)",
      padding: "4px 12px", borderRadius: 20, fontFamily: "'DM Sans', sans-serif",
    }}>⭐ Pro — Unlimited</div>
  );
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{
        fontSize: 11, color: remaining > 0 ? "#d48c3c" : "#f87171",
        background: remaining > 0 ? "#fdf4e8" : "rgba(248,113,113,0.1)",
        border: `1px solid ${remaining > 0 ? "#f0dbb8" : "rgba(248,113,113,0.3)"}`,
        padding: "4px 12px", borderRadius: 20,
        fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
      }}>
        {remaining > 0 ? `${remaining} free left` : "Free limit reached"}
      </div>
      {remaining <= 1 && (
        <button onClick={onUpgrade} style={{
          fontSize: 11, color: "#fff",
          background: "linear-gradient(135deg, #d48c3c, #c4732a)",
          border: "none", padding: "4px 12px", borderRadius: 20, cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
        }}>Upgrade</button>
      )}
    </div>
  );
}

export default function CareerAITech() {
  const [mode, setMode] = useState(null);
  const [docStep, setDocStep] = useState(0);
  const [resumeStep, setResumeStep] = useState(0);
  const [docType, setDocType] = useState("cover");
  const [tone, setTone] = useState("faang");
  const [showPaywall, setShowPaywall] = useState(false);
  const [gens, setGens] = useState(getGens());
  const [isPro, setIsPro] = useState(isProUser());

  const [docForm, setDocForm] = useState({
    name: "", currentRole: "", yearsExp: "", techStack: "",
    achievements: "", jobTitle: "", company: "", jobDesc: "", atsKeywords: "",
  });
  const [resumeForm, setResumeForm] = useState({
    name: "", email: "", phone: "", location: "", linkedin: "",
    title: "", summary: "",
    jobs: [emptyJob()], education: [emptyEdu()],
    skills: "", certifications: "", languages: "",
  });

  const [output, setOutput] = useState("");
  const [resumeOutput, setResumeOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const loadingSteps = ["Reading your profile…", "Matching keywords…", "Crafting your story…", "Polishing every word…", "Almost ready…"];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("pro") === "true") {
      localStorage.setItem("careerAI_pro", "true");
      setIsPro(true);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const canGenerate = isPro || gens < FREE_LIMIT;

  const updateDoc = (k, v) => setDocForm(f => ({ ...f, [k]: v }));
  const updateResume = (k, v) => setResumeForm(f => ({ ...f, [k]: v }));
  const updateJob = (i, k, v) => setResumeForm(f => {
    const jobs = [...f.jobs]; jobs[i] = { ...jobs[i], [k]: v }; return { ...f, jobs };
  });
  const addJob = () => setResumeForm(f => ({ ...f, jobs: [...f.jobs, emptyJob()] }));
  const removeJob = i => setResumeForm(f => ({ ...f, jobs: f.jobs.filter((_, j) => j !== i) }));
  const updateEdu = (i, k, v) => setResumeForm(f => {
    const education = [...f.education]; education[i] = { ...education[i], [k]: v }; return { ...f, education };
  });
  const addEdu = () => setResumeForm(f => ({ ...f, education: [...f.education, emptyEdu()] }));
  const removeEdu = i => setResumeForm(f => ({ ...f, education: f.education.filter((_, j) => j !== i) }));

  const buildDocPrompt = () => {
    const toneMap = {
      faang: "FAANG-level. Strong action verbs (architected, scaled, shipped, drove). Metric-heavy. Confident, results-oriented.",
      startup: "Startup energy. Ownership, bias for action, wearing many hats. Human and direct.",
      senior: "Senior/staff level. Technical leadership, systems thinking, cross-functional impact, mentorship.",
      pivot: "Career pivot. Reframe existing experience as transferable. Confident, not apologetic.",
    };
    const docMap = {
      cover: `3-paragraph ATS-optimised cover letter. Para 1: strong hook naming company and role. Para 2: 2-3 achievements with metrics. Para 3: forward-looking close with CTA. Greeting + 3 paragraphs + sign-off. Use real name.`,
      summary: `4-5 sentence resume summary. Strong identity statement, key achievements with numbers, what they bring. No bullets. Flowing. ATS-friendly.`,
      linkedin: `LinkedIn About in first person. Scroll-stopping hook. What they build + identity. Key wins. Closing line about what they want. Conversational, human.`,
    };
    return `You are an expert tech career coach. Tone: ${toneMap[tone]}
Candidate: ${docForm.name}, ${docForm.currentRole}, ${docForm.yearsExp} experience, Stack: ${docForm.techStack}, Achievements: ${docForm.achievements}
Target: ${docForm.jobTitle} at ${docForm.company}. JD: ${docForm.jobDesc}. Keywords: ${docForm.atsKeywords || "extract from JD"}
Write: ${DOC_TYPES.find(d => d.id === docType)?.label}
Instructions: ${docMap[docType]}
Rules: No "passionate about", "leverage", "synergy". Every claim earned. Mirror JD language. Sound human.
Write ONLY the document.`;
  };

  const buildResumePrompt = () => {
    const jobsText = resumeForm.jobs.map((j, i) =>
      `Job ${i + 1}: ${j.title} at ${j.company} (${j.dates})\nBullets: ${j.bullets}`
    ).join("\n\n");
    const eduText = resumeForm.education.map((e, i) =>
      `Edu ${i + 1}: ${e.degree} at ${e.school} (${e.year})${e.details ? " — " + e.details : ""}`
    ).join("\n");
    return `You are an expert tech resume writer. Create a complete, professional, ATS-optimised resume.
Name: ${resumeForm.name} | Email: ${resumeForm.email} | Phone: ${resumeForm.phone} | Location: ${resumeForm.location}
LinkedIn: ${resumeForm.linkedin} | Title: ${resumeForm.title} | Summary: ${resumeForm.summary}
EXPERIENCE:\n${jobsText}\nEDUCATION:\n${eduText}
SKILLS: ${resumeForm.skills} | CERTS: ${resumeForm.certifications} | LANGUAGES: ${resumeForm.languages}
Write a complete polished resume. Plain text, standard headers (SUMMARY, EXPERIENCE, EDUCATION, SKILLS).
3-5 bullets per job with strong action verbs and metrics. Never "responsible for" or "helped with".
Write the complete resume now.`;
  };

  const callAPI = async (prompt, onSuccess) => {
    if (!canGenerate) { setShowPaywall(true); return; }
    setLoading(true);
    setLoadingStep(0);
    const iv = setInterval(() => setLoadingStep(s => (s + 1) % loadingSteps.length), 1200);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      const text = data.content?.map(b => b.text || "").join("") || "Something went wrong. Please try again.";
      if (!isPro) { addGen(); setGens(getGens()); }
      onSuccess(text);
    } catch {
      onSuccess("Something went wrong. Please try again.");
    }
    clearInterval(iv);
    setLoading(false);
  };

  const generateDoc = () => callAPI(buildDocPrompt(), txt => { setOutput(txt); setDocStep(3); });
  const generateResume = () => callAPI(buildResumePrompt(), txt => { setResumeOutput(txt); setResumeStep(3); });

  const copy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const resetAll = () => {
    setMode(null); setDocStep(0); setResumeStep(0);
    setOutput(""); setResumeOutput("");
  };

  const canDoc0 = docForm.name && docForm.currentRole && docForm.yearsExp && docForm.techStack && docForm.achievements;
  const canDoc1 = docForm.jobTitle && docForm.company && docForm.jobDesc;
  const canResume0 = resumeForm.name && resumeForm.email && resumeForm.title;
  const canResume1 = resumeForm.jobs[0].title && resumeForm.jobs[0].company;
  const canResume2 = resumeForm.education[0].degree || resumeForm.skills;

  return (
    <div style={{ minHeight: "100vh", background: "#faf9f7" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #faf9f7; font-family: 'DM Sans', sans-serif; }
        ::selection { background: #f0e6d3; }
        input, textarea, select { font-family: 'DM Sans', sans-serif !important; }
        input::placeholder, textarea::placeholder { color: #ccc; }
        input:focus, textarea:focus, select:focus { outline: none; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @keyframes popIn { from { opacity:0; transform:scale(0.85); } to { opacity:1; transform:scale(1); } }
        .fade-up { animation: fadeUp 0.35s ease forwards; }
        .card-hover { transition: all 0.18s ease; cursor: pointer; }
        .card-hover:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.09) !important; }
        .btn-p { transition: all 0.18s ease; }
        .btn-p:hover:not(:disabled) { filter: brightness(1.08); transform: translateY(-1px); }
        .btn-s:hover { background: #ece8e2 !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #ddd; border-radius: 4px; }
      `}</style>

      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} />}

      <header style={{
        background: "rgba(250,249,247,0.96)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid #ede9e2", padding: "0 28px",
        position: "sticky", top: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between", height: 60,
      }}>
        <div onClick={resetAll} style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer" }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: "linear-gradient(135deg, #d48c3c, #c4732a)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
          }}>⚡</div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: "#1a1a1a" }}>
            TechCareer<span style={{ color: "#d48c3c" }}>.tech</span>
          </span>
        </div>
        <UsageBadge gens={gens} isPro={isPro} onUpgrade={() => setShowPaywall(true)} />
      </header>

      {!isPro && gens >= FREE_LIMIT && (
        <div style={{
          background: "linear-gradient(90deg, #d48c3c, #c4732a)",
          padding: "10px 20px", textAlign: "center",
          fontSize: 13, color: "#fff", fontWeight: 500,
        }}>
          You've used all 3 free documents.{" "}
          <button onClick={() => setShowPaywall(true)} style={{
            background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.4)",
            color: "#fff", padding: "2px 12px", borderRadius: 20, cursor: "pointer",
            fontSize: 12, fontWeight: 700, marginLeft: 8,
          }}>Upgrade to Pro →</button>
        </div>
      )}

      {!isPro && gens === FREE_LIMIT - 1 && (
        <div style={{
          background: "#fdf4e8", borderBottom: "1px solid #f0dbb8",
          padding: "10px 20px", textAlign: "center",
          fontSize: 12, color: "#b06820",
        }}>
          ⚠️ Last free document — upgrade to Pro for unlimited access
        </div>
      )}

      {!mode && (
        <div className="fade-up">
          <div style={{
            textAlign: "center", padding: "52px 24px 40px",
            background: "linear-gradient(180deg, #fdf8f2 0%, #faf9f7 100%)",
            borderBottom: "1px solid #ede9e2",
          }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "#fdf4e8", border: "1px solid #f0dbb8",
              borderRadius: 20, padding: "5px 14px", marginBottom: 22,
              fontSize: 12, color: "#b06820",
            }}>🔥 1,000+ engineers hired this month</div>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(26px, 5vw, 42px)", fontWeight: 700,
              color: "#1a1a1a", lineHeight: 1.15, marginBottom: 14, letterSpacing: "-0.02em",
            }}>
              Land your next tech role<br />
              <span style={{ color: "#d48c3c" }}>faster than the ATS filter.</span>
            </h1>
            <p style={{ fontSize: 15, color: "#888", maxWidth: 460, margin: "0 auto", lineHeight: 1.65, fontWeight: 300 }}>
              AI-powered documents tailored to your stack and the exact job you want.
              {!isPro && <span style={{ color: "#d48c3c" }}> Try 3 documents free.</span>}
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 28, marginTop: 28, flexWrap: "wrap" }}>
              {[["⚡", "60 sec", "to generate"], ["🎯", "98%", "ATS pass rate"], ["💼", "FAANG", "ready"]].map(([icon, stat, label]) => (
                <div key={stat} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 18, marginBottom: 2 }}>{icon}</div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 19, fontWeight: 700, color: "#1a1a1a" }}>{stat}</div>
                  <div style={{ fontSize: 10, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ maxWidth: 580, margin: "0 auto", padding: "44px 24px" }}>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "#1a1a1a", marginBottom: 6 }}>
                What do you want to create?
              </div>
              <p style={{ fontSize: 13, color: "#aaa" }}>
                {isPro ? "Pro plan — unlimited generations" : `${Math.max(FREE_LIMIT - gens, 0)} free document${Math.max(FREE_LIMIT - gens, 0) !== 1 ? "s" : ""} remaining`}
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {MODES.map(m => (
                <div key={m.id} className="card-hover" onClick={() => {
                  if (!canGenerate) { setShowPaywall(true); return; }
                  setMode(m.id);
                }} style={{
                  padding: "28px 22px", borderRadius: 16, textAlign: "center",
                  background: "#fff", border: "2px solid #ede9e2",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
                  opacity: !canGenerate ? 0.6 : 1,
                }}>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>{m.label.split(" ")[0]}</div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 600, color: "#1a1a1a", marginBottom: 6 }}>
                    {m.label.split(" ").slice(1).join(" ")}
                  </div>
                  <div style={{ fontSize: 12, color: "#aaa", lineHeight: 1.5, marginBottom: 14 }}>{m.desc}</div>
                  <div style={{
                    padding: "9px 0", borderRadius: 8,
                    background: !canGenerate ? "#f0ede8" : "linear-gradient(135deg, #d48c3c, #c4732a)",
                    color: !canGenerate ? "#ccc" : "#fff", fontSize: 12, fontWeight: 600,
                  }}>{!canGenerate ? "🔒 Upgrade to unlock" : "Get Started →"}</div>
                </div>
              ))}
            </div>
            {!isPro && gens >= FREE_LIMIT && (
              <div style={{
                marginTop: 24, background: "linear-gradient(135deg, #1a1a2e, #16213e)",
                borderRadius: 16, padding: 24, textAlign: "center",
              }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: "#fff", fontWeight: 700, marginBottom: 8 }}>
                  Ready to keep going?
                </div>
                <div style={{ fontSize: 12, color: "#666", marginBottom: 20, lineHeight: 1.7 }}>
                  One job offer pays for a year of Pro.<br />
                  Unlimited docs · ATS checker · Interview prep
                </div>
                <button onClick={() => setShowPaywall(true)} style={{
                  padding: "14px 32px", borderRadius: 12, cursor: "pointer",
                  background: "linear-gradient(135deg, #d48c3c, #c4732a)",
                  border: "none", color: "#fff", fontSize: 14, fontWeight: 700,
                  boxShadow: "0 6px 20px rgba(212,140,60,0.4)",
                }}>Upgrade to Pro — $29/mo →</button>
              </div>
            )}
          </div>
        </div>
      )}

      {mode === "docs" && (
        <div>
          <ProgressBar steps={["Your Profile", "The Job", "Generate", "Result"]} current={docStep} />
          <main style={{ maxWidth: 620, margin: "0 auto", padding: "36px 24px 80px" }}>
            {docStep === 0 && (
              <div className="fade-up">
                <SectionHeader step="Step 1 of 3" title="Tell us about yourself" sub="The more detail you add, the more powerful your document." />
                <FL>What would you like to create?</FL>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 24 }}>
                  {DOC_TYPES.map(d => (
                    <OptionCard key={d.id} selected={docType === d.id} onClick={() => setDocType(d.id)}>
                      <div style={{ fontSize: 22, marginBottom: 6 }}>{d.icon}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: docType === d.id ? "#c4732a" : "#333", marginBottom: 3 }}>{d.label}</div>
                      <div style={{ fontSize: 10, color: "#aaa", lineHeight: 1.4 }}>{d.desc}</div>
                    </OptionCard>
                  ))}
                </div>
                <div style={{ display: "grid", gap: 16 }}>
                  <TF label="Full Name" value={docForm.name} onChange={v => updateDoc("name", v)} placeholder="e.g. Jordan Chen" />
                  <div>
                    <FL>Current / Target Role</FL>
                    <select value={docForm.currentRole} onChange={e => updateDoc("currentRole", e.target.value)} style={selSt}>
                      <option value="">Select role…</option>
                      {ROLES.map(r => <option key={r}>{r}</option>)}
                    </select>
                  </div>
                  <TF label="Years of Experience" value={docForm.yearsExp} onChange={v => updateDoc("yearsExp", v)} placeholder="e.g. 6 years" />
                  <TF label="Tech Stack" value={docForm.techStack} onChange={v => updateDoc("techStack", v)}
                    placeholder="e.g. React, TypeScript, Node.js, PostgreSQL, AWS" multiline rows={2} />
                  <TF label="Top 2–3 Achievements (with numbers)" value={docForm.achievements} onChange={v => updateDoc("achievements", v)}
                    placeholder={"e.g. Reduced API latency by 60% for 2M users\nLed migration cutting deploy time from 4h to 12min"} multiline rows={4} />
                </div>
                <PBtn onClick={() => setDocStep(1)} disabled={!canDoc0}>Continue to Job Details →</PBtn>
                {!canDoc0 && <Hint>Fill in all fields to continue</Hint>}
              </div>
            )}
            {docStep === 1 && (
              <div className="fade-up">
                <SectionHeader step="Step 2 of 3" title="Tell us about the job" sub="Paste from the listing — we'll match your language to beat the ATS." />
                <div style={{ display: "grid", gap: 16 }}>
                  <TF label="Job Title" value={docForm.jobTitle} onChange={v => updateDoc("jobTitle", v)} placeholder="e.g. Staff Software Engineer" />
                  <TF label="Company Name" value={docForm.company} onChange={v => updateDoc("company", v)} placeholder="e.g. Stripe" />
                  <TF label="Job Description" value={docForm.jobDesc} onChange={v => updateDoc("jobDesc", v)}
                    placeholder="Paste key bullet points from the job listing…" multiline rows={6} />
                  <TF label="Extra Keywords (optional)" value={docForm.atsKeywords} onChange={v => updateDoc("atsKeywords", v)}
                    placeholder="e.g. distributed systems, gRPC, CI/CD" />
                </div>
                <div style={{ marginTop: 24 }}>
                  <FL>Tone & Positioning</FL>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {TONES.map(t => (
                      <OptionCard key={t.id} selected={tone === t.id} onClick={() => setTone(t.id)}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: 17 }}>{t.emoji}</span>
                          <span style={{ fontSize: 13, fontWeight: 600, color: tone === t.id ? "#c4732a" : "#222" }}>{t.label}</span>
                        </div>
                        <div style={{ fontSize: 11, color: "#999", paddingLeft: 25 }}>{t.desc}</div>
                      </OptionCard>
                    ))}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
                  <SBtn onClick={() => setDocStep(0)}>← Back</SBtn>
                  <PBtn onClick={() => setDocStep(2)} disabled={!canDoc1} style={{ flex: 1, marginTop: 0 }}>Review & Generate →</PBtn>
                </div>
              </div>
            )}
            {docStep === 2 && (
              <div className="fade-up">
                <SectionHeader step="Step 3 of 3" title="Ready to generate" sub="Everything looks good? Hit generate." />
                <ReviewCard rows={[
                  ["Document", DOC_TYPES.find(d => d.id === docType)?.label],
                  ["Tone", TONES.find(t => t.id === tone)?.label],
                  ["Name", docForm.name],
                  ["Role", docForm.currentRole],
                  ["Applying to", docForm.jobTitle + " at " + docForm.company],
                  ["Stack", docForm.techStack?.slice(0, 65) + (docForm.techStack?.length > 65 ? "…" : "")],
                ]} />
                {!isPro && (
                  <div style={{
                    background: "#fdf4e8", border: "1px solid #f0dbb8", borderRadius: 10,
                    padding: "10px 16px", marginBottom: 16, fontSize: 12, color: "#b06820", textAlign: "center",
                  }}>
                    {gens >= FREE_LIMIT ? "🔒 Upgrade to continue" : `Using 1 of your ${FREE_LIMIT - gens} remaining free generations`}
                  </div>
                )}
                <div style={{ display: "flex", gap: 10 }}>
                  <SBtn onClick={() => setDocStep(1)}>← Back</SBtn>
                  <PBtn onClick={generateDoc} disabled={loading || !canGenerate} style={{ flex: 1, marginTop: 0 }}>
                    {!canGenerate ? "🔒 Upgrade to Generate" : <LoadingLabel loading={loading} step={loadingSteps[loadingStep]} label="✨ Generate My Document" />}
                  </PBtn>
                </div>
                {!canGenerate && (
                  <button onClick={() => setShowPaywall(true)} style={{
                    marginTop: 12, width: "100%", padding: "13px", borderRadius: 11,
                    background: "linear-gradient(135deg, #d48c3c, #c4732a)",
                    border: "none", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer",
                  }}>Upgrade to Pro — $29/mo →</button>
                )}
                <LoadingBar loading={loading} />
              </div>
            )}
            {docStep === 3 && (
              <div className="fade-up">
                <SuccessBanner
                  title={`Your ${DOC_TYPES.find(d => d.id === docType)?.label} is ready!`}
                  sub={`Tailored for ${docForm.company} · ${TONES.find(t => t.id === tone)?.label} · ATS-optimised ✓`}
                />
                <OutputBox text={output} />
                <ActionButtons onCopy={() => copy(output)} copied={copied}
                  onRedo={() => { setDocStep(2); setOutput(""); }} onNew={resetAll} />
                <UpsellCard onUpgrade={() => setShowPaywall(true)} isPro={isPro} />
              </div>
            )}
          </main>
        </div>
      )}

      {mode === "resume" && (
        <div>
          <ProgressBar steps={["Personal Info", "Experience", "Education & Skills", "Your Resume"]} current={resumeStep} />
          <main style={{ maxWidth: 620, margin: "0 auto", padding: "36px 24px 80px" }}>
            {resumeStep === 0 && (
              <div className="fade-up">
                <SectionHeader step="Step 1 of 3" title="Personal information" sub="This goes at the top of your resume." />
                <div style={{ display: "grid", gap: 16 }}>
                  <TF label="Full Name" value={resumeForm.name} onChange={v => updateResume("name", v)} placeholder="e.g. Jordan Chen" />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <TF label="Email" value={resumeForm.email} onChange={v => updateResume("email", v)} placeholder="jordan@email.com" />
                    <TF label="Phone" value={resumeForm.phone} onChange={v => updateResume("phone", v)} placeholder="+1 555 000 0000" />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <TF label="Location" value={resumeForm.location} onChange={v => updateResume("location", v)} placeholder="San Francisco, CA" />
                    <TF label="LinkedIn (optional)" value={resumeForm.linkedin} onChange={v => updateResume("linkedin", v)} placeholder="linkedin.com/in/jordan" />
                  </div>
                  <TF label="Job Title / Headline" value={resumeForm.title} onChange={v => updateResume("title", v)} placeholder="e.g. Senior Software Engineer" />
                  <TF label="Summary (optional — AI writes one if blank)" value={resumeForm.summary} onChange={v => updateResume("summary", v)}
                    placeholder="Leave blank and we'll write a powerful summary." multiline rows={3} />
                </div>
                <PBtn onClick={() => setResumeStep(1)} disabled={!canResume0}>Continue to Experience →</PBtn>
                {!canResume0 && <Hint>Name, email and job title are required</Hint>}
              </div>
            )}
            {resumeStep === 1 && (
              <div className="fade-up">
                <SectionHeader step="Step 2 of 3" title="Work experience" sub="Add your roles. Leave bullets blank and AI writes them." />
                {resumeForm.jobs.map((job, i) => (
                  <div key={i} style={{
                    background: "#fff", border: "1px solid #ede9e2", borderRadius: 14,
                    padding: 20, marginBottom: 16, boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#d48c3c", textTransform: "uppercase", letterSpacing: "0.08em" }}>Job {i + 1}</div>
                      {resumeForm.jobs.length > 1 && (
                        <button onClick={() => removeJob(i)} style={{ background: "none", border: "none", color: "#ccc", cursor: "pointer", fontSize: 13 }}>✕ Remove</button>
                      )}
                    </div>
                    <div style={{ display: "grid", gap: 12 }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <TF label="Job Title" value={job.title} onChange={v => updateJob(i, "title", v)} placeholder="e.g. Senior Engineer" />
                        <TF label="Company" value={job.company} onChange={v => updateJob(i, "company", v)} placeholder="e.g. Stripe" />
                      </div>
                      <TF label="Dates" value={job.dates} onChange={v => updateJob(i, "dates", v)} placeholder="e.g. Jan 2021 – Mar 2024" />
                      <TF label="Achievements (optional — AI writes if blank)" value={job.bullets}
                        onChange={v => updateJob(i, "bullets", v)}
                        placeholder="e.g. Led API redesign, reduced latency 60%" multiline rows={4} />
                    </div>
                  </div>
                ))}
                <button onClick={addJob} style={{
                  width: "100%", padding: "11px", borderRadius: 10, cursor: "pointer",
                  background: "transparent", border: "2px dashed #ede9e2",
                  color: "#bbb", fontSize: 13, fontWeight: 500, marginBottom: 8,
                }}>+ Add Another Job</button>
                <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                  <SBtn onClick={() => setResumeStep(0)}>← Back</SBtn>
                  <PBtn onClick={() => setResumeStep(2)} disabled={!canResume1} style={{ flex: 1, marginTop: 0 }}>Continue to Education →</PBtn>
                </div>
              </div>
            )}
            {resumeStep === 2 && (
              <div className="fade-up">
                <SectionHeader step="Step 3 of 3" title="Education & Skills" sub="Fill in what's relevant, leave the rest blank." />
                <FL>Education</FL>
                {resumeForm.education.map((edu, i) => (
                  <div key={i} style={{
                    background: "#fff", border: "1px solid #ede9e2", borderRadius: 14,
                    padding: 20, marginBottom: 14, boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#d48c3c", textTransform: "uppercase", letterSpacing: "0.08em" }}>Education {i + 1}</div>
                      {resumeForm.education.length > 1 && (
                        <button onClick={() => removeEdu(i)} style={{ background: "none", border: "none", color: "#ccc", cursor: "pointer", fontSize: 13 }}>✕ Remove</button>
                      )}
                    </div>
                    <div style={{ display: "grid", gap: 12 }}>
                      <TF label="Degree" value={edu.degree} onChange={v => updateEdu(i, "degree", v)} placeholder="e.g. BSc Computer Science" />
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <TF label="School" value={edu.school} onChange={v => updateEdu(i, "school", v)} placeholder="e.g. MIT" />
                        <TF label="Year" value={edu.year} onChange={v => updateEdu(i, "year", v)} placeholder="e.g. 2018" />
                      </div>
                      <TF label="Extra details (optional)" value={edu.details} onChange={v => updateEdu(i, "details", v)} placeholder="e.g. First Class Honours" />
                    </div>
                  </div>
                ))}
                <button onClick={addEdu} style={{
                  width: "100%", padding: "11px", borderRadius: 10, cursor: "pointer",
                  background: "transparent", border: "2px dashed #ede9e2",
                  color: "#bbb", fontSize: 13, fontWeight: 500, marginBottom: 24,
                }}>+ Add Another Qualification</button>
                <div style={{ display: "grid", gap: 16 }}>
                  <TF label="Technical Skills" value={resumeForm.skills} onChange={v => updateResume("skills", v)}
                    placeholder={"e.g. Languages: Python, TypeScript\nFrameworks: React, FastAPI\nCloud: AWS, Docker"} multiline rows={4} />
                  <TF label="Certifications (optional)" value={resumeForm.certifications} onChange={v => updateResume("certifications", v)}
                    placeholder="e.g. AWS Solutions Architect" />
                  <TF label="Languages (optional)" value={resumeForm.languages} onChange={v => updateResume("languages", v)}
                    placeholder="e.g. English (native), Spanish (conversational)" />
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
                  <SBtn onClick={() => setResumeStep(1)}>← Back</SBtn>
                  <PBtn onClick={generateResume} disabled={loading || !canResume2 || !canGenerate} style={{ flex: 1, marginTop: 0 }}>
                    {!canGenerate ? "🔒 Upgrade to Generate" : <LoadingLabel loading={loading} step={loadingSteps[loadingStep]} label="✨ Build My Resume" />}
                  </PBtn>
                </div>
                {!canGenerate && (
                  <button onClick={() => setShowPaywall(true)} style={{
                    marginTop: 12, width: "100%", padding: "13px", borderRadius: 11,
                    background: "linear-gradient(135deg, #d48c3c, #c4732a)",
                    border: "none", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer",
                  }}>Upgrade to Pro — $29/mo →</button>
                )}
                <LoadingBar loading={loading} />
              </div>
            )}
            {resumeStep === 3 && (
              <div className="fade-up">
                <SuccessBanner title="Your resume is ready!" sub={`${resumeForm.name} · ${resumeForm.title} · ATS-optimised ✓`} />
                <div style={{
                  background: "#fff", border: "1px solid #ede9e2", borderRadius: 12,
                  padding: "12px 16px", marginBottom: 16, display: "flex", gap: 10,
                }}>
                  <span>💡</span>
                  <div style={{ fontSize: 12, color: "#888", lineHeight: 1.6 }}>
                    <strong style={{ color: "#555" }}>Next:</strong> Copy into Google Docs or Word. Use single-column template. Export as PDF.
                  </div>
                </div>
                <OutputBox text={resumeOutput} />
                <ActionButtons onCopy={() => copy(resumeOutput)} copied={copied}
                  onRedo={() => { setResumeStep(2); setResumeOutput(""); }}
                  onNew={resetAll} redoLabel="🔄 Rebuild" />
                <UpsellCard onUpgrade={() => setShowPaywall(true)} isPro={isPro} />
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
}

function ProgressBar({ steps, current }) {
  return (
    <div style={{ background: "#fff", borderBottom: "1px solid #ede9e2", padding: "0 24px" }}>
      <div style={{ maxWidth: 620, margin: "0 auto", display: "flex" }}>
        {steps.map((s, i) => (
          <div key={i} style={{
            flex: 1, padding: "13px 4px", textAlign: "center",
            borderBottom: i <= current ? "2px solid #d48c3c" : "2px solid transparent",
            transition: "all 0.3s",
          }}>
            <span style={{
              fontSize: 10, fontWeight: i <= current ? 600 : 400,
              color: i <= current ? "#d48c3c" : "#ccc",
              letterSpacing: "0.05em", textTransform: "uppercase",
            }}>{i < current ? "✓ " : ""}{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionHeader({ step, title, sub }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: "#d48c3c", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 7 }}>{step}</div>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: "#1a1a1a", letterSpacing: "-0.01em", lineHeight: 1.2 }}>{title}</h2>
      {sub && <p style={{ fontSize: 13, color: "#999", marginTop: 7, lineHeight: 1.6, fontWeight: 300 }}>{sub}</p>}
    </div>
  );
}

function FL({ children }) {
  return <div style={{ fontSize: 10, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>{children}</div>;
}

function TF({ label, value, onChange, placeholder, multiline, rows = 3 }) {
  const [focused, setFocused] = useState(false);
  const st = {
    width: "100%", background: focused ? "#fff" : "#faf9f7",
    border: focused ? "2px solid #d48c3c" : "2px solid #ede9e2",
    borderRadius: 9, padding: "11px 14px", color: "#222", fontSize: 13,
    resize: "vertical", lineHeight: 1.6, transition: "all 0.18s",
    boxShadow: focused ? "0 0 0 4px rgba(212,140,60,0.07)" : "none",
  };
  return (
    <div>
      {label && <FL>{label}</FL>}
      {multiline
        ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} style={st}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
        : <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ ...st, height: 44 }}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
      }
    </div>
  );
}

function OptionCard({ children, selected, onClick }) {
  return (
    <div className="card-hover" onClick={onClick} style={{
      padding: "14px 10px", borderRadius: 12, textAlign: "center",
      background: selected ? "#fdf4e8" : "#fff",
      border: selected ? "2px solid #d48c3c" : "2px solid #ede9e2",
      boxShadow: selected ? "0 4px 16px rgba(212,140,60,0.1)" : "0 2px 8px rgba(0,0,0,0.04)",
    }}>{children}</div>
  );
}

function PBtn({ children, onClick, disabled, style = {} }) {
  return (
    <button onClick={onClick} disabled={disabled} className={disabled ? "" : "btn-p"} style={{
      marginTop: 24, width: "100%", padding: "14px 22px",
      background: disabled ? "#f0ede8" : "linear-gradient(135deg, #d48c3c, #c4732a)",
      border: "none", borderRadius: 11, color: disabled ? "#ccc" : "#fff",
      fontSize: 14, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
      boxShadow: disabled ? "none" : "0 4px 18px rgba(212,140,60,0.32)",
      transition: "all 0.18s", ...style,
    }}>{children}</button>
  );
}

function SBtn({ children, onClick }) {
  return (
    <button onClick={onClick} className="btn-s" style={{
      padding: "12px 16px", borderRadius: 11, cursor: "pointer",
      background: "#f5f2ee", border: "2px solid #ede9e2",
      color: "#999", fontSize: 13, fontWeight: 500, transition: "all 0.18s",
    }}>{children}</button>
  );
}

function Hint({ children }) {
  return <p style={{ fontSize: 11, color: "#ccc", textAlign: "center", marginTop: 8 }}>{children}</p>;
}

function ReviewCard({ rows }) {
  return (
    <div style={{
      background: "#fff", border: "1px solid #ede9e2", borderRadius: 14,
      padding: 22, marginBottom: 22, boxShadow: "0 4px 18px rgba(0,0,0,0.04)",
    }}>
      {rows.filter(([, v]) => v).map(([k, v]) => (
        <div key={k} style={{ display: "flex", gap: 14, marginBottom: 10 }}>
          <span style={{ fontSize: 10, color: "#ccc", minWidth: 82, textTransform: "uppercase", letterSpacing: "0.08em", paddingTop: 2, fontWeight: 600 }}>{k}</span>
          <span style={{ fontSize: 13, color: "#333", fontWeight: 500 }}>{v}</span>
        </div>
      ))}
    </div>
  );
}

function LoadingLabel({ loading, step, label }) {
  if (!loading) return <>{label}</>;
  return (
    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 9 }}>
      <span style={{ width: 15, height: 15, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />
      {step}
    </span>
  );
}

function LoadingBar({ loading }) {
  if (!loading) return null;
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ height: 3, background: "#f0ede8", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ height: "100%", borderRadius: 2, background: "linear-gradient(90deg, #d48c3c, #e8a84e)", animation: "pulse 1.5s ease-in-out infinite", width: "65%" }} />
      </div>
      <p style={{ fontSize: 11, color: "#ccc", textAlign: "center", marginTop: 8 }}>Usually takes 10–20 seconds</p>
    </div>
  );
}

function SuccessBanner({ title, sub }) {
  return (
    <div style={{
      background: "linear-gradient(135deg, #fdf4e8, #fef9f2)",
      border: "1px solid #f0dbb8", borderRadius: 14,
      padding: "16px 20px", marginBottom: 22,
      display: "flex", alignItems: "center", gap: 13,
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
        background: "linear-gradient(135deg, #d48c3c, #c4732a)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 16, color: "#fff", boxShadow: "0 4px 12px rgba(212,140,60,0.28)",
      }}>✓</div>
      <div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 600, color: "#1a1a1a", marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: 11, color: "#b06820" }}>{sub}</div>
      </div>
    </div>
  );
}

function OutputBox({ text }) {
  return (
    <div style={{
      background: "#fff", border: "1px solid #ede9e2", borderRadius: 14,
      padding: "24px 26px", marginBottom: 16,
      boxShadow: "0 4px 22px rgba(0,0,0,0.05)",
      fontSize: 13, lineHeight: 1.85, color: "#333",
      whiteSpace: "pre-wrap", fontFamily: "'Georgia', serif", minHeight: 200,
    }}>{text}</div>
  );
}

function ActionButtons({ onCopy, copied, onRedo, onNew, redoLabel = "🔄 Redo" }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 10, marginBottom: 22 }}>
      <button onClick={onCopy} className="btn-p" style={{
        padding: "12px 18px", borderRadius: 10, cursor: "pointer",
        background: copied ? "linear-gradient(135deg, #4caf7d, #3d9669)" : "linear-gradient(135deg, #d48c3c, #c4732a)",
        border: "none", color: "#fff", fontSize: 13, fontWeight: 600,
        boxShadow: copied ? "0 4px 14px rgba(76,175,125,0.28)" : "0 4px 14px rgba(212,140,60,0.28)",
        transition: "all 0.22s",
      }}>{copied ? "✓ Copied!" : "📋 Copy Text"}</button>
      <SBtn onClick={onRedo}>{redoLabel}</SBtn>
      <SBtn onClick={onNew}>✦ New</SBtn>
    </div>
  );
}

function UpsellCard({ onUpgrade, isPro }) {
  if (isPro) return null;
  return (
    <div style={{
      background: "linear-gradient(135deg, #1a1a2e, #16213e)",
      borderRadius: 16, padding: 22, boxShadow: "0 8px 30px rgba(0,0,0,0.14)",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            background: "rgba(212,140,60,0.15)", border: "1px solid rgba(212,140,60,0.3)",
            borderRadius: 20, padding: "3px 10px", marginBottom: 9,
            fontSize: 10, color: "#d48c3c", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase",
          }}>⭐ Pro Plan</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, color: "#fff", fontWeight: 600, marginBottom: 7 }}>Unlock everything</div>
          <div style={{ fontSize: 11, color: "#777", lineHeight: 1.8 }}>
            Unlimited docs · ATS checker · Interview prep<br />
            Salary scripts · Priority support
          </div>
        </div>
        <div style={{ textAlign: "center", flexShrink: 0 }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: "#d48c3c" }}>$29</div>
          <div style={{ fontSize: 11, color: "#555", marginBottom: 10 }}>per month</div>
          <button onClick={onUpgrade} style={{
            padding: "10px 20px", borderRadius: 9, cursor: "pointer",
            background: "linear-gradient(135deg, #d48c3c, #c4732a)",
            border: "none", color: "#fff", fontSize: 12, fontWeight: 600,
            boxShadow: "0 4px 14px rgba(212,140,60,0.38)",
          }}>Upgrade Now →</button>
        </div>
      </div>
    </div>
  );
}

const selSt = {
  width: "100%", background: "#faf9f7", border: "2px solid #ede9e2",
  borderRadius: 9, padding: "11px 14px", color: "#222", fontSize: 13,
  height: 44, cursor: "pointer", appearance: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23d48c3c' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center", transition: "all 0.18s",
};
