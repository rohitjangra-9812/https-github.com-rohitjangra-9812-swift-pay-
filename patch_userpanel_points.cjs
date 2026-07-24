const fs = require('fs');
let code = fs.readFileSync('src/components/UserPanel.tsx', 'utf-8');

const targetBlock = `  const [swiftPoints, setSwiftPoints] = useState(() => Number(localStorage.getItem("swiftpay_points")) || 1250);`;

const replaceBlock = `  const [swiftPoints, setSwiftPoints] = useState(() => Number(localStorage.getItem("swiftpay_points")) || 1250);
  useEffect(() => {
    const handlePointsUpdate = (e: any) => setSwiftPoints(e.detail);
    window.addEventListener('swiftpay_points_updated', handlePointsUpdate);
    return () => window.removeEventListener('swiftpay_points_updated', handlePointsUpdate);
  }, []);`;

if (code.includes(targetBlock)) {
  code = code.replace(targetBlock, replaceBlock);
  fs.writeFileSync('src/components/UserPanel.tsx', code);
  console.log('UserPanel patched for points sync');
} else {
  console.log('targetBlock not found for points sync');
}
