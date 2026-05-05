#!/usr/bin/env node
/**
 * Agente QA schema · valida que el código de la PWA no referencie columnas/tablas
 * que no existan en el schema real de Supabase. Corre pre-deploy y antes de cualquier
 * push a main.
 *
 * Uso:
 *   node scripts/qa-schema.mjs
 *
 * Requiere:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY (para introspección, NUNCA usar en cliente)
 *
 * Reemplaza al humano "tech lead" en el job de detectar drift entre código y schema.
 */

import { createClient } from '@supabase/supabase-js';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('❌ Falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const sb = createClient(url, serviceKey);

console.log('🔍 QA schema agent · scan de queries Supabase en src/');

// 1. Recolectar todas las llamadas .from('tabla') del código.
async function* walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.next') continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else if (/\.(ts|tsx|mjs)$/.test(entry.name)) yield path;
  }
}

const tablasUsadas = new Map();
const columnasUsadas = new Map(); // tabla → Set<columnas>

for await (const file of walk('src')) {
  const content = await readFile(file, 'utf-8');

  // .from('tabla')
  const fromRe = /\.from\(['"]([a-z_]+)['"]\)/g;
  let m;
  while ((m = fromRe.exec(content))) {
    const tabla = m[1];
    if (!tablasUsadas.has(tabla)) tablasUsadas.set(tabla, new Set());
    tablasUsadas.get(tabla).add(file);
  }

  // .select('cols, ...') tras un .from('tabla')
  const selectRe = /\.from\(['"]([a-z_]+)['"]\)[\s\S]{0,400}?\.select\(['"`]([^'"`]+)['"`]\)/g;
  while ((m = selectRe.exec(content))) {
    const tabla = m[1];
    const cols = m[2]
      .split(',')
      .map((c) => c.trim().split(/[\s:(]/)[0])
      .filter(Boolean);
    if (!columnasUsadas.has(tabla)) columnasUsadas.set(tabla, new Set());
    cols.forEach((c) => columnasUsadas.get(tabla).add(c));
  }
}

console.log(`✓ Encontré ${tablasUsadas.size} tablas referenciadas en src/.`);

// 2. Para cada tabla, traer columnas reales desde information_schema.
const errores = [];
const warnings = [];

for (const [tabla, archivos] of tablasUsadas) {
  const { data: existeRow, error: existeErr } = await sb
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .eq('table_name', tabla)
    .maybeSingle();

  // information_schema.tables suele requerir RPC, fallback con query nativa.
  if (existeErr || !existeRow) {
    // Intentar SELECT 0 rows para ver si existe.
    const probe = await sb.from(tabla).select('*').limit(0);
    if (probe.error && (probe.error.code === 'PGRST205' || /does not exist/.test(probe.error.message))) {
      errores.push({
        tipo: 'tabla_inexistente',
        tabla,
        archivos: [...archivos].slice(0, 3),
      });
      continue;
    }
  }

  // Si conocemos columnas usadas, validar cada una.
  const colsUsadas = columnasUsadas.get(tabla);
  if (!colsUsadas || colsUsadas.size === 0) continue;

  // Probar SELECT de cada columna.
  for (const col of colsUsadas) {
    if (col === '*' || /^[A-Z]/.test(col)) continue; // skip wildcards y refs raras
    const probe = await sb.from(tabla).select(col).limit(0);
    if (probe.error) {
      const msg = probe.error.message ?? '';
      if (/column .* does not exist/i.test(msg) || probe.error.code === 'PGRST204') {
        errores.push({
          tipo: 'columna_inexistente',
          tabla,
          columna: col,
          mensaje: msg,
        });
      }
    }
  }
}

// 3. Reporte
if (errores.length === 0 && warnings.length === 0) {
  console.log('✅ Schema OK. No hay drift entre código y DB.');
  process.exit(0);
}

console.log('');
if (errores.length > 0) {
  console.log(`❌ ${errores.length} errores de schema:`);
  for (const e of errores) {
    if (e.tipo === 'tabla_inexistente') {
      console.log(`  · Tabla "${e.tabla}" referenciada pero no existe en DB.`);
      console.log(`    Archivos: ${e.archivos.join(', ')}`);
    } else if (e.tipo === 'columna_inexistente') {
      console.log(`  · Columna "${e.tabla}.${e.columna}" no existe en DB.`);
    }
  }
}

if (warnings.length > 0) {
  console.log(`⚠️  ${warnings.length} warnings:`);
  warnings.forEach((w) => console.log(`  · ${JSON.stringify(w)}`));
}

process.exit(errores.length > 0 ? 1 : 0);
