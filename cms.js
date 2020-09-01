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
  //console.clear()
  inquirer
  //Main Block of Questions
    .prompt([
      {
        name: "data",
        type: "list",
        message: "What would you like to do?".magenta,
        choices: [
          "VIEW     --  <<Employees, Roles, Departments or Managers>>".yellow,
          "ADD      --  <<Employee, Roles, Departments>>".yellow,
          "UPDATE   --  <<Employee Data, Roles or Departments>>".yellow,
          "REMOVE  --  <<Employee, Roles or Departments>>".yellow,
          "EXIT     --  <<To Close the APP>>".red,
        ],
      },
      
      //Employee, Roles, Managers & Department Entry Point Questions
      {
        name: "data",
        type: "list",
        message: "What do you like to view?",
        when: (response) =>
          response.data === "VIEW     --  <<Employees, Roles, Departments or Managers>>".yellow,
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
          response.data === "ADD      --  <<Employee, Roles, Departments>>".yellow,
        choices: ["Add New Employee", "Add New Role", "Add New Department"],
      },
       
       //Update Employee  Questions
      {
        name: "data",
        type: "list",
        message: "Which Data do you want to Update?",
        when: (response) => response.data === "UPDATE   --  <<Employee Data, Roles or Departments>>".yellow,
        choices: ["Update Employee Data", "Update Roles", "Update Department"],
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
          
        //*****************************************************************************//
        
        //Block Query No 3 (Update Cases Begins) Cases Begins Here
        case "Update Employee Data":
          updateEmployeeData();
          break;

        case "Update Roles":
          updateRoles();
          break;
          
        case "Update Manager":
          updateManager();
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
  console.log("\n*********************************[ UPDATED EMPLOYEES  ]********************************\n".yellow
  );
  
  //Print Response to terminal table
  connection.query(query,  (err, res) => {
    if (err) throw err;
    console.table(res);
    mainEnteryPoint()
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
            mainEnteryPoint()
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
            mainEnteryPoint()
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
            mainEnteryPoint()
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
      mainEnteryPoint();
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
      mainEnteryPoint();
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
      mainEnteryPoint();
    })  
  };

//**************************************************************************************************************** */

//Add New Employee Functions
addNewEmployee = () => {  
  //SQL Query to return job_title, department_name and manager_names.
  let query = "SELECT job_title, department_name, manager_name "; 
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
    managerArray.push('None')
    
//Sort Array to return only values for manager_name in Array
let  jobTitleArray = res.map(res => res["job_title"])
//Remove duplicate Job Titles
jobTitleArray = [...new Set(jobTitleArray)]
//Add 'Add' Option to the Array
//jobTitleArray.push('Add Job Title')
//console.log(jobTitleArray)

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
        message: "Employee Last Name: "
      },
      {
        name: "job_title",
        type: "list",
        message: "Select Employee job title (Please select 'None' Employee without a Manager): ",
        //Parses Existing Manager names array to prompt
        choices: jobTitleArray
      },  
      {
        name: "manager_name",
        type: "list",
        message: "Select Manager(Please select 'None' for Employee without a Manager): ",
        //Parses Existing Manager names array to prompt
        choices: managerArray
      }             
      
    ]) .then( answer => {
          //Switch cases for employee add.
          switch (answer) {
            default:
            //Query Database for the role ID of the selected Job Title
              let findRoleID = "SELECT role_id FROM role WHERE job_title = " + "'"+ answer.job_title + "'";
                  connection.query(findRoleID,  (err, res) => {
                    if (err) throw err;
                    let  role_id = res.map(res => res["role_id"])
                    
              //Pass role ID value to next SQL Query to populate employee database      
              let query = "INSERT INTO employee (first_name, last_name, role_id, manager_name) ";
                  query += "VALUES ( '" + answer.first_name + "', '"+ answer.last_name + "', " + role_id + ", '" + answer.manager_name+"');" 
                   
              //Throw error or report successful update
              connection.query(query,  (err, res) => {
                if (err) throw err;
                console.log("\n*************** Employee Database Successfuly Updated! *****************\n".green);
                // Return to Main Menu 
                employeeView()
              });   
            })           
            break;
          } 
    })
    })}

