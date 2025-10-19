import { queryGemini } from "./gemini";

/**
 * Generates prerequisite subtopics for a given topic using Gemini
 * @param topic - The topic to find prerequisites for
 * @param existingTopics - Array of existing topics to avoid duplicates
 * @returns Promise<string[]> - Array of prerequisite subtopics
 */
export async function getPrerequisites(
  topic: string,
  existingTopics: string[] = []
): Promise<string[]> {
  const existingTopicsList = existingTopics.length > 0 
    ? `\n\nExisting topics to avoid (including synonyms and similar concepts): ${existingTopics.join(", ")}` 
    : "";

  const prompt = `Find the prerequisite subtopics needed to understand this topic:

Topic: ${topic}${existingTopicsList}

Generate 0-5 prerequisite subtopics that are essential for understanding the given topic. Do not include any topics that are too much simpler than the given topic.

IMPORTANT RULES:
1. Do NOT include any topics that are synonyms or very similar to existing topics
2. Only include topics that are directly necessary prerequisites
3. You may return 0 prerequisites if none are needed
4. Keep topic names concise and specific
5. Focus on mathematical concepts, not problem-solving steps
6. AVOID broad categories like "basic functions", "fundamental concepts", "general rules"
7. Instead, specify the exact mathematical techniques, formulas, or specific concepts needed
8. Name the specific integration/differentiation rules, not the general category
9. STOP generating prerequisites when you reach fundamental concepts (like basic arithmetic, basic algebra, etc.)
10. Do NOT create circular dependencies or overly deep chains

Respond with ONLY valid JSON in this exact format (no markdown, no code blocks, no extra text):
{
  "prerequisites": ["prereq1", "prereq2", "prereq3"]
}

If no prerequisites are needed, use an empty array for prerequisites.`;

  try {
    const response = await queryGemini(prompt, {
      responseMimeType: "application/json",
      temperature: 0.3
    });
    
    // Clean the response to remove any markdown formatting
    let cleanResponse = response.trim();
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    console.log(cleanResponse);
    
    const parsed = JSON.parse(cleanResponse);
    return parsed.prerequisites || [];
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error generating prerequisites:", errorMessage);
    return [];
  }
}