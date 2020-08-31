USE cms_db;

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Francis", "Anyaegbu", 1, 1);
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Ugochukwu", "Anyaegbu", 2, 3);

INSERT INTO department (department_name)
VALUES ("Engineering");
INSERT INTO department (department_name)
VALUES ("Sales");

INSERT INTO manager (manager_name)
VALUES ("Anyaegbu Ifesinachi");
INSERT INTO manager (manager_name)
VALUES ("Anyaegbu Obi");

INSERT INTO role (job_title, salary, department_id)
VALUES ("Lead Engineer", 150000, 1);
INSERT INTO role (job_title, salary, department_id)
VALUES ("Sales Person", 200000, 2);

-- ALL Employee Query--
SELECT employee_id, first_name, last_name, job_title, department_name, salary, manager_name
FROM employee
INNER JOIN role ON employee.role_id=role.role_id
INNER JOIN department ON role.department_id=department.department_id

--Query Employees by Department--
SELECT first_name 'First Name', last_name 'Last Name'
FROM employee
INNER JOIN role ON employee.role_id=role.role_id
INNER JOIN department ON role.department_id=department.department_id
where department_name='Engineering'


--Query Employees by Manager
SELECT first_name 'First Name', last_name 'Last Name'
FROM employee
INNER JOIN manager ON employee.manager_id=manager.manager_id
WHERE manager_name = 'Anyaegbu Ifesinachi'







