import { Router } from "express";
import { anthropic } from "@workspace/integrations-anthropic-ai";
import { BuildResumeBody } from "@workspace/api-zod";

const router = Router();

router.post("/resume-build", async (req, res) => {
  const parsed = BuildResumeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { name, email, phone, location, linkedin, title, summary, jobs, education, skills, certifications, languages, tone } = parsed.data;

  const toneContext: Record<string, string> = {
    faang: "FAANG-level. Strong action verbs (architected, scaled, shipped, drove). Metric-heavy. Confident, results-oriented.",
    startup: "Startup energy. Ownership, bias for action, wearing many hats. Human and direct.",
    senior: "Senior/staff level. Technical leadership, systems thinking, cross-functional impact, mentorship.",
    pivot: "Career pivot. Reframe existing experience as transferable. Confident, not apologetic.",
  };

  const jobsText = jobs.map((j, i) =>
    `Job ${i + 1}: ${j.title} at ${j.company} (${j.dates})\nBullets/Notes: ${j.bullets || "(none provided — write strong bullets based on the role)"}`
  ).join("\n\n");

  const eduText = education.map((e, i) =>
    `Education ${i + 1}: ${e.degree} at ${e.school} (${e.year})${e.details ? " — " + e.details : ""}`
  ).join("\n");

  const prompt = `You are an expert tech resume writer. Create a complete, professional, ATS-optimised resume.

TONE: ${toneContext[tone] ?? toneContext.faang}

CANDIDATE DETAILS:
Name: ${name}
Email: ${email}${phone ? ` | Phone: ${phone}` : ""}${location ? ` | Location: ${location}` : ""}${linkedin ? `\nLinkedIn: ${linkedin}` : ""}
Headline: ${title}
${summary ? `Draft Summary: ${summary}` : ""}

WORK EXPERIENCE:
${jobsText}

EDUCATION:
${eduText}

${skills ? `SKILLS: ${skills}` : ""}
${certifications ? `CERTIFICATIONS: ${certifications}` : ""}
${languages ? `LANGUAGES: ${languages}` : ""}

INSTRUCTIONS:
- Write a complete, polished resume in plain text
- Use clean section headers: SUMMARY, EXPERIENCE, EDUCATION, SKILLS${certifications ? ", CERTIFICATIONS" : ""}${languages ? ", LANGUAGES" : ""}
- For each job, write 3-5 strong bullet points with action verbs and metrics
- If bullets were provided, enhance them — stronger verbs, clearer metrics
- ATS-optimised: standard section names, no tables or columns
- Professional summary: 3-4 powerful sentences if one wasn't provided, or improve the draft
- Organise skills by category (Languages, Frameworks, Tools, Cloud, etc.)
- Dates formatted consistently (e.g. Jan 2021 – Mar 2024)
- Contact info on first line, separated by | symbols
- Job title / headline directly below name

RULES:
- Never use "responsible for", "helped with", "assisted in"
- Every bullet starts with a strong past-tense action verb
- Include metrics wherever possible
- Keep it tight, no fluff
- Plain text only, use dashes (-) for bullets, no markdown symbols like ** or ##

Write the complete resume now.`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("");

    res.json({ text });
  } catch (err) {
    req.log.error({ err }, "Failed to build resume");
    res.status(500).json({ error: "Failed to build resume" });
  }
});

export default router;
