import { useEffect, useState } from 'react';
import './styles.css';

declare global {
  interface Window {
    electronAPI: {
      ping: () => Promise<string>;
    };
  }
}

function App() {
  const [message, setMessage] = useState('Waiting for response...');

  useEffect(() => {
    let cancelled = false;

    window.electronAPI
      .ping()
      .then((result) => {
        if (!cancelled) {
          setMessage(result);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setMessage(`Ping failed: ${error instanceof Error ? error.message : String(error)}`);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="app">
      <img src="./heroic-template.svg" alt="Electron Template" width="96" height="96" />
      <h1>Electron Template</h1>
      <p>
        This project is preconfigured with Electron, React, TypeScript, and Vite to mirror the modern workflow used by
        Heroic Games Launcher.
      </p>
      <section className="status">
        <h2>IPC demo</h2>
        <p>{message}</p>
      </section>
      <section className="links">
        <a href="https://www.electronjs.org/docs/latest/" target="_blank" rel="noreferrer">
          Electron Documentation
        </a>
      </section>
    </main>
  );
}

export default App;
