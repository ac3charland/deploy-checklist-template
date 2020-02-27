const inquirer = require('inquirer')
const moment = require('moment')

const releaseBoardURL = ''
const dashboardURL = ''
const dateFormat = 'dddd, MMMM Do YYYY'

const createDateArray = (maxDays, startDate = moment()) => {
    let dateChoices = []
    let day = startDate
    for (let days = 0; days < maxDays; days++) {
        dateChoices.push({name: day.format(dateFormat)})
        day.add(1, 'day')
    }
    return dateChoices
}

const getDefaultDayIndex = (day, dateArray) => {
    let defaultIndex
    dateArray.forEach((date, idx) => {
        if (date.name.includes(day)) {
            defaultIndex = idx
        }
    })

    if (defaultIndex) {
        return defaultIndex
    }

    return 0
}

const constructAppChecklist = app => {
    const checklistTitle = `${app.name} DEPLOY CHECKLIST`
    const checklistDecoration = '='.repeat(checklistTitle.length)
    const fullChecklistTitle = `\n\n\n\n\n${checklistDecoration}\n${checklistTitle}\n${checklistDecoration}`
    return [
        {
            type: 'input',
            name: `${app.name} - deployedToTest`,
            message: `${fullChecklistTitle}\n\n\nIs ${app.name} v. ${app.deployVersion} in test? (y/n)`,
            validate: answer => {
                if (answer !== 'y' && answer !== 'n') {
                    return `Please enter either y or n.`
                }
                if (answer !== 'y') {
                    return `Please ensure ${app.name} v. ${app.deployVersion} is in test.`
                }

                return true
            }
        },
        {
            type: 'input',
            name: `${app.name} - QAComplete`,
            message: `\n\n\nHas ${app.name} v. ${app.deployVersion} been QA'd? (y/n)`,
            validate: answer => {
                if (answer !== 'y' && answer !== 'n') {
                    return `Please enter either y or n.`
                }
                if (answer !== 'y') {
                    return `Please ensure ${app.name} v. ${app.deployVersion} is in test.`
                }

                return true
            }
        },
        {
            type: 'checkbox',
            name: 'appStageChecklist',
            message: '\n\n\nCreate a STAGE deploy ticket and confirm:',
            pageSize: 5,
            choices: [
                {name: `Job is for ${app.name} deploy`},
                {name: 'ENVIRONMENT is STAGE'},
                {name: `DEPLOY_VERSION is ${app.deployVersion}`},
                {name: `ROLLBACK_VERSION is ${app.rollbackVersion}`},
                {name: `LAUNCH_DATE is ${app.stageDate}`},
            ],
            validate: answer => {
                if (answer.length < 5) {
                    return `Please complete the checklist or exit the program.`
                }

                return true
            }
        },
        {
            type: 'checkbox',
            name: 'appProdChecklist',
            message: '\n\n\nCreate a PROD deploy ticket and confirm:',
            pageSize: 5,
            choices: [
                {name: `Job is for ${app.name} deploy`},
                {name: 'ENVIRONMENT is PROD'},
                {name: `DEPLOY_VERSION is ${app.deployVersion}`},
                {name: `ROLLBACK_VERSION is ${app.rollbackVersion}`},
                {name: `LAUNCH_DATE is ${app.prodDate}`},
            ],
            validate: answer => {
                if (answer.length < 5) {
                    return `Please complete the checklist or exit the program.`
                }

                return true
            }
        }
    ]
}

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
                message: `Release version - ${name}:`,
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
                        message: `Rollback version - ${name}:`,
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

                        const stageDateChoices = createDateArray(7)
                        const stageDefaultIndex = getDefaultDayIndex('Tuesday', stageDateChoices)

                        inquirer
                            .prompt([
                                {
                                    type: 'list',
                                    name: 'stageDeployDate',
                                    message: '\n\n\nChoose the STAGE deploy date',
                                    choices: stageDateChoices,
                                    pageSize: 7,
                                    validate: answer => {
                                        if (answer.length < 1) {
                                            return 'Please choose a date.'
                                        }

                                        return true
                                    },
                                    default: stageDefaultIndex
                                }
                            ])
                            .then(stageDateAnswers => {
                                const stageDate = moment(stageDateAnswers.stageDeployDate, dateFormat)
                                apps.forEach(app => {
                                    app.stageDate = stageDate.format('MM/DD/YYYY')
                                })
                                const prodDateChoices = createDateArray(7, stageDate)
                                const prodDefaultIndex = getDefaultDayIndex('Wednesday', prodDateChoices)

                                inquirer
                                    .prompt([
                                        {
                                            type: 'list',
                                            name: 'prodDeployDate',
                                            message: '\n\n\nChoose the PROD deploy date',
                                            choices: prodDateChoices,
                                            pageSize: 7,
                                            validate: answer => {
                                                if (answer.length < 1) {
                                                    return 'Please choose a date.'
                                                }

                                                return true
                                            },
                                            default: prodDefaultIndex
                                        }
                                    ])
                                    .then(prodDateAnswers => {
                                        const prodDate = moment(prodDateAnswers.prodDeployDate, dateFormat)
                                        apps.forEach(app => {
                                            app.prodDate = prodDate.format('MM/DD/YYYY')
                                        })

                                        let checklists
                                        apps.forEach(app => {
                                            if (checklists) {
                                                checklists = [...checklists, ...constructAppChecklist(app)]
                                            }
                                            else {
                                                checklists = constructAppChecklist(app)
                                            }
                                        })

                                        inquirer.prompt(checklists)
                                            .then(checklistResponses => {
                                                console.log(
                                                    '\n\n\n' +
                                                    '==================================\n' +
                                                    'Congratulations, deploys complete!\n' +
                                                    '=================================='
                                                )
                                            })


                                    })
                            })
                    })
            })
    })
