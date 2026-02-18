'use client';

import { useState } from 'react';
import { Calendar, User, LogOut } from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';

interface HeaderProps {
  userName: string;
  greeting: string;
  darkMode: boolean;
  onToggleTheme: () => void;
  onLogout: () => void;
  onManageData: () => void;
  onAddData: () => void;
  showDataTable: boolean;
  showForm: boolean;
  onNameSave: (name: string) => void;
}

export default function Header({
  userName,
  greeting,
  darkMode,
  onToggleTheme,
  onLogout,
  onManageData,
  onAddData,
  showDataTable,
  showForm,
  onNameSave,
}: HeaderProps) {
  const [showNameInput, setShowNameInput] = useState(false);
  const [nameInput, setNameInput] = useState(userName);

  const textClass = darkMode ? 'text-white' : 'text-slate-900';
  const textSecondary = darkMode ? 'text-slate-400' : 'text-slate-600';
  const cardBg = darkMode ? 'bg-zinc-900' : 'bg-white';
  const borderClass = darkMode ? 'border-zinc-800' : 'border-slate-200';
  const inputClass = darkMode
    ? 'bg-zinc-800 text-white border-zinc-700'
    : 'bg-slate-50 text-slate-900 border-slate-200';
  const hoverBg = darkMode ? 'hover:bg-zinc-800' : 'hover:bg-slate-50';

  const handleSave = () => {
    if (nameInput.trim()) {
      onNameSave(nameInput.trim());
      setShowNameInput(false);
    }
  };

  return (
    <>
      <div className="flex justify-between items-start mb-12">
        <div>
          {userName ? (
            <div>
              <h1 className={`text-5xl font-semibold ${textClass} mb-2 tracking-tight`}>
                Hello, {userName}
              </h1>
              <p className="text-2xl font-light text-orange-500 mb-1">{greeting}</p>
              <button
                onClick={() => { setNameInput(userName); setShowNameInput(true); }}
                className={`text-sm ${textSecondary} hover:text-orange-500 transition flex items-center gap-1 mt-2`}
              >
                <User className="w-3 h-3" />
                Change name
              </button>
            </div>
          ) : (
            <div>
              <h1 className={`text-5xl font-semibold ${textClass} mb-3 tracking-tight`}>
                Sales Command Center
              </h1>
              <button
                onClick={() => { setNameInput(''); setShowNameInput(true); }}
                className="text-orange-500 hover:text-orange-600 transition font-medium flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                Add your name for a personalized experience
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle darkMode={darkMode} onToggle={onToggleTheme} />
          <button
            onClick={onLogout}
            className={`p-3 rounded-full ${darkMode ? 'bg-zinc-800' : 'bg-slate-100'} ${hoverBg} transition duration-300`}
            title="Logout"
          >
            <LogOut className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
          <button
            onClick={onManageData}
            className={`px-6 py-3 rounded-full ${darkMode ? 'bg-zinc-800 text-white' : 'bg-slate-900 text-white'} font-medium hover:bg-orange-500 transition duration-300 flex items-center gap-2`}
          >
            <Calendar className="w-4 h-4" />
            {showDataTable ? 'Hide' : 'Manage'} Data
          </button>
          <button
            onClick={onAddData}
            className="px-6 py-3 rounded-full bg-orange-500 text-white font-medium hover:bg-orange-600 transition duration-300 shadow-lg"
          >
            {showForm ? 'Cancel' : '+ Add Data'}
          </button>
        </div>
      </div>

      {/* Name input modal */}
      {showNameInput && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className={`${cardBg} rounded-3xl p-8 max-w-md w-full mx-4 border ${borderClass}`}>
            <h3 className={`text-2xl font-semibold ${textClass} mb-4`}>What's your name?</h3>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              placeholder="Enter your name"
              className={`w-full px-4 py-3 rounded-xl ${inputClass} border focus:outline-none focus:ring-2 focus:ring-orange-500 mb-4`}
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowNameInput(false)}
                className={`flex-1 px-4 py-2 rounded-xl ${darkMode ? 'bg-zinc-800 text-white' : 'bg-slate-100 text-slate-900'} font-medium hover:bg-opacity-80 transition`}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 rounded-xl bg-orange-500 text-white font-medium hover:bg-orange-600 transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
