const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const targetFunc = `  const handleShare = async () => {
    let shareUrl = window.location.href;
    let isDevLink = false;
    
    if (shareUrl.includes('ais-dev-')) {
      isDevLink = true;
      shareUrl = shareUrl.replace('ais-dev-', 'ais-pre-');
    }

    const shareData = {
      title: 'SwiftPay App',
      text: 'Check out the secure SwiftPay payment app.',
      url: shareUrl
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        if (isDevLink) toast.info('IMPORTANT: To make this link work (no 404 error), you MUST click "Share" -> "Publish" in the top right corner of AI Studio first!', { duration: 10000 });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Public link copied to clipboard!');
        if (isDevLink) {
          toast.error('IMPORTANT: This link will show a 404 error until you publish it!', { duration: 6000 });
          toast.info('Click the "Share" button in the top right of AI Studio, then "Publish" to make the link work when AI Studio is closed.', { duration: 10000 });
        }
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };`;

const newFunc = `  const [showShareModal, setShowShareModal] = useState(false);

  const handleShare = async () => {
    if (window.location.href.includes('ais-dev-')) {
      setShowShareModal(true);
    } else {
      try {
        if (navigator.share) {
          await navigator.share({
            title: 'SwiftPay App',
            text: 'Check out the secure SwiftPay payment app.',
            url: window.location.href
          });
        } else {
          await navigator.clipboard.writeText(window.location.href);
          toast.success('Public link copied to clipboard!');
        }
      } catch (err) {
        console.error('Error sharing:', err);
      }
    }
  };`;

if (code.includes(targetFunc)) {
  code = code.replace(targetFunc, newFunc);
  
  // Add ShareModal to the end of the return statement
  const shareModalHtml = `
      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-700 max-w-sm w-full"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full mb-4 mx-auto">
                <Share2 className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-center text-slate-900 dark:text-white mb-2">How to Share</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 text-center mb-6 leading-relaxed">
                You are currently viewing the <strong className="text-slate-800 dark:text-slate-200">Development Preview</strong>. If you copy this URL, other people will get a <strong className="text-red-500">404 Not Found error</strong>.
              </p>
              
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 mb-6">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">To share with others:</p>
                <ol className="text-sm text-slate-600 dark:text-slate-400 space-y-2 list-decimal list-inside">
                  <li>Look at the top-right corner of AI Studio.</li>
                  <li>Click the <strong>Share</strong> button.</li>
                  <li>Click <strong>Publish</strong> to generate a working public link.</li>
                </ol>
              </div>
              
              <button 
                onClick={() => setShowShareModal(false)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition-all"
              >
                I Understand
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );`;
  
  // Replace the closing div and return
  const endTarget = `    </div>
  );`;
  if (code.includes(endTarget)) {
     code = code.replace(endTarget, shareModalHtml);
  }
  
  // Add AnimatePresence import if missing
  if (!code.includes("AnimatePresence")) {
    code = code.replace("import { motion } from 'motion/react';", "import { motion, AnimatePresence } from 'motion/react';");
  }
  
  fs.writeFileSync('src/App.tsx', code);
  console.log('App.tsx patched for Share Modal');
} else {
  console.log('Could not find target function in App.tsx');
}
