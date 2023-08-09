const express = require('express');
const app = express();
const cors = require("cors");
const pool = require("./db");
const { time } = require('console');
const { v4: uuidv4 } = require('uuid');
// const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const cookieParser = require('cookie-parser'); // Import cookie-parser
const port = process.env.PORT || 5001;
const CryptoJS = require("crypto-js");
const bodyParser = require('body-parser');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crykey = CryptoJS.enc.Hex.parse("000102030405060708090a0b0c0d0e0f");
const iv = CryptoJS.enc.Hex.parse("101112131415161718191a1b1c1d1e1f");
const bypass_2fa = false; // set to true to skip 2fa stuff
const esc = require("./Escape"); // Import Escape and Unescape Functions
const val = require("./Validate"); // Import Validation functions
require('dotenv').config();
app.use(express.json()); // => req.body
app.use(cors({
    origin: ["http://localhost:3000"]
}))
app.use(cookieParser());
// app.use(express.static('public'));

// Middleware for parsing request body
app.use(bodyParser.json());

const delay = async (minTime, maxTime) => {
    // Returns random time between the requests sent in
    return new Promise((pro) => setTimeout(pro, Math.floor(Math.random() * (maxTime - minTime + 1) + minTime)));
};



const generateCsrfToken = async (sessionId) => {

    //generate a unique value to use as a csrf_token
    const csrfToken = uuidv4();
    // Store the CSRF token in the database for the current user's session ID
    try {

        await pool.query('INSERT INTO csrf_tokens (session_id, csrf_token) VALUES ($1, $2)', [sessionId, csrfToken]);

        return {
            code: 200,
            data: csrfToken
        };

    } catch (err) {
        console.error(`Error generating CSRF token: ${err.message}`);
        return {
            code: 500,
            data: 'Error generating CSRF token'
        };
    };
};


const validateCookie = async(req, res, next) => {
    // Checks the cookie hasn't run out of time
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorised' });
    }

    try {
        //Decodes jwt for verification against database
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.user = decoded;
        const get_rows = await pool.query('SELECT * FROM account WHERE id = $1 AND username=$2', [req.user.id,CryptoJS.AES.encrypt(req.user.username, crykey,{ iv: iv }).toString()])
        //If doesn't exist returns unauthorised
        if(get_rows.rows[0].count === 0){
            return res.status(401).json({ message: 'Unauthorised' });
        }
        // Generates new cookie with reset timer
        res.cookie('token', token, { maxAge: 10 * 60 * 1000, httpOnly:true, secure:true});
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

const validate_csrfToken = async (req, res, next) => {

    const {csrfToken} = req.body;
    console.log(csrfToken);

    // if no sessionID is provided return unauthorised status, if there is no crsftoken provided return forbidden status code
    if (!csrfToken) {
        console.log("No csrf token provided");
        res.status(403).json('No csrf token provided');
    }
    else {
        // if session id and csrftoken is provided check for session id in database and retrieve csrftoken provided with it
        // if they match perform rest of api action
        try {
            const sessionID = req.cookies.token;
            // console.log(sessionID);
            const storedCsrfToken = await pool.query('SELECT csrf_token FROM csrf_tokens WHERE session_id = $1', [sessionID])

            if (csrfToken === storedCsrfToken.rows[0].csrf_token) {
                next();

                // eslse return forbidden status saying token is invalid
            } else {
                console.log('Invalid CSRF token');
                res.status(403).json('Invalid CSRF token');
            }
        } catch (err) {
            console.error(err)
            res.status(500).json('Error validating CSRF token');
        }
    }
};

app.get('/2fa-setup', async (req, res) => {
    // Generate the secret and OTP auth URL
    const secret = speakeasy.generateSecret({length: 10});

    // debug
    // console.log("QR DATA");
    // console.log(secret);
    const otpAuthUrl = speakeasy.otpauthURL({
        secret: secret.base32,
        label: 'user',
        issuer: 'Bloggerino',
        encoding: 'base32'
    });

    // Generate the QR code image as a buffer
    let qrlink = await QRCode.toDataURL(otpAuthUrl)
    QRCode.toBuffer(otpAuthUrl, (err, buffer) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Internal Server Error');
        }

        // Convert the ArrayBuffer to a Buffer
        const imageBuffer = Buffer.from(buffer);
        // send qrimage and secret as response
        res.send({
            qrImage: qrlink,//imageBuffer.toString('base64'),
            secret: secret.base32,
        });
    });
});

