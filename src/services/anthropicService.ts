import Anthropic from '@anthropic-ai/sdk';

const apiKey = typeof process !== 'undefined' && process.env ? process.env.VITE_ANTHROPIC_API_KEY : (import.meta as any).env.VITE_ANTHROPIC_API_KEY;

const anthropic = new Anthropic({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true,
});

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Envoie un message à Claude et retourne la réponse
 */
export async function askClaude(
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      return content.text;
    }
    throw new Error('Réponse inattendue de Claude');
  } catch (error) {
    console.error('Erreur API Anthropic:', error);
    throw error;
  }
}

/**
 * Conversation multi-tours avec Claude
 */
export async function chatWithClaude(
  messages: ClaudeMessage[],
  systemPrompt?: string
): Promise<string> {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 2000,
      system: systemPrompt,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return content.text;
    }
    throw new Error('Réponse inattendue de Claude');
  } catch (error) {
    console.error('Erreur API Anthropic:', error);
    throw error;
  }
}