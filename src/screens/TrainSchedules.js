import React, { useState, useEffect } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Button,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { apiEndpoints } from '../constants';

const TrainSchedules = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [trainSchedules, setTrainSchedules] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  // User inputs
  const [stationName, setStationName] = useState('');
  const [transitLine, setTransitLine] = useState('');
  const [travelDate, setTravelDate] = useState('');

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const fetchTrainSchedules = async () => {
    setLoading(true);
    try {
      const response = await fetch(apiEndpoints.getTrainsForStation, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ station_name: stationName }),
      });
      const data = await response.json();
      if (data.success) {
        setTrainSchedules(data.trains);
      } else {
        alert(data.message || 'Failed to fetch train schedules.');
      }
    } catch (error) {
      console.error('Error fetching train schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const response = await fetch(apiEndpoints.getCustomersForTransit, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transit_line: transitLine, travel_date: travelDate }),
      });
      const data = await response.json();
      if (data.success) {
        setReservations(data.customers);
      } else {
        setReservations([]);
        alert(data.message || 'Failed to fetch reservations.');
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSchedule = (schedule) => {
    setSelectedSchedule(schedule);
    setEditDialogOpen(true);
  };

  const handleDeleteSchedule = async (schedule) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the schedule for train ${schedule.train_name}?`
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch(apiEndpoints.deleteTrainSchedule, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transit_line: schedule.transit_line }),
      });
      const data = await response.json();
      if (data.success) {
        alert('Schedule deleted successfully.');
        fetchTrainSchedules();
      } else {
        alert(data.message || 'Failed to delete schedule.');
      }
    } catch (error) {
      console.error('Error deleting train schedule:', error);
    }
  };

  const handleSaveEdit = async () => {
    try {
      const response = await fetch(apiEndpoints.updateTrainSchedule, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedSchedule),
      });
      const data = await response.json();
      if (data.success) {
        alert('Schedule updated successfully.');
        setEditDialogOpen(false);
        fetchTrainSchedules();
      } else {
        alert(data.message || 'Failed to update schedule.');
      }
    } catch (error) {
      console.error('Error updating train schedule:', error);
    }
  };

  return (
    <Box>
      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 4 }}>
        <Tab label="Train Schedules" />
        <Tab label="Reservations" />
      </Tabs>

      {/* Train Schedules Tab */}
      {activeTab === 0 && (
        <Box>
          <Typography variant="h4" gutterBottom>
            Train Schedules
          </Typography>
          <Box display="flex" alignItems="center" gap={2} mb={4}>
            <TextField
              label="Station Name"
              value={stationName}
              onChange={(e) => setStationName(e.target.value)}
              fullWidth
            />
            <Button
              variant="contained"
              color="primary"
              onClick={fetchTrainSchedules}
              disabled={!stationName}
            >
              Search
            </Button>
          </Box>
          {loading && <CircularProgress />}
          {!loading && trainSchedules.length > 0 && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Transit Line</TableCell>
                    <TableCell>Train Name</TableCell>
                    <TableCell>Train Type</TableCell>
                    <TableCell>Origin</TableCell>
                    <TableCell>Destination</TableCell>
                    <TableCell>Departure</TableCell>
                    <TableCell>Arrival</TableCell>
                    <TableCell>Fare</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {trainSchedules.map((schedule) => (
                    <TableRow key={schedule.transit_line}>
                      <TableCell>{schedule.transit_line}</TableCell>
                      <TableCell>{schedule.train_name}</TableCell>
                      <TableCell>{schedule.train_type}</TableCell>
                      <TableCell>{schedule.origin}</TableCell>
                      <TableCell>{schedule.destination}</TableCell>
                      <TableCell>{schedule.departure}</TableCell>
                      <TableCell>{schedule.arrival}</TableCell>
                      <TableCell>{schedule.fare}</TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          color="primary"
                          onClick={() => handleEditSchedule(schedule)}
                          sx={{ mr: 1 }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => handleDeleteSchedule(schedule)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {!loading && trainSchedules.length === 0 && (
            <Typography>No train schedules available.</Typography>
          )}
        </Box>
      )}

      {/* Reservations Tab */}
      {activeTab === 1 && (
        <Box>
          <Typography variant="h4" gutterBottom>
            Reservations
          </Typography>
          <Box display="flex" alignItems="center" gap={2} mb={4}>
            <TextField
              label="Transit Line"
              value={transitLine}
              onChange={(e) => setTransitLine(e.target.value)}
              fullWidth
            />
            <TextField
              type="date"
              label="Travel Date"
              value={travelDate}
              onChange={(e) => setTravelDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <Button
              variant="contained"
              color="primary"
              onClick={fetchReservations}
              disabled={!transitLine || !travelDate}
            >
              Search
            </Button>
          </Box>
          {loading && <CircularProgress />}
          {!loading && reservations.length > 0 && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Customer Email</TableCell>
                    <TableCell>Passenger Category</TableCell>
                    <TableCell>Seat Number</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Discounted Price</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reservations.map((reservation) => (
                    <TableRow key={reservation.customer_email}>
                      <TableCell>{reservation.customer_email}</TableCell>
                      <TableCell>{reservation.passenger_category}</TableCell>
                      <TableCell>{reservation.seat_number}</TableCell>
                      <TableCell>${reservation.price.toFixed(2)}</TableCell>
                      <TableCell>${reservation.discounted_price.toFixed(2)}</TableCell>
                      <TableCell>{reservation.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {!loading && reservations.length === 0 && (
            <Typography>No reservations available.</Typography>
          )}
        </Box>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Train Schedule</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Train Name"
            value={selectedSchedule?.train_name || ''}
            onChange={(e) =>
              setSelectedSchedule((prev) => ({ ...prev, train_name: e.target.value }))
            }
          />
          <TextField
            fullWidth
            margin="normal"
            label="Origin"
            value={selectedSchedule?.origin || ''}
            onChange={(e) =>
              setSelectedSchedule((prev) => ({ ...prev, origin: e.target.value }))
            }
          />
          <TextField
            fullWidth
            margin="normal"
            label="Destination"
            value={selectedSchedule?.destination || ''}
            onChange={(e) =>
              setSelectedSchedule((prev) => ({ ...prev, destination: e.target.value }))
            }
          />
          <TextField
            fullWidth
            margin="normal"
            label="Departure"
            value={selectedSchedule?.departure || ''}
            onChange={(e) =>
              setSelectedSchedule((prev) => ({ ...prev, departure: e.target.value }))
            }
          />
          <TextField
            fullWidth
            margin="normal"
            label="Arrival"
            value={selectedSchedule?.arrival || ''}
            onChange={(e) =>
              setSelectedSchedule((prev) => ({ ...prev, arrival: e.target.value }))
            }
          />
          <TextField
            fullWidth
            margin="normal"
            label="Fare"
            value={selectedSchedule?.fare || ''}
            onChange={(e) =>
              setSelectedSchedule((prev) => ({ ...prev, fare: e.target.value }))
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSaveEdit} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TrainSchedules;
