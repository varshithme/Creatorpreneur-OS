'use client';

import { useState } from 'react';
import { Sparkles, Target } from 'lucide-react';
import { AIInsightSections, SalesMetric, LeadSourceBreakdownMap, ViewMode } from '@/types';

interface AIInsightsProps {
  metrics: SalesMetric[];
  breakdown: LeadSourceBreakdownMap;
  viewMode: ViewMode;
  darkMode: boolean;
}

export default function AIInsights({ metrics, breakdown, viewMode, darkMode }: AIInsightsProps) {
  const [insights, setInsights] = useState<AIInsightSections | null>(null);
  const [loading, setLoading] = useState(false);

  const textClass = darkMode ? 'text-white' : 'text-slate-900';
  const textSecondary = darkMode ? 'text-slate-400' : 'text-slate-600';
  const cardBg = darkMode ? 'bg-zinc-900' : 'bg-white';
  const borderClass = darkMode ? 'border-zinc-800' : 'border-slate-200';
  const sectionBg = darkMode ? 'bg-zinc-800' : 'bg-slate-50';

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metrics, sourceBreakdown: breakdown, viewMode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate insights');
      setInsights(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error generating insights';
      setInsights({ error: message } as AIInsightSections);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${cardBg} rounded-3xl p-8 border ${borderClass}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <h2 className={`text-2xl font-semibold ${textClass}`}>AI Insights</h2>
            <p className={`text-sm ${textSecondary} font-light`}>Powered by Claude</p>
          </div>
        </div>
        <button
          onClick={generate}
          disabled={loading}
          className="bg-orange-500 text-white px-6 py-3 rounded-full font-medium hover:bg-orange-600 transition duration-300 disabled:opacity-50 shadow-lg flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          {loading ? 'Analyzing...' : 'Generate Insights'}
        </button>
      </div>

      {insights && !insights.error ? (
        <div className="space-y-6">
          {insights.summary && (
            <div className={`${darkMode ? 'bg-zinc-800' : 'bg-orange-50'} rounded-2xl p-6 border ${darkMode ? 'border-zinc-700' : 'border-orange-200'}`}>
              <h3 className={`text-lg font-semibold ${textClass} mb-3`}>Performance Summary</h3>
              <p className={`${textSecondary} font-light leading-relaxed`}>{insights.summary}</p>
            </div>
          )}

          {insights.metrics && (
            <div className={`${sectionBg} rounded-2xl p-6 border ${borderClass}`}>
              <h3 className={`text-lg font-semibold ${textClass} mb-3`}>Key Metrics</h3>
              <div className={`${textSecondary} font-light whitespace-pre-line`}>{insights.metrics}</div>
            </div>
          )}

          {insights.recommendations && (
            <div className={`${sectionBg} rounded-2xl p-6 border ${borderClass}`}>
              <h3 className={`text-lg font-semibold ${textClass} mb-3 flex items-center gap-2`}>
                <Target className="w-5 h-5 text-orange-500" />
                Top Recommendations
              </h3>
              <div className={`${textSecondary} font-light whitespace-pre-line`}>{insights.recommendations}</div>
            </div>
          )}

          {insights.quickWins && (
            <div className="bg-orange-500/10 rounded-2xl p-6 border border-orange-500/20">
              <h3 className="text-lg font-semibold text-orange-500 mb-3">Quick Wins</h3>
              <div className={`${textSecondary} font-light whitespace-pre-line`}>{insights.quickWins}</div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">
            {insights.sources && (
              <div className={`${sectionBg} rounded-2xl p-6 border ${borderClass}`}>
                <h3 className={`text-lg font-semibold ${textClass} mb-3`}>Lead Source Analysis</h3>
                <div className={`${textSecondary} font-light whitespace-pre-line text-sm`}>{insights.sources}</div>
              </div>
            )}
            {insights.concerns && (
              <div className={`${sectionBg} rounded-2xl p-6 border ${borderClass}`}>
                <h3 className={`text-lg font-semibold ${textClass} mb-3`}>Areas of Concern</h3>
                <div className={`${textSecondary} font-light whitespace-pre-line text-sm`}>{insights.concerns}</div>
              </div>
            )}
          </div>
        </div>
      ) : insights?.error ? (
        <div className="text-center py-8">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 inline-block">
            <p className="text-red-500">{insights.error}</p>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className={`${textSecondary} font-light`}>
            Click &ldquo;Generate Insights&rdquo; to get AI-powered analysis of your sales data
          </p>
        </div>
      )}
    </div>
  );
}
