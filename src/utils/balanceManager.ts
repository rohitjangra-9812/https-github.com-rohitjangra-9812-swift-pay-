export const getBalance = (): number => {
  const saved = localStorage.getItem('swiftpay_user_balance');
  if (saved !== null) return Number(saved);
  const initialBalance = Math.floor(Math.random() * 90000) + 10000;
  localStorage.setItem('swiftpay_user_balance', initialBalance.toString());
  return initialBalance;
};

export const setBalance = (newBalance: number) => {
  localStorage.setItem('swiftpay_user_balance', newBalance.toString());
  window.dispatchEvent(new CustomEvent('balance_updated', { detail: newBalance }));
};

export const deductBalance = (amount: number): { success: boolean; reason?: string } => {
  const current = getBalance();
  if (current < amount) {
    return { success: false, reason: "Insufficient funds in your bank account." };
  }
  setBalance(current - amount);
  return { success: true };
};

export const addBalance = (amount: number) => {
  const current = getBalance();
  setBalance(current + amount);
};
