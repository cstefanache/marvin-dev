## Marvin

Marvin is an automation framework for web application. It allows the users to easily write their tests by providing them with:
 - a mechanism that automatically identifies all the UI elements discovered in the current page and returns unique selectors
 - a GUI to cutomise the discovery mechanism, to create new methods or reuse the existing ones and to define execution flows to test the application

## Features

🛠 Built with [Electron](https://www.electronjs.org/), [React](https://reactjs.org/), [Blueprint](http://www.blueprintjs.com), [TypeScript](https://www.typescriptlang.org/), [Nx](https://nx.dev)

## Getting Started

### Prerequisites

The only requirement for this project is to have [Node.js](https://nodejs.org/en/) installed on your machine. 
TypeScript will be added as a local dependency to the project, so no need to install it.

### Installation

Clone this repository on your machine and then run `nmp install`.

### Run the app

`npx nx serve marvin-frontend`

`npx nx serve marvin`

> 🚩 **Note**
> - we allow the users to write their tests through CLI too. For this run `npx nx serve marvin-cli`
> - if you want to build the discovery package you should run `npx nx build discovery` or if you want to only run the discovery unit tests run `npx nx test discovery`
> - we provide a sample web application ( a 'todo' application) to allow the users to easily test Marvin functionalities against this application. To open this sample application run `npx nx serve sample-server` and `npx nx serve sample-frontend` and the application will run on `http://localhost:4200/` (you will find the username and password in ./data/database.json file)
> - you can install NX plugin in your VS Code and manage all the packages from NX Console.

## GUI

### Workspace tab

Browse for a folder:
- to start a new project from scratch select an empty folder - where Marvin will generate all the files from scratch (discovery output - output.json file, configuration file - config.json file and execution workflow - flow.json file)

OR

- to open an existing project select a folder where you already have the generated files (output.json, config.json or flow.json)

<img width="562" alt="image" src="https://user-images.githubusercontent.com/15820565/215416714-f85ac3f1-ffa4-481e-be82-70b7ec281ede.png">

### Config tab

Fill the rootURL of the application for which you want to write automation tests:

<img width="1765" alt="image" src="https://user-images.githubusercontent.com/15820565/215423279-5945ec08-cc12-40e2-9095-3b5ebeb728f7.png">

### Config tab - URL Replacers section

You have possibility to replace in the application URLs the resource ids or resources names with some generic aliases, in order to be able to address that page in a generic manner. For this, Marvin provides us the posibility to define replacer rules (regex or exact match) for application URLs, when resources are included in the path URL.

`Eg: An URL in the application under test could be: `https://localhost:4200/articles/2423453254354356465` for the Article details page. We want to refer the Article details page for any article from the application. In this case we want to have something like this: `https://localhost:4200/articles/{articleId}`. `

<img width="1758" alt="image" src="https://user-images.githubusercontent.com/15820565/215424951-959598db-4a12-4888-85a4-a4588d0d7a8b.png">

### Config tab - Info Selectors section

You have the possibility to extend the default info selectors that are configured by default in the code. 

`Eg: span, p are not included in the default info selectors`

<img width="1775" alt="image" src="https://user-images.githubusercontent.com/15820565/215425852-901cc9c0-6914-401d-baee-f99762ef83e1.png">

### Config tab - Action Selectors section

You have the possibility to extend the default action selectors that are configured by default in the code. 

`Eg: .button is not included in the default action selectors.`

<img width="1779" alt="image" src="https://user-images.githubusercontent.com/15820565/215425931-b2cf060a-ed41-474a-ac6f-17cbfb8b32f4.png">

### Config tab - Input Selectors section

You have the possibility to extend the default input selectors that are configured by default in the code. 

<img width="904" alt="image" src="https://user-images.githubusercontent.com/15820565/215426501-9289ebb4-e379-48fe-a7da-32d404e07be1.png">

### Config tab - Iterators section

You have the posibility to define some rules to uniquely identify an item from a list / table. This iterator will allow you to perform actions (eg: delete, edit) a specific item from the list that has the desired text on it - defined in `identifier`.

<img width="1768" alt="image" src="https://user-images.githubusercontent.com/15820565/215426748-9d273f41-a90c-476d-9a97-720de1f55fca.png">


### Config tab - Optimizer section

You have the possibility to 

## Config

Format:

```
{
    "path": "basic",
    "rootUrl": "",
    "defaultTimeout": 10000,
    "aliases": {
        "info": [ ... ],
        "input": [ ... ],
        "action": [ ... ],
        "iterators": [ ... ]
    },
    "urlReplacers": [ ... ],
    "optimizer": {
        "exclude": [ ... ]
    },
    "sequence": [ ... ],
}
```

`path` - the local folder where the output will be generated

`rootUrl` - the root URL from which the discovery will start

`defaultTimeout` - the default waiting time before proceeding with actions if the network does not turn to idle. Usually the case when polling is used in pages

`aliases` - the list of custom identifiable items in the page. By default Marvin is initialized with a list of discoverable elements such as `<h[1-6]>`, `<p>` for info, `<input ...` for inputs, `<a ...`, `<button ...` for action but most applications come with custom complex classes that require definition

-   `info` - discoverable elements that display information.
-   `input` - elements that support keyboard typing
-   `action` - clickable elements
-   `iterators` - TBD

Example:

```
"aliases": {
    "info": [
        {
            "name": "Alert",
            "selectors": [".alert", ".MuiAlert-message"]
        },
        {
            "name": "Form error",
            "selectors": ["form .error"]
        }
    ],
    "action": [
        {
            "name": "Card Header",
            "selectors": [".card .card-title h1"]
        }
    ],
}
```

`optimizer` - TBD

`urlReplacers` - used when the identifiable pages reference a specific resource (e.g. `/user/4/profile`) and the output should merge all discovered elements under the same url.

if no urlReplacers are present the generated discovered output will result:

```
{
    ...
    "/user/4/profile": {
        ...
    },
    "/user/6/profile": {
        ....
    }
}
```

To merge the discovered outputs to be merged under a single object a config entry can be added:

```
"urlReplacers": [
    {
        "regex": "\/user\/\d\/profile",
        "alias": "{userIdId}"
    }
],
```

the generated output will be:

```
{
    ...
    "/user/{userId}/profile": {
        ...
    }
}
```

Replacer samples:

-   **UUID** - uuid format replaced with `{resourceId}`

```
    {
        "regex": "({){0,1}[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}(}){0,1}",
        "alias": "{resourceId}"
    }
```

`sequence` - This is just for development purpose. will be removed in the future
