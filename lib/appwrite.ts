import { Client, Account, Databases, ID, Query } from 'appwrite';

// Client configuration
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');

// Services
export const account = new Account(client);
export const databases = new Databases(client);

// Database and Collection IDs
export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'swavepay_db';
export const COLLECTIONS = {
  USERS: process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID || 'users',
  TRANSACTIONS: process.env.NEXT_PUBLIC_APPWRITE_TRANSACTIONS_COLLECTION_ID || 'transactions',
  CONTACTS: process.env.NEXT_PUBLIC_APPWRITE_CONTACTS_COLLECTION_ID || 'contacts',
};

// Helper to generate unique IDs
export const generateId = () => ID.unique();

// Query helper
export { Query };

// Export client for advanced usage
export { client };

// Types for Appwrite documents
export interface AppwriteDocument {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  $databaseId: string;
  $collectionId: string;
}

// User profile interface
export interface UserProfile extends AppwriteDocument {
  userId: string;
  name: string;
  email: string;
  phone: string;
  balance: number;
  currency: string;
  avatar?: string;
}

// Transaction interface
export interface TransactionDocument extends AppwriteDocument {
  userId: string;
  recipientId?: string;
  recipientName: string;
  recipientPhone: string;
  amount: number;
  currency: string;
  type: 'sent' | 'received';
  status: 'pending' | 'completed' | 'failed';
  reference: string;
  note?: string;
  flutterwaveReference?: string;
  flutterwaveTransactionId?: string;
}

// Contact interface
export interface ContactDocument extends AppwriteDocument {
  userId: string;
  name: string;
  phone: string;
  avatar?: string;
  favorite: boolean;
}
