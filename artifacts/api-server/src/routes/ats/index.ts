import { Router } from "express";
import { anthropic } from "@workspace/integrations-anthropic-ai";
import { ScoreDocumentBody } from "@workspace/api-zod";

const router = Router();

router.post("/ats-score", async (req, res) => {
  const parsed = ScoreDocumentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { document, jobDesc, atsKeywords } = parsed.data;

  const prompt = `You are an ATS (Applicant Tracking System) expert. Analyse the following career document against the job description and return a JSON analysis.

JOB DESCRIPTION:
${jobDesc}

${atsKeywords ? `ADDITIONAL KEYWORDS TO CHECK:\n${atsKeywords}\n` : ""}

CANDIDATE DOCUMENT:
${document}

Analyse the document and respond with ONLY valid JSON in exactly this format (no markdown, no explanation):
{
  "score": <integer 0-100 representing overall ATS keyword match percentage>,
  "matched": [<array of keywords/phrases from the job description that appear in the document, max 10>],
  "missing": [<array of important keywords/phrases from the job description that are ABSENT from the document, max 8>],
  "suggestions": [<array of 3 specific, actionable improvement suggestions as strings>]
}

Rules:
- score should reflect how well the document mirrors the language and requirements of the job description
- matched should list actual terms that appear in both
- missing should list high-value terms the document lacks
- suggestions should be specific and reference actual missing keywords or weak phrasing`;

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

    let parsed_result: { score: number; matched: string[]; missing: string[]; suggestions: string[] };
    try {
      parsed_result = JSON.parse(raw.trim());
    } catch {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON in response");
      parsed_result = JSON.parse(jsonMatch[0]);
    }

    res.json({
      score: Math.min(100, Math.max(0, Number(parsed_result.score) || 0)),
      matched: Array.isArray(parsed_result.matched) ? parsed_result.matched.slice(0, 10) : [],
      missing: Array.isArray(parsed_result.missing) ? parsed_result.missing.slice(0, 8) : [],
      suggestions: Array.isArray(parsed_result.suggestions) ? parsed_result.suggestions.slice(0, 3) : [],
    });
  } catch (err) {
    req.log.error({ err }, "Failed to score document");
    res.status(500).json({ error: "Failed to analyse document" });
  }
});

export default router;
