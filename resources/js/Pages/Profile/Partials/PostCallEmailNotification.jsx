import { useState, useEffect } from 'react';
import axios from 'axios';

export default function PostCallEmailNotification({ className = '' }) {

    const [loading, setLoading] = useState(false);
    const [input, setInput] = useState('');
    const [receivers, setReceivers] = useState([]);
    const [error, setError] = useState('');
    const [confirmEmail, setConfirmEmail] = useState(null);


    const isValidEmail = (email) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

    const handleAdd = async () => {

        setError('');

        const raw = input
            .split(/[\n,;]+/)
            .map((e) => e.trim())
            .filter(Boolean);

        if (!raw.length) return;

        const invalid = raw.filter((e) => !isValidEmail(e));
        if (invalid.length) {
            setError(`Invalid email${invalid.length > 1 ? 's' : ''}: ${invalid.join(', ')}`);
            return;
        }

        const dupes = raw.filter((e) => receivers.includes(e));
        if (dupes.length) {
            setError(`Already added: ${dupes.join(', ')}`);
            return;
        }

        try {

            setLoading(true);

            const res = await axios.post('/app/add-post-call-email-notification-receiver', {
                emails: raw
            });

            if (res.data.success) {
                setReceivers((prev) => [...prev, ...raw]);
                setInput('');
            }

        } catch (err) {

            if (err.response?.data?.errors) {
                const firstError = Object.values(err.response.data.errors)[0][0];
                setError(firstError);
            } else {
                setError('Failed to add receivers.');
            }

        } finally {

            setLoading(false);
        }
    };

    const handleRemove = (email) => setConfirmEmail(email);

    const confirmRemove = async () => {

        try {
    
            await axios.post('/app/remove-post-call-email-notification-receiver', {
                
                email: confirmEmail
                
            });
    
            setReceivers((prev) => prev.filter((e) => e !== confirmEmail));
            setConfirmEmail(null);
    
        } catch (err) {
    
            console.error(err);
            alert('Failed to remove email');
    
        }
    }

    const handleKeyDown = (e) => {
        if ((e.key === 'Enter' && !e.shiftKey)) {
            e.preventDefault();
            handleAdd();
        }
    };

    useEffect(() => {

        const loadReceivers = async () => {
    
            try {
    
                const res = await axios.get('/app/post-call-email-notification-receivers');
    
                setReceivers(res.data.receivers);
    
            } catch (e) {
                console.error(e);
            }
    
        };
    
        loadReceivers();
    
    }, []);

    return (
        <section className={className} style={{ fontFamily: "'Inter', sans-serif" }}>
            
            <style>{`
                .pce-header { margin-bottom: 1.5rem; }
                .pce-title  { font-size: 0.9375rem; font-weight: 600; color: #111; margin: 0 0 0.25rem; }
                .pce-sub    { font-size: 0.8125rem; color: #666; margin: 0; line-height: 1.5; }
 
                .pce-textarea {
                    width: 100%; min-height: 90px;
                    padding: 0.75rem 1rem;
                    font-size: 0.875rem; font-family: inherit;
                    color: #111; background: #fff;
                    border: 1px solid #c8c8c8; border-radius: 8px;
                    resize: vertical; outline: none;
                    transition: border-color 0.15s;
                    line-height: 1.6;
                }
                .pce-textarea::placeholder { color: #999; }
                .pce-textarea:focus { border-color: #6366f1; }
 
                .pce-hint {
                    font-size: 0.75rem; color: #888;
                    margin: 0.4rem 0 0; line-height: 1.4;
                }
 
                .pce-error {
                    font-size: 0.75rem; color: #c00;
                    margin: 0.4rem 0 0;
                }
 
                .pce-add-btn {
                    margin-top: 0.75rem;
                    display: inline-flex; align-items: center; gap: 0.35rem;
                    padding: 0.55rem 1.25rem;
                    font-size: 0.8125rem; font-weight: 500; font-family: inherit;
                    background: #111; color: #fff;
                    border: none; border-radius: 7px; cursor: pointer;
                    transition: opacity 0.15s;
                }
                .pce-add-btn:hover { opacity: 0.78; }
                .pce-add-btn:disabled { opacity: 0.35; cursor: not-allowed; }
 
                /* receivers */
                .pce-receivers {
                    margin-top: 1.5rem;
                    border: 1px solid #c8c8c8; border-radius: 8px;
                    overflow: hidden;
                }
 
                .pce-receivers-header {
                    display: flex; align-items: center; justify-content: space-between;
                    padding: 0.7rem 1rem;
                    background: #f4f4f4; border-bottom: 1px solid #c8c8c8;
                }
 
                .pce-receivers-label {
                    font-size: 0.75rem; font-weight: 600;
                    color: #666; letter-spacing: 0.06em; text-transform: uppercase;
                }
 
                .pce-count {
                    font-size: 0.7rem; font-weight: 600;
                    background: #111; color: #fff;
                    padding: 0.15rem 0.55rem; border-radius: 100px;
                    letter-spacing: 0.02em;
                }
 
                .pce-empty {
                    padding: 1.5rem 1rem; text-align: center;
                    font-size: 0.8125rem; color: #999;
                }
 
                .pce-list { list-style: none; margin: 0; padding: 0; }
 
                .pce-item {
                    display: flex; align-items: center;
                    justify-content: space-between;
                    padding: 0.65rem 1rem;
                    border-bottom: 1px solid #e4e4e4;
                    transition: background 0.1s;
                }
                .pce-item:last-child { border-bottom: none; }
                .pce-item:hover { background: #f7f7f7; }
 
                .pce-email {
                    font-size: 0.875rem; color: #111;
                    display: flex; align-items: center; gap: 0.6rem;
                }
 
                .pce-email-dot {
                    width: 6px; height: 6px; border-radius: 50%;
                    background: #bbb; flex-shrink: 0;
                }
 
                .pce-remove {
                    background: none; border: none; cursor: pointer;
                    padding: 0.3rem; border-radius: 5px;
                    color: #999; display: flex; align-items: center;
                    transition: color 0.15s, background 0.15s;
                    font-size: 0; line-height: 0;
                }
                .pce-remove:hover { color: #111; background: #ebebeb; }
 
                /* confirm modal */
                .pce-overlay {
                    position: fixed; inset: 0; z-index: 50;
                    background: rgba(0,0,0,0.35);
                    display: flex; align-items: center; justify-content: center;
                    padding: 1rem;
                    animation: pceOverlayIn 0.15s ease both;
                }
                @keyframes pceOverlayIn {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
 
                .pce-modal {
                    background: #fff;
                    border: 1px solid #c8c8c8;
                    border-radius: 12px;
                    padding: 1.75rem;
                    width: 100%; max-width: 380px;
                    box-shadow: 0 8px 40px rgba(0,0,0,0.14);
                    animation: pceModalIn 0.18s ease both;
                }
                @keyframes pceModalIn {
                    from { opacity: 0; transform: translateY(8px) scale(0.98); }
                    to   { opacity: 1; transform: translateY(0)  scale(1); }
                }
 
                .pce-modal-icon {
                    width: 40px; height: 40px; border-radius: 10px;
                    background: #f0f0f0;
                    display: flex; align-items: center; justify-content: center;
                    margin-bottom: 1rem;
                }
 
                .pce-modal-title {
                    font-size: 0.9375rem; font-weight: 600;
                    color: #111; margin: 0 0 0.4rem;
                }
 
                .pce-modal-body {
                    font-size: 0.9rem; color: #666;
                    line-height: 1.6; margin: 0 0 1.5rem;
                }
 
                .pce-modal-email {
                    display: inline-block;
                    font-weight: 500; color: #111;
                    word-break: break-all;
                }
 
                .pce-modal-actions {
                    display: flex; gap: 0.625rem; justify-content: flex-end;
                }
 
                .pce-modal-cancel {
                    padding: 0.55rem 1.1rem;
                    font-size: 0.8125rem; font-weight: 500; font-family: inherit;
                    background: #fff; color: #111;
                    border: 1px solid #c8c8c8; border-radius: 7px;
                    cursor: pointer; transition: background 0.15s, border-color 0.15s;
                }
                .pce-modal-cancel:hover { background: #f4f4f4; border-color: #aaa; }
 
                .pce-modal-confirm {
                    padding: 0.55rem 1.1rem;
                    font-size: 0.8125rem; font-weight: 500; font-family: inherit;
                    background: #111; color: #fff;
                    border: 1px solid #111; border-radius: 7px;
                    cursor: pointer; transition: opacity 0.15s;
                }
                .pce-modal-confirm:hover { opacity: 0.78; }
            `}</style>

            <div className="pce-header">
                <h2 className="pce-title">Post Call Notification</h2>
                <p className="pce-sub">
                    Add email addresses to receive notifications after an agent call ends.
                </p>
            </div>

            {/* Input */}
            <textarea
                className="pce-textarea"
                placeholder="e.g. alice@company.com, bob@company.com"
                value={input}
                onChange={(e) => { setInput(e.target.value); setError(''); }}
                onKeyDown={handleKeyDown}
            />

            {error
                ? <p className="pce-error">{error}</p>
                : <p className="pce-hint">Separate multiple emails with commas, semicolons, or new lines. Press Enter to add.</p>
            }

            <button
                className="pce-add-btn"
                onClick={handleAdd}
                disabled={!input.trim() || loading}
            >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
                {loading ? 'Adding...' : 'Add'}
            </button>

            {/* Receivers list */}
            <div className="pce-receivers">
                <div className="pce-receivers-header">
                    <span className="pce-receivers-label">Receivers</span>
                    {receivers.length > 0 && (
                        <span className="pce-count">{receivers.length}</span>
                    )}
                </div>

                {receivers.length === 0 ? (
                    <p className="pce-empty">No receivers added yet.</p>
                ) : (
                    <ul className="pce-list">
                        {receivers.map((email) => (
                            <li key={email} className="pce-item">
                                <span className="pce-email">
                                    <span className="pce-email-dot" />
                                    {email}
                                </span>
                                <button
                                    className="pce-remove"
                                    onClick={() => handleRemove(email)}
                                    title={`Remove ${email}`}
                                >
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                                        <path d="M11 3L3 11M3 3l8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                                    </svg>
                                    Remove
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {confirmEmail && (
                <div className="pce-overlay" onClick={() => setConfirmEmail(null)}>
                    <div className="pce-modal" onClick={(e) => e.stopPropagation()}>
                    
                        <h3 className="pce-modal-title">Remove receiver?</h3>
                        <p className="pce-modal-body">
                            <span className="pce-modal-email">{confirmEmail}</span> will no
                            longer receive post-call notifications.
                        </p>
                        <div className="pce-modal-actions">
                            <button className="pce-modal-cancel" onClick={() => setConfirmEmail(null)}>
                                Cancel
                            </button>
                            <button className="pce-modal-confirm" onClick={confirmRemove}>
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </section>
    );
}