import React from 'react';
import TreeVisualization from './TreeVisualization';
import {AppBar, Toolbar, IconButton, Typography, Button } from '@mui/material';
import Grid from '@mui/material/Grid2';
import './App.css';
import GitHubIcon from '@mui/icons-material/GitHub';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';


function App() {
  return (
    <Grid container spacing={0}>
      <Grid size={12}>
        <AppBar position="static">
          <Toolbar>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
            >
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <RequestQuoteIcon fontSize="large" /><em>PRICE</em> --- Personalized Recursive Intelligent Cost Estimation for Rare Disease Diagnosis
            </Typography>
            <Button color="inherit" startIcon = {<GitHubIcon />} href="https://github.com/stormliucong/react-d3-ai-human-cost-effective-analysis">Tutorial</Button>

           
          </Toolbar>
        </AppBar>
    </Grid>
    
    <Grid size={12}>
      <TreeVisualization />
    </Grid>
  </Grid>
  );
}

export default App;
