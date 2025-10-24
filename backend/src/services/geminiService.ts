import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../config/env';

const genAI = new GoogleGenerativeAI(config.geminiApiKey);

export interface GeminiResponse {
  answer: string;
  followUpQuestions: string[];
}

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
1. Answer the question based on the provided context
2. **Always tailor the length and depth of your answer to match the question:**
   - For simple factual questions (who, what, when, where): Give a concise 1-3 sentence answer
   - For "why" or "how" questions: Provide a detailed explanation
   - For analytical or comparative questions: Give a comprehensive, structured response
3. **IMPORTANT - Format your answer in POINTS for easy reading:**
   - Break down information into clear bullet points (•)
   - Each point should be ONE clear idea or fact
   - Use **bold** for key terms and names
   - Use sub-bullets for related details
   - Keep each point short and focused (1-2 sentences max)
   - Avoid long paragraphs - prefer structured points
4. Avoid unnecessary repetition or excessive elaboration
5. If the context doesn't contain enough information, acknowledge it briefly
6. After your answer, suggest 3 relevant follow-up questions
7. Format your response as:

ANSWER:
[Your answer in clear bullet points with bold key terms]

FOLLOW-UP QUESTIONS:
1. [Question 1]
2. [Question 2]
3. [Question 3]`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

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

    const result = await model.generateContent([prompt, imagePart]);
    const response = result.response.text();

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
