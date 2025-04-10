import express from 'express';
import OpenAI from 'openai';

const router = express.Router();
const openAIClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Use server-side environment variable
});

// Helper function to clean JSON string
function sanitizeJsonString(jsonString: string): string {
  // Remove any comments
  jsonString = jsonString.replace(/\/\/.*$/gm, '');
  
  // Handle common escape character issues
  jsonString = jsonString.replace(/\\([^"\\\/bfnrtu])/g, '\\\\$1');
  
  // Handle multiple consecutive backslashes (common in LaTeX/math expressions)
  jsonString = jsonString.replace(/\\{2,}/g, '\\\\');
  
  // Remove any markdown code block markers
  jsonString = jsonString.replace(/```json|```/g, '');
  
  // Try to extract JSON if it's wrapped in other text
  const jsonMatch = jsonString.match(/(\{[\s\S]*\})/);
  if (jsonMatch && jsonMatch[0]) {
    return jsonMatch[0];
  }
  
  return jsonString;
}

// Add advanced sanitization function for deeply problematic JSON
function deepSanitizeJson(jsonString: string): string {
  try {
    // First attempt basic sanitization
    let sanitized = sanitizeJsonString(jsonString);
    
    // Try to parse, if it works, return it
    JSON.parse(sanitized);
    return sanitized;
  } catch (error) {
    console.log('Basic sanitization failed, attempting deep sanitization');
    
    // If basic sanitization fails, try a more aggressive approach
    // Find all the card titles and sanitize them specifically
    const titleRegex = /"title": ?"([^"]+)"/g;
    let match;
    let sanitized = jsonString;
    
    while ((match = titleRegex.exec(jsonString)) !== null) {
      const originalTitle = match[1];
      // Create a deeply sanitized version of the title
      let sanitizedTitle = originalTitle
        .replace(/\\\\/g, '\\') // Replace double backslashes
        .replace(/\\(?!["\\/bfnrt])/g, '') // Remove invalid escape sequences
        .replace(/[\x00-\x1F\x7F-\x9F]/g, ''); // Remove control characters
      
      // Replace the original title with the sanitized one
      sanitized = sanitized.replace(
        `"title": "${originalTitle}"`, 
        `"title": "${sanitizedTitle}"`
      );
    }
    
    // Final pass to handle any remaining issues
    sanitized = sanitized
      .replace(/\\+([^"\\\/bfnrtu])/g, '$1') // Remove invalid escapes
      .replace(/,\s*}/g, '}') // Fix trailing commas
      .replace(/,\s*]/g, ']'); // Fix trailing commas in arrays
      
    return sanitized;
  }
}

// Helper function to process OpenAI requests
async function processOpenAIRequest(input: string, res: express.Response) {
  try {
    const response = await openAIClient.responses.create({
      model: "gpt-4o",
      input,
    });

    // Store raw response for debugging
    const rawResponse = response.output_text;

    // Attempt to parse the response as JSON
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(rawResponse);
    } catch (parseError) {
      console.error('~~openai.ts~~ Error parsing response as JSON:', parseError);
      
      // Try to sanitize and parse again
      try {
        const sanitizedJson = sanitizeJsonString(rawResponse);
        parsedResponse = JSON.parse(sanitizedJson);
      } catch (sanitizeError) {
        console.error('First sanitization failed:', sanitizeError);
        
        // Try deep sanitization as a last resort
        try {
          const deepSanitizedJson = deepSanitizeJson(rawResponse);
          parsedResponse = JSON.parse(deepSanitizedJson);
          console.log('Successfully parsed deeply sanitized JSON');
        } catch (deepSanitizeError) {
          console.error('Failed to parse even after deep sanitizing:', deepSanitizeError);
          return res.status(500).json({
            error: 'Failed to parse OpenAI response. Response was not valid JSON.',
            rawResponse: rawResponse,
          });
        }
      }
    }

    res.json(parsedResponse);
  } catch (error) {
    console.error('Error in OpenAI request:', error);
    res.status(500).json({ error: 'Failed to process OpenAI request' });
  }
}

// Route to handle duplicate detection
router.post('/check-duplicates', async (req, res) => {
  const { newCard, existingCards } = req.body;

  const input = `You are a duplicate detection assistant. Your task is to check if a new card might be a duplicate of any existing cards.

New card: "${newCard.title}" (ID: ${newCard.id})

Existing cards: 
${existingCards.map((card: any) => `- "${card.title}" (ID: ${card.id})`).join('\n')}

Respond ONLY with a valid JSON object without any explanatory text. The JSON should have this exact structure:
{"duplicates": [{"id": "card_id_here", "title": "card_title_here", "reason": "detailed reason for duplication"}]}

If there are no duplicates, return: {"duplicates": []}`;

  await processOpenAIRequest(input, res);
});

// Route to handle clustering
router.post('/generate-clusters', async (req, res) => {
  const { cards, existingClusters = [], batchInfo = {} } = req.body;

  // Construct a more sophisticated prompt that includes existing clusters
  let existingClustersText = '';
  if (existingClusters && existingClusters.length > 0) {
    existingClustersText = `
Existing clusters from previous batches:
${existingClusters.map((name: string) => `- "${name}"`).join('\n')}

IMPORTANT: When appropriate, use these existing cluster names to categorize new cards. This ensures consistency across batches. Only create a new cluster when a card doesn't fit well into any existing cluster.`;
  }
  
  // Include batch information in the prompt if available
  let batchInfoText = '';
  if (batchInfo && batchInfo.current && batchInfo.total) {
    batchInfoText = `\nThis is batch ${batchInfo.current} of ${batchInfo.total} total batches.`;
  }

  const input = `You are a clustering assistant. Your task is to organize cards into logical groups.${batchInfoText}

You will be given a list of software issues. Each issue includes a title and description.

Your task is to group these issues into clusters based on how they could most efficiently be solved or addressed.
	•	Use your judgment to identify which issues likely require similar types of engineering work, design changes, or process adjustments.
	•	Base clusters on factors like the type of fix, responsible team, layer of the stack, or shared root cause.
	•	Do not group by issue category or tag (e.g., “UI”, “Performance”, “Keyboard”) unless it directly maps to a shared resolution approach.
	•	The goal is to organize the issues in a way that would let a team solve the most problems with the least number of unique interventions.

Each name should be short but descriptive, reflecting the kind of work involved (e.g., “Update design tokens”, “Refactor dropdown component”, “Improve focus handling”, “Add missing metadata”).

Cards to cluster:
${cards.map((card: any) => `- "${card.title}" (ID: ${card.id})`).join('\n')}

${existingClustersText}

Respond ONLY with a valid JSON object without any explanatory text. The JSON should have this exact structure:
{"clusters": [{"clusterName": "descriptive_name", "cards": [{"id": "card_id", "title": "card_title"}]}]}

If clustering is not possible, return: {"clusters": []}`;

  await processOpenAIRequest(input, res);
});

export default router;
