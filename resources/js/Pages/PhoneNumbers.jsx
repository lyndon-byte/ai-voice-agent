import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useState, useEffect, useRef } from "react";
import { Head } from '@inertiajs/react';
import axios from "axios";


const ENCRYPTION_OPTIONS = ["Allowed", "Required", "Disabled"];
const TRANSPORT_OPTIONS   = ["Auto", "UDP", "TCP", "TLS"];

const SOURCE_BADGE = {
  system:   { label: "System",   cls: "bg-purple-50 text-purple-600" },
  external: { label: "External", cls: "bg-orange-50 text-orange-600" },
};

const PROVIDER_BADGE = {
  twilio: { label: "Twilio", cls: "bg-red-50 text-red-500" },
  sip:    { label: "SIP",    cls: "bg-blue-50 text-blue-600" },
};

// ── Icons ──────────────────────────────────────────────────────────────────────

function PhoneIcon({ size = 20, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.69h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 10a16 16 0 0 0 6.09 6.09l1.37-1.37a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  );
}

function XIcon({ size = 16, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className}>
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}

function ChevronDown({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
  );
}

function PlusIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
  );
}

function TrashIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
  );
}

function InfoIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
  );
}


function TwilioLogo() {
  return (
    <svg width="22" height="22" viewBox="0 0 30 30" fill="none">
      <circle cx="15" cy="15" r="15" fill="#F22F46"/>
      <circle cx="10.5" cy="10.5" r="3" fill="white"/>
      <circle cx="19.5" cy="10.5" r="3" fill="white"/>
      <circle cx="10.5" cy="19.5" r="3" fill="white"/>
      <circle cx="19.5" cy="19.5" r="3" fill="white"/>
    </svg>
  );
}

function SipIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="10" rx="2"/>
      <path d="M8 12h.01M12 12h.01M16 12h.01"/>
    </svg>
  );
}

// ── Reusable Components ────────────────────────────────────────────────────────

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none ${checked ? "bg-gray-900" : "bg-gray-300"}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-0"}`}/>
    </button>
  );
}

function Select({ value, onChange, options, className = "" }) {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full appearance-none border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent pr-8"
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"><ChevronDown/></span>
    </div>
  );
}

function Input({ placeholder, value, onChange, className = "" }) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none ${className}`}
    />
  );
}

function Label({ children }) {
  return <label className="block text-sm font-medium text-gray-700 mb-1.5">{children}</label>;
}

function SectionCard({ children, className = "" }) {
  return <div className={`border border-gray-100 rounded-xl p-5 bg-white ${className}`}>{children}</div>;
}

// ── Overlay / Drawer ───────────────────────────────────────────────────────────

function Overlay({ onClick }) {
  return <div onClick={onClick} className="fixed inset-0 bg-black/25 backdrop-blur-sm z-40 transition-opacity"/>;
}

function Drawer({ open, onClose, title, icon, children, wide = false, footer }) {
  return (
    <>
      {open && <Overlay onClick={onClose}/>}
      <div className={`fixed top-0 right-0 h-full ${wide ? "w-[520px]" : "w-[460px]"} bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 shrink-0">
          <span className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-md text-gray-600">{icon}</span>
          <h2 className="font-semibold text-gray-900 text-base">{title}</h2>
          <button onClick={onClose} className="ml-auto w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"><XIcon/></button>
        </div>
        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">{children}</div>

        {footer && (
          <div className="shrink-0 border-t border-gray-100 px-6 py-4">{footer}</div>
        )}
      </div>
    </>
  );
}

// ── Import Type Selection Modal ────────────────────────────────────────────────

