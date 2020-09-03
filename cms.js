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
  console.log("\nConnected to Database with ID ".blue + connection.threadId + "\n");
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
          "VIEW     --  <<Employees, Roles, Departments or Managers>>".green,
          "ADD      --  <<Employee, Roles, Departments>>".green,
          "UPDATE   --  <<Employee Data, Roles or Departments>>".green,
          "REMOVE   --  <<Employee, Roles or Departments>>".green,
          "EXIT     --  <<To Close the APP>>".yellow,
        ],
      },

      //Employee, Roles, Managers & Department Entry Point Questions
      {
        name: "data",
        type: "list",
        message: "What do you like to view?".magenta,
        when: (response) =>
          response.data === "VIEW     --  <<Employees, Roles, Departments or Managers>>".green,
        choices: ["Employee Details", "Roles, Managers or Departments"],
      },

      //Employee specific Questions
      {
        name: "data",
        type: "list",
        message: "What Employee data do you want to view?".magenta,
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
        message: "Please select which data you like to VIEW?".magenta,
        when: (response) => response.data === "Roles, Managers or Departments",
        choices: ["View ALL Roles", "View ALL Departments", "View ALL Managers"],
      },

      //Employee, Roles, Managers & Department Entry Point Questions
      {
        name: "data",
        type: "list",
        message: "What new entity do you want to ADD?".magenta,
        when: (response) =>
          response.data === "ADD      --  <<Employee, Roles, Departments>>".green,
        choices: ["Add New Employee", "Add New Role", "Add New Department"],
      },

      //Update Employee  Questions
      {
        name: "data",
        type: "list",
        message: "Which Data do you want to UPDATE?".magenta,
        when: (response) => response.data === "UPDATE   --  <<Employee Data, Roles or Departments>>".green,
        choices: ["Update Employee Data", "Update Roles", "Update Department"],
      },

      //Remove Employee, Role or Department
      {
        name: "data",
        type: "list",
        message: "Which Data do you want to REMOVE?".magenta,
        when: (response) => response.data === "REMOVE   --  <<Employee, Roles or Departments>>".green,
        choices: ["REMOVE Employee", "REMOVE Role", "REMOVE Department"],
      },

    ])

    //Capture each first level response. Some final level questions passed to function level inquirer
    .then(answer => {
      switch (answer.data) {
        // Block Query No 1 (Employees, Roles, Managers & Department) Cases Begins
        //Each Final response calls relevant function
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

        //Block Query No 3 (Update Cases Begins)
        case "Update Employee Data":
          updateEmployeeData();
          break;

        case "Update Roles":
          updateRoles();
          break;

        case "Update Department":
          updateDepartment();
          break;

        //*****************************************************************************//

        //Block Query No 4 (REMOVE Cases Begins)
        case "REMOVE Employee":
          removeEmployee();
          break;

        case "REMOVE Role":
          removeRoles();
          break;

        case "REMOVE Department":
          removeDepartment();
          break;

        //Exit Case
        case "EXIT     --  <<To Close the APP>>".yellow:
          console.log("\nCLOSING SESSION...\n".green)
          connection.end()
      }
    });
}

//Function that Queries Employee database
employeeView = () => {
  let query = "SELECT employee_id ID, first_name 'First Name', last_name 'Last Name', job_title 'Title', department_name 'Department', salary 'Salary', manager_name 'Manager' ";
  query += "FROM employee ";
  query += "INNER JOIN role ON employee.role_id=role.role_id ";
  query += "INNER JOIN department ON role.department_id = department.department_id ";
  console.log("\n*********************************[ UPDATED EMPLOYEES  ]********************************".yellow
  );

  //Print Response to terminal table
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.table(res); inquirer.prompt([
      {
        name: "what",
        type: "list",
        message: "Hit RETURN to go back to the main page",
        choices: ["RETURN"]
      }
    ]).then(answer => {
      if (answer.what === "RETURN") {
        mainEnteryPoint();
      }
    })
  });
}

