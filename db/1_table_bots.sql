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