#!/usr/bin/env node

/**
 * Script para limpiar archivos temporales y preparar el proyecto para despliegue
 * Uso: npm run cleanup
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 Iniciando limpieza del proyecto...\n');

// Archivos y carpetas a eliminar
const filesToRemove = [
  'check-malformed-urls.js',
  'check-products.js',
  'fix-products.js',
  'server-diagnostico.js',
  'server-stable.js',
  'test-routes.js',
  'seed-database.js',
  'seed-products.js',
  'npm-debug.log',
  'yarn-debug.log',
  'yarn-error.log'
];

const directoriesToClean = [
  'logs',
  'temp',
  '.nyc_output',
  'coverage'
];

function removeFile(filePath) {
  const fullPath = path.join(__dirname, filePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
    console.log(`✅ Eliminado: ${filePath}`);
    return true;
  }
  return false;
}

function removeDirectory(dirPath) {
  const fullPath = path.join(__dirname, dirPath);
  if (fs.existsSync(fullPath)) {
    fs.rmSync(fullPath, { recursive: true, force: true });
    console.log(`✅ Eliminado directorio: ${dirPath}`);
    return true;
  }
  return false;
}

function cleanNodeModules() {
  console.log('🧹 Limpiando node_modules...');
  try {
    // Eliminar carpetas problemáticas dentro de node_modules
    const nodeModulesPath = path.join(__dirname, 'node_modules');
    if (fs.existsSync(nodeModulesPath)) {
      const problematicDirs = ['.cache', '.bin'];
      problematicDirs.forEach(dir => {
        const dirPath = path.join(nodeModulesPath, dir);
        if (fs.existsSync(dirPath)) {
          fs.rmSync(dirPath, { recursive: true, force: true });
          console.log(`✅ Limpiado: node_modules/${dir}`);
        }
      });
    }
  } catch (error) {
    console.log('⚠️  No se pudo limpiar completamente node_modules:', error.message);
  }
}

console.log('📁 Eliminando archivos temporales...');
let removedCount = 0;

// Eliminar archivos específicos
filesToRemove.forEach(file => {
  if (removeFile(file)) {
    removedCount++;
  }
});

// Limpiar directorios
directoriesToClean.forEach(dir => {
  if (removeDirectory(dir)) {
    removedCount++;
  }
});

// Limpiar node_modules
cleanNodeModules();

console.log(`\n✨ Limpieza completada!`);
console.log(`📊 Total de elementos eliminados/limpiados: ${removedCount}`);

if (removedCount > 0) {
  console.log('\n📋 Archivos eliminados:');
  filesToRemove.forEach(file => {
    console.log(`   • ${file}`);
  });
  console.log('\n🎯 El proyecto está listo para despliegue!');
} else {
  console.log('\n📋 No se encontraron archivos temporales para eliminar.');
}

console.log('\n💡 Consejos para producción:');
console.log('   • Ejecuta "npm run build" si tienes un proceso de construcción');
console.log('   • Asegúrate de que las variables de entorno estén configuradas');
console.log('   • Considera usar PM2 o Docker para producción');
