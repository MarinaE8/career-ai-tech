import { useState, useEffect } from "react";
import { useGenerateDocument } from "@workspace/api-client-react";
import { Check, Copy, RefreshCw, RotateCcw, ChevronRight, Terminal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DOC_TYPES = [
  { id: "cover", label: "Cover Letter", desc: "Tailored, ATS-optimised" },
  { id: "resume", label: "Resume Summary", desc: "Punchy 5-line profile" },
  { id: "linkedin", label: "LinkedIn About", desc: "Human, not corporate" },
];

const TONES = [
  { id: "faang", label: "FAANG-Ready", sub: "Impact-driven, metric-heavy" },
  { id: "startup", label: "Startup Energy", sub: "Scrappy, ownership mindset" },
  { id: "senior", label: "Senior/Staff", sub: "Strategic, systems thinker" },
  { id: "pivot", label: "Career Pivot", sub: "Transferable skills focus" },
];

export default function Home() {
  const [step, setStep] = useState(0);
  const [docType, setDocType] = useState("cover");
  const [tone, setTone] = useState("faang");
  const [form, setForm] = useState({
    name: "",
    currentRole: "",
    yearsExp: "",
    techStack: "",
    achievements: "",
    jobTitle: "",
    company: "",
    jobDesc: "",
    atsKeywords: "",
  });
  
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(0);
  
  const { toast } = useToast();

  const loadingMsgs = [
    "Parsing your tech stack...",
    "Optimising for ATS filters...",
    "Injecting the right keywords...",
    "Crafting your narrative...",
    "Final polish...",
  ];

  const generateDoc = useGenerateDocument();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (generateDoc.isPending) {
      interval = setInterval(() => {
        setLoadingMsg((m) => (m + 1) % loadingMsgs.length);
      }, 1200);
    }
    return () => clearInterval(interval);
  }, [generateDoc.isPending]);

  const updateForm = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleGenerate = () => {
    setStep(2);
    generateDoc.mutate(
      {
        data: {
          docType,
          tone,
          ...form,
        },
      },
      {
        onSuccess: (data) => {
          setOutput(data.text);
          setStep(3);
        },
        onError: () => {
          toast({
            title: "Generation Failed",
            description: "An error occurred while generating the document. Please try again.",
            variant: "destructive",
          });
          setStep(1); // Go back to the previous step to retry
        },
      }
    );
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setStep(0);
    setOutput("");
    setForm({
      name: "",
      currentRole: "",
      yearsExp: "",
      techStack: "",
      achievements: "",
      jobTitle: "",
      company: "",
      jobDesc: "",
      atsKeywords: "",
    });
  };

  const canProceedStep0 = form.name && form.currentRole && form.yearsExp && form.techStack && form.achievements;
  const canProceedStep1 = form.jobTitle && form.company && form.jobDesc;

  return (
    <div className="min-h-screen bg-[#060608] text-gray-300 font-mono flex flex-col items-center">
      {/* Grid Background */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,255,128,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,128,0.3) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px"
        }}
      />

      <div className="w-full max-w-3xl px-4 py-12 z-10">
        <header className="mb-12 flex items-center gap-3">
          <Terminal className="text-primary w-8 h-8" />
          <h1 className="text-2xl font-bold text-white tracking-tight">TechCareerAI</h1>
        </header>

        <main className="bg-[#0a0a0c] border border-[#1a2e22] rounded-xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
          {/* Step Indicators */}
          <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-[#4a7060] mb-8 uppercase">
            <span className={step === 0 ? "text-primary" : ""}>01_Stack</span>
            <ChevronRight className="w-3 h-3" />
            <span className={step === 1 ? "text-primary" : ""}>02_Role</span>
            <ChevronRight className="w-3 h-3" />
            <span className={step >= 2 ? "text-primary" : ""}>03_Generate</span>
          </div>

          {step === 0 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#4a7060] mb-3">Document Type</label>
                  <div className="space-y-2">
                    {DOC_TYPES.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setDocType(t.id)}
                        className={`w-full text-left p-4 rounded-lg border transition-all ${
                          docType === t.id
                            ? "border-primary bg-primary/10 text-white"
                            : "border-[#1a1a1a] bg-white/5 hover:border-primary/50"
                        }`}
                      >
                        <div className="font-bold text-sm mb-1">{t.label}</div>
                        <div className="text-xs text-gray-500">{t.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#4a7060] mb-3">Tone</label>
                  <div className="space-y-2">
                    {TONES.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setTone(t.id)}
                        className={`w-full text-left p-4 rounded-lg border transition-all ${
                          tone === t.id
                            ? "border-primary bg-primary/10 text-white"
                            : "border-[#1a1a1a] bg-white/5 hover:border-primary/50"
                        }`}
                      >
                        <div className="font-bold text-sm mb-1">{t.label}</div>
                        <div className="text-xs text-gray-500">{t.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField label="Name" value={form.name} onChange={(v) => updateForm("name", v)} placeholder="Jane Doe" />
                  <InputField label="Current/Target Role" value={form.currentRole} onChange={(v) => updateForm("currentRole", v)} placeholder="Senior Frontend Engineer" />
                </div>
                <InputField label="Years of Experience" value={form.yearsExp} onChange={(v) => updateForm("yearsExp", v)} placeholder="5+" />
                <InputField label="Tech Stack" value={form.techStack} onChange={(v) => updateForm("techStack", v)} placeholder="React, TypeScript, Node.js, AWS..." multiline />
                <InputField label="Key Achievements" value={form.achievements} onChange={(v) => updateForm("achievements", v)} placeholder="Led migration to Next.js, improving LCP by 40%..." multiline rows={4} />
              </div>

              <button
                onClick={() => setStep(1)}
                disabled={!canProceedStep0}
                className="w-full py-4 rounded-lg bg-primary/10 border border-primary/40 text-primary font-bold tracking-widest uppercase hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Next_Step &gt;
              </button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Target Job Title" value={form.jobTitle} onChange={(v) => updateForm("jobTitle", v)} placeholder="Staff Engineer" />
                <InputField label="Company" value={form.company} onChange={(v) => updateForm("company", v)} placeholder="Stripe" />
              </div>
              <InputField label="Job Description" value={form.jobDesc} onChange={(v) => updateForm("jobDesc", v)} placeholder="Paste the job description here..." multiline rows={8} />
              <InputField label="ATS Keywords (Optional)" value={form.atsKeywords} onChange={(v) => updateForm("atsKeywords", v)} placeholder="Microservices, Kafka, CI/CD..." />
              
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setStep(0)}
                  className="flex-1 py-4 rounded-lg bg-transparent border border-[#1a1a1a] text-gray-400 font-bold tracking-widest uppercase hover:border-gray-500 hover:text-white transition-all"
                >
                  &lt; Back
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={!canProceedStep1}
                  className="flex-[2] py-4 rounded-lg bg-primary/10 border border-primary/40 text-primary font-bold tracking-widest uppercase hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Run_Generate()
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="py-20 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95">
              <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-8" />
              <div className="text-xl font-bold text-white mb-2">&gt; Executing build process...</div>
              <div className="text-primary font-mono text-sm tracking-wide h-6">
                {loadingMsgs[loadingMsg]}
              </div>
              
              {/* Progress bar effect */}
              <div className="w-64 h-1 bg-[#1a2e22] mt-8 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-300 ease-linear"
                  style={{ width: `${((loadingMsg + 1) / loadingMsgs.length) * 100}%` }}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-xs uppercase tracking-widest text-primary mb-2">// Output ready</div>
                  <h2 className="text-2xl font-bold text-white">
                    {DOC_TYPES.find((d) => d.id === docType)?.label}
                  </h2>
                  <div className="text-sm text-gray-500 mt-1">
                    {form.company} - {TONES.find((t) => t.id === tone)?.label}
                  </div>
                </div>
                <div className="px-3 py-1 bg-primary/10 border border-primary/30 rounded text-primary text-xs font-bold">
                  ATS-Optimised
                </div>
              </div>

              <div className="p-6 bg-[#040406] border border-[#1a1a1a] rounded-lg font-sans text-sm leading-relaxed text-gray-300 whitespace-pre-wrap min-h-[300px]">
                {output}
              </div>

              <div className="flex flex-wrap gap-4 pt-4">
                <button
                  onClick={handleCopy}
                  className={`flex-[2] py-4 rounded-lg border font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 ${
                    copied
                      ? "bg-green-500/20 border-green-500 text-green-400"
                      : "bg-primary/10 border-primary/40 text-primary hover:bg-primary/20"
                  }`}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied" : "Copy_to_Clipboard"}
                </button>
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-4 rounded-lg bg-transparent border border-[#1a1a1a] text-gray-400 font-bold tracking-widest uppercase hover:border-gray-500 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" /> Regenerate
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 py-4 rounded-lg bg-transparent border border-[#1a1a1a] text-gray-400 font-bold tracking-widest uppercase hover:border-gray-500 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" /> Start Over
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, placeholder, multiline = false, rows = 3 }: { label: string, value: string, onChange: (v: string) => void, placeholder?: string, multiline?: boolean, rows?: number }) {
  const baseClasses = "w-full bg-white/5 border border-[#1a1a1a] rounded-lg p-3 text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 transition-colors font-mono text-sm";
  
  return (
    <div className="w-full">
      <label className="block text-xs uppercase tracking-widest text-[#4a7060] mb-2">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className={`${baseClasses} resize-y`}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={baseClasses}
        />
      )}
    </div>
  );
}
