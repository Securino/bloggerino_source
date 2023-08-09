import React,{useState, useEffect} from 'react';
import { Link } from 'react-router-dom';
import ShowMyPosts from '../components/ShowMyPost';
import Header from "../components/Header";
import { getCSRFToken } from '../utlis';

// function GetMyPosts(){
    
// }

function MyPosts() {
    const [posts, setPosts] = useState([]);
    const [csrfToken, setCsrfToken] = useState('');
    useEffect(() => {

      const fetchData = async () => {

        const csrf_token = await getCSRFToken();
        setCsrfToken(csrf_token);
        console.log(csrf_token);
    }
    fetchData();

      const fetchPosts = async () => {
        try {
          const response = await fetch(`/my-posts`);

          if (response.status === 200) {
            const data = await response.json();

            if (data.length > 0) {
              setPosts(data);
            } 
          } else {
            setPosts([]);
          }
        } catch (error) {
          console.log(error);
        }
      };
      fetchPosts();
      
    }, []);

    return (
        <div className={'home_container'}>

        <Header />
        <div>
        <h1>My Posts</h1>
        
        <div>
        {posts.length !== 0 ? (
            <ShowMyPosts posts={posts} csrfToken={csrfToken}/>
        ) : (
            <p>You have no posts</p>
        )}
        </div>
        </div>
        </div>
    );
}


export default MyPosts;