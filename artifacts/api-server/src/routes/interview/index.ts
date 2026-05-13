import { Router } from "express";
import { anthropic } from "@workspace/integrations-anthropic-ai";
import { PrepareInterviewBody } from "@workspace/api-zod";

const router = Router();

router.post("/interview-prep", async (req, res) => {
  const parsed = PrepareInterviewBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { jobTitle, company, jobDesc, techStack, tone, achievements } = parsed.data;

  const toneContext: Record<string, string> = {
    faang: "The candidate is targeting a FAANG-level role. Questions should reflect rigorous system design, leadership principles, and metric-driven impact.",
    startup: "The candidate is targeting a startup role. Questions should reflect ownership, rapid iteration, and cross-functional collaboration.",
    senior: "The candidate is targeting a senior/staff-level role. Questions should focus on technical leadership, architectural decisions, and cross-team influence.",
    pivot: "The candidate is making a career pivot. Questions should include how they frame transferable skills and address the transition confidently.",
  };

  const prompt = `You are an expert technical interview coach helping engineers prepare for job interviews.

ROLE: ${jobTitle} at ${company}
JOB DESCRIPTION: ${jobDesc}
CANDIDATE TECH STACK: ${techStack}
KEY ACHIEVEMENTS: ${achievements}
TONE CONTEXT: ${toneContext[tone] ?? toneContext.faang}

Generate exactly 6 likely interview questions for this specific role and company. Include a mix of:
- 2 technical/system design questions relevant to the job description
- 2 behavioural/situational questions (STAR format friendly)
- 1 role-specific question about the candidate's background
- 1 "why this company/role" question

For each question, provide 2-3 concise talking points the candidate should hit in their answer. Talking points should reference the candidate's actual tech stack and achievements where relevant.

Respond with ONLY valid JSON in exactly this format (no markdown, no explanation):
{
  "questions": [
    {
      "question": "<the interview question>",
      "category": "<Technical | Behavioural | Background | Motivation>",
      "talkingPoints": ["<point 1>", "<point 2>", "<point 3>"]
    }
  ]
}`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = message.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("");

    let parsed_result: { questions: Array<{ question: string; category: string; talkingPoints: string[] }> };
    try {
      parsed_result = JSON.parse(raw.trim());
    } catch {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON in response");
      parsed_result = JSON.parse(jsonMatch[0]);
    }

    res.json({
      questions: (parsed_result.questions ?? []).slice(0, 6).map((q) => ({
        question: String(q.question ?? ""),
        category: String(q.category ?? "General"),
        talkingPoints: Array.isArray(q.talkingPoints) ? q.talkingPoints.slice(0, 3).map(String) : [],
      })),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to generate interview prep");
    res.status(500).json({ error: "Failed to generate interview questions" });
  }
});

export default router;
