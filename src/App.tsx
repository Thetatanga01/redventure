import React, { useState } from 'react';
import { TextField, Button, Container, Typography, Grid } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { runMonteCarloSimulation } from './utils/simulation';
import { SimulationInputs } from './types';
import './App.css';
import MonteCarloScenarioDetection from './components/MonteCarloScenarioDetection';
import NavigationBar from './components/NavigationBar';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import References from './components/References';
import VideoPlayer from './components/VideoPlayer';
import Presentation from './components/Presentation';
import Wireframe from './components/Wireframe';

const App = () => {
  const [inputs, setInputs] = useState<SimulationInputs>({
    initialMAU: 10,
    growthRate: 10,
    standardDeviation: 5,
    revenuePerUser: 1,
  });
  const [results, setResults] = useState<any>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputs({ ...inputs, [e.target.name]: parseFloat(e.target.value) });
  };

  const handleSimulate = () => {
    const simulationResults = runMonteCarloSimulation(inputs);
    setResults(simulationResults);
  };

  return (
    <Router>
      <NavigationBar />
      <Routes>
        <Route path="/" element={<Navigate to="/presentation" replace />} />
        <Route path="/monte-carlo-simulation" element={<MonteCarloScenarioDetection />} />
        <Route path="/about" element={<div>Hakkında Sayfası</div>} />
        <Route path="/references" element={<References />} />
        <Route path="/demo" element={<VideoPlayer />} />
        <Route path="/presentation" element={<Presentation />} />
        <Route path="/wireframe" element={<Wireframe />} />
      </Routes>
    </Router>
  );
};

export default App;
