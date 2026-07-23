import fs from "fs";
import path from "path";
import sharp from "sharp";

const ROOT = path.resolve(process.cwd());
const HTML_PATH = path.join(ROOT, "public/legiao.html");
const OUT_DIR = path.join(ROOT, "public/legiao/avatars");

const html = fs.readFileSync(HTML_PATH, "utf8");

const re = /\.(ph-[a-z0-9_]+)\{background-image:url\(data:image\/jpeg;base64,([^)]+)\)\}/g;

let match;
const jobs = [];
while ((match = re.exec(html))) {
  jobs.push({ slug: match[1].slice(3), full: match[0], className: match[1], b64: match[2] });
}

console.log(`encontradas ${jobs.length} imagens base64 pra converter`);

let beforeBytes = 0;
let afterBytes = 0;
let newHtml = html;

for (const job of jobs) {
  const inputBuf = Buffer.from(job.b64, "base64");
  beforeBytes += Buffer.byteLength(job.full, "utf8");

  const outBuf = await sharp(inputBuf)
    .resize(104, 104, { fit: "cover" })
    .webp({ quality: 78 })
    .toBuffer();

  const outPath = path.join(OUT_DIR, `${job.slug}.webp`);
  fs.writeFileSync(outPath, outBuf);
  afterBytes += outBuf.length;

  const replacement = `.${job.className}{background-image:url(/legiao/avatars/${job.slug}.webp)}`;
  newHtml = newHtml.replace(job.full, replacement);
}

fs.writeFileSync(HTML_PATH, newHtml, "utf8");

console.log(`HTML antes (blocos base64): ${(beforeBytes / 1024).toFixed(1)}KB`);
console.log(`arquivos webp depois: ${(afterBytes / 1024).toFixed(1)}KB (${jobs.length} arquivos, media ${(afterBytes / jobs.length / 1024).toFixed(2)}KB)`);
console.log(`tamanho do legiao.html: antes n/a, depois ${(fs.statSync(HTML_PATH).size / 1024).toFixed(1)}KB`);
