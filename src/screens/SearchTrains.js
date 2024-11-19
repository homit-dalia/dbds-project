import React, { useState } from 'react';
import { TextField, Button, Container, Typography, Box, Select, MenuItem, IconButton, Collapse } from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { apiEndpoints } from '../constants';

const SearchTrains = () => {
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [dateOfTravel, setDateOfTravel] = useState('');
    const [sortCriteria, setSortCriteria] = useState('arrival');
    const [trainSchedules, setTrainSchedules] = useState([]);
    const [stops, setStops] = useState({});
    const [expandedSchedule, setExpandedSchedule] = useState(null);

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
            if (criteria === 'departure') return new Date(b.departure) - new Date(a.departure);
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
                                    <Button variant="contained" color="secondary">Buy</Button>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                ) : (
                    <Typography>No train schedules found.</Typography>
                )}
            </Box>
        </Container>
    );
};

export default SearchTrains;