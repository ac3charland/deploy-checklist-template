const inquirer = require('inquirer')

const releaseBoardURL = ''
const dashboardURL = ''

inquirer
    .prompt([
        {
            type: 'checkbox',
            name: 'appsToDeploy',
            message: 'Select which apps you are deploying:',
            choices: [
                new inquirer.Separator('App Group 1'),
                {name: 'App 1'},
                {name: 'App 2'},
                {name: 'App 3'},
                new inquirer.Separator('App Group 2'),
                {name: 'App 4'},
                {name: 'App 5'},
                {name: 'App 6'},
            ],
            pageSize: 20,
            validate: answer => {
                if (answer.length < 1) {
                    return 'Please choose at least one app to deploy.'
                }

                return true
            }
        }
    ])
    .then(answers => {
        console.log(`\n\n\nVisit the release board${releaseBoardURL ? ` at ${releaseBoardURL}` : ''}.\n`)

        // Array of deploy objects to be populated with name, deployVersion, rollbackVersion, etc.
        const apps = []
        answers.appsToDeploy.forEach(name => {
            apps.push({name})
        })

        const versionQuestions = []
        apps.forEach(app => {
            const {name} = app
            versionQuestions.push({
                type: 'input',
                name: `${name} - Release`,
                message: `${name} version to release:`,
                validate: answer => {
                    if (!answer) {
                        return 'Please enter a version number.'
                    }
                    return true
                }
            })
        })

        inquirer.prompt(versionQuestions)
            .then(deployAnswers => {
                Object.keys(deployAnswers).map(answer => deployAnswers[answer]).forEach((version, idx) => {
                    apps[idx].deployVersion = version
                })
                console.log(`\n\n\nVisit the dashboard${dashboardURL ? ` at ${dashboardURL}` : ''}.\n`)

                const rollbackQuestions = []

                apps.forEach(app => {
                    const {name} = app
                    rollbackQuestions.push({
                        type: 'input',
                        name: `${name} - Rollback`,
                        message: `${name} rollback version:`,
                        validate: answer => {
                            if (!answer) {
                                return 'Please enter a version number.'
                            }

                            return true
                        }
                    })
                })

                inquirer.prompt(rollbackQuestions)
                    .then(rollbackAnswers => {
                        Object.keys(rollbackAnswers).map(answer => rollbackAnswers[answer]).forEach((version, idx) => {
                            apps[idx].rollbackVersion = version
                        })
                        console.log(apps)

                        /*
                        inquirer
                            .prompt([
                                {
                                    type: 'list',
                                    name: 'stageDeployDate',
                                    message: 'Choose the STAGE deploy date'
                                }
                            ])
                        */
                    })
            })
    })