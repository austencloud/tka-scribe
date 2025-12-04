/**
 * Analysis Prompt Templates
 *
 * Prompt engineering for clarity-first feedback analysis.
 * These prompts enforce no-assumption behavior and structured output.
 * Uses comprehensive TKA knowledge base for deep domain understanding.
 */

import type { FeedbackItem } from "../../domain/models/feedback-models";
import type { ClarifyingQuestion, AnalysisResult } from "../../domain/models/analysis-models";
import { buildKnowledgeBase, buildCompactKnowledgeBase } from "./tka-knowledge-base";

/**
 * System prompt that establishes clarity-first behavior with full knowledge base
 */
export const CLARITY_FIRST_SYSTEM_PROMPT = `You are an expert feedback analyst for TKA Studio (The Kinetic Alphabet Studio). Your job is to understand user feedback WITHOUT making assumptions, using your deep knowledge of the application.

## Your Core Rules

1. **NO ASSUMPTIONS**: Only state facts explicitly mentioned in the feedback. If something is unclear, ASK - don't guess.

2. **USE YOUR KNOWLEDGE**: Apply the TKA domain knowledge below to interpret vague user language. For example:
   - "the blue one is stuck" → Likely refers to the BLUE motion (left hand) not animating
   - "the grid is wrong" → Could be DIAMOND vs BOX mode issue, or positioning bug
   - "can't get it to spin" → User may be confused about PRO/ANTI motion types

3. **IDENTIFY AMBIGUITY**: When you detect ambiguity that knowledge can't resolve, generate a clarifying question with suggested answers based on likely possibilities.

4. **CONFIDENCE LEVELS**:
   - "high" = User's intent is crystal clear OR you can confidently interpret using domain knowledge
   - "medium" = You understand the general issue but need 1-2 clarifications
   - "low" = Significant ambiguity exists, multiple interpretations possible

5. **STRUCTURED OUTPUT**: Always respond with valid JSON matching the expected schema.

${buildKnowledgeBase()}

## Question Categories

When generating clarifying questions, categorize them:
- "context": Where/when does this happen? Which module/tab/screen?
- "reproduction": Steps to reproduce the issue
- "expected_behavior": What should happen instead?
- "priority": How urgent/impactful is this?
- "scope": Does this affect specific areas or the whole app?
- "clarification": What did the user mean by a specific term?`;

/**
 * Compact system prompt for smaller models with limited context windows
 * Uses essential domain knowledge only
 */
export const COMPACT_SYSTEM_PROMPT = `You are a feedback analyst for TKA Studio, a dance notation app.

## Rules
1. Only state facts from the feedback - don't assume
2. If unclear, ask clarifying questions with suggested answers
3. Confidence: high (clear), medium (general understanding), low (ambiguous)
4. Output valid JSON only

${buildCompactKnowledgeBase()}

## Question Categories
- context, reproduction, expected_behavior, priority, scope, clarification`;

/**
 * Get the appropriate system prompt based on model capabilities
 */
export function getSystemPrompt(useCompact = false): string {
  return useCompact ? COMPACT_SYSTEM_PROMPT : CLARITY_FIRST_SYSTEM_PROMPT;
}

/**
 * Build the analysis prompt for a feedback item
 */
export function buildAnalysisPrompt(
  feedback: FeedbackItem,
  previousQuestions?: ClarifyingQuestion[]
): string {
  let prompt = `## Feedback to Analyze

**Type**: ${feedback.type}
**Title**: ${feedback.title}

**Description**:
${feedback.description}

**Context**:
- Captured Location: ${feedback.capturedModule}${feedback.capturedTab ? ` > ${feedback.capturedTab}` : ""}
${feedback.reportedModule ? `- User Reported Location: ${feedback.reportedModule}${feedback.reportedTab ? ` > ${feedback.reportedTab}` : ""}` : ""}
${feedback.priority ? `- User Priority: ${feedback.priority}` : "- User Priority: Not specified"}

**Submitted By**: ${feedback.userDisplayName} (${feedback.userEmail})
**Submitted**: ${feedback.createdAt.toISOString()}
`;

  // Include previous Q&A if refinement round
  if (previousQuestions && previousQuestions.length > 0) {
    const answered = previousQuestions.filter((q) => q.answer);
    if (answered.length > 0) {
      prompt += `\n## Previous Clarifications\n\n`;
      for (const q of answered) {
        prompt += `**Q**: ${q.question}\n`;
        prompt += `**A**: ${q.answer} (answered by ${q.answeredBy})\n\n`;
      }
      prompt += `Use these answers to refine your analysis.\n`;
    }
  }

  prompt += `\n## Your Task

Analyze this feedback and respond with JSON in this exact format:

\`\`\`json
{
  "confirmedFacts": [
    "Fact 1 explicitly stated in the feedback",
    "Fact 2 explicitly stated in the feedback"
  ],
  "interpretation": {
    "summary": "One paragraph summary of what the user is reporting",
    "suggestedType": "bug | feature | general",
    "suggestedPriority": "low | medium | high | critical",
    "suggestedModule": "dashboard | create | discover | learn | compose | train | feedback | settings | null",
    "suggestedTab": "specific tab name or null",
    "confidence": "high | medium | low",
    "confidenceReason": "Why you rated confidence this way"
  },
  "technicalNotes": "Any technical observations (optional)",
  "affectedAreas": ["List of features/components that might be affected"],
  "suggestedActions": ["Actionable next step 1", "Actionable next step 2"],
  "clarifyingQuestions": [
    {
      "question": "The question to ask",
      "category": "context | reproduction | expected_behavior | priority | scope",
      "isRequired": true,
      "suggestedAnswers": ["Possible answer 1", "Possible answer 2", "Possible answer 3"]
    }
  ]
}
\`\`\`

**Important**:
- Only include clarifyingQuestions if you genuinely need more information
- If confidence is "high", you typically don't need questions
- Each suggestedAnswers array should have 2-4 options
- Be specific in your questions - don't ask vague things`;

  return prompt;
}

