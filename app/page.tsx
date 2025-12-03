"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { BalanceCards } from "@/components/BalanceCards";
import { TransferForm } from "@/components/TransferForm";
import { RecentTransactions } from "@/components/RecentTransactions";
import { QuickTransfer } from "@/components/QuickTransfer";
import { Transaction } from "@/types";
import { Loader2 } from "lucide-react";
import {
  getTransactions,
  getTotalSent,
  getTotalContacts,
  getContacts,
} from "@/actions/transactions";
import { processTransfer } from "@/actions/transfer";
import { initiateDeposit } from "@/actions/deposit";

export default function Home() {
  const { user, userProfile, loading: authLoading, refreshProfile } = useAuth();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalSent, setTotalSent] = useState(0);
  const [totalContacts, setTotalContacts] = useState(0);
  const [contacts, setContacts] = useState<any[]>([]);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositLoading, setDepositLoading] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  const fetchData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch all data in parallel
      const [
        transactionsResult,
        totalSentResult,
        totalContactsResult,
        contactsResult,
      ] = await Promise.all([
        getTransactions(user.$id, 10),
        getTotalSent(user.$id),
        getTotalContacts(user.$id),
        getContacts(user.$id),
      ]);

      if (transactionsResult.success) {
        setTransactions(transactionsResult.transactions);
      }

      if (totalSentResult.success) {
        setTotalSent(totalSentResult.total);
      }

      if (totalContactsResult.success) {
        setTotalContacts(totalContactsResult.count);
      }

      if (contactsResult.success) {
        setContacts(contactsResult.contacts);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch data when user is authenticated
  useEffect(() => {
    if (user && userProfile) {
      fetchData();
    }
  }, [user, userProfile, fetchData]);

  const handleTransfer = async (
    recipient: string,
    amount: number,
    note: string,
    phone?: string,
  ) => {
    if (!user) return { success: false, message: "Not authenticated" };

    try {
      setError("");
      const result = await processTransfer(
        user.$id,
        recipient,
        phone || "0700 000 000",
        amount,
        note,
      );

      if (result.success) {
        // Refresh data
        await Promise.all([fetchData(), refreshProfile()]);

        return { success: true, message: result.message };
      } else {
        setError(result.error || "Transfer failed");
        return { success: false, message: result.error };
      }
    } catch (err: any) {
      console.error("Transfer error:", err);
      setError("Failed to process transfer");
      return { success: false, message: "Failed to process transfer" };
    }
  };

  const handleDeposit = async () => {
    if (!user || !depositAmount) return;

    const amount = parseInt(depositAmount);
    if (amount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setDepositLoading(true);
    setError("");

    try {
      console.log("=== Starting Deposit Process ===");
      console.log("User ID:", user.$id);
      console.log("Amount:", amount);

      const result = await initiateDeposit(user.$id, amount);

      console.log("Deposit result:", result);

      if (result.success && result.paymentData) {
        console.log("Payment data received, opening Flutterwave checkout");

        // Close modal
        setShowDepositModal(false);
        setDepositAmount("");

        // Use Flutterwave inline checkout
        // @ts-expect-error - FlutterwaveCheckout is loaded via script tag
        if (typeof window.FlutterwaveCheckout !== "undefined") {
          // @ts-expect-error - FlutterwaveCheckout is loaded via script tag
          window.FlutterwaveCheckout({
            ...result.paymentData,
            callback: function (data: any) {
              console.log("Payment callback:", data);
              if (data.status === "successful") {
                // Refresh data
                fetchData();
                refreshProfile();
              }
            },
            onclose: function () {
              console.log("Payment closed");
              setDepositLoading(false);
            },
          });
        } else {
          console.error("FlutterwaveCheckout not found on window");
          setError("Payment system not loaded. Please refresh the page.");
          setDepositLoading(false);
        }
      } else {
        console.error("Deposit failed:", result);
        const errorMsg = result.error || "Failed to initiate deposit";
        const details = result.details ? ` (${result.details})` : "";
        const errorCode = result.errorCode
          ? ` [Code: ${result.errorCode}]`
          : "";
        setError(errorMsg + details + errorCode);
        setDepositLoading(false);
      }
    } catch (err: any) {
      console.error("=== Deposit Exception ===");
      console.error("Error:", err);
      console.error("Error message:", err?.message);
      console.error("Error stack:", err?.stack);
      const errorMessage = err?.message || "Failed to initiate deposit";
      setError(`Error: ${errorMessage}`);
      setDepositLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (authLoading || !user || !userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header
        onDepositClick={() => setShowDepositModal(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <p className="text-sm">{error}</p>
          </div>
        )}

        <BalanceCards
          balance={userProfile.balance}
          totalSent={totalSent}
          totalContacts={totalContacts}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2 space-y-6">
            <TransferForm onTransfer={handleTransfer} />

            {loading ? (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : (
              <RecentTransactions transactions={transactions} />
            )}
          </div>

          <div>
            <QuickTransfer onTransfer={handleTransfer} contacts={contacts} />
          </div>
        </div>

        {/* Deposit Modal */}
        {showDepositModal && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
              style={{ position: "relative", zIndex: 60 }}
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                Add Money to Wallet
              </h2>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-4">
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Amount (UGX)
                </label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowDepositModal(false);
                    setDepositAmount("");
                    setError("");
                  }}
                  disabled={depositLoading}
                  className="flex-1 px-4 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 transition-all font-medium disabled:opacity-50"
                  style={{ color: "#334155", backgroundColor: "white" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeposit}
                  disabled={depositLoading || !depositAmount}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3 rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50 flex items-center justify-center space-x-2"
        
                >
                  {depositLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>Continue to Payment</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
