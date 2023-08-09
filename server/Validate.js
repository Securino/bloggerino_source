const validateEmail = function(email) {
    // Regex for email found at https://martech.zone/email-address-regex-functions/ \\
    const validEmailRegex = /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
    //Null Check
    if (email === null) {
        console.log("Email address can't be null");
        return false;
    //Pattern Match Check
    } else if (!email.match(validEmailRegex)) {
        console.log("Email address must match required format");
        return false;
    } else {
        console.log("Valid Email")
        return true;
    };  
};

const validatePost = function(post) {
    //null check
    if (post === null) {
        console.log("Post can't be null")
        return false;
    //type check
    } else if (typeof post !== 'string') {
        console.log("Post must be a string")
        return false;
    //length check
    } else if (post.length <= 0) {
        console.log("Post length must be greater than 1")
        return false;
    } else {
        console.log("Valid Post")
        return true;
    };
};

const validateTitle = function(title){
    //null check
    if (title === null) {
        console.log("Title can't be null")
        return false;
    //type check
    } else if (typeof title !== 'string') {
        console.log("Title must be a string")
        return false;
    //length check
    } else if (title.length <= 0) {
        console.log("Title length must be greater than 1")
        return false;
    } else {
        console.log("Valid Title")
        return true;
    };
};

const validateComment = function(comment) {
    //null check
    if (comment === null) {
        console.log("Comment can't be null")
        return false;
    //type check
    } else if (typeof comment !== 'string') {
        console.log("Comment must be a string")
        return false;
    //length check
    } else if (comment.length <= 0) {
        console.log("Comment length must be greater than 1")
        return false;
    } else {
        console.log("Valid Comment")
        return true;
    };
};

const validateSearch = function(search){
    //null check
    if (search === null) {
        console.log("Search parameter can't be null")
        return false;
    //type check
    } else if (typeof search !== 'string') {
        console.log("Search parameter must be a string")
        return false;
    //length check
    } else if (search.length <= 0) {
        console.log("Search parameter length must be greater than 1")
        return false;
    } else {
        console.log("Valid Search")
        return true;
    };
};

const validateUsername = function(username){
    //null check
    if (username === null) {
        console.log("Username can't be null")
        return false;
    //type check
    } else if (typeof username !== 'string') {
        console.log("Username must be a string")
        return false;
    //Length check, has to be greater than 0
    } else if (username.length <= 0) {
        console.log("Username is too short")
        return false;
    } else {
        console.log("Valid Username")
        return true;
    };
};

//Validates one password for sign in
const validatePassword = function(password){
    const validPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-]).{8,25}$/
    //Null check
    if (password === null) {
        console.log("Password can't be null")
        return false;
    //Pattern Match Check
    } else if (!password.match(validPasswordRegex)) {
        console.log("Password must match required pattern")
        return false;
    } else {
        console.log("Valid Password")
        return true;
    };
};

//Validates two passwords for registration and changing password
const validatePasswords = function(password, secondPassword){
    const validPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-]).{8,25}$/
    if (password !== secondPassword) {
        console.log("Passwords don't match")
        return false;
    } else if (password === null) {
        console.log("Passwords can't be null")
        return false;
     } else if (!password.match(validPasswordRegex)) {
        console.log("Passwords must match required pattern")
        return false;
     } else {
        console.log("Valid Password")
        return true;
    };
};

const validatePrivate = function(private){
    //null check
    if (private === null) {
        console.log("Private value can't be null")
        return false;
    //type check
    } else if (typeof private !== 'boolean') {
        console.log("Private value must be either true or false")
        return false;
    }else {
        console.log("Valid Private")
        return true;
    };
};

const validateID = function(ID){
    //null check
    if (ID === null) {
        console.log("ID can't be null")
        return false;
    //type check
    } else if (typeof ID !== 'number') {
        console.log("ID must be a number")
        return false;
    }else {
        return true;
    };
}

module.exports = {validateComment, validateEmail,
                  validateSearch, validatePost, 
                  validateTitle, validatePassword,
                  validatePrivate, validateUsername,
                  validatePasswords, validateID };