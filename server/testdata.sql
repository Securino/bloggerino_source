-- sample data for Account table
INSERT INTO account (Username, Email, Second_email, Password, isAdmin)
VALUES ('harryR', 'harryR@email.com', 'harryR.alt@example.com', 'sugar123', false, "harryR_secret_code"),
       ('zakb', 'zakb@email.com', 'zakb.alt@example.com', 'massiverugbylegs', true, "zakb_secret_code"),
       ('andyN', 'andyN@email.com', 'andyN.alt@example.com', 'ilovewoody', false, "andyN_secret_code"),
       ('finM', 'finM@email.com', 'finM.alt@example.com', 'ilovedrones', false, "finM_secret_code");

-- Sample data for Post table
INSERT INTO post (Title, Body, postDate, postTime, Private, AccountID)
VALUES ('Rugby for life', 'every since I was young rugby has been the only sport for me', '2022-01-01', '09:00:00', false, 2),
       ('Toy story 2 was the best toy story movie', 'Every since i watched toy story for the first time I have been obsessed with it', '2022-01-02', '10:00:00', true, 3),
       ('Drones are super cool', 'They fly super high in the sky and go really fast', '2022-01-03', '11:00:00', false, 4);

-- Sample data for Post Comment table
INSERT INTO post_comment (Body, commentDate, commentTime, Private, AccountID, PostID)
VALUES ('Those rugby legs are the biggest quads I have ever seen ', '2022-01-01', '10:00:00', false, 3, 1),
       ('Personally, i think cars is the best movive franchise', '2022-01-02', '11:00:00', false, 1, 2),
       ('Brb gotta go gym and do 6000 squats', '2022-01-02', '11:00:00', false, 1, 1),
       ('Speed boats are cooler', '2022-01-03', '12:00:00', false, 2, 3);
