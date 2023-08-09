import './App.css';
import React,{useState} from 'react'
import {
    BrowserRouter,
    Routes,
    Route,
    Link, useNavigate,Navigate

} from "react-router-dom";

import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import CreatePost from './pages/CreatePost'
import MyPosts from './pages/MyPosts'
import MainFeed from './pages/MainFeed'
import DeleteAccount from './pages/DeleteAccount'
import ChangePassword from './pages/ChangePassword'
import ChangeAuthentication from './pages/SetupAuthentication'

import Main from './pages/Main'
import Protection from "./hooks/Protection";
import ResetProtection from "./hooks/ResetProtection";
function App() {

    const handleToken = (data) => {
        // console.log(data)
    };

    const handleLogout = async() => {
        console.log('logged out')
    };

    return (
        <BrowserRouter>
            <Routes>
                <Route path={"/"} element={<ResetProtection handleProtection={handleLogout} />}>
                    <Route path="/" element={<Home onLogout={handleLogout} />} />
                    <Route path="/sign-in" element={<Login onLogin={handleToken} />} />
                    <Route path="/sign-up" element={<Register onRegister={handleToken} />} />
                </Route>
                <Route path="/dashboard" element={<Protection />}>
                    <Route path="/dashboard" element ={<Main onLogout={handleLogout} />} />
                    <Route path="/dashboard/feed" element ={<MainFeed />} />
                    <Route path="/dashboard/create-post" element ={<CreatePost />} />
                    <Route path="/dashboard/my-posts" element ={<MyPosts />} />
                    <Route path="/dashboard/delete-account" element ={<DeleteAccount />} />
                    <Route path="/dashboard/change-account" element ={<ChangePassword />} />
                    <Route path="/dashboard/change-auth" element ={<ChangeAuthentication />} />
                </Route>

            </Routes>
        </BrowserRouter>
    );
}

export default App;
