### Workspace tab

Browse for a folder:
- to start a new project from scratch select an empty folder - where Marvin will generate all the files from scratch (discovery output - output.json file, configuration file - config.json file and execution workflow - flow.json file)

OR

- to open an existing project select a folder where you already have the generated files (output.json, config.json or flow.json)

<img width="906" alt="image" src="https://user-images.githubusercontent.com/15820565/215472668-02778139-7870-48ac-a0d2-d4110218ad0f.png">

### Config tab

Fill in the rootURL of the application under test:

<img width="906" alt="image" src="https://user-images.githubusercontent.com/15820565/215423279-5945ec08-cc12-40e2-9095-3b5ebeb728f7.png">

#### Config tab - URL Replacers section

You have the possibility to replace the application resources with some generic aliases, in order to be able to address that page in a generic manner. For this, Marvin allows you to define replacer rules (regex or exact match) for application URLs.

`Eg: An URL in the application under test could be: `https://localhost:4200/articles/2423453254354356465` -> for the Article details page. We want to refer the Article details page for any article from the application. In this case we want to have something like this: `https://localhost:4200/articles/{articleId}`. `

<img width="906" alt="image" src="https://user-images.githubusercontent.com/15820565/215424951-959598db-4a12-4888-85a4-a4588d0d7a8b.png">

#### Config tab - Info Selectors section

You have the possibility to extend the default info selectors that are configured in the source code. 

`Eg: span, p are not included in the default info selectors`

<img width="906" alt="image" src="https://user-images.githubusercontent.com/15820565/215425852-901cc9c0-6914-401d-baee-f99762ef83e1.png">

#### Config tab - Action Selectors section

You have the possibility to extend the default action selectors that are configured in the source code. 

`Eg: .button is not included in the default action selectors.`

<img width="906" alt="image" src="https://user-images.githubusercontent.com/15820565/215425931-b2cf060a-ed41-474a-ac6f-17cbfb8b32f4.png">

#### Config tab - Input Selectors section

You have the possibility to extend the default input selectors that are configured in the source code. 

<img width="906" alt="image" src="https://user-images.githubusercontent.com/15820565/215426501-9289ebb4-e379-48fe-a7da-32d404e07be1.png">

#### Config tab - Iterators section

You have the posibility to define some rules to uniquely identify an item from a list / table. This iterator will allow you to perform actions (eg: delete, edit) on a specific item from the list, that satisfies some rules (eg: you want to delete an article from the list that has a specific tile, defined in `identifier` element of the iterator configuration)

<img width="906" alt="image" src="https://user-images.githubusercontent.com/15820565/215426748-9d273f41-a90c-476d-9a97-720de1f55fca.png">


#### Config tab - Optimizer section

You have the possibility to change the default priority that is used to determine an unique locator for each element from the current page. The default order for defining an unique locator is: tag, id, attribute, class.

Also you have the possibility to exclude some tag / id / attribute / class, by defining a regex and/or an exact value.

#### Config tab - Store section

You have the possibility to define run parameters (eg: username and password) for the application under test, to use them in the execution flows.

<img width="906" alt="image" src="https://user-images.githubusercontent.com/15820565/215430155-0a1b78c9-6d49-43ca-9bd7-7625a1cd76eb.png">

### Execution workflow tab

You have the possibility to define methods for each page from the application under test, to execute them with different parameters and to run the entire flow or a partial flow. At each step from the flow, all the elements from the current page are automatically discovered and when step execution is completed, a screenshot is taken to see the current result. 

#### Add a new step in the graph

Clicking on the '+' sign, a side panel is displayed where the user can create a new method or select an existing one.

<img width="906" alt="image" src="https://user-images.githubusercontent.com/15820565/215433069-58b45421-d774-4e6a-83bb-1034a3e31507.png">

 A. **Create new method**

Clicking on the 'Create a new method' button, a side panel is displayed where you can select all the needed elements.

<img width="906" alt="image" src="https://user-images.githubusercontent.com/15820565/215434519-c71274cc-b8cf-4c1e-ae21-16eec177135e.png">

 B. **Select an existing method**
 
Clicking on the 'Select method' dropdown a list of existing methods for the current page is displayed.

<img width="906" alt="image" src="https://user-images.githubusercontent.com/15820565/215434660-76947671-1471-41c8-ab43-d09b1e0083fe.png">

Selecting a method from the list, you will be able to define values for the method parameters (in case the selected method has 'fillAndClear' elements).

<img width="906" alt="image" src="https://user-images.githubusercontent.com/15820565/215434781-4df280eb-1108-4119-9619-1170db16f05d.png">


> 🚩 **Note**
> After defining a method execution, a new step is inserted in the graph:

<img width="906" alt="image" src="https://user-images.githubusercontent.com/15820565/215434883-6e5e8ed9-ea4f-490b-b519-02e49eb85e00.png">

#### Execute a step from the graph

Clicking on 'play' button for a step from the graph, the corresponding branch will be executed ul to the current step.

<img width="906" alt="image" src="https://user-images.githubusercontent.com/15820565/215436370-875a42ff-6ef2-4951-9f9b-d31d2156afcd.png">

The execution is highlighted:

<img width="906" alt="image" src="https://user-images.githubusercontent.com/15820565/215436509-5c87d451-548d-4605-acac-3921534125bd.png">

#### View locators list

After running a step from the graph, the view locators list button is available. Clicking on it a side panelis displayed, where all discovered locators are listed.

<img width="906" alt="image" src="https://user-images.githubusercontent.com/15820565/215437332-4bc6e370-0293-40ad-978c-e145b2c1b25b.png">

<img width="906" alt="image" src="https://user-images.githubusercontent.com/15820565/215437415-d9d9bf9a-c095-4ece-b8fc-770db7a52abc.png">

#### View screenshot

After running a step from the graph, the view screenshot button is available. Clicking on it a screenshot of the actual step execution result is displayed.

<img width="906" alt="image" src="https://user-images.githubusercontent.com/15820565/215437504-877c9535-b30c-44a6-a8c7-d383e4e396e9.png">

<img width="906" alt="image" src="https://user-images.githubusercontent.com/15820565/215437548-fba90c74-02df-48b1-8859-95b1b76cefa0.png">

#### Delete a step from the graph

Clicking on 'Delete icon' for a step from the graph will remove that step execution from the graph.

<img width="906" alt="image" src="https://user-images.githubusercontent.com/15820565/215438039-e014b3c3-cb1b-459d-878a-223670cd2971.png">

<img width="906" alt="image" src="https://user-images.githubusercontent.com/15820565/215438234-3c529b3e-ac4c-4ef4-ab14-9780b324a2d1.png">

It deletes only the method execution. The method definition is still available in the list and can be used with different parameter values.

<img width="906" alt="image" src="https://user-images.githubusercontent.com/15820565/215438740-dc74f959-4b94-4470-b20b-511f27e8caed.png">

<img width="906" alt="image" src="https://user-images.githubusercontent.com/15820565/215438673-999a26ea-68b9-4854-af28-81558579fa03.png">
