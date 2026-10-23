import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './editor/App';
import './styles.css';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { error: string }> {
  state = { error: '' };
  static getDerivedStateFromError(error: Error) { return { error: error.message }; }
  render() {
    if (this.state.error) return <div className="fatal-error"><h1>Forma could not render this workspace.</h1><p>{this.state.error}</p><p>Your saved .forma files and recovery snapshot have not been removed. Reload to try recovery.</p><button onClick={() => location.reload()}>Reload Forma</button></div>;
    return this.props.children;
  }
}
createRoot(document.getElementById('root')!).render(<ErrorBoundary><App /></ErrorBoundary>);
