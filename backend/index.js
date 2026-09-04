import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Helper: Secure Key Retrieval via GCP Secret Manager with local fallback
async function getGeminiApiKey() {
  const secretName = process.env.GCP_SECRET_NAME; // format: projects/<PROJECT_ID>/secrets/<SECRET_NAME>/versions/latest
  if (secretName) {
    try {
      const client = new SecretManagerServiceClient();
      const [version] = await client.accessSecretVersion({ name: secretName });
      console.log("--> API Key fetched via Google Cloud Secret Manager");
      return version.payload.data.toString('utf8');
    } catch (err) {
      console.warn("--> GCP Secret Manager fallback triggered:", err.message);
    }
  }
  return process.env.GEMINI_API_KEY;
}

// Global AI instance initialized securely on startup
let ai;
(async () => {
  const apiKey = await getGeminiApiKey();
  ai = new GoogleGenAI({ apiKey });
})();

app.post('/api/analyze', async (req, res) => {
  const { text, mode, pastEntries } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  // Ensure AI client is ready before processing
  if (!ai) {
    const apiKey = await getGeminiApiKey();
    ai = new GoogleGenAI({ apiKey });
  }

  console.log("--> Backend Mode:", mode);
  console.log("--> Backend PastEntries:", pastEntries);

  const m = (mode || '').toLowerCase();
  let prompt = `Analyze this journal entry: "${text}"`;

  if (m === 'roast') {
    prompt = `Roast this journal entry wittily and playfully in 2-3 sentences: "${text}"`;
  } else if (m === 'boost') {
    prompt = `Give pure hype, relentless energy, and uplifting motivation in 2-3 sentences for: "${text}"`;
  } else if (m === 'mood') {
    prompt = `Detect primary emotions, overall mood label, and sentiment trends in 2-3 sentences for: "${text}"`;
  } else if (m === 'tagging' || m.includes('tag')) {
    prompt = `You are an automated metadata extractor for a personal journal.
Analyze this journal entry: "${text}"

Provide the output strictly in this clean format:
🏷️ Context Tags:
#tag1 #tag2 #tag3

📋 Action Items / Tasks:
- [ ] Task 1 (if any detected, else write "No immediate pending tasks")
- [ ] Task 2`;
  } else if (m.includes('past')) {
    prompt = `You are a memory retrieval assistant for this journal.
Here are the user's past journal entries from the database:
---
${pastEntries && pastEntries.trim().length > 0 ? pastEntries : "No previous entries found in the database."}
---
User's question: "${text}"
Instructions:
- Directly answer the user's question using their past entries above.
- Mention specific things they previously wrote (e.g. tea, rest, tiredness).
- Do NOT perform psychological analysis. Just recall and answer like a helpful memory assistant.`;
  }

  const candidateModels = [
    'gemini-flash-latest',
    'gemini-2.5-flash-lite',
    'gemini-3.5-flash',
    'gemini-pro-latest',
    'gemini-3.6-flash'
  ];

  for (const modelName of candidateModels) {
    try {
      console.log(`Calling model: ${modelName}`);
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
      });

      if (response && response.text) {
        console.log(`Success with: ${modelName}`);
        return res.json({ result: response.text });
      }
    } catch (err) {
      console.warn(`Model ${modelName} failed:`, err?.status || err?.message || 'fetch failed');
      await new Promise(r => setTimeout(r, 800));
    }
  }

  return res.status(200).json({
    result: "Sorry, models are busy right now. Please try again in a moment!"
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server active on http://localhost:${PORT}`));