//Add New Employee Functions
addNewRole = () => {  
  //SQL Query to department_name .
  let query = "SELECT department_name FROM department"
connection.query(query, function (err, res) {
if (err) throw err;
//Sort Array to return only values for department_name in Array
    let  departmentArray = res.map(res => res["department_name"])
    //Remove duplicate Department Name
    departmentArray = [...new Set(departmentArray)]
   // console.log(departmentArray)
    //Add New Department to the Array
    departmentArray.push('Add New Department')

    //Call inquirer prompt to receive user parameters
    inquirer.prompt([
      {
        name: "job_title",
        type: "input",
        message: "Job Title: "
      },
      {
        name: "salary",
        type: "input",
        message: "Salary (Format: 5000): "
      },
      {
        name: "department_name",
        type: "list",
        message: "Select Department or Add New Department: ",
        //Parses Existing Department names array to prompt
        choices: departmentArray
      },  
    ]) .then( answer => {
          //Switch cases for employee add.
          switch (answer) {
            //First case to add new
            case "Add New Department":
              addNewDepartments();
              break;    
            default:
            //Query Database for the role ID of the selected Department Name
              let query = "SELECT department_id FROM department WHERE department_name = " + "'"+ answer.department_name + "'";
                  connection.query(query,  (err, res) => {
                    if (err) throw err;
                    console.log(res)
                    let  department_id = res.map(res => res["department_id"])
                    console.log(department_id)
                    
              //Pass department ID value to next SQL Query to populate role database      
              let query = "INSERT INTO role (job_title, salary, department_id) ";
                  query += "VALUES ( '" + answer.job_title + "', "+ answer.salary + ", " + department_id + ");" 
                   
              //Throw error or report successful update
              connection.query(query,  (err, res) => {
                if (err) throw err;
                console.log("\n*************** Role Database Successfuly Updated! *****************\n".green);
                // Display 
                allRoles()
              });   
            })           
              break;
          } 
    })
    })}

//Add New Department
addNewDepartment = () => { 
                          
    //Call inquirer prompt to receive user parameters
    inquirer.prompt([
      {
        name: "department_name",
        type: "input",
        message: "New Department Name: "
      },  
      {
        name: "department_id",
        type: "input",
        message: "New Department ID (Identify each Department by ID): "
      },    
    ]) .then( answer => {
      
          //Switch cases for employee add.
          switch (answer) {   
            default:
            
              //Pass department Name value to SQL Query to populate department database      
              let query = "INSERT INTO department (department_id, department_name) ";
                  query += "VALUES (" +answer.department_id + ", '" + answer.department_name+ "')" 
                   
              //Throw error or report successful update
              connection.query(query,  (err, res) => {
                if (err) throw err;
                console.log("\n*************** Department Database Successfuly Updated! *****************\n".green);
                // Display 
                allDepartments()
              });   
            }
    })
  }
  
  
  //Add New Department