// Validate the auth code entered by the user
const validate_auth_code = async (req, res, next) => {
    if(bypass_2fa){
        console.log('Bypassing 2fa');
        return next();
    }
    const {code, secret} = req.body;
    try{
        const totpOptions = {
            secret: secret, // secret
            encoding: 'base32',
            token: code, // user entered code
        }

        // Comparing to speakeasy output using the stored account secret
        const confirmCode = speakeasy.time.verify(totpOptions);
        // debug
        // console.log(code);
        // console.log(secret);
        // console.log(`Auth code is: ${confirmCode}`);
        // console.log(req.body);
        if (confirmCode==false){
            return res.status(401).json({ message: 'Invalid code: Could not authenticate user' });
        }
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid code' });
    }

}

const validate_auth_request = async (req, res, next) => {
    //Returns random delay to combat against account enuneration
    await delay(500, 1500);
    if(bypass_2fa == true){
        console.log('Bypassing 2fa');
        return next();
    }
    const username = (req.user)? req.user.username : req.body.email;
    const code = req.body.totp;
    // debug
    // console.log(`${username}, ${code}`);
    // console.log('this is actually email')
    // console.log(username);
    const hashEmail = CryptoJS.AES.encrypt(username, crykey,{ iv: iv }).toString();
    // console.log(hashEmail)
    try {
        const get_secret = await pool.query('SELECT auth_secret FROM account WHERE email = $1', [hashEmail])
        // console.log(get_secret.rows[0])
        const secret = get_secret.rows[0].auth_secret;

        const totpOptions = {
            secret: secret, // secret
            encoding: 'base32',
            token: code, // user entered code
        }
        const confirmCode = speakeasy.time.verify(totpOptions);
        // debug
        // console.log(code);
        // console.log(secret);
        // console.log(`Checked, and the auth code is: ${confirmCode}`);
        if(!confirmCode){
            return res.status(409).json({ success: true, message: 'Error with authentication' });
        }
        next();
    } catch (error) {
        console.error(error)
        res.status(409).json({ success: false, message: 'Error with authentication' });
    }
};

app.get('/2fa-setup', async (req, res) => {
    // Generate the secret and OTP auth URL
    const secret = speakeasy.generateSecret({length: 10});

    // debug
    // console.log("QR DATA");
    // console.log(secret);
    const otpAuthUrl = speakeasy.otpauthURL({
        secret: secret.base32,
        label: 'user',
        issuer: 'Bloggerino',
        encoding: 'base32'
    });

  // Generate the QR code image as a buffer
  let qrlink = await QRCode.toDataURL(otpAuthUrl)
  QRCode.toBuffer(otpAuthUrl, (err, buffer) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Internal Server Error');
    }

    // Convert the ArrayBuffer to a Buffer
    const imageBuffer = Buffer.from(buffer);
    // send qrimage and secret as response
    res.send({
        qrImage: qrlink,//imageBuffer.toString('base64'),
        secret: secret.base32,
    });
  });
});

