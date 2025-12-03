export interface Transaction {
  id: string;
  recipient: string;
  phone: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending';
  type: 'sent' | 'received';
}
