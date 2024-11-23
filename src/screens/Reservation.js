import React, { useState, useEffect } from 'react';
import {
    Typography,
    Container,
    Box,
    List,
    ListItem,
    ListItemText,
    Divider,
    CircularProgress,
    Button,
    Collapse,
    Tabs,
    Tab,
} from '@mui/material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useUserContext } from '../App';
import { apiEndpoints } from '../constants';

const Reservations = () => {
    const { user } = useUserContext();
    const [reservations, setReservations] = useState({ upcoming: {}, past: {} });
    const [loading, setLoading] = useState(true);
    const [expandedTransitLine, setExpandedTransitLine] = useState(null);
    const [currentTab, setCurrentTab] = useState(0);

    const fetchReservations = async () => {
        try {
            setLoading(true);
            const response = await fetch(apiEndpoints.fetchReservations, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: user.info.email }),
            });

            const data = await response.json();
            if (data.success) {
                const now = new Date();
                const upcoming = {};
                const past = {};

                // Group reservations by transit_line and classify into upcoming and past
                data.reservations.forEach((reservation) => {
                    const { transit_line, schedule } = reservation;
                    const travelDate = new Date(schedule.departure);

                    const targetGroup = travelDate >= now ? upcoming : past;
                    if (!targetGroup[transit_line]) {
                        targetGroup[transit_line] = [];
                    }
                    targetGroup[transit_line].push(reservation);
                });

                setReservations({ upcoming, past });
            } else {
                setReservations({ upcoming: {}, past: {} });
            }
        } catch (error) {
            console.error('Error fetching reservations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelReservation = async (reservationId) => {
        try {
            const response = await fetch(apiEndpoints.cancelReservation, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ reservation_id: reservationId }),
            });

            const data = await response.json();
            if (data.success) {
                alert('Reservation cancelled successfully!');
                fetchReservations(); // Refresh reservations after cancellation
            } else {
                alert('Failed to cancel reservation. Please try again.');
            }
        } catch (error) {
            console.error('Error cancelling reservation:', error);
        }
    };

    const toggleTransitLine = (transitLine) => {
        setExpandedTransitLine((prev) => (prev === transitLine ? null : transitLine));
    };

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };

    useEffect(() => {
        fetchReservations();
    }, []);

    const renderReservations = (reservationsGroup) => (
        <Box mt={2}>
            {Object.keys(reservationsGroup).length === 0 ? (
                <Typography>No reservations found.</Typography>
            ) : (
                <List>
                    {Object.entries(reservationsGroup).map(([transitLine, reservationsList]) => {
                        const travelDate = new Date(reservationsList[0].schedule.departure).toLocaleDateString();
                        return (
                            <Box key={transitLine} mb={4}>
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Typography variant="h6" color="primary">
                                        Transit Line: {transitLine} | Date of Travel: {travelDate}
                                    </Typography>
                                    <Button
                                        onClick={() => toggleTransitLine(transitLine)}
                                        startIcon={expandedTransitLine === transitLine ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                    >
                                        {expandedTransitLine === transitLine ? 'Collapse' : 'Expand'}
                                    </Button>
                                </Box>
                                <Divider sx={{ mb: 2 }} />
                                <Collapse in={expandedTransitLine === transitLine} timeout="auto" unmountOnExit>
                                    {reservationsList.map((reservation) => (
                                        <ListItem key={reservation.reservation_id} sx={{ mb: 2 }}>
                                            <ListItemText
                                                primary={`Seat: ${reservation.seat_number || 'Unassigned'}, Passenger Category: ${reservation.passenger_category}`}
                                                secondary={
                                                    <Box display="flex" alignItems="center" gap={2}>
                                                        <Typography variant="body2" sx={{ color: reservation.status === 'active' ? 'green' : 'red' }}>
                                                            {reservation.status === 'active' ? 'Confirmed' : 'Cancelled'}
                                                        </Typography>
                                                        <Typography variant="body2">Fare: ${reservation.discounted_price}</Typography>
                                                    </Box>
                                                }
                                            />
                                            {currentTab == 0 && reservation.status === 'active' && (
                                                <Button
                                                    variant="outlined"
                                                    color="error"
                                                    onClick={() => handleCancelReservation(reservation.reservation_id)}
                                                >
                                                    Cancel
                                                </Button>
                                            )}
                                        </ListItem>
                                    ))}
                                </Collapse>
                            </Box>
                        );
                    })}
                </List>
            )}
        </Box>
    );

    return (
        <Container>
            <Box display="flex" flexDirection="column" alignItems="center" mt={4}>
                <Typography variant="h4" gutterBottom>My Reservations</Typography>
                {loading ? (
                    <CircularProgress />
                ) : (
                    <Box width="100%">
                        <Tabs value={currentTab} onChange={handleTabChange} centered>
                            <Tab label="Upcoming Reservations" />
                            <Tab label="Past Reservations" />
                        </Tabs>
                        {currentTab === 0 && renderReservations(reservations.upcoming)}
                        {currentTab === 1 && renderReservations(reservations.past)}
                    </Box>
                )}
            </Box>
        </Container>
    );
};

export default Reservations;
