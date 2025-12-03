import { NextRequest, NextResponse } from "next/server";
import { Client, Databases, Query } from "node-appwrite";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTIONS = {
  USERS: process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
  TRANSACTIONS: process.env.NEXT_PUBLIC_APPWRITE_TRANSACTIONS_COLLECTION_ID!,
  CONTACTS: process.env.NEXT_PUBLIC_APPWRITE_CONTACTS_COLLECTION_ID!,
};

function getServerClient() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

  return new Databases(client);
}

export async function POST(request: NextRequest) {
  try {
    // Get webhook signature
    const signature = request.headers.get("verif-hash");
    const webhookSecret = process.env.FLUTTERWAVE_WEBHOOK_SECRET;

    // Verify webhook signature
    if (webhookSecret && signature !== webhookSecret) {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 },
      );
    }

    // Parse webhook payload
    const payload = await request.json();

    console.log("Flutterwave Webhook Received:", payload);

    // Handle different event types
    const eventType = payload.event;
    const data = payload.data;

    switch (eventType) {
      case "charge.completed":
        await handleChargeCompleted(data);
        break;

      case "transfer.completed":
        await handleTransferCompleted(data);
        break;

      case "transfer.failed":
        await handleTransferFailed(data);
        break;

      default:
        console.log("Unhandled webhook event:", eventType);
    }

    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed", details: error.message },
      { status: 500 },
    );
  }
}

// Handle completed payment/deposit
async function handleChargeCompleted(data: any) {
  try {
    const databases = getServerClient();
    const { tx_ref, amount, status, id } = data;

    if (status !== "successful") {
      console.log("Payment not successful:", status);
      return;
    }

    // Find transaction by reference
    const transactions = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.TRANSACTIONS,
      [Query.equal("reference", tx_ref)],
    );

    if (transactions.documents.length === 0) {
      console.log("Transaction not found for reference:", tx_ref);
      return;
    }

    const transaction = transactions.documents[0];

    // Update transaction status
    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.TRANSACTIONS,
      transaction.$id,
      {
        status: "completed",
        flutterwaveReference: tx_ref,
        flutterwaveTransactionId: id.toString(),
      },
    );

    // If it's a deposit (type: received), update user balance
    if (transaction.type === "received") {
      const userProfiles = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.USERS,
        [Query.equal("userId", transaction.userId)],
      );

      if (userProfiles.documents.length > 0) {
        const userProfile = userProfiles.documents[0];
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.USERS,
          userProfile.$id,
          {
            balance: userProfile.balance + amount,
          },
        );
      }
    }

    console.log("Payment completed successfully:", tx_ref);
  } catch (error) {
    console.error("Error handling charge completed:", error);
    throw error;
  }
}

// Handle completed transfer
async function handleTransferCompleted(data: any) {
  try {
    const databases = getServerClient();
    const { reference, status, id } = data;

    if (status !== "successful" && status !== "SUCCESS") {
      console.log("Transfer not successful:", status);
      return;
    }

    // Find transaction by reference
    const transactions = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.TRANSACTIONS,
      [Query.equal("reference", reference)],
    );

    if (transactions.documents.length === 0) {
      console.log("Transaction not found for reference:", reference);
      return;
    }

    const transaction = transactions.documents[0];

    // Update transaction status
    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.TRANSACTIONS,
      transaction.$id,
      {
        status: "completed",
        flutterwaveReference: reference,
        flutterwaveTransactionId: id.toString(),
      },
    );

    console.log("Transfer completed successfully:", reference);
  } catch (error) {
    console.error("Error handling transfer completed:", error);
    throw error;
  }
}

// Handle failed transfer
async function handleTransferFailed(data: any) {
  try {
    const databases = getServerClient();
    const { reference, id } = data;

    // Find transaction by reference
    const transactions = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.TRANSACTIONS,
      [Query.equal("reference", reference)],
    );

    if (transactions.documents.length === 0) {
      console.log("Transaction not found for reference:", reference);
      return;
    }

    const transaction = transactions.documents[0];

    // Update transaction status to failed
    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.TRANSACTIONS,
      transaction.$id,
      {
        status: "failed",
        flutterwaveReference: reference,
        flutterwaveTransactionId: id ? id.toString() : null,
      },
    );

    // Refund user balance if it was a transfer
    if (transaction.type === "sent") {
      const userProfiles = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.USERS,
        [Query.equal("userId", transaction.userId)],
      );

      if (userProfiles.documents.length > 0) {
        const userProfile = userProfiles.documents[0];
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.USERS,
          userProfile.$id,
          {
            balance: userProfile.balance + transaction.amount,
          },
        );
      }
    }

    console.log("Transfer failed, balance refunded:", reference);
  } catch (error) {
    console.error("Error handling transfer failed:", error);
    throw error;
  }
}

// Allow GET for webhook verification (some providers send GET first)
export async function GET() {
  return NextResponse.json(
    { message: "Flutterwave webhook endpoint" },
    { status: 200 },
  );
}
