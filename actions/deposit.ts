"use server";

import { Client, Databases, Query } from "node-appwrite";
import { generateReference } from "@/lib/flutterwave";

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

export async function initiateDeposit(userId: string, amount: number) {
  try {
    console.log("=== Initiating Deposit ===");
    console.log("User ID:", userId);
    console.log("Amount:", amount);
    console.log("Database ID:", DATABASE_ID);
    console.log("Users Collection ID:", COLLECTIONS.USERS);

    const databases = getServerClient();

    // Validate amount
    if (amount <= 0) {
      console.error("Invalid amount:", amount);
      return { success: false, error: "Amount must be greater than 0" };
    }

    // Get user profile
    console.log("Fetching user profile...");
    const userProfileResponse = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.USERS,
      [Query.equal("userId", userId)],
    );

    console.log("User profile response:", userProfileResponse.documents.length);

    if (userProfileResponse.documents.length === 0) {
      console.error("User profile not found for userId:", userId);
      return { success: false, error: "User profile not found" };
    }

    const userProfile = userProfileResponse.documents[0];
    console.log("User profile found:", userProfile.name);

    // Generate reference
    const reference = generateReference("SWVP-DEP");
    console.log("Generated reference:", reference);

    // Check environment variables
    if (!process.env.FLUTTERWAVE_PUBLIC_KEY) {
      console.error("FLUTTERWAVE_PUBLIC_KEY is not set");
      return {
        success: false,
        error: "Payment configuration error: Public key missing",
      };
    }

    console.log("Creating pending transaction...");
    // Create pending transaction
    const transaction = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.TRANSACTIONS,
      "unique()",
      {
        userId,
        recipientName: userProfile.name,
        recipientPhone: userProfile.phone,
        amount,
        currency: "UGX",
        type: "received",
        status: "pending",
        reference,
        note: "Wallet deposit",
      },
    );

    console.log("Transaction created:", transaction.$id);

    // Return payment data for inline checkout
    const paymentData = {
      public_key: process.env.FLUTTERWAVE_PUBLIC_KEY!,
      tx_ref: reference,
      amount: amount,
      currency: "UGX",
      payment_options: "card,mobilemoneyuganda,ussd,account",
      redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/?payment=success`,
      customer: {
        email: userProfile.email,
        phone_number: userProfile.phone,
        name: userProfile.name,
      },
      customizations: {
        title: "SwavePay Deposit",
        description: `Add UGX ${amount.toLocaleString()} to your wallet`,
        logo: `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`,
      },
    };

    console.log("Payment data generated successfully");
    console.log(
      "Public key (first 10 chars):",
      process.env.FLUTTERWAVE_PUBLIC_KEY?.substring(0, 10),
    );

    return {
      success: true,
      message: "Payment data generated successfully",
      paymentData,
      reference,
      transactionId: transaction.$id,
    };
  } catch (error: any) {
    console.error("=== Deposit Error ===");
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);
    console.error("Error type:", error.type);
    console.error("Full error:", JSON.stringify(error, null, 2));

    return {
      success: false,
      error: `Failed to initiate deposit: ${error.message || "Unknown error"}`,
      details: error.message,
      errorCode: error.code,
      errorType: error.type,
    };
  }
}
