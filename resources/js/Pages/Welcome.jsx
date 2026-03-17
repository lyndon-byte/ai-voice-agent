import { Head, Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { useElevenLabs } from '@/Contexts/ElevenLabsProvider';
import { useEffect } from 'react';
import ElevenLabsWidget from '@/Components/ElevenLabsWidget';

export default function Welcome({ auth, laravelVersion, phpVersion }) {
     
    const { agentId, setAgentId } = useElevenLabs()

    const bookingUrl = import.meta.env.VITE_LANDING_PAGE_BOOKING_URL

    useEffect(() => {
        setAgentId(import.meta.env.VITE_LANDING_PAGE_AGENT_ID)
        console.log(bookingUrl)
    },[])

    return (
        
        <>
            <Head title="TalkingToEleven — AI Voice & Agent Platform" />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

                :root {
                    --black:   #111111;
                    --white:   #ffffff;
                    --off:     #fafafa;
                    --border:  #e5e5e5;
                    --muted:   #6b6b6b;
                    --light:   #f4f4f4;
                }

                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
                html { scroll-behavior: smooth; }

                body {
                    background: var(--white);
                    color: var(--black);
                    font-family: 'Inter', sans-serif;
                    font-size: 16px;
                    line-height: 1.6;
                    -webkit-font-smoothing: antialiased;
                    overflow-x: hidden;
                }

                /* ── NAV ── */
                .nav {
                    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
                    height: 64px;
                    display: flex; align-items: center; justify-content: space-between;
                    padding: 0 2.5rem;
                    background: rgba(255,255,255,0.92);
                    border-bottom: 1px solid var(--border);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                }

                .nav-logo { height: 32px; width: auto; display: block; }

                .nav-links { display: flex; align-items: center; gap: 0.5rem; }

                .nav-link {
                    font-size: 0.875rem; font-weight: 400;
                    color: var(--muted); text-decoration: none;
                    padding: 0.4rem 0.75rem; border-radius: 6px;
                    transition: color 0.15s, background 0.15s;
                }
                .nav-link:hover { color: var(--black); background: var(--light); }

                .nav-btn {
                    font-size: 0.875rem; font-weight: 500;
                    background: var(--black); color: var(--white);
                    padding: 0.5rem 1.25rem; border-radius: 6px;
                    text-decoration: none; margin-left: 0.5rem;
                    transition: opacity 0.15s;
                }
                .nav-btn:hover { opacity: 0.8; }

                /* ── HERO ── */
                .hero {
                    min-height: 100vh;
                    padding-top: 64px;
                    display: flex; flex-direction: column;
                    border-bottom: 1px solid var(--border);
                }

                .hero-inner {
                    flex: 1;
                    display: flex; align-items: stretch;
                    overflow: hidden;
                }

                .hero-body {
                    flex: 1;
                    display: flex; flex-direction: column; justify-content: center;
                    padding: 5rem 2.5rem 3rem;
                    max-width: 640px;
                    min-width: 0;
                }

                /* ── ORB PANEL ── */
                .hero-orb-panel {
                    flex: 1;
                    display: flex; align-items: center; justify-content: center;
                    position: relative;
                    overflow: hidden;
                    border-left: 1px solid var(--border);
                    background: var(--off);
                }

                /* subtle dot grid */
                .hero-orb-panel::before {
                    content: '';
                    position: absolute; inset: 0;
                    background-image: radial-gradient(circle, #d0d0d0 1px, transparent 1px);
                    background-size: 28px 28px;
                    opacity: 0.6;
                }

                /* top-right gradient bleed */
                .hero-orb-panel::after {
                    content: '';
                    position: absolute;
                    top: -60px; right: -60px;
                    width: 260px; height: 260px;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(0,0,0,0.06) 0%, transparent 70%);
                    pointer-events: none;
                }

                .orb-scene {
                    position: relative; display: flex;
                    align-items: center; justify-content: center;
                    width: 280px; height: 280px;
                    z-index: 1;
                }

                /* ripple rings — 4 concentric */
                .orb-ring {
                    position: absolute; inset: 0;
                    border-radius: 50%;
                    border: 1px solid rgba(0,0,0,0.18);
                    animation: orbRipple var(--ring-dur, 3.2s) ease-out infinite;
                    animation-delay: var(--ring-delay, 0s);
                    opacity: 0;
                }
                @keyframes orbRipple {
                    0%   { transform: scale(0.42); opacity: 0.6; }
                    100% { transform: scale(1);    opacity: 0; }
                }

                /* core orb */
                .orb-core {
                    width: 116px; height: 116px;
                    border-radius: 50%;
                    background: var(--black);
                    position: relative; z-index: 2;
                    display: flex; align-items: center; justify-content: center;
                    animation: orbBreath 3.6s ease-in-out infinite;
                    flex-shrink: 0;
                    box-shadow:
                        0 0 0 1px rgba(255,255,255,0.08),
                        0 8px 40px rgba(0,0,0,0.22),
                        0 2px 8px rgba(0,0,0,0.14),
                        inset 0 1px 0 rgba(255,255,255,0.14);
                }
                @keyframes orbBreath {
                    0%,100% {
                        transform: scale(1);
                        box-shadow: 0 0 0 1px rgba(255,255,255,0.08), 0 8px 40px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.14);
                    }
                    50% {
                        transform: scale(1.07);
                        box-shadow: 0 0 0 1px rgba(255,255,255,0.12), 0 12px 60px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.18);
                    }
                }

                /* mic SVG inside orb */
                .orb-mic-icon {
                    width: 34px; height: 34px;
                    animation: orbMicPulse 3.6s ease-in-out infinite;
                }
                @keyframes orbMicPulse {
                    0%,100% { opacity: 0.5; transform: scale(1); }
                    50%     { opacity: 1;   transform: scale(1.1); }
                }

                /* equaliser bars below orb */
                .orb-eq {
                    position: absolute;
                    bottom: 18px; left: 50%;
                    transform: translateX(-50%);
                    display: flex; align-items: flex-end;
                    gap: 3px; height: 40px;
                    z-index: 1;
                }
                .orb-eq-bar {
                    width: 3px; border-radius: 2px 2px 0 0;
                    background: var(--black);
                    animation: eqBar var(--eb-dur,1s) ease-in-out infinite alternate;
                    animation-delay: var(--eb-delay,0s);
                    height: var(--eb-base,5px);
                    opacity: 0.2;
                }
                @keyframes eqBar {
                    from { height: var(--eb-base,5px); opacity: 0.18; }
                    to   { height: var(--eb-max,30px);  opacity: 0.85; }
                }

                /* "Listening…" status pill */
                .orb-status {
                    position: absolute; top: 24px; left: 50%;
                    transform: translateX(-50%);
                    display: flex; align-items: center; gap: 7px;
                    background: var(--white); border: 1px solid var(--border);
                    border-radius: 100px; padding: 0.3rem 0.9rem;
                    font-size: 0.725rem; font-weight: 500; color: var(--muted);
                    white-space: nowrap; z-index: 1;
                    box-shadow: 0 1px 6px rgba(0,0,0,0.07);
                    letter-spacing: 0.02em;
                }
                .orb-dot {
                    width: 6px; height: 6px; border-radius: 50%;
                    background: var(--black);
                    animation: blink 2s step-end infinite;
                }

                /* latency tag bottom-right */
                .orb-latency {
                    position: absolute; bottom: 24px; right: 20px;
                    font-size: 0.6875rem; color: #bbb; font-weight: 500;
                    letter-spacing: 0.04em; z-index: 1;
                }

                @media (max-width: 1100px) {
                    .orb-scene { width: 220px; height: 220px; }
                    .orb-core  { width: 92px; height: 92px; }
                }
                @media (max-width: 768px) {
                    .hero-inner { flex-direction: column; }
                    .hero-body  { max-width: 100%; padding: 3.5rem 1.25rem 2.5rem; }
                    .hero-orb-panel {
                        width: 100%;
                        border-left: none; border-top: 1px solid var(--border);
                        height: 240px;
                    }
                }

                /* hero label / title / desc / actions — same as before */
                .hero-label {
                    font-size: 0.8125rem; font-weight: 500;
                    color: var(--muted); letter-spacing: 0.02em;
                    margin-bottom: 1.25rem;
                    display: flex; align-items: center; gap: 0.5rem;
                    opacity: 0; animation: fadeUp 0.5s ease 0.12s both;
                }

                .live-dot {
                    width: 7px; height: 7px; border-radius: 50%;
                    background: var(--black); flex-shrink: 0;
                    animation: blink 2s step-end infinite;
                }
                @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.15} }

                .hero-title {
                    font-size: clamp(2.5rem, 5.5vw, 4.5rem);
                    font-weight: 700;
                    line-height: 1.1;
                    letter-spacing: -0.03em;
                    margin-bottom: 1.5rem;
                    opacity: 0; animation: fadeUp 0.5s ease 0.2s both;
                }

                .hero-title .dim { color: #aaa; font-weight: 400; }

                .hero-desc {
                    font-size: 1.125rem; font-weight: 400;
                    line-height: 1.75; color: var(--muted);
                    max-width: 52ch; margin-bottom: 2.5rem;
                    opacity: 0; animation: fadeUp 0.5s ease 0.28s both;
                }

                .hero-actions {
                    display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;
                    opacity: 0; animation: fadeUp 0.5s ease 0.36s both;
                }

                .btn-primary {
                    font-size: 0.9375rem; font-weight: 500;
                    background: var(--black); color: var(--white);
                    padding: 0.75rem 1.75rem; border-radius: 8px;
                    text-decoration: none; transition: opacity 0.15s, transform 0.15s;
                    display: inline-flex; align-items: center; gap: 0.4rem;
                }
                .btn-primary:hover { opacity: 0.82; transform: translateY(-1px); }

                .btn-outline {
                    font-size: 0.9375rem; font-weight: 400;
                    color: var(--black); padding: 0.75rem 1.5rem; border-radius: 8px;
                    text-decoration: none; border: 1px solid var(--border);
                    transition: border-color 0.15s, background 0.15s;
                }
                .btn-outline:hover { border-color: #aaa; background: var(--light); }

                /* hero stats strip */
                .hero-stats {
                    display: grid; grid-template-columns: repeat(4, 1fr);
                    border-top: 1px solid var(--border);
                    opacity: 0; animation: fadeUp 0.5s ease 0.44s both;
                }
                @media (max-width: 640px) { .hero-stats { grid-template-columns: repeat(2, 1fr); } }

                .hero-stat {
                    padding: 1.75rem 2.5rem;
                    border-right: 1px solid var(--border);
                }
                .hero-stat:last-child { border-right: none; }

                .stat-val {
                    font-size: 1.875rem; font-weight: 700;
                    letter-spacing: -0.03em; line-height: 1;
                    margin-bottom: 0.25rem;
                }
                .stat-label {
                    font-size: 0.8125rem; color: var(--muted); font-weight: 400;
                }

                /* ── WAVE ── */
                .wave-section {
                    padding: 3.5rem 2.5rem;
                    background: var(--black);
                    border-bottom: 1px solid #222;
                }

                .wave-header {
                    display: flex; align-items: center; justify-content: space-between;
                    margin-bottom: 1.75rem; flex-wrap: wrap; gap: 1rem;
                }

                .wave-label {
                    font-size: 0.75rem; color: white; letter-spacing: 0.06em;
                    text-transform: uppercase; font-weight: 500;
                    display: flex; align-items: center; gap: 0.5rem;
                }
                .wave-label::before {
                    content: ''; width: 6px; height: 6px; border-radius: 50%;
                    background: #555; animation: blink 2s step-end infinite;
                }

                .wave-title {
                    font-size: clamp(1rem, 2vw, 1.5rem);
                    font-weight: 600; color: var(--white); letter-spacing: -0.02em;
                }

                .wave-bars {
                    display: flex; align-items: flex-end; gap: 3px; height: 64px;
                }
                .wave-bar {
                    flex: 1; background: #fff; border-radius: 2px;
                    animation: wavePulse var(--dur,1s) ease-in-out infinite alternate;
                    animation-delay: var(--delay,0s); height: var(--base-h,10%);
                }
                @keyframes wavePulse {
                    from { height: var(--base-h,10%); }
                    to   { height: var(--max-h,60%); }
                }

                /* ── SECTION SHARED ── */
                .section { padding: 5rem 2.5rem; border-bottom: 1px solid var(--border); }
                .section.alt { background: var(--off); }

                .section-label {
                    font-size: 0.75rem; font-weight: 600;
                    color: var(--muted); letter-spacing: 0.08em;
                    text-transform: uppercase; margin-bottom: 0.75rem;
                }

                .section-title {
                    font-size: clamp(1.75rem, 3vw, 2.5rem);
                    font-weight: 700; letter-spacing: -0.03em;
                    line-height: 1.15; margin-bottom: 1rem;
                }

                .section-desc {
                    font-size: 1rem; color: var(--muted);
                    line-height: 1.7; max-width: 52ch; margin-bottom: 3rem;
                }

                .section-head-row {
                    display: flex; align-items: flex-end;
                    justify-content: space-between; gap: 2rem;
                    flex-wrap: wrap; margin-bottom: 3rem;
                }
                .section-head-row .section-title { margin-bottom: 0; }
                .section-head-row .section-desc  { margin-bottom: 0; max-width: 38ch; }

                /* ── FEATURES ── */
                .feat-grid {
                    display: grid; grid-template-columns: repeat(3, 1fr);
                    border: 1px solid var(--border); border-radius: 12px; overflow: hidden;
                }
                @media (max-width: 820px) { .feat-grid { grid-template-columns: 1fr 1fr; } }
                @media (max-width: 520px) { .feat-grid { grid-template-columns: 1fr; } }

                .feat-card {
                    padding: 1.75rem;
                    border-right: 1px solid var(--border);
                    border-bottom: 1px solid var(--border);
                    transition: background 0.15s;
                    position: relative;
                }
                .feat-card:hover { background: var(--light); }
                .feat-card:nth-child(3n) { border-right: none; }
                .feat-card:nth-last-child(-n+3) { border-bottom: none; }

                @media (max-width: 820px) {
                    .feat-card:nth-child(3n)        { border-right: 1px solid var(--border); }
                    .feat-card:nth-child(2n)         { border-right: none; }
                    .feat-card:nth-last-child(-n+3)  { border-bottom: 1px solid var(--border); }
                    .feat-card:nth-last-child(-n+2)  { border-bottom: none; }
                }
                @media (max-width: 520px) {
                    .feat-card { border-right: none; }
                    .feat-card:last-child { border-bottom: none; }
                    .feat-card:nth-last-child(-n+3)  { border-bottom: 1px solid var(--border); }
                }

                .feat-icon {
                    font-size: 1.5rem; margin-bottom: 1rem; display: block;
                }

                .feat-name {
                    font-size: 0.9375rem; font-weight: 600;
                    margin-bottom: 0.5rem; line-height: 1.3;
                }

                .feat-desc {
                    font-size: 0.875rem; color: var(--muted); line-height: 1.65;
                }

                /* ── STEPS ── */
                .steps-grid {
                    display: grid; grid-template-columns: repeat(4, 1fr);
                    border: 1px solid var(--border); border-radius: 12px; overflow: hidden;
                }
                @media (max-width: 740px) { .steps-grid { grid-template-columns: 1fr 1fr; } }
                @media (max-width: 460px) { .steps-grid { grid-template-columns: 1fr; } }

                .step-card {
                    padding: 2rem 1.75rem;
                    border-right: 1px solid var(--border);
                    background: var(--white);
                }
                .step-card:last-child { border-right: none; }

                @media (max-width: 740px) {
                    .step-card:nth-child(2n) { border-right: none; }
                    .step-card:nth-child(-n+2) { border-bottom: 1px solid var(--border); }
                }
                @media (max-width: 460px) {
                    .step-card { border-right: none; border-bottom: 1px solid var(--border); }
                    .step-card:last-child { border-bottom: none; }
                }

                .step-num {
                    font-size: 2.25rem; font-weight: 700;
                    letter-spacing: -0.04em; color: #ddd;
                    margin-bottom: 1.25rem; line-height: 1;
                }

                .step-name {
                    font-size: 0.9375rem; font-weight: 600;
                    margin-bottom: 0.5rem;
                }

                .step-desc {
                    font-size: 0.875rem; color: var(--muted); line-height: 1.65;
                }

                /* ── USE CASES ── */
                .cases-grid {
                    display: grid; grid-template-columns: repeat(3, 1fr);
                    gap: 1px; background: var(--border);
                    border: 1px solid var(--border); border-radius: 12px; overflow: hidden;
                }
                @media (max-width: 820px) { .cases-grid { grid-template-columns: repeat(2,1fr); } }
                @media (max-width: 480px) { .cases-grid { grid-template-columns: 1fr; } }

                .case-card {
                    padding: 1.75rem; background: var(--white);
                    position: relative; transition: background 0.15s;
                }
                .case-card:hover { background: var(--light); }

                .case-tag {
                    font-size: 0.75rem; font-weight: 600;
                    color: var(--muted); letter-spacing: 0.04em;
                    text-transform: uppercase; margin-bottom: 0.5rem;
                }

                .case-name {
                    font-size: 1rem; font-weight: 600; margin-bottom: 0.5rem;
                }

                .case-desc {
                    font-size: 0.875rem; color: var(--muted); line-height: 1.65;
                }

                .case-arrow {
                    position: absolute; bottom: 1.25rem; right: 1.25rem;
                    font-size: 0.875rem; color: #ccc; transition: color 0.15s;
                }
                .case-card:hover .case-arrow { color: var(--black); }

                /* ── PRICING ── */
                .pricing-section {
                    padding: 5rem 2.5rem;
                    background: var(--black);
                    border-bottom: 1px solid #222;
                }
                .pricing-section .section-label { color: #666; }
                .pricing-section .section-title { color: var(--white); }
                .pricing-section .section-desc  { color: #888; }

                .pricing-grid {
                    display: grid; grid-template-columns: repeat(3, 1fr);
                    border: 1px solid #222; border-radius: 12px; overflow: hidden;
                }
                @media (max-width: 680px) { .pricing-grid { grid-template-columns: 1fr; } }

                .p-card {
                    padding: 2.5rem 2rem;
                    border-right: 1px solid #222;
                }
                .p-card:last-child { border-right: none; }
                .p-card.featured { background: var(--white); }

                @media (max-width: 680px) {
                    .p-card { border-right: none; border-bottom: 1px solid #222; }
                    .p-card:last-child { border-bottom: none; }
                }

                .p-badge {
                    display: inline-block; font-size: 0.6875rem; font-weight: 600;
                    background: var(--white); color: var(--black);
                    padding: 0.2rem 0.6rem; border-radius: 4px; margin-bottom: 1.5rem;
                    letter-spacing: 0.04em; text-transform: uppercase;
                }

                .p-tier {
                    font-size: 0.8125rem; font-weight: 600; color: #666;
                    text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 0.75rem;
                }
                .p-card.featured .p-tier { color: var(--muted); }

                .p-price {
                    font-size: 3rem; font-weight: 700;
                    letter-spacing: -0.04em; color: var(--white);
                    line-height: 1; margin-bottom: 0.25rem;
                }
                .p-card.featured .p-price { color: var(--black); }

                .p-period {
                    font-size: 0.875rem; color: #666; margin-bottom: 2rem;
                }
                .p-card.featured .p-period { color: var(--muted); }

                .p-feats { list-style: none; margin-bottom: 2rem; }
                .p-feats li {
                    font-size: 0.875rem; color: #888;
                    padding: 0.5rem 0; border-bottom: 1px solid #1e1e1e;
                    display: flex; align-items: center; gap: 0.6rem;
                }
                .p-feats li::before {
                    content: '✓'; font-size: 0.75rem; color: #444; flex-shrink: 0;
                }
                .p-card.featured .p-feats li { color: var(--muted); border-color: var(--border); }
                .p-card.featured .p-feats li::before { color: var(--black); }

                .p-btn {
                    display: block; text-align: center;
                    font-size: 0.875rem; font-weight: 500;
                    text-decoration: none; padding: 0.75rem;
                    border-radius: 8px; border: 1px solid #2a2a2a;
                    color: #666; transition: all 0.15s;
                }
                .p-btn:hover { border-color: #555; color: var(--white); }
                .p-card.featured .p-btn {
                    background: var(--black); border-color: var(--black); color: var(--white);
                }
                .p-card.featured .p-btn:hover { opacity: 0.8; }

                /* ── FAQ ── */
                .faq-list { max-width: 640px; margin-top: 2.5rem; }

                .faq-item {
                    border-bottom: 1px solid var(--border);
                }
                .faq-item:first-child { border-top: 1px solid var(--border); }

                .faq-q {
                    width: 100%; background: none; border: none; cursor: pointer;
                    padding: 1.25rem 0;
                    display: flex; align-items: center; justify-content: space-between; gap: 1rem;
                    font-family: 'Inter', sans-serif;
                    font-size: 0.9375rem; font-weight: 600; color: var(--black);
                    text-align: left; transition: color 0.15s;
                }
                .faq-q:hover { color: #444; }

                .faq-plus {
                    font-size: 1.25rem; font-weight: 300;
                    color: #bbb; flex-shrink: 0; transition: transform 0.25s ease;
                    line-height: 1;
                }
                .faq-item.open .faq-plus { transform: rotate(45deg); }

                .faq-body {
                    max-height: 0; overflow: hidden;
                    transition: max-height 0.3s ease, padding 0.3s ease;
                }
                .faq-item.open .faq-body { max-height: 200px; padding-bottom: 1.25rem; }

                .faq-body p {
                    font-size: 0.9375rem; line-height: 1.75; color: var(--muted);
                }

                /* ── CTA ── */
                .cta-section {
                    padding: 7rem 2.5rem; text-align: center;
                    border-bottom: 1px solid var(--border);
                    background: var(--off);
                }

                .cta-title {
                    font-size: clamp(2rem, 4.5vw, 4rem);
                    font-weight: 700; letter-spacing: -0.03em; line-height: 1.1;
                    max-width: 16ch; margin: 0 auto 1rem;
                }

                .cta-sub {
                    font-size: 1rem; color: var(--muted); line-height: 1.75;
                    max-width: 44ch; margin: 0 auto 2.5rem;
                }

                .cta-actions {
                    display: flex; align-items: center; justify-content: center;
                    gap: 1rem; flex-wrap: wrap;
                }

                /* ── FOOTER ── */
                footer {
                    padding: 1.5rem 2.5rem;
                    display: flex; align-items: center;
                    justify-content: space-between; gap: 1rem; flex-wrap: wrap;
                    border-top: 1px solid var(--border);
                }

                .footer-logo { height: 22px; width: auto; display: block; }

                .footer-links { display: flex; gap: 1.5rem; flex-wrap: wrap; }

                .footer-link {
                    font-size: 0.8125rem; color: var(--muted); text-decoration: none;
                    transition: color 0.15s;
                }
                .footer-link:hover { color: var(--black); }

                .footer-meta { font-size: 0.75rem; color: #bbb; }

                /* ── RESPONSIVE ── */
                @media (max-width: 768px) {
                    .nav { padding: 0 1.25rem; }
                    .nav-links .nav-link { display: none; }
                    .hero-stat { padding: 1.5rem 1.25rem; }
                    .section { padding: 3.5rem 1.25rem; }
                    .wave-section { padding: 2.5rem 1.25rem; }
                    .pricing-section { padding: 3.5rem 1.25rem; }
                    .cta-section { padding: 4.5rem 1.25rem; }
                    footer { padding: 1.25rem; }
                }

                /* ── ANIMATION ── */
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            {/* ── NAV ── */}
            <nav className="nav">
                <a href="#">
                    <ApplicationLogo className="nav-logo" />
                </a>
                <div className="nav-links">
                    <a href="#features"  className="nav-link">Features</a>
                    <a href="#how"       className="nav-link">How it works</a>
                    <a href="#pricing"   className="nav-link">Pricing</a>
                    <a href="#faq"       className="nav-link">FAQ</a>
                    {auth.user ? (
                        <Link href={route('dashboard')} className="nav-btn">Dashboard</Link>
                    ) : (
                        <>
                            <Link href={route('login')}    className="nav-link">Log in</Link>
                            <a href={bookingUrl} className="nav-btn">Get a Quote</a>
                        </>
                    )}
                </div>
            </nav>

            {/* ── HERO ── */}
            <section className="hero">
                <div className="hero-inner">

                    {/* LEFT — copy */}
                    <div className="hero-body">
                        <div className="hero-label">
                            <span className="live-dot" />
                            Powered by ElevenLabs API · Agents
                        </div>
                        <h1 className="hero-title">
                            Voice that thinks.<br />
                            <span className="dim">Agents that act.</span>
                        </h1>
                        <p className="hero-desc">
                            TalkingToEleven lets you deploy intelligent AI voice in minutes.
                            Natural conversation, real-time responses, zero infrastructure overhead.
                        </p>
                        <p className="hero-desc">
                         Free AI assistant setup for non-technical businesses.
                        </p>

                        <div className="hero-actions">
                            {auth.user ? (
                                <Link href={route('dashboard')} className="btn-primary">Go to Dashboard →</Link>
                            ) : (
                                <>
                                    <a href={bookingUrl}  className="btn-primary">Schedule a Consultation →</a>
                                    <a href="#how" className="btn-outline">See how it works</a>
                                </>
                            )}
                        </div>
                    </div>

                    {/* RIGHT — animated orb panel */}
                    <div className="hero-orb-panel">
                        {/* status pill */}
                        <div className="orb-status">
                            <span className="orb-dot" />
                            Agent listening
                        </div>

                        {/* orb + rings */}
                        <div className="orb-scene">
                            {/* 4 ripple rings, staggered */}
                            {[
                                { dur: '3.2s', delay: '0s'   },
                                { dur: '3.2s', delay: '0.8s' },
                                { dur: '3.2s', delay: '1.6s' },
                                { dur: '3.2s', delay: '2.4s' },
                            ].map((r, i) => (
                                <div key={i} className="orb-ring" style={{ '--ring-dur': r.dur, '--ring-delay': r.delay }} />
                            ))}

                            {/* core orb */}
                            <div className="orb-core">
                                {/* mic icon SVG */}
                                <svg className="orb-mic-icon" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="12" y="3" width="10" height="16" rx="5" fill="white" opacity="0.9"/>
                                    <path d="M7 17c0 5.523 4.477 10 10 10s10-4.477 10-10" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.7"/>
                                    <line x1="17" y1="27" x2="17" y2="32" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.7"/>
                                    <line x1="12" y1="32" x2="22" y2="32" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.7"/>
                                </svg>
                            </div>

                            {/* equaliser bars */}
                            <div className="orb-eq">
                                {Array.from({ length: 28 }).map((_, i) => {
                                    const base = Math.round(4 + Math.random() * 8);
                                    const max  = Math.round(14 + Math.random() * 26);
                                    const dur  = (0.6 + Math.random() * 0.8).toFixed(2);
                                    const del  = (Math.random() * 0.7).toFixed(2);
                                    return (
                                        <div key={i} className="orb-eq-bar" style={{
                                            '--eb-base':  `${base}px`,
                                            '--eb-max':   `${max}px`,
                                            '--eb-dur':   `${dur}s`,
                                            '--eb-delay': `${del}s`,
                                        }} />
                                    );
                                })}
                            </div>
                        </div>

                        {/* latency badge */}
                        <div className="orb-latency">&lt;200ms</div>
                    </div>

                </div>

                {/* stats strip */}
                <div className="hero-stats">
                    {[
                        { val: '29+',    label: 'Languages supported' },
                        { val: '<200ms', label: 'Average latency' },
                        { val: '99.9%',  label: 'Uptime SLA' },
                        { val: '∞',      label: 'Scale' },
                    ].map((s, i) => (
                        <div key={i} className="hero-stat">
                            <div className="stat-val">{s.val}</div>
                            <div className="stat-label">{s.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── WAVEFORM ── */}
            <section className="wave-section">
                <div className="wave-header">
                    <p className="wave-label">Agent audio stream · live simulation</p>
                    <p className="wave-title">Your agent is always on the line.</p>
                </div>
                <div className="wave-bars">
                    {Array.from({ length: 90 }).map((_, i) => {
                        const baseH = Math.round(4 + Math.random() * 12);
                        const maxH  = Math.round(20 + Math.random() * 80);
                        const dur   = (0.7 + Math.random() * 0.9).toFixed(2);
                        const delay = (Math.random() * 0.8).toFixed(2);
                        return (
                            <div key={i} className="wave-bar" style={{
                                '--base-h': `${baseH}%`,
                                '--max-h':  `${maxH}%`,
                                '--dur':    `${dur}s`,
                                '--delay':  `${delay}s`,
                            }} />
                        );
                    })}
                </div>
            </section>

            {/* ── FEATURES ── */}
            <section className="section" id="features">
                <p className="section-label">Features</p>
                <div className="section-head-row">
                    <h2 className="section-title">Everything your agents need to perform.</h2>
                    <p className="section-desc">
                        From lifelike voice synthesis to multi-turn conversation management —
                        the full stack, production-ready.
                    </p>
                </div>
                <div className="feat-grid">
                    {[
                        { icon: '🎙', name: 'Hyper-Realistic Voice',    desc: 'ElevenLabs-powered synthesis. Choose from dozens of voices or clone your own for a fully branded audio identity.' },
                        { icon: '🤖', name: 'Autonomous Agents',        desc: 'End-to-end conversation handling. Agents answer, route, and resolve without human handoff.' },
                        { icon: '💬', name: 'Voice + Text Modes',       desc: 'Switch between voice and text per interaction — or combine both in a single flow.' },
                        { icon: '⚡', name: 'Low-Latency Streaming',    desc: 'Sub-200ms audio streaming. Conversations feel fluid and natural — never robotic or lagged.' },
                        { icon: '🌐', name: 'Multilingual — 29+ Langs', desc: 'Serve global audiences natively. ElevenLabs multilingual models handle accent and dialect with precision.' },
                        { icon: '🔌', name: 'API & Webhook Ready',      desc: 'REST endpoints and webhooks for every event. Integrates with any CRM, helpdesk, or custom stack.' },
                        { icon: '📊', name: 'Conversation Analytics',   desc: 'Full transcripts, sentiment scores, response latency, and resolution rates — all in one dashboard.' },
                        { icon: '🎛', name: 'Custom Personas',          desc: 'Define personality, tone, knowledge base, and escalation rules. Build exactly the agent you need.' },
                        { icon: '🔒', name: 'Enterprise Security',      desc: 'End-to-end encryption, RBAC, audit logs, and compliance-ready infrastructure. Your data stays yours.' },
                    ].map((f, i) => (
                        <div key={i} className="feat-card">
                            <span className="feat-icon">{f.icon}</span>
                            <h3 className="feat-name">{f.name}</h3>
                            <p className="feat-desc">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── HOW IT WORKS ── */}
            <section className="section alt" id="how">
                <p className="section-label">How it works</p>
                <div className="section-head-row">
                    <h2 className="section-title">Live in four steps.</h2>
                    <p className="section-desc">
                        No ML expertise needed. Configure, connect, deploy —
                        from zero to a production agent in minutes.
                    </p>
                </div>
                <div className="steps-grid">
                    {[
                        { n: '01', name: 'Create Your Agent',  desc: 'Define the agent\'s name, persona, language, and objectives through a guided setup wizard.' },
                        { n: '02', name: 'Choose a Voice',     desc: 'Select from ElevenLabs\' voice library or upload audio samples to clone a custom voice.' },
                        { n: '03', name: 'Load Your Context',  desc: 'Upload documents, FAQs, or connect a knowledge base so your agent answers with precision.' },
                        { n: '04', name: 'Deploy Anywhere',    desc: 'Embed via JS snippet, trigger via REST API, or connect to your app. Goes live instantly.' },
                    ].map((s, i) => (
                        <div key={i} className="step-card">
                            <div className="step-num">{s.n}</div>
                            <h3 className="step-name">{s.name}</h3>
                            <p className="step-desc">{s.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── USE CASES ── */}
            <section className="section" id="use-cases">
                <p className="section-label">Use Cases</p>
                <div className="section-head-row">
                    <h2 className="section-title">Built for every conversation.</h2>
                    <p className="section-desc">
                        TalkingToEleven agents adapt to any industry, workflow, or scale.
                    </p>
                </div>
                <div className="cases-grid">
                    {[
                        { tag: 'Customer Support', name: 'Always-On Support Agent', desc: 'Handle tier-1 tickets, answer FAQs, and escalate intelligently — 24/7, zero wait time.' },
                        { tag: 'Sales & Lead Gen', name: 'AI Sales Assistant',      desc: 'Qualify leads, book demos, and follow up automatically. Your pipeline never stops.' },
                        { tag: 'Education',        name: 'Interactive Tutor',       desc: 'Voice-powered tutors that explain, quiz, and adapt to individual learning paces.' },
                        { tag: 'Healthcare',       name: 'Patient Intake Agent',    desc: 'Collect intake data, answer general queries, and route to the right specialist.' },
                        { tag: 'E-Commerce',       name: 'Shopping Concierge',      desc: 'Guide shoppers to the right products through natural conversation.' },
                        { tag: 'Internal Tools',   name: 'HR & Onboarding Bot',     desc: 'Help employees navigate policies, complete tasks, and get HR answers instantly.' },
                    ].map((u, i) => (
                        <div key={i} className="case-card">
                            <p className="case-tag">{u.tag}</p>
                            <h3 className="case-name">{u.name}</h3>
                            <p className="case-desc">{u.desc}</p>
                            <span className="case-arrow">→</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── PRICING ── */}
            <section className="pricing-section" id="pricing">
                <p className="section-label">Pricing</p>
                <div className="section-head-row">
                    <h2 className="section-title">Simple, transparent pricing.</h2>
                    <p className="section-desc">
                       scale when you're ready. No hidden fees, no surprises.
                    </p>
                </div>
                <div className="pricing-grid">
                        {[
                            {
                                tier: 'Starter AI Assistant',
                                price: '$199',
                                period: 'per month',
                                feats: [
                                    'AI voice assistant setup',
                                    'Inbound call handling',
                                    'Basic conversation flow',
                                    'Call transcripts',
                                    'Dashboard access',
                                    'Basic analytics'
                                ],
                                featured: false,
                            },
                            {
                                tier: 'Custom AI Assistant',
                                price: '$299',
                                period: 'per month',
                                feats: [
                                    'Everything in Starter',
                                    'Custom tools & API integrations',
                                    'CRM integrations',
                                    'Custom call logic',
                                    'Advanced workflows',
                                    'Outbound call capability'
                                ],
                                featured: true,
                            },
                            {
                                tier: 'Enterprise',
                                price: 'Custom',
                                period: 'pricing',
                                feats: [
                                    'Fully custom AI voice agent',
                                    'Multi-system integrations',
                                    'Advanced analytics',
                                    'High call volume support',
                                    'Dedicated support',
                                    'Custom deployment'
                                ],
                                featured: false,
                            },
                        ].map((p, i) => (
                            <div key={i} className={`p-card${p.featured ? ' featured' : ''}`}>
                                {p.badge && <div className="p-badge">{p.badge}</div>}
                                <p className="p-tier">{p.tier}</p>
                                <div className="p-price">{p.price}</div>
                                <p className="p-period">{p.period}</p>
                                <ul className="p-feats">
                                    {p.feats.map((f, j) => <li key={j}>{f}</li>)}
                                </ul>

                                {auth.user ? (
                                    <Link href={route('dashboard')} className="p-btn">
                                        Access dashboard
                                    </Link>
                                ) : (
                                    <a href={bookingUrl}  className="p-btn">
                                        Book Consultation
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
            </section>

            {/* ── FAQ ── */}
            <section className="section" id="faq">
                <p className="section-label">FAQ</p>
                <h2 className="section-title">Common questions.</h2>
                <div className="faq-list">
                    {[
                        { q: 'What languages are supported?', a: 'Agents support 29+ languages out of the box via ElevenLabs multilingual models, including English, Spanish, French, German, Japanese, and more.' },
                        { q: 'Can I use a custom voice?', a: 'Yes. Pro and Scale plans support voice cloning. Upload audio samples and we\'ll build a model unique to your brand.' },
                        { q: 'How do I embed an agent on my site?', a: 'Drop in a JavaScript snippet — takes about 30 seconds. We also expose full REST API and webhook endpoints for custom integrations.' },
                        { q: 'Is my conversation data secure?', a: 'All data is encrypted in transit and at rest. We never train on your conversations, and you can request full deletion at any time.' },
                    ].map((item, i) => (
                        <div key={i} className="faq-item" onClick={e => e.currentTarget.classList.toggle('open')}>
                            <button className="faq-q">
                                {item.q}
                                <span className="faq-plus">+</span>
                            </button>
                            <div className="faq-body"><p>{item.a}</p></div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="cta-section">
                <h2 className="cta-title">Your first agent is one deploy away.</h2>
                <p className="cta-sub">
                    Access to the platform is currently by invitation after consultation to ensure the solution fits your workflow.
                </p>
                <div className="cta-actions">
                    {auth.user ? (
                        <Link href={route('dashboard')} className="btn-primary">Go to Dashboard →</Link>
                    ) : (
                        <>
                            <a href={bookingUrl} className="btn-primary">Schedule a Consultation →</a>
                            <Link href={route('login')}    className="btn-outline">Log in</Link>
                        </>
                    )}
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer>
                <a href="#">
                    <ApplicationLogo className="footer-logo" />
                </a>
                <div className="footer-links">
                    <a href="#features"  className="footer-link">Features</a>
                    <a href="#pricing"   className="footer-link">Pricing</a>
                    <a href="#faq"       className="footer-link">FAQ</a>
                </div>
                <p className="footer-meta">© 2025 TalkingToEleven</p>
            </footer>

            {

                agentId && (

                    <ElevenLabsWidget/>
                )
            }
        </>
    );
}