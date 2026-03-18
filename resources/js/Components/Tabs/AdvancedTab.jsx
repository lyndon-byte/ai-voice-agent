import { useState, useEffect } from "react";
import axios from "axios";
import { Trash2 } from "lucide-react";

// ── tiny helpers ────────────────────────────────────────────────────────────
function Spinner({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className="animate-spin"
      style={{ animation: "spin 0.75s linear infinite" }}
    >
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <circle cx="12" cy="12" r="10" stroke="#d1d5db" strokeWidth="3" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="#6b7280" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// ── Modal wrapper ────────────────────────────────────────────────────────────
function Modal({ open, onClose, children, title, subtitle }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(2px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl"
        style={{ maxHeight: "90vh", overflowY: "auto" }}
      >
        {/* header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ×
          </button>
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          {subtitle && (
            <p className="mt-1 text-xs text-gray-500 leading-relaxed">{subtitle}</p>
          )}
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}


// ── Secret Modal ──────────────────────────────────────────────────────────────
function SecretModal({ secret, onClose }) {
    const [copied, setCopied] = useState(false);
  
    function handleCopy() {
      navigator.clipboard.writeText(secret).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  
    if (!secret) return null;
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)" }}
      >
        <div className="relative w-full max-w-md bg-white shadow-2xl rounded overflow-hidden">
          {/* amber accent bar */}
          <div className="h-1 w-full bg-amber-400" />
  
          <div className="px-6 pt-5 pb-6">
            {/* Icon + heading */}
            <div className="flex items-start gap-3 mb-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-amber-100 text-amber-600 text-lg">
                ⚠
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Save your webhook secret</h2>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                  This secret will{" "}
                  <span className="font-semibold text-gray-700">not be shown again</span>. Copy it
                  now and store it somewhere safe. Use it to verify the{" "}
                  <code className="bg-gray-100 px-1 rounded text-gray-700 text-xs">
                    X-Webhook-Signature
                  </code>{" "}
                  header on incoming payloads.
                </p>
              </div>
            </div>
  
            {/* Secret box */}
            <div className="rounded border border-amber-200 bg-amber-50 px-3 py-2.5 mb-4">
              <p className="text-xs text-gray-500 mb-1 font-medium tracking-wide uppercase">
                HMAC Secret
              </p>
              <code className="block text-xs text-amber-900 break-all font-mono leading-relaxed select-all">
                {secret}
              </code>
            </div>
  
            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="flex-1 rounded border border-gray-300 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {copied ? "✓ Copied!" : "Copy Secret"}
              </button>
              <button
                onClick={onClose}
                className="flex-1 rounded bg-gray-900 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
              >
                I've saved it
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

// ── Main component ───────────────────────────────────────────────────────────
export default function AdvancedTab({agentId}) {
    
  // ── state: current webhook detail ──
  const [currentWebhook, setCurrentWebhook] = useState(null);
  const [loadingCurrent, setLoadingCurrent] = useState(false);

  // ── state: create-webhook modal ──
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createUrl, setCreateUrl] = useState("");
  const [creating, setCreating] = useState(false);
  const [newSecret, setNewSecret] = useState(null); // shown once after creation
  const [createError, setCreateError] = useState("");

  // ── 1. load existing webhook detail on mount ──
  useEffect(() => {
    
    setLoadingCurrent(true);
    axios
      .get("/app/get-webhook")
      .then((res) => setCurrentWebhook(res.data?.webhook ?? null))
      .catch(() => setCurrentWebhook(null))
      .finally(() => setLoadingCurrent(false));

  }, []);


  async function handleDetach() {

    
    try {

        const res = await axios.post("/app/delete-webhook",{
           gent_id: agentId
        });
        const { success } = res.data ?? {};

        if(success){

          setCurrentWebhook(null);

        }

    } catch {

        setCreateError("Failed to delete webhook. Please try again.");

    } 

  }

  // ── create new webhook ──
  async function handleCreate() {

    if (!createName.trim() || !createUrl.trim()) {
      setCreateError("Both name and URL are required.");
      return;
    }

    setCreateError("");
    setCreating(true);

    try {

        const res = await axios.post("/app/create-webhook", {
          name: createName.trim(),
          webhook_url: createUrl.trim(),
          agent_id: agentId
        });
        const { webhook_id, secret } = res.data ?? {};
        const webhookData = res.data?.webhook ?? null;

        // Immediately reflect in the card without waiting for a refetch
        setCurrentWebhook(
          webhookData ?? {
            name: createName.trim(),
            webhook_url: createUrl.trim(),
            webhook_id: webhook_id ?? null,
          }
        );

        if (secret) setNewSecret(secret);

        setCreateOpen(false);
        setCreateName("");
        setCreateUrl("");

    } catch {

        setCreateError("Failed to create webhook. Please try again.");

    } finally {

        setCreating(false);

    }
  }

  function closeCreate() {
    setCreateOpen(false);
    setCreateName("");
    setCreateUrl("");
    setCreateError("");
  }



  return (

    <div className="divide-y divide-gray-200">
        {/* ── Post-call Webhook Section ── */}
      <div className="py-8 first:pt-0 mt-10">

        <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-900">Post-call webhook</h4>

            {/* Only show Select Webhook button when no webhook is attached */}
            {!currentWebhook && !loadingCurrent && (
                <button
                    onClick={() => {
                        setCreateOpen(true);
                    }}
                    className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    Add Webhook
                </button>
            )}
        </div>

        {/* Current webhook card */}
        {loadingCurrent ? (
            <div className="flex items-center gap-2 rounded border border-gray-200 bg-gray-50 px-4 py-5">
                <Spinner />
                <span className="text-sm text-gray-400">Loading webhook…</span>
            </div>
        ) : currentWebhook ? (
            <div className="flex items-center justify-between gap-3 rounded border border-gray-200 bg-white px-4 py-3 shadow-sm">
                <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{currentWebhook.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{currentWebhook.webhook_url}</p>
                    {currentWebhook.auth_method && (
                        <p className="text-xs text-gray-400 mt-0.5">
                            Auth Method: {currentWebhook.auth_method}
                        </p>
                    )}
                </div>
                <button
                    onClick={handleDetach}
                    title="Detach webhook"
                    className="shrink-0 rounded px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-gray-100 hover:border-red-300 transition-colors"
                >
                    <Trash2 width="16" height="16"/>
                </button>
            </div>
        ) : (
            <div className="flex items-center justify-center rounded border border-gray-200 bg-gray-50 py-8">
                <p className="text-sm text-gray-400">No post-call webhook configured.</p>
            </div>
        )}
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            MODAL — Create Webhook
        ══════════════════════════════════════════════════════════════════════ */}
        <Modal
            open={createOpen}
            onClose={closeCreate}
            title="Create a Webhook"
            subtitle="Please enter the webhook callback URL and name. Once created, these details cannot be changed."
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Enter a valid display name for the webhook
                    </label>
                    <input
                        type="text"
                        value={createName}
                        onChange={(e) => setCreateName(e.target.value)}
                        placeholder="Webhook Name…"
                        className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-400 transition-colors"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Enter a valid callback URL
                    </label>
                    <input
                        type="url"
                        value={createUrl}
                        onChange={(e) => setCreateUrl(e.target.value)}
                        placeholder="https://…"
                        className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-400 transition-colors"
                    />
                </div>

                {/* Auth method — fixed HMAC */}
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-xs font-medium text-gray-700">Webhook Auth Method</p>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        HMAC will generate a shared secret used to sign all webhook payloads. You should
                        verify the "X-Webhook-Signature" header using this secret.
                        </p>
                    </div>
                    <span className="shrink-0 rounded border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 font-medium">
                        HMAC ▾
                    </span>
                </div>

                {createError && (
                    <p className="text-xs text-red-500 rounded border border-red-100 bg-red-50 px-3 py-2">
                        {createError}
                    </p>
                )}

                <div className="flex gap-2 pt-1">
                    <button
                        onClick={closeCreate}
                        className="flex-1 rounded border border-gray-200 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCreate}
                        disabled={creating || !createName.trim() || !createUrl.trim()}
                        className="flex-1 rounded bg-gray-900 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                        {creating && <Spinner size={14} />}
                        {creating ? "Creating…" : "Create"}
                    </button>
                </div>
            </div>
        </Modal>

        <SecretModal secret={newSecret} onClose={() => setNewSecret(null)} />
        
    </div>
  );
}