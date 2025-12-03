"use client";

import { Plus, Settings, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  onDepositClick: () => void;
}

export function Header({ onDepositClick }: HeaderProps) {
  const { userProfile, logout } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white">💸</span>
            </div>
            <div>
              <h1 className="text-slate-900 font-bold">SwavePay</h1>
              <p className="text-slate-500 text-sm">Mobile Money</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Deposit Button */}
            <button
              onClick={onDepositClick}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              <span className="text-slate-600">Add Money</span>
            </button>

            {/* Settings Button */}
            <button
              onClick={() => logout()}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              title="Logout"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* User Info */}
            <div className="flex items-center space-x-3 pl-4 border-l border-slate-200">
              <div className="text-right">
                <p className="text-sm text-slate-900 font-medium">
                  {userProfile?.name || "User"}
                </p>
                <p className="text-xs text-slate-500">
                  {userProfile?.email || ""}
                </p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
