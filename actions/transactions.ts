"use server";

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

export async function getTransactions(userId: string, limit = 50) {
  try {
    const databases = getServerClient();

    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.TRANSACTIONS,
      [
        Query.equal("userId", userId),
        Query.orderDesc("$createdAt"),
        Query.limit(limit),
      ],
    );

    return {
      success: true,
      transactions: response.documents.map((doc: any) => ({
        id: doc.$id,
        recipient: doc.recipientName,
        phone: doc.recipientPhone,
        amount: doc.type === "sent" ? -doc.amount : doc.amount,
        date: doc.$createdAt.split("T")[0],
        status: doc.status,
        type: doc.type,
        reference: doc.reference,
        note: doc.note || "",
      })),
    };
  } catch (error: any) {
    console.error("Get transactions error:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch transactions",
      transactions: [],
    };
  }
}

export async function getTotalSent(userId: string) {
  try {
    const databases = getServerClient();

    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.TRANSACTIONS,
      [
        Query.equal("userId", userId),
        Query.equal("type", "sent"),
        Query.equal("status", "completed"),
      ],
    );

    const total = response.documents.reduce(
      (sum: number, doc: any) => sum + doc.amount,
      0,
    );

    return { success: true, total, count: response.documents.length };
  } catch (error: any) {
    return { success: false, total: 0, count: 0 };
  }
}

export async function getTotalContacts(userId: string) {
  try {
    const databases = getServerClient();

    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.CONTACTS,
      [Query.equal("userId", userId)],
    );

    return { success: true, count: response.documents.length };
  } catch (error: any) {
    return { success: false, count: 0 };
  }
}

export async function getContacts(userId: string) {
  try {
    const databases = getServerClient();

    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.CONTACTS,
      [Query.equal("userId", userId), Query.orderDesc("$createdAt")],
    );

    return {
      success: true,
      contacts: response.documents.map((doc: any) => ({
        id: doc.$id,
        name: doc.name,
        phone: doc.phone,
        favorite: doc.favorite,
      })),
    };
  } catch (error: any) {
    return { success: false, contacts: [] };
  }
}
