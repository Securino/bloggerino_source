import React,{useState} from 'react'
import { Link } from 'react-router-dom';
import InitialHeader from "../components/InitialHeader";
import {useNavigate} from "react-router-dom";
import Cookies from 'js-cookie'; // import the js-cookie library
// import QRCode from 'qrcode.react';
import '../styles/login.css'

const Login = ({onLogin}) =>{


    const [email,setEmail] = useState('')
    const [password,setPassword] = useState('')
    const [totp ,setTotp] = useState('')
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password, totp })
        });

        if (response.ok) {
            const data = await response.json();
            onLogin();
            navigate('/dashboard')


        } else {
            const data = await response.json();
            alert(data.message);
        }
    }

    return(
        <div className={'home_container'}>

            <InitialHeader />
             {/*<QRCodeGenerator text={"some text"} /> */}

                <form id="loginForm"  onSubmit={handleSubmit} className={'login_container'}>
                    <h2>Sign in</h2>
                    <input className="form_input" type="email"
                           placeholder={"Email..."}
                           onChange={(e) => setEmail(e.target.value)}
                           id="email" required />

                    <input className="form_input"
                           type="password"
                           onChange={(e) => setPassword(e.target.value)}
                           placeholder={"Password..."}
                           id="password" required
                    />
                    <input className="form_input"
                           type="text"
                           onChange={(e) => setTotp(e.target.value)}
                           placeholder={"Authenticator code..."}
                           id="totp" required
                    />

                    <input type="submit" id="login" value="Log In" />
                    <p className='notice'><strong>Important Notice</strong><br></br> 
                    Protect yourself from social engineering attacks. Do not share your password with anyone, and do not leave your password in an easily accessible location.
                    Be cautious of unsolicited phone calls or emails requesting personal information, and do not click on links from unknown sources. 
                    Remember to always log out of your account when you're finished, and report any suspicious activity to our support team immediately.
                    Thank you for your cooperation in keeping your account secure.</p>
                </form>
                
            <div className="custom-shape-divider-bottom-1683128286">
                <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120"
                     preserveAspectRatio="none">
                    <path
                        d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
                        className="shape-fill"></path>
                </svg>
            </div>
        </div>
    )
}

export default Login