import React, { useState } from 'react';
import AddComment from './AddComment';
import ShowComment from './ShowComment';
function ShowPost(props) {

    const { posts } = props;
    

  return (
    <div>
      {posts.map((post) => (
        <div key={post.id} id={post.id}>
          <h2>{post.title}</h2>
          <p>{post.body}</p>
          <p>Author: {post.username}</p>
          <p>Date: {post.postdate}</p>
          <p>Time: {post.posttime}</p>
          <AddComment postID={post.id}/>
          <ShowComment postID={post.id}/>
          
        </div>
        
      ))}
      
    </div>
  );
}

export default ShowPost;