//Function that queries existing Department names, return them to inquirer prompt 
//and use user's selection to generate employees in that department.
employeeByDepartment = () => {
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
        message: "What Department Employees do you want to view?\n".magenta,
        //Parses department name array to prompt
        choices: departmentArray
      }
    ]).then(answer => {
      //function to return matching users here
      let query = "SELECT first_name 'First Name', last_name 'Last Name' ";
      query += "FROM employee ";
      query += "INNER JOIN role ON employee.role_id=role.role_id ";
      query += "INNER JOIN department ON role.department_id = department.department_id ";
      query += "WHERE department_name=" + "'" + answer.dept + "'";
      console.log("\n***************************[ LIST EMPLOYEES IN ".yellow + colors.green(answer.dept) + " DEPARTMENT]***************************\n".yellow
      );
      //Print Response to terminal table
      connection.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);
        inquirer.prompt([
          {
            name: "what",
            type: "list",
            message: "Hit RETURN to go back to the main page",
            choices: ["RETURN"]
          }
        ]).then(answer => {
          if (answer.what === "RETURN") {
            mainEnteryPoint();
          }
        })
      });
    })
  })
};


//Function that queries existing Manager names, return them to inquirer prompt 
//and use user's selection to generate employees under the Manager's Leadership.
employeeByManager = () => {
  //var query = "SELECT manager_name FROM employee" 
  let query = "SELECT manager_name FROM employee ";
  connection.query(query, function (err, res) {
    if (err) throw err;
    //Use ES6 filter to extract department_name array
    let managerArray = res.map(res => res["manager_name"]);
    //console.log(managerArrayArray) 
    inquirer.prompt([
      {
        name: "dept",
        type: "list",
        message: "Which Manager do you want to see their team members?".magenta,
        //Parses department name array to prompt
        choices: managerArray
      }
    ]).then(answer => {
      //function to return matching users here
      let query = "SELECT first_name 'First Name', last_name 'Last Name' ";
      query += "FROM employee ";
      query += "WHERE manager_name=" + "'" + answer.dept + "'";
      console.log("\n***************************[ LIST EMPLOYEES MANAGER BY ".yellow + colors.green(answer.dept) + " ]***************************".yellow
      );
      //Print Response to terminal table
      connection.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);
        inquirer.prompt([
          {
            name: "what",
            type: "list",
            message: "Hit RETURN to go back to the main page",
            choices: ["RETURN"]
          }
        ]).then(answer => {
          if (answer.what === "RETURN") {
            mainEnteryPoint();
          }
        })
      });
    })
  })
};

//Function that queries existing Job Roles, return them to inquirer prompt 
//and use user's selection to generate Employees Under the selected job title.
viewJobTitle = () => {
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
        message: "Which Job Title do you want to view their present Employees?".magenta,
        //Parses department name array to prompt
        choices: jobTitleArray
      }
    ]).then(answer => {
      //function to return matching users here
      let query = "SELECT first_name 'First Name', last_name 'Last Name' ";
      query += "FROM employee ";
      query += "INNER JOIN role ON employee.role_id = role.role_id ";
      query += "WHERE job_title=" + "'" + answer.dept + "'";
      console.log("\n***************************[ LIST EMPLOYEES WITH JOB TITLE ".yellow + colors.green(answer.dept) + " ]***************************".yellow
      );
      //Print Response to terminal table
      connection.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);
        inquirer.prompt([
          {
            name: "what",
            type: "list",
            message: "Hit RETURN to go back to the main page",
            choices: ["RETURN"]
          }
        ]).then(answer => {
          if (answer.what === "RETURN") {
            mainEnteryPoint();
          }
        })
      });
    })
  })
};

//Function that queries existing Roles, and returns a list of all existing roles
allRoles = () => {
  let query = "SELECT role_id 'ID', job_title 'Job Title'  FROM role"
  connection.query(query, function (err, res) {
    if (err) throw err;
    //Use ES6 filter to extract department_name array  
    console.log("\n***************************[ LIST OF ALL EXISTING ROLES]***************************".yellow
    );
    console.table(res)
    inquirer.prompt([
      {
        name: "what",
        type: "list",
        message: "Hit RETURN to go back to the main page",
        choices: ["RETURN"]
      }
    ]).then(answer => {
      if (answer.what === "RETURN") {
        mainEnteryPoint();
      }
    })
  })
};

