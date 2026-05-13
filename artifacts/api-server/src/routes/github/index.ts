import { Router } from "express";
import { anthropic } from "@workspace/integrations-anthropic-ai";
import { OptimizeGithubProfileBody } from "@workspace/api-zod";

const router = Router();

router.post("/github-profile", async (req, res) => {
  const parsed = OptimizeGithubProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { githubUsername, jobTitle, company, techStack, achievements, tone } = parsed.data;

  const toneContext: Record<string, string> = {
    faang: "Targeting a FAANG-level role. Profile should emphasise scale, impact, and engineering excellence.",
    startup: "Targeting a startup role. Profile should feel scrappy, entrepreneurial, and hands-on.",
    senior: "Targeting a senior/staff role. Profile should convey technical depth, leadership, and architectural thinking.",
    pivot: "Making a career pivot. Profile should highlight transferable skills and breadth of experience.",
  };

  const prompt = `You are an expert GitHub profile coach for software engineers actively job hunting.

TARGET ROLE: ${jobTitle} at ${company}
TECH STACK: ${techStack}
KEY ACHIEVEMENTS: ${achievements}
GITHUB USERNAME: ${githubUsername}
TONE: ${toneContext[tone] ?? toneContext.faang}

Generate a complete GitHub profile optimization package. Produce:

1. profileBio: A punchy 1-line GitHub bio (max 160 chars) — witty, keyword-rich, memorable
2. readmeHero: A 3-4 sentence README hero section (first thing visitors see) — warm, human, and specific to their stack. Use plain text, no markdown headers.
3. pinnedRepoSuggestions: 3 suggestions for pinned repos (they may or may not have these) — each with a repo type, example name, and a compelling description (max 120 chars each) that would impress a hiring manager
4. profileTips: 4 specific, actionable tips for this person's profile — things like contribution graph, README sections, topics to add, etc.
5. topicsToAdd: 6-8 GitHub topic tags they should add to their repos to maximise discoverability

Respond with ONLY valid JSON in exactly this format (no markdown, no explanation):
{
  "profileBio": "<160 char bio>",
  "readmeHero": "<3-4 sentence hero text>",
  "pinnedRepoSuggestions": [
    { "type": "<repo type e.g. 'Open Source Tool'>", "name": "<example-repo-name>", "description": "<max 120 char description>" }
  ],
  "profileTips": ["<tip 1>", "<tip 2>", "<tip 3>", "<tip 4>"],
  "topicsToAdd": ["<topic1>", "<topic2>", "<topic3>", "<topic4>", "<topic5>", "<topic6>"]
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
      profileBio: string;
      readmeHero: string;
      pinnedRepoSuggestions: Array<{ type: string; name: string; description: string }>;
      profileTips: string[];
      topicsToAdd: string[];
    };
    try {
      result = JSON.parse(raw.trim());
    } catch {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON in response");
      result = JSON.parse(jsonMatch[0]);
    }

    res.json({
      profileBio: String(result.profileBio ?? ""),
      readmeHero: String(result.readmeHero ?? ""),
      pinnedRepoSuggestions: Array.isArray(result.pinnedRepoSuggestions)
        ? result.pinnedRepoSuggestions.slice(0, 3).map((r) => ({
            type: String(r.type ?? ""),
            name: String(r.name ?? ""),
            description: String(r.description ?? ""),
          }))
        : [],
      profileTips: Array.isArray(result.profileTips) ? result.profileTips.slice(0, 4).map(String) : [],
      topicsToAdd: Array.isArray(result.topicsToAdd) ? result.topicsToAdd.slice(0, 8).map(String) : [],
    });
  } catch (err) {
    req.log.error({ err }, "Failed to generate GitHub profile optimization");
    res.status(500).json({ error: "Failed to generate GitHub profile optimization" });
  }
});

export default router;
