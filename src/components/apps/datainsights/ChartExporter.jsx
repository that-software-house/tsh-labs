import React, { useState } from 'react';
import { Download, Loader2, Check } from 'lucide-react';

const ChartExporter = ({ chartRef, chartTitle, disabled }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleExport = async () => {
    if (!chartRef?.current || isExporting) return;

    setIsExporting(true);
    setExportSuccess(false);

    try {
      const svg = chartRef.current.querySelector('svg');
      if (!svg) {
        throw new Error('No chart SVG found for export');
      }

      const serializedSvg = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([serializedSvg], { type: 'image/svg+xml;charset=utf-8' });
      const dataUrl = URL.createObjectURL(svgBlob);
      const link = document.createElement('a');
      const filename = chartTitle
        ? `${chartTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-chart.png`
        : 'data-insights-chart';

      link.download = `${filename}.svg`;
      link.href = dataUrl;
      link.click();
      URL.revokeObjectURL(dataUrl);

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 2000);
    } catch (error) {
      console.error('Failed to export chart:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      className={`datainsights-export-btn ${exportSuccess ? 'success' : ''}`}
      onClick={handleExport}
      disabled={disabled || isExporting || !chartRef?.current}
      title="Export chart as SVG"
    >
      {isExporting ? (
        <>
          <Loader2 size={16} className="spinning" />
          <span>Exporting...</span>
        </>
      ) : exportSuccess ? (
        <>
          <Check size={16} />
          <span>Exported!</span>
        </>
      ) : (
        <>
          <Download size={16} />
          <span>Export SVG</span>
        </>
      )}
    </button>
  );
};

export default ChartExporter;
