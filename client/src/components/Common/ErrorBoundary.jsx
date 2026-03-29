import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🔴 Critical Runtime Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-screen">
          <div className="clay-card error-card">
            <div className="error-icon">⚠️</div>
            <h1 className="cartoon-title">Oops! Something Broke</h1>
            <p className="text-dim">The arena encountered a critical issue. Don't worry, your grind is safe!</p>
            <button 
              className="clay-btn clay-btn-primary mt-2" 
              onClick={() => window.location.reload()}
            >
              🔄 RELOAD ARENA
            </button>
            {process.env.NODE_ENV === 'development' && (
              <pre className="debug-log">{this.state.error?.toString()}</pre>
            )}
          </div>
          <style dangerouslySetInnerHTML={{ __html: `
            .error-boundary-screen { 
              height: 100vh; 
              width: 100vw; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              background: var(--clay-bg); 
              padding: 2rem;
            }
            .error-card { 
              max-width: 500px; 
              text-align: center; 
              padding: 3rem; 
            }
            .error-icon { font-size: 4rem; margin-bottom: 1.5rem; }
            .debug-log { 
              margin-top: 2rem; 
              padding: 1rem; 
              background: rgba(0,0,0,0.05); 
              border-radius: 0.8rem; 
              font-size: 0.8rem; 
              text-align: left; 
              white-space: pre-wrap;
              color: var(--accent);
            }
          `}} />
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
