import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head } from '@inertiajs/react'
import { useState } from 'react'

// ─── Data ────────────────────────────────────────────────────────────────────

const TRIGGERS = [
  'New lead created in CRM',
  'Appointment reminder',
  'Payment reminder or overdue invoice',
  'User signup follow-up',
  'Failed payment recovery',
  'Webhook from external system',
]

const FLOW_NODES = [
  {
    icon: '⚡',
    iconBg: 'bg-black/5',
    label: 'Your System Event',
    desc: 'New lead, scheduled reminder, webhook signal',
    accent: null,
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#008f73" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 9V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4" />
        <path d="m14 17 3 3 3-3" /><path d="M17 14v6" />
      </svg>
    ),
    iconBg: 'bg-[rgba(0,143,115,0.08)]',
    label: 'API Request → Start Call',
    labelColor: 'text-[#008f73]',
    desc: 'POST /api/outbound/call with agent ID & phone',
    accent: 'border-[rgba(0,143,115,0.3)] bg-[rgba(0,143,115,0.05)]',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="22" />
      </svg>
    ),
    iconBg: 'bg-blue-50',
    label: 'AI Voice Agent (ElevenLabs)',
    labelColor: 'text-blue-600',
    desc: 'Agent processes context & handles conversation',
    accent: 'border-blue-200 bg-blue-50/60',
  },
  {
    icon: '📞',
    iconBg: 'bg-black/5',
    label: "Customer's Phone",
    desc: 'Live call delivered to the recipient',
    accent: null,
  },
]

