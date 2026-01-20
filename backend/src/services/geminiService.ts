import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../config/env';

const genAI = new GoogleGenerativeAI(config.geminiApiKey);

export interface GeminiResponse {
  answer: string;
  followUpQuestions: string[];
}

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 2000; // Start with 2 second delay

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const isRetryableError = (error: any): boolean => {
  // Retry on 503 (overloaded), 429 (rate limit), and network errors
  const status = error.status;
  return status === 503 || status === 429 || !status;
};

const callGeminiWithRetry = async (
  model: any,
  prompt: string,
  retries = MAX_RETRIES
): Promise<string> => {
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error: any) {
    if (isRetryableError(error) && retries > 0) {
      const delay = INITIAL_RETRY_DELAY_MS * (MAX_RETRIES - retries + 1); // Exponential backoff
      console.log(`⚠️  API error (${error.status}). Retrying in ${delay}ms... (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`);
      await sleep(delay);
      return callGeminiWithRetry(model, prompt, retries - 1);
    }
    throw error;
  }
};

export const askGemini = async (
  query: string,
  context: string[],
  conversationHistory: { role: string; content: string }[] = []
): Promise<GeminiResponse> => {
  try {
    const model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' });

    // Build the prompt with context and conversation history
    const contextText = context.join('\n\n---\n\n');
    
    let prompt = '';
    
    if (conversationHistory.length > 0) {
      const historyText = conversationHistory
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n\n');
      prompt += `Previous conversation:\n${historyText}\n\n`;
    }
    
    prompt += `Context from documents:\n${contextText}\n\n`;
    prompt += `Question: ${query}\n\n`;
    prompt += `Instructions:
You are a helpful study assistant. Answer naturally like a knowledgeable friend explaining concepts.

**CRITICAL - SELECTIVE USE OF CONTEXT:**
- ONLY use context that is DIRECTLY relevant to the question
- DO NOT dump all available context - be selective and focused
- If the context doesn't relate to the question, use your general knowledge instead
- NEVER include unrelated information from documents just because it's available

**ADAPT YOUR RESPONSE TO THE QUESTION TYPE:**

• **Simple "what is" or "define" questions**: 
  - Give ONLY a concise 2-4 sentence explanation
  - NO bullet points needed
  - Just explain it naturally and directly
  - Example: "What is DBMS?" → "A DBMS is software that stores, manages, and accesses data efficiently. It's like the brain of a database that helps you add, update, delete, and retrieve information. Common examples include MySQL and MongoDB."

• **"Explain" or "How does X work" questions**: 
  - Provide brief intro + 3-5 key bullet points only
  - Keep it focused

• **"Compare" or "List" questions**: 
  - Use structured bullet points
  - Keep each point concise

• **"Why" questions**: 
  - Give reasoned explanation (2-5 sentences)

• **"Summarize" questions**: 
  - Provide 4-6 key points ONLY of what was asked to summarize
  - Do NOT include extra unrelated information

**GENERAL RULES:**
- Answer EXACTLY what was asked - no more, no less
- Be conversational, not robotic
- Use **bold** only for important terms (rarely)
- Keep answers digestible and focused
- If context is insufficient, acknowledge briefly

After your answer, suggest 2-3 follow-up questions.

Format:
ANSWER:
[Your answer - sized appropriately to the question type]

FOLLOW-UP QUESTIONS:
1. [Question 1]
2. [Question 2]
3. [Question 3]`;

    const response = await callGeminiWithRetry(model, prompt);

    // Parse the response
    const answerMatch = response.match(/ANSWER:\s*([\s\S]*?)(?=FOLLOW-UP QUESTIONS:|$)/i);
    const followUpMatch = response.match(/FOLLOW-UP QUESTIONS:\s*([\s\S]*?)$/i);

    const answer = answerMatch ? answerMatch[1].trim() : response;
    const followUpQuestions: string[] = [];

    if (followUpMatch) {
      const questionsText = followUpMatch[1].trim();
      const questions = questionsText.split('\n').filter(q => q.trim());
      questions.forEach(q => {
        const cleaned = q.replace(/^\d+\.\s*/, '').trim();
        if (cleaned) followUpQuestions.push(cleaned);
      });
    }

    return {
      answer,
      followUpQuestions: followUpQuestions.slice(0, 3),
    };
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw new Error('Failed to get response from Gemini');
  }
};

export const askGeminiWithImage = async (
  query: string,
  imageData: Buffer,
  mimeType: string,
  context: string[] = []
): Promise<GeminiResponse> => {
  try {
    const model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' });

    const contextText = context.length > 0 
      ? `\n\nContext from your documents:\n${context.join('\n\n---\n\n')}`
      : '';

    const prompt = `${query}${contextText}\n\nPlease analyze the image and provide a detailed answer. Also suggest 3 follow-up questions.

Format your response as:

ANSWER:
[Your detailed answer here]

FOLLOW-UP QUESTIONS:
1. [Question 1]
2. [Question 2]
3. [Question 3]`;

    const imagePart = {
      inlineData: {
        data: imageData.toString('base64'),
        mimeType,
      },
    };

    const response = await callGeminiWithRetry(model, [prompt, imagePart] as any);

    // Parse response
    const answerMatch = response.match(/ANSWER:\s*([\s\S]*?)(?=FOLLOW-UP QUESTIONS:|$)/i);
    const followUpMatch = response.match(/FOLLOW-UP QUESTIONS:\s*([\s\S]*?)$/i);

    const answer = answerMatch ? answerMatch[1].trim() : response;
    const followUpQuestions: string[] = [];

    if (followUpMatch) {
      const questionsText = followUpMatch[1].trim();
      const questions = questionsText.split('\n').filter(q => q.trim());
      questions.forEach(q => {
        const cleaned = q.replace(/^\d+\.\s*/, '').trim();
        if (cleaned) followUpQuestions.push(cleaned);
      });
    }

    return {
      answer,
      followUpQuestions: followUpQuestions.slice(0, 3),
    };
  } catch (error) {
    console.error('Error calling Gemini with image:', error);
    throw new Error('Failed to process image with Gemini');
  }
};
