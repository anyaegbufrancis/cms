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
          "Add Employee, Roles, Departments",
          "Update Employee Details",
          "Remove Employee, Department or Roles",
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
      
       //Employee, Roles, Managers & Department Entry Point Questions
       {
        name: "data",
        type: "list",
        message: "What new entity do you want to add?",
        when: (response) =>
          response.data === "Add Employee, Roles, Departments",
        choices: ["Add New Employee", "Add New Role", "Add New Department"],
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

        case "View ALL Roles":
          allRoles();
          break;

        case "View ALL Departments":
          allDepartments();
          break;

        case "View ALL Managers":
          allManagers();
          break;
        // Block Query No 1 (Employees, Roles, Managers & Department) Cases Ends Here
        
        //*****************************************************************************//
        
        //Block Query No 2 (Add Cases Begins) Cases Begins Here
        case "Add New Employee":
          addNewEmployee();
          break;

        case "Add New Role":
          addNewRole();
          break;

        case "Add New Department":
          addNewDepartment();
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
  query += "INNER JOIN department ON role.department_id = department.department_id ";
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
  connection.query(query, function (err, res) {
    if (err) throw err;
    //Use ES6 filter to extract department_name array
      let departmentArray = res.map(res => res["department_name"]);  
      //console.log(departmentArray) 
    inquirer.prompt([
      {
        name: "dept",
        type: "list",
        message: "What Department Employees do you want to view?",
        //Parses department name array to prompt
        choices: departmentArray
      }      
    ]) .then( answer => {
          //function to return matching users here
          console.table("\nBuilding output...\n".green);
          let query = "SELECT first_name 'First Name', last_name 'Last Name' ";
          query += "FROM employee ";
          query += "INNER JOIN role ON employee.role_id=role.role_id ";
          query += "INNER JOIN department ON role.department_id = department.department_id ";
          query += "WHERE department_name=" + "'" + answer.dept + "'";
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


//Function that queries existing Manager names, return them to inquirer prompt 
//and use user's selection to generate employees under the Manager's Leadership.
employeeByManager = () => {
  console.log("\nBuilding output...\n".green);
  //var query = "SELECT manager_name FROM employee" 
  let query = "SELECT manager_name FROM employee ";
      query += "WHERE manager_name != 'None' AND manager_name != ''";
  connection.query(query, function (err, res) {
    if (err) throw err;
    //Use ES6 filter to extract department_name array
      let managerArray = res.map(res => res["manager_name"]);  
      //console.log(managerArrayArray) 
    inquirer.prompt([
      {
        name: "dept",
        type: "list",
        message: "Which Manager do you want to see their team members",
        //Parses department name array to prompt
        choices: managerArray
      }      
    ]) .then( answer => {
          //function to return matching users here
          console.table("\nBuilding output...\n".green);
          let query = "SELECT first_name 'First Name', last_name 'Last Name' ";
          query += "FROM employee ";
          query += "WHERE manager_name=" + "'" + answer.dept + "'";
          console.log("\n***************************[ LIST EMPLOYEES MANAGER BY ".yellow + colors.green(answer.dept) + " ]***************************\n".yellow
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

//Function that queries existing Job Roles, return them to inquirer prompt 
//and use user's selection to generate Employees Under the selected job title.
viewJobTitle = () => {
  console.log("\nBuilding output...\n".green);
  let query = "SELECT job_title FROM role" 
  connection.query(query, function (err, res) {
    if (err) throw err;
    //Use ES6 filter to extract department_name array
      let jobTitleArray = res.map(res => res["job_title"]);  
      //console.log(jobTitleArrayArray) 
    inquirer.prompt([
      {
        name: "dept",
        type: "list",
        message: "Which Job Title do you want present Employees",
        //Parses department name array to prompt
        choices: jobTitleArray
      }      
    ]) .then( answer => {
          //function to return matching users here
          console.table("\nBuilding output...\n".green);
          let query = "SELECT first_name 'First Name', last_name 'Last Name' ";
          query += "FROM employee ";
          query += "INNER JOIN role ON employee.role_id = role.role_id ";
          query += "WHERE job_title=" + "'" + answer.dept + "'";
          console.log("\n***************************[ LIST EMPLOYEES WITH JOB TITLE ".yellow + colors.green(answer.dept) + " ]***************************\n".yellow
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

//Function that queries existing Roles, and returns a list of all existing roles
allRoles = () => {
  console.log("\nBuilding output...\n".green);
  let query = "SELECT role_id 'ID', job_title 'Job Title'  FROM role" 
  connection.query(query, function (err, res) {
    if (err) throw err;
    //Use ES6 filter to extract department_name array  
      console.log("\n***************************[ LIST OF ALL EXISTING ROLES]***************************\n".yellow
      );
      console.table(res)
      connection.end();
    })  
  };

//Function that queries existing Managers and returns a list of all Managers
allManagers = () => {
  console.log("\nBuilding output...\n".green);
  let query = "SELECT employee_id 'ID', manager_name 'Manager Names(s)' " 
      query += "FROM employee ";
      query += "WHERE manager_name != 'None' AND manager_name != ''";
  connection.query(query, function (err, res) {
    if (err) throw err;
    //Use ES6 filter to extract department_name array  
      console.log("\n***************************[ LIST OF ALL MANAGERS]***************************\n".yellow
      );
      console.table(res)
      connection.end();
    })  
  };

//Function that queries ALL Departments, and returns a list of all existing departments
allDepartments = () => {
  console.log("\nBuilding output...\n".green);
  let query = "SELECT department_id 'ID', department_name 'Department Name(s)' " 
      query += "FROM department ";
  connection.query(query, function (err, res) {
    if (err) throw err;
      console.log("\n***************************[ LIST OF ALL DEPARTMENTS]***************************\n".yellow
      );
      console.table(res)
      connection.end();
    })  
  };

//**************************************************************************************************************** */

//Add New Employee Functions
addNewEmployee = () => {  
  //SQL Query to return Managers ONLY
  let query = "SELECT job_title, department_name, manager_name " 
  query += "FROM employee ";
  query += "INNER JOIN role ON employee.role_id=role.role_id ";
  query += "INNER JOIN department ON role.department_id=department.department_id ";
connection.query(query, function (err, res) {
if (err) throw err;
//Sort Array to return only values for manager_name in Array
    let  managerArray = res.map(res => res["manager_name"])
    //Remove duplicate Manager Name
    managerArray = [...new Set(managerArray)]
   // console.log(managerArray)
    //Add 'None' to the Array
    managerArray.push('Add Manager', 'None')
    
//Sort Array to return only values for manager_name in Array
let  jobTitleArray = res.map(res => res["job_title"])
//Remove duplicate Job Titles
jobTitleArray = [...new Set(jobTitleArray)]
//Add 'Add' Option to the Array
jobTitleArray.push('Add Job Title')
//console.log(jobTitleArray)

//Find the Department for the matching job title 
let department = res.find(x => x.job_title === "Lead Engineer")
department = department.department_name

    //Call inquirer prompt to receive user parameters
    inquirer.prompt([
      {
        name: "first_name",
        type: "input",
        message: "Employee First Name: "
      },
      {
        name: "last_name",
        type: "input",
        message: "Employee Last Name Name: "
      },
      {
        name: "job_title",
        type: "list",
        message: "Select Employee job title (Please select 'None' Employee without a Manager): ",
        //Parses Existing Manager names array to prompt
        choices: jobTitleArray
      }, 
      {
        name: "salary",
        type: "input",
        message: "Employee Salary(format: 5000): "
      },    
      {
        name: "manager_name",
        type: "list",
        message: "Select Manager(Please select 'None' Employee without a Manager): ",
        //Parses Existing Manager names array to prompt
        choices: managerArray
      }             
      
    ]) .then( answer => {
          //Switch cases for employee add.
          switch (answer) {
            //First case to add new
            case "Add Manager":
              //employeeView();
              break;
            case "Add Title":
            //employeeView();
            break;
    
            default:
              console.log(answer);
              
              break;
          } 
          console.table("\nBuilding output...\n".green);
          let query = "SELECT first_name 'First Name', last_name 'Last Name' ";
          query += "FROM employee ";
          query += "INNER JOIN role ON employee.role_id = role.role_id ";
          query += "WHERE job_title=" + "'" + answer.dept + "'";
          console.log("\n***************************[ LIST EMPLOYEES WITH JOB TITLE ".yellow + colors.green(answer.dept) + " ]***************************\n".yellow
          );          
          //Print Response to terminal table
          connection.query(query,  (err, res) => {
            if (err) throw err;
            console.table(res);
            // runSearch()
            connection.end();
          });
    })
    })}
  



