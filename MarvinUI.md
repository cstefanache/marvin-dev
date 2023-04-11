### Projects page

Create a new project:

- to start a new project from scratch select an empty folder - where Marvin will generate all the files (discovery output - output.json file, configuration file - config.json file, execution workflow - flow.json file and screenshots folder)

<img width="1790" alt="image" src="https://user-images.githubusercontent.com/15820565/231079936-1dda1862-46ae-4a22-a446-a9ddcdb05ce2.png">

Open an existing project:

- to open an existing project select a folder where you already have the generated files (output.json, config.json, flow.json)

<img width="1790" alt="image" src="https://user-images.githubusercontent.com/15820565/231080570-f76ddec6-3645-49cd-8ee7-1d3103fdc19f.png">

Recent projects:

- from the recent projects you can select a specific project by clicking on the corresponding item
- to clear the recent projects list click on the 'trash' icon for the corresponding project

<img width="1790" alt="image" src="https://user-images.githubusercontent.com/15820565/231083998-aa1b58cb-127d-43df-8ed4-10116cdb9d5f.png">

### Config page

Fill in the rootURL of the application under test:

<img width="1790" alt="image" src="https://user-images.githubusercontent.com/15820565/231102582-fa8aa530-6429-4bd8-9ba3-2f6791bf3916.png">

#### Config page - URL Replacers section

You have the possibility to replace the application resources with some generic aliases, in order to be able to address that page in a generic manner. For this, Marvin allows you to define replacer rules (regex or exact match) for application URLs.

`Eg: An URL in the application under test could be: `https://localhost:4200/articles/2423453254354356465` -> for the Article details page. We want to refer the Article details page for any article from the application. In this case we want to have something like this: `https://localhost:4200/articles/{articleId}`. `

<img width="1790" alt="image" src="https://user-images.githubusercontent.com/15820565/231103566-1f5ef95f-304d-4ba1-ae3f-e819d54b70d6.png">

#### Config page - Info Selectors section

You have the possibility to extend the default info selectors that are configured in the source code. 

`Eg: span, p are not included in the default info selectors`

<img width="1790" alt="image" src="https://user-images.githubusercontent.com/15820565/231103826-e5241d16-318b-464f-9ce7-238dbf7e57ff.png">

#### Config page - Action Selectors section

You have the possibility to extend the default action selectors that are configured in the source code. 

`Eg: .button is not included in the default action selectors.`

<img width="1790" alt="image" src="https://user-images.githubusercontent.com/15820565/215425931-b2cf060a-ed41-474a-ac6f-17cbfb8b32f4.png">

#### Config page - Input Selectors section

You have the possibility to extend the default input selectors that are configured in the source code. 

<img width="1790" alt="image" src="https://user-images.githubusercontent.com/15820565/231104377-308d4892-ebfa-4df8-9ad1-9e6bb120a0a3.png">

#### Config page - Iterators section

You have the posibility to define some rules to uniquely identify an item from a list / table. This iterator will allow you to perform actions (eg: delete, edit) on a specific item from the list, that satisfies some rules (eg: you want to delete an article from the list that has a specific tile, defined in `identifier` element of the iterator configuration)

<img width="1790" alt="image" src="https://user-images.githubusercontent.com/15820565/231104757-0fff0a77-67d2-49da-9469-ad71dfe3be45.png">

#### Config page - Optimizer section

You have the possibility to change the default priority that is used to determine an unique locator for each element from the current page. The default order for defining an unique locator is: tag, id, attribute, class.

Also you have the possibility to exclude some tag / id / attribute / class, by defining a regex and/or an exact value.

#### Config page - Store section

You have the possibility to define run parameters (eg: username and password) for the application under test, to use them in the execution flows.

<img width="1790" alt="image" src="https://user-images.githubusercontent.com/15820565/231105557-fa474fd9-7392-48ce-976b-ec9660e6666f.png">

### Workspace page

You have the possibility to define methods for each page from the application under test. You have the possibility to execute these methods with different parameters, across a partial flow or across a whole flow. At each step of the flow, all the elements from the current page are automatically discovered. A screenshot is performed after each step is finished.

#### Add a new step in the flow

Clicking on the '+' sign, a side panel is displayed where the user can create a new method or select an existing one.

<img width="1790" alt="image" src="https://user-images.githubusercontent.com/15820565/215433069-58b45421-d774-4e6a-83bb-1034a3e31507.png">

 A. **Create new method**

Clicking on the 'Create a new method' button, a side panel is displayed where you can select all the needed elements.

<img width="1790" alt="image" src="https://user-images.githubusercontent.com/15820565/215434519-c71274cc-b8cf-4c1e-ae21-16eec177135e.png">

 B. **Select an existing method**
 
Clicking on the 'Select method' dropdown a list of existing methods for the current page is displayed.

<img width="1790" alt="image" src="https://user-images.githubusercontent.com/15820565/215434660-76947671-1471-41c8-ab43-d09b1e0083fe.png">

Selecting a method from the list, you will be able to define values for the method parameters (in case the selected method has 'fillAndClear' elements).

<img width="1790" alt="image" src="https://user-images.githubusercontent.com/15820565/215434781-4df280eb-1108-4119-9619-1170db16f05d.png">


> 🚩 **Note**
> After defining a method execution, a new step is inserted in the flow:

<img width="900" alt="image" src="https://user-images.githubusercontent.com/15820565/231143932-ce7bb418-d963-4e5a-958c-00fb0282d207.png">

#### Execute a step from the graph

Clicking on 'play' button for a step from the graph, the corresponding branch will be executed ul to the current step.

<img width="1790" alt="image" src="https://user-images.githubusercontent.com/15820565/215436370-875a42ff-6ef2-4951-9f9b-d31d2156afcd.png">

The execution is highlighted:

<img width="1790" alt="image" src="https://user-images.githubusercontent.com/15820565/231144179-dfad6470-a581-4250-8eb5-d7fd30c9095d.png">

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