//Function that queries existing Managers and returns a list of all Managers
allManagers = () => {
  let query = "SELECT manager_name "
  query += "FROM employee ";
  query += "WHERE manager_name != 'None'";
  connection.query(query, function (err, res) {
    if (err) throw err;
    //Use ES6 filter to extract department_name array  
    console.log("\n***************************[ LIST OF ALL MANAGERS]***************************".yellow
    );
    newManagers = [];
    for (let i = 0; i < res.length; i++) {
      newManagers.push(res[i].manager_name)
    };
    const filteredManager = [...new Set(newManagers)]
    let placeHolder = filteredManager.filter((item) => item !== 'None ')
    console.table(placeHolder)
    inquirer.prompt([
      {
        name: "what",
        type: "list",
        message: "Hit RETURN to go back to the main page",
        choices: ["RETURN"]
      }
    ]).then(answer => {
      if (answer.what === "RETURN") {
        mainEnteryPoint();
      }
    })
  })
};

//Function that queries ALL Departments, and returns a list of all existing departments
allDepartments = () => {
  let query = "SELECT department_id 'ID', department_name 'Department Name(s)' "
  query += "FROM department ";
  connection.query(query, function (err, res) {
    if (err) throw err;
    console.log("\n***************************[ LIST OF ALL DEPARTMENTS]***************************".green
    );
    console.table(res)
    inquirer.prompt([
      {
        name: "what",
        type: "list",
        message: "Hit RETURN to go back to the main page",
        choices: ["RETURN"]
      }
    ]).then(answer => {
      if (answer.what === "RETURN") {
        mainEnteryPoint();
      }
    })
  })
};

//**************************************************************************************************************** */

//Add New Employee Functions
addNewEmployee = () => {
  //SQL Query to return job_title, department_name and manager_names.
  let query = "SELECT first_name, last_name FROM employee";
  connection.query(query, function (err, res) {
    if (err) throw err;

    managerNames = [];
    for (let i = 0; i < res.length; i++) {
      (managerNames.push(res[i].first_name + " " + res[i].last_name))
    }
    //Call inquirer prompt to receive user parameters and select Manager from List of Employees
    inquirer.prompt([
      {
        name: "first_name",
        type: "input",
        message: "Employee First Name (ONE WORD): ".green
      },
      {
        name: "last_name",
        type: "input",
        message: "Employee Last Name (ONE WORD): ".green
      },
      {
        name: "manager_name",
        type: "list",
        message: "Select Manager(Please select 'None' for Employee without a Manager): ",
        //Parses Existing Manager names array to prompt
        choices: managerNames
      }

    ]).then(answer => {
      //save input values as constants in memory
      const firstName = answer.first_name
      const lastName = answer.last_name
      const managerName = answer.manager_name
      let query = "SELECT job_title FROM role"
      const jobTitles = []
      connection.query(query, (err, res) => {
        if (err) throw err
        console.log(res[0].job_title)
        for (let i = 0; i < res.length; i++) {
          (jobTitles.push(res[i].job_title))
        }
        inquirer.prompt([
          {
            name: "job_title",
            type: "list",
            message: "Select Employee job title (Please select 'None' Employee without a Manager): ".green,
            //Parses Existing Manager names array to prompt
            choices: jobTitles
          }
        ]).then(answer => {
          //Switch case employee job title.
          switch (answer) {
            default:
              //Query Database for the role ID of the selected Job Title
              let query = "SELECT role_id FROM role WHERE job_title = " + "'" + answer.job_title + "'";
              connection.query(query, (err, res) => {
                if (err) throw err;
                let role_id = res[0].role_id

                //Pass role ID value to next SQL Query to populate employee database      
                let query = "INSERT INTO employee (first_name, last_name, role_id, manager_name) ";
                query += "VALUES ( '" + firstName + "', '" + lastName + "', " + role_id + ", '" + managerName + "');"

                //Throw error or report successful update
                connection.query(query, (err, res) => {
                  if (err) throw err;
                  console.log("\n*************** Employee Database Successfuly Updated! *****************".green);
                  // Return to Main Menu 
                  employeeView()
                });
              })
              break;
          }
        })
      })
    })
  }
  )
}


