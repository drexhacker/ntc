import { Wallet, ArrowUpRight, Users } from "lucide-react";

interface BalanceCardsProps {
  balance: number;
  totalSent: number;
  totalContacts: number;
}

export function BalanceCards({
  balance,
  totalSent,
  totalContacts,
}: BalanceCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Available Balance Card */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <Wallet className="w-6 h-6" />
          </div>
          <span className="text-sm text-blue-100">Available Balance</span>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white mb-1">
            UGX {balance.toLocaleString("en-US")}
          </h2>
          <p className="text-sm text-blue-100">Ready to use</p>
        </div>
      </div>

      {/* Total Sent Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-red-50 rounded-xl">
            <ArrowUpRight className="w-6 h-6 text-red-600" />
          </div>
          <span className="text-sm text-slate-500">Total Sent</span>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-slate-900 mb-1">
            UGX {totalSent.toLocaleString("en-US")}
          </h3>
          <p className="text-sm text-slate-500">All completed transfers</p>
        </div>
      </div>

      {/* Total Contacts Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-blue-50 rounded-xl">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <span className="text-sm text-slate-500">Saved Contacts</span>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-slate-900 mb-1">
            {totalContacts}
          </h3>
          <p className="text-sm text-slate-500">Quick transfer recipients</p>
        </div>
      </div>
    </div>
  );
}
