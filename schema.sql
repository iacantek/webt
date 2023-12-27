CREATE DATABASE webt;

USE webt;

CREATE TABLE calculation
(
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    birthday DATE,
    gender INT,
    height FLOAT,
    weight FLOAT,
    bmi FLOAT
);