//Add New Employee Functions
addNewRole = () => {
  //SQL Query to department_name .
  let query = "SELECT department_name FROM department"
  connection.query(query, function (err, res) {
    if (err) throw err;
    //Sort Array to return only values for department_name in Array
    let departmentArray = res.map(res => res["department_name"])
    //Remove duplicate Department Name
    departmentArray = [...new Set(departmentArray)]
    // console.log(departmentArray)

    //Call inquirer prompt to receive user parameters
    inquirer.prompt([
      {
        name: "job_title",
        type: "input",
        message: "Job Title: ".green
      },
      {
        name: "salary",
        type: "input",
        message: "Salary (Format: 5000): ".green
      },
      {
        name: "department_name",
        type: "list",
        message: "Select Department: ".green,
        //Parses Existing Department names array to prompt
        choices: departmentArray
      },
    ]).then(answer => {
      //Switch cases for employee add.
      switch (answer) {
        default:
          //Query Database for the role ID of the selected Department Name
          let query = "SELECT department_id FROM department WHERE department_name = " + "'" + answer.department_name + "'";
          connection.query(query, (err, res) => {
            if (err) throw err;
            console.log(res)
            let department_id = res.map(res => res["department_id"])
            console.log(department_id)

            //Pass department ID value to next SQL Query to populate role database      
            let query = "INSERT INTO role (job_title, salary, department_id) ";
            query += "VALUES ( '" + answer.job_title + "', " + answer.salary + ", " + department_id + ");"

            //Throw error or report successful update
            connection.query(query, (err, res) => {
              if (err) throw err;
              console.log("\n*************** Role Database Successfuly Updated! *****************".green);
              // Display 
              allRoles()
            });
          })
          break;
      }
    })
  })
}

