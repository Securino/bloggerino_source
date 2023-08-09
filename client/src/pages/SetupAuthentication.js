import React, {useRef, useEffect, useState} from 'react'
import InitialHeader from "../components/InitialHeader";
// import {useNavigate} from "react-router-dom";
import SpeakeasyQRCode from '../components/GenerateQR';
import { getCSRFToken } from '../utlis';
import {useNavigate} from "react-router-dom";
import Header from "../components/Header";


const SetupAuth = () =>{
    
    const inputRef = useRef();
    const [csrfToken, setCsrfToken] = useState('');
    const [prompt, setPrompt] = useState('');
    const navigate = useNavigate();
    useEffect(() => {
        // fetch csrf token on initial render and mount of components and store in state to be used for form submission
        const getCSRF = async () => {

            const csrf_token = await getCSRFToken();
            setCsrfToken(csrf_token);
        }
        getCSRF();
    }, []);

    const checkCode = async (e) => {
        e.preventDefault();
        const secretElement = document.getElementById('auth-secret-field');
        const secret = secretElement.textContent;
        // console.log(secretElement);
        // console.log(secret);
        
        const code = inputRef.current.value;
        // console.log(JSON.stringify(code));
        const body = {
            code,
            secret,
            csrfToken
        }
        try {
            const response = await fetch("/save-auth-code", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            });
            
            if (response.status === 200) {
                // response.json().then(data=>{console.log(data);});
                // console.log("Auth code saved successfully");
                setPrompt("🤙 Success!")
                navigate('/dashboard');
            }
            else if (response.status === 401){
                setPrompt("👾 Failed! That code was incorrect, please try again")
            }

            // window.location = "/dashboard/my-posts";

        } catch (error) {
            console.log(error);
        }
    };
    
    return (
        <div className={'home_container'}>
            <Header />
        <SpeakeasyQRCode/>
        <form onSubmit={checkCode}>
          <label>
            The TOTP should be displayed within the app, <br/>enter the authentication code:<br/>
            <input ref={inputRef} type="text" />
          </label>
          <button type="submit">Verify</button>
        </form>
        <p>{prompt}</p>
        </div>
    );
};

export default SetupAuth