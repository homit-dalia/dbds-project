// src/UserProfile.js

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Typography, Box, Button } from '@mui/material';
import { useUserContext } from '../App';

const UserProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const {user, setUser} = useUserContext();

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
    setUser({ loggedIn: false, info: {} });
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
          Welcome, {user.info.firstname}!
        </Typography>
        <Typography variant="h6">Email: {user.info.email}</Typography>
        <Typography variant="h6">First Name: {user.info.firstname}</Typography>
        <Typography variant="h6">Last Name: {user.info.lastname}</Typography>
        <Typography variant="h6">
          Username: {user.info.username ? user.info.username : 'N/A'}
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
