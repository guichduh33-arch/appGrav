import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();

const anthropic = new Anthropic({
  apiKey: process.env.VITE_ANTHROPIC_API_KEY,
});

const issues = [
  { id: '010', title: 'Loading States', description: 'Add loading indicators and skeletons' },
  { id: '011', title: 'Offline Capability', description: 'POS offline mode with sync' },
  { id: '012', title: 'Data Validation', description: 'Form and data validation' },
];

async function generateAllSolutions() {
  console.log('🔧 Génération de toutes les solutions HIGH priority...\n');

  const repairAgent = fs.readFileSync('.antigravity/agents/system-repair.md', 'utf-8');
  const auditReport = fs.readFileSync('artifacts/audit/audit-report-1768681527042.md', 'utf-8');

  for (const issue of issues) {
    console.log(`\n📝 ISSUE-${issue.id}: ${issue.title}...`);

    try {
      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8000,
        system: repairAgent,
        messages: [{
          role: 'user',
          content: `Implement ISSUE-${issue.id} (${issue.title}) from the audit report.

${auditReport}

Provide complete, production-ready code with all files needed.`
        }]
      });

      const response = message.content[0];
      if (response.type === 'text') {
        const outputPath = `artifacts/repairs/repair-issue-${issue.id}-${Date.now()}.md`;
        fs.writeFileSync(outputPath, response.text, 'utf-8');
        console.log(`✅ ${outputPath}`);
      }

      // Pause pour éviter rate limiting
      await new Promise(resolve => setTimeout(resolve, 3000));

    } catch (error) {
      console.error(`❌ Erreur ISSUE-${issue.id}:`, error);
    }
  }

  console.log('\n\n🎉 Toutes les solutions sont générées !');
  console.log('📁 Dossier: artifacts/repairs/\n');
}

generateAllSolutions();