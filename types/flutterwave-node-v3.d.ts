declare module 'flutterwave-node-v3' {
  export default class Flutterwave {
    constructor(publicKey: string, secretKey: string);

    Transaction: {
      verify(payload: { id: string | number }): Promise<any>;
    };

    Charge: {
      card(payload: any): Promise<any>;
    };

    Transfer: {
      initiate(payload: {
        account_bank: string;
        account_number: string;
        amount: number;
        narration: string;
        currency: string;
        reference: string;
        callback_url?: string;
        debit_currency?: string;
        beneficiary_name?: string;
      }): Promise<any>;
    };

    Bank: {
      country(payload: { country: string }): Promise<any>;
    };

    Misc: {
      verify_Account(payload: {
        account_number: string;
        account_bank: string;
      }): Promise<any>;
    };

    Balance: {
      fetch(payload: { currency: string }): Promise<any>;
    };
  }
}
