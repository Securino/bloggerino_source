import React from 'react'
import {Link} from "react-router-dom";
import '../styles/header.css'
const InitialHeader = () =>{

    return(
        <nav>
            <h2><Link to="/">Bloggerino</Link></h2>
            <ul className={'nav_container'}>
                <Link to="/sign-in" className={'signin_button'}>Sign in</Link>
                <Link to="/sign-up" className={'signup_button'}>Sign up</Link>
            </ul>
        </nav>
    )
}

export default InitialHeader