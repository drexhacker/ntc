"use server";

import { Client, Databases, Query } from "node-appwrite";
import { generateReference, initiateTransfer } from "@/lib/flutterwave";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTIONS = {
  USERS: process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
  TRANSACTIONS: process.env.NEXT_PUBLIC_APPWRITE_TRANSACTIONS_COLLECTION_ID!,
};

function getServerClient() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

  return new Databases(client);
}

export async function processTransfer(
  userId: string,
  recipientName: string,
  recipientPhone: string,
  amount: number,
  note?: string,
) {
  try {
    const databases = getServerClient();

    // Validate amount
    if (amount <= 0) {
      return { success: false, error: "Amount must be greater than 0" };
    }

    // Get user profile
    const userProfileResponse = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.USERS,
      [Query.equal("userId", userId)],
    );

    if (userProfileResponse.documents.length === 0) {
      return { success: false, error: "User profile not found" };
    }

    const userProfile = userProfileResponse.documents[0];

    // Check sufficient balance
    if (userProfile.balance < amount) {
      return { success: false, error: "Insufficient balance" };
    }

    // Generate reference
    const reference = generateReference("SWVP");

    // Create transaction record
    const transaction = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.TRANSACTIONS,
      "unique()",
      {
        userId,
        recipientName,
        recipientPhone,
        amount,
        currency: "UGX",
        type: "sent",
        status: "pending",
        reference,
        note: note || "",
      },
    );

    // Initiate Flutterwave transfer
    try {
      const isAirtel = recipientPhone.startsWith("070") || recipientPhone.startsWith("075") || recipientPhone.startsWith("074");
      const transferPayload = {
        account_bank: isAirtel ? "AIRTEL" : "MTN",
        account_number: recipientPhone,
        amount,
        narration: note || `Transfer from ${userProfile.name}`,
        currency: "UGX",
        reference,
        beneficiary_name: recipientName,
      };

      const flutterwaveResponse = await initiateTransfer(transferPayload);

      if (flutterwaveResponse.status === "success") {
        // Update transaction
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.TRANSACTIONS,
          transaction.$id,
          {
            status: "completed",
            flutterwaveReference: flutterwaveResponse.data.reference,
            flutterwaveTransactionId: flutterwaveResponse.data.id.toString(),
          },
        );

        // Update balance
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.USERS,
          userProfile.$id,
          {
            balance: userProfile.balance - amount,
          },
        );

        return {
          success: true,
          message: "Transfer completed successfully",
          transaction: {
            id: transaction.$id,
            reference,
            amount,
            status: "completed",
          },
        };
      } else {
        console.log(flutterwaveResponse);
        // Transfer failed
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.TRANSACTIONS,
          transaction.$id,
          {
            status: "failed",
          },
        );

        return {
          success: false,
          error: "Transfer failed",
          details: flutterwaveResponse.message || "Payment processing failed",
        };
      }
    } catch (error: any) {
      // Update transaction to failed
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.TRANSACTIONS,
        transaction.$id,
        {
          status: "failed",
        },
      );

      return {
        success: false,
        error: "Transfer failed",
        details: error.message,
      };
    }
  } catch (error: any) {
    console.error("Transfer error:", error);
    return {
      success: false,
      error: "Failed to process transfer",
      details: error.message,
    };
  }
}
