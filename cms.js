var mysql = require("mysql");
var inquirer = require("inquirer");
const cTable = require('console.table');
const colors = require("colors");


var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "root",
  database: "cms_db"
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId + "\n");
  runSearch();
});

function runSearch() {
  inquirer
    .prompt({
      name: "action",
      type: "list",
      message: "What would you like to do?",
      choices: [
        "View Employees, Roles, Departments or Managers",
        "Add Employee",        
        "Add Roles",
        "Update Employee Role",
        "Update Employee Manager",        
        "Remove Employee",
        "Remove Roles",
        "EXIT"
      ],
      
      name: "view",
      type: "list",
      message: "What do you like to view?",
      when: (response) => response.action === "View Employees, Roles, Departments or Managers", 
      choices: [
        "Employee Data",
        "Roles, Managers or Departments"
      ],
      
      name: "employee",
      type: "list",
      message: "What Employee data do you want to view?",
      when: (response) => response.view === "Employee Data",
      choices: [
        "ALL Employees",
        "Employees by Department",
        "Employees by Manager",
        "Employees by Job Title",
      ], 
      
      name: "rmd",
      type: "list",
      message: "Please select which data you like to view?",
      when: (response) => response.view === "Roles, Managers or Departments",
      choices: [
        "Roles",
        "Department",
        "Manager"
      ]
    })
    
    .then(function(answer) {
      switch (answer.action) {
      case "All Employees":
        employeeView();
        break;

      case "View All Employees by Department":
        employeeByDepartment();
        break;

      case "View All Employees by Manager":
        employeeByManager();
        break;

      case "View All Roles":
        viewRoles();
        break;

      case "Add Employee":
        addEmployee();
        break;
        
      case "Add Roles":
        addRoles();
        break;
        
      case "Update Employee Role":
        updateRole();
        break;
        
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

function employeeView () {
      console.table("Building output...\n");
      var query = "SELECT employee_id ID, first_name 'First Name', last_name 'Last Name', job_title 'Title', department_name 'Department', salary 'Salary', manager_name 'Manager' ";
          query += "FROM employee ";
          query += "INNER JOIN role ON employee.role_id=role.role_id "
          query += "INNER JOIN department ON role.department_id=department.department_id "
          query += "INNER join manager on employee.manager_id=manager.manager_id ";
      console.log("\n*********************************[ LIST OF EMPLOYEES ]********************************\n".yellow)
      connection.query(query, function(err, res) {
       if (err) throw err
        console.table(res)
       // runSearch()
       connection.end();
      });
    };
    
    



