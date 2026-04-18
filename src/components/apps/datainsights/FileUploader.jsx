import React, { useCallback, useState } from 'react';
import { FileSpreadsheet, FileJson, FileText, UploadCloud, X } from 'lucide-react';

const FileUploader = ({ onFileSelect, fileName, fileType, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);

  const allowedExtensions = ['.csv', '.json', '.xlsx', '.xls'];
  const allowedTypes = [
    'text/csv',
    'application/json',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
  ];

  const getFileIcon = () => {
    if (!fileName) return <UploadCloud size={24} />;

    const ext = fileName.toLowerCase().split('.').pop();
    switch (ext) {
      case 'csv':
        return <FileText size={24} />;
      case 'json':
        return <FileJson size={24} />;
      case 'xlsx':
      case 'xls':
        return <FileSpreadsheet size={24} />;
      default:
        return <FileText size={24} />;
    }
  };

  const getFileTypeBadge = () => {
    if (!fileName) return null;

    const ext = fileName.toLowerCase().split('.').pop();
    const badges = {
      csv: { label: 'CSV', color: '#10b981' },
      json: { label: 'JSON', color: '#6366f1' },
      xlsx: { label: 'Excel', color: '#059669' },
      xls: { label: 'Excel', color: '#059669' },
    };

    const badge = badges[ext] || { label: ext.toUpperCase(), color: '#6b7280' };
    return (
      <span
        className="datainsights-file-badge"
        style={{ backgroundColor: badge.color }}
      >
        {badge.label}
      </span>
    );
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const validateFile = (file) => {
    if (!file) return false;

    const hasAllowedExt = allowedExtensions.some((ext) =>
      file.name.toLowerCase().endsWith(ext)
    );
    const hasAllowedType = allowedTypes.includes(file.type);

    return hasAllowedExt || hasAllowedType;
  };

  const handleFile = useCallback((file) => {
    if (validateFile(file)) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, [disabled, handleFile]);

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleClear = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onFileSelect(null);
  };

  return (
    <label
      className={`datainsights-upload ${isDragging ? 'dragging' : ''} ${disabled ? 'disabled' : ''} ${fileName ? 'has-file' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept=".csv,.json,.xlsx,.xls"
        onChange={handleInputChange}
        disabled={disabled}
      />

      <div className="datainsights-upload-icon">
        {getFileIcon()}
      </div>

      <div className="datainsights-upload-content">
        {fileName ? (
          <>
            <div className="datainsights-upload-filename">
              <span>{fileName}</span>
              {getFileTypeBadge()}
            </div>
            <p className="datainsights-upload-hint">
              Click or drag to replace
            </p>
          </>
        ) : (
          <>
            <span className="datainsights-upload-text">
              {isDragging ? 'Drop file here' : 'Drop a file or click to upload'}
            </span>
            <p className="datainsights-upload-hint">
              Supports CSV, JSON, and Excel files (up to 10MB)
            </p>
          </>
        )}
      </div>

      {fileName && !disabled && (
        <button
          className="datainsights-upload-clear"
          onClick={handleClear}
          type="button"
        >
          <X size={16} />
        </button>
      )}
    </label>
  );
};

export default FileUploader;
