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
> - we provide a sample web application ( a 'todo' application) to allow the users to easily test Marvin functionalities against this application. To open this sample application run `npx nx serve sample-server` and `npx nx serve sample-frontend` and the application will run on `http://localhost:4200/` (you will find the username and password on ./data/database.json file)
> - you can install NX plugin in your VS Code and manage all the packages from NX Console.


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
