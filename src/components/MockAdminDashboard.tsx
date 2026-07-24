import { toast } from "sonner";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../firebase';
import { collection, query, orderBy, limit, onSnapshot, doc, updateDoc, addDoc, setDoc, serverTimestamp, getDocs, where } from 'firebase/firestore';
import { ArrowLeft, Zap, ArrowUpRight, ArrowDownRight, TrendingUp, DollarSign, Activity, CheckCircle2, XCircle, Clock, Server, Terminal as TerminalIcon, RefreshCw, Cpu, Database, Mail, HardDrive, ShieldAlert, Trash2, FileText, Send, Smartphone, Building2, Layers, Lock, Code, ShieldCheck, Copy, MessageSquare, UserCheck, Ban, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
// Mock Data
const MOCK_TRANSACTIONS = [
  { id: 'TXN-9821', time: '10:42 AM', upiId: 'rahat@ybl', amount: 4500, status: 'SUCCESS' },
  { id: 'TXN-9820', time: '10:35 AM', upiId: 'vijay.99@okhdfc', amount: 12000, status: 'FAILED' },
  { id: 'TXN-9819', time: '10:15 AM', upiId: 'sneha.k@icici', amount: 850, status: 'SUCCESS' },
  { id: 'TXN-9818', time: '09:50 AM', upiId: 'amit.sharma@paytm', amount: 2400, status: 'SUCCESS' },
  { id: 'TXN-9817', time: '09:22 AM', upiId: 'priya_m@okaxis', amount: 6500, status: 'SUCCESS' },
  { id: 'TXN-9816', time: '08:45 AM', upiId: 'karan.d@ybl', amount: 1500, status: 'FAILED' },
  { id: 'TXN-9815', time: '08:10 AM', upiId: 'deepika.s@sbi', amount: 9200, status: 'SUCCESS' }
];

const SECURITY_OVERVIEW_DATA = [
  { day: 'Mon', logins: 120, alerts: 5 },
  { day: 'Tue', logins: 150, alerts: 12 },
  { day: 'Wed', logins: 180, alerts: 3 },
  { day: 'Thu', logins: 145, alerts: 8 },
  { day: 'Fri', logins: 210, alerts: 15 },
  { day: 'Sat', logins: 250, alerts: 20 },
  { day: 'Sun', logins: 190, alerts: 10 },
];

interface ServerStatus {
  success: boolean;
  status: string;
  uptime: number;
  nodeVersion: string;
  platform: string;
  nodeEnv: string;
  port: number;
  memory: {
    rss: string;
    heapTotal: string;
    heapUsed: string;
  };
  gateway: {
    hasRazorpayKey: boolean;
    hasRazorpaySecret: boolean;
    keyPrefix: string;
    mode: string;
  };
  smtp: {
    configured: boolean;
    host: string;
    port: string | number;
    sender: string;
  };
  db: {
    firestoreId: string;
    status: string;
  };
  logs: string[];
}

export function MockAdminDashboard({ 
  onSwitchView,
  onOpenSecurityDashboard,
  autoPredictMood,
  setAutoPredictMood,
  moodInput,
  setMoodInput,
  isAnalyzingMood,
  handlePredictMood,
  userMood,
  setUserMood,
  userMoodDetails,
  setUserMoodDetails,
  trackAction,
  triggerVibe,
  globalLinkedAccounts,
  setGlobalLinkedAccounts,
  serverControlState = 'ONLINE',
  setServerControlState,
  bankVerificationMode = 'AUTO',
  setBankVerificationMode
}: { 
  onSwitchView: () => void;
  onOpenSecurityDashboard?: () => void;
  autoPredictMood: boolean;
  setAutoPredictMood: (v: boolean) => void;
  moodInput: string;
  setMoodInput: (v: string) => void;
  isAnalyzingMood: boolean;
  handlePredictMood: (text: string) => Promise<void>;
  userMood: string;
  setUserMood: (m: string) => void;
  userMoodDetails: any;
  setUserMoodDetails: (d: any) => void;
  trackAction: (act: string) => void;
  triggerVibe: (style: string) => void;
  globalLinkedAccounts?: any[];
  setGlobalLinkedAccounts?: (accounts: any[]) => void;
  serverControlState?: 'ONLINE' | 'MAINTENANCE' | 'OFFLINE';
  setServerControlState?: (state: 'ONLINE' | 'MAINTENANCE' | 'OFFLINE') => void;
  bankVerificationMode?: 'AUTO' | 'MANUAL';
  setBankVerificationMode?: (mode: 'AUTO' | 'MANUAL') => void;
}) {
  const [activeTab, setActiveTab] = useState<'transactions' | 'server_infrastructure' | 'open_banking_sandbox' | 'vibe_ai_core' | 'customer_audit_support' | 'security_overview' | 'feedback' | 'app_optimization'>('transactions');
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [optStatus, setOptStatus] = useState<'idle' | 'running' | 'completed'>('idle');
  const [optProgress, setOptProgress] = useState(0);
  const [optLogs, setOptLogs] = useState<string[]>([]);
  
  const startOptimization = () => {
    setOptStatus('running');
    setOptProgress(0);
    setOptLogs(['Starting safe system optimization...', 'Creating in-memory snapshot to prevent data loss...']);
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 15) + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setOptStatus('completed');
        setOptLogs(prev => [...prev, 'Optimization complete. System running at peak efficiency.']);
        setTimeout(() => setOptStatus('idle'), 5000);
      }
      setOptProgress(progress);
      
      const newLogs = [
        'Clearing orphaned cache fragments safely...',
        'Compressing transaction history indices (non-destructive)...',
        'Optimizing React state trees...',
        'Re-indexing local storage blobs...',
        'Garbage collecting stale UI threads...'
      ];
      if (progress < 100 && Math.random() > 0.4) {
        setOptLogs(prev => [...prev, newLogs[Math.floor(Math.random() * newLogs.length)]]);
      }
    }, 800);
  };


  useEffect(() => {
    if (activeTab === 'feedback') {
      const loadFeedbacks = () => {
        const stored = localStorage.getItem('swiftpay_feedbacks');
        if (stored) {
          setFeedbacks(JSON.parse(stored));
        }
      };
      loadFeedbacks();
      window.addEventListener('storage', loadFeedbacks);
      return () => window.removeEventListener('storage', loadFeedbacks);
    }
  }, [activeTab]);

  const deleteFeedback = (id: string) => {
    const updated = feedbacks.filter(f => f.id !== id);
    setFeedbacks(updated);
    localStorage.setItem('swiftpay_feedbacks', JSON.stringify(updated));
    toast.success("Feedback deleted");
  };
  const [userLoginLogs, setUserLoginLogs] = useState<any[]>([]);
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [ticketReplies, setTicketReplies] = useState<Record<string, string>>({});
  const [blockedUsers, setBlockedUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const q = query(collection(db, 'blocked_users'));
      return onSnapshot(q, (snapshot) => {
        const blocked = new Set<string>();
        snapshot.forEach((docSnap) => {
          blocked.add(docSnap.id); // store upi as ID
        });
        setBlockedUsers(blocked);
      }, (error) => {
        console.warn("Blocked users subscription error:", error);
      });
    } catch (e) {
      console.warn("Blocked users subscription bypassed.", e);
    }
  }, []);


  // Real-time subscription listeners
  useEffect(() => {
    try {
      const q = query(collection(db, 'user_login_logs'), orderBy('timestamp', 'desc'), limit(50));
      return onSnapshot(q, (snapshot) => {
        const logs: any[] = [];
        snapshot.forEach((docSnap) => {
          logs.push({ id: docSnap.id, ...docSnap.data() });
        });
        setUserLoginLogs(logs);
      }, (error) => {
        console.warn("User login logs subscription error:", error);
      });
    } catch (e) {
      console.warn("User login logs subscription bypassed.", e);
    }
  }, []);

  useEffect(() => {
    try {
      const q = query(collection(db, 'support_tickets'), orderBy('timestamp', 'desc'), limit(50));
      return onSnapshot(q, (snapshot) => {
        const tickets: any[] = [];
        snapshot.forEach((docSnap) => {
          tickets.push({ id: docSnap.id, ...docSnap.data() });
        });
        setSupportTickets(tickets);
      }, (error) => {
        console.warn("Support tickets subscription error:", error);
      });
    } catch (e) {
      console.warn("Support tickets subscription bypassed.", e);
    }
  }, []);

  const handleBlockUser = async (upi: string, name: string) => {
    if (!upi) return;
    try {
      if (blockedUsers.has(upi)) {
         // Unblock
         // Actually maybe just block for now, but allow unblock
         toast.success("User is already blocked");
         return;
      }
      const blockRef = doc(db, 'blocked_users', upi);
      await setDoc(blockRef, {
        name,
        blockedAt: serverTimestamp(),
        reason: "Cyber Fraud Activity"
      });
      toast.success(`${name} has been blocked from the gateway.`);
      // Also write a security event
      await addDoc(collection(db, 'security_events'), {
        type: "FRAUD_PREVENTION",
        details: `Admin directly blocked user ${name} (${upi}) due to suspected cyber fraud.`,
        severity: "critical",
        timestamp: serverTimestamp()
      });
    } catch (err) {
      console.error("Error blocking user:", err);
      toast.error("Failed to block user.");
    }
  };

  const [adminNotification, setAdminNotification] = useState<{ id: string; type: string; details: string; severity: string; timestamp: any } | null>(null);
  const [securityEventsList, setSecurityEventsList] = useState<any[]>([]);

  useEffect(() => {
    try {
      const q = query(collection(db, 'security_events'), orderBy('timestamp', 'desc'), limit(50));
      return onSnapshot(q, (snapshot) => {
        const events: any[] = [];
        snapshot.forEach((docSnap) => {
          events.push({ id: docSnap.id, ...docSnap.data() });
        });
        setSecurityEventsList(events);
      }, (error) => {
        console.warn("Security events list subscription error:", error);
      });
    } catch (e) {
      console.warn("Security events list subscription bypassed.", e);
    }
  }, []);

  useEffect(() => {
    try {
      const q = query(collection(db, 'security_events'), orderBy('timestamp', 'desc'), limit(1));
      let initialLoad = true;
      return onSnapshot(q, (snapshot) => {
        if (initialLoad) {
          initialLoad = false;
          return;
        }
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          setAdminNotification({
            id: docSnap.id,
            type: data.type || 'SECURITY_TRIGGER',
            details: data.details || '',
            severity: data.severity || 'high',
            timestamp: data.timestamp
          });
        });
      }, (error) => {
        console.warn("Security events single subscription error:", error);
      });
    } catch (e) {
      console.warn("Security events subscription bypassed.", e);
    }
  }, []);

  useEffect(() => {
    if (adminNotification) {
      const timer = setTimeout(() => {
        setAdminNotification(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [adminNotification]);

  const [refundedTx, setRefundedTx] = useState<Record<string, boolean>>({});
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testEmailStatus, setTestEmailStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [testEmailPreview, setTestEmailPreview] = useState<string | null>(null);
  const [autoPoll, setAutoPoll] = useState(true);

  // --- OPEN BANKING & UPI MICROSERVICES DEMO STATES ---
  const [phone, setPhone] = useState('9812603346');
  const [deviceId, setDeviceId] = useState('dev-iphone15-pro-99');
  const [fingerprint, setFingerprint] = useState('fp_a982b13c7d1e');
  const [bindingToken, setBindingToken] = useState('');
  const [linkedAccounts, setLinkedAccounts] = useState<any[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [securityPIN, setSecurityPIN] = useState('2588');

  // Polling simulator
  const [isPolling, setIsPolling] = useState(false);
  const [pollingProgress, setPollingProgress] = useState(0);
  const [pollingStatusText, setPollingStatusText] = useState('');
  const [checkedBalance, setCheckedBalance] = useState<number | null>(null);

  // Console / Terminal Logs
  const [obLogs, setObLogs] = useState<string[]>([
    "System Initialized. Awaiting cryptographic device binding handshake...",
    "Using JWS HMAC-SHA256 Secret verification key: SwiftPay_Fintech_Architect_Secret_2026",
    "Compliance: AES-256-GCM data at rest encryption, clock-drift checks, and request idempotency validation enabled."
  ]);
  const [activeSubTab, setActiveSubTab] = useState<'playground' | 'architecture' | 'code_snippets'>('playground');

  const generateClientSignature = async (bodyString: string, timestamp: string, idempotencyKey: string) => {
    const secret = "SwiftPay_Fintech_Architect_Secret_2026";
    const message = `${timestamp}.${idempotencyKey}.${bodyString}`;
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(message);
    
    const cryptoKey = await window.crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    
    const signatureBuffer = await window.crypto.subtle.sign(
      "HMAC",
      cryptoKey,
      messageData
    );
    
    const hashArray = Array.from(new Uint8Array(signatureBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleDeviceBinding = async () => {
    try {
      const timestamp = Date.now().toString();
      const idempotencyKey = "idem-" + Math.random().toString(36).substring(2, 9);
      const reqBody = { phoneNumber: phone, deviceId, deviceFingerprint: fingerprint };
      const bodyStr = JSON.stringify(reqBody);
      
      const signature = await generateClientSignature(bodyStr, timestamp, idempotencyKey);
      
      setObLogs(prev => [
        ...prev, 
        `----------------------------------------`,
        `[1. Handshake] Generating JWS-HMAC Signature: ${signature.substring(0, 16)}...`,
        `[1. Handshake] Binding Client ID 'swiftpay-mobile-client' & phone number: ${phone}`
      ]);
      
      const res = await fetch('/api/v1/auth/verify-device', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': 'swiftpay-mobile-client',
          'x-timestamp': timestamp,
          'x-idempotency-key': idempotencyKey,
          'x-jws-signature': signature
        },
        body: bodyStr
      });
      
      if (res.ok) {
        const data = await res.json();
        setBindingToken(data.bindingToken);
        setObLogs(prev => [
          ...prev, 
          `[Secure Shield] Decrypting payload - AES-256-GCM verification active.`,
          `[Vault Storage] Phone securely stored as encrypted ciphertext: ${data.secureVault.encryptedPhone.substring(0, 20)}...`,
          `[Success] Device bound securely! Token: ${data.bindingToken.substring(0, 16)}...`,
          `[Audit Metadata] Verified at: ${data.metadata.verifiedAt} | status: ${data.metadata.status}`
        ]);
      } else {
        const errData = await res.json();
        setObLogs(prev => [...prev, `[Error] Device binding failed: ${errData.reason || errData.error}`]);
      }
    } catch (err: any) {
      setObLogs(prev => [...prev, `[Error] Client exception during binding: ${err.message}`]);
    }
  };

  const handleLinkBanks = async () => {
    if (!bindingToken) {
      setObLogs(prev => [
        ...prev, 
        `----------------------------------------`,
        `[Warning] Please bind the device first to establish the secure bindingToken.`
      ]);
      return;
    }
    try {
      const timestamp = Date.now().toString();
      const idempotencyKey = "idem-" + Math.random().toString(36).substring(2, 9);
      const reqBody = { phoneNumber: phone, bindingToken };
      const bodyStr = JSON.stringify(reqBody);
      
      const signature = await generateClientSignature(bodyStr, timestamp, idempotencyKey);
      
      setObLogs(prev => [
        ...prev,
        `----------------------------------------`,
        `[2. Account Fetching] Querying Plaid-UPI Broker Node...`,
        `[2. Account Fetching] Header timestamp: ${timestamp} | JWS Signature: ${signature.substring(0, 16)}...`
      ]);
      
      const res = await fetch('/api/v1/banks/link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': 'swiftpay-mobile-client',
          'x-timestamp': timestamp,
          'x-idempotency-key': idempotencyKey,
          'x-jws-signature': signature
        },
        body: bodyStr
      });
      
      if (res.ok) {
        const data = await res.json();
        setLinkedAccounts(data.accounts);
        if (data.accounts.length > 0) {
          setSelectedAccountId(data.accounts[0].accountId);
        }
        setObLogs(prev => [
          ...prev, 
          `[Success] Plaid-UPI Bridge returned ${data.discoveredAccountsCount} bank accounts!`,
          ...data.accounts.map((acc: any) => `  ↳ Discovered ${acc.bankName} Account ending in ...${acc.accountNo.slice(-4)} (IFSC: ${acc.ifscCode})`)
        ]);
      } else {
        const errData = await res.json();
        setObLogs(prev => [...prev, `[Error] Bank account fetching failed: ${errData.reason || errData.error}`]);
      }
    } catch (err: any) {
      setObLogs(prev => [...prev, `[Error] Client exception during retrieval: ${err.message}`]);
    }
  };

  const handleCheckBalance = async () => {
    if (!selectedAccountId) {
      setObLogs(prev => [
        ...prev,
        `----------------------------------------`,
        `[Warning] Please link and select a bank account first.`
      ]);
      return;
    }
    
    setIsPolling(true);
    setPollingProgress(0);
    setCheckedBalance(null);
    setPollingStatusText('Initializing secure bridge connection...');
    setObLogs(prev => [
      ...prev,
      `----------------------------------------`,
      `[3. Balance Retrieval] Initializing encrypted asynchronous loop...`,
      `[3. Balance Retrieval] Using PIN: •••• for Account ID: ${selectedAccountId}`
    ]);
    
    try {
      const timestamp = Date.now().toString();
      const idempotencyKey = "idem-" + Math.random().toString(36).substring(2, 9);
      const reqBody = { accountId: selectedAccountId, securityPIN };
      const bodyStr = JSON.stringify(reqBody);
      
      const signature = await generateClientSignature(bodyStr, timestamp, idempotencyKey);
      
      const res = await fetch('/api/v1/banks/balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': 'swiftpay-mobile-client',
          'x-timestamp': timestamp,
          'x-idempotency-key': idempotencyKey,
          'x-jws-signature': signature
        },
        body: bodyStr
      });
      
      if (res.status === 202) {
        const data = await res.json();
        const requestId = data.requestId;
        setObLogs(prev => [...prev, `[Asynchronous Switch] 202 ACCEPTED. RequestId: ${requestId}. Poll endpoint: ${data.pollUrl}`]);
        
        let attempts = 0;
        const maxAttempts = 6;
        
        const pollInterval = setInterval(async () => {
          attempts++;
          setPollingStatusText(`Polling Banking Switch (Attempt ${attempts}/${maxAttempts})...`);
          
          try {
            const pollRes = await fetch(`/api/v1/banks/balance/poll/${requestId}`);
            if (pollRes.ok) {
              const pollData = await pollRes.json();
              setPollingProgress(pollData.progress || 0);
              
              if (pollData.status === "SUCCESS") {
                clearInterval(pollInterval);
                setIsPolling(false);
                setCheckedBalance(pollData.balance);
                setObLogs(prev => [
                  ...prev,
                  `[Polling Complete] Successfully resolved in ${attempts} loops!`,
                  `[Success] Live Bank Switch pulled: Balance ₹${pollData.balance.toLocaleString('en-IN')}`
                ]);
              } else {
                setObLogs(prev => [...prev, `[Polling] Attempt ${attempts}: Status PENDING (Progress: ${pollData.progress}%)`]);
              }
            } else {
              setObLogs(prev => [...prev, `[Polling Error] Bridge node returned invalid HTTP status.`]);
            }
          } catch (e: any) {
            setObLogs(prev => [...prev, `[Polling Error] Exception: ${e.message}`]);
          }
          
          if (attempts >= maxAttempts) {
            clearInterval(pollInterval);
            setIsPolling(false);
            setObLogs(prev => [...prev, `[Timeout] Asynchronous pull timed out after ${maxAttempts} polls.`]);
          }
        }, 1200);
      } else {
        const errData = await res.json();
        setObLogs(prev => [...prev, `[Error] Balance query registration failed: ${errData.reason || errData.error}`]);
        setIsPolling(false);
      }
    } catch (err: any) {
      setObLogs(prev => [...prev, `[Error] Client exception during balance request: ${err.message}`]);
      setIsPolling(false);
    }
  };

  const fetchServerStatus = async () => {
    setLoadingStatus(true);
    try {
      const res = await fetch('/api/admin/server-status');
      if (res.ok) {
        const data = await res.json();
        setServerStatus(data);
      }
    } catch (err) {
      // console.error("Failed to load server diagnostic status:", err);
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchServerStatus();
  }, []);

  useEffect(() => {
    if (!autoPoll) return;
    const interval = setInterval(() => {
      fetchServerStatus();
    }, 4000);
    return () => clearInterval(interval);
  }, [autoPoll]);

  const handleRefund = (id: string) => {
    setRefundedTx(prev => ({ ...prev, [id]: true }));
  };

  const handleClearLogs = async () => {
    try {
      const res = await fetch('/api/admin/clear-logs', { method: 'POST' });
      if (res.ok) {
        fetchServerStatus();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail) return;
    setTestEmailStatus('sending');
    setTestEmailPreview(null);
    try {
      const res = await fetch('/api/admin/send-test-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail })
      });
      if (res.ok) {
        const data = await res.json();
        setTestEmailStatus('success');
        if (data.previewUrl) {
          setTestEmailPreview(data.previewUrl);
        }
      } else {
        setTestEmailStatus('error');
      }
    } catch (err) {
      setTestEmailStatus('error');
    }
  };

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / (3600*24));
    const h = Math.floor(seconds % (3600*24) / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    const s = Math.floor(seconds % 60);
    return `${d > 0 ? d + 'd ' : ''}${h > 0 ? h + 'h ' : ''}${m > 0 ? m + 'm ' : ''}${s}s`;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-500">
      
      {/* Real-time Security Rules / Fraud Toast Notification */}
      <AnimatePresence>
        {adminNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 p-5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border max-w-md w-full mx-4 backdrop-blur-md ${
              adminNotification.severity === 'critical'
                ? 'bg-rose-950/95 border-rose-800 text-rose-100 shadow-rose-950/50'
                : 'bg-amber-950/95 border-amber-800 text-amber-100 shadow-amber-950/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${
                adminNotification.severity === 'critical' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
              }`}>
                <ShieldAlert className="w-5 h-5 animate-pulse" />
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Real-Time Security Feed
                </span>
                <h4 className={`text-xs font-black uppercase tracking-wide ${
                  adminNotification.severity === 'critical' ? 'text-rose-400' : 'text-amber-400'
                }`}>
                  {adminNotification.type}
                </h4>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-semibold pl-1">
              {adminNotification.details}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Toggle Bar */}
      <div className="bg-slate-900 border-b border-slate-800 text-white p-4 flex items-center justify-between shadow-md relative z-50">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <div className="flex flex-col">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400">Core Network Node</span>
            <span className="text-sm font-bold text-slate-200">SwiftPay Server Administrator Console</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onOpenSecurityDashboard && (
            <button 
              onClick={onOpenSecurityDashboard}
              className="text-xs font-black uppercase tracking-wider bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 px-5 py-2 rounded-xl transition-all flex items-center gap-2 border border-rose-500/20"
            >
              <ShieldAlert className="w-4 h-4" /> Security Console
            </button>
          )}
          <button 
            onClick={onSwitchView}
            className="text-xs font-semibold bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-xl transition-all flex items-center gap-2 border border-slate-700 hover:border-slate-600"
          >
            <ArrowLeft className="w-4 h-4" /> Switch to Customer View
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-8">
        
        {/* Header with Navigation Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-2">Merchant & Infrastructure Hub</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium tracking-wide">
              Securely monitor real-time server gateway, database integrity nodes, API variables, and ledger records.
            </p>
          </div>
          
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800/80 flex-wrap gap-1 md:gap-0">
            <button
              onClick={() => setActiveTab('transactions')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                activeTab === 'transactions'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" /> Ledger Records
            </button>
            <button
              onClick={() => setActiveTab('server_infrastructure')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                activeTab === 'server_infrastructure'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Server className="w-4 h-4" /> Server Diagnostics
            </button>
            <button
              onClick={() => setActiveTab('open_banking_sandbox')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                activeTab === 'open_banking_sandbox'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Open Banking Hub (API)
            </button>
            <button
              onClick={() => setActiveTab('vibe_ai_core')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                activeTab === 'vibe_ai_core'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Cpu className="w-4 h-4 text-violet-500 animate-pulse" /> Vibe AI Core
            </button>
            <button
              onClick={() => setActiveTab('customer_audit_support')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                activeTab === 'customer_audit_support'
                  ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-rose-500 dark:hover:text-slate-200'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-rose-500" /> Customer Logs & Support
            </button>
            <button
              onClick={() => setActiveTab('security_overview')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                activeTab === 'security_overview'
                  ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-amber-500 dark:hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-amber-500" /> Security Overview
            </button>
            <button
              onClick={() => setActiveTab('feedback')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                activeTab === 'feedback'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-indigo-500" /> User Feedback
            </button>
            <button
              onClick={() => setActiveTab('app_optimization')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                activeTab === 'app_optimization'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Zap className="w-4 h-4 text-indigo-500" /> Auto Optimization
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'transactions' && (
            <motion.div
              key="transactions"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-8"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 rounded-[28px] p-6 shadow-sm border border-slate-200 dark:border-slate-800/80 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-sm bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full">
                      <TrendingUp className="w-3 h-3" /> +12.5%
                    </span>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1 mt-6">Total Volume Processed</p>
                    <h2 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">₹1,45,000</h2>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-[28px] p-6 shadow-sm border border-slate-200 dark:border-slate-800/80 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center">
                      <Activity className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1 mt-6">Success Rate</p>
                    <h2 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">94.2%</h2>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-[28px] p-6 shadow-sm border border-slate-200 dark:border-slate-800/80 flex flex-col justify-between md:col-span-2 lg:col-span-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1 mt-6">Active Sessions</p>
                    <h2 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">124</h2>
                  </div>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-200 dark:border-slate-800/80">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-black tracking-tight">Recent Transactions</h3>
                  <span className="text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg text-slate-500 font-bold">Simulator Feed</span>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800/60">
                        <th className="pb-4 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Time</th>
                        <th className="pb-4 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Transaction ID & Form</th>
                        <th className="pb-4 font-bold text-slate-400 uppercase tracking-widest text-[10px] text-right">Amount</th>
                        <th className="pb-4 font-bold text-slate-400 uppercase tracking-widest text-[10px] text-center">Status</th>
                        <th className="pb-4 font-bold text-slate-400 uppercase tracking-widest text-[10px] text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_TRANSACTIONS.map((tx, idx) => (
                        <tr 
                          key={tx.id} 
                          className="group border-b border-slate-50 dark:border-slate-850/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                        >
                          <td className="py-5 pr-4 align-middle">
                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-medium">
                              <Clock className="w-4 h-4" />
                              {tx.time}
                            </div>
                          </td>
                          <td className="py-5 pr-4 align-middle">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-900 dark:text-white">{tx.upiId}</span>
                              <span className="text-xs text-slate-400 font-mono mt-0.5">{tx.id}</span>
                            </div>
                          </td>
                          <td className="py-5 pr-4 align-middle text-right">
                            <span className="font-black text-slate-900 dark:text-white tracking-tight">₹{tx.amount.toLocaleString('en-IN')}</span>
                          </td>
                          <td className="py-5 pr-4 align-middle text-center">
                            <div className="inline-flex justify-center">
                              {tx.status === 'SUCCESS' ? (
                                <div className="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 uppercase tracking-wide">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Success
                                </div>
                              ) : (
                                <div className="bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 uppercase tracking-wide">
                                  <XCircle className="w-3.5 h-3.5" /> Failed
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-5 align-middle text-right">
                            {tx.status === 'SUCCESS' && (
                              <button
                                onClick={() => handleRefund(tx.id)}
                                disabled={refundedTx[tx.id]}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                  refundedTx[tx.id] 
                                    ? "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed" 
                                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 shadow-sm"
                                }`}
                              >
                                {refundedTx[tx.id] ? "Refunded" : "Issue Refund"}
                              </button>
                            )}
                            {tx.status === 'FAILED' && (
                              <span className="text-xs text-slate-400 uppercase font-bold tracking-widest">N/A</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'server_infrastructure' && (
            <motion.div
              key="server_infrastructure"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-8"
            >
              {/* Server Control Top Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-[28px] border border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20">
                    <Cpu className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg">Express Instance Diagnostics</h3>
                    <p className="text-xs text-slate-400 font-medium">Direct live telemetry & administrative overrides.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs text-slate-400 font-bold cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={autoPoll} 
                      onChange={(e) => setAutoPoll(e.target.checked)}
                      className="rounded border-slate-750 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900 bg-slate-800"
                    />
                    Auto-Refresh Logs (4s)
                  </label>

                  <button
                    onClick={fetchServerStatus}
                    disabled={loadingStatus}
                    className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 hover:text-white transition-all border border-slate-750 flex items-center justify-center gap-2 font-bold text-xs"
                    title="Poll Server State"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingStatus ? 'animate-spin' : ''}`} />
                    Poll Now
                  </button>
                </div>
              </div>

              {/* Status and Resources Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* System Parameters Card */}
                <div className="bg-white dark:bg-slate-900 rounded-[28px] p-6 border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-5">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Environment Node Meta</h4>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 font-medium">Server Status</span>
                      <span className="inline-flex items-center gap-1.5 font-bold text-xs bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                        {serverStatus?.status || "ONLINE"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 font-medium">Server Uptime</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {serverStatus ? formatUptime(serverStatus.uptime) : "Fetching..."}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 font-medium">Node.js Engine</span>
                      <span className="font-mono text-slate-800 dark:text-slate-200">{serverStatus?.nodeVersion || "v20.11.0"}</span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 font-medium">Container Environment</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 uppercase text-xs tracking-wider">
                        {serverStatus?.nodeEnv || "production"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 font-medium">Port Ingress Binding</span>
                      <span className="font-mono text-slate-800 dark:text-slate-200">:{serverStatus?.port || 3000}</span>
                    </div>
                  </div>

                  {/* ADMIN SERVER CONTROL OVERRIDES */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3.5">
                    <div>
                      <label className="block text-[8.5px] uppercase font-black text-slate-400 mb-1.5">Interactive Server Core State</label>
                      <select
                        value={serverControlState}
                        onChange={(e) => {
                          const val = e.target.value as any;
                          if (setServerControlState) {
                            setServerControlState(val);
                            localStorage.setItem('swiftpay_server_state', val);
                          }
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-200 font-bold focus:outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        <option value="ONLINE">🟢 ONLINE (Normal Active Operations)</option>
                        <option value="MAINTENANCE">🟠 MAINTENANCE (Display Advisory)</option>
                        <option value="OFFLINE">🔴 OFFLINE (Mock Shutdown state)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[8.5px] uppercase font-black text-slate-400 mb-1.5">Bank Linkage Verification Mode</label>
                      <select
                        value={bankVerificationMode}
                        onChange={(e) => {
                          const val = e.target.value as any;
                          if (setBankVerificationMode) {
                            setBankVerificationMode(val);
                            localStorage.setItem('swiftpay_bank_verification_mode', val);
                          }
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-200 font-bold focus:outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        <option value="AUTO">⚙️ AUTO-VERIFY (Instant Approval)</option>
                        <option value="MANUAL">👤 MANUAL-VERIFY (Admin Handshake)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Resource Allocator Card */}
                <div className="bg-white dark:bg-slate-900 rounded-[28px] p-6 border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-5">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Memory Utilization Allocation</h4>
                  
                  {serverStatus?.memory ? (
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-xs font-medium mb-1.5">
                          <span className="text-slate-500">Resident Set Size (RSS)</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{serverStatus.memory.rss}</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full" style={{ width: '45%' }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-medium mb-1.5">
                          <span className="text-slate-500">Allocated Heap Volume</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{serverStatus.memory.heapTotal}</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-600 rounded-full" style={{ width: '60%' }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-medium mb-1.5">
                          <span className="text-slate-500">Active Heap Consumption</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{serverStatus.memory.heapUsed}</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: '35%' }}></div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-400 text-xs py-8 text-center font-medium">Gathering physical telemetry...</div>
                  )}
                </div>

                {/* Secure Sandbox/Gateway Overrides */}
                <div className="bg-white dark:bg-slate-900 rounded-[28px] p-6 border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-5">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Integrity Channels Status</h4>
                  
                  <div className="space-y-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <HardDrive className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate">Razorpay Settlement Network</p>
                        <p className="text-[10px] text-slate-400 truncate">{serverStatus?.gateway.mode || "SANDBOX SIMULATOR"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <Database className="w-4 h-4 text-indigo-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate">Cloud Firestore DB Sync</p>
                        <p className="text-[10px] text-emerald-500 font-bold truncate">{serverStatus?.db.status || "CONNECTED"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <Mail className="w-4 h-4 text-indigo-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate">Email Receipts SMTP Relay</p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {serverStatus?.smtp.configured ? `Active SMTP Host: ${serverStatus.smtp.host}` : "Ethereal Sandboxed fallback Node"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Administrative Mail Simulation & Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Trigger System Diagnostic Test Mail */}
                <div className="bg-white dark:bg-slate-900 rounded-[28px] p-6 border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-4">
                  <div>
                    <h4 className="text-sm font-black tracking-tight">Simulate System Alert Dispatches</h4>
                    <p className="text-[10px] text-slate-400 font-medium">Verify SMTP relay dispatch speeds to sandbox recipients.</p>
                  </div>

                  <form onSubmit={handleSendTestEmail} className="space-y-3">
                    <div className="flex gap-2">
                      <input 
                        type="email" 
                        required
                        placeholder="recipient-email@domain.com"
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                        className="flex-1 text-xs px-4 py-3 bg-slate-55 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                      />
                      <button
                        type="submit"
                        disabled={testEmailStatus === 'sending'}
                        className="px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" /> Send
                      </button>
                    </div>

                    {testEmailStatus === 'sending' && (
                      <p className="text-[10px] text-slate-400 animate-pulse font-bold">Relaying diagnostic packet to SMTP nodes...</p>
                    )}

                    {testEmailStatus === 'success' && (
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-xl space-y-2">
                        <p className="text-[10px] font-bold">Diagnostic delivery reported SUCCESS from mail server daemon.</p>
                        {testEmailPreview && (
                          <a 
                            href={testEmailPreview} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex text-[10px] underline font-black hover:text-emerald-700"
                          >
                            Click here to open Sandbox Mail Inbox (Ethereal Preview)
                          </a>
                        )}
                      </div>
                    )}

                    {testEmailStatus === 'error' && (
                      <p className="text-[10px] text-rose-500 font-bold">Relay rejected packet. Check SMTP node configurations.</p>
                    )}
                  </form>
                </div>

                {/* Manual Server Commands */}
                <div className="bg-white dark:bg-slate-900 rounded-[28px] p-6 border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-4 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-black tracking-tight">Manual Host Control Operations</h4>
                    <p className="text-[10px] text-slate-400 font-medium">Interact directly with the server container runtime buffers.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={handleClearLogs}
                      className="py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all border border-slate-200 dark:border-slate-700 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4 text-rose-500" /> Purge Logs Buffer
                    </button>

                    <button
                      onClick={() => {
                        console.log(`[INFRASTRUCTURE OVERRIDE] Manual garbage collection override requested by admin admin-id-rohit.`);
                        fetchServerStatus();
                      }}
                      className="py-3 bg-indigo-50/50 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:hover:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all border border-indigo-150 dark:border-indigo-900 cursor-pointer"
                    >
                      <Cpu className="w-4 h-4" /> Garbage Collection
                    </button>
                  </div>
                </div>

              </div>

              {/* Server Live Console Terminal */}
              <div className="bg-[#0b0f19] rounded-[32px] border border-slate-800 p-6 md:p-8 space-y-4 font-mono shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full filter blur-[100px] pointer-events-none"></div>
                
                <div className="flex items-center justify-between border-b border-slate-850 pb-4 relative z-10">
                  <div className="flex items-center gap-2.5">
                    <TerminalIcon className="w-5 h-5 text-indigo-400" />
                    <span className="text-xs font-black tracking-wider text-slate-300">SERVER CONSOLE LOG STREAM</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black">STREAM ACTIVE</span>
                  </div>
                </div>

                <div className="h-64 overflow-y-auto bg-slate-950/80 p-4 rounded-2xl border border-slate-900 space-y-2 text-xs select-text relative z-10 font-mono">
                  {serverStatus?.logs && serverStatus.logs.length > 0 ? (
                    serverStatus.logs.map((log, index) => {
                      let color = "text-slate-300";
                      if (log.includes("[WARN]")) color = "text-amber-400 font-bold";
                      else if (log.includes("[ERROR]")) color = "text-rose-400 font-bold";
                      else if (log.includes("[SUCCESS]")) color = "text-emerald-400 font-bold";
                      else if (log.includes("24/7 CLOUD GATEWAY")) color = "text-indigo-300/80 font-medium";
                      
                      return (
                        <div key={index} className={`whitespace-pre-wrap leading-relaxed border-l-2 pl-3 py-0.5 border-slate-800 hover:border-indigo-500/40 transition-colors ${color}`}>
                          {log}
                        </div>
                      );
                    })
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2 py-10">
                      <Activity className="w-8 h-8 animate-pulse text-indigo-400/50" />
                      <p className="text-[11px] font-black uppercase tracking-wider">Listening for server telemetry packets...</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 text-[10px] text-slate-400">
                  <span>Buffered logs limit: 100 entries</span>
                  <span className="text-slate-500">Authorized Session: {serverStatus?.db.firestoreId ? "ADMIN_MASTER" : "ADMIN_MOCK"}</span>
                </div>
              </div>

            </motion.div>
          )}

          {activeTab === 'open_banking_sandbox' && (
            <motion.div
              key="open_banking_sandbox"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-8 text-slate-800 dark:text-slate-100"
            >
              {/* Controls and Subnavigation */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-[28px] border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-950/40 rounded-xl flex items-center justify-center border border-emerald-200 dark:border-emerald-900/30">
                    <Layers className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm tracking-tight text-slate-900 dark:text-white">API Framework Explorer</h3>
                    <p className="text-[10px] text-slate-400 font-sans">Plaid/Setu Open Banking adapter & JWS compliance simulator</p>
                  </div>
                </div>

                <div className="flex bg-slate-100 dark:bg-slate-850 p-1 rounded-xl">
                  <button
                    onClick={() => setActiveSubTab('playground')}
                    className={`px-4 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                      activeSubTab === 'playground'
                        ? 'bg-white dark:bg-slate-750 text-indigo-600 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    API Playground
                  </button>
                  <button
                    onClick={() => setActiveSubTab('architecture')}
                    className={`px-4 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                      activeSubTab === 'architecture'
                        ? 'bg-white dark:bg-slate-750 text-indigo-600 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    Architecture Blueprint
                  </button>
                  <button
                    onClick={() => setActiveSubTab('code_snippets')}
                    className={`px-4 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                      activeSubTab === 'code_snippets'
                        ? 'bg-white dark:bg-slate-750 text-indigo-600 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    Code Boilerplate Snippets
                  </button>
                </div>
              </div>

              {/* 1. API Playground Tab */}
              {activeSubTab === 'playground' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Steps Form (Left) */}
                  <div className="lg:col-span-7 space-y-6">
                    {/* Step 1 */}
                    <div className="bg-white dark:bg-slate-900 rounded-[28px] border border-slate-200 dark:border-slate-800 p-6 space-y-4 relative overflow-hidden">
                      <div className="absolute top-0 right-0 text-[80px] font-black text-slate-100 dark:text-slate-800/10 select-none leading-none -mr-4 -mt-4">1</div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-xs">1</span>
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">Device binding & SMS Verification</h4>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium">Binds the hardware fingerprints to the client's phone number on the central auth directory.</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-[9px] uppercase font-black text-slate-400">Phone Number</label>
                          <input
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] uppercase font-black text-slate-400">Device ID</label>
                          <input
                            type="text"
                            value={deviceId}
                            onChange={(e) => setDeviceId(e.target.value)}
                            className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] uppercase font-black text-slate-400">Hardware Fingerprint</label>
                          <input
                            type="text"
                            value={fingerprint}
                            onChange={(e) => setFingerprint(e.target.value)}
                            className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          onClick={handleDeviceBinding}
                          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Smartphone className="w-4 h-4" /> BIND DEVICE TOKEN
                        </button>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="bg-white dark:bg-slate-900 rounded-[28px] border border-slate-200 dark:border-slate-800 p-6 space-y-4 relative overflow-hidden">
                      <div className="absolute top-0 right-0 text-[80px] font-black text-slate-100 dark:text-slate-800/10 select-none leading-none -mr-4 -mt-4">2</div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-xs">2</span>
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">Bank Account Fetching</h4>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium">Discovers existing banking profiles tied with the verified bindingToken via open banking APIs.</p>
                      
                      <div>
                        <label className="text-[9px] uppercase font-black text-slate-400">Active Binding Token (Generated from Step 1)</label>
                        <input
                          type="text"
                          readOnly
                          value={bindingToken || "Please bind device token to generate binding string..."}
                          className="w-full mt-1 px-3 py-2 bg-slate-100 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-xs focus:outline-none select-all"
                        />
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          onClick={handleLinkBanks}
                          disabled={!bindingToken}
                          className={`px-4 py-2.5 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                            bindingToken 
                              ? "bg-indigo-600 hover:bg-indigo-700 text-white" 
                              : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"
                          }`}
                        >
                          <Building2 className="w-4 h-4" /> FETCH & LINK ACCOUNTS
                        </button>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="bg-white dark:bg-slate-900 rounded-[28px] border border-slate-200 dark:border-slate-800 p-6 space-y-4 relative overflow-hidden">
                      <div className="absolute top-0 right-0 text-[80px] font-black text-slate-100 dark:text-slate-800/10 select-none leading-none -mr-4 -mt-4">3</div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-xs">3</span>
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">Real-time Balance Check (Asynchronous)</h4>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium font-sans">Pulls account balance asynchronously by handling the 202-polling flow compliant with banking switches.</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans">
                        <div>
                          <label className="text-[9px] uppercase font-black text-slate-400">Linked Bank Accounts</label>
                          <select
                            value={selectedAccountId}
                            onChange={(e) => setSelectedAccountId(e.target.value)}
                            disabled={linkedAccounts.length === 0}
                            className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 font-bold text-xs focus:outline-none"
                          >
                            {linkedAccounts.length === 0 ? (
                              <option>Please fetch bank accounts from Step 2 first...</option>
                            ) : (
                              linkedAccounts.map((acc: any) => (
                                <option key={acc.accountId} value={acc.accountId}>{acc.bankName} (A/C: ...{acc.accountNo.slice(-4)})</option>
                              ))
                            )}
                          </select>
                        </div>
                        <div>
                          <label className="text-[9px] uppercase font-black text-slate-400">Enter Security PIN (M-PIN)</label>
                          <input
                            type="password"
                            maxLength={4}
                            value={securityPIN}
                            onChange={(e) => setSecurityPIN(e.target.value)}
                            className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      {isPolling && (
                        <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200/50 dark:border-slate-800 space-y-3">
                          <div className="flex justify-between items-center text-[10px] font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                            <span className="flex items-center gap-1.5">
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              {pollingStatusText}
                            </span>
                            <span>{pollingProgress}% Resolved</span>
                          </div>
                          <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-300"
                              style={{ width: `${pollingProgress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {checkedBalance !== null && (
                        <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                            <div>
                              <p className="text-[10px] font-extrabold uppercase tracking-widest leading-none">REAL-TIME BALANCE RESOLVED</p>
                              <p className="text-[10px] mt-1 font-medium text-slate-400">Account decrypted successfully through secure Switch node.</p>
                            </div>
                          </div>
                          <p className="text-xl font-sans font-black">₹{checkedBalance.toLocaleString('en-IN')}</p>
                        </div>
                      )}

                      <div className="flex justify-end pt-2">
                        <button
                          onClick={handleCheckBalance}
                          disabled={!selectedAccountId || isPolling}
                          className={`px-4 py-2.5 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                            selectedAccountId && !isPolling
                              ? "bg-indigo-600 hover:bg-indigo-700 text-white" 
                              : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"
                          }`}
                        >
                          <Lock className="w-4 h-4" /> CHECK SECURE BALANCE
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Terminal Console (Right) */}
                  <div className="lg:col-span-5 flex flex-col h-full justify-between">
                    <div className="bg-[#0b0f19] rounded-[32px] border border-slate-800 p-6 flex flex-col h-full space-y-4 font-mono shadow-2xl relative overflow-hidden min-h-[500px]">
                      <div className="absolute top-0 right-0 w-60 h-60 bg-emerald-500/5 rounded-full filter blur-[80px] pointer-events-none"></div>
                      
                      <div className="flex items-center justify-between border-b border-slate-850 pb-4 relative z-10">
                        <div className="flex items-center gap-2">
                          <TerminalIcon className="w-4 h-4 text-emerald-400" />
                          <span className="text-[10px] font-black tracking-wider text-slate-300">OPEN BANKING CRYPTO TELEMETRY</span>
                        </div>
                        <button 
                          onClick={() => setObLogs(["System reset. Handshake telemetry logs cleared."])}
                          className="p-1 hover:bg-slate-800 rounded text-slate-400 text-[9px] font-black cursor-pointer"
                        >
                          CLEAR
                        </button>
                      </div>

                      <div className="flex-1 overflow-y-auto max-h-[460px] space-y-2.5 text-[11px] select-text relative z-10 pr-2">
                        {obLogs.map((log, index) => {
                          let color = "text-slate-300";
                          if (log.startsWith("[")) {
                            if (log.includes("[Error]")) color = "text-rose-400 font-black";
                            else if (log.includes("[Success]")) color = "text-emerald-400 font-black";
                            else if (log.includes("[1. Handshake]")) color = "text-indigo-300 font-bold";
                            else if (log.includes("[2. Account Fetching]")) color = "text-amber-300 font-bold";
                            else if (log.includes("[3. Balance Retrieval]")) color = "text-sky-300 font-bold";
                            else if (log.includes("[Secure Shield]")) color = "text-indigo-400 font-extrabold";
                            else if (log.includes("[Vault Storage]")) color = "text-teal-400 font-medium";
                          }
                          return (
                            <div key={index} className={`whitespace-pre-wrap leading-relaxed border-l border-slate-800/60 pl-2.5 py-0.5 ${color}`}>
                              {log}
                            </div>
                          );
                        })}
                      </div>

                      <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-[9px] text-slate-500 font-bold">
                        <span>HMAC ALGORITHM: HMAC-SHA256</span>
                        <span>RBI & PCI-DSS V4.0 COMPLIANT</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. Architecture Blueprint */}
              {activeSubTab === 'architecture' && (
                <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 p-8 space-y-8">
                  <div>
                    <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white mb-2">Microservices Open Banking Schematic</h3>
                    <p className="text-xs text-slate-400">Cryptographically secure signed communication tunnel for payment gateways compliance.</p>
                  </div>

                  {/* SVG Map Schematic */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-850 flex items-center justify-center">
                    <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-5 gap-4 relative">
                      {/* Node 1 */}
                      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center space-y-2 z-10">
                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-950 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                          <Smartphone className="w-5 h-5" />
                        </div>
                        <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">1. Client Device</h4>
                        <p className="text-[9px] text-slate-400 leading-snug">Generates payload, appends signed JWS checksum, timestamp, and device finger.</p>
                      </div>

                      {/* Node 2 */}
                      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center space-y-2 z-10">
                        <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-950 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                          <Lock className="w-5 h-5" />
                        </div>
                        <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">2. JWS Gateway</h4>
                        <p className="text-[9px] text-slate-400 leading-snug">Verifies signature, prevents replay drift, sanitizes inputs, enforces rate limiting.</p>
                      </div>

                      {/* Node 3 */}
                      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center space-y-2 z-10">
                        <div className="w-10 h-10 bg-amber-100 dark:bg-amber-950 rounded-lg flex items-center justify-center text-amber-600 dark:text-amber-400">
                          <Layers className="w-5 h-5" />
                        </div>
                        <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">3. Plaid Broker</h4>
                        <p className="text-[9px] text-slate-400 leading-snug">Identifies routing tables. Discovers user profile tokens matching binding standards.</p>
                      </div>

                      {/* Node 4 */}
                      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center space-y-2 z-10">
                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-950 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                          <Cpu className="w-5 h-5" />
                        </div>
                        <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">4. NPCI / Switch</h4>
                        <p className="text-[9px] text-slate-400 leading-snug">Translates packet to ISO-8583 banking protocol. Allocates async query requestId.</p>
                      </div>

                      {/* Node 5 */}
                      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center space-y-2 z-10">
                        <div className="w-10 h-10 bg-rose-100 dark:bg-rose-950 rounded-lg flex items-center justify-center text-rose-600 dark:text-rose-400">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">5. Banking Core</h4>
                        <p className="text-[9px] text-slate-400 leading-snug">Validates MPIN block. Settles ledger balances securely inside hardware modules.</p>
                      </div>
                    </div>
                  </div>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                    <div className="p-5 bg-indigo-50/40 dark:bg-slate-800/40 rounded-2xl border border-indigo-100/50 dark:border-slate-800 space-y-2">
                      <h4 className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Anti-Tamper Signature</h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed">By computing the HMAC-SHA256 signature from combination of `timestamp + idempotencyKey + requestBody`, the transit packet is rendered fully immune to content tampering.</p>
                    </div>

                    <div className="p-5 bg-emerald-50/40 dark:bg-slate-800/40 rounded-2xl border border-emerald-100/50 dark:border-slate-800 space-y-2">
                      <h4 className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Drift & Replay Protection</h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed">The server enforces a strict time-window limit on request headers. If the drift between server local time and the request timestamp exceeds 5 minutes, it is instantly rejected.</p>
                    </div>

                    <div className="p-5 bg-amber-50/40 dark:bg-slate-800/40 rounded-2xl border border-amber-100/50 dark:border-slate-800 space-y-2">
                      <h4 className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 font-sans">Asynchronous Switch Handshake</h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-sans">Core banking balance queries cannot block API gateway workers. The 202 Accepted status registers a request identifier, pushing the workload to asynchronous polling channels.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Code Snippets */}
              {activeSubTab === 'code_snippets' && (
                <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 p-8 space-y-6">
                  <div>
                    <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white mb-1">Boilerplate Implementation Snippets</h3>
                    <p className="text-xs text-slate-400">Production-ready, compliant architecture code blocks for Fintech Architects.</p>
                  </div>

                  <div className="space-y-6">
                    {/* Backend implementation */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">1. Node.js & Express Cryptographic Signature Verification Middleware</h4>
                        <span className="text-[10px] font-mono font-bold bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 px-2 py-0.5 rounded">backend/middleware/auth.ts</span>
                      </div>
                      <div className="bg-[#0b0f19] p-5 rounded-2xl text-[11px] font-mono text-slate-300 border border-slate-800 overflow-x-auto whitespace-pre">
{`import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

const SHARED_HMAC_SECRET = process.env.UPI_GATEWAY_HMAC_SECRET || "YOUR_SECRET";

export const validateUPIHeaders = (req: Request, res: Response, next: NextFunction) => {
  const signature = req.headers['x-jws-signature'] as string;
  const clientId = req.headers['x-client-id'] as string;
  const timestamp = req.headers['x-timestamp'] as string;
  const idempotencyKey = req.headers['x-idempotency-key'] as string;

  if (!signature || !clientId || !timestamp) {
    return res.status(401).json({ error: "UNAUTHORIZED", reason: "Missing JWS signature headers." });
  }

  // Prevents Replay Attacks by enforcing a maximum clock drift of 5 minutes
  const drift = Math.abs(Date.now() - parseInt(timestamp));
  if (drift > 300000) {
    return res.status(401).json({ error: "EXPIRED_SIGNATURE", reason: "Request timestamp drift is too high." });
  }

  // Re-calculate hash to ensure absolute data integrity
  const bodyString = typeof req.body === 'object' ? JSON.stringify(req.body) : (req.body || "");
  const expectedText = \`\${timestamp}.\text{\${idempotencyKey || ""}}.\${bodyString}\`;
  
  const computedSignature = crypto
    .createHmac("sha256", SHARED_HMAC_SECRET)
    .update(expectedText)
    .digest("hex");

  if (signature !== computedSignature) {
    return res.status(403).json({ error: "FORBIDDEN", reason: "Signature mismatch. Tampering detected." });
  }

  next();
};`}
                      </div>
                    </div>

                    {/* Frontend implementation */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">2. Client-Side Polling State Management Hooks (React Native / Flutter snippet)</h4>
                        <span className="text-[10px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 px-2 py-0.5 rounded">client/hooks/useBalancePolling.ts</span>
                      </div>
                      <div className="bg-[#0b0f19] p-5 rounded-2xl text-[11px] font-mono text-slate-300 border border-slate-800 overflow-x-auto whitespace-pre">
{`import React, { useState, useEffect } from 'react';

export const useBalancePolling = (accountId: string, securityPin: string) => {
  const [balance, setBalance] = useState<number | null>(null);
  const [status, setStatus] = useState<'IDLE' | 'PENDING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [progress, setProgress] = useState(0);

  const fetchBalanceAsync = async () => {
    setStatus('PENDING');
    setProgress(0);

    try {
      // 1. Send the initial query (Returns 202 ACCEPTED with Poll URL & RequestId)
      const res = await fetch('/api/v1/banks/balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-jws-signature': 'ComputedSignatureFromBrowserOrAppCredentials'
        },
        body: JSON.stringify({ accountId, securityPin })
      });

      if (res.status === 202) {
        const { pollUrl, requestId } = await res.json();
        
        // 2. Start the Polling Loop
        let attempts = 0;
        const interval = setInterval(async () => {
          attempts++;
          const pollRes = await fetch(\`/api/v1/banks/balance/poll/\${requestId}\`);
          
          if (pollRes.ok) {
            const pollData = await pollRes.json();
            setProgress(pollData.progress || 0);

            if (pollData.status === 'SUCCESS') {
              clearInterval(interval);
              setBalance(pollData.balance);
              setStatus('SUCCESS');
            }
          }

          if (attempts >= 10) { // Timeout safety threshold
            clearInterval(interval);
            setStatus('ERROR');
          }
        }, 1200);

      } else {
        setStatus('ERROR');
      }
    } catch (err) {
      setStatus('ERROR');
    }
  };

  return { balance, status, progress, fetchBalanceAsync };
};`}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'vibe_ai_core' && (
            <motion.div
              key="vibe_ai_core"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm text-left space-y-6"
            >
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-indigo-500 animate-pulse" /> AI Ambient Vibe Controls (Merchant Server Mode)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Configure live NLP theme processing models, toggle live vibe predictions, or run manual analysis diagnostics on payer's notes.
                </p>
              </div>

              {/* AUTOMATIC MOOD PREDICTION TOGGLE */}
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="relative flex h-2.5 w-2.5 mt-1 shrink-0">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${autoPredictMood ? 'bg-emerald-400' : 'bg-slate-400'}`}></span>
                    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${autoPredictMood ? 'bg-emerald-500' : 'bg-slate-500'}`}></span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      Live Vibe-Sensing Prediction Model
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-550 font-bold mt-0.5 leading-relaxed">
                      When active, SwiftPay server automatically intercepts payment notes or manual inputs to update client visual interface.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAutoPredictMood(!autoPredictMood);
                    trackAction(`Toggled Auto-Predict Mood to ${!autoPredictMood} from Admin`);
                    triggerVibe('success');
                  }}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border select-none shrink-0 ${
                    autoPredictMood
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                      : 'bg-slate-200 border-slate-300 text-slate-600 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-500'
                  }`}
                >
                  {autoPredictMood ? "● ACTIVE (SERVER ENABLED)" : "○ DISABLED (MANUAL MODE)"}
                </button>
              </div>

              {/* Input Form for Predicting Mood */}
              <div className="border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl space-y-4 bg-white dark:bg-slate-900/50">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-250">
                      NLP Semantic Analyzer Sandbox
                    </span>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-0.5">
                      Submit live user inputs to the natural language classification node.
                    </p>
                  </div>
                  <span className="text-[9px] font-black text-slate-400 dark:text-slate-505 uppercase border border-slate-100 dark:border-slate-800 px-2 py-1 rounded-lg">
                    Gemini API L4 Model
                  </span>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handlePredictMood(moodInput);
                  }}
                  className="flex gap-2.5"
                >
                  <input
                    type="text"
                    placeholder="Enter manual text to dry-run prediction (e.g., 'so stressed, need a spa day')"
                    value={moodInput}
                    onChange={(e) => setMoodInput(e.target.value)}
                    disabled={isAnalyzingMood}
                    className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-60 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={isAnalyzingMood || !moodInput.trim()}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-250 dark:disabled:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    {isAnalyzingMood ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <span>Run Sandbox NLP</span>
                    )}
                  </button>
                </form>

                {userMood !== 'default' && (
                  <div className="p-4 bg-indigo-50/40 dark:bg-slate-950/40 rounded-2xl border border-indigo-100/30 dark:border-slate-800/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="text-left space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-550">
                        Latest Prediction Signature
                      </p>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-250 italic">
                        "{userMoodDetails?.explanation || 'Active custom vibe override'}"
                      </h4>
                      <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                        Advice response string: {userMoodDetails?.advice}
                      </p>
                    </div>
                    <span className="shrink-0 text-[10px] font-black px-3 py-1 rounded-full uppercase border shadow-inner bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border-indigo-250/30">
                      Vibe: {userMood}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'security_overview' && (
            <motion.div
              key="security_overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-8"
            >
              <div className="bg-white dark:bg-slate-900 rounded-[28px] p-6 sm:p-8 border border-slate-200 dark:border-slate-800/80 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-amber-50 dark:bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-100 dark:border-amber-500/20 shadow-inner">
                    <BarChart3 className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">Security Overview</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-0.5">Daily login trends and security alerts triggered over the last 7 days</p>
                  </div>
                </div>

                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={SECURITY_OVERVIEW_DATA} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.3} />
                      <XAxis 
                        dataKey="day" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#64748b', fontSize: 12, fontWeight: 'bold' }} 
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#64748b', fontSize: 12, fontWeight: 'bold' }} 
                        dx={-10}
                      />
                      <RechartsTooltip 
                        contentStyle={{ 
                          backgroundColor: '#0f172a', 
                          border: '1px solid #1e293b',
                          borderRadius: '12px',
                          color: '#f8fafc',
                          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
                        }}
                        cursor={{ fill: '#1e293b', opacity: 0.4 }}
                      />
                      <Legend 
                        iconType="circle"
                        wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 'bold' }}
                      />
                      <Bar 
                        dataKey="logins" 
                        name="Successful Logins" 
                        fill="#6366f1" 
                        radius={[4, 4, 0, 0]} 
                        barSize={32}
                      />
                      <Bar 
                        dataKey="alerts" 
                        name="Security Alerts" 
                        fill="#f43f5e" 
                        radius={[4, 4, 0, 0]} 
                        barSize={32}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'feedback' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">User Feedback & Feature Requests</h3>
                  <p className="text-slate-400 text-sm">Direct feedback submitted by SwiftPay users.</p>
                </div>
              </div>

              {feedbacks.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <MessageSquare className="w-8 h-8 text-slate-500" />
                  </div>
                  <h4 className="text-white font-bold mb-2">No feedback yet</h4>
                  <p className="text-slate-500 text-sm max-w-sm">
                    When users submit feedback through the gateway, it will appear here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {feedbacks.map((item) => {
                    // Simple categorization based on keywords
                    const isBug = /bug|error|broken|fail|issue|crash|not working/i.test(item.text);
                    const isFeature = /feature|add|new|want|need|wish/i.test(item.text);
                    let badgeColor = "bg-slate-500/10 text-slate-400 border-slate-500/20";
                    let badgeText = "General";
                    
                    if (isBug) {
                      badgeColor = "bg-red-500/10 text-red-400 border-red-500/20";
                      badgeText = "Bug Report";
                    } else if (isFeature) {
                      badgeColor = "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
                      badgeText = "Feature Request";
                    }

                    return (
                      <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors relative group">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
                              <span className="text-slate-400 text-sm font-bold">{item.user[0]?.toUpperCase() || 'A'}</span>
                            </div>
                            <div>
                              <p className="text-slate-300 text-sm font-medium">{item.user}</p>
                              <p className="text-slate-500 text-xs">{new Date(item.date).toLocaleString()}</p>
                            </div>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${badgeColor}`}>
                            {badgeText}
                          </span>
                        </div>
                        
                        <div className="bg-slate-950 rounded-lg p-4 text-slate-300 text-sm border border-slate-900 leading-relaxed">
                          {item.text}
                        </div>
                        
                        <button 
                          onClick={() => deleteFeedback(item.id)}
                          className="absolute top-4 right-4 p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                          title="Delete Feedback"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'app_optimization' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">System Auto-Optimization</h3>
                  <p className="text-slate-400 text-sm">Safely optimize app performance without disrupting user experience.</p>
                </div>
                <button
                  onClick={startOptimization}
                  disabled={optStatus === 'running'}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-bold transition-all flex items-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  {optStatus === 'running' ? 'Optimizing...' : 'Run Optimization'}
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-4">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-indigo-400" />
                      Safety Guarantees
                    </h4>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2 text-sm text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span><strong>Zero Data Loss:</strong> Active transactions and user data are never touched.</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span><strong>Background Execution:</strong> Runs asynchronously without freezing the UI.</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span><strong>Rollback Ready:</strong> Snapshots are taken before major state re-indexing.</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                     <h4 className="text-white font-bold mb-4">Performance Impact</h4>
                     <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-400">Memory Usage</span>
                            <span className="text-emerald-400">-34% expected</span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-1.5">
                            <div className="bg-indigo-500 h-1.5 rounded-full w-[60%]"></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-400">Cold Start Time</span>
                            <span className="text-emerald-400">-1.2s expected</span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-1.5">
                            <div className="bg-blue-500 h-1.5 rounded-full w-[40%]"></div>
                          </div>
                        </div>
                     </div>
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 h-full font-mono relative overflow-hidden">
                    {optStatus !== 'idle' && (
                      <div className="absolute top-0 left-0 w-full h-1 bg-slate-800">
                        <div 
                          className="h-full bg-indigo-500 transition-all duration-300"
                          style={{ width: `${optProgress}%` }}
                        />
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-4">
                      <div className="flex items-center gap-2 text-indigo-400">
                        <TerminalIcon className="w-5 h-5" />
                        <span className="font-bold">Optimization Protocol Log</span>
                      </div>
                      <span className="text-slate-500 text-xs">STATUS: {optStatus.toUpperCase()}</span>
                    </div>

                    <div className="space-y-2 h-[300px] overflow-y-auto text-xs">
                      {optLogs.length === 0 ? (
                         <div className="text-slate-600 italic h-full flex items-center justify-center">
                           System standing by for optimization...
                         </div>
                      ) : (
                        optLogs.map((log, i) => (
                          <div key={i} className="flex gap-3">
                            <span className="text-slate-600 shrink-0">[{new Date().toLocaleTimeString()}]</span>
                            <span className={
                              log.includes('complete') ? 'text-emerald-400 font-bold' :
                              log.includes('Starting') ? 'text-indigo-400 font-bold' :
                              'text-slate-300'
                            }>{log}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'customer_audit_support' && (            <motion.div
              key="customer_audit_support"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-8 text-left"
            >
              {/* GLOBAL SECURITY CONTROLS */}
              <div className="bg-rose-50 dark:bg-rose-950/20 rounded-[28px] p-6 border border-rose-200 dark:border-rose-900/50 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-rose-800 dark:text-rose-400 flex items-center gap-2">
                      <Ban className="w-5 h-5" />
                      Global Security Enforcement
                    </h3>
                    <p className="text-xs text-rose-600 dark:text-rose-500 font-bold mt-1 max-w-xl">
                      Emergency protocols. Use these controls only during active, coordinated cyber-attacks or critical vulnerabilities.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        toast.success("All active user sessions have been terminated.");
                        addDoc(collection(db, 'security_events'), {
                          type: "GLOBAL_SESSION_REVOKE",
                          details: "Admin globally revoked all active customer sessions.",
                          severity: "critical",
                          timestamp: serverTimestamp()
                        });
                      }}
                      className="px-4 py-2.5 bg-rose-100 hover:bg-rose-200 dark:bg-rose-900/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-black uppercase tracking-wider transition-colors border border-rose-200 dark:border-rose-800/50"
                    >
                      Revoke All Sessions
                    </button>
                    <button
                      onClick={() => {
                        toast.error("System Lockdown Initiated! All transactions blocked.");
                        addDoc(collection(db, 'security_events'), {
                          type: "SYSTEM_LOCKDOWN",
                          details: "Admin initiated global emergency lockdown mode.",
                          severity: "critical",
                          timestamp: serverTimestamp()
                        });
                      }}
                      className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg hover:shadow-rose-500/20 transition-all flex items-center gap-2"
                    >
                      <Lock className="w-4 h-4" /> Initiate Lockdown
                    </button>
                  </div>
                </div>
              </div>

              {/* 1. BANK ACCOUNT VERIFICATION MODERATION HUB */}
              <div className="bg-white dark:bg-slate-900 rounded-[28px] p-6 border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-2">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-850 dark:text-slate-200 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-emerald-500" />
                      NPCI Node Bank Linkage Moderation
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                      Verify, approve, or suspend linked customer bank accounts under compliance safeguards.
                    </p>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Mode: {bankVerificationMode}
                  </span>
                </div>

                {(!globalLinkedAccounts || globalLinkedAccounts.length === 0) ? (
                  <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500 font-bold">
                    No active bank account connections reported on this server instance yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800 text-[9.5px] uppercase font-black text-slate-400 tracking-wider">
                          <th className="py-3 px-4">Bank & IFSC</th>
                          <th className="py-3 px-4">Account Number</th>
                          <th className="py-3 px-4">Holder Name</th>
                          <th className="py-3 px-4">Balance</th>
                          <th className="py-3 px-4">Verification Status</th>
                          <th className="py-3 px-4 text-right">Moderator Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {globalLinkedAccounts.map((acc) => (
                          <tr key={acc.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-950/20 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-slate-800 dark:text-slate-200">{acc.bankName}</div>
                              <div className="text-[10px] font-mono text-indigo-500">{acc.ifscCode}</div>
                            </td>
                            <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400 font-bold">
                              {acc.accountNo}
                            </td>
                            <td className="py-3.5 px-4 font-bold text-slate-700 dark:text-slate-300">
                              {acc.accountHolderName}
                            </td>
                            <td className="py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-slate-100">
                              ₹{parseFloat(acc.balance).toLocaleString('en-IN')}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase px-2.5 py-1 rounded-full border ${
                                acc.status === 'ACTIVE' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                                acc.status === 'PENDING' ? "bg-amber-500/10 text-amber-600 border-amber-500/20 animate-pulse" :
                                "bg-rose-500/10 text-rose-600 border-rose-500/20"
                              }`}>
                                {acc.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right space-x-1.5">
                              {acc.status === 'PENDING' && (
                                <>
                                  <button
                                    onClick={() => {
                                      const updated = globalLinkedAccounts.map(a => a.id === acc.id ? { ...a, status: 'ACTIVE' } : a);
                                      if (setGlobalLinkedAccounts) setGlobalLinkedAccounts(updated);
                                    }}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[9.5px] font-black uppercase transition cursor-pointer"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => {
                                      const updated = globalLinkedAccounts.map(a => a.id === acc.id ? { ...a, status: 'REJECTED' } : a);
                                      if (setGlobalLinkedAccounts) setGlobalLinkedAccounts(updated);
                                    }}
                                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[9.5px] font-black uppercase transition cursor-pointer"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                              {acc.status === 'ACTIVE' && (
                                <button
                                  onClick={() => {
                                    const updated = globalLinkedAccounts.map(a => a.id === acc.id ? { ...a, status: 'REJECTED' } : a);
                                    if (setGlobalLinkedAccounts) setGlobalLinkedAccounts(updated);
                                  }}
                                  className="px-2.5 py-1 bg-rose-900/40 hover:bg-rose-900 text-rose-200 border border-rose-500/20 rounded-lg text-[9.5px] font-black uppercase transition cursor-pointer"
                                >
                                  Block Node
                                </button>
                              )}
                              {acc.status === 'REJECTED' && (
                                <button
                                  onClick={() => {
                                    const updated = globalLinkedAccounts.map(a => a.id === acc.id ? { ...a, status: 'ACTIVE' } : a);
                                    if (setGlobalLinkedAccounts) setGlobalLinkedAccounts(updated);
                                  }}
                                  className="px-2.5 py-1 bg-indigo-600/40 hover:bg-indigo-600 text-indigo-200 border border-indigo-500/20 rounded-lg text-[9.5px] font-black uppercase transition cursor-pointer"
                                >
                                  Reactivate
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* 2. REAL-TIME USER LOGIN ACTIVITY TRAIL */}
              <div className="bg-white dark:bg-slate-900 rounded-[28px] p-6 border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-5">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-850 dark:text-slate-200 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-rose-500 animate-pulse" />
                    Customer Authentications & Login Audit logs
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                    Live system logging of customer sessions, including name, physical location address, date, time, status, and IP.
                  </p>
                </div>

                {userLoginLogs.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500 font-bold">
                    No customer login events recorded on this session yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800 text-[9.5px] uppercase font-black text-slate-400 tracking-wider">
                          <th className="py-3 px-4">Customer Name</th>
                          <th className="py-3 px-4">UPI/VPA Address</th>
                          <th className="py-3 px-4">Physical Region / Address</th>
                          <th className="py-3 px-4">Date & Time</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4">IP Address</th>
                          <th className="py-3 px-4">Terminal Client</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {userLoginLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-950/20 transition-colors">
                            <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                              {log.name}
                            </td>
                            <td className="py-3 px-4 font-mono text-slate-500">
                              {log.upi}
                            </td>
                            <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-semibold">
                              {log.address}
                            </td>
                            <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-bold">
                              <div>{log.dateString}</div>
                              <div className="text-[10px] text-slate-400 font-medium font-mono">{log.timeString}</div>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center gap-1 text-[8.5px] font-black px-2 py-0.5 rounded uppercase border ${
                                log.status === 'SUCCESS' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                              }`}>
                                {log.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono text-[10.5px] text-slate-500">
                              {log.ip}
                            </td>
                            <td className="py-3 px-4 text-[10px] text-slate-400 font-semibold truncate max-w-[120px]" title={log.device}>
                              {log.device}
                            </td>
                            <td className="py-3 px-4 text-right flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  toast.success(`Session terminated for ${log.name}`);
                                  // Log the action
                                  addDoc(collection(db, 'security_events'), {
                                    type: "SESSION_TERMINATED",
                                    details: `Admin remotely terminated session for user ${log.name} (${log.upi}).`,
                                    severity: "high",
                                    timestamp: serverTimestamp()
                                  });
                                }}
                                className="text-[9px] font-black uppercase bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded transition-colors"
                              >
                                Terminate
                              </button>
                              {blockedUsers.has(log.upi) ? (
                                <span className="text-[9px] font-black uppercase text-rose-500 bg-rose-500/10 px-2 py-1 rounded border border-rose-500/20">Blocked</span>
                              ) : (
                                <button 
                                  onClick={() => handleBlockUser(log.upi, log.name)}
                                  className="text-[9px] font-black uppercase bg-rose-600 hover:bg-rose-500 text-white px-3 py-1.5 rounded transition-colors"
                                >
                                  Block
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* 3. CUSTOMER SUPPORT AND DISPUTE RESOLUTION PORTAL */}
              <div className="bg-white dark:bg-slate-900 rounded-[28px] p-6 border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-5">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-850 dark:text-slate-205 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-indigo-500" />
                    Customer Support Escalation & Ticket Center
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                    Direct real-time communication terminal with linked consumers. Resolve disputes, send replies, or unlock suspended states.
                  </p>
                </div>

                {supportTickets.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500 font-bold">
                    No support tickets received. Customer portal is currently fully synchronized.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {supportTickets.map((ticket) => (
                      <div key={ticket.id} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 space-y-3.5 text-slate-850 dark:text-slate-200">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/50 dark:border-slate-850/50 pb-2.5">
                          <div className="space-y-0.5">
                            <span className="text-[9px] font-black uppercase bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-md">
                              TICKET {ticket.id.slice(-6).toUpperCase()}
                            </span>
                            <div className="text-xs font-bold font-mono mt-1">
                              From: {ticket.payerName} ({ticket.payerUpi})
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[9.5px] font-mono text-slate-400 font-bold">
                              {new Date(ticket.timestamp).toLocaleString()}
                            </span>
                            <span className={`text-[8.5px] font-black uppercase px-2.5 py-0.5 rounded border ${
                              ticket.status === 'OPEN' ? "bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            }`}>
                              {ticket.status}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="text-xs font-black uppercase text-slate-400">Subject / Dispute Category</div>
                          <div className="text-xs font-bold text-slate-800 dark:text-slate-100">{ticket.category}</div>
                          <div className="text-xs text-slate-600 dark:text-slate-350 bg-white dark:bg-slate-950/80 p-3 rounded-xl border border-slate-100 dark:border-slate-800 mt-1.5 leading-relaxed font-medium">
                            {ticket.description}
                          </div>
                        </div>

                        {ticket.adminReply && (
                          <div className="space-y-1 bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-xl text-left">
                            <div className="text-[9px] font-black uppercase text-emerald-400 flex items-center gap-1">
                              <UserCheck className="w-3 h-3" /> Admin Answer Dispatch
                            </div>
                            <p className="text-xs text-slate-700 dark:text-slate-300 italic font-semibold leading-relaxed">
                              "{ticket.adminReply}"
                            </p>
                          </div>
                        )}

                        {ticket.status === 'OPEN' && (
                          <div className="pt-2 flex gap-2">
                            <input
                              type="text"
                              placeholder="Type resolution description or message to user..."
                              value={ticketReplies[ticket.id] || ''}
                              onChange={(e) => setTicketReplies({ ...ticketReplies, [ticket.id]: e.target.value })}
                              className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-850 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                            />
                            <button
                              onClick={async () => {
                                const reply = ticketReplies[ticket.id];
                                if (!reply || !reply.trim()) return;
                                try {
                                  const ticketRef = doc(db, 'support_tickets', ticket.id);
                                  await updateDoc(ticketRef, {
                                    status: 'RESOLVED',
                                    adminReply: reply
                                  });
                                  setTicketReplies({ ...ticketReplies, [ticket.id]: '' });
                                } catch (err) {
                                  console.error("Unable to update support ticket reply:", err);
                                }
                              }}
                              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer"
                            >
                              Dispatch Reply
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 4. SECURITY THREAT DETECTION & INCIDENT LOGS */}
              <div className="bg-white dark:bg-slate-900 rounded-[28px] p-6 border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-2">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-850 dark:text-slate-200 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-rose-500" />
                      Security Threat Detection & Incident Logs
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                      Monitor system-level security events, fraud alerts, and unauthorized access attempts.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-[9.5px] uppercase font-black text-slate-400 tracking-wider">
                        <th className="py-3 px-4">Timestamp</th>
                        <th className="py-3 px-4">Threat Level</th>
                        <th className="py-3 px-4">Event Type</th>
                        <th className="py-3 px-4">Details</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {securityEventsList.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-xs text-slate-400 dark:text-slate-500 font-bold">
                            No security events recorded.
                          </td>
                        </tr>
                      ) : (
                        securityEventsList.map((event) => (
                          <tr key={event.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-950/20 transition-colors">
                            <td className="py-3 px-4 font-mono text-slate-500 text-[10px]">
                              {event.timestamp ? (typeof event.timestamp.toDate === 'function' ? event.timestamp.toDate().toLocaleString() : new Date(event.timestamp).toLocaleString()) : new Date().toLocaleString()}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center gap-1 text-[8.5px] font-black px-2 py-0.5 rounded uppercase border ${
                                event.severity === 'critical' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 
                                event.severity === 'high' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                                'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
                              }`}>
                                {event.severity || 'INFO'}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                              {event.type}
                            </td>
                            <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                              {event.details}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button className="text-[9px] font-black uppercase bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded transition-colors">
                                Investigate
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

    </div>
  );
}
