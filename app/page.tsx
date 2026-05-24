'use client';

import { useState } from 'react';

interface DetectorOutput {
  title: string;
  company: string;
  match_percentage: number;
  tier: number | null;
  tier_name: string;
  explicit_matches: number;
  implicit_matches: number;
  green_flags: string[];
  hubspot_status: string;
  recommendation: 'APPLY' | 'REVIEW' | 'PASS';
  recommendation_reason: string;
  auto_excluded: boolean;
  exclusion_reasons: string[];
}

export default function Home() {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DetectorOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, company, description }),
      });

      if (!response.ok) {
        throw new Error('Failed to process job');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'APPLY':
        return 'bg-green-100 border-green-400 text-green-800';
      case 'REVIEW':
        return 'bg-yellow-100 border-yellow-400 text-yellow-800';
      case 'PASS':
        return 'bg-red-100 border-red-400 text-red-800';
      default:
        return 'bg-gray-100 border-gray-400 text-gray-800';
    }
  };

  const getTierColor = (tier: number | null) => {
    if (tier === null) return 'bg-gray-50';
    if (tier >= 3) return 'bg-green-50';
    if (tier >= 2) return 'bg-blue-50';
    if (tier >= 1) return 'bg-yellow-50';
    return 'bg-orange-50';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Nath's Job Matcher</h1>
          <p className="text-slate-300">PROTOCOL 1A v3 Job Scoring</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Director of Content"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g., TechCorp"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Paste the full job description here..."
                rows={10}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {loading ? 'Scoring...' : 'Score Job'}
            </button>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded-lg mb-8">
            {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className={`rounded-lg shadow-lg p-8 border-l-4 ${getTierColor(result.tier)}`}>
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{result.title}</h2>
                <p className="text-lg text-gray-600">{result.company}</p>
              </div>
              <div className="text-right">
                <div className={`inline-block px-4 py-2 rounded-lg border-2 font-bold ${getRecommendationColor(result.recommendation)}`}>
                  {result.recommendation}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded p-4">
                <p className="text-sm text-gray-600">Match %</p>
                <p className="text-3xl font-bold text-blue-600">{result.match_percentage}%</p>
              </div>
              <div className="bg-white rounded p-4">
                <p className="text-sm text-gray-600">Tier</p>
                <p className="text-3xl font-bold text-purple-600">
                  {result.tier !== null ? result.tier : '—'}
                </p>
              </div>
              <div className="bg-white rounded p-4">
                <p className="text-sm text-gray-600">HubSpot</p>
                <p className="text-lg font-semibold">{result.hubspot_status}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Requirements Match</h3>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-semibold">Explicit:</span> {result.explicit_matches}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Implicit:</span> {result.implicit_matches}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Green Flags</h3>
                <div className="space-y-1">
                  {result.green_flags.length > 0 ? (
                    result.green_flags.map((flag, i) => (
                      <p key={i} className="text-sm text-green-700">✓ {flag}</p>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">None detected</p>
                  )}
                </div>
              </div>
            </div>

            {result.auto_excluded && (
              <div className="bg-red-50 border border-red-200 rounded p-4 mb-6">
                <h3 className="font-bold text-red-900 mb-2">Auto-Excluded</h3>
                <ul className="text-sm text-red-800">
                  {result.exclusion_reasons.map((reason, i) => (
                    <li key={i}>• {reason}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <p className="text-sm text-gray-700">{result.recommendation_reason}</p>
            </div>
          </div>
        )}

        {/* Placeholder */}
        {!result && !error && (
          <div className="text-center text-slate-400 py-16">
            <p className="text-lg">Paste a job description above and click "Score Job"</p>
          </div>
        )}
      </div>
    </div>
  );
}
