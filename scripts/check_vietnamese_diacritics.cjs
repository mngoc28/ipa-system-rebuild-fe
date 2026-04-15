const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "src", "pages");

// Heuristic: strings that look like Vietnamese UI text but contain no Vietnamese diacritics.
const suspectWordPattern = /\b(da|dang|duyet|chinh|sua|tai|xuong|len|ket qua|tien do|bien ban|dau viec|bao cao|lich trinh|thong tin|phu trach|hoan thanh|ban nhap|xem tat ca|thu gon)\b/i;
const hasVietnameseDiacritics = /[ăâđêôơưáàảãạấầẩẫậắằẳẵặéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]/i;
const stringLiteralPattern = /(["'`])((?:\\.|(?!\1).)*)\1/g;
const allowLatinPhrases = [/^Da Nang\b/i];

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.isFile() && full.endsWith(".tsx")) files.push(full);
  }
  return files;
}

const offenders = [];

for (const file of walk(root)) {
  const content = fs.readFileSync(file, "utf8");
  const lines = content.split(/\r?\n/);

  lines.forEach((line, idx) => {
    let m;
    while ((m = stringLiteralPattern.exec(line)) !== null) {
      const text = m[2];
      if (text.length < 6) continue;
      if (!suspectWordPattern.test(text)) continue;
      if (hasVietnameseDiacritics.test(text)) continue;
      if (allowLatinPhrases.some((re) => re.test(text))) continue;
      // Ignore code-like, filename-like, and route-like literals.
      if (/^[a-z0-9_./:-]+$/i.test(text)) continue;
      offenders.push({ file, line: idx + 1, text });
    }
    stringLiteralPattern.lastIndex = 0;
  });
}

if (offenders.length > 0) {
  console.error("Vietnamese diacritics guard failed. Suspected non-accented Vietnamese UI text:");
  offenders.forEach((o) => {
    console.error(`- ${path.relative(process.cwd(), o.file)}:${o.line} -> ${o.text}`);
  });
  process.exit(1);
}

console.log("Vietnamese diacritics guard passed.");
