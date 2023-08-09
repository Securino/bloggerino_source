import React, { useEffect, useState } from "react";
import Modal from "react-modal"


const ShowComment = (props) => {
  const [comments, setComments] = useState([]);
  const [modalIsOpen, setModalIsOpen] = React.useState(false);
  const { postID } = props;

  const modalStyle = {
    content: {
      top: '50%',
      left: '50%',
      right: '50%',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      background: 'rgb(249,86,179)linear-gradient(137deg, rgba(249,86,179,1) 8%, rgba(235,122,24,1) 100%)',
      
      border: 'rounded',
      }
    };
  

    const getComments = async () => {
    try {
      //console.log(id);
      
      const response = await fetch(`/comments/${postID}`);
      const jsonData = await response.json();
      
      setComments(jsonData);
      //console.log(comments);
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    getComments();
  }, []);

  return (
      <div>
      <button onClick={() => setModalIsOpen(true)}>View Comments</button>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        style={modalStyle}
      >
      
      
            <h2>Comments</h2>
          
          {comments.map((comment) => (
        <div key={comment.id}>
          <h2>{comment.username}</h2>
          <p>{comment.body}</p>
          <p>Date: {comment.commentdate}</p>
          <p>Time: {comment.commenttime}</p>
          
        </div>
      ))}
          
      </Modal>

    </div>
  );
};

export default ShowComment;