//Add New Department
addNewDepartment = () => {
  //Call inquirer prompt to receive user parameters
  inquirer.prompt([
    {
      name: "department_name",
      type: "input",
      message: "New Department Name: ".green
    }
  ]).then(answer => {

    //Switch cases for employee add.
    switch (answer) {
      default:

        //Pass department Name value to SQL Query to populate department database      
        let query = "INSERT INTO department ( department_name) ";
        query += "VALUES ('" + answer.department_name + "')"

        //Throw error or report successful update
        connection.query(query, (err, res) => {
          if (err) throw err;
          console.log("\n*************** Department Database Successfuly Updated! *****************".green);
          // Display 
          allDepartments()
        })
        break;
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
      message: "Which EMPLOYEE Data do you want to Update?\n".green,
      // when: (response) => response.data === "Update Employee Data",
      choices: ["Employee First Name", "Employee Last Name", "Employee Role", "Employee Manager"],
    },

  ]).then(answer => {
    //Switch cases for Employee First Name Update.
    switch (answer.data) {
      case "Employee First Name":
        let query = "SELECT employee_id, first_name, last_name FROM employee";
        connection.query(query, function (err, res) {
          if (err) throw err;
          //Generate an Array of first names and Last Names 
          employeeNames = [];
          for (let i = 0; i < res.length; i++) {
            (employeeNames.push(res[i].first_name + " " + res[i].last_name))
          }
          //Call Inquirer to prompt for employee name selection
          inquirer.prompt([
            {
              name: "name",
              type: "list",
              message: "Select Employee you want to update their first name?".green,
              //Parses employee name array to prompt
              choices: employeeNames
            }
          ]).then(answer => {
            //Receives the answer and split it into first name and last name
            let splitWords = (answer.name).split(" ")

            //SQL Query that grabs employee ID that matches selected first name and last name
            let query = "SELECT employee_id FROM employee WHERE first_name = '" + splitWords[0] + "'";
            query += "AND last_name = '" + splitWords[1] + "'";
            connection.query(query, (err, res) => {
              if (err) throw err;

              //Call inquirer to prompt for new user first name that matches query result
              inquirer.prompt([
                {
                  name: "name",
                  type: "input",
                  message: "Please enter the new First Name: ".green,
                }
              ]).then(answer => {

                //Use inquiere received input to build a SQL update call
                let query = "UPDATE employee SET first_name = '" + answer.name + "' WHERE employee_id = " + res[0].employee_id
                connection.query(query, (err, res) => {
                  if (err) throw err;
                  console.log("\n*************** User First Name Successfuly Updated! *****************".green)
                  employeeView()
                })
              })
            });
          })
        })
        break;

      //Case to cater for Last Name update
      case "Employee Last Name":
        let last_name_query = "SELECT employee_id, first_name, last_name FROM employee";
        connection.query(last_name_query, function (err, res) {
          if (err) throw err;
          //Generate an Array of first names and Last Names 
          employeeNames = [];
          for (let i = 0; i < res.length; i++) {
            (employeeNames.push(res[i].first_name + " " + res[i].last_name))
          }
          //Call Inquirer to prompt for employee name selection
          inquirer.prompt([
            {
              name: "name",
              type: "list",
              message: "Select Employee you want to update their first name?".green,
              //Parses employee name array to prompt
              choices: employeeNames
            }
          ]).then(answer => {
            //Receives the answer and split it into first name and last name
            let splitWords = (answer.name).split(" ")

            //SQL Query that grabs employee ID that matches selected first name and last name
            let query = "SELECT employee_id FROM employee WHERE first_name = '" + splitWords[0] + "'";
            query += "AND last_name = '" + splitWords[1] + "'";
            connection.query(query, (err, res) => {
              if (err) throw err;

              //Call inquirer to prompt for new user first name that matches query result
              inquirer.prompt([
                {
                  name: "name",
                  type: "input",
                  message: "Please enter the new Last Name: ".green,
                }
              ]).then(answer => {

                //Use inquiere received input to build a SQL update call
                let query = "UPDATE employee SET last_name = '" + answer.name + "' WHERE employee_id = " + res[0].employee_id
                connection.query(query, (err, res) => {
                  if (err) throw err;
                  console.log("\n*************** User First Name Successfuly Updated! *****************".green)
                  employeeView()
                })
              })
            });
          })
        })
        break;

      //Case to cater for Employee Role update
      case "Employee Role":
        let em_query = "SELECT first_name, last_name FROM employee ";
        connection.query(em_query, function (err, res) {
          if (err) throw err;
          //Generate an Array of first names and Last Names 
          const employeesList = [];
          for (let i = 0; i < res.length; i++) {
            (employeesList.push(res[i].first_name + " " + res[i].last_name))
          }

          const jobTitles = [];
          let title_query = "SELECT job_title FROM role ";
          connection.query(title_query, (err, res) => {
            if (err) throw err;
            //Generate an Array of Job Titles 
            for (let i = 0; i < res.length; i++) {
              (jobTitles.push(res[i].job_title))
            }
          })

          //Call Inquirer to prompt for employee name selection
          inquirer.prompt([
            {
              name: "name",
              type: "list",
              message: "Select EMPLOYEE you want to update their job title: ".green,
              //Parses employee name array to prompt
              choices: employeesList
            },
            {
              name: "title",
              type: "list",
              message: "Select NEW JOB TITLE of the employee: ".green,
              //Parses employee name array to prompt
              choices: jobTitles
            }
          ]).then(answer => {
            //Receives the answer and split it into first name and last name
            let splitWords = (answer.name).split(" ")

            //Placeholder for chosen target job title
            const employeeJobTitle = answer.title

            //SQL Query that grabs the Job Title of the Selected Employee first name and last name
            let query = "SELECT employee_id FROM employee ";
            query += "WHERE first_name = '" + splitWords[0] + "' AND last_name = '" + splitWords[1] + "'";
            connection.query(query, (err, res) => {
              if (err) throw err;

              //Identify this employee ID for use in final role_id        
              const thisEmployee = res[0].employee_id;

              //Find the role_id of the selected Employee
              let query = "SELECT role_id FROM role WHERE job_title = '" + employeeJobTitle + "'"
              connection.query(query, (err, res) => {
                if (err) throw err;

                //Use the received role_id to update the employee role
                let query = "UPDATE employee SET role_id = " + res[0].role_id + " WHERE employee_id = " + thisEmployee
                connection.query(query, (err, res) => {
                  if (err) throw err;
                  console.log("\n*************** " + answer.name + " Role Successfully UPDATED! *****************".green)
                  employeeView()
                })
              })
            });
          })
        })
        break;

      //Case to cater for Employee Manager update
      case "Employee Manager":
        let name_query = "SELECT first_name, last_name FROM employee ";
        connection.query(name_query, function (err, res) {
          if (err) throw err;

          //Generate an Array of first names and Last Names 
          const employeesList = [];
          for (let i = 0; i < res.length; i++) {
            (employeesList.push(res[i].first_name + " " + res[i].last_name))
          };

          inquirer.prompt([
            {
              name: "name",
              type: "list",
              message: "Select EMPLOYEE you want to update their Manager: ".green,
              //Parses employee name array to prompt
              choices: employeesList
            }
          ]).then(answer => {
            const employeeName = answer.name
            const managerList = employeesList.filter(val => val != answer.name)
            console.log(managerList.push('None'))

            //Call Inquirer to prompt for Name Manager's Name
            inquirer.prompt([
              {
                name: "name",
                type: "list",
                message: "Select the name of the NEW MANAGER: ".green,
                //Parses employee name array to prompt
                choices: managerList
              }
            ]).then(answer => {
              const managerName = answer.name
              //Receives the answer and split it into first name and last name of manager & employee
              let splitWords = (employeeName).split(" ")
              console.log(splitWords);

              //SQL Query that grabs the employee ID of the Selected Employee first name and last name
              let query = "SELECT employee_id FROM employee ";
              query += "WHERE first_name = '" + splitWords[0] + "' AND last_name = '" + splitWords[1] + "'";
              connection.query(query, (err, res) => {
                if (err) throw err;

                //Identify this employee ID for use in final role_id        
                const thisEmployeeID = res[0].employee_id;

                //Use the received role_id to update the employee role
                let query = "UPDATE employee SET manager_name = '" + managerName + "' WHERE employee_id = " + thisEmployeeID
                connection.query(query, (err, res) => {
                  if (err) throw err;
                  console.log("\n*************** " + answer.name + " Role Successfully UPDATED! *****************".green)
                  employeeView()
                })
              });
            })
          })
        })
      break;
    }
  }
  )
}

