import React from 'react';
import { AlertTriangle, BarChart3, Lightbulb, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const InsightsSummary = ({ analysis, schema }) => {
  if (!analysis) return null;

  const { statistics, categoricalDistribution, trends, correlations, insights, anomalies } = analysis;
  const qualityIssues = schema?.qualityIssues || [];

  const formatNumber = (num) => {
    if (num === null || num === undefined) return '-';
    if (typeof num !== 'number') return num;
    if (Number.isInteger(num)) return num.toLocaleString();
    return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  const getTrendIcon = (trend) => {
    switch (trend?.toLowerCase()) {
      case 'increasing':
        return <TrendingUp size={14} className="trend-up" />;
      case 'decreasing':
        return <TrendingDown size={14} className="trend-down" />;
      default:
        return <Minus size={14} className="trend-stable" />;
    }
  };

  const getCorrelationLabel = (coefficient) => {
    const abs = Math.abs(coefficient);
    if (abs >= 0.7) return 'Strong';
    if (abs >= 0.4) return 'Moderate';
    return 'Weak';
  };

  const hasStatistics = statistics && Object.keys(statistics).length > 0;
  const hasTrends = trends && trends.length > 0;
  const hasCorrelations = correlations && correlations.length > 0;
  const hasInsights = insights && insights.length > 0;
  const hasQualityIssues = qualityIssues && qualityIssues.length > 0;

  return (
    <div className="datainsights-summary">
      {/* Quality Issues Warning */}
      {hasQualityIssues && (
        <div className="datainsights-quality-warnings">
          <div className="datainsights-section-header warning">
            <AlertTriangle size={16} />
            <span>Data Quality Issues</span>
          </div>
          <ul className="datainsights-warnings-list">
            {qualityIssues.map((issue, idx) => (
              <li key={idx} className={`severity-${issue.severity || 'low'}`}>
                <strong>{issue.column}:</strong> {issue.issue}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Statistics Cards */}
      {hasStatistics && (
        <div className="datainsights-stats-section">
          <div className="datainsights-section-header">
            <BarChart3 size={16} />
            <span>Statistics</span>
          </div>
          <div className="datainsights-stats-grid">
            {Object.entries(statistics).slice(0, 6).map(([column, stats]) => (
              <div key={column} className="datainsights-stat-card">
                <div className="datainsights-stat-header">{column}</div>
                <div className="datainsights-stat-values">
                  {stats.min !== undefined && (
                    <div className="datainsights-stat-item">
                      <span className="label">Min</span>
                      <span className="value">{formatNumber(stats.min)}</span>
                    </div>
                  )}
                  {stats.max !== undefined && (
                    <div className="datainsights-stat-item">
                      <span className="label">Max</span>
                      <span className="value">{formatNumber(stats.max)}</span>
                    </div>
                  )}
                  {stats.mean !== undefined && (
                    <div className="datainsights-stat-item">
                      <span className="label">Mean</span>
                      <span className="value">{formatNumber(stats.mean)}</span>
                    </div>
                  )}
                  {stats.median !== undefined && (
                    <div className="datainsights-stat-item">
                      <span className="label">Median</span>
                      <span className="value">{formatNumber(stats.median)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trends */}
      {hasTrends && (
        <div className="datainsights-trends-section">
          <div className="datainsights-section-header">
            <TrendingUp size={16} />
            <span>Trends</span>
          </div>
          <div className="datainsights-trends-list">
            {trends.map((trend, idx) => (
              <div key={idx} className="datainsights-trend-item">
                {getTrendIcon(trend.trend)}
                <span className="trend-text">
                  <strong>{trend.metric}</strong> is{' '}
                  <span className={`trend-${trend.trend?.toLowerCase()}`}>
                    {trend.trend?.toLowerCase()}
                  </span>
                  {trend.changePercent && (
                    <span className="trend-change">
                      ({trend.changePercent > 0 ? '+' : ''}{trend.changePercent}%)
                    </span>
                  )}
                  {trend.column && <span className="trend-by"> over {trend.column}</span>}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Correlations */}
      {hasCorrelations && (
        <div className="datainsights-correlations-section">
          <div className="datainsights-section-header">
            <span>Correlations</span>
          </div>
          <div className="datainsights-correlations-list">
            {correlations.map((corr, idx) => (
              <div key={idx} className="datainsights-correlation-item">
                <div className="correlation-columns">
                  <span>{corr.column1}</span>
                  <span className="correlation-arrow">↔</span>
                  <span>{corr.column2}</span>
                </div>
                <div className="correlation-value">
                  <span className={`coefficient ${corr.coefficient >= 0 ? 'positive' : 'negative'}`}>
                    {corr.coefficient >= 0 ? '+' : ''}{formatNumber(corr.coefficient)}
                  </span>
                  <span className="correlation-strength">
                    {getCorrelationLabel(corr.coefficient)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Insights */}
      {hasInsights && (
        <div className="datainsights-insights-section">
          <div className="datainsights-section-header">
            <Lightbulb size={16} />
            <span>Key Insights</span>
          </div>
          <ul className="datainsights-insights-list">
            {insights.map((insight, idx) => (
              <li key={idx}>{insight}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default InsightsSummary;
