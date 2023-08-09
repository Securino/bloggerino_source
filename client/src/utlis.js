
//function that fetches csrf token and returns csrf token for session to be used in forms
export const getCSRFToken = async () => {

    const csrfToken = await fetch("/getCSRFToken", {
        method: "GET",
        headers: { 
            "Content-Type": "application/json",
        }
    });
    
    const csrf_token = await csrfToken.json();

    return csrf_token.csrf_token;
  }