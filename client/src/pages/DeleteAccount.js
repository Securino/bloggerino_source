import React,{useState, useEffect} from 'react';
import { Link } from 'react-router-dom';
import { getCSRFToken } from '../utlis';

import Header from "../components/Header";

function DeleteAccount() {

    const [password, setPassword] = useState('');
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

        const body = {
            password,
            csrfToken
        }


        try {
            
            
            const response = await fetch("/delete-account", {
                method: "DELETE",
                headers: { 
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body)
            });
            
            if (response.status === 200) {
                console.log("Account successfully deleted");
                window.location = "/";
            }
            else if (response.status === 401) {
                console.log("incorrect password");
                alert("incorrect password")
            }
            else {
                console.log("server error");
            }


        } catch (error) {
            console.log(error);
        }
    }
    return (
        <div className={'home_container'}>

        <Header />

        <h1>Delete your account</h1>

        <p>This action cannot be undone, enter your password to confirm deleting your account  </p>

        <div className="login_container" onSubmit={handleSubmit}>
            <form id="postForm" >
                <label htmlFor="password" className="postLabels">Password</label>
                <input className="form_input" type="password"
                    placeholder={"password"}
                    onChange={e => setPassword(e.target.value)}
                    required />
                <br></br>
                <input type="submit" value="Delete" />
            </form>
        </div>
        </div>
    );
}

export default DeleteAccount;