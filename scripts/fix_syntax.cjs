const fs = require('fs');
const files = [
  'src/pages/admin/MasterDataPage.tsx',
  'src/pages/admin/AuditLogPage.tsx',
  'src/pages/admin/UserManagementPage.tsx'
];
for (let file of files) {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('import { toast } from "sonner";')) {
    content = 'import { toast } from "sonner";\n' + content;
  }
  content = content.replace(/<button onClick=\{\(e\) => \{ e\.preventDefault\(\); e\.stopPropagation\(\); toast\.success\("Thao tác đang được xử lý!"\); \}\}\r?\n\s*key=\{cat\.id\}\r?\n\s*onClick/g, '<button \nkey={cat.id}\n onClick');
  fs.writeFileSync(file, content, 'utf8');
}
