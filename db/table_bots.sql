CREATE TABLE bots (
    id int NOT NULL AUTO_INCREMENT,
    name TEXT NOT NULL,
    picture TEXT NULL,
    data TEXT NOT NULL,
    public int DEFAULT 1 NOT NULL,
    PRIMARY KEY (id)
);