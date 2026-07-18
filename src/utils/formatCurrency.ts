export const formatCurrency = (amount: number | string, currency: string = 'INR') => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return `₹0`;
  return new Intl.NumberFormat('en-IN', { 
    style: 'currency', 
    currency, 
    maximumFractionDigits: 0 
  }).format(num);
};
