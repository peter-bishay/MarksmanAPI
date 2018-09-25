CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username varchar(255) NOT NULL,
    password varchar(255) NOT NULL,
    email varchar(255) NOT NULL
);

CREATE TABLE subjects (
    id SERIAL PRIMARY KEY,
    user_id int REFERENCES users (id) ON DELETE CASCADE,
    name varchar(255) NOT NULL,
    goal_mark int NOT NULL
);

CREATE TABLE assessments (
	id SERIAL PRIMARY KEY,
	subject_id int REFERENCES subjects (id) ON DELETE CASCADE,
	name varchar(255) NOT NULL,
	total_mark int NOT NULL,
	actual_mark int NOT NULL,
	goal_mark int NOT NULL,
	weight int NOT NULL
);

CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    user_id int REFERENCES users (id) ON DELETE CASCADE,
    task_description varchar(255) NOT NULL,
    complete boolean NOT NULL,
    due_date DATE NOT NULL
);