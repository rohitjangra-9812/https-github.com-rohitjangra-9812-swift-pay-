const fs = require('fs');

function fixDuplicates(filePath) {
  let code = fs.readFileSync(filePath, 'utf-8');
  let newCode = code.replace(/title="Enter any 6 digits for testing"\n\s*title="Enter any 6 digits for testing"/g, 'title="Enter any 6 digits for testing"');
  fs.writeFileSync(filePath, newCode);
}

fixDuplicates('src/components/PinResetFlow.tsx');
fixDuplicates('src/components/PinPrompt.tsx');
