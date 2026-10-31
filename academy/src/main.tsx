import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import {DifficultyProvider} from './challenge/DifficultyProvider';
import '@xyflow/react/dist/style.css';
import './styles.css';
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><DifficultyProvider><App /></DifficultyProvider></React.StrictMode>);