function ImportSelectModal({ open, onClose, onSelect }) {
  const options = [
    {
      id: "twilio",
      icon: <TwilioLogo/>,
      title: "Import from Twilio",
      desc: "Connect a number from your Twilio account using Account SID credentials.",
    },
    {
      id: "system",
      icon: <PhoneIcon size={18}/>,
      title: "Choose System Number",
      desc: "Pick a ready-to-use number from our built-in pool — no external account needed.",
    },
    {
      id: "sip",
      icon: <SipIcon/>,
      title: "Import SIP Trunk",
      desc: "Forward calls from your SIP provider to ElevenLabs via inbound/outbound configuration.",
    },
    
  ];

  return (
    <>
      {open && <Overlay onClick={onClose}/>}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-gray-900 text-lg">Add phone number</h2>
              <button onClick={onClose} className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors"><XIcon/></button>
            </div>
            <p className="text-sm text-gray-500 mb-5">Choose how you'd like to add a phone number to your account.</p>
            <div className="space-y-3">
              {options.map(o => (
                <button
                  key={o.id}
                  onClick={() => { onClose(); onSelect(o.id); }}
                  className="w-full flex items-start gap-4 p-4 border border-gray-200 rounded-md hover:border-gray-300 hover:bg-gray-50 transition-all group text-left"
                >
                  <span className="w-9 h-9 flex items-center justify-center bg-gray-100 rounded-md group-hover:bg-gray-200 text-gray-600 shrink-0 mt-0.5">{o.icon}</span>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{o.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">{o.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Twilio Drawer ──────────────────────────────────────────────────────────────

function TwilioDrawer({ open, onClose }) {

  const [label, setLabel] = useState("");
  const [phone, setPhone] = useState("");
  const [sid, setSid] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = label.trim() && phone.trim() && sid.trim() && token.trim();

  const handleImport = async () => {
    if (!canSubmit || loading) return;
    setLoading(true);
    setError("");
    try {
      await axios.post("/app/import-twilio-phone-number", {
        label: label.trim(),
        phone_number: phone.trim(),
        source: "external",
        sid: sid.trim(),
        token: token.trim(),
      });
      onClose();
      setLabel(""); setPhone(""); setSid(""); setToken("");
    } catch (err) {
      setError(err?.response?.data?.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <div className="space-y-3">
      {error && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
          {error}
        </div>
      )}
      <button
        onClick={handleImport}
        disabled={!canSubmit || loading}
        className={`w-full flex items-center justify-center gap-2 text-sm font-medium py-2.5 rounded-md transition-colors ${
          canSubmit && !loading
            ? "bg-gray-900 text-white hover:bg-gray-700"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
        }`}
      >
        {loading && (
          <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
          </svg>
        )}
        {loading ? "Importing…" : "Import"}
      </button>
    </div>
  );

  return (
    <Drawer open={open} onClose={onClose} title="Import phone number from Twilio" icon={<TwilioLogo/>} footer={footer}>
      <div className="space-y-4">
        <div>
          <Label>Label</Label>
          <Input placeholder="Easy to identify name of the phone number" value={label} onChange={setLabel}/>
        </div>
        <div>
          <Label>Phone number</Label>
          <div className="flex gap-2">
            <div className="flex items-center gap-1.5 border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-700 bg-white shrink-0">
              <span className="text-base">🇺🇸</span>
              <span>+1</span>
              <ChevronDown/>
            </div>
            <Input placeholder="(555) 000-0000" value={phone} onChange={setPhone} className="flex-1"/>
          </div>
        </div>
        <div>
          <Label>Twilio Account SID</Label>
          <Input placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" value={sid} onChange={setSid}/>
        </div>
        <div>
          <Label>Auth Token</Label>
          <input
            type="password"
            placeholder="••••••••••••••••••••••••••••••••"
            value={token}
            onChange={e => setToken(e.target.value)}
            className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none "
          />
        </div>
      </div>
    </Drawer>
  );
}

// ── SIP Trunk Drawer ───────────────────────────────────────────────────────────

function SipDrawer({ open, onClose }) {

  // Basic
  const [label, setLabel] = useState("");
  const [phone, setPhone] = useState("");

  // Inbound
  const [inboundEncryption, setInboundEncryption] = useState("Allowed");
  const [allowedNumbers, setAllowedNumbers]       = useState([]);
  const [allowedIPs, setAllowedIPs]               = useState(["0.0.0.0/0"]);
  const [domains, setDomains]                     = useState([]);
  const [inboundUser, setInboundUser]             = useState("");
  const [inboundPass, setInboundPass]             = useState("");

  // Outbound
  const [outboundAddr, setOutboundAddr]           = useState("");
  const [outboundTransport, setOutboundTransport] = useState("Auto");
  const [outboundEncryption, setOutboundEncryption] = useState("Allowed");
  const [outboundUser, setOutboundUser]           = useState("");
  const [outboundPass, setOutboundPass]           = useState("");
  const [outboundHeaders, setOutboundHeaders]     = useState([]); // [{ key, value }]

  // UI
  const [infoVisible, setInfoVisible] = useState(true);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");

  const addItem    = (list, setList)          => setList([...list, ""]);
  const removeItem = (list, setList, i)       => setList(list.filter((_, idx) => idx !== i));
  const updateItem = (list, setList, i, val)  => setList(list.map((x, idx) => idx === i ? val : x));

  const addHeader    = ()         => setOutboundHeaders(h => [...h, { key: "", value: "" }]);
  const removeHeader = (i)        => setOutboundHeaders(h => h.filter((_, idx) => idx !== i));
  const updateHeader = (i, field, val) =>
    setOutboundHeaders(h => h.map((x, idx) => idx === i ? { ...x, [field]: val } : x));

  const handleImport = async () => {
    setError("");
    setLoading(true);
    try {
      const headersObj = outboundHeaders.reduce((acc, { key, value }) => {
        if (key.trim()) acc[key.trim()] = value;
        return acc;
      }, {});

      await axios.post("/app/import-phone-number-by-sip", {
        label:        label.trim(),
        phone_number: phone.trim(),
        inbound: {
          allowed_addresses: allowedIPs.filter(Boolean),
          allowed_numbers:   allowedNumbers.filter(Boolean),
          media_encryption:  inboundEncryption.toLowerCase(),
          credentials: {
            username: inboundUser || undefined,
            password: inboundPass || undefined,
          },
          remote_domains: domains.filter(Boolean),
        },
        outbound: {
          address:          outboundAddr.trim() || undefined,
          transport:        outboundTransport.toLowerCase(),
          media_encryption: outboundEncryption.toLowerCase(),
          headers:          Object.keys(headersObj).length ? headersObj : undefined,
          credentials: {
            username: outboundUser || undefined,
            password: outboundPass || undefined,
          },
        },
      });

      onClose();
    } catch (err) {
      setError(err?.response?.data?.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer open={open} onClose={onClose} title="Import SIP Trunk" icon={<SipIcon/>} wide>
      <div className="space-y-5">
        <SectionCard>
          <div className="space-y-4">
            <div>
              <Label>Label</Label>
              <Input placeholder="Name of the phone number" value={label} onChange={setLabel}/>
            </div>
            <div>
              <Label>Phone number</Label>
              <Input placeholder="Phone number +12025550123, SIP extension 1234 or any other identifier" value={phone} onChange={setPhone}/>
            </div>
          </div>
        </SectionCard>

        {infoVisible && (
          <div className="flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-md p-4 text-sm text-gray-600">
            <InfoIcon size={15} className="shrink-0 mt-0.5 text-gray-500"/>
            <div className="flex-1 leading-relaxed">
              <span className="font-medium text-gray-800">Static IP SIP Servers Available</span>
              <p className="mt-1">ElevenLabs offers SIP servers with static IP addresses for enterprise clients requiring IP allowlisting. Available for enterprise accounts. <span className="underline cursor-pointer">Contact sales</span> to learn more.</p>
            </div>
            <button onClick={() => setInfoVisible(false)} className="text-gray-400 hover:text-gray-600 shrink-0"><XIcon size={14}/></button>
          </div>
        )}

        {/* Inbound */}
        <div>
          <div className="text-sm font-semibold text-gray-900 mb-1">Inbound Configuration</div>
          <p className="text-xs text-gray-500 mb-3">Forward calls to the ElevenLabs SIP server</p>
          <SectionCard className="space-y-4">
            <div>
              <Label>Media Encryption</Label>
              <Select value={inboundEncryption} onChange={setInboundEncryption} options={ENCRYPTION_OPTIONS}/>
            </div>
            <div>
              <Label>Allowed Numbers <span className="text-gray-400 font-normal">(Optional)</span></Label>
              <p className="text-xs text-gray-500 mb-2">Phone numbers that are allowed to use this trunk. Leave empty to allow all numbers.</p>
              {allowedNumbers.map((n, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <Input placeholder="+12025550100" value={n} onChange={v => updateItem(allowedNumbers, setAllowedNumbers, i, v)} className="flex-1"/>
                  <button onClick={() => removeItem(allowedNumbers, setAllowedNumbers, i)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><TrashIcon/></button>
                </div>
              ))}
              <button onClick={() => addItem(allowedNumbers, setAllowedNumbers)} className="flex items-center gap-1.5 text-sm text-gray-700 border border-gray-200 rounded-md px-3 py-1.5 hover:bg-gray-50 transition-colors">
                <PlusIcon size={13}/> Add Number
              </button>
            </div>
            <div>
              <Label>Allowed Source IP Addresses <span className="text-gray-400 font-normal">(Optional)</span></Label>
              <p className="text-xs text-gray-500 mb-2">Works only for TCP/TLS transport, not UDP. Leave as 0.0.0.0/0 to allow all addresses.</p>
              {allowedIPs.map((ip, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <Input placeholder="0.0.0.0/0" value={ip} onChange={v => updateItem(allowedIPs, setAllowedIPs, i, v)} className="flex-1"/>
                  <button onClick={() => removeItem(allowedIPs, setAllowedIPs, i)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><TrashIcon/></button>
                </div>
              ))}
              <button onClick={() => addItem(allowedIPs, setAllowedIPs)} className="flex items-center gap-1.5 text-sm text-gray-700 border border-gray-200 rounded-md px-3 py-1.5 hover:bg-gray-50 transition-colors">
                <PlusIcon size={13}/> Add IP Address
              </button>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Label>Remote Domains <span className="text-gray-400 font-normal">(Optional)</span></Label>
                <InfoIcon size={13} className="text-gray-400 -mt-1"/>
              </div>
              <p className="text-xs text-gray-500 mb-2">Specify FQDN domains of your SIP servers. Leave empty if you don't use TLS.</p>
              {domains.map((d, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <Input placeholder="example.pstn.twilio.com" value={d} onChange={v => updateItem(domains, setDomains, i, v)} className="flex-1"/>
                  <button onClick={() => removeItem(domains, setDomains, i)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><TrashIcon/></button>
                </div>
              ))}
              <button onClick={() => addItem(domains, setDomains)} className="flex items-center gap-1.5 text-sm text-gray-700 border border-gray-200 rounded-md px-3 py-1.5 hover:bg-gray-50 transition-colors">
                <PlusIcon size={13}/> Add Domain
              </button>
            </div>
            <div>
              <Label>Authentication <span className="text-gray-400 font-normal">(Optional)</span></Label>
              <p className="text-xs text-gray-500 mb-3">Provide digest authentication credentials for inbound calls.</p>
              <div className="space-y-3">
                <div>
                  <Label>SIP Trunk Username</Label>
                  <Input placeholder="Username for SIP digest authentication" value={inboundUser} onChange={setInboundUser}/>
                </div>
                <div>
                  <Label>SIP Trunk Password</Label>
                  <input type="password" placeholder="Password for SIP digest authentication" value={inboundPass} onChange={e => setInboundPass(e.target.value)}
                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent"/>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Outbound */}
        <div>
          <div className="text-sm font-semibold text-gray-900 mb-1">Outbound Configuration</div>
          <p className="text-xs text-gray-500 mb-3">Configure where ElevenLabs should send calls for your phone number</p>
          <SectionCard className="space-y-4">
            <div>
              <Label>Address</Label>
              <Input placeholder="example.pstn.twilio.com" value={outboundAddr} onChange={setOutboundAddr}/>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">Hostname or IP the SIP INVITE is sent to. Not a SIP URI — don't include the sip: protocol. For TLS, use the hostname with a valid certificate.</p>
            </div>
            <div>
              <Label>Transport</Label>
              <Select value={outboundTransport} onChange={setOutboundTransport} options={TRANSPORT_OPTIONS}/>
            </div>
            <div>
              <Label>Media Encryption</Label>
              <Select value={outboundEncryption} onChange={setOutboundEncryption} options={ENCRYPTION_OPTIONS}/>
            </div>
            <div>
              <Label>Authentication <span className="text-gray-400 font-normal">(Optional)</span></Label>
              <p className="text-xs text-gray-500 mb-3">Credentials used when authenticating outbound calls.</p>
              <div className="space-y-3">
                <div>
                  <Label>Username</Label>
                  <Input placeholder="Outbound SIP username" value={outboundUser} onChange={setOutboundUser}/>
                </div>
                <div>
                  <Label>Password</Label>
                  <input type="password" placeholder="Outbound SIP password" value={outboundPass} onChange={e => setOutboundPass(e.target.value)}
                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"/>
                </div>
              </div>
            </div>
            <div>
              <Label>Custom Headers <span className="text-gray-400 font-normal">(Optional)</span></Label>
              <p className="text-xs text-gray-500 mb-2">Extra SIP headers to include in outbound INVITE requests.</p>
              {outboundHeaders.map((h, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <Input placeholder="Header name" value={h.key} onChange={v => updateHeader(i, "key", v)} className="flex-1"/>
                  <Input placeholder="Value" value={h.value} onChange={v => updateHeader(i, "value", v)} className="flex-1"/>
                  <button onClick={() => removeHeader(i)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><TrashIcon/></button>
                </div>
              ))}
              <button onClick={addHeader} className="flex items-center gap-1.5 text-sm text-gray-700 border border-gray-200 rounded-md px-3 py-1.5 hover:bg-gray-50 transition-colors">
                <PlusIcon size={13}/> Add Header
              </button>
            </div>
          </SectionCard>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          onClick={handleImport}
          disabled={loading}
          className="w-full bg-gray-900 text-white text-sm font-medium py-2.5 rounded-md hover:bg-gray-700 transition-colors mt-2 disabled:opacity-50"
        >
          {loading ? "Importing..." : "Import"}
        </button>
      </div>
    </Drawer>
  );
}

// ── System Numbers Modal ───────────────────────────────────────────────────────

function SystemNumbersModal({ open, onClose }) {

  const [label, setLabel] = useState("");
  const [selected, setSelected] = useState(null);   // { friendlyName, phoneNumber }
  const [typeFilter, setTypeFilter] = useState("local"); // "" | "local" | "toll_free"
  const [areaCode, setAreaCode] = useState("");
  const [numbers, setNumbers] = useState([]);
  const [type,setType] = useState('');
  const [loading, setLoading] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [error, setError] = useState("");
  const debounceRef = useRef(null);
  
  // Fetch whenever modal opens or filters change
  useEffect(() => {
    if (!open) return;

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = {};
      if (typeFilter) params.type = typeFilter;
      if (areaCode.trim()) params.area_code = areaCode.trim();

      setLoading(true);
      setSelected(null);
      axios
        .get("/app/available-numbers", { params })
        .then(res => {
           setNumbers(res.data?.numbers ?? [])
           setType(res.data?.type)
        })
        .catch(() => setNumbers([]))
        .finally(() => {
           setLoading(false)
           console.log(numbers)
        });
    }, 400);

    return () => clearTimeout(debounceRef.current);
  }, [open, typeFilter, areaCode]);

  const handleImport = async (selected) => {

    setButtonLoading(true);
    setError("");
 
     try {

      await axios.post("/app/import-twilio-phone-number", {

        label: label.trim(),
        phone_number: selected?.phone_number,
        source: "system",
       
      });

      onClose();
      setLabel("");

    } catch (err) {
      setError(err?.response?.data?.message ?? "Something went wrong. Please try again.");
    } finally {
      setButtonLoading(false);
    }
  }

  const handleClose = () => {
    setLabel("");
    setSelected(null);
    setTypeFilter("");
    setAreaCode("");
    setNumbers([]);
    setError("");
    onClose();
  };

  const TYPE_BADGES = [
    { value: "local",     label: "Local" },
    { value: "toll_free", label: "Toll-Free" },
  ];

  return (
    <>
      {open && <Overlay onClick={handleClose}/>}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-md shadow-2xl w-full max-w-lg flex flex-col max-h-[85vh]">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center text-gray-600">
                  <PhoneIcon size={16}/>
                </span>
                <h2 className="font-semibold text-gray-900">Choose System Number</h2>
              </div>
              <button onClick={handleClose} className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                <XIcon/>
              </button>
            </div>

            {/* Label */}
            <div className="px-6 pt-4 pb-3 border-b border-gray-100">
              <Label>Label</Label>
              <Input placeholder="Easy to identify name of the phone number" value={label} onChange={setLabel}/>
            </div>

            {/* Filters */}
            <div className="px-6 pt-3 pb-3 border-b border-gray-100 space-y-3">
              {/* Type badges */}
              <div className="flex gap-1.5">
                {TYPE_BADGES.map(b => (
                  <button
                    key={b.value}
                    onClick={() => setTypeFilter(b.value)}
                    className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                      typeFilter === b.value
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>

              {/* Area code input */}
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium select-none">
                  Area code
                </span>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 415"
                  value={areaCode}
                  onChange={e => setAreaCode(e.target.value.replace(/\D/g, ""))}
                  className="w-full border border-gray-200 rounded-md pl-20 pr-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Numbers list */}
            <div className="flex-1 overflow-y-auto px-6 py-3 space-y-2 min-h-[180px]">
              {loading && (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <svg className="animate-spin text-gray-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
                  </svg>
                  <span className="text-xs text-gray-400">Loading available numbers…</span>
                </div>
              )}

              {!loading && numbers.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
                  <span className="text-2xl">📭</span>
                  <span className="text-sm font-medium text-gray-700">No numbers found</span>
                  <span className="text-xs text-gray-400">Try adjusting the type or area code filter.</span>
                </div>
              )}

              {!loading && numbers.map((n, idx) => (
                <button
                  key={n.phone_number ?? idx}
                  onClick={() => setSelected(prev => prev?.phone_number === n.phone_number ? null : n)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-md border transition-all text-left ${
                    selected?.phone_number === n.phone_number
                      ? "border-gray-900 bg-gray-50 ring-1 ring-gray-900"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <div>
                    <div className="text-sm font-medium text-gray-900">{n.friendly_name}</div>
                    <span className={`inline-block border mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                      type === "toll_free"
                        ? "bg-blue-50 text-blue-600"
                        : "bg-green-50 text-green-600"
                    }`}>
                      {type === "toll_free" ? "Toll-Free" : "Local"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {selected?.phone_number === n.phone_number && (
                      <span className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center">
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <polyline points="2,5 4,7 8,3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {error && (
              <div className="px-6 py-2 text-xs text-red-600 bg-red-50 border-t border-red-100">
                {error}
              </div>
            )}

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={handleClose} className="flex-1 border border-gray-200 text-sm text-gray-700 font-medium py-2.5 rounded-md hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button
                disabled={!selected || !label || buttonLoading}
                onClick={() => handleImport(selected)}
                className={`flex-1 text-sm font-medium py-2.5 rounded-md transition-colors flex items-center justify-center gap-2 ${
                  selected && label && !buttonLoading
                    ? "bg-gray-900 text-white hover:bg-gray-700"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                {buttonLoading && (
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
                  </svg>
                )}
                {buttonLoading ? "Adding…" : "Add Number"}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}

function NumberDetailDrawer({ open, onClose, item }) {

  const [agents, setAgents]             = useState([]);
  const [agentsLoading, setAgentsLoading] = useState(false);
  const [agentsError, setAgentsError]   = useState("");

  // label
  const [label, setLabel]               = useState("");
  const [labelSaving, setLabelSaving]   = useState(false);
  const [labelError, setLabelError]     = useState("");
  const labelDebounceRef                = useRef(null);

  // agent
  const [agentSaving, setAgentSaving]   = useState(false);
  const [agentError, setAgentError]     = useState("");

  // Seed label from item when drawer opens
  useEffect(() => {
    if (!open || !item) return;
    setLabel(item.label ?? "");
    setLabelError("");
    setAgentError("");
  }, [open, item]);

  // Load agents automatically when the drawer opens
  useEffect(() => {
    if (!open) return;
    setAgentsLoading(true);
    setAgentsError("");
    setAgents([]);
    axios.get("/app/get-agents")
      .then(res => setAgents(res.data?.agents ?? []))
      .catch(() => setAgentsError("Failed to load agents"))
      .finally(() => setAgentsLoading(false));
  }, [open]);

  // ── Label: debounced save ─────────────────────────────────────────────────
  const handleLabelChange = (val) => {
    setLabel(val);
    setLabelError("");
    clearTimeout(labelDebounceRef.current);
    if (!val.trim()) return;
    labelDebounceRef.current = setTimeout(() => {
      setLabelSaving(true);
      axios.post("/app/update-phone-number", {
        phone_number_id: item.phone_number_id,
        update_item:     "label",
        label:           val.trim(),
      })
        .catch(() => setLabelError("Failed to save label."))
        .finally(() => setLabelSaving(false));
    }, 600);
  };

  // ── Agent: post on select change ──────────────────────────────────────────
  const handleAgentChange = (e) => {
    const agentId    = e.target.value;
    const isRemoving = agentId === "";
    setAgentError("");
    setAgentSaving(true);
    axios.post("/app/update-phone-number", {
      phone_number_id: item.phone_number_id,
      update_item:     isRemoving ? "remove_agent" : "select_agent",
      ...(isRemoving ? {} : { agent_id: agentId }),
    })
      .catch(() => setAgentError("Failed to update agent."))
      .finally(() => setAgentSaving(false));
  };

  const handleDetach = () => {
    setAgentError("");
    setAgentSaving(true);
    axios.post("/app/update-phone-number", {
      phone_number_id: item.phone_number_id,
      update_item:     "remove_agent",
    })
      .catch(() => setAgentError("Failed to detach agent."))
      .finally(() => setAgentSaving(false));
  };

  const retryLoadAgents = () => {
    setAgentsLoading(true);
    setAgentsError("");
    axios.get("/app/get-agents")
      .then(res => setAgents(res.data?.agents ?? []))
      .catch(() => setAgentsError("Failed to load agents"))
      .finally(() => setAgentsLoading(false));
  };

  const handleClose = () => {
    clearTimeout(labelDebounceRef.current);
    setAgents([]);
    setAgentsError("");
    setLabelError("");
    setAgentError("");
    onClose();
  };

  if (!item) return null;

  const source     = SOURCE_BADGE[item.source]     ?? { label: item.source,    cls: "bg-gray-100 text-gray-500" };
  const provider   = PROVIDER_BADGE[item.provider] ?? { label: item.provider,  cls: "bg-gray-100 text-gray-500" };
  const currentAgentId = item?.assigned_agent?.agent_id ?? "";

  return (
    <Drawer open={open} onClose={handleClose} title="Phone Number" icon={<PhoneIcon size={16}/>} wide>

      {/* ── Header ── */}
      <div className="pb-1">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xl font-semibold text-gray-900 tracking-wide">{item.phone_number}</span>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" className="text-green-500 shrink-0">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/>
                <polyline points="8,12 11,15 16,9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="text-xs text-gray-400 mt-1 font-mono">{item.phone_number_id}</div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 mt-1">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${source.cls}`}>{source.label}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${provider.cls}`}>{provider.label}</span>
          </div>
        </div>
      </div>

      {/* ── Label ── */}
      <SectionCard>
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-gray-900">Label</div>
            <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">
              A friendly name to identify this phone number.
            </div>
          </div>
          <div className="shrink-0 w-52">
            <div className="relative">
              <input
                type="text"
                value={label}
                onChange={e => handleLabelChange(e.target.value)}
                className="w-full border border-gray-200 rounded-md px-3 py-2  text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="e.g. Support line"
              />
            </div>

            {labelSaving && <p className="text-sm text-gray-500 mt-1.5">Saving...</p>}
            {labelError && <p className="text-[10px] text-red-500 mt-1">{labelError}</p>}

          </div>
        </div>
      </SectionCard>

      {/* ── Agent ── */}
      <SectionCard>
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-gray-900">Agent</div>
            <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">
              Assign an agent to handle calls to this phone number.
            </div>
          </div>

          <div className="shrink-0 w-52">
            
            {/* Loading skeleton */}
            {agentsLoading ? (
              <div className="w-full h-9 bg-gray-100 rounded-md animate-pulse flex items-center px-3 gap-2">
                <div className="h-2.5 bg-gray-300 rounded w-2/3"/>
                <div className="ml-auto h-3 w-3 bg-gray-300 rounded"/>
              </div>
            ) : agentsError ? (
              <div className="flex items-center justify-between gap-2 border border-red-100 bg-red-50 rounded-md px-3 py-2">
                <p className="text-xs text-red-500">{agentsError}</p>
                <button onClick={retryLoadAgents} className="text-xs text-red-500 underline hover:text-red-700 shrink-0">Retry</button>
              </div>
            ) : (
              <div className="relative">
                <select
                  defaultValue={currentAgentId}
                  onChange={handleAgentChange}
                  disabled={agentSaving}
                  className="w-full appearance-none border border-gray-200 rounded-md pl-3 pr-8 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:opacity-60 cursor-pointer"
                >
                  <option value="">No agent</option>
                  {agents.map(a => (
                    <option key={a.agent_id} value={a.agent_id}>{a.agent_name}</option>
                  ))}
                </select>
              
              </div>
            )}

            {agentError && <p className="text-[10px] text-red-500 mt-1.5">{agentError}</p>}

            {agentSaving && <p className="text-sm text-gray-500 mt-1.5">Saving...</p>}

          </div>
        </div>
      </SectionCard>

    </Drawer>
  );
  
}



// ── Main Page ──────────────────────────────────────────────────────────────────
function NumberRow({ item, onClick }) {

  const source   = SOURCE_BADGE[item.source]   ?? { label: item.source,   cls: "bg-gray-100 text-gray-500" };
  const provider = PROVIDER_BADGE[item.provider] ?? { label: item.provider, cls: "bg-gray-100 text-gray-500" };

  return (
    <button
      onClick={() => onClick(item)}
      className="w-full flex items-center gap-4 px-5 py-4 border border-gray-100 rounded-xl bg-white hover:border-gray-300 hover:shadow-sm transition-all text-left group"
    >
      {/* Icon */}
      <span className="w-9 h-9 flex items-center justify-center bg-gray-100 rounded-md text-gray-500 group-hover:bg-gray-200 transition-colors shrink-0">
        <PhoneIcon size={16}/>
      </span>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-900 truncate">{item.label}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${source.cls}`}>{source.label}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${provider.cls}`}>{provider.label}</span>
        </div>
        <div className="text-sm text-gray-400 mt-0.5 font-mono">{item.phone_number}</div>
        {item.assigned_agent && (
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Agent:</span>
            <span className="text-xs text-gray-600 truncate">{item.assigned_agent.agent_name}</span>
          </div>
        )}
      </div>

      {/* Chevron */}
      <span className="text-gray-300 group-hover:text-gray-500 transition-colors shrink-0">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
      </span>
    </button>
  );
}
export default function PhoneNumbers({ numbers }) {

  const [selectOpen, setSelectOpen] = useState(false);
  const [twilioOpen, setTwilioOpen] = useState(false);
  const [sipOpen, setSipOpen] = useState(false);
  const [systemOpen, setSystemOpen] = useState(false);
  const [detailItem, setDetailItem] = useState(null);

  const handleSelect = (type) => {
    if (type === "twilio") setTwilioOpen(true);
    else if (type === "sip") setSipOpen(true);
    else if (type === "system") setSystemOpen(true);
  };

  const handleRowClick = (item) => setDetailItem(item);

  const isEmpty = !numbers || numbers.length === 0;

  return (

        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Phone Numbers
                </h2>
            }
        >
            <Head title="Phone Numbers" />

            <div style={{ fontFamily: "'DM Sans', sans-serif" }}>

                <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>

                <div className="max-w-7xl mx-auto px-6 py-10">
                    {/* Page header */}
                    <div className="flex items-center justify-between mb-7">
                        <h1 className="text-2xl font-semibold text-gray-900">Phone Numbers</h1>
                        <button
                            onClick={() => setSelectOpen(true)}
                            className="flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-4 py-2.5 rounded-md hover:bg-gray-700 transition-colors"
                        >
                            <PlusIcon/> Import number
                        </button>
                    </div>

                     {/* Empty state */}
                      {isEmpty ? (
                        <div className="flex flex-col items-center justify-center border border-gray-100 rounded-md bg-gray-50 py-16 px-6 text-center">
                          <span className="w-12 h-12 flex items-center justify-center border border-gray-200 rounded-md bg-white text-gray-400 mb-4 shadow-sm">
                            <PhoneIcon size={22}/>
                          </span>
                          <div className="text-sm font-semibold text-gray-900 mb-1">No phone numbers</div>
                          <div className="text-sm text-gray-500 mb-5">You don't have any phone numbers yet.</div>
                          <button
                            onClick={() => setSelectOpen(true)}
                            className="flex items-center gap-2 text-sm text-gray-700 border border-gray-200 bg-white px-4 py-2 rounded-md hover:border-gray-400 hover:bg-gray-50 transition-colors"
                          >
                            <PlusIcon size={13}/> Import number
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {numbers.map((item) => (
                            <NumberRow key={item.phone_number_id ?? item.phone_number} item={item} onClick={handleRowClick} />
                          ))}
                        </div>
                      )}
                </div>

                <ImportSelectModal open={selectOpen} onClose={() => setSelectOpen(false)} onSelect={handleSelect}/>
                <TwilioDrawer open={twilioOpen} onClose={() => setTwilioOpen(false)}/>
                <SipDrawer open={sipOpen} onClose={() => setSipOpen(false)}/>
                <SystemNumbersModal open={systemOpen} onClose={() => setSystemOpen(false)}/>
                <NumberDetailDrawer open={!!detailItem} onClose={() => setDetailItem(null)} item={detailItem}/>
               
            </div>
        </AuthenticatedLayout>
  );
}