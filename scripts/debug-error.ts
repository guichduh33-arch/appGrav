import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();

const anthropic = new Anthropic({
  apiKey: process.env.VITE_ANTHROPIC_API_KEY,
});

async function debugError(errorMessage: string, filePath?: string) {
  console.log('🔍 Analyzing error...\n');

  const debugAgent = fs.readFileSync('.antigravity/agents/code-debugger.md', 'utf-8');

  // Lire le fichier concerné si fourni
  let fileContent = '';
  if (filePath && fs.existsSync(filePath)) {
    fileContent = fs.readFileSync(filePath, 'utf-8');
  }

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      system: debugAgent,
      messages: [{
        role: 'user',
        content: `Error: ${errorMessage}

${filePath ? `File: ${filePath}\n\nFile Content:\n\`\`\`\n${fileContent}\n\`\`\`` : ''}

Analyze this error and provide a complete fix.`
      }]
    });

    const response = message.content[0];
    if (response.type === 'text') {
      console.log(response.text);
      
      // Sauvegarder la solution
      const fixPath = `artifacts/fixes/fix-${Date.now()}.md`;
      fs.mkdirSync('artifacts/fixes', { recursive: true });
      fs.writeFileSync(fixPath, response.text, 'utf-8');
      console.log(`\n📄 Solution saved: ${fixPath}`);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Récupérer les arguments
const errorMsg = process.argv[2] || 'categories is not defined';
const filePath = process.argv[3];

debugError(errorMsg, filePath);