const chai = require('chai');
const speakeasy = require('speakeasy');
const {expect} = chai;
const app = require('../Server');
const request = require('supertest')(app);
const session  = require('supertest-session');
const { describe, it } = require('mocha');
const pool = require("../db");
const CryptoJS = require("crypto-js");
require('dotenv').config();
const crykey = CryptoJS.enc.Hex.parse("000102030405060708090a0b0c0d0e0f");
const iv = CryptoJS.enc.Hex.parse("101112131415161718191a1b1c1d1e1f");

//before running tests create postgres database called bloggerino_test and change .ENV variable DATABASE = 'test'
//next run the testdata.js file to create tables and insert test data
//finally change bypass_2fa to true in server.js file before running

// var secret = 'I5DGWYTIMRTXCWSB'; // 2fa account used for testing
var secret = 'I5DGWYTIMRTXCWSF'; // 2fa account used for testing
if (process.env.DATABASE === "test") {
    
    //create a new test user in the database
    describe('Account creation', () => {
      let testSession = null;
      let csrfToken;
      let sessionID;

      before(async () => {
        testSession = session(app);
      });
      it('try register a new user, with a username that already exists', async () => {
        // Generate the current TOTP
        const totp = speakeasy.totp({
          secret: secret,
          encoding: 'base32'
        });
        // console.log(totp);
        const response = await testSession
        .post('/register')
        .send({ username: 'harryR', email: 'test@email.com', password: 'testPassword10!', password2:'testPassword10!', code: totp, secret: secret })
        .expect(409);
        
        expect(response.body.message).to.equal('Register Invalid');
      });
      
      // it('try register a new user, with a email that already exists', async () => {
      //     // Generate the current TOTP
      //     const totp = speakeasy.totp({
      //       secret: secret,
      //       encoding: 'base32'
      //     });
      //     const response = await testSession
      //     .post('/register')
      //     .send({ username: 'test', email: 'harryR@email.com', secondEmail: 'test2@email.com', password: 'testPassword10!', isAdmin: false , secret: secret, code: totp})
      //     // console.log(response.body);
      //     .expect(409);
      //     expect(response.body.message).to.equal('Username, email or second email already taken');
      //   });
        
        it('register a new user successfully', async () => {
          // Generate the current TOTP
          const totp = speakeasy.totp({
            secret: secret,
            encoding: 'base32'
          });

          const response = await testSession
          .post('/register')
          .send({ username: 'test', email: 'test@email.com', password: 'testPassword10!', password2:'testPassword10!', code: totp, secret: secret})
          .expect(200);
          
          expect(response.body.message).to.equal('New user saved successfully');

          
          const newUser = await pool.query('SELECT * FROM account WHERE username = $1', [CryptoJS.AES.encrypt('test', crykey,{ iv: iv }).toString()]);
          expect(newUser.rows.length).to.equal(1);
          
          const setCookieHeader = response.headers['set-cookie'];
          sessionID = setCookieHeader.find(cookie => cookie.includes('token='));
          
          csrfToken = await testSession
          .get('/getCSRFToken')
          .set('Cookie', sessionID)
          .expect(200)
          .then((res) => res.body.csrf_token);


          const logout = await testSession
            .get('/logout')
            .set('Cookie', sessionID)
            .expect(200);
        });
      });
      
//test logging into server with a previously created test account made above
describe('Account Login', () => {
  let testSession = null;
  let csrfToken;
  let sessionID;
  
  it('Unsuccessful Log in, entering incorrect user password', async () => {
    testSession = session(app);
    // Generate the current TOTP
    const totp = speakeasy.totp({
      secret: secret,
      encoding: 'base32'
    });
    const response = await testSession
    .post('/login')
    .send({ email: 'test@email.com', password: 'Harry_loves_gym_11&!', secret: secret, totp: totp })
    .expect(409);
    
    
    expect(response.body.message).to.equal('Error with authentication');
  });
  
  it('successful Log in', async () => {
    testSession = session(app);
    // Generate the current TOTP
    const totp = speakeasy.totp({
      secret: secret,
      encoding: 'base32'
    });
    const response = await testSession
    .post('/login')
    .send({ email: 'test@email.com', password: 'testPassword10!' , secret: secret, totp: totp })
    .expect(200);
    
    const setCookieHeader = response.headers['set-cookie'];
    sessionID = setCookieHeader.find(cookie => cookie.includes('token='));
    
    csrfToken = await testSession
    .get('/getCSRFToken')
    .set('Cookie', sessionID)
    .expect(200)
    .then((res) => res.body.csrf_token);

    const logout = await testSession
    .get('/logout')
    .set('Cookie', sessionID)
    .expect(200);
  });
});

//create a new blog post
describe('Create new blog post', () => {
  let testSession = null;
  let csrfToken;
  let sessionID;
  
  before(async () => {
    testSession = session(app);
    // Generate the current TOTP
    const totp = speakeasy.totp({
      secret: secret,
      encoding: 'base32'
    });    
    const response = await testSession
    .post('/login')
    .send({ email: 'test@email.com', password: 'testPassword10!', secret: secret, totp: totp  })
    .expect(200);
    
    const setCookieHeader = response.headers['set-cookie'];
    sessionID = setCookieHeader.find(cookie => cookie.includes('token='));
    
    csrfToken = await testSession
    .get('/getCSRFToken')
    .set('Cookie', sessionID)
    .expect(200)
    .then((res) => res.body.csrf_token);
  });

  after(async () => {
    const response = await testSession
    .get('/logout')
    .set('Cookie', sessionID)
    .expect(200)
  });
  
  it('unsuccessful post creation, due to no csrf token being provided', async () => {
    const response = await testSession
    .post('/post')
    .set('Cookie', sessionID)
    .send({ title: 'Test Post', postBody: 'Mocha and Chai test post', privatePost: false })
    .expect(403);
    expect(response.body).to.equal('No csrf token provided');
  });
  
  
  it('unsuccessful post creation, due to no incorrect csrf token being provided', async () => {
    const response = await testSession
    .post('/post')
    .set('Cookie', sessionID)
    .send({ title: 'Test Post', postBody: 'Mocha and Chai test post', privatePost: false, csrfToken: "ff7eeb65dfb78db8b9fa88bdaab8da7c233d94f303d96e7221f77d310217cca0" })
    .expect(403);
    expect(response.body).to.equal('Invalid CSRF token');
  });
  
  it('successful post creation', async () => {
    const response = await testSession
    .post('/post')
    .set('Cookie', sessionID)
    .send({ title: 'Test Post', postBody: 'Mocha and Chai test post', privatePost: false, csrfToken: csrfToken })
    .expect(200);
    expect(response.body).to.equal('Post created successfully');
    
    const post = await pool.query('SELECT * FROM post WHERE title = $1', ['Test Post']);
    expect(post.rows.length).to.equal(1);
  });
});


//login to account and try fetch posts from the database
describe('Get Posts', () => {
  let testSession = null;
  let csrfToken;
  let sessionID;
  
  before(async () => {
    testSession = session(app);
    // Generate the current TOTP
    const totp = speakeasy.totp({
      secret: secret,
      encoding: 'base32'
    });
    const response = await testSession
    .post('/login')
    .send({ email: 'test@email.com', password: 'testPassword10!', secret: secret, totp: totp  })
    .expect(200);
    
    const setCookieHeader = response.headers['set-cookie'];
    sessionID = setCookieHeader.find(cookie => cookie.includes('token='));
    
    csrfToken = await testSession
    .get('/getCSRFToken')
    .set('Cookie', sessionID)
    .expect(200)
    .then((res) => res.body.csrf_token);
  });

  
  after(async () => {
    const response = await testSession
    .get('/logout')
    .set('Cookie', sessionID)
    .expect(200)
  });
  
  
  
  it('fetch all posts from database, unsuccessful due to no sessionID cookie', async () => {
    const response = await testSession
    .get('/posts')
    .expect(401);
    expect(response.body.message).to.equal('Unauthorised');
  });
  
  it('fetch all posts from database that are public', async () => {
    const response = await testSession
    .get('/posts')
    .set('Cookie', sessionID)
    .expect(200);
    expect(response.body).to.be.an('array').with.lengthOf(3);
  });
  
  it('search for posts that include the word drones', async () => {
    const response = await testSession
    .get('/posts/Drones')
    .set('Cookie', sessionID)
    .expect(200);
    expect(response.body).to.be.an('array').with.lengthOf(1);
  });
});

//create a new blog post
describe('Editing and deleting a blog post', () => {
  let testSession = null;
  let csrfToken;
  let sessionID;
  let postID;
  
  before(async () => {
    testSession = session(app);
    // Generate the current TOTP
    const totp = speakeasy.totp({
      secret: secret,
      encoding: 'base32'
    });
    const response = await testSession
    .post('/login')
    .send({ email: 'test@email.com', password: 'testPassword10!', secret: secret, totp: totp  })
    .expect(200);
    
    const setCookieHeader = response.headers['set-cookie'];
    sessionID = setCookieHeader.find(cookie => cookie.includes('token='));
    
    csrfToken = await testSession
    .get('/getCSRFToken')
    .set('Cookie', sessionID)
    .expect(200)
    .then((res) => res.body.csrf_token);


    postID = await pool.query('SELECT * FROM post WHERE title = $1', ['Test Post']);
    postID = postID.rows[0];
    
  });

  after(async () => {
    const response = await testSession
    .get('/logout')
    .set('Cookie', sessionID)
    .expect(200)
  });
  
  it('unsuccessful updating post, due to no csrf token being provided', async () => {
    const response = await testSession
    .put('/edit-post')
    .set('Cookie', sessionID)
    .send({ title: 'Update post Title', postBody: 'Mocha and Chai test post update', privatePost: false, postid: postID.id})
    .expect(403);
    expect(response.body).to.equal('No csrf token provided');

    const post = await pool.query('SELECT * FROM post WHERE title = $1', ['Update post Title']);
    expect(post.rows.length).to.equal(0);
  });
  
  
  it('unsuccessful updating post, due to no incorrect csrf token being provided', async () => {
    const response = await testSession
    .put('/edit-post')
    .set('Cookie', sessionID)
    .send({ title: 'Update post Title', postBody: 'Mocha and Chai test post update', privatePost: false, postid: postID.id, csrfToken: "ff7eeb65dfb78db8b9fa88bdaab8da7c233d94f303d96e7221f77d310217cca0" })
    .expect(403);
    expect(response.body).to.equal('Invalid CSRF token');

    const post = await pool.query('SELECT * FROM post WHERE title = $1', ['Update post Title']);
    expect(post.rows.length).to.equal(0);
  });
  
  it('successful updating post', async () => {
    const response = await testSession
    .put('/edit-post')
    .set('Cookie', sessionID)
    .send({ title: 'Update post Title', postBody: 'Mocha and Chai test post update', privatePost: false, postid: postID.id, csrfToken: csrfToken })
    .expect(200);
    expect(response.body).to.equal(`Updated post with ID: ${postID.id}`);
    
    const post = await pool.query('SELECT * FROM post WHERE title = $1', ['Update post Title']);
    expect(post.rows.length).to.equal(1);
  });

  it('unsuccessful delete post, due to no csrf token', async () => {
    const response = await testSession
    .delete('/delete-post')
    .set('Cookie', sessionID)
    .send({ postid: postID.id })
    .expect(403);
    expect(response.body).to.equal('No csrf token provided');
    
    const post = await pool.query('SELECT * FROM post WHERE id = $1', [postID.id]);
    expect(post.rows.length).to.equal(1);
  });

  it('unsuccessful delete post, due to incorrect csrf token', async () => {
    const response = await testSession
    .delete('/delete-post')
    .set('Cookie', sessionID)
    .send({ postid: postID.id, csrfToken: "ff7eeb65dfb78db8b9fa88bdaab8da7c233d94f303d96e7221f77d310217cca0"  })
    .expect(403);
    expect(response.body).to.equal('Invalid CSRF token');
    
    const post = await pool.query('SELECT * FROM post WHERE id = $1', [postID.id]);
    expect(post.rows.length).to.equal(1);
  });

  it('successful delete post', async () => {
    const response = await testSession
    .delete('/delete-post')
    .set('Cookie', sessionID)
    .send({ postid: postID.id, csrfToken: csrfToken  })
    .expect(200);
    expect(response.body).to.equal(`Deleted post with ID: ${postID.id}`);
    
    const post = await pool.query('SELECT * FROM post WHERE id = $1', [postID.id]);
    expect(post.rows.length).to.equal(0);
  });
});

describe('Generating and verifying TOTP instance', () => {
  let testSession = null;
  let csrfToken;
  let sessionID;
  let totpSecret;
  let totpCode;

  before(async () => {
    testSession = session(app);
    const totp = speakeasy.totp({
      secret: secret,
      encoding: 'base32'
    });
    const response = await testSession
    .post('/login')
    .send({ email: 'test@email.com', password: 'testPassword10!', secret: secret, totp: totp  })
    .expect(200);
    
    const setCookieHeader = response.headers['set-cookie'];
    sessionID = setCookieHeader.find(cookie => cookie.includes('token='));
    
    csrfToken = await testSession
    .get('/getCSRFToken')
    .set('Cookie', sessionID)
    .expect(200)
    .then((res) => res.body.csrf_token);
  });

  after(async () => {
    const response = await testSession
    .get('/logout')
    .set('Cookie', sessionID)
    .expect(200)
  });
  
  it('Create TOTP account instance', async () => {
    testSession = session(app);
    const response = await testSession
    .get('/2fa-setup')
    expect(response.body.qrImage).is.a('string');
    expect(response.body.secret).is.a('string');
    totpSecret = response.body.secret;
    // console.log(totpSecret);
  });

  it('Successfully verify and save instance with TOTP code', async () => {
    const totp = speakeasy.totp({
      secret: totpSecret,
      encoding: 'base32'
    });
    const body = {
      secret: totpSecret,
      code: totp
    };
    // console.log(totp)
    const response = await testSession
    .post('/save-auth-code')
    .set('Cookie', sessionID)
    .send({
      secret: totpSecret,
      code: totp,
      user: {username: 'test'}
    })
    // console.log(response.body)
    .expect(200);
    secret = totpSecret;
    
  });

  // it('Unsuccessfully verify and save instance with TOTP code [wrong username]', async () => {
  //   const totp = speakeasy.totp({
  //     secret: totpSecret,
  //     encoding: 'base32'
  //   });
  //   const response = await testSession
  //   .post('/save-auth-code')
  //   .set('Cookie', sessionID)
  //   .send({
  //     secret: totpSecret,
  //     code: totp,
  //     user: {username: 'wrong_username'}
  //   })
  //   .expect(409);
  //   console.log(response.body)
  // });

  it('Unsuccessfully verify and save instance with TOTP code [wrong totp code]', async () => {
    const totp = speakeasy.totp({
      secret: totpSecret,
      encoding: 'base32'
    });
    const response = await testSession
    .post('/save-auth-code')
    .set('Cookie', sessionID)
    .send({
      secret: totpSecret,
      code: "bad code", 
      user: {username: 'test'}
    })
    .expect(401);
  });
});

describe('Locking Account', () => {
  let testSession = null;
  let csrfToken;
  let sessionID;
  
  // before(async () => {
  //   const totp = speakeasy.totp({
  //     secret: secret,
  //     encoding: 'base32'
  //   });
  //   testSession = session(app);
  //   const response = await testSession
  //   .post('/login')
  //   .send({ email: 'test@email.com', password: 'testPassword10!', secret: secret, totp: totp  })
  //   .expect(200);
    
  // });

  // after(async () => {
  //   const response = await testSession
  //   .get('/logout')
  //   .set('Cookie', sessionID)
  //   .expect(200)
  // });
  
  
  it('lock account after 5 incorrect attempts of logging in', async () => {


    for (let i = 0; i < 5; i++) {

      const totp = speakeasy.totp({
        secret: secret,
        encoding: 'base32'
      });
      testSession = session(app);
      const response = await testSession
      .post('/login')
      .send({ email: 'test@email.com', password: 'incorrectPassword10!', secret: secret, totp: totp  })
      .expect(409);
      
      expect(response.body.message).to.equal('Error with authentication');

    }

    const totp = speakeasy.totp({
      secret: secret,
      encoding: 'base32'
    });
    testSession = session(app);
    const response = await testSession
    .post('/login')
    .send({ email: 'test@email.com', password: 'incorrectPassword10!', secret: secret, totp: totp  })
    .expect(401);
    
    expect(response.body.message).to.equal('Account locked. Please try again in 30 minutes');

    const lockedAccount = await pool.query('SELECT * FROM account WHERE email = $1', [CryptoJS.AES.encrypt('test@email.com', crykey,{ iv: iv }).toString()]);
    expect(lockedAccount.rows[0].incorrect_attempts).to.equal(5);
    expect(lockedAccount.rows[0].locked).to.equal(true);
    expect(lockedAccount.rows[0].locked_until).not.to.be.null;


    const unlockAccount = await pool.query('UPDATE account SET incorrect_attempts = $1, locked = $2, locked_until = $3 WHERE email = $4', [0, false, null, CryptoJS.AES.encrypt('test@email.com', crykey,{ iv: iv }).toString()]);

    
  }).timeout(10000);;
  
});

describe('Deleting Account', () => {
  let testSession = null;
  let csrfToken;
  let sessionID;
  
  before(async () => {
    const totp = speakeasy.totp({
      secret: secret,
      encoding: 'base32'
    });
    testSession = session(app);
    const response = await testSession
    .post('/login')
    .send({ email: 'test@email.com', password: 'testPassword10!', secret: secret, totp: totp  })
    .expect(200);
    
    const setCookieHeader = response.headers['set-cookie'];
    sessionID = setCookieHeader.find(cookie => cookie.includes('token='));
    
    csrfToken = await testSession
    .get('/getCSRFToken')
    .set('Cookie', sessionID)
    .expect(200)
    .then((res) => res.body.csrf_token);
  });

  after(async () => {
    const response = await testSession
    .get('/logout')
    .set('Cookie', sessionID)
    .expect(200)
  });
  
  
  it('unsuccessful attempt to delete user because of wrong password', async () => {
    const response = await testSession
    .delete('/delete-account')
    .set('Cookie', sessionID)
    .send({ password: 'incorrectpassword', csrfToken: csrfToken})
    .expect(401);
    
    expect(response.body).to.equal('Invalid password');
    
    
    const user = await pool.query('SELECT * FROM account WHERE username = $1', [CryptoJS.AES.encrypt('test', crykey,{ iv: iv }).toString()]);
    expect(user.rows.length).to.equal(1);
    
  });
  
  it('delete user succesfully by entering correct account password', async () => {
    const response = await testSession
    .delete('/delete-account')
    .set('Cookie', sessionID)
    .send({ password: 'testPassword10!', csrfToken: csrfToken})
    .expect(200);
    
    expect(response.body).to.equal("Account deleted successfully");
    
    
    const user = await pool.query('SELECT * FROM account WHERE username = $1', [CryptoJS.AES.encrypt('test', crykey,{ iv: iv }).toString()]);
    expect(user.rows.length).to.equal(0);
    
  });
});

} 
else {
  console.log("trying to run tests on production database, change .ENV variable to run tests on test database");
};





