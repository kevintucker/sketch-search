import React, { useState } from 'react';
import { Play, RotateCcw, Download, AlertCircle, CheckCircle, Clock, FileText, Film } from 'lucide-react';
import { format } from 'date-fns';

interface LogEntry {
  id: string;
  timestamp: string;
  status: 'pending' | 'success' | 'error';
  request: any;
  response?: any;
  error?: string;
}

interface TestResponse {
  scene_graph: any;
  video_url: string;
  status: string;
  timestamp: string;
}

export const Sandbox: React.FC = () => {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [latestResponse, setLatestResponse] = useState<TestResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sample images for testing
  const sampleImages = [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop'
  ];

  const runTest = async () => {
    setIsRunning(true);
    setError(null);
    
    const logId = Date.now().toString();
    const logEntry: LogEntry = {
      id: logId,
      timestamp: new Date().toISOString(),
      status: 'pending',
      request: {
        image: 'sample_image.jpg',
        test_mode: true,
        timestamp: new Date().toISOString()
      }
    };
    
    setLogs(prev => [logEntry, ...prev]);

    try {
      // Create a sample image file from URL
      const imageUrl = sampleImages[Math.floor(Math.random() * sampleImages.length)];
      const imageResponse = await fetch(imageUrl);
      const imageBlob = await imageResponse.blob();
      const file = new File([imageBlob], 'sample_image.jpg', { type: 'image/jpeg' });
      
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const testResponse: TestResponse = {
        scene_graph: data.scene_graph || {
          objects: [
            { type: 'person', position: [100, 200], confidence: 0.95 },
            { type: 'tree', position: [300, 150], confidence: 0.87 }
          ],
          relationships: [
            { subject: 'person', predicate: 'standing_near', object: 'tree' }
          ]
        },
        video_url: data.video_url || '/api/sample-video.mp4',
        status: 'completed',
        timestamp: new Date().toISOString()
      };

      setLatestResponse(testResponse);
      
      // Update log entry
      setLogs(prev => prev.map(log => 
        log.id === logId 
          ? { ...log, status: 'success', response: testResponse }
          : log
      ));

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      
      setLogs(prev => prev.map(log => 
        log.id === logId 
          ? { ...log, status: 'error', error: errorMessage }
          : log
      ));
    } finally {
      setIsRunning(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
    setLatestResponse(null);
    setError(null);
  };

  const downloadLogs = () => {
    const logData = {
      timestamp: new Date().toISOString(),
      logs: logs,
      summary: {
        total: logs.length,
        successful: logs.filter(l => l.status === 'success').length,
        failed: logs.filter(l => l.status === 'error').length,
        pending: logs.filter(l => l.status === 'pending').length
      }
    };
    
    const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sandbox-logs-${format(new Date(), 'yyyy-MM-dd-HH-mm-ss')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="cyber-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="cyber-font text-2xl font-bold text-cyber-cyan">Development Sandbox</h1>
          <div className="flex space-x-3">
            <button
              onClick={runTest}
              disabled={isRunning}
              className="cyber-button flex items-center space-x-2 disabled:opacity-50"
            >
              {isRunning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Running...</span>
                </>
              ) : (
                <>
                  <Play size={16} />
                  <span>Start Test</span>
                </>
              )}
            </button>
            <button
              onClick={clearLogs}
              className="cyber-button-icon"
              title="Clear Logs"
            >
              <RotateCcw size={16} />
            </button>
            <button
              onClick={downloadLogs}
              className="cyber-button-icon"
              title="Download Logs"
              disabled={logs.length === 0}
            >
              <Download size={16} />
            </button>
          </div>
        </div>
        
        <p className="text-cyber-gray">
          Automatically test the image upload pipeline with sample images. Click "Start Test" to simulate an upload and see the full response.
        </p>
      </div>

      {/* Error State */}
      {error && (
        <div className="cyber-card border-l-4 border-red-500 bg-red-500/10 p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="text-red-500" size={20} />
            <span className="text-red-400 font-semibold">Error: {error}</span>
          </div>
        </div>
      )}

      {/* Response Display */}
      {latestResponse && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scene Graph */}
          <div className="cyber-card p-6">
            <div className="flex items-center space-x-2 mb-4">
              <FileText className="text-cyber-cyan" size={20} />
              <h2 className="cyber-font text-xl font-bold text-cyber-cyan">Scene Graph</h2>
            </div>
            <div className="bg-cyber-navy/50 rounded-lg p-4 max-h-64 overflow-auto">
              <pre className="text-cyber-light text-sm whitespace-pre-wrap">
                {JSON.stringify(latestResponse.scene_graph, null, 2)}
              </pre>
            </div>
          </div>

          {/* Video Response */}
          <div className="cyber-card p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Film className="text-cyber-cyan" size={20} />
              <h2 className="cyber-font text-xl font-bold text-cyber-cyan">Video Response</h2>
            </div>
            <div className="bg-cyber-navy/50 rounded-lg p-4">
              {latestResponse.video_url ? (
                <video
                  src={latestResponse.video_url}
                  controls
                  className="w-full rounded-lg"
                  poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='225'%3E%3Crect width='100%25' height='100%25' fill='%230f172a'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%2306b6d4' font-family='Orbitron' font-size='16'%3EVideo Preview%3C/text%3E%3C/svg%3E"
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="flex items-center justify-center h-48 bg-cyber-navy/30 rounded-lg">
                  <span className="text-cyber-gray">No video URL received</span>
                </div>
              )}
            </div>
            <div className="mt-2 text-sm text-cyber-gray">
              Status: <span className="text-cyber-cyan">{latestResponse.status}</span>
            </div>
          </div>
        </div>
      )}

      {/* Request Logs */}
      <div className="cyber-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="cyber-font text-xl font-bold text-cyber-cyan">Request Logs</h2>
          <div className="flex items-center space-x-2 text-sm text-cyber-gray">
            <span>Total: {logs.length}</span>
            <span className="text-green-400">✓ {logs.filter(l => l.status === 'success').length}</span>
            <span className="text-red-400">✗ {logs.filter(l => l.status === 'error').length}</span>
            <span className="text-yellow-400">⏳ {logs.filter(l => l.status === 'pending').length}</span>
          </div>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-center py-8 text-cyber-gray">
              <Clock size={32} className="mx-auto mb-2 opacity-50" />
              <p>No tests run yet. Click "Start Test" to begin.</p>
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className={`cyber-panel rounded-lg p-4 border-l-4 ${
                  log.status === 'success' ? 'border-green-500' :
                  log.status === 'error' ? 'border-red-500' :
                  'border-yellow-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="mt-1">
                      {log.status === 'success' ? (
                        <CheckCircle className="text-green-500" size={16} />
                      ) : log.status === 'error' ? (
                        <AlertCircle className="text-red-500" size={16} />
                      ) : (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="text-cyber-cyber font-mono">
                          {format(new Date(log.timestamp), 'HH:mm:ss')}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          log.status === 'success' ? 'bg-green-500/20 text-green-400' :
                          log.status === 'error' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {log.status.toUpperCase()}
                        </span>
                      </div>
                      {log.error && (
                        <p className="text-red-400 text-sm mt-1">{log.error}</p>
                      )}
                      {log.response && (
                        <details className="mt-2">
                          <summary className="text-cyber-cyan text-sm cursor-pointer hover:text-cyber-light">
                            View Response
                          </summary>
                          <pre className="text-xs text-cyber-light mt-2 bg-cyber-navy/30 rounded p-2 overflow-auto">
                            {JSON.stringify(log.response, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
