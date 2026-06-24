import React from 'react';
import { useProjectStore } from './stores/useProjectStore';
import { Dashboard } from './components/Dashboard';
import { Editor } from './components/Editor';
import './App.css';

const App: React.FC = () => {
  const { activeProject } = useProjectStore();

  return (
    <div className="app-root">
      {activeProject ? <Editor /> : <Dashboard />}
    </div>
  );
};

export default App;
