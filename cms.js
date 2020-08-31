//Dependencies
var mysql = require("mysql");
var inquirer = require("inquirer");
const cTable = require("console.table");
const colors = require("colors");

//Set up SQL connection
var connection = mysql.createConnection({
  host: "127.0.0.1",

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
  mainEnteryPoint();
});

//Main Inquirer Entry Point. Breaks prompts into blocks.
function mainEnteryPoint() {
  inquirer
  //Main Block of Questions
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
      
      //Employee, Roles, Managers & Department Entry Point Questions
      {
        name: "data",
        type: "list",
        message: "What do you like to view?",
        when: (response) =>
          response.data === "View Employees, Roles, Departments or Managers",
        choices: ["Employee Details", "Roles, Managers or Departments"],
      },

      //Employee specific Questions
      {
        name: "data",
        type: "list",
        message: "What Employee data do you want to view?",
        when: (response) => response.data === "Employee Details",
        choices: [
          "ALL Employee Details",
          "Employees by Department",
          "Employees by Manager",
          "Employees by Job Title",
        ],
      },
      
      //Non Employee Specific Questions
      {
        name: "data",
        type: "list",
        message: "Please select which data you like to view?",
        when: (response) => response.data === "Roles, Managers or Departments",
        choices: ["View ALL Roles", "View ALL Departments", "View ALL Managers"],
      },
    ])
    
    //Capture each first level response. Some final level questions passed to function level inquirer
    .then( answer => {
      switch (answer.data) {
        // Block Query No 1 (Employees, Roles, Managers & Department) Cases Begins
        //Each Final respons calls relevant function
        case "ALL Employee Details":
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
        // Block Query No 1 (Employees, Roles, Managers & Department) Cases Ends Here
        
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

//Function that Queries Employee database
 employeeView= () => {
  console.table("\nBuilding output...\n".green);
  let query = "SELECT employee_id ID, first_name 'First Name', last_name 'Last Name', job_title 'Title', department_name 'Department', salary 'Salary', manager_name 'Manager' ";
  query += "FROM employee ";
  query += "INNER JOIN role ON employee.role_id=role.role_id ";
  query += "INNER JOIN department ON role.department_id=department.department_id ";
  query += "INNER join manager on employee.manager_id=manager.manager_id ";
  console.log("\n*********************************[ LIST OF ALL EMPLOYEES DETAILS]********************************\n".yellow
  );
  
  //Print Response to terminal table
  connection.query(query,  (err, res) => {
    if (err) throw err;
    console.table(res);
    // runSearch()
    connection.end();
  });
}

//Function that queries existing Department names, return them to inquirer prompt 
//and use user's selection to generate employees in that department.
employeeByDepartment = () => {
  console.log("\nBuilding output...\n".green);
  var query = "SELECT department_name from department"
  // console.log(
  //   "\n*********************************[ PRESENT LISTED DEPARTMENTS ]********************************\n".yellow
  // );   
  connection.query(query, function (err, res) {
    if (err) throw err;
    //Use ES6 filter to extract department_name array
      let departmentArray = res.map(res => res["department_name"]);  
      //console.log(departmentArray) 
    inquirer.prompt([
      {
        name: "dept",
        type: "list",
        message: "What Department Employees do you want to view?".red,
        //Parses department name array to prompt
        choices: departmentArray
      }      
    ]) .then( answer => {
          //function to return matching users here
          console.table("\nBuilding output...\n".green);
          let query = "SELECT first_name 'First Name', last_name 'Last Name' ";
          query += "FROM employee ";
          query += "INNER JOIN role ON employee.role_id=role.role_id ";
          query += "INNER JOIN department ON role.department_id=department.department_id ";
          query += "where department_name=" + "'" + answer.dept + "'";
          console.log("\n***************************[ LIST EMPLOYEES IN ".yellow + colors.green(answer.dept) + " DEPARTMENT]***************************\n".yellow
          );          
          //Print Response to terminal table
          connection.query(query,  (err, res) => {
            if (err) throw err;
            console.table(res);
            // runSearch()
            connection.end();
          });
      
    })
    })   
  };