updateEmployeeData = () => { 
                                                      
  //Call inquirer prompt to receive user parameters
  inquirer.prompt([
    {
      name: "data",
      type: "list",
      message: "Which EMPLOYEE Data do you want to Update?",
     // when: (response) => response.data === "Update Employee Data",
      choices: ["Employee First Name", "Employee Last Name", "Employee Role", "Employee Manager"],
    },
     
  ]) .then( answer => {
        //Switch cases for Employee First Name Update.
        switch (answer.data) {                                                
          case   "Employee First Name":
           let query = "SELECT employee_id, first_name, last_name FROM employee";
  connection.query(query, function (err, res) {
    if (err) throw err;
    //Generate an Array of first names and Last Names 
    employeeNames = [];  
     for (let i=0; i<res.length; i++){
       (employeeNames.push(res[i].first_name+ " " +res[i].last_name))
     }
     //Call Inquirer to prompt for employee name selection
    inquirer.prompt([
      {
        name: "name",
        type: "list",
        message: "Select Employee you want to update their first name?",
        //Parses employee name array to prompt
        choices: employeeNames
      }      
    ]) .then( answer => {
          //Receives the answer and split it into first name and last name
          let splitWords = (answer.name).split(" ")
          
          //SQL Query that grabs employee ID that matches selected first name and last name
          let query = "SELECT employee_id FROM employee WHERE first_name = '" + splitWords[0] +"'";
              query += "AND last_name = '" + splitWords[1] + "'";  
          connection.query(query,  (err, res) => {
            if (err) throw err;
            
            //Call inquirer to prompt for new user first name that matches query result
            inquirer.prompt([
              {
                name: "name",
                type: "input",
                message: "Please enter the new First Name: ".magenta,
              }      
            ]) .then( answer => {
              
              //Use inquiere received input to build a SQL update call
            let query = "UPDATE employee SET first_name = '" + answer.name + "' WHERE employee_id = " + res[0].employee_id
            connection.query(query,  (err, res) => {
              if (err) throw err;
              console.log("\n*************** User First Name Successfuly Updated! *****************\n".green)
              employeeView()
            })
          })
          });
    })
    })
    break;
  
  //Case to cater for Last Name update
    case   "Employee Last Name":
      let last_name_query = "SELECT employee_id, first_name, last_name FROM employee";
connection.query(last_name_query, function (err, res) {
if (err) throw err;
//Generate an Array of first names and Last Names 
employeeNames = [];  
for (let i=0; i<res.length; i++){
  (employeeNames.push(res[i].first_name+ " " +res[i].last_name))
}
//Call Inquirer to prompt for employee name selection
inquirer.prompt([
 {
   name: "name",
   type: "list",
   message: "Select Employee you want to update their first name?",
   //Parses employee name array to prompt
   choices: employeeNames
 }      
]) .then( answer => {
     //Receives the answer and split it into first name and last name
     let splitWords = (answer.name).split(" ")
     
     //SQL Query that grabs employee ID that matches selected first name and last name
     let query = "SELECT employee_id FROM employee WHERE first_name = '" + splitWords[0] +"'";
         query += "AND last_name = '" + splitWords[1] + "'";  
     connection.query(query,  (err, res) => {
       if (err) throw err;
       
       //Call inquirer to prompt for new user first name that matches query result
       inquirer.prompt([
         {
           name: "name",
           type: "input",
           message: "Please enter the new Last Name: ".magenta,
         }      
       ]) .then( answer => {
         
         //Use inquiere received input to build a SQL update call
       let query = "UPDATE employee SET last_name = '" + answer.name + "' WHERE employee_id = " + res[0].employee_id
       connection.query(query,  (err, res) => {
         if (err) throw err;
         console.log("\n*************** User First Name Successfuly Updated! *****************\n".green)
         employeeView()
       })
     })
     });
})
})
  break; 
  
  
  //Case to cater for Employee Role update
  case   "Employee Role":
    let last_name_query = "SELECT first_name, last_name, job_title FROM employee ";
        last_name_query += "INNER JOIN role ON role.role_id = employee.role_id "
connection.query(last_name_query, function (err, res) {
if (err) throw err;
//Generate an Array of first names and Last Names 
const employeesList = [];  
for (let i=0; i<res.length; i++){
(employeesList.push(res[i].first_name + " " + res[i].last_name))
}
//Generate an Array of Job Titles 
const jobTitles = [];  
for (let i=0; i<res.length; i++){
(jobTitles.push(res[i].job_title))
}
//Call Inquirer to prompt for employee name selection
inquirer.prompt([
{
 name: "name",
 type: "list",
 message: "Select EMPLOYEE you want to update their job title: ",
 //Parses employee name array to prompt
 choices: employeeView
},   
{
  name: "name",
  type: "list",
  message: "Select NEW JOB TITLE of the employee: ",
  //Parses employee name array to prompt
  choices: jobTitles
 }   
]) .then( answer => {
   //Receives the answer and split it into first name and last name
   let splitWords = (answer.name).split(" ")
   
   //SQL Query that grabs employee ID that matches selected first name and last name
   let query = "SELECT employee_id FROM employee WHERE first_name = '" + splitWords[0] +"'";
       query += "AND last_name = '" + splitWords[1] + "'";  
   connection.query(query,  (err, res) => {
     if (err) throw err;    
       
    //Use inquirer received input to build a SQL update call
     let query = "UPDATE employee SET last_name = '" + answer.name + "' WHERE employee_id = " + res[0].employee_id
     connection.query(query,  (err, res) => {
       if (err) throw err;
       console.log("\n*************** User First Name Successfuly Updated! *****************\n".green)
       employeeView()
     })
  
   });
})
})
break; 



  
  }  
  })
}


updateRoles = () => {
  //For Employee Role update
    let role_query = "SELECT job_title FROM role";
connection.query(role_query, function (err, res) {
if (err) throw err;
//Generate an Array of Job Titles 
const roleNames = [];  
for (let i=0; i<res.length; i++){
(roleNames.push(res[i].job_title))
}
//Call Inquirer to prompt for employee name selection
inquirer.prompt([
{
 name: "name",
 type: "list",
 message: "Select Job Title you want to update: ",
 //Parses employee name array to prompt
 choices: roleNames
}      
]) .then( answer => {
  
   //SQL Query that grabs employee ID that matches selected first name and last name
   let query = "SELECT role_id FROM role WHERE job_title = '" + answer.name +"'";  
   connection.query(query,  (err, res) => {
     if (err) throw err;
     
     //Call inquirer to prompt for new user first name that matches query result
     inquirer.prompt([
       {
         name: "name",
         type: "input",
         message: "Please enter the new Job Title Name: ".magenta,
       }      
     ]) .then( answer => {
       
       //Use inquiere received input to build a SQL update call
     let query = "UPDATE role SET job_title = '" + answer.name + "' WHERE role_id = " + res[0].role_id
     connection.query(query,  (err, res) => {
       if (err) throw err;
       console.log("\n*************** User First Name Successfuly Updated! *****************\n".green)
       employeeView()
     })
   })
   });
})
})
}






