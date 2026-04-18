import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import './DataInsightsApp.css';
import { analyzeData } from '@/services/openai';
import FileUploader from './datainsights/FileUploader';
import DataPreview from './datainsights/DataPreview';
import InsightsSummary from './datainsights/InsightsSummary';
import ChartContainer from './datainsights/ChartContainer';
import ChartExporter from './datainsights/ChartExporter';

const DataInsightsApp = () => {
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('');
  const [currentFile, setCurrentFile] = useState(null);
  const [rawData, setRawData] = useState(null);
  const [schema, setSchema] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [visualizations, setVisualizations] = useState([]);
  const [activeChart, setActiveChart] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');

  const chartRef = useRef(null);

  const handleFileSelect = (file) => {
    setError('');
    setRawData(null);
    setSchema(null);
    setAnalysis(null);
    setVisualizations([]);
    setActiveChart(0);

    if (!file) {
      setFileName('');
      setFileType('');
      setCurrentFile(null);
      return;
    }

    setCurrentFile(file);
    setFileName(file.name);
    setFileType(file.type || 'unknown');
  };

  const handleAnalyze = async () => {
    if (!currentFile) {
      setError('Please upload a file first.');
      return;
    }

    setIsAnalyzing(true);
    setError('');

    try {
      const result = await analyzeData(currentFile);

      if (result.parsedData) {
        setRawData(result.parsedData);
      }

      if (result.schema) {
        setSchema(result.schema);
      }

      if (result.analysis) {
        setAnalysis(result.analysis);
      }

      if (result.visualizations?.recommendations) {
        setVisualizations(result.visualizations.recommendations);
        setActiveChart(0);
      }
    } catch (err) {
      setError(err.message || 'Unable to analyze data right now.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const hasResults = schema || analysis || visualizations.length > 0;
  const currentChartTitle = visualizations[activeChart]?.title || '';

  return (
    <div className="datainsights-app">
      <div className="datainsights-card">
        <div className="datainsights-header">
          <div className="datainsights-icon">
            <BarChart3 size={20} />
          </div>
          <div>
            <h2>Data Insights</h2>
            <p>Upload a data file to visualize and get AI-powered insights.</p>
          </div>
        </div>

        <FileUploader
          onFileSelect={handleFileSelect}
          fileName={fileName}
          fileType={fileType}
          disabled={isAnalyzing}
        />

        {error && (
          <div className="datainsights-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div className="datainsights-actions">
          <button
            className="datainsights-primary"
            onClick={handleAnalyze}
            disabled={isAnalyzing || !currentFile}
          >
            {isAnalyzing ? (
              <>
                <Loader2 size={18} className="spinning" />
                <span>Analyzing data...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Analyze Data</span>
              </>
            )}
          </button>
        </div>

        {isAnalyzing && (
          <div className="datainsights-progress">
            <div className="datainsights-progress-bar">
              <div className="datainsights-progress-fill" />
            </div>
            <p>Processing your data through AI pipeline...</p>
          </div>
        )}
      </div>

      {/* Data Preview */}
      {rawData && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <DataPreview
            headers={rawData.headers}
            rows={rawData.preview}
            schema={schema}
            rowCount={rawData.rowCount}
          />
        </motion.div>
      )}

      {/* Insights & Visualizations */}
      {hasResults && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="datainsights-results"
        >
          <div className="datainsights-results-header">
            <div>
              <p className="datainsights-label">Analysis</p>
              <h3>Data Insights & Visualizations</h3>
            </div>
            {visualizations.length > 0 && (
              <ChartExporter
                chartRef={chartRef}
                chartTitle={currentChartTitle}
                disabled={isAnalyzing}
              />
            )}
          </div>

          <div className="datainsights-results-grid">
            {/* Left: Charts */}
            {visualizations.length > 0 && (
              <div className="datainsights-charts-section">
                <ChartContainer
                  ref={chartRef}
                  recommendations={visualizations}
                  activeChart={activeChart}
                  onChartChange={setActiveChart}
                />
              </div>
            )}

            {/* Right: Summary */}
            {analysis && (
              <div className="datainsights-summary-section">
                <InsightsSummary analysis={analysis} schema={schema} />
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DataInsightsApp;
