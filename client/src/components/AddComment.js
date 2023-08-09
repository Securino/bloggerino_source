
import React, { useState, useEffect } from 'react'
import { getCSRFToken } from '../utlis';

const AddComment = (props) => {
  const [CommentBody, setCommentBody] = useState('');
  const [csrfToken, setCsrfToken] = useState('');
  const {postID} = props;

  useEffect(() => {
      // fetch csrf token on initial render and mount of components and store in state to be used for form submission
      const fetchData = async () => {

          const csrf_token = await getCSRFToken();
          setCsrfToken(csrf_token);
      }
      fetchData();

      }, []);
    
  const handleSubmit = async () => {
    //e.preventDefault();
    //setPostID(id);
    const body = {
        postID,
        CommentBody,
        csrfToken
    }
    try {
        const response = await fetch("/comments", {
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
    <div className="" onSubmit={handleSubmit}>
            <form id="commentForm" >                
                <label htmlFor="CommentBody" >Body</label>
                <textarea className="form_input" type="text" required placeholder="Enter Comment"  onChange={e => setCommentBody(e.target.value)}style={{width: '400px', resize: 'none'}}/>             
                <input type="submit" value="Create Comment"/>
            </form>
        </div>
  )
}


export default AddComment;