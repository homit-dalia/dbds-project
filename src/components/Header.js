// src/components/Header.js

import React from 'react';
import { AppBar, Toolbar, Typography, Tabs, Tab, Box, IconButton } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SearchIcon from '@mui/icons-material/Search';
import TrainIcon from '@mui/icons-material/Train';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  const handleTabChange = (event, newValue) => {
    if (newValue === 0) {
      navigate('/search-trains');
    } else if (newValue === 1) {
      navigate('/my-reservations');
    }
  };

  return (
    <AppBar position="sticky">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Reservation System
        </Typography>
        <Tabs value={false} onChange={handleTabChange} textColor="inherit">
          <Tab 
            label="Search Trains"
            icon={<SearchIcon />}
            sx={{ '&:hover': { color: '#FFA500', transform: 'scale(1.05)' } }}
          />
          <Tab 
            label="My Reservations"
            icon={<TrainIcon />}
            sx={{ '&:hover': { color: '#FFA500', transform: 'scale(1.05)' } }}
          />
        </Tabs>
        <Box sx={{ flexGrow: 0 }}>
          <IconButton color="inherit" sx={{ '&:hover': { color: '#FFA500', transform: 'scale(1.1)' } }}>
            <AccountCircleIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;