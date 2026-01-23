import Anthropic from '@anthropic-ai/sdk';

const apiKey = typeof process !== 'undefined' && process.env ? process.env.VITE_ANTHROPIC_API_KEY : import.meta.env.VITE_ANTHROPIC_API_KEY;

const anthropic = new Anthropic({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true, // Required if using this in a client-side Vite app
});

export const claudeService = {
    /**
     * Sends a message to Claude and returns the response.
     * @param content The user message to send.
     * @param system Optional system prompt.
     * @returns The text response from Claude.
     */
    async sendMessage(content: string, system?: string) {
        try {
            const response = await anthropic.messages.create({
                model: 'claude-3-haiku-20240307',
                max_tokens: 1024,
                system: system,
                messages: [{ role: 'user', content }],
            });

            if (response.content[0].type === 'text') {
                return response.content[0].text;
            }
            return 'Response format not recognized.';
        } catch (error) {
            console.error('Error calling Claude API:', error);
            throw error;
        }
    },
};
