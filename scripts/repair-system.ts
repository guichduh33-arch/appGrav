import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();

const anthropic = new Anthropic({
  apiKey: process.env.VITE_ANTHROPIC_API_KEY,
});

async function repairSystem() {
  console.log('🔧 Démarrage du System Repair Agent...\n');

  const repairAgent = fs.readFileSync('.antigravity/agents/system-repair.md', 'utf-8');
  const auditReport = fs.readFileSync('artifacts/audit/audit-report-1768681527042.md', 'utf-8');
  const task = fs.readFileSync('.antigravity/tasks/repair-critical-issues.md', 'utf-8');

  console.log('📋 Tâche: Réparer les issues critiques\n');

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      system: repairAgent,
      messages: [
        {
          role: 'user',
          content: `${task}

## Audit Report
${auditReport}

Implémente maintenant ISSUE-002 (RLS Policies) avec le code SQL complet et les instructions de déploiement.`,
        },
      ],
    });

    const response = message.content[0];
    if (response.type === 'text') {
      const outputPath = `artifacts/repairs/repair-issue-002-${Date.now()}.md`;
      fs.mkdirSync('artifacts/repairs', { recursive: true });
      fs.writeFileSync(outputPath, response.text, 'utf-8');

      console.log('✅ Réparation générée!\n');
      console.log(`📄 Fichier: ${outputPath}\n`);
      console.log('--- Aperçu ---\n');
      console.log(response.text.substring(0, 1500) + '...\n');
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

repairSystem();