// Save a new auth secret to the database after validating the code
app.post("/save-auth-code", validateCookie, validate_auth_code, async (req, res) => {
    const {secret} = req.body; 
    const username = req.user.username;
    // debug
    // console.log(req.body);
    // console.log(req.body);
    // console.log(`${secret} ${username}`);

    const encUser = CryptoJS.AES.encrypt(username, crykey,{ iv: iv }).toString();

    // Check user exists before adding their auth secret to db account
    const info = await pool.query('SELECT * FROM account WHERE username = $1', [encUser])
    //Returns random delay to combat against account enuneration
    await delay(750, 1500);
    // console.log(info.rows)

    if(info.rows[0].count = 0){
        return res.status(409).json({ message: 'Invalid username when performing 2fa' });
    }

    try {
        // Insert the auth_secret value into the database
        await pool.query('UPDATE account SET auth_secret = $1 WHERE username = $2', [secret, encUser]);
        res.status(200).json({ success: true, message: 'Secret saved successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to save secret' });
    }
});


app.get("/getCSRFToken", validateCookie, async (req, res) => {

    try {
        //find csrf token for the given session and return it to client frontend
        const sessionID = req.cookies.token;
        const storedCsrfToken = await pool.query('SELECT csrf_token FROM csrf_tokens WHERE session_id = $1', [sessionID]);

        res.json(storedCsrfToken.rows[0]);

    } catch (err) {
        console.error(err)
        res.status(500).json('Error fetching CSRF token');
    }

});

// Save user's new auth code
app.post("/save-auth-code", validateCookie, validate_auth_code, async (req, res) => {
    const {secret} = req.body;
    const username = req.user.username;
    // debug
    // console.log(`${secret} ${username}`);
    try {
        // Insert the auth_secret value into the database
        await pool.query('UPDATE account SET auth_secret = $1 WHERE username = $2', [secret, username]);
        res.status(200).json({ success: true, message: 'Secret saved successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to save secret' });
    }
});


// create post
app.post("/post", validateCookie, validate_csrfToken, async (req, res) => {

    try {

        //get post details from body and the account id from the session_id
        const user = req.user;
        let {title, postBody, privatePost} = req.body;
        if(val.validateTitle(title)){
            title = esc.EscapeInput(title)
        } else{
            return res.status(412).json({message: "invalid title"})
        }if(val.validatePost(postBody)){   
            postBody = esc.EscapeInput(postBody);
        }else{
            return res.status(412).json({message: "invalid post body"})
        }if(val.validatePrivate(privatePost)){
            privatePost = esc.EscapeInput(privatePost);
        } else{
            return res.status(412).json({message: "invalid private value"})
        }
        let accountid = user.id;
        if(val.validateID(accountid)){
            accountid = esc.EscapeInput(accountid);
        }else{
            return res.status(412).json({message: "invalid accountID"})
        }
        // console.log(user)
        let date = new Date().toLocaleDateString();
        let time = new Date().toLocaleTimeString();
        const createpost = await pool.query("INSERT INTO post (title, body, postDate, postTime, private, accountid) VALUES($1, $2, $3, $4, $5, $6) RETURNING *", [title, postBody, date, time, privatePost, accountid]);

        res.json("Post created successfully");

    } catch (err) {
        console.error(err.message);
        res.status(500).json('Error creating post');
    }

});

// Edit a user's existing post
app.put("/edit-post",validate_csrfToken, async (req, res) => {

    try {
        // Escape values
        let {title, postBody, privatePost, postid} = req.body;
        if(val.validateTitle(title)){
            title = esc.EscapeInput(title)
        } else{
            return res.status(412).json({message: "invalid title"})
        }if(val.validatePost(postBody)){   
            postBody = esc.EscapeInput(postBody);
        }else{
            return res.status(412).json({message: "invalid post body"})
        }if(val.validatePrivate(privatePost)){
            privatePost = esc.EscapeInput(privatePost);
        } else{
            return res.status(412).json({message: "invalid private value"})
        }
        if(val.validateID(postid)){
            postid = esc.EscapeInput(postid);
        }else{
            return res.status(412).json({message: "invalid postID"})
        }

        // const accountid = decoded.id;
        // debug
        // console.log(decoded);
        // console.log('Updated information:');
        // console.log(title);
        // console.log(postBody);
        // console.log(privatePost);
        // console.log(postid);

        // Update post with request values
        const updatePost = await pool.query('UPDATE post SET title = $1, body= $2, private = $3 WHERE id = $4', [title, postBody, privatePost, postid]);

        res.json(`Updated post with ID: ${postid}`);

    } catch (err) {logout
        console.error(err.message);
    }


});

