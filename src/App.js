import React, { useState, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './screens/Login';
import Home from './screens/Home';
import Signup from './screens/Signup';
import Header from './components/Header';
import SearchTrains from './screens/SearchTrains';
import Reservations from './screens/Reservation';


const UserContext = createContext();

export const useUserContext = () => useContext(UserContext);

function App() {
  const [user, setUser] = useState({ loggedIn: false, info: {} });

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Router>
        {user.loggedIn ? (
          <>
            <Header />
            <Routes>
              <Route path="/search-trains" element={<SearchTrains />} />
              <Route path="/my-reservations" element={<Reservations />} />
              <Route path="/profile" element={<Home />} />
              <Route path="*" element={<Navigate to="/profile" />} />
            </Routes>
          </>
        ) : (
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
