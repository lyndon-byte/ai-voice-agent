<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Shared logic: compute stats + daily chart_data for a given date range.
     * Used by both the Inertia page render and the JSON/axios endpoint.
     */

    private function buildPayload(Request $request): array
    {
        $org = auth()->user()->organization;

        // ── Date range ──────────────────────────────────────────────────────
        $startDate = $request->input('start_date', now()->subDays(29)->toDateString());
        $endDate   = $request->input('end_date',   now()->toDateString());

        // ── Filtered base query ─────────────────────────────────────────────
        $calls = $org->receivedCalls()
            ->whereBetween('created_at', [
                $startDate . ' 00:00:00',
                $endDate   . ' 23:59:59',
            ]);

        // ── Aggregate stats ─────────────────────────────────────────────────
        $totalCalls    = $calls->count();
        $totalDuration = $calls->sum('duration');   // seconds
        $totalCredits  = $calls->sum('credits');
        $totalLlmCost  = $calls->sum('llm_cost');

        $avgDuration       = $totalCalls   ? $totalDuration / $totalCalls : 0;
        $avgCredits        = $totalCalls   ? $totalCredits  / $totalCalls : 0;
        $totalMinutes      = $totalDuration / 60;
        $avgLlmCostPerMin  = $totalMinutes ? $totalLlmCost  / $totalMinutes : 0;

        $stats = [
            'number_of_calls'              => $totalCalls,
            'average_duration'             => gmdate('i:s', (int) $avgDuration),
            'total_cost_credits'           => round($totalCredits,  2),
            'average_cost_per_call'        => round($avgCredits,    2),
            'total_llm_cost'               => round($totalLlmCost,  6),
            'average_llm_cost_per_minute'  => round($avgLlmCostPerMin, 6),
        ];

        // ── Daily chart data ─────────────────────────────────────────────────
        // Each row covers one calendar day within the selected range.
        $chartData = $org->receivedCalls()
            ->whereBetween('created_at', [
                $startDate . ' 00:00:00',
                $endDate   . ' 23:59:59',
            ])
            ->selectRaw("
                DATE(created_at)                                    AS date,
                COUNT(*)                                            AS calls,
                ROUND(SUM(duration), 2)                             AS total_duration,
                ROUND(AVG(duration), 2)                             AS avg_duration,
                ROUND(SUM(credits),  2)                             AS total_credits,
                ROUND(AVG(credits),  2)                             AS avg_credits,
                ROUND(SUM(llm_cost), 6)                             AS total_llm_cost,
                ROUND(
                    SUM(llm_cost) / NULLIF(SUM(duration) / 60, 0),
                6)                                                  AS avg_llm_per_min
            ")
            ->groupByRaw('DATE(created_at)')
            ->orderByRaw('DATE(created_at)')
            ->get()
            ->map(fn ($row) => [
                'date'             => $row->date,              // "YYYY-MM-DD"
                'calls'            => (int)   $row->calls,
                'total_duration'   => (float) $row->total_duration,
                'avg_duration'     => (float) $row->avg_duration,
                'total_credits'    => (float) $row->total_credits,
                'avg_credits'      => (float) $row->avg_credits,
                'total_llm_cost'   => (float) $row->total_llm_cost,
                'avg_llm_per_min'  => (float) ($row->avg_llm_per_min ?? 0),
            ])
            ->values()
            ->toArray();

        return compact('stats', 'chartData', 'startDate', 'endDate');
    }

    /**
     * Initial Inertia page render.
     */

    public function index(Request $request)
    {
        
        $payload = $this->buildPayload($request);

        return Inertia::render('Dashboard', [
            'stats'      => $payload['stats'],
            'chartData'  => $payload['chartData'],
            'startDate'  => $payload['startDate'],
            'endDate'    => $payload['endDate'],
        ]);
    }

    /**
     * JSON endpoint for axios date-range refetches.
     * Route: GET /dashboard/stats?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
     */
    public function stats(Request $request)
    {
        $request->validate([
            'start_date' => ['required', 'date'],
            'end_date'   => ['required', 'date', 'after_or_equal:start_date'],
        ]);

        $payload = $this->buildPayload($request);

        return response()->json([
            'stats'     => $payload['stats'],
            'chartData' => $payload['chartData'],
        ]);
    }
}
