import React,{useState} from 'react';
const SearchBar = (props) => {

    const [searchInput, setSearchInput] = useState('');


    const findPosts = async () => {

        if (searchInput !== '') {


            try {

                
                const response = await fetch(`/posts/${searchInput}`);
                
                if (response.status === 200) {
                    
                    
                    const data = await response.json()
                    
                    if (data.length > 0) {
                        props.onChildClick(data);
                    }
                    else {
                        props.onChildClick([]);
                    }
                }
                } catch (error) {
                    console.log(error);
                  }
        }
    }
        
    return (

        <>
            <input placeholder={'Search for Post'} onChange={e => setSearchInput(e.target.value)} className={'search_bar'}/>
            <button onClick={findPosts}>Search</button>
        </>
    )
}

export default SearchBar;