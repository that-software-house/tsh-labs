import React, { useState, forwardRef } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  ScatterChart,
  Scatter,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
  Cell,
} from 'recharts';
import { BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon, ScatterChart as ScatterChartIcon } from 'lucide-react';

const COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#14b8a6',
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="datainsights-tooltip">
      {label && <div className="tooltip-label">{label}</div>}
      {payload.map((entry, idx) => (
        <div key={idx} className="tooltip-item" style={{ color: entry.color }}>
          <span className="tooltip-name">{entry.name || entry.dataKey}:</span>
          <span className="tooltip-value">
            {typeof entry.value === 'number'
              ? entry.value.toLocaleString(undefined, { maximumFractionDigits: 2 })
              : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

const ChartContainer = forwardRef(({ recommendations, activeChart, onChartChange }, ref) => {
  const [hiddenSeries, setHiddenSeries] = useState({});

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="datainsights-charts-empty">
        <BarChart3 size={48} />
        <p>No visualizations available yet</p>
      </div>
    );
  }

  const currentChart = recommendations[activeChart] || recommendations[0];
  const { chartType, title, description, config, data, rationale } = currentChart;

  const handleLegendClick = (entry) => {
    const dataKey = entry.dataKey || entry.value;
    setHiddenSeries((prev) => ({
      ...prev,
      [dataKey]: !prev[dataKey],
    }));
  };

  const getChartIcon = (type) => {
    switch (type) {
      case 'bar':
        return <BarChart3 size={14} />;
      case 'line':
        return <LineChartIcon size={14} />;
      case 'pie':
        return <PieChartIcon size={14} />;
      case 'scatter':
        return <ScatterChartIcon size={14} />;
      case 'area':
        return <LineChartIcon size={14} />;
      default:
        return <BarChart3 size={14} />;
    }
  };

  const renderChart = () => {
    if (!data || data.length === 0) {
      return (
        <div className="datainsights-chart-nodata">
          <p>No data available for this chart</p>
        </div>
      );
    }

    const xKey = config?.xAxisKey || Object.keys(data[0])[0];
    const yKey = config?.yAxisKey || Object.keys(data[0])[1];
    const showBrush = data.length > 20;

    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey={xKey}
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
                label={config?.xAxisLabel ? { value: config.xAxisLabel, position: 'bottom', offset: 40 } : undefined}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                label={config?.yAxisLabel ? { value: config.yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend onClick={handleLegendClick} />
              {showBrush && <Brush dataKey={xKey} height={30} stroke="#6366f1" />}
              <Bar
                dataKey={yKey}
                fill={COLORS[0]}
                opacity={hiddenSeries[yKey] ? 0.2 : 1}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey={xKey}
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend onClick={handleLegendClick} />
              {showBrush && <Brush dataKey={xKey} height={30} stroke="#6366f1" />}
              <Line
                type="monotone"
                dataKey={yKey}
                stroke={COLORS[0]}
                strokeWidth={2}
                dot={{ fill: COLORS[0], r: 4 }}
                activeDot={{ r: 6 }}
                opacity={hiddenSeries[yKey] ? 0.2 : 1}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey={xKey}
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend onClick={handleLegendClick} />
              {showBrush && <Brush dataKey={xKey} height={30} stroke="#6366f1" />}
              <Area
                type="monotone"
                dataKey={yKey}
                stroke={COLORS[0]}
                fill={COLORS[0]}
                fillOpacity={hiddenSeries[yKey] ? 0.1 : 0.3}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={350}>
            <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <Pie
                data={data}
                dataKey={yKey}
                nameKey={xKey}
                cx="50%"
                cy="50%"
                outerRadius={120}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                labelLine={{ stroke: '#6b7280' }}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    opacity={hiddenSeries[entry[xKey]] ? 0.2 : 1}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend onClick={handleLegendClick} />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={350}>
            <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey={xKey}
                type="number"
                tick={{ fontSize: 12 }}
                label={config?.xAxisLabel ? { value: config.xAxisLabel, position: 'bottom', offset: 0 } : undefined}
              />
              <YAxis
                dataKey={yKey}
                type="number"
                tick={{ fontSize: 12 }}
                label={config?.yAxisLabel ? { value: config.yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
              <Scatter
                name={`${xKey} vs ${yKey}`}
                data={data}
                fill={COLORS[0]}
                opacity={0.7}
              />
            </ScatterChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey={yKey} fill={COLORS[0]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className="datainsights-charts">
      {/* Chart Tabs */}
      {recommendations.length > 1 && (
        <div className="datainsights-chart-tabs">
          {recommendations.map((rec, idx) => (
            <button
              key={idx}
              className={`datainsights-chart-tab ${activeChart === idx ? 'active' : ''}`}
              onClick={() => onChartChange(idx)}
            >
              {getChartIcon(rec.chartType)}
              <span>{rec.title || `Chart ${idx + 1}`}</span>
            </button>
          ))}
        </div>
      )}

      {/* Chart Display */}
      <div className="datainsights-chart-wrapper" ref={ref}>
        <div className="datainsights-chart-header">
          <h3>{title}</h3>
          {description && <p>{description}</p>}
        </div>

        <div className="datainsights-chart-content">
          {renderChart()}
        </div>

        {rationale && (
          <div className="datainsights-chart-rationale">
            <span>Why this chart:</span> {rationale}
          </div>
        )}
      </div>
    </div>
  );
});

ChartContainer.displayName = 'ChartContainer';

export default ChartContainer;
