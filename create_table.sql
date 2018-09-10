CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username varchar(255) NOT NULL,
    password varchar(255) NOT NULL,
    email varchar(255) NOT NULL
);

CREATE TABLE subjects (
    id SERIAL PRIMARY KEY,
    user_id int REFERENCES users (id),
    name varchar(255) NOT NULL,
    goal_mark int NOT NULL
);