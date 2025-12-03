import { ArrowUpRight, ArrowDownLeft, Clock, CheckCircle2 } from "lucide-react";
import { Transaction } from "@/types";

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-slate-900">Recent Transactions</h2>
        <button className="text-sm text-blue-600 hover:text-blue-700">
          View All
        </button>
      </div>

      <div className="space-y-3">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div
                className={`p-3 rounded-xl ${
                  transaction.type === "received"
                    ? "bg-green-100"
                    : "bg-red-100"
                }`}
              >
                {transaction.type === "received" ? (
                  <ArrowDownLeft className="w-5 h-5 text-green-600" />
                ) : (
                  <ArrowUpRight className="w-5 h-5 text-red-600" />
                )}
              </div>

              <div>
                <p className="text-slate-900">{transaction.recipient}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <p className="text-sm text-slate-500">{transaction.phone}</p>
                  <span className="text-slate-300">•</span>
                  <div className="flex items-center space-x-1">
                    {transaction.status === "completed" ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                        <span className="text-xs text-green-600">
                          Completed
                        </span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span className="text-xs text-amber-600">Pending</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="text-right">
              <p
                className={`${
                  transaction.amount > 0 ? "text-green-600" : "text-slate-900"
                }`}
              >
                {transaction.amount > 0 ? "+" : ""}UGX{" "}
                {Math.abs(transaction.amount).toLocaleString("en-US")}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
