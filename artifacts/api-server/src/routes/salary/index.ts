import { Router } from "express";
import { anthropic } from "@workspace/integrations-anthropic-ai";
import { SalaryNegotiationBody } from "@workspace/api-zod";

const router = Router();

router.post("/salary-negotiation", async (req, res) => {
  const parsed = SalaryNegotiationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { jobTitle, company, yearsExp, techStack, currentSalary, targetSalary, jobDesc, tone } = parsed.data;

  const toneContext: Record<string, string> = {
    faang: "This is a FAANG-level negotiation. Be assertive, data-driven, and reference market benchmarks confidently.",
    startup: "This is a startup negotiation. Consider equity, growth, and total comp. Balance assertiveness with flexibility.",
    senior: "This is a senior/staff-level negotiation. Emphasise scope, leadership impact, and strategic value. Be firm.",
    pivot: "This is a career-pivot negotiation. Acknowledge the transition but firmly anchor on transferable skills and market rates.",
  };

  const prompt = `You are an expert salary negotiation coach for software engineers.

ROLE: ${jobTitle} at ${company}
YEARS OF EXPERIENCE: ${yearsExp}
TECH STACK: ${techStack}
JOB DESCRIPTION CONTEXT: ${jobDesc}
CURRENT / EXPECTED SALARY: ${currentSalary ? `Current: ${currentSalary}` : "Not disclosed"}
TARGET SALARY: ${targetSalary}
TONE: ${toneContext[tone] ?? toneContext.faang}

Generate a comprehensive salary negotiation playbook with exactly this structure:

1. opening: The exact script to say when making the initial ask (2-3 sentences, confident and specific)
2. anchoring: How to anchor high and frame the number (2-3 sentences)
3. counteroffer: How to respond if they come in lower than target (2-3 sentences with a concrete counter script)
4. batna: A brief BATNA (Best Alternative To Negotiated Agreement) strategy — what to do if they won't budge (2-3 sentences)
5. equityAngle: How to factor in equity/RSUs/bonus if relevant (1-2 sentences)
6. closingLines: 2-3 confident closing lines to end the negotiation positively regardless of outcome
7. doNots: Array of 3 specific things NOT to say or do in this negotiation

Respond with ONLY valid JSON in exactly this format (no markdown, no explanation):
{
  "opening": "<script>",
  "anchoring": "<script>",
  "counteroffer": "<script>",
  "batna": "<script>",
  "equityAngle": "<script>",
  "closingLines": ["<line 1>", "<line 2>", "<line 3>"],
  "doNots": ["<do not 1>", "<do not 2>", "<do not 3>"]
}`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = message.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("");

    let result: {
      opening: string; anchoring: string; counteroffer: string;
      batna: string; equityAngle: string;
      closingLines: string[]; doNots: string[];
    };
    try {
      result = JSON.parse(raw.trim());
    } catch {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON in response");
      result = JSON.parse(jsonMatch[0]);
    }

    res.json({
      opening: String(result.opening ?? ""),
      anchoring: String(result.anchoring ?? ""),
      counteroffer: String(result.counteroffer ?? ""),
      batna: String(result.batna ?? ""),
      equityAngle: String(result.equityAngle ?? ""),
      closingLines: Array.isArray(result.closingLines) ? result.closingLines.slice(0, 3).map(String) : [],
      doNots: Array.isArray(result.doNots) ? result.doNots.slice(0, 3).map(String) : [],
    });
  } catch (err) {
    req.log.error({ err }, "Failed to generate salary negotiation script");
    res.status(500).json({ error: "Failed to generate salary negotiation script" });
  }
});

export default router;
