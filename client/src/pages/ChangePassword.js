import React,{useState, useEffect} from 'react';
import { Link } from 'react-router-dom';
import { getCSRFToken } from '../utlis';

import Header from "../components/Header";

function ChangePassword() {

    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [reEnteredNewPassword, setReEnteredNewPassword] = useState('');
    const [csrfToken, setCsrfToken] = useState('');
    // const navigate = useNavigate();

    useEffect(() => {
        // fetch csrf token on initial render and mount of components and store in state to be used for form submission
        const fetchData = async () => {

            const csrf_token = await getCSRFToken();
            setCsrfToken(csrf_token);
            console.log(csrf_token);
        }
        fetchData();

        }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();


        if (newPassword === reEnteredNewPassword) {

            const token =  localStorage.getItem('token');
            
            const body = {
                password,
                newPassword,
                reEnteredNewPassword,
                csrfToken
            }
            
            
            try {
                
                
                const response = await fetch("/change-password", {
                    method: "PUT",
                    headers: { 
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(body)
                });
                
                if (response.status === 200) {
                    console.log("Account password change successfully");
                    window.location = "/dashboard";
                }
            else if (response.status === 401) {
                alert("incorrect password");
                console.log("incorrect password");
            }
            else {
                console.log("server error");
            }
            
            
            } 
            catch (error) {
                console.log(error);
            }
        }
        else {
            console.log("passwords don't match");
            alert("passwords don't match");
        }
    }
    return (
        <div className={'home_container'}>

        <Header />

        <h1>Change your account</h1>

        <p>Enter your existing password and then you new desired password </p>

        <div className="login_container" onSubmit={handleSubmit}>
            <form id="postForm" >
                <label htmlFor="password" className="postLabels">Password</label>
                <input className="form_input" type="password"
                    placeholder={"password"}
                    onChange={e => setPassword(e.target.value)}
                    required />
                <br></br>
                <label htmlFor="newPassword" className="postLabels">New Password -
                        1 Uppercase,1 Lowercase,1 Number,1 Symbol(!@#$%^&*_=+-), Min 8,Max 25
                    </label>
                <input className="form_input" type="password"
                    placeholder={"enter new password"}
                    pattern={'^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-]).{8,25}$'}
                    onChange={e => setNewPassword(e.target.value)}
                    required />
                <br></br>
                <label htmlFor="newPassword" className="postLabels">Re-enter new Password</label>
                <input className="form_input" type="password"
                    placeholder={"enter new password"}
                    pattern={'^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-]).{8,25}$'}
                    onChange={e => setReEnteredNewPassword(e.target.value)}
                    required />
                <br></br>
                <input type="submit" value="Update Password" />
            </form>
        </div>
        </div>
    );
}

export default ChangePassword;