updateRoles = () => {
  //For Employee Role update
  let role_query = "SELECT job_title FROM role";
  connection.query(role_query, function (err, res) {
    if (err) throw err;
    //Generate an Array of Job Titles 
    const roleNames = [];
    for (let i = 0; i < res.length; i++) {
      (roleNames.push(res[i].job_title))
    }
    //Call Inquirer to prompt for employee name selection
    inquirer.prompt([
      {
        name: "title",
        type: "list",
        message: "Select Job Title you want to update: ".green,
        //Parses employee name array to prompt
        choices: roleNames
      },
      {
        name: "activity",
        type: "list",
        message: "Please select which parameter to update: ".green,
        //Parses employee name array to prompt
        choices: ["Role Name", "Role Salary", "Role Department"]
      }
    ]).then(answer => {

      //SQL Query that grabs employee ID that matches selected first name and last name
      let query = "SELECT role_id FROM role WHERE job_title = '" + answer.title + "'";
      connection.query(query, (err, res) => {
        if (err) throw err;
        //Keep the role ID in a place holder
        const selectedRoleID = res[0].role_id
        switch (answer.activity) {
          case "Role Name":
            //Call inquirer to prompt new job title
            inquirer.prompt([
              {
                name: "name",
                type: "input",
                message: "Please enter the new JOB TITLE NAME: ".green,
              }
            ]).then(answer => {
              newRoleName = answer.name
              //Use inquierer received input to build a SQL update query
              let query = "UPDATE role SET job_title = '" + newRoleName + "' WHERE role_id = " + selectedRoleID
              connection.query(query, (err, res) => {
                if (err) throw err;
                console.log("\n*************** Job Title Successfuly Updated! *****************".green)
                allRoles()
              })
            })
            break;
          case "Role Salary":
            inquirer.prompt([
              {
                name: "salary",
                type: "input",
                message: "Please enter the new SALARY for the job title: ".green,
              }
            ]).then(answer => {
              newSalary = answer.salary
              //Use inquiere received input to build a SQL update call
              let query = "UPDATE role SET salary = '" + newSalary + "' WHERE role_id = " + selectedRoleID
              connection.query(query, (err, res) => {
                if (err) throw err;
                console.log("\n*************** Role Salary Successfuly Updated! *****************".green)
                allRoles()
              })
            })
            break;
            
          case "Role Department":
            let query = "SELECT department_name FROM department"

            //Generate an array of ALL existing departments
            const departmentArray = []
            connection.query(query, (err, res) => {
              if (err) throw err;
              for (let i = 0; i < res.length; i++) {
                departmentArray.push(res[i].department_name)
              }
              //Call inquirer and pass departmentArray fro selection
              inquirer.prompt([
                {
                  name: "dept",
                  type: "list",
                  message: "Please select the new DEPARTMENT for the job title: ".green,
                  choices: departmentArray
                }
              ]).then(answer => {
                const department = answer.dept
                //Use inquiere received input to build a SQL query to get the department ID 
                let query = "SELECT department_id FROM department WHERE department_name = '" + department + "'"
                connection.query(query, (err, res) => {
                  if (err) throw err;
                  const departmentID = res[0].department_id
                  let query = "UPDATE role SET department_id = " + departmentID + " WHERE role_id = " + selectedRoleID
                  connection.query(query, (err, res) => {
                    if (err) throw err;
                    console.log("\n*************** Role Department Successfuly Updated! *****************".green)
                    allRoles()
                  })
                })
              })
            })
          break;
        }
      })
    });
  })
}

