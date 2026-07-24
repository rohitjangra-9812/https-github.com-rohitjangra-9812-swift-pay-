const fs = require('fs');

let code = fs.readFileSync('src/firebase.ts', 'utf-8');

code = code.replace(/import \{ getAnalytics, isSupported \} from "firebase\/analytics";\\n/g, '');
code = code.replace(/import \{ getAnalytics \} from "firebase\/analytics";\\n/g, '');

const regex = /let analyticsInstance = null;[\\s\\S]*?export const analytics = analyticsInstance;/g;

code = code.replace(regex, '');

fs.writeFileSync('src/firebase.ts', code);
