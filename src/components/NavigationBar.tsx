import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { useNavigate } from 'react-router-dom';

const NavigationBar = () => {
  const navigate = useNavigate();

  const handleHomeClick = () => {
    navigate('/monte-carlo-simulation');
  };

  const handleReferencesClick = () => {
    navigate('/references');
  };

  const handlePresentationClick = () => {
    navigate('/presentation');
  };

  const handleDemoClick = () => {
    navigate('/demo');
  };

  const handleWireframeClick = () => {
    navigate('/wireframe');
  };

  const handleLogoClick = () => {
    navigate('/');
  };    

  return (
    <AppBar position="static" sx={{ backgroundColor: '#E60000' }}>
      <Toolbar>
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography 
            variant="h6" 
            component="div" 
            onClick={handleLogoClick}
            sx={{ 
              cursor: 'pointer',
              '&:hover': {
                opacity: 0.8
              }
            }}
          >
            RedVenture
          </Typography>
          <Box>
            <Button color="inherit" onClick={handlePresentationClick}>Sunum</Button>
            <Button color="inherit" onClick={handleDemoClick}>Demo Video</Button>
            <Button color="inherit" onClick={handleWireframeClick}>Wireframe</Button>
            <Button color="inherit" onClick={handleHomeClick}>Simülasyon</Button>
            <Button color="inherit" onClick={handleReferencesClick}>Referanslar</Button>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavigationBar; 