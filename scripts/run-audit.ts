import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

const anthropic = new Anthropic({
  apiKey: process.env.VITE_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY,
});

async function runAudit() {
  console.log('🔍 Lancement de l\'audit système...\n');

  // Vérifier que la clé API est présente
  if (!process.env.VITE_ANTHROPIC_API_KEY && !process.env.ANTHROPIC_API_KEY) {
    console.error('❌ Erreur: Clé API Anthropic non trouvée!');
    console.error('Ajoutez VITE_ANTHROPIC_API_KEY dans votre fichier .env');
    process.exit(1);
  }

  // Lire l'agent prompt
  const agentPrompt = fs.readFileSync(
    '.antigravity/agents/system-auditor.md',
    'utf-8'
  );

  // Lire la tâche d'audit
  const auditTask = fs.readFileSync(
    '.antigravity/tasks/initial-audit.md',
    'utf-8'
  );

  // Scanner la structure du projet
  const projectStructure = scanProject('.');

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      system: agentPrompt,
      messages: [
        {
          role: 'user',
          content: `${auditTask}

## Structure du Projet
\`\`\`
${projectStructure}
\`\`\`

Commence l'audit maintenant. Analyse chaque partie de l'application et fournis un rapport détaillé.`,
        },
      ],
    });

    const response = message.content[0];
    if (response.type === 'text') {
      const reportPath = `artifacts/audit/audit-report-${Date.now()}.md`;
      
      // Créer le dossier si nécessaire
      fs.mkdirSync(path.dirname(reportPath), { recursive: true });
      
      // Sauvegarder le rapport
      fs.writeFileSync(reportPath, response.text, 'utf-8');
      
      console.log('✅ Audit terminé!\n');
      console.log(`📄 Rapport sauvegardé: ${reportPath}\n`);
      console.log('--- Aperçu du rapport ---\n');
      console.log(response.text.substring(0, 1000) + '...\n');
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'audit:', error);
  }
}

function scanProject(dir: string, prefix = ''): string {
  const items = fs.readdirSync(dir);
  let structure = '';

  // Dossiers/fichiers à ignorer
  const ignore = ['node_modules', '.git', 'dist', 'build', '.cache', 'artifacts'];

  for (const item of items) {
    if (ignore.includes(item)) continue;

    const fullPath = path.join(dir, item);
    
    try {
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        structure += `${prefix}📁 ${item}/\n`;
        // Ne pas descendre trop profondément
        if (prefix.length < 10) {
          structure += scanProject(fullPath, prefix + '  ');
        }
      } else {
        structure += `${prefix}📄 ${item}\n`;
      }
    } catch (error) {
      // Ignorer les fichiers inaccessibles
    }
  }

  return structure;
}

runAudit();