//Update Department Function
updateDepartment = () => {
  //SQL Query to department_name .
  let query = "SELECT department_name FROM department"
  connection.query(query, function (err, res) {
    if (err) throw err;
    //Sort Array to return only values for department_name in Array
    let departmentArray = res.map(res => res["department_name"])

    //Call inquirer prompt to receive user parameters
    inquirer.prompt([
      {
        name: "department_name",
        type: "list",
        message: "Select Department to update (ONY NAME CHANGE AVAILABLE): ".green,
        //Parses Existing Department names array to prompt
        choices: departmentArray
      },
    ]).then(answer => {
      const departmentName = answer.department_name
      //Query Database for the role ID of the selected Department Name
      let query = "SELECT department_id FROM department WHERE department_name = " + "'" + departmentName + "'";
      connection.query(query, (err, res) => {
        if (err) throw err;
        console.log(res)
        const departmentID = res[0].department_id
        inquirer.prompt([
          {
            name: "choose",
            type: "list",
            message: "What DEPARTMENT DATA do you want to Update? :".green,
            choices: ["Department Name", "Department ID"]
          },
          {
            name: "newName",
            type: "input",
            message: "Please ENTER the new DEPARTMENT NAME :".green,
            when: (answer) => answer.choose === "Department Name"
          },
          {
            name: "newID",
            type: "input",
            message: "Please ENTER the new DEPARTMENT ID :".green,
            when: (answer) => answer.choose === "Department ID"
          }
        ]).then(answer => {
          console.log(answer)
          const newDepartmentName = answer.newName
          const newDepartmentID = answer.newID
          //Pass department ID value to next SQL Query to update department database   
          switch (answer.choose) {
            case "Department Name":
              //update new name function
              let query = "UPDATE department SET department_name ='" + newDepartmentName + "' WHERE department_id = " + departmentID;
              connection.query(query, (err, res) => {
                if (err) throw err;
                console.log("\n*************** Department Name Successfuly Updated! *****************".green);
                // Display 
                allDepartments()
              })
              break;
            case "Department ID":
              //update new ID
              let thisQuery = "UPDATE department SET department_id =" + newDepartmentID + " WHERE department_id = " + departmentID;
              connection.query(thisQuery, (err, res) => {
                if (err) throw err;
                console.log("\n*************** Department Name Successfuly Updated! *****************".green);
                // Display 
                allDepartments()
              })
            break;
          }
        })
      })
    })
  })
}

