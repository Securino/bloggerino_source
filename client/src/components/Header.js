import React,{useState} from 'react';
import '../styles/header.css'
import {Link} from "react-router-dom";
const Header = ({navigate}) =>{

    const [searchInput, setSearchInput] = useState('');

    return(
        <nav className={'main_header'}>
            <h2><Link to="/dashboard/">Bloggerino</Link></h2>
                <ul>
                    <Link to="/dashboard/my-posts">My Posts</Link>
                    <Link to="/dashboard/create-post">Create Post</Link>
                    <Link to="/dashboard/feed">Feed</Link>
                    <Link to="/dashboard/delete-account">Delete Account</Link>
                    <Link to="/dashboard/change-account">Change Password</Link>
                    <Link to="/dashboard/change-auth">Change Auth</Link>
                    <Link to="/">Sign out</Link>
                </ul>

        </nav>
    )
}

export default Header;