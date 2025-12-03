"use client";

import { useState } from "react";
import { Zap, Phone, ChevronRight, UserPlus } from "lucide-react";

interface Contact {
  id: string;
  name: string;
  phone: string;
  favorite: boolean;
}

interface QuickTransferProps {
  onTransfer: (
    recipient: string,
    amount: number,
    note: string,
    phone?: string,
  ) => Promise<any>;
  contacts: Contact[];
}

const quickAmounts = [50000, 100000, 200000, 500000];

export function QuickTransfer({ onTransfer, contacts }: QuickTransferProps) {
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [showAmountSelection, setShowAmountSelection] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);

  const handleContactSelect = (contactId: string) => {
    setSelectedContact(contactId);
    setShowAmountSelection(true);
    setSelectedAmount(null);
  };

  const handleQuickTransfer = async () => {
    if (selectedContact && selectedAmount) {
      const contact = contacts.find((c) => c.id === selectedContact);
      if (contact) {
        setIsTransferring(true);
        try {
          await onTransfer(
            contact.name,
            selectedAmount,
            "Quick transfer",
            contact.phone,
          );
          setSelectedContact(null);
          setSelectedAmount(null);
          setShowAmountSelection(false);
        } catch (error) {
          console.error("Quick transfer error:", error);
        } finally {
          setIsTransferring(false);
        }
      }
    }
  };

  const handleBack = () => {
    setShowAmountSelection(false);
    setSelectedAmount(null);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-purple-50 rounded-lg">
            <Zap className="w-5 h-5 text-purple-600" />
          </div>
          <h2 className="text-slate-900 font-semibold">Quick Transfer</h2>
        </div>
      </div>

      {!showAmountSelection ? (
        <div className="space-y-3">
          {contacts.length === 0 ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
                <UserPlus className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-600 mb-2">No contacts yet</p>
              <p className="text-sm text-slate-500">
                Add contacts to enable quick transfers
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-600 mb-3">
                {contacts.length} Contact{contacts.length !== 1 ? "s" : ""}
              </p>
              {contacts.slice(0, 5).map((contact, index) => {
                const colors = [
                  "from-pink-400 to-rose-400",
                  "from-blue-400 to-cyan-400",
                  "from-purple-400 to-pink-400",
                  "from-amber-400 to-orange-400",
                  "from-green-400 to-emerald-400",
                ];
                const avatars = ["👤", "👥", "🙋", "🙋‍♂️", "🙋‍♀️"];

                return (
                  <button
                    key={contact.id}
                    onClick={() => handleContactSelect(contact.id)}
                    className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all border border-slate-200 hover:border-slate-300"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-12 h-12 bg-gradient-to-br ${colors[index % colors.length]} rounded-full flex items-center justify-center flex-shrink-0`}
                      >
                        <span className="text-xl">
                          {avatars[index % avatars.length]}
                        </span>
                      </div>
                      <div className="text-left">
                        <p className="text-slate-900 font-medium">
                          {contact.name}
                        </p>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <p className="text-sm text-slate-500">
                            {contact.phone}
                          </p>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </button>
                );
              })}
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <button
            onClick={handleBack}
            className="text-sm text-slate-600 hover:text-slate-900 flex items-center space-x-1"
          >
            <span>←</span>
            <span>Back to contacts</span>
          </button>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-sm text-slate-500 mb-2">Sending to</p>
            <div className="flex items-center space-x-3">
              <div
                className={`w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center`}
              >
                <span className="text-lg">👤</span>
              </div>
              <div>
                <p className="text-slate-900 font-medium">
                  {contacts.find((c) => c.id === selectedContact)?.name}
                </p>
                <p className="text-sm text-slate-500">
                  {contacts.find((c) => c.id === selectedContact)?.phone}
                </p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm text-slate-700 mb-3">Select Amount (UGX)</p>
            <div className="grid grid-cols-2 gap-3">
              {quickAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setSelectedAmount(amount)}
                  className={`py-4 rounded-xl border-2 transition-all font-medium ${
                    selectedAmount === amount
                      ? "border-purple-500 bg-purple-50 text-purple-600"
                      : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <div className="text-center">
                    <p>UGX {amount.toLocaleString("en-US")}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleQuickTransfer}
            disabled={!selectedAmount || isTransferring}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-medium"
          >
            {isTransferring ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                <span>
                  Send UGX {selectedAmount?.toLocaleString("en-US") || "0"}
                </span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
