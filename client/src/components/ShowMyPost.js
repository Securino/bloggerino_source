import React,{useState} from 'react';
import { Link } from 'react-router-dom';

import Header from "../components/Header";

function ShowMyPosts(props) {
    const { posts, csrfToken } = props;
    // const [title, setTitle] = useState('');
    // const [postBody, setPostBody] = useState('');
    const [privatePost, setPrivatePost] = useState(false);
    // const [postid, setPostID] = useState('');

    const updatePrivate = () => {
        setPrivatePost(!privatePost);
    }

    const handleSubmit = async (postid, title, postBody, privatePost) => {
        // debug
        // console.log('Updated information:');
        // console.log(title);
        // console.log(postBody);
        // console.log(privatePost);
        // console.log(postid);
        const body = {
            postid,
            title,
            postBody,
            privatePost,
            csrfToken
        }
        try {
            const response = await fetch("/edit-post", {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            });
            
            if (response.status === 200) {
                // response.json().then(data=>{console.log(data);});
                console.log("Post was updated successfully");
            }

            window.location = "/dashboard/my-posts";

        } catch (error) {
            console.log(error);
        }
    }
    
    const deletePost = async (postid) => {
        const body = {
            postid,
            csrfToken
        }
        try {
            const response = await fetch("/delete-post", {
                method: "DELETE",
                headers: { 
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            });
            
            if (response.status === 200) {
                // response.json().then(data=>{console.log(data);});
                // console.log("Post was deleted successfully");
            }

            window.location = "/dashboard/my-posts";

        } catch (error) {
            console.log(error);
        }
    };

    

    const handleFormSubmit = (postid) => (e) => {
        // Call multiple functions sequentially
        const { title, body, privatePost } = e.target.elements;
        e.preventDefault();
        // console.log(postid)
        // console.log(title.value)
        // console.log(body.value)
        // console.log(privatePost.checked)
        // handleValues(postid, title.value, body.value, privatePost.value);
        handleSubmit(postid, title.value, body.value, privatePost.checked);
    };
      
    const handleDelete = (postid) => (e) => {
        // Call multiple functions sequentially
        e.preventDefault();
        // console.log(postid)
        deletePost(postid);
    };
    return (
        <>
        <div>
          {posts.map((post) => (
          <div key={post.id}>
            <div className="login_container">
                {/* <p>{post.id}</p> */}
              <form id="postForm" onSubmit={handleFormSubmit(post.id)}>
                <label htmlFor="Title" className="postLabels">Edit Title</label>
                <input className="form_input" type="text"  name = "title" 
                    placeholder={post.title} defaultValue= {post.title} />
                <br></br>
                <label htmlFor="PostBody" className="postLabels">Edit Body</label><br></br>
                <textarea className="form_input" name = "body" placeholder= {post.body} defaultValue= {post.body} rows={6} cols={40} style={{ width: '400px', height: '200px', resize: 'none'}} />
                <br></br>
                <label htmlFor="PrivatePost" className="postLabels">Keep post private?</label>
                <input className="form_input"type="checkbox" name = "privatePost" defaultChecked={post.private}/>
                <br></br>
                <button onClick={handleDelete(post.id)}>Delete post</button>
                <input type="submit" value="Update post" />
            </form>
        </div>
          </div>
          ))}</div>
        </>
    );
}

export default ShowMyPosts;