/**
 * Build the Claude Code investigation prompt
 */
export function buildClaudeCodePrompt(
  feedback: FeedbackItem,
  analysis: AnalysisResult
): string {
  return `## Investigation Request: Feedback Analysis

### Original Feedback
**Title**: ${feedback.title}
**Type**: ${feedback.type}
**From**: ${feedback.capturedModule}${feedback.capturedTab ? ` > ${feedback.capturedTab}` : ""}

**Description**:
> ${feedback.description.split("\n").join("\n> ")}

### AI Analysis Summary
- **Category**: ${analysis.suggestedType || "unclear"} (${analysis.confidence} confidence)
- **Summary**: ${analysis.summary}
${analysis.technicalNotes ? `- **Technical Notes**: ${analysis.technicalNotes}` : ""}

### Confirmed Facts
${analysis.confirmedFacts.map((f) => `- ${f}`).join("\n")}

### Affected Areas
${(analysis.affectedAreas || []).map((a) => `- ${a}`).join("\n") || "- Not determined"}

### Investigation Goals
${analysis.suggestedActions.map((a, i) => `${i + 1}. ${a}`).join("\n")}

### Suggested Files to Examine
Based on the affected areas, consider looking at:
${generateSuggestedFiles(feedback, analysis)}

### What to Look For
1. Identify the root cause of the reported issue
2. Check for related code that might have the same problem
3. Consider edge cases that might not be covered
4. Look at recent changes that could have introduced this

---
*Generated by TKA Studio AI Analysis*`;
}

/**
 * Generate suggested files based on module/tab context and keywords
 */
