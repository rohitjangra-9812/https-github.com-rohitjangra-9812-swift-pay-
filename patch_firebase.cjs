const fs = require('fs');
let code = fs.readFileSync('src/firebase.ts', 'utf-8');

code = code.replace(
  'import { getAnalytics } from "firebase/analytics";',
  'import { getAnalytics, isSupported } from "firebase/analytics";'
);

const oldAnalytics = `let analyticsInstance = null;
if (typeof window !== "undefined") {
  try {
    analyticsInstance = getAnalytics(app);
  } catch (e) {
    console.warn("Analytics not available", e);
  }
}`;

const newAnalytics = `let analyticsInstance = null;
if (typeof window !== "undefined") {
  isSupported().then(yes => {
    if (yes) {
      try {
        analyticsInstance = getAnalytics(app);
      } catch (e) {
        console.warn("Analytics not available", e);
      }
    }
  }).catch(e => console.warn("Analytics check failed", e));
}`;

code = code.replace(oldAnalytics, newAnalytics);
fs.writeFileSync('src/firebase.ts', code);