//  delete a post via ID
app.delete("/delete-post", validate_csrfToken, async (req, res) => {
    try {
        let {postid} = req.body;
        if(val.validateID(postid)){
            postid = esc.EscapeInput(postid);
            const query = 'DELETE FROM post WHERE id = $1'; //delete post with given id
            await pool.query(query, [postid]); // pass id parameter as an array to the query
            res.json(`Deleted post with ID: ${postid}`);
        } else{
            return res.status(412).json({message: "Invalid ID"});
        }
        
    } catch (err) {
        console.error(err);
    }
});

app.post("/comments", validateCookie, validate_csrfToken, async (req, res ) =>{
    try {

        //gets the author of each comment
        const user = req.user;
        let postID = req.body.postID;
        const privateComment = false;
        let accountid = user.id;
        let CommentBody = req.body.CommentBody;
        //Validation checks
        //If valid, the inputs are escaped
        if(val.validateID(postID)){
            postID = esc.EscapeInput(postID);
        }else{
            return res.status(412).json({message: "invalid postID"})
        }
        if(val.validateID(accountid)){
            accountid = esc.EscapeInput(accountid);
        }else{
            return res.status(412).json({message: "invalid AccountID"})
        }
        if(val.validateComment(CommentBody)){
            body = esc.EscapeInput(CommentBody)
        } else{
            return res.status(412).json({message: "invalid Comment"})
        }

        let date = new Date().toLocaleDateString();
        let time = new Date().toLocaleTimeString();
        //Adds the comment to the database
        const createcomment = await pool.query("INSERT INTO post_comment (Body, commentDate, commentTime, private, postID, accountID) VALUES($1, $2, $3, $4, $5, $6) RETURNING *", [body, date, time, privateComment, postID, accountid]);

        res.json("Comment created successfully");

    } catch (err) {
        console.error(err.message);
    }
});

app.get("/comments/:ID", async (req, res) =>{
    //validates and escapes the postID
    let ID = parseInt(req.params.ID);
    if(val.validateID(ID)){
        ID = esc.EscapeInput(ID);
    }else{
        return res.status(412).json({message: "invalid ID"})
    }
    try {
        //Gets the comments alongside the author of each one
        const getcomments = await pool.query(`SELECT post_comment.id, post_comment.body, post_comment.postID, post_comment.commentDate, post_comment.commentTime, account.username
        FROM post_comment
        Inner JOIN account ON account.id = post_comment.accountid
        WHERE post_comment.postid = $1
        ORDER BY post_comment.commentDate DESC, post_comment.commentTime DESC`, [ID] );


        for(const element in getcomments.rows){
            const bytes  = CryptoJS.AES.decrypt(getcomments.rows[element].username, crykey,{ iv: iv });
            getcomments.rows[element].username = bytes.toString(CryptoJS.enc.Utf8);            
        }

        res.json(getcomments.rows)
    } catch (err) {
        console.error(err.message);
    }
});


