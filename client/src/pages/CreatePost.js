import React,{useState, useEffect} from 'react';
import { Link } from 'react-router-dom';
import { getCSRFToken } from '../utlis';

import Header from "../components/Header";

function CreatePost() {

    const [title, setTitle] = useState('');
    const [postBody, setPostBody] = useState('');
    const [privatePost, setPrivatePost] = useState(false);
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

    //function that is called everytime private post check is clicked switching the boolean state
    const updatePrivate = () => {
        setPrivatePost(!privatePost);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        // navigate("/home");

        const token =  localStorage.getItem('token');

        const body = {
            title,
            postBody,
            privatePost,
            csrfToken
        }

        try {
            
            
            const response = await fetch("/post", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body)
            });
            
            if (response.status === 200) {
                window.location = "/dashboard/feed";
            }
            else {
                console.log(await response.json())
            }



        } catch (error) {
            console.log(error);
        }
    }
    return (
        <div className={'home_container'}>

        <Header />

        <h1>Create a Post</h1>
        
        <div className="login_container" onSubmit={handleSubmit}>
            <form id="postForm" >
                <label htmlFor="Title" className="postLabels"></label>
                <input className="form_input" required type="text"
                    placeholder={"Post Title"}
                    onChange={e => setTitle(e.target.value)} style={{ width: '400px', resize: 'none'}}/>
                <br></br>
                <label htmlFor="PostBody" className="postLabels"></label>
                <textarea className="form_input" required placeholder="Post Content" rows={6} cols={40} onChange={e => setPostBody(e.target.value)}style={{ width: '400px', height: '200px', resize: 'none'}}/>
                <br></br>
                <label htmlFor="PrivatePost" className="postLabels"style={{}}>Make post Private?</label>
                <input className="form_input"
                    type="checkbox"
                    checked={privatePost}
                    onChange={updatePrivate} />
                <br></br>
                <input type="submit" value="Create Post" />
            </form>
        </div>
        </div>
    );
}

export default CreatePost;