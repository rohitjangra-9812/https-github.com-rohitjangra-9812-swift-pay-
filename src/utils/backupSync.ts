import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const syncBankAccountState = async () => {
  try {
    const bankDetailsStr = localStorage.getItem('swiftpay_bankDetails');
    const bankAccountsStr = localStorage.getItem('swiftpay_bankAccounts');
    const isBankLinked = localStorage.getItem('swiftpay_isBankLinked');
    const verifiedMobile = localStorage.getItem('swiftpay_verified_mobile');
    
    if (!verifiedMobile) {
       return; // We need a verified mobile number to sync securely across devices
    }

    if (!bankDetailsStr && !isBankLinked) {
       return; // Nothing to sync
    }

    const payload = {
       bankDetails: bankDetailsStr ? JSON.parse(bankDetailsStr) : null,
       bankAccounts: bankAccountsStr ? JSON.parse(bankAccountsStr) : null,
       isBankLinked: isBankLinked === "true",
       verifiedMobile: verifiedMobile,
       updatedAt: new Date().toISOString()
    };

    // Use the verified mobile number as the document ID for cross-device sync
    const backupRef = doc(db, 'user_backups', verifiedMobile);
    await setDoc(backupRef, payload, { merge: true });
    
    console.log("Bank state synced to Firestore using mobile number");
  } catch (error) {
    console.error("Failed to sync backup to Firestore", error);
  }
};

export const fetchCloudBackup = async (mobile: string): Promise<any> => {
  try {
    const backupRef = doc(db, 'user_backups', mobile);
    const docSnap = await getDoc(backupRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    }
  } catch (error) {
    console.error("Failed to fetch cloud backup", error);
  }
  return null;
};

export const startPeriodicSync = () => {
   let intervalId: any = null;
   syncBankAccountState();
   intervalId = setInterval(syncBankAccountState, 5 * 60 * 1000);
   
   return () => {
     if (intervalId) clearInterval(intervalId);
   };
};
