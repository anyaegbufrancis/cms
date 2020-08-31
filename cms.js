var mysql = require("mysql");
var inquirer = require("inquirer");
const cTable = require("console.table");
const colors = require("colors");

var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "root",
  database: "cms_db",
});

connection.connect(function (err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId + "\n");
  runSearch();
});

function runSearch() {
  inquirer
    .prompt([
      {
        name: "data",
        type: "list",
        message: "What would you like to do?",
        choices: [
          "View Employees, Roles, Departments or Managers",
          "Add Employee, Roles, Departments or Managers",
          "Update Employee Role",
          "Update Employee Manager",
          "Remove Employee",
          "Remove Roles",
          "EXIT",
        ],
      },
      {
        name: "data",
        type: "list",
        message: "What do you like to view?",
        when: (response) =>
          response.data === "View Employees, Roles, Departments or Managers",
        choices: ["Employee Details", "Roles, Managers or Departments"],
      },

      {
        name: "data",
        type: "list",
        message: "What Employee data do you want to view?",
        when: (response) => response.data === "Employee Details",
        choices: [
          "ALL Employees",
          "Employees by Department",
          "Employees by Manager",
          "Employees by Job Title",
        ],
      },

      {
        name: "data",
        type: "list",
        message: "Please select which data you like to view?",
        when: (response) => response.data === "Roles, Managers or Departments",
        choices: ["View ALL Roles", "View ALL Departments", "View ALL Managers"],
      },
    ])

    .then(function (answer) {
      switch (answer.data) {
        // Block Query No 1 Begins
        case "ALL Employees":
          employeeView();
          break;

        case "Employees by Department":
          employeeByDepartment();
          break;

        case "Employees by Manager":
          employeeByManager();
          break;

        case "Employees by Job Title":
          viewJobTitle();
          break;

        case "Roles":
          allRoles();
          break;

        case "Department":
          addDepartments();
          break;

        case "Manager":
          allManagers();
          break;
        // Block Query No 1 Ends.....//
        //*******Add Cases Begins** */
        case "Update Employee Manager":
          updateManager();
          break;

        case "Remove Employee":
          removeEmployee();
          break;

        case "Remove Roles":
          removeRoles();
          break;
      }
    });
}

function employeeView() {
  console.table("Building output...\n");
  var query =
    "SELECT employee_id ID, first_name 'First Name', last_name 'Last Name', job_title 'Title', department_name 'Department', salary 'Salary', manager_name 'Manager' ";
  query += "FROM employee ";
  query += "INNER JOIN role ON employee.role_id=role.role_id ";
  query += "INNER JOIN department ON role.department_id=department.department_id ";
  query += "INNER join manager on employee.manager_id=manager.manager_id ";
  console.log("\n*********************************[ LIST OF EMPLOYEES ]********************************\n".yellow
  );
  
  connection.query(query, function (err, res) {
    if (err) throw err;
    console.table(res);
    // runSearch()
    connection.end();
  });
}

function employeeByDepartment() {
  console.table("Building output...\n");
  var query = "SELECT department_name from department"
  console.log(
    "\n*********************************[ EMPLOYEES BY DEPARTMENT ]********************************\n".yellow
  );   
  connection.query(query, function (err, res) {
    if (err) throw err;
      let departmentArray = res.map(res => res["department_name"])
     // console.log(departmentArray)      
    inquirer.prompt([
      {
        name: "dept",
        type: "list",
        message: "What Department Employees do you want to view?".red,
        choices: departmentArray
      } 
    ])
    connection.end();
    })   
  };


