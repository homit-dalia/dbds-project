import React from 'react';
import { AppBar, Tabs, Tab, Toolbar, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../App';

const Header = () => {
  const { user } = useUserContext();
  const navigate = useNavigate();

  // Determine which tabs to show based on user type
  const getTabs = () => {
    if (user.isEmployee) {
      if (user.info.type === 'admin') {
        return [
          { label: 'Manage Representatives', path: '/admin/manage-representatives' },
          { label: 'Statistics', path: '/admin/statistics' },
          { label: 'Profile', path: '/profile' },
        ];
      } else if (user.info.type === 'customer_rep') {
        return [
          { label: 'Train Schedules', path: '/customer-rep/train-schedules' },
          { label: 'Queries', path: '/customer-rep/queries' },
          { label: 'Profile', path: '/profile' },
        ];
      }
    }
    // Default for regular users
    return [
      { label: 'Search Trains', path: '/search-trains' },
      { label: 'My Reservations', path: '/my-reservations' },
      { label: 'Profile', path: '/profile' },
    ];
  };

  const tabs = getTabs();

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Railway Reservation System
        </Typography>
        <Tabs
          value={false} // No controlled state for the active tab
          textColor="inherit"
          indicatorColor="secondary"
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              label={tab.label}
              onClick={() => navigate(tab.path)}
              sx={{ minWidth: 120 }}
            />
          ))}
        </Tabs>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
