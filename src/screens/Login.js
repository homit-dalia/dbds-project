import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Container, FormControlLabel, Switch } from '@mui/material';
import { apiEndpoints } from '../constants';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../App';

const Login = () => {
    const navigate = useNavigate();
    const { user, setUser } = useUserContext();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isEmployee, setIsEmployee] = useState(false); // Toggle switch state
    const [showInvalidCredentials, setShowInvalidCredentials] = useState(false);

    const handleLogin = async () => {
        console.log('Username:', username);
        console.log('Password:', password);
        console.log('Login Type:', isEmployee ? 'Employee' : 'Customer');

        if (isEmployee) {
            // Employee login
            const requestBody = {
                email: username,
                password: password,
            };

            try {
                const response = await fetch(apiEndpoints.employeeLogin, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody),
                });

                const data = await response.json();

                if (data.success) {
                    setShowInvalidCredentials(false);
                    setUser({ loggedIn: true, info: data.user, isEmployee: true });
                } else {
                    setShowInvalidCredentials(true);
                }
                console.log('Data:', data);
            } catch (error) {
                console.error('Error:', error);
                setShowInvalidCredentials(true);
            }
            return;
        }

        const requestBody = {
            email: username,
            password: password,
        };

        try {
            const response = await fetch(apiEndpoints.login, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            const data = await response.json();

            if (data.success) {
                setShowInvalidCredentials(false);
                setUser({ loggedIn: true, info: data.user, isEmployee: false });
            } else {
                setShowInvalidCredentials(true);
            }
            console.log('Data:', data);
        } catch (error) {
            console.error('Error:', error);
            setShowInvalidCredentials(true);
        }
    };

    // Wrapper functions
    const handleOnChangeUsername = (e) => setUsername(e.target.value);
    const handleOnChangePassword = (e) => setPassword(e.target.value);
    const handleOnPressSignup = () => navigate('/signup');
    const handleToggleEmployee = () => setIsEmployee((prev) => !prev); // Toggle switch handler

    return (
        <Container maxWidth="md">
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                minHeight="100vh"
            >
                <Typography variant="h4" component="h1" gutterBottom>
                    Railway Reservation System
                </Typography>
                <Box
                    component="form"
                    sx={{ mt: 1 }}
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleLogin();
                    }}
                >
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Email"
                        name="username"
                        autoComplete="username"
                        autoFocus
                        value={username}
                        onChange={handleOnChangeUsername}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={handleOnChangePassword}
                    />

                    {showInvalidCredentials && (
                        <Typography color="error" maxWidth="md">
                            Invalid username or password
                        </Typography>
                    )}

                    <FormControlLabel
                        control={
                            <Switch
                                checked={isEmployee}
                                onChange={handleToggleEmployee}
                                color="primary"
                            />
                        }
                        label="Employee Login"
                    />

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Login
                    </Button>

                    <Button
                        fullWidth
                        variant="contained"
                        color="secondary"
                        onClick={handleOnPressSignup}
                    >
                        Signup
                    </Button>
                </Box>
            </Box>
        </Container>
    );
};

export default Login;
