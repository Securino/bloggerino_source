CREATE DATABASE bloggerino;

-- psql -U postgres
--\l lists all databases in postgres
--\c into bloggerino
--\dt - shows tables in database
-- DROP DATABASE <Datbase name>;
-- DROP TABLE <Table name>;

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