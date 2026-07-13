// build-tree.mjs
// docs/ 폴더를 통째로 훑어서 트리 구조(manifest.json)를 자동 생성합니다.
// 사람이 목차를 손으로 짤 필요가 없습니다. 파일을 폴더에 넣으면 끝.
//
// 규칙:
//   - docs/ 아래의 폴더 = 트리의 가지(카테고리)
//   - .html 파일 = 잎(문서). <title> 또는 첫 <h1>을 제목으로 씁니다.
//   - 파일명/폴더명 맨 앞에 "01_" 처럼 숫자를 붙이면 정렬 순서로 쓰이고, 화면엔 안 보입니다.

import { readdir, readFile, writeFile, stat } from "node:fs/promises";
import { join, relative, extname, basename } from "node:path";

const DOCS_DIR = "docs";
const OUT_FILE = "manifest.json";

// "01_결제-POC" -> { order: 1, label: "결제-POC" }
function parseName(name) {
  const m = name.match(/^(\d+)[_.\-\s]+(.+)$/);
  if (m) return { order: parseInt(m[1], 10), label: m[2] };
  return { order: Number.MAX_SAFE_INTEGER, label: name };
}

// HTML에서 문서 제목 뽑기: <title> 우선, 없으면 첫 <h1>, 그것도 없으면 파일명
async function extractTitle(filePath, fallback) {
  try {
    const html = await readFile(filePath, "utf8");
    const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (title && title[1].trim()) return title[1].trim();
    const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    if (h1) return h1[1].replace(/<[^>]+>/g, "").trim();
  } catch {}
  return fallback;
}

async function walk(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }

  const nodes = [];
  for (const entry of entries) {
    if (entry.name.startsWith(".") || entry.name.startsWith("_")) continue;
    const full = join(dir, entry.name);

    if (entry.isDirectory()) {
      const children = await walk(full);
      if (children.length === 0) continue; // 빈 폴더는 트리에 안 넣음
      const { order, label } = parseName(entry.name);
      nodes.push({ type: "folder", label, order, children });
    } else if (extname(entry.name).toLowerCase() === ".html") {
      const { order, label } = parseName(basename(entry.name, ".html"));
      const title = await extractTitle(full, label);
      const info = await stat(full);
      nodes.push({
        type: "doc",
        label: title,
        order,
        path: relative(DOCS_DIR, full).split(/[\\/]/).join("/"),
        updated: info.mtime.toISOString().slice(0, 10),
      });
    }
  }

  // 폴더 먼저, 그다음 order, 그다음 이름순
  nodes.sort((a, b) => {
    if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
    if (a.order !== b.order) return a.order - b.order;
    return a.label.localeCompare(b.label, "ko");
  });
  return nodes;
}

const tree = await walk(DOCS_DIR);
const manifest = {
  generated: new Date().toISOString(),
  count: JSON.stringify(tree).match(/"type":"doc"/g)?.length ?? 0,
  tree,
};
await writeFile(OUT_FILE, JSON.stringify(manifest, null, 2), "utf8");
console.log(`✔ manifest.json 생성 완료 — 문서 ${manifest.count}개`);
