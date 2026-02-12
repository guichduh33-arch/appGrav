/**
 * Script to migrate console.* calls to logger utility
 * Run: node migrate-logger.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve, relative } from 'path';
import { globSync } from 'fs';

// Use simple recursive file listing
import { readdirSync, statSync } from 'fs';

function getAllFiles(dir, ext, results = []) {
    const entries = readdirSync(dir);
    for (const entry of entries) {
        const full = resolve(dir, entry);
        const stat = statSync(full);
        if (stat.isDirectory()) {
            if (entry === 'node_modules' || entry === '__tests__') continue;
            getAllFiles(full, ext, results);
        } else if (ext.some(e => full.endsWith(e)) && !full.includes('.test.') && !full.includes('logger.ts')) {
            results.push(full);
        }
    }
    return results;
}

const srcDir = resolve('src');
const allFiles = getAllFiles(srcDir, ['.ts', '.tsx']);

// Filter to files that have console.* calls
const filesWithConsole = allFiles.filter(f => {
    const content = readFileSync(f, 'utf8');
    return /console\.(log|error|warn|debug)\(/.test(content);
});

console.log(`Found ${filesWithConsole.length} files with console.* calls`);

let totalChanges = 0;
let filesChanged = 0;

for (const filePath of filesWithConsole) {
    let content = readFileSync(filePath, 'utf8');
    const original = content;
    const relPath = relative(resolve('.'), filePath).replace(/\\/g, '/');

    // Determine which logger functions are needed
    const needsLogError = /console\.error\(/.test(content);
    const needsLogWarn = /console\.warn\(/.test(content);
    const needsLogInfo = /console\.log\(/.test(content);
    const needsLogDebug = /console\.debug\(/.test(content);

    // Build import functions list
    const imports = [];
    if (needsLogError) imports.push('logError');
    if (needsLogInfo) imports.push('logInfo');
    if (needsLogDebug) imports.push('logDebug');
    if (needsLogWarn) imports.push('logWarn');

    if (imports.length === 0) continue;

    // Check if import already exists
    const hasLoggerImport = /import\s+\{[^}]*\}\s+from\s+['"]@\/utils\/logger['"]/.test(content) ||
                            /import\s+\{[^}]*\}\s+from\s+['"]\.\.\/.*utils\/logger['"]/.test(content);

    if (!hasLoggerImport) {
        // Add import after the last import statement
        const importLine = `import { ${imports.join(', ')} } from '@/utils/logger'`;

        // Find the last import line
        const lines = content.split('\n');
        let lastImportIdx = -1;
        for (let i = 0; i < lines.length; i++) {
            if (/^import\s/.test(lines[i]) || (/^\s*import\s/.test(lines[i]) && !lines[i].includes('/*'))) {
                lastImportIdx = i;
                // Handle multi-line imports
                if (!lines[i].includes(' from ')) {
                    // Multi-line import - find the closing line
                    while (i < lines.length - 1 && !lines[i].includes(' from ')) {
                        i++;
                        lastImportIdx = i;
                    }
                }
            }
        }

        if (lastImportIdx >= 0) {
            lines.splice(lastImportIdx + 1, 0, importLine);
            content = lines.join('\n');
        }
    } else {
        // Update existing import to include needed functions
        content = content.replace(
            /import\s+\{([^}]*)\}\s+from\s+['"](@\/utils\/logger|[^'"]*utils\/logger)['"]/,
            (match, existingImports, path) => {
                const existing = existingImports.split(',').map(s => s.trim()).filter(Boolean);
                const allImports = new Set([...existing, ...imports]);
                return `import { ${[...allImports].join(', ')} } from '${path}'`;
            }
        );
    }

    // Now replace console.* calls
    // We'll do this line by line to handle context properly

    const lines = content.split('\n');
    let changes = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Skip commented lines
        if (line.trim().startsWith('//') || line.trim().startsWith('*')) continue;

        // console.error replacements
        if (/console\.error\(/.test(line)) {
            // Handle: console.error('msg', err) -> logError('msg', err) [max 2 args]
            // Handle: console.error('msg') -> logError('msg')
            // Handle: console.error('msg', val1, val2) -> logError(`msg ${val1}`, val2)
            lines[i] = line.replace(
                /console\.error\(/g,
                'logError('
            );
            changes++;
        }

        // console.warn replacements
        if (/console\.warn\(/.test(line)) {
            lines[i] = lines[i].replace(
                /console\.warn\(/g,
                'logWarn('
            );
            changes++;
        }

        // console.debug replacements
        if (/console\.debug\(/.test(line)) {
            lines[i] = lines[i].replace(
                /console\.debug\(/g,
                'logDebug('
            );
            changes++;
        }

        // console.log replacements - context dependent
        if (/console\.log\(/.test(lines[i])) {
            // Check if we're inside a catch block or error handling context
            const isCatchContext = isInCatchBlock(lines, i);

            if (isCatchContext) {
                lines[i] = lines[i].replace(
                    /console\.log\(/g,
                    'logError('
                );
            } else {
                // Check if it's debug-style logging (has emoji, [Module], debugging prefix, etc.)
                const isDebugStyle = /console\.log\(\s*['"`].*(\[|📦|❌|🔄|DEBUG|debug)/i.test(lines[i]);
                if (isDebugStyle) {
                    lines[i] = lines[i].replace(
                        /console\.log\(/g,
                        'logDebug('
                    );
                } else {
                    lines[i] = lines[i].replace(
                        /console\.log\(/g,
                        'logInfo('
                    );
                }
            }
            changes++;
        }
    }

    content = lines.join('\n');

    if (content !== original) {
        writeFileSync(filePath, content);
        filesChanged++;
        totalChanges += changes;
        console.log(`  ${relPath}: ${changes} changes`);
    }
}

console.log(`\nDone! ${filesChanged} files changed, ${totalChanges} total replacements`);

function isInCatchBlock(lines, lineIdx) {
    // Look backwards up to 5 lines for 'catch' keyword
    for (let i = lineIdx; i >= Math.max(0, lineIdx - 5); i--) {
        const trimmed = lines[i].trim();
        if (/}\s*catch\s*\(/.test(trimmed) || /catch\s*\(/.test(trimmed)) {
            return true;
        }
        // Stop looking if we hit a function boundary
        if (/^\s*(async\s+)?function\s/.test(trimmed) || /=>\s*\{/.test(trimmed)) {
            break;
        }
    }
    return false;
}
