import Flutterwave from 'flutterwave-node-v3';

// Initialize Flutterwave
const flw = new Flutterwave(
  process.env.FLUTTERWAVE_PUBLIC_KEY || '',
  process.env.FLUTTERWAVE_SECRET_KEY || ''
);

// Flutterwave payment payload interface
export interface FlutterwavePaymentPayload {
  tx_ref: string;
  amount: number;
  currency: string;
  redirect_url: string;
  customer: {
    email: string;
    phonenumber: string;
    name: string;
  };
  customizations?: {
    title?: string;
    description?: string;
    logo?: string;
  };
  payment_options?: string;
}

// Flutterwave transfer payload interface
export interface FlutterwaveTransferPayload {
  account_bank: string;
  account_number: string;
  amount: number;
  narration: string;
  currency: string;
  reference: string;
  callback_url?: string;
  debit_currency?: string;
  beneficiary_name?: string;
}

// Verify payment
export async function verifyPayment(transactionId: string) {
  try {
    const response = await flw.Transaction.verify({ id: transactionId });
    return response;
  } catch (error) {
    console.error('Flutterwave verification error:', error);
    throw error;
  }
}

// Initiate payment
export async function initiatePayment(payload: FlutterwavePaymentPayload) {
  try {
    const response = await flw.Charge.card({
      ...payload,
      enckey: process.env.FLUTTERWAVE_ENCRYPTION_KEY || '',
    });
    return response;
  } catch (error) {
    console.error('Flutterwave payment initiation error:', error);
    throw error;
  }
}

// Initiate transfer
export async function initiateTransfer(payload: FlutterwaveTransferPayload) {
  try {
    const response = await flw.Transfer.initiate(payload);
    return response;
  } catch (error) {
    console.error('Flutterwave transfer error:', error);
    throw error;
  }
}

// Get all banks
export async function getBanks(country: string = 'NG') {
  try {
    const response = await flw.Bank.country({ country });
    return response;
  } catch (error) {
    console.error('Flutterwave get banks error:', error);
    throw error;
  }
}

// Verify bank account
export async function verifyBankAccount(
  account_number: string,
  account_bank: string
) {
  try {
    const response = await flw.Misc.verify_Account({
      account_number,
      account_bank,
    });
    return response;
  } catch (error) {
    console.error('Flutterwave verify account error:', error);
    throw error;
  }
}

// Get balance
export async function getBalance(currency: string = 'NGN') {
  try {
    const response = await flw.Balance.fetch({ currency });
    return response;
  } catch (error) {
    console.error('Flutterwave get balance error:', error);
    throw error;
  }
}

// Generate transaction reference
export function generateReference(prefix: string = 'TXN'): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000000);
  return `${prefix}-${timestamp}-${random}`;
}

// Format currency
export function formatCurrency(amount: number, currency: string = 'UGX'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

// Validate phone number (for Uganda)
export function validateUgandaPhone(phone: string): boolean {
  // Remove spaces and special characters
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');

  // Check if it matches Uganda phone format
  // Formats: 0700123456, +256700123456, 256700123456
  const ugandaRegex = /^(\+?256|0)?[7][0-9]{8}$/;
  return ugandaRegex.test(cleaned);
}

// Normalize phone number to international format
export function normalizePhone(phone: string, countryCode: string = '256'): string {
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');

  // If starts with 0, replace with country code
  if (cleaned.startsWith('0')) {
    return `+${countryCode}${cleaned.substring(1)}`;
  }

  // If starts with country code without +, add it
  if (cleaned.startsWith(countryCode)) {
    return `+${cleaned}`;
  }

  // If already has +, return as is
  if (cleaned.startsWith('+')) {
    return cleaned;
  }

  // Otherwise add + and country code
  return `+${countryCode}${cleaned}`;
}

export default flw;
