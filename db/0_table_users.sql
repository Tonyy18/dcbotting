CREATE TABLE users (
    id int NOT NULL AUTO_INCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    picture TEXT NULL,
    PRIMARY KEY (id)
);