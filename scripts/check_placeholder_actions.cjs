const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "src", "pages");
const patterns = [
  /dang duoc dong bo/i,
  /đang được đồng bộ/i,
  /dang duoc xu ly/i,
  /đang được xử lý/i,
  /dang duoc thiet lap/i,
  /đang được thiết lập/i,
  /ban tiep theo/i,
  /bản tiếp theo/i,
  /coming soon/i,
];

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
    } else if (entry.isFile() && full.endsWith(".tsx")) {
      files.push(full);
    }
  }
  return files;
}

const offenders = [];
for (const file of walk(root)) {
  const content = fs.readFileSync(file, "utf8");
  const lines = content.split(/\r?\n/);
  lines.forEach((line, idx) => {
    for (const re of patterns) {
      if (re.test(line)) {
        offenders.push({ file, line: idx + 1, text: line.trim() });
        break;
      }
    }
  });
}

if (offenders.length > 0) {
  console.error("UI placeholder guard failed. Found unfinished placeholder text:");
  offenders.forEach((o) => {
    console.error(`- ${path.relative(process.cwd(), o.file)}:${o.line} -> ${o.text}`);
  });
  process.exit(1);
}

console.log("UI placeholder guard passed.");