const USE_CASES = [
  {
    name: 'Lead Qualification',
    tag: 'CRM',
    tagClass: 'bg-blue-50 text-blue-700 border border-blue-200',
    trigger: 'New lead added to CRM — agent calls within minutes to qualify intent',
  },
  {
    name: 'Appointment Reminder',
    tag: 'SCHEDULED',
    tagClass: 'bg-amber-50 text-amber-700 border border-amber-200',
    trigger: '1 hour before scheduled appointment — agent confirms or reschedules',
  },
  {
    name: 'Payment Reminder',
    tag: 'BILLING',
    tagClass: 'bg-red-50 text-red-700 border border-red-200',
    trigger: 'Invoice overdue trigger — agent delivers personalized payment reminder',
  },
  {
    name: 'Customer Feedback',
    tag: 'CX',
    tagClass: 'bg-[rgba(0,143,115,0.08)] text-[#008f73] border border-[rgba(0,143,115,0.18)]',
    trigger: 'After purchase event — agent collects satisfaction feedback via voice',
  },
  {
    name: 'Account Recovery',
    tag: 'BILLING',
    tagClass: 'bg-red-50 text-red-700 border border-red-200',
    trigger: 'Failed payment detected — agent guides customer through re-activation',
  },
  {
    name: 'Signup Follow-up',
    tag: 'AUTOMATION',
    tagClass: 'bg-purple-50 text-purple-700 border border-purple-200',
    trigger: 'User signup or inactivity webhook — agent onboards or re-engages',
  },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

// Section label: increased from ~10px to 12px, darkened from gray-400 to gray-500, added mb-4
function SectionLabel({ children }) {
  return (
    <div className="font-mono  font-semibold tracking-[0.08em] uppercase text-gray-500 mb-4">
      {children}
    </div>
  )
}

function InfoSection() {
  return (
    <section className="mb-10">
      <SectionLabel>01 — How it works</SectionLabel>

      {/* Card */}
      <div className="info-card-bar relative bg-white rounded-2xl border border-[rgba(0,143,115,0.18)] px-7 py-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-start gap-3.5 mb-5">
          <div className="w-9 h-9 rounded-lg bg-[rgba(0,143,115,0.08)] border border-[rgba(0,143,115,0.2)] flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="#008f73" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
            </svg>
          </div>
          <div>
            {/* was text-[17px] — bumped to text-[18px] */}
            <p className="font-head text-[18px] font-semibold text-gray-900 leading-snug">
              Programmatic Trigger Required
            </p>
            {/* was text-[12px] text-gray-500 — bumped to text-[13px] text-gray-600 */}
            <p className="text-[13px] text-gray-600 mt-1">
              Calls are initiated from your backend, not from the dashboard
            </p>
          </div>
        </div>

        {/* Body — was text-sm text-gray-500, now text-[15px] text-gray-600 */}
        <div className="text-[15px] text-gray-600 leading-relaxed mb-5 space-y-3">
          <p>
            Outbound calls cannot be configured directly from the dashboard. Each implementation
            depends on your application's logic, which is why call triggers must be handled
            programmatically through the API.
          </p>
          <p>
            This approach allows outbound calls to start automatically based on events in your
            system — giving you complete control over when and how the AI agent reaches out.
          </p>
        </div>

        {/* Trigger pills — label was text-[10px], now text-[12px] */}
        <div className="font-mono text-[12px] font-semibold tracking-[0.08em] uppercase text-gray-500 mb-3">
          Common trigger events
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {TRIGGERS.map((t) => (
            <div
              key={t}
              className="flex items-center gap-2 bg-gray-50 border border-black/[0.07] rounded-lg px-3 py-2.5 text-[13px] text-gray-700 transition-colors hover:border-black/[0.13] hover:bg-gray-100"
            >
              <span className="pulse-dot" />
              {t}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FlowSection() {
  return (
    <section className="mb-10">
      <SectionLabel>02 — Call flow</SectionLabel>
      <div className="bg-white border border-black/[0.07] rounded-2xl px-7 py-9">
        {/* was text-xl — kept, was text-gray-900 — kept */}
        <h2 className="font-head text-[22px] font-semibold text-gray-900 mb-1.5">
          How Outbound Calls Work
        </h2>
        {/* was text-[13px] text-gray-400 — bumped to text-[14px] text-gray-500 */}
        <p className="text-[14px] text-gray-500 mb-8">
          From trigger event to live conversation — here's the full path.
        </p>

        {/* Diagram */}
        <div className="flex flex-col items-center">
          {FLOW_NODES.map((node, i) => (
            <div key={i} className="w-full flex flex-col items-center">
              <div
                className={`w-full max-w-sm flex items-center gap-3.5 bg-gray-50 border border-black/[0.13] rounded-xl px-5 py-3.5 transition-colors hover:border-[rgba(0,143,115,0.3)] ${node.accent ?? ''}`}
              >
                <div className={`w-[34px] h-[34px] rounded-lg flex items-center justify-center flex-shrink-0 text-base ${node.iconBg}`}>
                  {node.icon}
                </div>
                <div className="flex flex-col gap-1">
                  {/* was text-sm — bumped to text-[15px] */}
                  <span className={`text-[15px] font-medium tracking-tight ${node.labelColor ?? 'text-gray-900'}`}>
                    {node.label}
                  </span>
                  {/* was text-[12px] text-gray-400 — bumped to text-[13px] text-gray-500 */}
                  <span className="text-[13px] text-gray-500">{node.desc}</span>
                </div>
              </div>

              {/* Arrow between nodes */}
              {i < FLOW_NODES.length - 1 && (
                <div className="flex flex-col items-center py-1">
                  <div className="flow-arrow-line" />
                  <div className="flow-arrow-head" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* was text-[13px] text-gray-400 — bumped to text-[14px] text-gray-500 */}
        <p className="text-[14px] text-gray-500 text-center mt-6 max-w-sm mx-auto leading-relaxed">
          Calls are triggered by events in your backend system rather than manual configuration in
          the dashboard. Once initiated, the AI handles the entire conversation.
        </p>
      </div>
    </section>
  )
}

function CodeSection() {
  const [copied, setCopied] = useState(false)

  const rawCode = `POST /api/outbound/call
Authorization: Bearer sk-proj-...
Content-Type: application/json

{
  "agent_id":      "agent_123",
  "phone_number":  "+15551234567",
  "metadata": {
    "customer_name":     "John",
    "appointment_time":  "3PM"
  }
}`

  function handleCopy() {
    navigator.clipboard.writeText(rawCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <section className="mb-10">
      <SectionLabel>03 — API reference</SectionLabel>
      {/* was text-xl — bumped to text-[22px] */}
      <h2 className="font-head text-[22px] font-semibold text-gray-900 mb-4">Example API Request</h2>

      {/* Code card */}
      <div className="bg-[#f8f9fc] border border-black/[0.07] rounded-2xl overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center justify-between px-5 py-3 bg-[#f1f3f8] border-b border-black/[0.07]">
          <div className="flex items-center gap-2.5">
            {/* Mac dots */}
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#28ca41]" />
            </div>
            {/* was text-[11px] text-gray-400 — bumped to text-[12px] text-gray-500 */}
            <span className="font-mono text-[12px] text-gray-500 tracking-wider">HTTP</span>
            <span className="font-mono text-[12px] bg-[rgba(0,143,115,0.08)] text-[#008f73] border border-[rgba(0,143,115,0.2)] rounded px-2 py-0.5 tracking-wide">
              POST
            </span>
          </div>
          {/* was text-[11px] text-gray-400 — bumped to text-[12px] text-gray-500 */}
          <button
            onClick={handleCopy}
            className="font-mono text-[12px] text-gray-500 border border-black/[0.07] rounded-md px-2.5 py-1 cursor-pointer transition-colors hover:text-[#008f73] hover:border-[rgba(0,143,115,0.25)] bg-transparent"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        {/* Code body — was text-[13px] — kept at 13px, it's a good code size */}
        <div className="px-6 py-5 overflow-x-auto code-scroll">
          <pre className="font-mono text-[13px] leading-[1.85] text-slate-800 whitespace-pre">
            <span className="tok-kw">POST</span>{' '}
            <span className="tok-path">/api/outbound/call</span>{'\n'}
            <span className="tok-key">Authorization</span>
            {': '}
            <span className="tok-str">Bearer sk-proj-...</span>{'\n'}
            <span className="tok-key">Content-Type</span>
            {': '}
            <span className="tok-str">application/json</span>{'\n\n'}
            {'{\n'}
            {'  '}
            <span className="tok-key">"agent_id"</span>
            {'      '}
            <span className="tok-str">"agent_123"</span>
            {',\n'}
            {'  '}
            <span className="tok-key">"phone_number"</span>
            {'  '}
            <span className="tok-str">"+15551234567"</span>
            {',\n'}
            {'  '}
            <span className="tok-key">"metadata"</span>
            {': {\n'}
            {'    '}
            <span className="tok-key">"customer_name"</span>
            {'     '}
            <span className="tok-str">"John"</span>
            {',\n'}
            {'    '}
            <span className="tok-key">"appointment_time"</span>
            {'  '}
            <span className="tok-str">"3PM"</span>
            {'\n  }\n}'}
          </pre>
        </div>
      </div>

      {/* was text-[13px] text-gray-400 — bumped to text-[14px] text-gray-600 */}
      <p className="text-[14px] text-gray-600 mt-4 leading-relaxed">
        Outbound calls are initiated by sending an API request from your backend whenever a trigger
        event occurs. Metadata fields are injected as context into the AI agent's conversation.
      </p>
    </section>
  )
}

function UseCasesSection() {
  return (
    <section className="mb-10">
      <SectionLabel>04 — Use cases</SectionLabel>
      {/* was text-xl — bumped to text-[22px] */}
      <h2 className="font-head text-[22px] font-semibold text-gray-900 mb-2">
        Popular Outbound Automation Workflows
      </h2>
      {/* was text-sm text-gray-500 — bumped to text-[15px] text-gray-600 */}
      <p className="text-[15px] text-gray-600 mb-5">
        Common patterns developers implement with API-triggered outbound calls.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {USE_CASES.map((uc) => (
          <div
            key={uc.name}
            className="bg-white border border-black/[0.07] rounded-xl px-[18px] py-4 transition-all hover:border-black/[0.13] hover:-translate-y-px"
          >
            <div className="flex items-center justify-between mb-3">
              {/* was text-sm — bumped to text-[15px] */}
              <span className="text-[15px] font-medium text-gray-900 tracking-tight">{uc.name}</span>
              {/* was text-[10px] — bumped to text-[11px] */}
              <span className={`font-mono text-[11px] rounded px-1.5 py-0.5 tracking-wide ${uc.tagClass}`}>
                {uc.tag}
              </span>
            </div>
            {/* was text-[12px] text-gray-500 — bumped to text-[13px] text-gray-600 */}
            <div className="flex items-start gap-1.5 text-[13px] text-gray-600 leading-snug">
              <span className="opacity-40 text-[11px] mt-px flex-shrink-0">▸</span>
              <span>{uc.trigger}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function ActionsSection() {
  return (
    <section className="mb-10">
      <SectionLabel>05 — Get started</SectionLabel>
      <div className="bg-white border border-black/[0.07] rounded-2xl px-7 py-8">
        {/* was text-lg — bumped to text-[20px] */}
        <h2 className="font-head text-[20px] font-semibold text-gray-900 mb-2">
          Ready to implement outbound calls?
        </h2>
        {/* was text-sm text-gray-500 — bumped to text-[15px] text-gray-600 */}
        <p className="text-[15px] text-gray-600 mb-6 leading-relaxed max-w-lg">
          Outbound calling is fully supported — you'll need to set up a backend trigger that calls
          our API when your events occur. Start with the documentation or explore ready-made
          examples.
        </p>


        {/* Support note — was text-[13px] text-gray-400 — bumped to text-[13px] text-gray-500 */}
        <div className="flex items-center gap-2  text-gray-500 border-t border-black/[0.07] pt-[18px]">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          Need help implementing triggers for your workflow?{' '}
          <a href="#" className="text-[#008f73] font-medium hover:underline no-underline">
            Contact support
          </a>{' '}
        </div>
      </div>
    </section>
  )
}

// ─── Root component ───────────────────────────────────────────────────────────

export default function OutboundCalls() {
  return (
    <AuthenticatedLayout header="Outbound Calling">
      <Head title='Outbound' />
      <div className="max-w-7xl mx-auto px-6 pt-[30px]">

        {/* Page header */}
        <header className="mb-12">
          <div className="inline-flex items-center gap-1.5 bg-[rgba(0,143,115,0.08)] border border-[rgba(0,143,115,0.2)] text-[#008f73] rounded-full font-mono text-[12px] font-medium px-2.5 py-1 tracking-[0.05em] mb-4">
            <span className="pulse-dot" />
            API-TRIGGERED
          </div>
          <h1 className="font-head text-[clamp(28px,5vw,40px)] font-bold tracking-tight text-gray-900 leading-[1.15] mb-3">
            Outbound Calls
          </h1>
          {/* was text-[15px] text-gray-500 — darkened to text-gray-600 */}
          <p className="text-[16px] text-gray-600 max-w-[520px] leading-[1.65]">
            Outbound calls are triggered programmatically via API to support flexible automation
            workflows. The platform handles the AI conversation once the call is initiated.
          </p>
        </header>

        {/* Sections */}
        <InfoSection />
        <FlowSection />
        <CodeSection />

        <div className="h-px bg-black/[0.07] my-10" />

        <UseCasesSection />

        <div className="h-px bg-black/[0.07] my-10" />

        <ActionsSection />
      </div>
    </AuthenticatedLayout>
  )
}