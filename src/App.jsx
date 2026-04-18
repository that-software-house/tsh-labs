import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import LabsLanding from './pages/LabsLanding';
import LabsShowcase from './pages/LabsShowcase';
import LabsToolPage from './pages/LabsToolPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-shell">
        <Routes>
          <Route path="/" element={<LabsLanding />} />
          <Route path="/showcase" element={<LabsShowcase />} />
          <Route path="/app/:projectId" element={<LabsToolPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
