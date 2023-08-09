import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import ShowPost from '../components/ShowPost';
import Header from "../components/Header";

function MainFeed() {
  const [posts, setPosts] = useState([]);

  const handleSearchClick = (searchResults) => {

    console.log(searchResults)
    setPosts(searchResults)
  };

  useEffect(() => {

    const fetchData = async () => {

      try {
        const response = await fetch(`/posts`);

        if (response.status === 200) {
          const data = await response.json();

          console.log(data.length)
          if (data.length > 0) {
            setPosts(data);
          } else {
            setPosts([]);
          }
        } else {
          setPosts([]);
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();

  }, []);

  return (
    <div className={'home_container'}>
      <Header />
      <h1>Post Feed</h1>
      <SearchBar onChildClick={handleSearchClick} />
      
      <div>
      {posts.length !== 0 ? (
        <ShowPost posts={posts} />
      ) : (
        <p>No Posts contain that search</p>
      )}
    </div>
    </div>
  );
}

export default MainFeed;