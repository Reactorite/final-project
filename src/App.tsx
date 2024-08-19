import React from 'react';
import Header from './components/common/Header';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import Home from './pages/home/Home';


function App() {
  
  return (
    <BrowserRouter>
    <Header />
    <Routes>
     <Route path='/login' element={<Login />} />
     <Route path='/register' element={<Register />} />
     <Route path='/' element={<Home />} />
    </Routes>
    </BrowserRouter>
  );
}

export default App;