//Remove Employee from DB
removeEmployee = () => {
  let query = "SELECT first_name, last_name FROM employee";
  connection.query(query, function (err, res) {
    if (err) throw err;
    //Generate an Array of first names and Last Names 
    employeeNames = [];
    for (let i = 0; i < res.length; i++) {
      (employeeNames.push(res[i].first_name + " " + res[i].last_name))
    }
    //Call Inquirer to prompt for employee name selection
    inquirer.prompt([
      {
        name: "name",
        type: "list",
        message: "Select the EMPLOYEE you want to REMOVE :".green,
        //Parses employee name array to prompt
        choices: employeeNames
      }
    ]).then(answer => {
      //Receives the answer and split it into first name and last name
      let splitWords = (answer.name).split(" ")

      //SQL Query that grabs employee ID that matches selected first name and last name
      let query = "SELECT employee_id FROM employee WHERE first_name = '" + splitWords[0] + "'";
      query += "AND last_name = '" + splitWords[1] + "'";
      connection.query(query, (err, res) => {
        if (err) throw err;
        console.log(res)
        const employeeID = res[0].employee_id

        //Use inquierer received input to build a SQL update call
        let query = "DELETE FROM employee WHERE employee_id = " + employeeID
        connection.query(query, (err, res) => {
          if (err) throw err;
          console.log("\n*************** EMPLOYEE " + answer.name + " Successfuly Updated! *****************".green)
          employeeView()
        })
      })
    });
  })
}

//Remove Role from DB
removeRoles = () => {
  let query = "SELECT job_title FROM role";
  connection.query(query, function (err, res) {
    if (err) throw err;
    //Generate an Array of first names and Last Names 
    let roleNames = [];
    for (let i = 0; i < res.length; i++) {
      (roleNames.push(res[i].job_title))
    }
    //Call Inquirer to prompt for employee name selection
    inquirer.prompt([
      {
        name: "name",
        type: "list",
        message: "Select the ROLE you want to REMOVE :".green,
        //Parses employee name array to prompt
        choices: roleNames
      }
    ]).then(answer => {
      //Receives the answer and split it into first name and last name
      let roleName = answer.name

      //SQL Query that grabs role ID that matches selected ROLE NAME
      let query = "SELECT role_id FROM role WHERE job_title = '" + roleName + "'";
      connection.query(query, (err, res) => {
        if (err) throw err;
        const roleID = res[0].role_id

        //Use inquierer received input to build a SQL update call
        let query = "DELETE FROM role WHERE role_id = " + roleID
        connection.query(query, (err, res) => {
          if (err) throw err;
          console.log("\n*************** ROLE" + roleName + " Successfuly Updated! *****************".green)
          allRoles()
        })
      })
    })
  })
}

//Remove Role from DB
removeDepartment = () => {
  let query = "SELECT department_name FROM department";
  connection.query(query, function (err, res) {
    if (err) throw err;
    //Generate an Array of first names and Last Names 
    let departmentNames = [];
    for (let i = 0; i < res.length; i++) {
      (departmentNames.push(res[i].department_name))
    }
    //Call Inquirer to prompt for employee name selection
    inquirer.prompt([
      {
        name: "name",
        type: "list",
        message: "Select the DEPARTMENT you want to REMOVE :".green,
        //Parses employee name array to prompt
        choices: departmentNames
      }
    ]).then(answer => {
      //Receives the answer and split it into first name and last name
      let departmentName = answer.name

      //SQL Query that grabs role ID that matches selected ROLE NAME
      let query = "SELECT department_id FROM department WHERE department_name = '" + departmentName + "'";
      connection.query(query, (err, res) => {
        if (err) throw err;
        const departmentID = res[0].department_id

        //Use inquierer received input to build a SQL update call
        let query = "DELETE FROM department WHERE department_id = " + departmentID
        connection.query(query, (err, res) => {
          if (err) throw err;
          console.log("\n*************** DEPARTMENT" + departmentName + " Successfuly Updated! *****************".green)
          allDepartments()
        })
      })
    });
  })
}



