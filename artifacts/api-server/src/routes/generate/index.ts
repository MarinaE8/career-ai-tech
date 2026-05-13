import { Router } from "express";
import { anthropic } from "@workspace/integrations-anthropic-ai";
import { GenerateDocumentBody } from "@workspace/api-zod";

const router = Router();

const toneInstructions: Record<string, string> = {
  faang:
    "Write like a FAANG-level candidate. Use strong action verbs (architected, scaled, shipped, drove, reduced). Include metrics and impact wherever possible. Sound confident and results-oriented. This person has worked at top-tier tech companies.",
  startup:
    "Write with startup energy. Emphasise ownership, bias for action, wearing many hats, and moving fast. Sound like a builder who thrives in ambiguity. Less corporate, more human.",
  senior:
    "Write for a senior or staff-level engineer. Emphasise technical leadership, cross-functional impact, systems thinking, mentorship, and strategic vision beyond just coding.",
  pivot:
    "This person is pivoting into a new tech role. Reframe their existing experience as transferable. Draw parallels cleverly. Sound confident about the transition, not apologetic.",
};

const docLabels: Record<string, string> = {
  cover: "Cover Letter",
  resume: "Resume Summary",
  linkedin: "LinkedIn About",
};

const docInstructions: Record<string, string> = {
  cover: `Write a 3-paragraph ATS-optimised cover letter.
- Para 1: Strong hook that names the company and role, shows genuine interest
- Para 2: 2-3 concrete achievements with metrics, tied directly to job requirements
- Para 3: Forward-looking close, specific to the company, with a clear CTA
Format: Greeting, 3 paragraphs, professional sign-off. No "[Your Name]" placeholders — use the real name.`,
  resume: `Write a 4-5 sentence resume summary / professional profile.
- Start with a strong identity statement (who they are, years of experience, specialisation)
- 2-3 sentences of key achievements and impact with numbers
- End with what they bring to the next role
No bullet points. Flowing sentences. ATS-friendly with the right keywords from the job description.`,
  linkedin: `Write a LinkedIn About section in first person.
- Hook opening line that stops the scroll (not "I am a passionate engineer...")
- Paragraph about what they build and their technical identity
- Paragraph about key wins and impact
- Short closing line about what they're looking for now
Conversational, human, memorable. Not a resume dump.`,
};

function buildPrompt(body: typeof GenerateDocumentBody._type): string {
  const tone = toneInstructions[body.tone] ?? toneInstructions.faang;
  const docLabel = docLabels[body.docType] ?? "Cover Letter";
  const docInstruction = docInstructions[body.docType] ?? docInstructions.cover;

  return `You are an expert tech career coach and professional writer specialising in helping software engineers and tech professionals land jobs at top companies.

TONE DIRECTION: ${tone}

CANDIDATE INFO:
- Name: ${body.name}
- Current/Target Role: ${body.currentRole}
- Years of Experience: ${body.yearsExp}
- Tech Stack: ${body.techStack}
- Key Achievements: ${body.achievements}

TARGET JOB:
- Job Title: ${body.jobTitle}
- Company: ${body.company}
- Job Description: ${body.jobDesc}
- ATS Keywords to include: ${body.atsKeywords ?? "extract from job description above"}

DOCUMENT TO WRITE: ${docLabel}

INSTRUCTIONS:
${docInstruction}

CRITICAL RULES:
- Never use filler phrases like "I am passionate about" or "I am excited to"
- Never use the word "leverage" or "synergy"
- Every claim should feel earned, not generic
- Use the candidate's actual tech stack naturally
- Mirror the language of the job description for ATS matching
- Sound like a real person, not a template

Write ONLY the document. No commentary, no explanation, no preamble.`;
}

router.post("/generate", async (req, res) => {
  const parsed = GenerateDocumentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      messages: [{ role: "user", content: buildPrompt(parsed.data) }],
    });

    const text = message.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("");

    res.json({ text });
  } catch (err) {
    req.log.error({ err }, "Failed to generate document");
    res.status(500).json({ error: "Failed to generate document" });
  }
});

export default router;
