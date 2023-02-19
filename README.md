## Marvin

Marvin is an automation framework for web applications that allows users to easily write their tests by providing them with:
- a mechanism that automatically identifies all the UI elements discovered on the current page and returns unique selectors
- a GUI to customise the discovery mechanism, create methods or reuse the existing ones, and to define execution flows for the web application under test
 
## Features

🛠 Built with [Electron](https://www.electronjs.org/), [React](https://reactjs.org/), [Blueprint](http://www.blueprintjs.com), [TypeScript](https://www.typescriptlang.org/), [Nx](https://nx.dev)

## Getting Started

### Prerequisites

The only requirement for this project is to have [Node.js](https://nodejs.org/en/) installed on your machine. 
TypeScript will be added as a local dependency to the project, so no need to install it.

### Installation

Clone this repository on your machine, then run `npm install`.

### Run the app

`npx nx serve marvin-frontend`

`npx nx serve marvin`

> 🚩 **Note**
> - we allow the users to write their tests through CLI too. For this run `npx nx serve marvin-cli`
> - if you want to build the discovery package you should run `npx nx build discovery` or if you want to execute the discovery unit tests run `npx nx test discovery`
> - we provide a sample web application ( a 'todo' application) to allow the users to easily test Marvin functionalities against this application. To open this sample application run `npx nx serve sample-server` and `npx nx serve sample-frontend`. The application will run on `http://localhost:4200/` (you will find the username and password in ./data/database.json file)
> - you can install NX plugin in your VS Code and manage all the packages from NX Console.
