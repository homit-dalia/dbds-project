import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Table,
    TableContainer,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Paper,
    CircularProgress,
    Tabs,
    Tab,
} from '@mui/material';
import { apiEndpoints } from '../constants';

const SearchReservations = () => {

    const [activeTab, setActiveTab] = useState(0); // Main tab index
    const [subTab, setSubTab] = useState(0); // Sub-tab index for List Revenue
    const [revenueData, setRevenueData] = useState([]);

    const [searchType, setSearchType] = useState('transit_line'); // Default search type
    const [searchValue, setSearchValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [reservations, setReservations] = useState([]);
    const [isSearchPressed, setIsSearchPressed] = useState(false);

    const [metadata, setMetadata] = useState(null); // Metadata state
    const [loadingMetadata, setLoadingMetadata] = useState(false); // Loading state for Metadata tab

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
        if (newValue === 2 && !metadata) {
            fetchMetadata(); // Fetch metadata only when the Metadata tab is opened
        }
    };

    const handleSubTabChange = async (event, newValue) => {
        setSubTab(newValue);
        fetchRevenue(newValue === 0 ? "transit_line" : newValue === 1 ? "customer_email" : "month");
    };

    useEffect(() => {
        fetchRevenue('transit_line');
    }, []);

    const fetchRevenue = async (type) => {
        setLoading(true);
        setRevenueData([]);
        try {
            const response = await fetch(apiEndpoints.calculateRevenue, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: type }),
            });
            const data = await response.json();
            if (data.success) {
                setRevenueData(data.data);
            } else {
                fetchRevenue(type);
                // alert(data.message || 'No revenue data found.');
            }
        } catch (error) {
            console.error('Error fetching revenue data:', error);
            // alert('Failed to fetch revenue data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {

        if (!isSearchPressed) {
            setIsSearchPressed(true);
        }

        setLoading(true);
        setReservations([]);

        try {

            const response = await fetch(apiEndpoints.searchReservations, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    search_type: searchType,
                    value: searchValue
                }),
            });

            const data = await response.json();
            if (data.success) {
                setReservations(data.reservations);
            } else {
                // alert(data.message || 'No reservations found.');
                handleSearch();
            }
        } catch (error) {
            console.error('Error fetching reservations:', error);
            // alert('Failed to fetch reservations. Please try again.');
        } finally {
            setIsSearchPressed(false);
            setLoading(false);
        }
    };

    const fetchMetadata = async () => {
        setLoadingMetadata(true);
        try {
            const response = await fetch(apiEndpoints.getMetadata, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    temp: "",
                }),
            });
            const data = await response.json();
            if (data.success) {
                setMetadata(data);
            } else {
                fetchMetadata();
                // alert(data.message || 'Failed to fetch metadata.');
            }
        } catch (error) {
            fetchMetadata();
            console.error('Error fetching metadata:', error);
            // alert('Failed to fetch metadata. Please try again.');
        } finally {
            setLoadingMetadata(false);
        }
    };

    return (
        <Box>
            <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 4 }}>
                <Tab label="Search" />
                <Tab label="List Revenue" />
                <Tab label="Metadata" />
            </Tabs>

            {activeTab === 0 && (
                <Box>
                    <Box>
                        <Typography variant="h4" gutterBottom>
                            Search Reservations
                        </Typography>

                        <Box display="flex" alignItems="center" gap={2} mb={4}>
                            <TextField
                                select
                                SelectProps={{ native: true }}
                                label="Search By"
                                value={searchType}
                                onChange={(e) => setSearchType(e.target.value)}
                                sx={{ ml: 2 }}
                            >
                                <option value="transit_line">Transit Line</option>
                                <option value="customer_email">Customer Email</option>
                            </TextField>
                            <TextField
                                label={searchType === 'transit_line' ? 'Transit Line' : 'Customer Email'}
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                fullWidth
                            />
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleSearch}
                                disabled={!searchValue}
                                sx={{ mr: 2 }}
                            >
                                Search
                            </Button>
                        </Box>

                        {/* Loading Indicator */}
                        {loading && <CircularProgress />}

                        {/* Results Table */}
                        {!loading && reservations.length > 0 && (
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Reservation ID</TableCell>
                                            <TableCell>Transit Line</TableCell>
                                            <TableCell>Customer Email</TableCell>
                                            <TableCell>Seat Number</TableCell>
                                            <TableCell>Passenger Category</TableCell>
                                            <TableCell>Price</TableCell>
                                            <TableCell>Discounted Price</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell>Created At</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {reservations.map((reservation) => (
                                            <TableRow key={reservation.reservation_id}>
                                                <TableCell>{reservation.reservation_id}</TableCell>
                                                <TableCell>{reservation.transit_line}</TableCell>
                                                <TableCell>{reservation.customer_email}</TableCell>
                                                <TableCell>{reservation.seat_number || 'N/A'}</TableCell>
                                                <TableCell>{reservation.passenger_category}</TableCell>
                                                <TableCell>${reservation.price}</TableCell>
                                                <TableCell>${reservation.discounted_price}</TableCell>
                                                <TableCell>{reservation.status}</TableCell>
                                                <TableCell>
                                                    {new Date(reservation.created_at).toLocaleString()}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}

                        {/* No Results */}
                        {!loading && reservations.length === 0 && searchValue && isSearchPressed && (
                            <Typography>No reservations found for the given {searchType === 'transit_line' ? 'transit line' : 'customer email'}.</Typography>
                        )}
                    </Box>
                </Box>
            )}

            {activeTab === 1 && (
                <Box>
                    <Typography variant="h4" gutterBottom>
                        List Revenue
                    </Typography>

                    {/* Sub-tabs for List Revenue */}
                    <Tabs value={subTab} onChange={handleSubTabChange} sx={{ mb: 4 }}>
                        <Tab label="By Transit Line" />
                        <Tab label="By Customer" />
                        <Tab label="By Month" />
                    </Tabs>

                    {/* Loading Indicator */}
                    {loading && <CircularProgress />}

                    {/* Revenue Table */}
                    {!loading && revenueData.length > 0 && (
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>{subTab === 0 ? 'Transit Line' : subTab == 1 ? 'Customer Email' : "Month"}</TableCell>
                                        <TableCell>Total Revenue</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {revenueData.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{item.group_by_field}</TableCell>
                                            <TableCell>${item.total_revenue.toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    {/* No Revenue Data */}
                    {!loading && revenueData.length === 0 && (
                        <Typography>No revenue data available for the selected type.</Typography>
                    )}
                </Box>
            )}

            {activeTab === 2 && (
                <Box>
                    <Typography variant="h4" gutterBottom>
                        Metadata
                    </Typography>

                    {loadingMetadata && <CircularProgress />}

                    {!loadingMetadata && metadata && (
                        <Box>
                            {/* Best Customer */}
                            <Typography variant="h6" sx={{ mt: 2 }}>
                                Best Customer
                            </Typography>
                            {metadata.best_customer ? (
                                <Typography>
                                    <strong>Email:</strong> {metadata.best_customer.email} <br />
                                    <strong>Total Revenue:</strong> ${metadata.best_customer.total_revenue.toFixed(2)}
                                </Typography>
                            ) : (
                                <Typography>No data available for the best customer.</Typography>
                            )}

                            {/* Top 5 Most Active Transit Lines */}
                            <Typography variant="h6" sx={{ mt: 4 }}>
                                Top 5 Most Active Transit Lines
                            </Typography>
                            {metadata.top_transit_lines.length > 0 ? (
                                <TableContainer component={Paper} sx={{ mt: 2 }}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Transit Line</TableCell>
                                                <TableCell>Reservation Count</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {metadata.top_transit_lines.map((line, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{line.transit_line}</TableCell>
                                                    <TableCell>{line.reservation_count}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                <Typography>No data available for active transit lines.</Typography>
                            )}
                        </Box>
                    )}

                    {!loadingMetadata && !metadata && (
                        <Typography>Failed to load metadata. Please try again.</Typography>
                    )}
                </Box>
            )}
        </Box>
    );
};

export default SearchReservations;
