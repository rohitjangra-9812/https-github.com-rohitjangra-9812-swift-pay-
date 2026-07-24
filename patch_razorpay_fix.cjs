const fs = require('fs');
let code = fs.readFileSync('src/components/RazorpayGateway.tsx', 'utf-8');

if (!code.includes('import { SmsService }')) {
  code = code.replace(
    'import React, { useState, useEffect } from "react";',
    'import React, { useState, useEffect } from "react";\nimport { SmsService } from "../services/SmsService";'
  );
  fs.writeFileSync('src/components/RazorpayGateway.tsx', code);
}
