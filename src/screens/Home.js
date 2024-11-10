// src/UserProfile.js

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Typography, Box, Button } from '@mui/material';

const UserProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = location.state || {};

  if (!user) {
    return (
      <Container>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="100vh"
        >
          <Typography variant="h4" component="h1">
            No User Information Available
          </Typography>
        </Box>
      </Container>
    );
  }

  const handleLogout = () => {
    // Navigate back to the login screen
    navigate('/');
  };

  return (
    <Container>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome, {user.firstname}!
        </Typography>
        <Typography variant="h6">Email: {user.email}</Typography>
        <Typography variant="h6">First Name: {user.firstname}</Typography>
        <Typography variant="h6">Last Name: {user.lastname}</Typography>
        <Typography variant="h6">
          Username: {user.username ? user.username : 'N/A'}
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          sx={{ mt: 3 }}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Box>
    </Container>
  );
};

export default UserProfile;
