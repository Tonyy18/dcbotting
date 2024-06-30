CREATE TABLE users (
    id int NOT NULL AUTO_INCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    picture TEXT NULL,
    PRIMARY KEY (id)
);
CREATE TABLE bots (
    id int NOT NULL AUTO_INCREMENT,
    creator int NOT NULL,
    name TEXT NOT NULL,
    picture TEXT NULL,
    data TEXT NOT NULL,
    public BOOLEAN DEFAULT true NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (creator) REFERENCES users(id)
);
CREATE TABLE methods (
    id int NOT NULL AUTO_INCREMENT,
    name TEXT NOT NULL,
    data TEXT NOT NULL,
    PRIMARY KEY (id)
);
CREATE TABLE events (
    id int NOT NULL AUTO_INCREMENT,
    name TEXT NOT NULL,
    data TEXT NOT NULL,
    PRIMARY KEY (id)
);