import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Table } from 'lucide-react';

const DataPreview = ({ headers, rows, schema, rowCount }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!headers || headers.length === 0) {
    return null;
  }

  const previewRows = rows?.slice(0, 10) || [];
  const schemaMap = {};
  schema?.schema?.forEach((col) => {
    schemaMap[col.name] = col;
  });

  const getTypeBadge = (columnName) => {
    const col = schemaMap[columnName];
    if (!col) return null;

    const typeColors = {
      number: '#6366f1',
      string: '#10b981',
      date: '#f59e0b',
      boolean: '#8b5cf6',
    };

    const roleIcons = {
      measure: 'M',
      dimension: 'D',
    };

    return (
      <div className="datainsights-column-badges">
        <span
          className="datainsights-type-badge"
          style={{ backgroundColor: typeColors[col.type] || '#6b7280' }}
        >
          {col.type}
        </span>
        {col.role && (
          <span className="datainsights-role-badge" title={col.role}>
            {roleIcons[col.role]}
          </span>
        )}
      </div>
    );
  };

  const formatCellValue = (value) => {
    if (value === null || value === undefined) return <span className="null-value">null</span>;
    if (value === '') return <span className="empty-value">empty</span>;
    if (typeof value === 'object') return JSON.stringify(value);

    const str = String(value);
    if (str.length > 50) return str.slice(0, 47) + '...';
    return str;
  };

  return (
    <div className={`datainsights-preview ${isCollapsed ? 'collapsed' : ''}`}>
      <div
        className="datainsights-preview-header"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="datainsights-preview-title">
          <Table size={16} />
          <span>Data Preview</span>
          <span className="datainsights-preview-count">
            {rowCount ? `${rowCount.toLocaleString()} rows` : `${previewRows.length} rows`}
          </span>
        </div>
        <button className="datainsights-preview-toggle">
          {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
        </button>
      </div>

      {!isCollapsed && (
        <div className="datainsights-preview-body">
          <div className="datainsights-table-wrapper">
            <table className="datainsights-table">
              <thead>
                <tr>
                  <th className="row-number">#</th>
                  {headers.map((header) => (
                    <th key={header}>
                      <div className="datainsights-column-header">
                        <span>{header}</span>
                        {getTypeBadge(header)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, idx) => (
                  <tr key={idx}>
                    <td className="row-number">{idx + 1}</td>
                    {headers.map((header) => (
                      <td key={header}>{formatCellValue(row[header])}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rowCount > 10 && (
            <div className="datainsights-preview-footer">
              Showing first 10 of {rowCount.toLocaleString()} rows
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DataPreview;