app.post("/register", validate_auth_code, async (req, res) => {

    try {
        let {username,email,password, password2, secret} = req.body;
        // Checks all escaping inputs
        if(val.validateUsername(username)){
            username = esc.EscapeInput(username);
        } 
        else {
            return res.status(412).json({message: "Invalid Username Format"});
        }
        
        if(val.validateEmail(email)){
            email = esc.EscapeInput(email);
        } else {
            return res.status(400).json({message: "Invalid Email Format"});
        }
        
        if(val.validatePasswords(password, password2)){
            password = esc.EscapeInput(password)
        } 
        else {
            return res.status(400).json({message: "Invalid Password Format"});
        }
        secret = esc.EscapeInput(secret)
        //Returns random delay to combat against account enuneration
        await delay(500, 1500);
        // Encrypts personal details with cryptojs
        const hashEmail = CryptoJS.AES.encrypt(email, crykey,{ iv: iv }).toString();
        const hashUser = CryptoJS.AES.encrypt(username, crykey,{ iv: iv }).toString();
        // Searches into database based on username and email and returns status code if existing user already exists
        const existingUser = await pool.query("SELECT * FROM account WHERE username = $1 OR email = $2", [hashUser,hashEmail]);
        if(existingUser.rows[0]){
            return res.status(409).json({ message: 'Register Invalid' });
        }

        //Hashes password and inserts into database, if any error in inserting then register invalid is returned.
        const hashedPassword = await bcrypt.hash(password, 10);
        const item = await pool.query("INSERT INTO account (username,email,password,auth_secret) VALUES($1, $2, $3, $4) RETURNING *", [hashUser,hashEmail,hashedPassword, secret]);
        const info = await pool.query('SELECT * FROM account WHERE username = $1', [hashUser])
        if(!info.rows[0]){
            return res.status(409).json({ message: 'Register Invalid' });
        }
        // Generates token based on account details and then encrypts it with an expiry while generating a csrf token additionally
        const token = jwt.sign({ id: info.rows[0].id,username:username}, process.env.SECRET_KEY, {expiresIn: '2h'});
        const csrfToken = await generateCsrfToken(token);

        if (csrfToken.code === 200) {
            res.cookie('token', token, { maxAge: 10 * 60 * 1000, httpOnly:true, secure:true}); // Set cookie to expire in 10 minutes
        }
        else {
            console.log("CSRF Token failed to be generated")
        }
        res.status(200).json({ success: true, message: 'New user saved successfully' });

    } catch (err) {
        console.error(err.message);
        res.json("Error");
    }
});

app.post("/login", validate_auth_request, async (req, res) => {

    try {

        let {email,password} = req.body;
        // Escape inputs
        if(val.validateEmail(email)){
            email = esc.EscapeInput(email);
        } else {
            return res.status(409).json({message: "Error with authentication"});
        }

        if(val.validatePassword(password)){
            password = esc.EscapeInput(password)
        } else {
            return res.status(409).json({message: "Error with authentication"});
        }

        //Encrypts email and then checks it against the database
        const hashEmail = CryptoJS.AES.encrypt(email, crykey,{ iv: iv }).toString();

        const info = await pool.query('SELECT * FROM account WHERE email = $1', [hashEmail])

        //Returns random delay to combat against account enuneration but is rarely needed for validate_auth_request filtering through also having delay
        // await delay(500, 1500);
        // console.log('here')
        if(!info.rows[0]){
            return res.status(409).json({ message: 'Error with authentication' });
        }

        currentTime = new Date();

        //if account is locked and still has cool down period left tell user how long they have left until they can
        //attempt to log in again
        if (info.rows[0].locked && (info.rows[0].locked_until > currentTime)) {
            const remainingTime = Math.ceil((info.rows[0].locked_until - currentTime) / 1000 / 60);
            return res.status(401).json({ message: `Account locked. Please try again in ${remainingTime} minutes.` });
        }
        //if account is locked and time is up unlock account and reset attempt counter
        if (info.rows[0].locked && info.rows[0].locked_until <= currentTime) {
            await pool.query('UPDATE account SET incorrect_attempts = 0, locked = false, locked_until = NULL WHERE email = $1', [hashEmail]);
        }

        
        const isPasswordValid = await bcrypt.compare(password, info.rows[0].password);
        // console.log(isPasswordValid)
        if (!isPasswordValid) {

            if ((info.rows[0].incorrect_attempts) >= 5 && !info.rows[0].locked) {
                await pool.query('UPDATE account SET locked = true, locked_until = NOW() + INTERVAL \'30 minutes\' WHERE email = $1', [hashEmail]);
                return res.status(401).json({ message: 'Account locked. Please try again in 30 minutes' });
            }
            else if ((info.rows[0].incorrect_attempts) < 5 && !info.rows[0].locked) {
                await pool.query('UPDATE account SET incorrect_attempts = $1 WHERE email = $2', [(info.rows[0].incorrect_attempts+1), hashEmail]);
            }

            return res.status(409).json({ message: 'Error with authentication' });
        }

        //if password was correct reset attempt count to 0
        if (info.rows[0].incorrect_attempts !== 0) {
            await pool.query('UPDATE account SET incorrect_attempts = 0 WHERE email = $1', [hashEmail]);
        }


        // decrypts username for token reasons and then attaches to cookie
        const bytes  = CryptoJS.AES.decrypt(info.rows[0].username, crykey,{ iv: iv });
        const unHashUser = bytes.toString(CryptoJS.enc.Utf8);
        const token = jwt.sign({ id: info.rows[0].id,username:unHashUser}, process.env.SECRET_KEY, {expiresIn: '2h'});
        const csrfToken = await generateCsrfToken(token);
        if (csrfToken.code === 200) {
            res.cookie('token', token, { maxAge: 10 * 60 * 1000, httpOnly:true, secure:true}); // Set cookie to expire in 10 minutes
            res.json({ message: 'Worked' });
        }
        else {
            console.log("CSRF Token failed to be generated")
            res.status(402).json({ message: 'Invalid token' });
        }

    } catch (err) {
        console.log(err);
        res.json('Ahh error happened')
    }
});

