const fs = require('fs');

let code = fs.readFileSync('src/components/SwiftPayGateway.tsx', 'utf-8');

code = code.replace(
  "import { CheckCircle2, Loader2, ScanFace } from 'lucide-react';",
  "import { CheckCircle2, Loader2, ScanFace, ArrowLeft } from 'lucide-react';"
);

code = code.replace(
  "export const SwiftPayGateway = () => {",
  "export const SwiftPayGateway = ({ onBack }: { onBack?: () => void }) => {"
);

const headerReplacement = `      <div className="p-6">
        {onBack && (
          <button 
            onClick={onBack}
            className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        )}
        {/* Header Section */}`;

code = code.replace(
  '      <div className="p-6">\n        {/* Header Section */}',
  headerReplacement
);

fs.writeFileSync('src/components/SwiftPayGateway.tsx', code);
