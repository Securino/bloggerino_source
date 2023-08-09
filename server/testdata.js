const pool = require('./db');
const bcrypt = require('bcrypt');
const CryptoJS = require("crypto-js");
const crykey = CryptoJS.enc.Hex.parse("000102030405060708090a0b0c0d0e0f");
const iv = CryptoJS.enc.Hex.parse("101112131415161718191a1b1c1d1e1f");


//reset database
const createTables = async () => {

    try {
        // Drop all tables
        await pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        console.log('All tables dropped successfully.');
      } catch (err) {
        console.error(err);
      }


    try {
        
        await pool.query(`
        CREATE TABLE account (
            ID SERIAL PRIMARY KEY,
            Username VARCHAR(100) UNIQUE,
            Email VARCHAR(100) UNIQUE,
            Password VARCHAR(100),
            auth_secret VARCHAR(100) UNIQUE,
            incorrect_attempts INTEGER NOT NULL DEFAULT 0,
            locked BOOLEAN NOT NULL DEFAULT false,
            locked_until TIMESTAMP
        );

        CREATE TABLE post (
                ID SERIAL PRIMARY KEY,
                Title VARCHAR(40),
                Body VARCHAR(4000),
                postDate DATE,
                postTime TIME,
                Private BOOLEAN,
                AccountID INTEGER,
                FOREIGN KEY (AccountID) REFERENCES account(ID) ON DELETE CASCADE
        );

        CREATE TABLE post_comment (
                        ID SERIAL PRIMARY KEY,
                        Body VARCHAR(4000),
                        commentDate DATE,
                        commentTime TIME,
                        Private BOOLEAN,
                        AccountID INTEGER,
                        PostID INTEGER,
                        FOREIGN KEY (postID) REFERENCES post(ID) ON DELETE CASCADE,
                        FOREIGN KEY (AccountID) REFERENCES account(ID) ON DELETE CASCADE
        );
        
        
        CREATE TABLE csrf_tokens (
            session_id VARCHAR(255) PRIMARY KEY,
            csrf_token VARCHAR(255) UNIQUE
        );
        
        `)

        console.log("Table successfully created")
        return;
        
    } catch (error) {
        console.log("Tables already exist");
    }
        
}

const createAccounts = async (accountObject) => {

    try {

        for (let accountIndex in accountObject.accounts) {
            let account = accountObject.accounts[accountIndex];
            console.log(`Username: ${account.username}, Email: ${account.email}`);

            const hashEmail = CryptoJS.AES.encrypt(account.email, crykey,{ iv: iv }).toString();
            const hashUsername = CryptoJS.AES.encrypt(account.username, crykey,{ iv: iv }).toString();
            const hashAuthCode = await bcrypt.hash(account.auth_secret, 10);
            const AuthCode = account.auth_secret
            const existingUser = await pool.query("SELECT * FROM account WHERE username = $1 OR email = $2", [hashUsername,hashEmail]);
            if(existingUser.rows[0]){
                throw new Error('Username, email or second email already taken');
            }
            const hashedPassword = await bcrypt.hash(account.password, 10);
    
            const createAccount = await pool.query("INSERT INTO account (username,email,password,auth_secret) VALUES($1, $2, $3, $4) RETURNING *", [hashUsername,hashEmail,hashedPassword, AuthCode]);
          }

          console.log("Accounts created")

          return;
        
    } catch (error) {
        console.error(error);
    }

}

const createTestData = async () => {

    try {
        
        await pool.query(`

        INSERT INTO post (Title, Body, postDate, postTime, Private, AccountID)
        VALUES ('Rugby for life', 'every since I was young rugby has been the only sport for me', '2022-01-01', '09:00:00', false, 2),
       ('Toy story 2 was the best toy sotry movie', 'Every since i watched toy story for the first time I have been obsessed with it', '2022-01-02', '10:00:00', true, 3),
       ('Drones are super cool', 'They fly super high in the sky and go really fast', '2022-01-03', '11:00:00', false, 4);

        INSERT INTO post_comment (Body, commentDate, commentTime, Private, AccountID, PostID)
        VALUES ('Those rugby legs are the biggest quads I have ever seen ', '2022-01-01', '10:00:00', false, 3, 1),
       ('Personally, i think cars is the best movive franchise', '2022-01-02', '11:00:00', false, 1, 2),
       ('Brb gotta go gym and do 6000 squats', '2022-01-02', '11:00:00', false, 1, 1),
       ('Speed boats are cooler', '2022-01-03', '12:00:00', false, 2, 3);
       
       
       `)

        console.log("data successfully created")
        
    } catch (error) {
        console.log("Error trying to make test data");
    }
        


}

const accountObject = {
    "accounts": [
        {
            "username": "harryR",
            "email": "harryR@email.com",
            "password": "sugar123",
            "auth_secret": "I5DGWYTIMRTXCWSA",
        },
        {
            "username": "zakb",
            "email": "zakb@email.com",
            "password": "massiverugbylegs",
            "auth_secret": "I5DGWYTIMRTXCWSB"
        },
        {
            "username": "andyN",
            "email": "andyN@email.com",
            "password": "ilovewoody",
            "auth_secret": "I5DGWYTIMRTXCWSC"
        },
        {
            "username": "finM",
            "email": "finM@email.com",
            "password": "ilovedrones",
            "auth_secret": "I5DGWYTIMRTXCWSD"
        }
]
}

const main = async () => {
    try {
      await createTables();
      await createAccounts(accountObject);
      await createTestData();
      process.exit(0);
    } catch (error) {
      console.error(error);
    }
  }
  
main();




