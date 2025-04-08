import express from 'express';
import OpenAI from 'openai';

const router = express.Router();
const openAIClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Use server-side environment variable
});

// Helper function to process OpenAI requests
async function processOpenAIRequest(input: string, res: express.Response) {
  try {
    const response = await openAIClient.responses.create({
      model: "gpt-4o",
      input,
    });

    // Attempt to parse the response as JSON
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(response.output_text);
    } catch (parseError) {
      console.error('~~openai.ts~~ Error parsing response as JSON:', parseError);
      return res.status(500).json({
        error: 'Failed to parse OpenAI response. Response was not valid JSON.',
        rawResponse: response.output_text,
      });
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

  const input = `You are a duplicate detection assistant. Check card "${newCard.title}" (ID: ${newCard.id}) against: ${existingCards.map((card: any) => `"${card.title}" (ID: ${card.id})`).join(', ')} and return the full list in JSON format without wrapping it in code blocks. The JSON should look like this: {"duplicates": [{"id": "Duplicate Card ID", "title": "Duplicate Card Title", "reason": "Reason for duplication"}]}.`;

  await processOpenAIRequest(input, res);
});

// Route to handle clustering
router.post('/generate-clusters', async (req, res) => {
  const { cards } = req.body;

  const input = `You are a clustering assistant. Cluster these cards: ${cards.map((card: any) => `"${card.title}" (ID: ${card.id})`).join(', ')} and return the clusters in JSON format without wrapping it in code blocks. The JSON should look like this: {"clusters": [{"clusterName": "Cluster 1", "cards": [{"id": "Card ID 1", "title": "Card Title 1"}]}]}.`;

  await processOpenAIRequest(input, res);
});

export default router;
