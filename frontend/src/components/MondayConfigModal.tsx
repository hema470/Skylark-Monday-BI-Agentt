import React, { useState } from 'react';
import { X, Key, Layers, Save, CheckCircle2 } from 'lucide-react';

interface MondayConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  dealsBoardId: string;
  workorderBoardId: string;
  onSave: (dealsBoardId: string, workorderBoardId: string) => void;
}

export const MondayConfigModal: React.FC<MondayConfigModalProps> = ({
  isOpen,
  onClose,
  dealsBoardId,
  workorderBoardId,
  onSave,
}) => {
  const [dealsId, setDealsId] = useState(dealsBoardId);
  const [workorderId, setWorkorderId] = useState(workorderBoardId);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(dealsId, workorderId);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-card rounded-2xl border border-slate-800 p-6 space-y-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-100">Monday.com Board Configuration</h3>
            <p className="text-xs text-slate-400">Set Board IDs for live GraphQL query execution</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              Board 1: Deals Board ID
            </label>
            <input
              type="text"
              value={dealsId}
              onChange={(e) => setDealsId(e.target.value)}
              placeholder="e.g. 1234567890"
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              Board 2: Work Orders Board ID
            </label>
            <input
              type="text"
              value={workorderId}
              onChange={(e) => setWorkorderId(e.target.value)}
              placeholder="e.g. 9876543210"
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-900/40 text-[11px] text-slate-400">
            💡 Environment variables (<code>MONDAY_API_KEY</code>, <code>MONDAY_DEALS_BOARD_ID</code>, <code>MONDAY_WORKORDER_BOARD_ID</code>) in backend <code>.env</code> file serve as default defaults.
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-500/20 flex items-center gap-1.5"
            >
              {saved ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Board IDs</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
