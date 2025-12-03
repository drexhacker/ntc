# SwavePay

Modern money transfer dashboard with Appwrite backend and Flutterwave payment integration.

## Stack

- **Next.js 15** - App Router
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **Appwrite** - Auth & Database
- **Flutterwave** - Payments

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure `.env.local`:
```env
# Appwrite
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
APPWRITE_API_KEY=your_api_key
NEXT_PUBLIC_APPWRITE_DATABASE_ID=swavepay_db
NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID=users
NEXT_PUBLIC_APPWRITE_TRANSACTIONS_COLLECTION_ID=transactions
NEXT_PUBLIC_APPWRITE_CONTACTS_COLLECTION_ID=contacts

# Flutterwave
FLUTTERWAVE_PUBLIC_KEY=your_public_key
FLUTTERWAVE_SECRET_KEY=your_secret_key
FLUTTERWAVE_ENCRYPTION_KEY=your_encryption_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=SwavePay
```

3. Create Appwrite collections:
   - `users` - User profiles
   - `transactions` - Transaction records
   - `contacts` - Saved contacts

4. Create user account in Appwrite Console (Auth + users collection)

5. Run:
```bash
npm run dev
```

## Server Actions

- `processTransfer()` - Process money transfers
- `getTransactions()` - Fetch user transactions
- `getTotalSent()` - Get total amount sent
- `getTotalContacts()` - Get saved contacts count

## Webhooks

- `POST /api/webhook/flutterwave` - Flutterwave webhook for real-time updates

## Deployment

```bash
npm run build
npm start
```

Deploy to Vercel for production.

---

Made with Next.js & Tailwind CSS