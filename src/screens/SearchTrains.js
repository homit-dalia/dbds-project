import React, { useState } from 'react';
import {
    TextField,
    Button,
    Container,
    Typography,
    Box,
    Select,
    MenuItem,
    IconButton,
    Collapse,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
} from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { apiEndpoints } from '../constants';
import { useUserContext } from '../App';

const SearchTrains = () => {

    const { user } = useUserContext();

    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [dateOfTravel, setDateOfTravel] = useState('');
    const [sortCriteria, setSortCriteria] = useState('arrival');
    const [trainSchedules, setTrainSchedules] = useState([]);
    const [stops, setStops] = useState({});
    const [expandedSchedule, setExpandedSchedule] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [passengerCategory, setPassengerCategory] = useState('regular');

    const handleSearch = async () => {
        const requestBody = { source: origin, destination: destination, date: dateOfTravel };
        try {
            const response = await fetch(apiEndpoints.trainSchedule, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });
            const data = await response.json();
            setTrainSchedules(data.success ? data.schedules : []);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleSort = (criteria) => {
        setSortCriteria(criteria);
        const sortedSchedules = [...trainSchedules].sort((a, b) => {
            if (criteria === 'arrival') return new Date(a.arrival) - new Date(b.arrival);
            if (criteria === 'departure') return new Date(a.departure) - new Date(b.departure);
            if (criteria === 'fare') return a.fare - b.fare;
            return 0;
        });
        setTrainSchedules(sortedSchedules);
    };

    const handleSwapLocations = () => {
        setOrigin(destination);
        setDestination(origin);
    };

    const handleViewStops = async (transitLine) => {
        try {
            const requestBody = { transit_line: transitLine };
            const response = await fetch(apiEndpoints.trainStops, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });
            const data = await response.json();
            setStops((prevStops) => ({ ...prevStops, [transitLine]: data.success ? data.stops : [] }));
            setExpandedSchedule(transitLine);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleReserveTicket = async () => {
        if (!selectedSchedule) return;
        console.log("Inside handleReserveTicket");
        try {
            const requestBody = {
                transit_line: selectedSchedule.transit_line,
                customer_email: user.info.email,
                price: selectedSchedule.fare,
                passenger_category: passengerCategory,
            };
            const response = await fetch(apiEndpoints.reserveTicket, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });
            const data = await response.json();
            if (data.success) {
                alert('Ticket reserved successfully!');
                handleCloseModal();
            } else {
                alert('Failed to reserve ticket. Please try again later.');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };


    const handleOpenModal = (schedule) => {
        setSelectedSchedule(schedule);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedSchedule(null);
        setPassengerCategory('regular');
    };

    return (
        <Container>
            <Box display="flex" flexDirection="column" alignItems="center" mt={4}>
                <Typography variant="h4" gutterBottom>Search Trains</Typography>

                {/* Search Section */}
                <Box display="flex" alignItems="center" gap={2} mb={4} sx={{ flexWrap: 'wrap' }}>
                    <TextField
                        label="Origin"
                        value={origin}
                        onChange={(e) => setOrigin(e.target.value)}
                    />
                    <IconButton onClick={handleSwapLocations} aria-label="swap locations">
                        <SwapHorizIcon fontSize="large" />
                    </IconButton>
                    <TextField
                        label="Destination"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                    />
                    <TextField
                        label="Date of Travel"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        value={dateOfTravel}
                        onChange={(e) => setDateOfTravel(e.target.value)}
                    />
                    <Button variant="contained" color="primary" onClick={handleSearch}>
                        Search
                    </Button>
                </Box>

                {/* Sort Section */}
                <Box mb={4} display="flex" alignItems="center">
                    <Typography variant="h6" mr={2}>Sort by:</Typography>
                    <Select value={sortCriteria} onChange={(e) => handleSort(e.target.value)}>
                        <MenuItem value="arrival">Arrival Time</MenuItem>
                        <MenuItem value="departure">Departure Time</MenuItem>
                        <MenuItem value="fare">Fare</MenuItem>
                    </Select>
                </Box>

                {/* Train Schedules */}
                {trainSchedules.length > 0 ? (
                    <Box width="100%">
                        {trainSchedules.map((schedule) => (
                            <Box
                                key={schedule.transit_line}
                                p={3}
                                mb={4}
                                border={1}
                                borderRadius={4}
                                boxShadow={3}
                                bgcolor="background.paper"
                            >
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Typography variant="h6" color="primary">
                                        {schedule.origin_name} to {schedule.destination_name}
                                    </Typography>
                                    <Typography variant="h6" color="secondary">
                                        Fare: ${schedule.fare}
                                    </Typography>
                                </Box>
                                <Box display="flex" justifyContent="space-between" mt={2}>
                                    <Typography variant="body1">Departure: <strong>{new Date(schedule.departure).toLocaleString()}</strong></Typography>
                                    <Typography variant="body1">Arrival: <strong>{new Date(schedule.arrival).toLocaleString()}</strong></Typography>
                                </Box>
                                <Typography variant="body2" mt={2} color="textSecondary">
                                    Total Journey Duration: <strong>{`${Math.floor((new Date(schedule.arrival) - new Date(schedule.departure)) / 3600000)} hrs ${Math.ceil(((new Date(schedule.arrival) - new Date(schedule.departure)) % 3600000) / 60000)} mins`}</strong>
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => handleViewStops(schedule.transit_line)}
                                    sx={{ mt: 2 }}
                                >
                                    View Stops
                                </Button>
                                <Collapse in={expandedSchedule === schedule.transit_line} timeout="auto" unmountOnExit>
                                    <Box mt={4} display="flex" alignItems="center" width="100%" position="relative">
                                        <Box position="absolute" top="50%" left={0} right={0} height={2} bgcolor="grey.300" />
                                        <Box position="relative" zIndex={1} textAlign="center" flexShrink={0} display="flex" flexDirection="column" alignItems="center">
                                            <Box width={24} height={24} borderRadius="50%" bgcolor="success.main" display="flex" alignItems="center" justifyContent="center" position="relative" top="-12px">
                                                <Typography variant="caption" color="white">S</Typography>
                                            </Box>
                                            <Typography variant="caption" mt={1}>Source</Typography>
                                        </Box>
                                        {stops[schedule.transit_line]?.map((stop, index) => (
                                            <Box key={index} textAlign="center" flexGrow={1} position="relative" mx={2} display="flex" flexDirection="column" alignItems="center">
                                                <Box width={10} height={10} borderRadius="50%" bgcolor="primary.main" position="relative" zIndex={1} top="-12px" mb={1} />
                                                <Typography variant="caption">{stop.station_name}</Typography>
                                                <Typography variant="caption" color="textSecondary">Arrival: {new Date(stop.arrival).toLocaleTimeString()}</Typography>
                                                <Typography variant="caption" color="textSecondary">Duration: {Math.ceil((new Date(stop.departure) - new Date(stop.arrival)) / 60000)} min</Typography>
                                            </Box>
                                        ))}
                                        <Box position="relative" zIndex={1} textAlign="center" flexShrink={0} display="flex" flexDirection="column" alignItems="center">
                                            <Box width={24} height={24} borderRadius="50%" bgcolor="error.main" display="flex" alignItems="center" justifyContent="center" position="relative" top="-12px">
                                                <Typography variant="caption" color="white">D</Typography>
                                            </Box>
                                            <Typography variant="caption" mt={1}>Destination</Typography>
                                        </Box>
                                    </Box>
                                </Collapse>
                                <Box mt={2} display="flex" justifyContent="flex-end">
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        onClick={handleOpenModal.bind(null, schedule)}
                                    >
                                        Buy
                                    </Button>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                ) : (
                    <Typography>No train schedules found.</Typography>
                )}
            </Box>

            <Dialog
                open={modalOpen}
                onClose={handleCloseModal}
                maxWidth="sm"  // Change this value for wider modal ('xs', 'sm', 'md', 'lg', 'xl')
                fullWidth // Ensures the modal stretches to the specified maxWidth
            >
                <DialogTitle>Reserve Ticket</DialogTitle>
                <DialogContent>
                    <Typography>
                        Fare: $
                        {selectedSchedule?.fare &&
                            (() => {
                                const baseFare = selectedSchedule.fare;
                                const discountRates = {
                                    child: 0.25,    // 25% discount
                                    elderly: 0.35,  // 35% discount
                                    disabled: 0.50, // 50% discount
                                    regular: 0.0    // No discount
                                };

                                // Determine the discount rate for the selected passenger category
                                const discountRate = discountRates[passengerCategory] || 0.0;

                                // Calculate discounted fare
                                const discountedFare = baseFare * (1 - discountRate);

                                // Format the fare to 2 decimal places
                                return discountedFare.toFixed(2);
                            })()}
                    </Typography>

                    <FormControl fullWidth sx={{ mt: 3 }}>
                        <InputLabel>Passenger Category</InputLabel>
                        <Select
                            value={passengerCategory}
                            onChange={(e) => setPassengerCategory(e.target.value)}
                        >
                            <MenuItem value="regular">Regular</MenuItem>
                            <MenuItem value="child">Child - 25% discount</MenuItem>
                            <MenuItem value="elderly">Elderly - 35% discount</MenuItem>
                            <MenuItem value="disabled">Disabled - 50% discount</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal} color="secondary">Cancel</Button>
                    <Button onClick={handleReserveTicket} color="primary">Reserve</Button>
                </DialogActions>
            </Dialog>

        </Container>
    );
};

export default SearchTrains;
