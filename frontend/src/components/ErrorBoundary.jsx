import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ maxWidth: 800, margin: '40px auto', padding: 24, background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
          <h2 style={{ marginBottom: 8 }}>Something went wrong.</h2>
          <p style={{ color: '#666', marginBottom: 16 }}>An unexpected error occurred in the UI. You can try reloading the page.</p>
          <button onClick={this.handleReload} style={{ background: '#1677ff', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 6, cursor: 'pointer' }}>Reload</button>
          {process.env.NODE_ENV !== 'production' && this.state.error && (
            <pre style={{ marginTop: 16, background: '#f7f7f7', padding: 12, borderRadius: 6, overflow: 'auto' }}>
              {String(this.state.error)}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
