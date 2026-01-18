import 'dotenv/config';
import { askClaude, chatWithClaude } from '../src/services/anthropicService.ts';

async function testClaude() {
    console.log('Testing Claude connection...');
    try {
        console.log('\n--- Testing askClaude ---');
        const response1 = await askClaude('Dis "Bonjour ! La connexion simple fonctionne."');
        console.log('Claude says:', response1);

        console.log('\n--- Testing chatWithClaude ---');
        const messages = [
            { role: 'user' as const, content: 'Bonjour Claude, comment vas-tu ?' },
            { role: 'assistant' as const, content: 'Bonjour ! Je vais très bien, merci. Comment puis-je vous aider aujourd\'hui ?' },
            { role: 'user' as const, content: 'Peux-tu me confirmer que notre connexion multi-tours fonctionne ?' }
        ];
        const response2 = await chatWithClaude(messages);
        console.log('Claude says:', response2);

        console.log('\nTest completed successfully!');
    } catch (error: any) {
        console.error('Test failed with error:');
        console.dir(error, { depth: null });
        process.exit(1);
    }
}

testClaude();
