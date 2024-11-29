import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Card,
  CardContent,
} from '@mui/material';
import { apiEndpoints } from '../constants';

const ManageRepresentatives = () => {
  const [representatives, setRepresentatives] = useState([]);
  const [selectedRep, setSelectedRep] = useState(null); // Selected representative for editing
  const [modalOpen, setModalOpen] = useState(false); // Controls modal visibility
  const [isCreating, setIsCreating] = useState(false); // Determines if creating or editing
  const [isError, setIsError] = useState(false);

  // Fetch all representatives
  const fetchRepresentatives = async () => {
    try {
      const response = await fetch(apiEndpoints.fetchReps, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await response.json();
      if (data.success) {
        setRepresentatives(data.reps);
      }
    } catch (error) {
      console.error('Error fetching representatives:', error);
    }
  };

  useEffect(() => {
    fetchRepresentatives();
  }, []);

  useEffect(() => {
    setIsError(false);
  }, [selectedRep]);

  // Open modal for editing a representative
  const handleEdit = (rep) => {
    setSelectedRep(rep);
    setIsCreating(false);
    setModalOpen(true);
  };

  // Open modal for creating a new representative
  const handleCreate = () => {
    setSelectedRep({
      firstname: '',
      lastname: '',
      ssn: '',
      username: '',
      email: '',
      password: '',
    });
    setIsCreating(true);
    setModalOpen(true);
  };

  // Handle form changes
  const handleChange = (field, value) => {
    setSelectedRep((prev) => ({ ...prev, [field]: value }));
  };

  // Save changes (edit or create)
  const handleSave = async () => {
    const endpoint = isCreating
      ? apiEndpoints.createRepresentative
      : apiEndpoints.updateRepresentative;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedRep),
      });
      const data = await response.json();
      if (data.success) {
        fetchRepresentatives(); // Refresh the list
        setModalOpen(false);
      } else {
        setIsError(true);
      }
    } catch (error) {
      console.error('Error saving representative:', error);
      setIsError(true);
    }
  };

  const handleDelete = async (rep) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this representative?');
    if (!confirmDelete) {
      return;
    }
    try {
      const response = await fetch(apiEndpoints.deleteRepresentative, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rep),
      });
      const data = await response.json();
      if (data.success) {
        fetchRepresentatives();
        setRepresentatives((prev) => prev.filter((r) => r.ssn !== rep.ssn));
      }
    } catch (error) {
      console.error('Error deleting representative:', error);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Manage Representatives
      </Typography>

      {/* Display Total Representatives */}
      <Card sx={{ marginBottom: 2 }}>
        <CardContent>
          <Typography variant="h6">
            Total Representatives: {representatives.length}
          </Typography>
        </CardContent>
      </Card>

      {/* Create Representative Button */}
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button variant="contained" color="primary" onClick={handleCreate}>
          + Create
        </Button>
      </Box>

      {/* Representatives Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>SSN</TableCell>
              <TableCell>First Name</TableCell>
              <TableCell>Last Name</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {representatives.length > 0 ? (
              representatives.map((rep) => (
                <TableRow key={rep.ssn}>
                  <TableCell>{rep.ssn}</TableCell>
                  <TableCell>{rep.firstname}</TableCell>
                  <TableCell>{rep.lastname}</TableCell>
                  <TableCell>{rep.username}</TableCell>
                  <TableCell>{rep.email}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleEdit(rep)}
                      sx={{ marginRight: 1 }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleDelete(rep)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography align="center">No representatives available.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal for Editing/Creating Representatives */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{isCreating ? 'Create Representative' : 'Edit Representative'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="First Name"
            value={selectedRep?.firstname || ''}
            onChange={(e) => handleChange('firstname', e.target.value)}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Last Name"
            value={selectedRep?.lastname || ''}
            onChange={(e) => handleChange('lastname', e.target.value)}
          />
          <TextField
            fullWidth
            margin="normal"
            label="SSN"
            value={selectedRep?.ssn || ''}
            onChange={(e) => handleChange('ssn', e.target.value)}
            disabled={!isCreating} // Disable SSN field during edit
          />
          <Typography variant="body2" color="textSecondary">
            SSN cannot be changed once created. Enter in the format XXX-XX-XXXX.
          </Typography>
          <TextField
            fullWidth
            margin="normal"
            label="Username"
            value={selectedRep?.username || ''}
            onChange={(e) => handleChange('username', e.target.value)}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Email"
            value={selectedRep?.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Password"
            type="password"
            value={selectedRep?.password || ''}
            onChange={(e) => handleChange('password', e.target.value)}
          />
          {isError && (
            <Typography color="error" variant="body2">
              Error saving representative. Please check the details and try again.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageRepresentatives;
