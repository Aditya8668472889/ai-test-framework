import * as dotenv from 'dotenv';
dotenv.config();

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Ask Claude for a working replacement when a selector breaks.
// Takes the dead selector + the live page HTML, returns ONLY the new selector string.
export async function suggestSelector(
  brokenSelector: string,
  pageContent: string
): Promise<string> {
  const prompt = `You are a Playwright selector expert.
   The following selector no longer works: ${brokenSelector}
   Here is the current page HTML: ${pageContent}
   Suggest the single best replacement selector.
   Return ONLY the selector string, nothing else.`;

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 256,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const response = message.content[0].type === 'text'
    ? message.content[0].text
    : '';

  // Strip any stray whitespace, markdown fences, or backticks Claude may add.
  return response
    .replace(/```[a-z]*/gi, '')
    .replace(/```/g, '')
    .replace(/`/g, '')
    .trim();
}
