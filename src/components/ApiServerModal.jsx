import React, { useState } from "react";
import { X, Server, CheckCircle2, AlertCircle } from "lucide-react";

const PRESET_URLS = [
  {
    label: "AWS Deployed API (ticket-api.pitadcloud.com)",
    url: "https://task-tracking-api-production.up.railway.app/api",
  },
  {
    label: "Local Development Server (localhost:5000)",
    url: "http://localhost:5000/api",
  },
];

export default function ApiServerModal({
  currentUrl,
  health,
  onClose,
  onSave,
}) {
  const [url, setUrl] = useState(currentUrl);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-indigo-400" />
            <h3 className="text-base font-bold text-white">
              Backend API Connection
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div
          className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 ${
            health.status === "online"
              ? "bg-emerald-950/50 border-emerald-800/80 text-emerald-200"
              : "bg-rose-950/50 border-rose-800/80 text-rose-200"
          }`}
        >
          {health.status === "online" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <div>
            <div className="font-semibold">
              Status: {health.status.toUpperCase()}
            </div>
            <div className="opacity-80">{health.message}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Quick Presets
            </label>
            <div className="space-y-1.5">
              {PRESET_URLS.map((preset) => (
                <button
                  key={preset.url}
                  type="button"
                  onClick={() => setUrl(preset.url)}
                  className={`w-full text-left px-3 py-2 rounded-xl border text-xs transition cursor-pointer ${
                    url === preset.url
                      ? "bg-indigo-600/20 border-indigo-500 text-white"
                      : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <div className="font-medium">{preset.label}</div>
                  <div className="font-mono text-[11px] text-slate-400">
                    {preset.url}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Custom API Base URL (must end with <code>/api</code>)
            </label>
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://task-tracking-api-production.up.railway.app/api"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white cursor-pointer"
            >
              Connect & Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
