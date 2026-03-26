#!/usr/bin/env node
/**
 * generate-manifest.js
 * img/ 폴더를 스캔해서 img/manifest.json 을 자동 생성합니다.
 *
 * 사용법:
 *   node generate-manifest.js
 *
 * 폴더 구조:
 *   img/
 *     IA/   → 카테고리 "IA"
 *     HA/   → 카테고리 "HA"
 *     ...
 *
 * 실행 후 img/manifest.json 이 생성/갱신됩니다.
 * GitHub에 push하기 전에 실행하면 됩니다.
 */

const fs   = require('fs');
const path = require('path');

// ── 설정 ──────────────────────────────────────
const IMG_DIR = path.join(__dirname, 'img');

// 폴더 ID → 표시 이름 매핑 (원하는 이름으로 수정하세요)
const CATEGORY_LABELS = {
  IA: 'IA',
  HA: 'HA',
  CL: 'CL',
  PC: 'PC',
  OR: 'OR',
  LO: 'LO',
  WM: 'WM',
};

// 지원 이미지 확장자
const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg']);

// 카테고리 표시 순서 (CATEGORY_LABELS 키 순서대로, 없으면 알파벳순)
const CATEGORY_ORDER = ['IA', 'HA', 'CL', 'PC', 'OR', 'LO', 'WM'];
// ──────────────────────────────────────────────

if (!fs.existsSync(IMG_DIR)) {
  console.error(`❌ img/ 폴더가 없습니다: ${IMG_DIR}`);
  process.exit(1);
}

const categories = [];

// 폴더 목록 수집 (CATEGORY_ORDER 우선, 나머지 알파벳순 추가)
const allDirs = fs.readdirSync(IMG_DIR).filter(name => {
  const full = path.join(IMG_DIR, name);
  return fs.statSync(full).isDirectory();
});

const orderedDirs = [
  ...CATEGORY_ORDER.filter(d => allDirs.includes(d)),
  ...allDirs.filter(d => !CATEGORY_ORDER.includes(d)).sort(),
];

for (const dirName of orderedDirs) {
  const dirPath = path.join(IMG_DIR, dirName);
  const files   = fs.readdirSync(dirPath)
    .filter(f => IMAGE_EXTS.has(path.extname(f).toLowerCase()))
    .sort();

  if (files.length === 0) {
    console.warn(`⚠️  ${dirName}/ 에 이미지가 없습니다. 스킵.`);
    continue;
  }

  const stickers = files.map(f => `img/${dirName}/${f}`);

  categories.push({
    id:       dirName.toLowerCase(),
    label:    CATEGORY_LABELS[dirName] ?? dirName,
    stickers,
  });

  console.log(`✅ ${dirName}/  → ${files.length}개`);
}

const manifest = { categories };
const outPath  = path.join(IMG_DIR, 'manifest.json');
fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2), 'utf8');

console.log(`\n📄 manifest.json 생성 완료: ${outPath}`);
console.log(`   총 카테고리: ${categories.length}개`);
console.log(`   총 만능대가리: ${categories.reduce((s, c) => s + c.stickers.length, 0)}개`);
