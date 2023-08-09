# Bloggerino

Welome to bloggerino, this repository contains the code of our secure Blog app, which protects againsts the following cyber security risks:

Note for best compatibility run with Google Chrome

- Session hijacking
- Account enumeration
- SQL injection
- Cross-site scripting
- Cross-site request forgery
- Brute force attacks

This application runs the frontend and backend separately. The frontend aplication was built using the React framework and the backend application was built using Node.js, Express.js and Postgres.

The frontend code for this project can be found in the client directory and the server side code is located in the server directory.

## Getting started

To get started with our application, ensure that you have the following software installed on your computer:
- Node.js
- Postgres
- npm

TO run our application, follow the steps outlined below:


1. The blog application can be configured to connect to different databases through a .ENV file. Therefore create a .ENV file in the root server directory with the following variables:

 - DATABASE = //use 'test' to run the test database and 'production' for the live application database
 - DATABASE_PASSWORD = //your postgres database password
 - SECRET_KEY = //enter any secure secret key

2. Open two separate terminals, and in the first terminal navigate to the client directory and in the second terminal navigate to the server directory and run the command npm install in both terminals to install the following dependencies required for this application.

3. Create two different postgres databases on your machine. The first being called bloggerino and the second bloggerino_test

4. In the second terminal, which is currently located in the server directory run the following command node testdata.js. This will create all the required tables for the applications database. Do this for both the test and production databases.

5. In the first terminal, start the frontend server by running the command npm start. This will run the frontend server by default on port 3000.

6. In the second terminal, start the backend server by also running the command npm start. This will run the backend server by default on port 5001.

7. Once both the frontend and backend servers are running, you can access the Blog App in your web browser at http://localhost:3000.

8. To run our unit tests on the backend code, set the DATABASE variable in the .ENV to 'test', next in the terminal that is located at the root of the server directory run the node testdata.js command to reset the test database and insert test data. Finally, run the command npm test to run our Mocha and Chai tests.
