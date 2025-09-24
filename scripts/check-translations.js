#!/usr/bin/env node

/**
 * Translation Checker Script
 * Verifies that all hardcoded English text has been translated to Spanish
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(__dirname, '..', 'src');

// Patterns to detect hardcoded English text that should be translated
const englishPatterns = [
  // Text in JSX elements (between > and <)
  />([^<]*\b(Edit|Delete|Save|Cancel|Create|Add|Search|Reset|Loading|Empty|Back|Next|Previous|First|Last|Page|Show|entries|Remove|View|Actions|Filter|Clear|Submit|Update|New|All|Active|Inactive|Success|Error|Warning|Info|Yes|No|OK|Close|Open|Settings|Profile|Logout|Login|Register|Home|Dashboard|Users|Categories|Products|Reports|Help|About|Contact|Terms|Privacy|Support)\b[^<]*)</gi,
  
  // Text in string literals for user-facing content
  /['"`](Edit|Delete|Save|Cancel|Create|Add|Search|Reset|Loading|Empty|Back|Next|Previous|First|Last|Page|Show|entries|Remove|View|Actions|Filter|Clear|Submit|Update|New|All|Active|Inactive|Success|Error|Warning|Info|Yes|No|OK|Close|Open|Settings|Profile|Logout|Login|Register|Home|Dashboard|Users|Categories|Products|Reports|Help|About|Contact|Terms|Privacy|Support)[^'"`]*['"`]/gi,
  
  // Title and placeholder attributes
  /\b(title|placeholder|alt|label)\s*=\s*['"`]([^'"`]*\b(Edit|Delete|Save|Cancel|Create|Add|Search|Reset|Loading|Empty|Back|Next|Previous|First|Last|Page|Show|entries|Remove|View|Actions|Filter|Clear|Submit|Update|New|All|Active|Inactive|Success|Error|Warning|Info|Yes|No|OK|Close|Open|Settings|Profile|Logout|Login|Register|Home|Dashboard|Users|Categories|Products|Reports|Help|About|Contact|Terms|Privacy|Support)\b[^'"`]*)/gi
];

// Files to exclude from translation check
const excludePatterns = [
  /node_modules/,
  /\.git/,
  /dist/,
  /build/,
  /\.d\.ts$/,
  /\.test\./,
  /\.spec\./,
  /stories\./,
  /\.md$/,
  /package\.json$/,
  /tsconfig/,
  /vite\.config/,
  /tailwind\.config/
];

function shouldExcludeFile(filePath) {
  return excludePatterns.some(pattern => pattern.test(filePath));
}

function findEnglishText(content, filePath) {
  const issues = [];
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    englishPatterns.forEach(pattern => {
      const matches = line.match(pattern);
      if (matches) {
        matches.forEach(match => {
          // Skip if it's in a comment, console.log, or code context
          if (line.trim().startsWith('//') || 
              line.trim().startsWith('*') || 
              line.includes('console.') ||
              line.includes('import ') ||
              line.includes('export ') ||
              line.includes('className=') ||
              line.includes('data-') ||
              line.includes('aria-') ||
              line.includes('type=') ||
              line.includes('role=') ||
              line.includes('interface ') ||
              line.includes('const ') ||
              line.includes('let ') ||
              line.includes('var ') ||
              line.includes('function ') ||
              line.includes('path=') ||
              line.includes('to=') ||
              line.includes('href=') ||
              line.includes('key=') ||
              line.includes('name=') ||
              line.includes('id=') ||
              line.includes('value=')) {
            return;
          }

          issues.push({
            file: filePath,
            line: index + 1,
            text: match,
            context: line.trim()
          });
        });
      }
    });
  });

  return issues;
}

function checkTranslations() {
  console.log('🌐 Checking for untranslated English text...\n');
  console.log('=' .repeat(60));

  const allIssues = [];

  function scanDirectory(dirPath) {
    const items = fs.readdirSync(dirPath);

    items.forEach(item => {
      const itemPath = path.join(dirPath, item);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory()) {
        if (!shouldExcludeFile(itemPath)) {
          scanDirectory(itemPath);
        }
      } else if (stat.isFile() && (item.endsWith('.tsx') || item.endsWith('.ts')) && !shouldExcludeFile(itemPath)) {
        try {
          const content = fs.readFileSync(itemPath, 'utf8');
          const issues = findEnglishText(content, path.relative(srcDir, itemPath));
          allIssues.push(...issues);
        } catch (error) {
          console.error(`Error reading ${itemPath}:`, error.message);
        }
      }
    });
  }

  scanDirectory(srcDir);

  // Group issues by file
  const issuesByFile = {};
  allIssues.forEach(issue => {
    if (!issuesByFile[issue.file]) {
      issuesByFile[issue.file] = [];
    }
    issuesByFile[issue.file].push(issue);
  });

  // Report results
  const fileCount = Object.keys(issuesByFile).length;
  const totalIssues = allIssues.length;

  if (totalIssues === 0) {
    console.log('✅ ¡Excelente! No se encontraron textos en inglés sin traducir.');
    console.log('🎉 Todas las traducciones están completas.');
  } else {
    console.log(`⚠️  Se encontraron ${totalIssues} textos en inglés en ${fileCount} archivos:\n`);

    Object.entries(issuesByFile).forEach(([file, issues]) => {
      console.log(`📁 ${file}:`);
      issues.forEach(issue => {
        console.log(`   Línea ${issue.line}: "${issue.text}"`);
        console.log(`   Contexto: ${issue.context}`);
        console.log('');
      });
    });

    console.log('💡 Sugerencias de traducción:');
    const commonTranslations = {
      'Edit': 'Editar',
      'Delete': 'Eliminar', 
      'Save': 'Guardar',
      'Cancel': 'Cancelar',
      'Create': 'Crear',
      'Add': 'Agregar',
      'Search': 'Buscar',
      'Reset': 'Restablecer',
      'Loading': 'Cargando',
      'Empty': 'Vacío',
      'Name': 'Nombre',
      'Description': 'Descripción',
      'Status': 'Estado',
      'Color': 'Color',
      'Order': 'Orden',
      'Back': 'Atrás',
      'Next': 'Siguiente',
      'Previous': 'Anterior',
      'Active': 'Activo',
      'Inactive': 'Inactivo'
    };

    const foundWords = new Set(allIssues.map(issue => issue.text));
    foundWords.forEach(word => {
      if (commonTranslations[word]) {
        console.log(`   "${word}" → "${commonTranslations[word]}"`);
      }
    });
  }

  console.log('\n' + '='.repeat(60));
  console.log(`📊 Resumen: ${totalIssues} textos encontrados en ${fileCount} archivos`);
  
  return totalIssues;
}

const issueCount = checkTranslations();
process.exit(issueCount > 0 ? 1 : 0);
