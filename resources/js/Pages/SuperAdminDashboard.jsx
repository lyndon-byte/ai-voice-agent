import { router, Head } from "@inertiajs/react";
import { useState } from "react";
import axios from "axios";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function Avatar({ name }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const colors = [
    "bg-violet-500",
    "bg-cyan-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-indigo-500",
  ];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div
      className={`${color} w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
    >
      {initials}
    </div>
  );
}

function ImpersonateModal({ user, org, onClose }) {

  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {

    setLoading(true);

    const { data } = await axios.post(`/admin/impersonate/${user.id}`)

    router.get(data?.url,{},{

        onFinish: () => setLoading(false)
    })

  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-[#0f1117] border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl shadow-black/60">
        {/* Accent bar */}
        <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-violet-500 to-transparent" />

        
        <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold">Impersonate User</h3>
                <p className="text-zinc-500 text-xs">Admin action — use with care</p>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/5">
              <div className="flex items-center gap-3">
                <Avatar name={user.name} />
                <div>
                  <p className="text-white text-sm font-medium">{user.name}</p>
                  <p className="text-zinc-400 text-xs">{user.email}</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="text-zinc-500 text-xs">{org.name}</span>
              </div>
            </div>

            <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
              You will temporarily act as this user within their organization. All actions will be logged.
            </p>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Starting...
                  </>
                ) : (
                  "Confirm"
                )}
              </button>
        </div>
        
      </div>
    </div>
  );
}

function UserRow({ user, org }) {
  const [modal, setModal] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/10 transition-all group">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar name={user.name} />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-white text-sm font-medium truncate">{user.name}</span>
              {user.email_verified_at ? (
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full px-2 py-0.5">
                  <span className="w-1 h-1 bg-emerald-400 rounded-full" />
                  Verified
                </span>
              ) : (
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full px-2 py-0.5">
                  <span className="w-1 h-1 bg-amber-400 rounded-full" />
                  Unverified
                </span>
              )}
            </div>
            <p className="text-zinc-500 text-xs truncate">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 ml-3">
          <span className="hidden md:block text-zinc-600 text-xs">{formatDate(user.created_at)}</span>
          <button
            onClick={() => setModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600/10 hover:bg-violet-600/20 border border-violet-500/20 hover:border-violet-500/40 text-violet-400 hover:text-violet-300 text-xs font-medium transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            Impersonate
          </button>
        </div>
      </div>
      {modal && <ImpersonateModal user={user} org={org} onClose={() => setModal(false)} />}
    </>
  );
}

const DISABLE_REASONS = [
  {
    id: "unpaid_balance",
    label: "Unpaid Balance",
    description: "Organization has an outstanding payment due.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    ),
    color: "rose",
  },
  {
    id: "free_trial_ended",
    label: "Free Trial Ended",
    description: "Trial period has expired and no plan was selected.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
    color: "amber",
  },
];

function DisableAgentsModal({ org, currentDisabled, onClose, onConfirm }) {
  const [selectedReason, setSelectedReason] = useState(
    currentDisabled ? currentDisabled.reason : null
  );
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const isReenable = !!currentDisabled;

  const handleConfirm = () => {
    if (!isReenable && !selectedReason) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setDone(true);
      setTimeout(() => {
        onConfirm(isReenable ? null : selectedReason);
        onClose();
      }, 900);
    }, 1400);
  };

  const reasonObj = DISABLE_REASONS.find((r) => r.id === selectedReason);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0f1117] border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl shadow-black/60">
        <div className={`absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent ${isReenable ? "via-emerald-500" : "via-rose-500"} to-transparent`} />

        {done ? (
          <div className="text-center py-4">
            <div className={`w-16 h-16 ${isReenable ? "bg-emerald-500/10 border-emerald-500/30" : "bg-rose-500/10 border-rose-500/30"} border rounded-full flex items-center justify-center mx-auto mb-4`}>
              <svg className={`w-8 h-8 ${isReenable ? "text-emerald-400" : "text-rose-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-white font-semibold text-lg">
              {isReenable ? "Agents Re-enabled" : "Agents Disabled"}
            </p>
            <p className="text-zinc-400 text-sm mt-1">
              {isReenable
                ? `All agents for ${org.name} are now active.`
                : `All agents for ${org.name} have been suspended.`}
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 ${isReenable ? "bg-emerald-500/10 border-emerald-500/30" : "bg-rose-500/10 border-rose-500/30"} border rounded-xl flex items-center justify-center`}>
                <svg className={`w-5 h-5 ${isReenable ? "text-emerald-400" : "text-rose-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isReenable ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  )}
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold">
                  {isReenable ? "Re-enable Agents" : "Disable All Agents"}
                </h3>
                <p className="text-zinc-500 text-xs capitalize">{org.name}</p>
              </div>
            </div>

            {/* Re-enable view */}
            {isReenable ? (
              <>
                <div className="bg-white/5 rounded-xl p-4 mb-5 border border-white/5">
                  <p className="text-zinc-400 text-xs mb-1">Currently disabled for</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg ${
                      currentDisabled.reason === "unpaid_balance"
                        ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}>
                      {DISABLE_REASONS.find((r) => r.id === currentDisabled.reason)?.label}
                    </span>
                  </div>
                </div>
                <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
                  This will restore all agent access for <span className="text-white font-medium capitalize">{org.name}</span>. Make sure the issue has been resolved before proceeding.
                </p>
              </>
            ) : (
              <>
                <p className="text-zinc-400 text-sm mb-4 leading-relaxed">
                  Select the reason for disabling all agents in <span className="text-white font-medium capitalize">{org.name}</span>. Users will be notified.
                </p>
                {/* Reason selector */}
                <div className="space-y-2.5 mb-6">
                  {DISABLE_REASONS.map((reason) => (
                    <button
                      key={reason.id}
                      onClick={() => setSelectedReason(reason.id)}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${
                        selectedReason === reason.id
                          ? reason.color === "rose"
                            ? "bg-rose-500/10 border-rose-500/40"
                            : "bg-amber-500/10 border-amber-500/40"
                          : "bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.06] hover:border-white/10"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          selectedReason === reason.id
                            ? reason.color === "rose"
                              ? "bg-rose-500/20"
                              : "bg-amber-500/20"
                            : "bg-white/5"
                        }`}>
                          <svg className={`w-4 h-4 ${
                            selectedReason === reason.id
                              ? reason.color === "rose" ? "text-rose-400" : "text-amber-400"
                              : "text-zinc-500"
                          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {reason.icon}
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className={`text-sm font-medium ${
                              selectedReason === reason.id ? "text-white" : "text-zinc-300"
                            }`}>{reason.label}</p>
                            {selectedReason === reason.id && (
                              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                                reason.color === "rose" ? "bg-rose-500" : "bg-amber-500"
                              }`}>
                                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <p className="text-zinc-500 text-xs mt-0.5">{reason.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading || (!isReenable && !selectedReason)}
                className={`flex-1 py-2.5 rounded-xl text-white text-sm font-medium transition-all disabled:opacity-40 flex items-center justify-center gap-2 ${
                  isReenable
                    ? "bg-emerald-600 hover:bg-emerald-500"
                    : "bg-rose-600 hover:bg-rose-500"
                }`}
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Processing...
                  </>
                ) : isReenable ? (
                  "Re-enable Agents"
                ) : (
                  "Disable Agents"
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function OrgCard({ org }) {
  const [expanded, setExpanded] = useState(true);
  const [disableModal, setDisableModal] = useState(false);
  // { reason: "unpaid_balance" | "free_trial_ended" } or null
  const [disabledState, setDisabledState] = useState(null);

  const reasonObj = DISABLE_REASONS.find((r) => r.id === disabledState?.reason);

  return (
    <>
      <div className={`bg-[#0f1117] border rounded-2xl overflow-hidden transition-all ${
        disabledState
          ? "border-rose-500/25 shadow-rose-950/40 shadow-lg"
          : "border-white/[0.08]"
      }`}>
        {/* Disabled banner */}
        {disabledState && (
          <div className="flex items-center justify-between gap-3 px-5 py-2.5 bg-rose-500/[0.08] border-b border-rose-500/20">
            <div className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              <span className="text-rose-400 text-xs font-medium">All agents disabled</span>
              <span className="text-rose-500/60 text-xs">·</span>
              <span className="text-rose-400/70 text-xs">{reasonObj?.label}</span>
            </div>
            <button
              onClick={() => setDisableModal(true)}
              className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium underline underline-offset-2 transition-colors"
            >
              Re-enable
            </button>
          </div>
        )}

        {/* Card Header */}
        <div
          className="flex items-center justify-between p-5 cursor-pointer hover:bg-white/[0.02] transition-colors"
          onClick={() => setExpanded((e) => !e)}
        >
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              disabledState
                ? "bg-rose-600/10 border border-rose-500/20"
                : "bg-gradient-to-br from-violet-600/30 to-indigo-600/10 border border-violet-500/20"
            }`}>
              <svg className={`w-5 h-5 ${disabledState ? "text-rose-400/60" : "text-violet-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className={`font-semibold capitalize ${disabledState ? "text-zinc-400" : "text-white"}`}>{org.name}</h3>
                <span className="text-[10px] bg-white/5 border border-white/10 text-zinc-400 rounded-full px-2 py-0.5">
                  ID #{org.id}
                </span>
              </div>
              <p className="text-zinc-500 text-xs mt-0.5">{org.domain}</p>
            </div>
          </div>
          <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
            {/* Disable / Enable toggle button */}
            <button
              onClick={() => setDisableModal(true)}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                disabledState
                  ? "bg-emerald-600/10 hover:bg-emerald-600/20 border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 hover:text-emerald-300"
                  : "bg-rose-600/10 hover:bg-rose-600/20 border-rose-500/20 hover:border-rose-500/40 text-rose-400 hover:text-rose-300"
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {disabledState ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                )}
              </svg>
              {disabledState ? "Re-enable Agents" : "Disable Agents"}
            </button>

            <div className="hidden sm:flex items-center gap-1.5 text-zinc-500 text-xs">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              {org.users.length} {org.users.length === 1 ? "user" : "users"}
            </div>
            <div onClick={() => setExpanded((e) => !e)} className="cursor-pointer p-1">
              <svg
                className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Metadata strip */}
        <div className="px-5 pb-4 flex flex-wrap gap-x-6 gap-y-1.5 border-b border-white/[0.06]">
          <div className="flex items-center gap-1.5">
            <svg className="w-3 h-3 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
            <span className="text-zinc-600 text-xs">{org.database}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-3 h-3 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-zinc-600 text-xs">Created {formatDate(org.created_at)}</span>
          </div>
          {/* Mobile disable button */}
          <button
            onClick={() => setDisableModal(true)}
            className={`sm:hidden flex items-center gap-1.5 text-xs font-medium transition-colors ${
              disabledState ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {disabledState ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              )}
            </svg>
            {disabledState ? "Re-enable Agents" : "Disable Agents"}
          </button>
        </div>

        {/* Users list */}
        {expanded && (
          <div className="p-4 space-y-2">
            {org.users.length === 0 ? (
              <p className="text-zinc-600 text-sm text-center py-4">No users in this organization.</p>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3 px-1">
                  <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Members</p>
                  <span className="text-zinc-600 text-xs">{org.users.length} total</span>
                </div>
                {org.users.map((user) => (
                  <UserRow key={user.id} user={user} org={org} />
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {disableModal && (
        <DisableAgentsModal
          org={org}
          currentDisabled={disabledState}
          onClose={() => setDisableModal(false)}
          onConfirm={(reason) => setDisabledState(reason ? { reason } : null)}
        />
      )}
    </>
  );
}

function LogoutModal({ onClose }) {

  const [loading, setLoading] = useState(false);

  const handleLogout =  () => {

    router.post('/logout',{},{

        onStart: () => setLoading(true),
        onFinish: () => setLoading(false)


    });
    
   
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0f1117] border border-white/10 rounded-2xl p-8 max-w-sm w-full shadow-2xl shadow-black/60">
        <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-zinc-600 to-transparent" />
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </div>
          <div>
            <h3 className="text-white font-semibold">Sign out</h3>
            <p className="text-zinc-500 text-xs">End your admin session</p>
          </div>
        </div>
        <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
          You'll be returned to the login page. Any unsaved changes will be lost.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10 transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleLogout}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-sm font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Signing out...
              </>
            ) : (
              "Sign out"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SuperAdminDashboard({ organizations }) {

  const [logoutModal, setLogoutModal] = useState(false);
  const totalUsers = organizations.reduce((sum, o) => sum + o.users.length, 0);

  return (

    <>
        <Head title="super" />

        <div className="min-h-screen bg-[#080a0e] text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=DM+Mono:wght@400;500&display=swap');
                * { box-sizing: border-box; }
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: #ffffff15; border-radius: 3px; }
            `}</style>

            {/* Navbar */}
            <nav className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#080a0e]/80 backdrop-blur-xl">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                    </svg>
                    </div>
                    <span className="font-semibold text-sm tracking-tight">Super Admin</span>
                    <span className="hidden sm:block text-zinc-700 text-sm">/</span>
                    <span className="hidden sm:block text-zinc-500 text-sm">Dashboard</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-emerald-400 text-xs font-medium">Live</span>
                    </div>
                    <div className="w-px h-4 bg-white/10" />
                    <button
                    onClick={() => setLogoutModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all text-xs font-medium"
                    >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="hidden sm:inline">Logout</span>
                    </button>
                </div>
                </div>
            </nav>

            {/* Main content */}
            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
                {/* Page header */}
                <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight text-white">Organizations</h1>
                <p className="text-zinc-500 text-sm mt-1">
                    Manage tenant organizations and impersonate users for support.
                </p>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                {[
                    {
                    label: "Total Orgs",
                    value: organizations.length,
                    icon: (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    ),
                    color: "violet",
                    },
                    {
                    label: "Total Users",
                    value: totalUsers,
                    icon: (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    ),
                    color: "cyan",
                    },
                    {
                    label: "Avg Users / Org",
                    value: organizations.length ? (totalUsers / organizations.length).toFixed(1) : 0,
                    icon: (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    ),
                    color: "emerald",
                    },
                ].map((stat) => (
                    <div
                    key={stat.label}
                    className="bg-[#0f1117] border border-white/[0.07] rounded-xl p-4 flex items-center gap-3"
                    >
                    <div className={`w-9 h-9 rounded-lg bg-${stat.color}-500/10 border border-${stat.color}-500/20 flex items-center justify-center flex-shrink-0`}>
                        <svg className={`w-4.5 h-4.5 text-${stat.color}-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {stat.icon}
                        </svg>
                    </div>
                    <div>
                        <p className="text-white font-bold text-xl leading-none">{stat.value}</p>
                        <p className="text-zinc-500 text-xs mt-1">{stat.label}</p>
                    </div>
                    </div>
                ))}
                </div>

                {/* Org cards */}
                <div className="space-y-4">
                {organizations.map((org) => (
                    <OrgCard key={org.id} org={org} />
                ))}
                </div>

                {organizations.length === 0 && (
                <div className="text-center py-24 text-zinc-600">
                    <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16" />
                    </svg>
                    <p className="text-sm">No organizations found.</p>
                </div>
                )}
            </main>

            {logoutModal && <LogoutModal onClose={() => setLogoutModal(false)} />}
        </div>
    </>
  );
}