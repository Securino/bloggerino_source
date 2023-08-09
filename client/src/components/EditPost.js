import React, { useState } from 'react';
import Modal from 'react-modal';

function EditPost() {
    // console.log("edit post reached")

    const [title, setTitle] = useState('');
    const [postBody, setPostBody] = useState('');
    const [privatePost, setPrivatePost] = useState(false);
    const [postID, setPostID] = useState('');

    const updatePrivate = () => {
        setPrivatePost(!privatePost);
    }

  const handleFormSubmit = (event) => {
    event.preventDefault();
    // console.log(`Name: ${name}, Email: ${email}`);
    setModalIsOpen(false);
  };

  return (
    <div>
      <button onClick={() => setModalIsOpen(true)}>Open Form</button>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
      >
        <h2>Fill out the form</h2>
        <form onSubmit={handleFormSubmit}>
          <label>
            Name:
            <input type="text" value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label>
            Email:
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <button type="submit">Submit</button>
        </form>
      </Modal>
    </div>
  );
}
export default EditPost;