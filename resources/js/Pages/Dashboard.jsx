import { useState, useRef, useEffect, useCallback } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer,
} from "recharts";
import { Head, usePage } from "@inertiajs/react";
import axios from "axios";

// ─── Constants ────────────────────────────────────────────────────────────────

const MONTHS   = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS_HDR = ["Su","Mo","Tu","We","Th","Fr","Sa"];
const PRESETS  = [
    { label: "Last day",   days: 0 },
    { label: "Last week",  days: 6 },
    { label: "Last month", days: 29 },
];

const TABS = [
    { key: "calls",      label: "Number of calls",   unit: "",             statsKey: "number_of_calls",             chartKey: "calls",           fmt: v => (v ?? 0).toLocaleString() },
    { key: "duration",   label: "Average duration",  unit: "",             statsKey: "average_duration",            chartKey: "avg_duration",    fmt: v => v ?? "—" },
    { key: "totalCost",  label: "Total cost",        unit: "credits",      statsKey: "total_cost_credits",          chartKey: "total_credits",   fmt: v => v >= 1000 ? `${(v/1000).toFixed(2)}K` : (v ?? 0).toLocaleString() },
    { key: "avgCost",    label: "Average cost",      unit: "credits/call", statsKey: "average_cost_per_call",       chartKey: "avg_credits",     fmt: v => (v ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 }) },

];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toDateStr(d) { return d.toISOString().split("T")[0]; }
function sameDay(a, b) { return a && b && a.toDateString() === b.toDateString(); }
function inRange(d, a, b) {
    if (!a || !b) return false;
    const [lo, hi] = a <= b ? [a, b] : [b, a];
    return d >= lo && d <= hi;
}
function fmtAxisDate(iso) {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ─── MiniCalendar ─────────────────────────────────────────────────────────────

function MiniCalendar({ month, year, rangeStart, rangeEnd, hoveredDate, onSelect, onHover }) {

    const firstDay    = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    const todayDate = new Date(); todayDate.setHours(0, 0, 0, 0);

    return (
        <div className="w-52 select-none">
            <p className="text-center text-sm font-semibold text-gray-800 mb-3">{MONTHS[month]} {year}</p>
            <div className="grid grid-cols-7 gap-0.5">
                {DAYS_HDR.map(d => (
                    <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>
                ))}
                {cells.map((date, i) => {
                    if (!date) return <div key={i} />;
                    const isFuture = date > todayDate;
                    const isEdge   = sameDay(date, rangeStart) || sameDay(date, rangeEnd);
                    const inR      = inRange(date, rangeStart, rangeEnd || hoveredDate);
                    const isToday  = sameDay(date, todayDate);
                    let cls = "text-center py-1.5 text-xs transition-all duration-100 ";
                    cls += isFuture ? "text-gray-200 cursor-default " : "cursor-pointer ";
                    if (isEdge)       cls += "bg-blue-600 text-white font-bold rounded-full ";
                    else if (inR)     cls += "bg-blue-100 text-blue-900 rounded ";
                    else if (isToday) cls += "font-bold text-blue-500 rounded hover:bg-gray-100 ";
                    else              cls += "text-gray-700 hover:bg-gray-100 rounded ";
                    return (
                        <div key={i} className={cls}
                            onClick={() => !isFuture && onSelect(date)}
                            onMouseEnter={() => !isFuture && onHover(date)}>
                            {date.getDate()}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ─── DateRangePicker ─────────────────────────────────────────────────────────

function DateRangePicker({ startDate, endDate, onApply, onClose }) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const [leftMonth,    setLeftMonth]    = useState(today.getMonth() === 0 ? 11 : today.getMonth() - 1);
    const [leftYear,     setLeftYear]     = useState(today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear());
    const [tempStart,    setTempStart]    = useState(startDate ? new Date(startDate + "T00:00:00") : null);
    const [tempEnd,      setTempEnd]      = useState(endDate   ? new Date(endDate   + "T00:00:00") : null);
    const [hovered,      setHovered]      = useState(null);
    const [activePreset, setActivePreset] = useState(null);
    const ref = useRef(null);

    const rightMonth = leftMonth === 11 ? 0            : leftMonth + 1;
    const rightYear  = leftMonth === 11 ? leftYear + 1 : leftYear;

    function prevMonth() {
        if (leftMonth === 0) { setLeftMonth(11); setLeftYear(y => y - 1); }
        else setLeftMonth(m => m - 1);
    }
    function nextMonth() {
        if (leftMonth === 11) { setLeftMonth(0); setLeftYear(y => y + 1); }
        else setLeftMonth(m => m + 1);
    }
    function handleSelect(date) {
        if (!tempStart || (tempStart && tempEnd)) {
            setTempStart(date); setTempEnd(null); setActivePreset(null);
        } else {
            if (date < tempStart) { setTempEnd(tempStart); setTempStart(date); }
            else setTempEnd(date);
            setActivePreset(null);
        }
    }
    function applyPreset(p) {
        const end = new Date(today);
        const start = new Date(today);
        if (p.days > 0) start.setDate(start.getDate() - p.days);
        setTempStart(start); setTempEnd(end); setActivePreset(p.label);
    }

    useEffect(() => {
        const h = e => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, [onClose]);

    return (
        <div ref={ref}
            className="absolute top-full right-0 mt-1 z-50 bg-white rounded-md shadow-2xl border border-gray-200 flex overflow-hidden"
            style={{ minWidth: 560 }}>
            {/* Presets */}
            <div className="bg-gray-50 border-r border-gray-100 p-3 flex flex-col gap-0.5 w-36">
                {PRESETS.map(p => (
                    <button key={p.label} onClick={() => applyPreset(p)}
                        className={[
                            "text-left px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer border-none flex items-center justify-between",
                            activePreset === p.label
                                ? "bg-white text-gray-900 font-medium shadow-sm"
                                : "bg-transparent text-gray-500 hover:bg-white hover:text-gray-800",
                        ].join(" ")}>
                        {p.label}
                        {activePreset === p.label && <span className="text-blue-500 text-xs">✓</span>}
                    </button>
                ))}
            </div>

            {/* Calendars */}
            <div className="flex-1 p-5">
                <div className="flex gap-3 mb-4">
                    {[["Start", tempStart], ["End", tempEnd]].map(([lbl, val]) => (
                        <div key={lbl} className="flex-1">
                            <p className="text-xs text-gray-400 font-medium mb-1">{lbl}</p>
                            <div className={[
                                "border rounded-md px-3 py-1.5 text-xs",
                                val ? "border-blue-400 text-gray-800 bg-blue-50" : "border-gray-200 text-gray-300 bg-white",
                            ].join(" ")}>
                                {val ? val.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex gap-6 relative">
                    <button onClick={prevMonth} className="absolute -left-1 top-0 text-gray-400 hover:text-gray-700 text-xl bg-transparent border-none cursor-pointer z-10 leading-none">‹</button>
                    <MiniCalendar month={leftMonth}  year={leftYear}  rangeStart={tempStart} rangeEnd={tempEnd} hoveredDate={hovered} onSelect={handleSelect} onHover={setHovered} />
                    <MiniCalendar month={rightMonth} year={rightYear} rangeStart={tempStart} rangeEnd={tempEnd} hoveredDate={hovered} onSelect={handleSelect} onHover={setHovered} />
                    <button onClick={nextMonth} className="absolute -right-1 top-0 text-gray-400 hover:text-gray-700 text-xl bg-transparent border-none cursor-pointer z-10 leading-none">›</button>
                </div>

                <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-400">{activePreset || "Custom range"}</span>
                    <div className="flex gap-2">
                        <button onClick={() => { setTempStart(null); setTempEnd(null); setActivePreset(null); }}
                            className="px-3 py-1.5 text-xs border border-gray-200 rounded-md text-gray-500 hover:bg-gray-50 cursor-pointer transition-colors">
                            Clear
                        </button>
                        <button
                            onClick={() => tempStart && tempEnd && onApply(toDateStr(tempStart), toDateStr(tempEnd))}
                            disabled={!tempStart || !tempEnd}
                            className="px-4 py-1.5 text-xs bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors">
                            Apply
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Chart Tooltip ────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label, tab }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-gray-200 shadow-lg rounded-lg px-3 py-2 text-xs">
            <p className="text-gray-400 mb-1">{label}</p>
            <p className="font-semibold text-gray-900">
                {tab.fmt(payload[0]?.value ?? 0)}
                {tab.unit && <span className="font-normal text-gray-400 ml-1">{tab.unit}</span>}
            </p>
        </div>
    );
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────

export default function Dashboard({ stats, chartData, startDate: initStart, endDate: initEnd }) {

    const auth = usePage().props.auth;

    const today    = toDateStr(new Date());
    const monthAgo = toDateStr(new Date(Date.now() - 29 * 86400000));

    const [activeKey,  setActiveKey]  = useState("calls");
    const [startDate,  setStartDate]  = useState(initStart ?? monthAgo);
    const [endDate,    setEndDate]    = useState(initEnd   ?? today);
    const [liveStats,  setLiveStats]  = useState(stats);
    const [liveChart,  setLiveChart]  = useState(chartData ?? []);
    const [loading,    setLoading]    = useState(false);
    const [showPicker, setShowPicker] = useState(false);

    const tab = TABS.find(t => t.key === activeKey);

    // ── Axios refetch ─────────────────────────────────────────────────────────
    const fetchData = useCallback(async (start, end) => {
        setLoading(true);
        try {
            const { data } = await axios.get(route("dashboard.stats"), {
                params: { start_date: start, end_date: end },
            });
            setLiveStats(data.stats);
            setLiveChart(data.chartData ?? []);
        } catch (err) {
            console.error("Dashboard fetch error:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    function handleApply(start, end) {
        setStartDate(start);
        setEndDate(end);
        setShowPicker(false);
        fetchData(start, end);
    }

    // ── Chart data ────────────────────────────────────────────────────────────
    const chartPoints = liveChart.map(row => ({
        date:  fmtAxisDate(row.date),
        value: row[tab.chartKey] ?? 0,
    }));

    const tickInterval = chartPoints.length > 14 ? Math.floor(chartPoints.length / 6) : 0;

    // ── Range label ───────────────────────────────────────────────────────────
    function fmtRangeLabel() {
        if (!startDate || !endDate) return "Last month";
        const fmt = s => new Date(s + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
        return startDate === endDate ? fmt(startDate) : `${fmt(startDate)} – ${fmt(endDate)}`;
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">Analytics</p>
                        <h2 className="text-xl font-bold text-gray-900 leading-tight mt-0.5">Dashboard</h2>
                    </div>
                </div>
            }
        >
            
            <Head title="Dashboard" />
            
            <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mt-10">

                {/* ── Workspace greeting + date picker row ── */}
                <div className="flex items-start justify-between mb-5">
                    <div>
                        <p className="text-gray-400 font-medium mb-0.5">My Workspace</p>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                            {(() => {
                                const h = new Date().getHours();
                                return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
                            })()}, {auth?.user?.name ?? "there"}
                        </h1>
                    </div>

                    {/* Date picker trigger */}
                    <div className="relative">
                        <button
                            onClick={() => setShowPicker(v => !v)}
                            className={[
                                "flex items-center gap-2 px-4 py-2 rounded-md border text-sm font-medium transition-colors cursor-pointer",
                                showPicker
                                    ? "border-blue-400 bg-blue-50 text-blue-700"
                                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300",
                            ].join(" ")}
                        >
                            <svg className="w-4 h-4 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2"/>
                                <line x1="16" y1="2" x2="16" y2="6"/>
                                <line x1="8"  y1="2" x2="8"  y2="6"/>
                                <line x1="3"  y1="10" x2="21" y2="10"/>
                            </svg>
                            {fmtRangeLabel()}
                            <svg className="w-3.5 h-3.5 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <polyline points="6 9 12 15 18 9"/>
                            </svg>
                        </button>

                        {showPicker && (
                            <DateRangePicker
                                startDate={startDate}
                                endDate={endDate}
                                onApply={handleApply}
                                onClose={() => setShowPicker(false)}
                            />
                        )}
                    </div>
                </div>

                {/* ── Main card ── */}
                <div className={[
                    "bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-opacity duration-200",
                    loading ? "opacity-60 pointer-events-none" : "opacity-100",
                ].join(" ")}>

                    {/* ── Stat tabs ── */}
                    <div className="grid grid-cols-4 border-b border-gray-200">
                        {TABS.map((t, i) => {
                            const isActive = t.key === activeKey;
                            const val      = liveStats?.[t.statsKey] ?? 0;
                            return (
                                <button
                                    key={t.key}
                                    onClick={() => setActiveKey(t.key)}
                                    className={[
                                        "relative px-4 pt-4 pb-3.5 text-left transition-colors duration-150 cursor-pointer focus:outline-none",
                                        i < TABS.length - 1 ? "border-r border-gray-100" : "",
                                        isActive ? "bg-white" : "bg-gray-50 hover:bg-white",
                                    ].join(" ")}
                                >
                                    {/* Active underline */}
                                    {isActive && (
                                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-t-full" />
                                    )}

                                    <p className={[
                                        "text-xs font-medium mb-1.5 whitespace-nowrap truncate",
                                        isActive ? "text-gray-500" : "text-gray-400",
                                    ].join(" ")}>
                                        {t.label}
                                    </p>

                                    <p className={[
                                        "text-xl font-semibold tracking-tight leading-none",
                                        isActive ? "text-gray-900" : "text-gray-500",
                                    ].join(" ")}>
                                        {t.fmt(val)}
                                        {t.unit && (
                                            <span className="text-xs font-normal text-gray-400 ml-1">{t.unit}</span>
                                        )}
                                    </p>
                                </button>
                            );
                        })}
                    </div>

                    {/* ── Area chart ── */}
                    <div className="px-4 pt-5 pb-3">
                        {chartPoints.length === 0 ? (
                            <div className="h-56 flex flex-col items-center justify-center gap-2 text-gray-300">
                                <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                                    <path d="M3 3v18h18"/><path d="M18 12l-6-6-4 4-3-3"/>
                                </svg>
                                <p className="text-sm text-gray-400">No data for this period</p>
                            </div>
                        ) : (
                            <div className="h-56">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartPoints} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%"   stopColor="#3b82f6" stopOpacity={0.12} />
                                                <stop offset="95%"  stopColor="#3b82f6" stopOpacity={0.01} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
                                        <XAxis
                                            dataKey="date"
                                            tick={{ fontSize: 11, fill: "#9ca3af" }}
                                            axisLine={false} tickLine={false}
                                            interval={tickInterval}
                                        />
                                        <YAxis
                                            tick={{ fontSize: 11, fill: "#9ca3af" }}
                                            axisLine={false} tickLine={false}
                                        />
                                        <Tooltip
                                            content={<ChartTooltip tab={tab} />}
                                            cursor={{ stroke: "#e5e7eb", strokeWidth: 1 }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="value"
                                            stroke="#3b82f6"
                                            strokeWidth={2}
                                            fill="url(#chartFill)"
                                            dot={false}
                                            activeDot={{ r: 4, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }}
                                            isAnimationActive
                                            animationDuration={400}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        {/* X-axis range labels */}
                        <div className="flex justify-between mt-1 px-1">
                            <span className="text-xs text-gray-400">
                                {startDate && new Date(startDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                            <span className="text-xs text-gray-400">
                                {endDate && new Date(endDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Loading spinner */}
                {loading && (
                    <div className="flex justify-center mt-4">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <div className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                            Updating…
                        </div>
                    </div>
                )}

            </div>
        </AuthenticatedLayout>
    );
}