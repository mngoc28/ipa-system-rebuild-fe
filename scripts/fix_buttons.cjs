const fs = require('fs');
const path = require('path');
const files = ['AuditLogPage.tsx', 'MasterDataPage.tsx', 'UserManagementPage.tsx'];

for (const file of files) {
  const p = path.join('src/pages/admin', file);
  let content = fs.readFileSync(p, 'utf8');
  
  if (!content.includes('import { toast }')) {
    content = content.replace(/import \* as React from "react";/, 'import * as React from "react";\nimport { toast } from "sonner";');
  }

  content = content.replace(/<button(?!\s+onClick)([^>]*)>/g, '<button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toast.success("Thao tác đang được xử lý!"); }}$1>');

  fs.writeFileSync(p, content, 'utf8');
}
