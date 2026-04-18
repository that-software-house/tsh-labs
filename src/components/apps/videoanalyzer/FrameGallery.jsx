import React, { useEffect, useMemo, useState } from 'react';
import { Clock, Download, Check, Loader2 } from 'lucide-react';
import { downloadFramesZip } from './frameZip';

const FrameGallery = ({
  frames,
  frameDescriptions,
  selectable = true,
  showDownload = true,
  subtitle,
  onSelectionChange,
}) => {
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    if (!frames || frames.length === 0) {
      setSelectedIndices([]);
      return;
    }

    setSelectedIndices(selectable ? frames.map((_, index) => index) : []);
  }, [frames, selectable]);

  useEffect(() => {
    if (!onSelectionChange) return;

    const selectedFrames = selectable
      ? selectedIndices.map((selectedIndex) => frames[selectedIndex]).filter(Boolean)
      : [];
    onSelectionChange(selectedFrames);
  }, [frames, onSelectionChange, selectable, selectedIndices]);

  const descriptionMap = useMemo(() => {
    const map = {};

    if (frameDescriptions) {
      frameDescriptions.forEach((fd) => {
        map[fd.timestamp] = fd.description;
      });
    }

    return map;
  }, [frameDescriptions]);

  if (!frames || frames.length === 0) return null;

  const selectedCount = selectable ? selectedIndices.length : 0;
  const selectedSet = new Set(selectedIndices);

  const toggleFrameSelection = (index) => {
    if (!selectable) return;

    setDownloadSuccess(false);
    setSelectedIndices((current) => (
      current.includes(index)
        ? current.filter((value) => value !== index)
        : [...current, index].sort((a, b) => a - b)
    ));
  };

  const handleSelectAll = () => {
    setDownloadSuccess(false);
    setSelectedIndices(frames.map((_, index) => index));
  };

  const handleClearSelection = () => {
    setDownloadSuccess(false);
    setSelectedIndices([]);
  };

  const handleDownloadSelected = async () => {
    const indicesToDownload = selectable
      ? selectedIndices
      : frames.map((_, index) => index);

    if (indicesToDownload.length === 0 || isDownloading) return;

    setIsDownloading(true);
    setDownloadSuccess(false);

    try {
      downloadFramesZip(frames, indicesToDownload);
      setDownloadSuccess(true);
      window.setTimeout(() => setDownloadSuccess(false), 2000);
    } catch (error) {
      console.error('Failed to download selected frames:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="vidanalyzer-gallery">
      <div className="vidanalyzer-gallery-header">
        <div>
          <h3 className="vidanalyzer-gallery-title">
            Extracted Frames ({frames.length})
          </h3>
          <p className="vidanalyzer-gallery-subtitle">
            {subtitle || (selectable ? `${selectedCount} of ${frames.length} selected` : `${frames.length} generated frames`)}
          </p>
        </div>

        {(selectable || showDownload) && (
          <div className="vidanalyzer-gallery-actions">
            {selectable && (
              <>
                <button
                  className="vidanalyzer-secondary-btn"
                  onClick={handleSelectAll}
                  disabled={selectedCount === frames.length}
                  type="button"
                >
                  Select All
                </button>
                <button
                  className="vidanalyzer-secondary-btn"
                  onClick={handleClearSelection}
                  disabled={selectedCount === 0}
                  type="button"
                >
                  Clear
                </button>
              </>
            )}
            {showDownload && (
              <button
                className={`vidanalyzer-download-btn ${downloadSuccess ? 'success' : ''}`}
                onClick={handleDownloadSelected}
                disabled={(selectable ? selectedCount === 0 : frames.length === 0) || isDownloading}
                type="button"
              >
                {isDownloading ? (
                  <>
                    <Loader2 size={16} className="spinning" />
                    <span>Preparing ZIP...</span>
                  </>
                ) : downloadSuccess ? (
                  <>
                    <Check size={16} />
                    <span>Downloaded</span>
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    <span>{selectable ? 'Download Selected (.zip)' : 'Download Frames (.zip)'}</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="vidanalyzer-frames-grid">
        {frames.map((frame, idx) => {
          const isSelected = selectable ? selectedSet.has(idx) : false;

          return (
            <button
              key={`${frame.timestamp}-${idx}`}
              className={`vidanalyzer-frame-card ${selectable ? (isSelected ? 'selected' : 'unselected') : 'readonly'}`}
              onClick={() => toggleFrameSelection(idx)}
              type="button"
              disabled={!selectable}
            >
              <div className="vidanalyzer-frame-img-wrapper">
                <img src={frame.base64} alt={`Frame at ${frame.timestamp}`} />
                <span className="vidanalyzer-frame-time">
                  <Clock size={10} />
                  {frame.timestamp}
                </span>
                {selectable && (
                  <span className={`vidanalyzer-frame-check ${isSelected ? 'selected' : ''}`}>
                    {isSelected && <Check size={12} />}
                  </span>
                )}
              </div>
              {descriptionMap[frame.timestamp] && (
                <p className="vidanalyzer-frame-desc">
                  {descriptionMap[frame.timestamp]}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FrameGallery;