app.get('/logout', async (req, res) => {

    try {
        //Removes user tokens and csrf tokens, clears cookies and then forces the user to go back to main page
        const sessionID = req.cookies.token;
        const storedCsrfToken = await pool.query('DELETE FROM csrf_tokens WHERE session_id = $1', [sessionID])
        // const decoded = jwt.verify(token, 'secret');
        res.clearCookie('token'); // Clear the 'token' cookie
        res.send('Logged out successfully');
    } catch (error) {
        res.status(402).json({ message: 'Error' });
    }
});

app.get("/validate-token", validateCookie, async (req, res) => {
    const token = req.user
    try {
        // validates username against the database to ensure that it exists and returns if true or not
        const hashUser = CryptoJS.AES.encrypt(token.username, crykey,{ iv: iv }).toString();
        const existingUser = await pool.query("SELECT * FROM account WHERE id = $1 AND username = $2", [token.id,hashUser]);
        if(existingUser.rows[0]){
            res.json({ 'valid': true });
        }
        else{
            res.status(403).json({ message: 'Invalid token' });
        }
    } catch (error) {
        res.status(403).json({ message: 'Invalid token' });
    }
});

// get all posts
app.get("/posts", validateCookie, async (req, res) => {
    try {
        let getposts = await pool.query(`SELECT post.id, post.title, post.body, post.postDate, post.postTime, post.private, account.username
        FROM post
        INNER JOIN account ON account.id=post.accountid
        WHERE post.private = false
        ORDER BY post.postDate DESC, post.postTime DESC`);

        for(const element in getposts.rows){
            const bytes  = CryptoJS.AES.decrypt(getposts.rows[element].username, crykey,{ iv: iv });
            getposts.rows[element].username = bytes.toString(CryptoJS.enc.Utf8);
        }
        
        // debug
        // console.log(getPosts.rows);
        
        res.json(getposts.rows)

    } catch (err) {
        console.error(err.message);
        res.status(500).json('Error fetching posts from database');
    }
});

