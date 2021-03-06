DROP DATABASE IF EXISTS cms_db;
CREATE DATABASE cms_db;
USE cms_db;
CREATE TABLE employee (
  employee_id int AUTO_INCREMENT NOT NULL,
  first_name varchar(30) NOT NULL,
  last_name varchar(30) NOT NULL,
  role_id int NOT NULL,
  manager_name varchar(30) NOT NULL,
  PRIMARY KEY(employee_id)
);
CREATE TABLE department (
  department_id int AUTO_INCREMENT NOT NULL,
  department_name varchar(30) NOT NULL,
  PRIMARY KEY(department_id)
);
CREATE TABLE role (
  role_id int AUTO_INCREMENT NOT NULL,
  job_title varchar(30) NOT NULL,
  salary decimal NOT NULL,
  department_id int NOT NULL,
  PRIMARY KEY(role_id)
);

--Add Foreign Keys to Employee
ALTER TABLE employee 
	ADD CONSTRAINT fk_role_id
	FOREIGN KEY(role_id) REFERENCES role(role_id); 
    
ALTER TABLE role 
	ADD CONSTRAINT fk_department_id
	FOREIGN KEY(department_id) REFERENCES department(department_id)

