const inquirer = require('inquirer')

inquirer
    .prompt([
        {
            type: 'input',
            name: 'testQuestion',
            message: 'Enter something and I will echo it back:'
        }
    ])
    .then(answers => {
        console.log(`You entered: ${answers.testQuestion}`)
    })