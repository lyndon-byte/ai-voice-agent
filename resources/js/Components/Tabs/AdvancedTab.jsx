import { useState, useEffect } from "react";
import { useAgentChanges } from "@/Contexts/AgentChangesContext";
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
                    ElevenLabs-Signature
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
export default function AdvancedTab({ platformSettings }) {
  const webhookId = platformSettings?.workspace_overrides?.webhooks?.post_call_webhook_id ?? null;
  
  const { trackChange } = useAgentChanges()
  // ── state: current webhook detail ──
  const [currentWebhook, setCurrentWebhook] = useState(null);
  const [loadingCurrent, setLoadingCurrent] = useState(false);

  // ── state: select-webhook modal ──
  const [selectOpen, setSelectOpen] = useState(false);
  const [allWebhooks, setAllWebhooks] = useState([]);
  const [loadingAll, setLoadingAll] = useState(false);
  const [selectedId, setSelectedId] = useState(webhookId);

  // ── state: create-webhook modal ──
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createUrl, setCreateUrl] = useState("");
  const [creating, setCreating] = useState(false);
  const [newSecret, setNewSecret] = useState(null); // shown once after creation
  const [createError, setCreateError] = useState("");

  // ── 1. load existing webhook detail on mount if id present ──
  useEffect(() => {
    if (!webhookId) return;
    setLoadingCurrent(true);
    axios
      .get("/app/get-webhooks", { params: { webhook_id: webhookId } })
      .then((res) => setCurrentWebhook(res.data?.webhook ?? null))
      .catch(() => setCurrentWebhook(null))
      .finally(() => setLoadingCurrent(false));
  }, [webhookId]);

  // ── 2. load all webhooks when select modal opens ──
  useEffect(() => {
    if (!selectOpen) return;
    setLoadingAll(true);
    axios
      .get("/app/get-webhooks")
      .then((res) => setAllWebhooks(res.data?.webhooks ?? []))
      .catch(() => setAllWebhooks([]))
      .finally(() => setLoadingAll(false));
  }, [selectOpen]);

  // ── handlers ──
  function applySelection() {
    const chosen = allWebhooks.find((w) => w.webhook_id === selectedId) ?? null;
    if (chosen) setCurrentWebhook(chosen);
    trackChange("workspace_overrides", {
      webhooks: {
        post_call_webhook_id: selectedId || null,
        events: ["transcript"],
        send_audio: false,
      },
    });
    setSelectOpen(false);
  }

  function handleDetach() {
    setCurrentWebhook(null);
    setSelectedId(null);
    trackChange("workspace_overrides", {
      webhooks: {
        post_call_webhook_id: null,
        events: ["transcript"],
        send_audio: false,
      },
    });
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
      setSelectedId(webhook_id ?? null);

      trackChange("workspace_overrides", {
        webhooks: {
          post_call_webhook_id: webhook_id ?? null,
          events: ["transcript"],
          send_audio: false,
        },
      });

      if (secret) setNewSecret(secret);

      setCreateOpen(false);
      setSelectOpen(false);
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


  // ── webhook list card ──
  function WebhookCard({ wh }) {
    const active = selectedId === wh.webhook_id;
    return (
      <button
        onClick={() => setSelectedId(wh.webhook_id)}
        className={`w-full text-left rounded border px-4 py-3 transition-all ${
          active
            ? "border-gray-900 bg-gray-50 ring-1 ring-gray-900"
            : "border-gray-200 hover:border-gray-400 hover:bg-gray-50"
        }`}
      >
        <p className="text-sm font-medium text-gray-900 truncate">{wh.name}</p>
        <p className="text-xs text-gray-500 mt-0.5 truncate">{wh.webhook_url}</p>
      </button>
    );
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
                    onClick={() => setSelectOpen(true)}
                    className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    Select Webhook
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
            MODAL — Select Webhook
        ══════════════════════════════════════════════════════════════════════ */}
        <Modal
            open={selectOpen}
            onClose={() => setSelectOpen(false)}
            title="Select Webhook"
            subtitle="Choose an existing webhook or create a new one."
        >
        {loadingAll ? (
            <div className="flex items-center justify-center py-8 gap-2">
                <Spinner />
                <span className="text-sm text-gray-400">Loading webhooks…</span>
            </div>
        ) : allWebhooks.length > 0 ? (
            <div className="space-y-2 mb-5">
                {allWebhooks.map((wh) => (
                    <WebhookCard key={wh.webhook_id} wh={wh} />
                ))}
            </div>
        ) : (
            <p className="text-sm text-gray-400 text-center py-6 mb-2">
                No webhooks found. Create one below.
            </p>
        )}

        <div className="border-t border-gray-100 pt-4 space-y-2">
            <button
                onClick={() => {
                    setSelectOpen(false);
                    setCreateOpen(true);
                }}
                className="w-full rounded border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
                + Create Webhook
            </button>

            {allWebhooks.length > 0 && (
                <div className="flex gap-2">
                    <button
                        onClick={() => setSelectOpen(false)}
                        className="flex-1 rounded border border-gray-200 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={applySelection}
                        disabled={!selectedId}
                        className="flex-1 rounded bg-gray-900 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        Apply
                    </button>
                </div>
            )}
        </div>
        </Modal>

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
                        verify the "ElevenLabs-Signature" header using this secret.
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