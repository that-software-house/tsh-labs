import React, { useRef, useState } from 'react';
import { Upload, Link, X, FileVideo } from 'lucide-react';

const ACCEPTED_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

function isYouTubeUrl(url) {
  return /^https?:\/\/(www\.)?(youtube\.com\/watch\?|youtu\.be\/|youtube\.com\/shorts\/)/.test(url);
}

function extractVideoId(url) {
  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

const VideoInput = ({ onVideoSelect, disabled }) => {
  const [activeTab, setActiveTab] = useState('file');
  const [urlValue, setUrlValue] = useState('');
  const [fileName, setFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (file) => {
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type) && !file.name.match(/\.(mp4|webm|ogg|mov)$/i)) {
      onVideoSelect(null, 'Unsupported file type. Please upload MP4, WebM, OGG, or MOV.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      onVideoSelect(null, 'File too large. Maximum size is 500MB.');
      return;
    }

    setFileName(file.name);
    const objectUrl = URL.createObjectURL(file);
    onVideoSelect({
      type: 'file',
      src: objectUrl,
      name: file.name,
      file,
      size: file.size,
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files[0];
    if (file) handleFileChange(file);
  };

  const handleUrlSubmit = () => {
    if (!urlValue.trim()) return;
    setFileName('');
    const url = urlValue.trim();
    if (isYouTubeUrl(url)) {
      const videoId = extractVideoId(url);
      if (!videoId) {
        onVideoSelect(null, 'Could not extract YouTube video ID from URL.');
        return;
      }
      onVideoSelect({ type: 'youtube', src: url, name: `YouTube: ${videoId}`, videoId });
      return;
    }
    onVideoSelect({ type: 'url', src: url, name: url });
  };

  const handleClear = () => {
    setFileName('');
    setUrlValue('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    onVideoSelect(null);
  };

  return (
    <div className="vidanalyzer-input">
      <div className="vidanalyzer-tabs">
        <button
          className={`vidanalyzer-tab ${activeTab === 'file' ? 'active' : ''}`}
          onClick={() => setActiveTab('file')}
          disabled={disabled}
        >
          <Upload size={14} />
          Upload File
        </button>
        <button
          className={`vidanalyzer-tab ${activeTab === 'url' ? 'active' : ''}`}
          onClick={() => setActiveTab('url')}
          disabled={disabled}
        >
          <Link size={14} />
          Paste URL
        </button>
      </div>

      {activeTab === 'file' ? (
        <div
          className={`vidanalyzer-upload ${isDragging ? 'dragging' : ''} ${fileName ? 'has-file' : ''} ${disabled ? 'disabled' : ''}`}
          onClick={() => !disabled && fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); if (!disabled) setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm,video/ogg,video/quicktime,.mp4,.webm,.ogg,.mov"
            onChange={(e) => handleFileChange(e.target.files[0])}
            disabled={disabled}
          />
          <div className="vidanalyzer-upload-icon">
            <FileVideo size={22} />
          </div>
          <div className="vidanalyzer-upload-content">
            {fileName ? (
              <>
                <span className="vidanalyzer-upload-filename">{fileName}</span>
                <p className="vidanalyzer-upload-hint">Click to change file</p>
              </>
            ) : (
              <>
                <span className="vidanalyzer-upload-text">
                  {isDragging ? 'Drop your video here' : 'Drop video or click to upload'}
                </span>
                <p className="vidanalyzer-upload-hint">MP4, WebM, OGG, MOV up to 500MB</p>
              </>
            )}
          </div>
          {fileName && (
            <button
              className="vidanalyzer-upload-clear"
              onClick={(e) => { e.stopPropagation(); handleClear(); }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      ) : (
        <div className="vidanalyzer-url-input">
          <input
            type="url"
            placeholder="Paste a video URL (.mp4, .webm) or YouTube link"
            value={urlValue}
            onChange={(e) => setUrlValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
            disabled={disabled}
          />
          <button
            className="vidanalyzer-url-btn"
            onClick={handleUrlSubmit}
            disabled={disabled || !urlValue.trim()}
          >
            Load
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoInput;
