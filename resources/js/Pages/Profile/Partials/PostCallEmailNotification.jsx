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
        <section className={`font-inter ${className}`}>

            <div className="mb-6">
                <h2 className="text-[15px] font-semibold text-gray-900 mb-1">
                    Post Call Notification
                </h2>
                <p className="text-[13px] text-gray-500 leading-relaxed">
                    Add email addresses to receive notifications after an agent call ends.
                </p>
            </div>

            <textarea
                className="w-full min-h-[90px] resize-y rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-500 placeholder:text-gray-400"
                placeholder="e.g. alice@company.com, bob@company.com"
                value={input}
                onChange={(e) => { setInput(e.target.value); setError(''); }}
                onKeyDown={handleKeyDown}
            />

            {error ? (
                <p className="mt-1 text-xs text-red-600">{error}</p>
            ) : (
                <p className="mt-1 text-xs text-gray-500">
                    Separate multiple emails with commas, semicolons, or new lines. Press Enter to add.
                </p>
            )}

            <button
                className="mt-3 inline-flex items-center gap-1 rounded-md bg-gray-900 px-5 py-2 text-xs font-medium text-white transition hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed"
                onClick={handleAdd}
                disabled={!input.trim() || loading}
            >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
                {loading ? 'Adding...' : 'Add'}
            </button>

            <div className="mt-6 border border-gray-300 rounded-lg overflow-hidden">

                <div className="flex items-center justify-between bg-gray-100 border-b border-gray-300 px-4 py-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                        Receivers
                    </span>

                    {receivers.length > 0 && (
                        <span className="text-[11px] font-semibold bg-gray-900 text-white px-2 py-[2px] rounded-full">
                            {receivers.length}
                        </span>
                    )}
                </div>

                {receivers.length === 0 ? (
                    <p className="py-6 text-center text-sm text-gray-400">
                        No receivers added yet.
                    </p>
                ) : (
                    <ul>

                        {receivers.map((email) => (

                            <li
                                key={email}
                                className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 last:border-none hover:bg-gray-50"
                            >

                                <span className="flex items-center gap-2 text-sm text-gray-900">

                                    <span className="w-[6px] h-[6px] rounded-full bg-gray-400"></span>

                                    {email}

                                </span>

                                <button
                                    className="flex items-center rounded-md p-1 text-gray-400 hover:text-gray-900 hover:bg-gray-200"
                                    onClick={() => handleRemove(email)}
                                    title={`Remove ${email}`}
                                >
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                        <path d="M11 3L3 11M3 3l8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                                    </svg>
                                </button>

                            </li>

                        ))}

                    </ul>
                )}

            </div>

            {confirmEmail && (

                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
                    onClick={() => setConfirmEmail(null)}
                >

                    <div
                        className="w-full max-w-sm rounded-xl border border-gray-300 bg-white p-7 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <h3 className="text-[15px] font-semibold text-gray-900 mb-2">
                            Remove receiver?
                        </h3>

                        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                            <span className="font-medium text-gray-900 break-all">
                                {confirmEmail}
                            </span>{" "}
                            will no longer receive post-call notifications.
                        </p>

                        <div className="flex justify-end gap-2">

                            <button
                                className="px-4 py-2 text-xs font-medium rounded-md border border-gray-300 hover:bg-gray-100"
                                onClick={() => setConfirmEmail(null)}
                            >
                                Cancel
                            </button>

                            <button
                                className="px-4 py-2 text-xs font-medium rounded-md bg-gray-900 text-white hover:opacity-80"
                                onClick={confirmRemove}
                            >
                                Remove
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </section>
    );
}