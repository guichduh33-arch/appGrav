
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STITCH_PAGE_DIR = 'C:/Users/guich/Lastapp/appGrav/Stitch_page';
const SCREENS_JSON_PATH = process.env.SCREENS_JSON_PATH || 'C:/Users/guich/.gemini/antigravity/brain/dbb55bc2-f914-4442-a425-142fea51f3dd/.system_generated/steps/1054/output.txt';

// Helper to slugify titles for directory names
function slugify(text) {
    return text
        .toString()
        .replace('The Breakery ', '') // Remove prefix
        .replace(/[&]/g, 'and')
        .replace(/[^a-zA-Z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
}

function generateTsx(title, html) {
    // Simple TSX wrapper as seen in existing files
    return `import React from 'react';

const ${slugify(title)}: React.FC = () => {
  return (
    <div dangerouslySetInnerHTML={{ __html: \`
      <!-- STITCH_HTML_START -->
      ${html.replace(/`/g, '\\\\`').replace(/\$/g, '\\\\$')}
      <!-- STITCH_HTML_END -->
    \` }} />
  );
};

export default ${slugify(title)};
`;
}

async function importScreens() {
    if (!fs.existsSync(SCREENS_JSON_PATH)) {
        console.error(`Screens JSON not found at ${SCREENS_JSON_PATH}`);
        return;
    }

    const data = JSON.parse(fs.readFileSync(SCREENS_JSON_PATH, 'utf8'));
    const screens = data.screens;

    console.log(`Found ${screens.length} screens in JSON.`);

    for (const screen of screens) {
        const screenId = screen.name.split('/').pop();
        const title = screen.title;

        // Skip metadata-only entries or briefs
        if (title.endsWith('.md') || !screen.htmlCode || !screen.htmlCode.downloadUrl) {
            console.log(`Skipping metadata/brief: ${title}`);
            continue;
        }

        const nameSlug = slugify(title);
        // Use ID to prevent collisions for screens with same title but different versions
        const folderName = `${nameSlug}_${screenId.substring(0, 8)}`;
        const targetDir = path.join(STITCH_PAGE_DIR, folderName);

        console.log(`Processing: ${title} (${screenId}) -> ${folderName}`);

        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        // Download HTML
        const htmlPath = path.join(targetDir, 'index.html');
        try {
            console.log(`Downloading HTML for ${title}...`);
            execSync(`curl -L "${screen.htmlCode.downloadUrl}" -o "${htmlPath}"`, { stdio: 'inherit' });

            if (!fs.existsSync(htmlPath) || fs.statSync(htmlPath).size === 0) {
                throw new Error('Downloaded HTML is empty or missing');
            }

            const htmlContent = fs.readFileSync(htmlPath, 'utf8');

            // Generate TSX
            const tsxPath = path.join(targetDir, `${nameSlug}.tsx`);
            fs.writeFileSync(tsxPath, generateTsx(title, htmlContent));

            // Download Screenshot if available
            if (screen.screenshot && screen.screenshot.downloadUrl) {
                const screenshotPath = path.join(targetDir, 'screenshot.png');
                console.log(`Downloading screenshot for ${title}...`);
                execSync(`curl -L "${screen.screenshot.downloadUrl}" -o "${screenshotPath}"`, { stdio: 'inherit' });
            }

        } catch (err) {
            console.error(`Failed to process ${title}:`, err.message);
        }
    }
    console.log('Batch import completed.');
}

importScreens();