// get posts that contain the search term
app.get("/posts/:search", validateCookie, async (req, res) => {

    let { search } = req.params;

    if(val.validateSearch(search)){
        search = esc.EscapeInput(search);
    }
    const hashSearchUserName = CryptoJS.AES.encrypt(search, crykey,{ iv: iv }).toString();
    
    search = `%${search.toLowerCase()}%`;
    try {
        let getSearchPosts = await pool.query(`SELECT post.id, post.title, post.body, post.postDate, post.postTime, post.private, account.username
            FROM post
            INNER JOIN account ON account.id=post.accountid
            WHERE lower(post.title) LIKE $1 OR lower(post.body) LIKE $1 OR account.username LIKE $2
            AND post.private = false
            ORDER BY post.postDate DESC, post.postTime DESC`, [search, hashSearchUserName]);
        for(const element in getSearchPosts.rows){
            const bytes  = CryptoJS.AES.decrypt(getSearchPosts.rows[element].username, crykey,{ iv: iv });
            getSearchPosts.rows[element].username = bytes.toString(CryptoJS.enc.Utf8);
        }

        res.json(getSearchPosts.rows)

    } catch (err) {
        console.error(err.message);
    }

});

// get posts written by the current user
app.get("/my-posts", validateCookie, async (req, res) => {

    // console.log(username);
    const username = CryptoJS.AES.encrypt(req.user.username, crykey,{ iv: iv }).toString();
    
    // retrieve the post infromation made by the user
    try {
        let getPosts = await pool.query(`SELECT post.id, post.title, post.body, post.postDate, post.postTime, post.private, account.username
        FROM post
        INNER JOIN account ON account.id=post.accountid
        WHERE account.username = $1
        ORDER BY post.postDate DESC, post.postTime DESC`, [username]);

        // debug
        // console.log(getPosts.rows);
        
        // decrypt return values
        for(const element in getPosts.rows){
            const bytes  = CryptoJS.AES.decrypt(getPosts.rows[element].username, crykey,{ iv: iv });
            getPosts.rows[element].username = bytes.toString(CryptoJS.enc.Utf8);
        }

        res.json(getPosts.rows)

    } catch (err) {
        console.error(err.message);
    }

});


const reauthenticateUser = async (req, res, next) => {

    const user = req.user;

    const username = user.username;

    const { password } = req.body;
    const hashUser = CryptoJS.AES.encrypt(username, crykey,{ iv: iv }).toString();
    //find user in the databse and return their details
    const info = await pool.query('SELECT * FROM account WHERE username = $1', [hashUser])

    //check the password the user provided matches their stored password, if they don't return
    //unauthorised code to user, if it is continue with server change
    const isPasswordValid = await bcrypt.compare(password, info.rows[0].password);
    if (isPasswordValid) {
        next();
    } else {
        res.status(401).json('Invalid password');
        console.log("incorrect password");
    }

}


app.delete("/delete-account", validateCookie, reauthenticateUser, validate_csrfToken, async (req, res) => {
    try {
        const user = req.user;
        const accountid = user.id;

        if(val.validateID(accountid)){

            const deletedAccount = await pool.query(`DELETE FROM account WHERE ID = $1`, [accountid]);

            console.log("Account deleted successfully");
            return res.json("Account deleted successfully");
        } else{

            return res.status(412).json({message: "Invalid accountID"})
        }

        //find user in database with that id and delete their account
        

    } catch (err) {
        console.error(err.message);
    }

});

app.put("/change-password", validateCookie, reauthenticateUser,  validate_csrfToken, async (req, res) => {
    try {
        const user = req.user;

        let accountid = user.id;
        let {newPassword, reEnteredNewPassword} = req.body;
        
        if(val.validateID(accountid)){
            accountid = esc.EscapeInput(accountid);
        }else{
            return res.status(412).json({message: "Invalid accountID"});
        }
        if(val.validatePasswords(newPassword, reEnteredNewPassword)){
            newPassword = esc.EscapeInput(newPassword)
        } 
        else {
            return res.status(412).json({message: "Invalid Password Format"});
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        //find user in database with that id and update their  password
        const updatedAccount = await pool.query(`UPDATE account SET password = $1 WHERE ID = $2`, [hashedPassword, accountid]);

        console.log("Account password successfully updated");
        res.json("Account password successfully updated")

    } catch (err) {
        console.error(err.message);
    }

});


app.listen(port, () => {
    console.log(`Express app listening on port ${port}`);
})

module.exports = app;