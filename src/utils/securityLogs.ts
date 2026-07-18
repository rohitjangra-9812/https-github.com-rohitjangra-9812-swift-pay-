export interface SecurityLog {
  id: string;
  type: 'LOGIN_SUCCESS' | 'PIN_FAILED' | 'BIOMETRIC_FAILED' | 'TRANSACTION_SUCCESS' | 'TRANSACTION_FAILED' | 'SECURITY_ALERT';
  message: string;
  timestamp: number;
}

export const logSecurityEvent = (type: SecurityLog['type'], message: string) => {
  try {
    const logsStr = localStorage.getItem('swiftpay_security_logs');
    const logs: SecurityLog[] = logsStr ? JSON.parse(logsStr) : [];
    
    logs.unshift({
      id: Math.random().toString(36).substring(2, 9),
      type,
      message,
      timestamp: Date.now()
    });
    
    // Keep last 100 logs
    if (logs.length > 100) {
      logs.length = 100;
    }
    
    localStorage.setItem('swiftpay_security_logs', JSON.stringify(logs));
    window.dispatchEvent(new Event('security_log_added'));
  } catch (e) {
    console.error("Failed to save security log", e);
  }
};

export const getSecurityLogs = (): SecurityLog[] => {
  try {
    const logsStr = localStorage.getItem('swiftpay_security_logs');
    return logsStr ? JSON.parse(logsStr) : [];
  } catch (e) {
    return [];
  }
};