function generateSuggestedFiles(
  feedback: FeedbackItem,
  analysis: AnalysisResult
): string {
  const module = analysis.suggestedModule || feedback.capturedModule;
  const tab = analysis.suggestedTab || feedback.capturedTab;
  const desc = feedback.description.toLowerCase();
  const title = feedback.title.toLowerCase();
  const text = `${desc} ${title}`;

  const suggestions: string[] = [];

  // Module-specific suggestions
  switch (module?.toLowerCase()) {
    case "create":
      suggestions.push("- `src/lib/features/create/` - Create module");
      if (tab === "constructor" || tab === "construct") {
        suggestions.push("- `src/lib/features/create/construct/` - Construct tab (option picker)");
      }
      if (tab === "assembler" || tab === "assemble") {
        suggestions.push("- `src/lib/features/create/assemble/` - Assemble tab (hand paths)");
      }
      if (tab === "generator" || tab === "generate") {
        suggestions.push("- `src/lib/features/create/generate/` - Generate tab (AI generation)");
      }
      break;

    case "discover":
      suggestions.push("- `src/lib/features/discover/` - Discover module");
      suggestions.push("- `src/lib/features/discover/gallery/` - Gallery grid and cards");
      suggestions.push("- `src/lib/features/discover/gallery/filtering/` - Filter panel");
      break;

    case "learn":
      suggestions.push("- `src/lib/features/learn/` - Learn module");
      if (text.includes("quiz") || text.includes("play")) {
        suggestions.push("- `src/lib/features/learn/components/quiz/` - Quiz components");
      }
      if (text.includes("codex") || text.includes("letter")) {
        suggestions.push("- `src/lib/features/learn/components/codex/` - Codex browser");
      }
      break;

    case "compose":
    case "animate":
      suggestions.push("- `src/lib/features/animate/` - Compose/Animate module");
      suggestions.push("- `src/lib/features/animate/compose/` - Composition grid");
      if (text.includes("trail") || text.includes("effect")) {
        suggestions.push("- `src/lib/features/animate/components/trail/` - Trail effects");
      }
      if (text.includes("play") || text.includes("control")) {
        suggestions.push("- `src/lib/features/animate/components/controls/` - Playback controls");
      }
      break;

    case "train":
      suggestions.push("- `src/lib/features/train/` - Train module");
      if (text.includes("practice")) {
        suggestions.push("- `src/lib/features/train/components/practice/` - Practice mode");
      }
      if (text.includes("challenge")) {
        suggestions.push("- `src/lib/features/train/components/challenges/` - Challenges");
      }
      break;

    case "feedback":
      suggestions.push("- `src/lib/features/feedback/` - Feedback module");
      break;

    case "settings":
      suggestions.push("- `src/lib/shared/settings/` - Settings components");
      suggestions.push("- `src/lib/features/settings/` - Settings module");
      break;

    case "dashboard":
      suggestions.push("- `src/lib/features/dashboard/` - Dashboard");
      break;

    case "library":
      suggestions.push("- `src/lib/features/library/` - Library module");
      break;

    case "admin":
      suggestions.push("- `src/lib/features/admin/` - Admin module");
      break;
  }

  // Keyword-based suggestions for domain concepts
  if (text.includes("pictograph") || text.includes("letter") || text.includes("glyph")) {
    suggestions.push("- `src/lib/shared/pictograph/` - Pictograph rendering system");
  }

  if (text.includes("arrow") || text.includes("motion")) {
    suggestions.push("- `src/lib/shared/pictograph/arrow/` - Arrow components");
    suggestions.push("- `src/lib/shared/pictograph/shared/domain/` - Motion models");
  }

  if (text.includes("prop") || text.includes("staff") || text.includes("fan") || text.includes("hoop")) {
    suggestions.push("- `src/lib/shared/pictograph/prop/` - Prop rendering");
  }

  if (text.includes("grid") || text.includes("position") || text.includes("diamond") || text.includes("box")) {
    suggestions.push("- `src/lib/shared/pictograph/grid/` - Grid system");
  }

  if (text.includes("canvas") || text.includes("animation") || text.includes("animate")) {
    suggestions.push("- `src/lib/shared/animation-engine/` - Animation engine");
  }

  if (text.includes("sequence") || text.includes("beat")) {
    suggestions.push("- `src/lib/shared/foundation/domain/models/` - Sequence/Beat models");
  }

  // UI-related keywords
  if (text.includes("button") || text.includes("click") || text.includes("tap")) {
    suggestions.push("- `src/lib/shared/foundation/ui/` - UI components");
  }

  if (text.includes("drawer") || text.includes("sheet") || text.includes("modal") || text.includes("popup")) {
    suggestions.push("- `src/lib/shared/foundation/ui/drawer/` - Drawer/sheet components");
  }

  if (text.includes("navigation") || text.includes("tab") || text.includes("menu") || text.includes("sidebar")) {
    suggestions.push("- `src/lib/shared/navigation/` - Navigation system");
  }

  if (text.includes("card") || text.includes("thumbnail")) {
    suggestions.push("- Check card components in the relevant module");
  }

  // Performance-related
  if (text.includes("slow") || text.includes("lag") || text.includes("performance") || text.includes("freeze")) {
    suggestions.push("- Check for heavy computations in state files (*-state.svelte.ts)");
    suggestions.push("- Look for inefficient $derived() or $effect() usage");
  }

  // Remove duplicates and return
  const unique = [...new Set(suggestions)];
  return unique.join("\n") || "- Explore based on the affected areas listed above";
}

/**
 * Extract JSON from AI response (handles markdown code blocks)
 */
export function extractJsonFromResponse(response: string): string {
  // Try to find JSON in code block
  const codeBlockMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch && codeBlockMatch[1]) {
    return codeBlockMatch[1].trim();
  }

  // Try to find raw JSON object
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return jsonMatch[0];
  }

  // Return as-is if no patterns match
  return response;
}

/**
 * Validate and parse the analysis response
 */
export function parseAnalysisResponse(jsonStr: string): {
  success: boolean;
  result?: Partial<AnalysisResult>;
  questions?: ClarifyingQuestion[];
  error?: string;
} {
  try {
    const parsed = JSON.parse(jsonStr);

    // Build result
    const result: Partial<AnalysisResult> = {
      summary: parsed.interpretation?.summary || "",
      confirmedFacts: parsed.confirmedFacts || [],
      suggestedType: parsed.interpretation?.suggestedType,
      suggestedPriority: parsed.interpretation?.suggestedPriority,
      suggestedModule: parsed.interpretation?.suggestedModule,
      suggestedTab: parsed.interpretation?.suggestedTab,
      confidence: parsed.interpretation?.confidence || "low",
      confidenceReason: parsed.interpretation?.confidenceReason,
      technicalNotes: parsed.technicalNotes,
      affectedAreas: parsed.affectedAreas || [],
      suggestedActions: parsed.suggestedActions || [],
    };

    // Build questions with IDs
    const questions: ClarifyingQuestion[] = (parsed.clarifyingQuestions || []).map(
      (q: Partial<ClarifyingQuestion>, i: number) => ({
        id: `q-${Date.now()}-${i}`,
        question: q.question || "",
        category: q.category,
        isRequired: q.isRequired ?? true,
        suggestedAnswers: q.suggestedAnswers || [],
      })
    );

    return { success: true, result, questions };
  } catch (err) {
    return {
      success: false,
      error: `Failed to parse AI response: ${err instanceof Error ? err.message : "Unknown error"}`,
    };
  }
}
