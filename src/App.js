import React, { useState, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './screens/Login';
import Home from './screens/Home';
import Signup from './screens/Signup';
import Header from './components/Header';
import SearchTrains from './screens/SearchTrains';
import Reservations from './screens/Reservation';
import ManageRepresentatives from './screens/ManageRepresentatives';
import Statistics from './screens/Statistics';
import TrainSchedules from './screens/TrainSchedules';
import Queries from './screens/Queries';

const UserContext = createContext();

export const useUserContext = () => useContext(UserContext);

function App() {
  const [user, setUser] = useState({ loggedIn: false, info: {}, isEmployee: false });

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Router>
        {user.loggedIn ? (
          <>
            <Header />
            <Routes>
              {/* Employee Routes */}
              {user.isEmployee ? (
                user.info.type === 'admin' ? (
                  <>
                    <Route path="/profile" element={<Home />} />
                    <Route path="/admin/manage-representatives" element={<ManageRepresentatives />} />
                    <Route path="/admin/statistics" element={<Statistics />} />
                    <Route path="*" element={<Navigate to="/profile" />} />
                  </>
                ) : (
                  <>
                    <Route path="/profile" element={<Home />} />
                    <Route path="/customer-rep/train-schedules" element={<TrainSchedules />} />
                    <Route path="/customer-rep/queries" element={<Queries />} />
                    <Route path="*" element={<Navigate to="/profile" />} />
                  </>
                )
              ) : (
                // Regular User Routes
                <>
                  <Route path="/search-trains" element={<SearchTrains />} />
                  <Route path="/my-reservations" element={<Reservations />} />
                  <Route path="/profile" element={<Home />} />
                  <Route path="/support" element={<Queries />} />
                  <Route path="*" element={<Navigate to="/profile" />} />
                </>
              )}

              {/* Redirect to appropriate pages */}
              {user.isEmployee && user.info.type === 'admin' && (
                <>
                  <Route path="/admin/manage-representatives" element={<Navigate to="/admin/manage-representatives" />} />
                  <Route path="/admin/statistics" element={<Navigate to="/admin/statistics" />} />
                </>
              )}
              {user.isEmployee && user.info.type === 'customer_rep' && (
                <Route path="*" element={<Navigate to="/customer-rep" />} />
              )}
            </Routes>
          </>
        ) : (
          // Public Routes
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        )}
      </Router>
    </UserContext.Provider>
  );
}

export default App;
