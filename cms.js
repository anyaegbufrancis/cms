var mysql = require("mysql");
var inquirer = require("inquirer");
const cTable = require('console.table');


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
        "View All Employees",
        "View All Employees by Department",
        "View All Employees by Manager",        
        "View All Roles",
        "Add Employee",        
        "Add Roles",
        "Update Employee Role",
        "Update Employee Manager",        
        "Remove Employee",
        "Remove Roles"
      ]
    })
    .then(function(answer) {
      switch (answer.action) {
      case "View All Employees":
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

function employeeView (answer) {
      console.log("Building output...\n");
      var query = "select employee_id, first_name, last_name, job_title, department_name, salary, manager_name ";
          query += "from employee ";
          query += "inner join role on employee.role_id=role.role_id "
          query += "inner join department on role.department_id=department.department_id "
          query += "inner join manager on employee.manager_id=manager.manager_id ";
      console.log("\nLIST OF EMPLOYEES\n")
      connection.query(query, function(err, res) {
       if (err) throw err
        console.table(res)
       // runSearch()
       connection.end();
      });
    };
    
    



