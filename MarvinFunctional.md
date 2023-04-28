### Configurations - URL Replacers

<ins>Details</ins>

While the URL could contain resource Ids, when accessing a page from the application under test, the URL Replacers configuration shall allow replacing that resource with an alias to generically address that page.

<ins>Example</ins>

Let's say a page URL looks like this: https://localhost:4200/articles/2423453254354356465` and we want to replace the id with an alias - https://localhost:4200/articles/{articleId} <br />
URL Replacers: <br />
Alias: `'{articleId}'` <br />
Regex: `'(?<=articles/)[A-Za-z0-9-]+'` OR Exact Match: `'2423453254354356465'` <br />
   
<ins>Affects</ins> <br />
Execution Output (discovery) <br />
Method Creation and Execution <br />

### Configurations - Info / Action / Input Selectors

<ins>Details</ins>

While the default info / action / input selectors are defined directly in code in the discovery package (discovery.ts file), when accessing a page from the application under test, the Info / Action / Input Selectors configurations shall allow extending the default selectors in the autodiscovery phase.

<ins>Example</ins>

Let's say the default selectors for info aliases are these:  
`info: [
    {
      name: 'Headers',
      selectors: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    },
  ]`
 This means that only `h1`, `h2`, `h3`, `h4`, `h5` and `h6` elements are automatically discovered. <br />
 Info Selectors: <br />
 Alias: 'Info Sections' <br />
 Selector: `span`, `p` <br />
 
 In this way, also `span` and `p` elements are automatically discovered in the discovery phase.
 
 <ins>Affects</ins> <br />
  Execution Output (discovery) <br />
  
  
 ### Configurations - Iterators
 
 <ins>Details</ins>
 
 While the lists/tables require defining more specific CSS selectors to uniquely identify an item, when accessing a page from the application under test that contains a list of items, the Iterators configurations shall allow defining such specific rules to automatically discover a specific item from the list, based on its text content.
 
 <ins>Example</ins><br />
 Let's say we have a web page that contains a list of items and each item has a title and a button. We want to click on the button for an item that has a specific title. <br />
 In this case, we should define an iterator like below: 
 
 Alias name: '<iterator_name>' -> iterator_name - a name of the iterator <br />
 CSS Selector: '<root_item_CSS_selector>' -> roor_item_CSS_selector is a valid selector that uniquely identify an item from the list <br />
 (eg: `div[itemtype='http://schema.org/LocalBusiness']`) <br />
 Identifier: '<iterator_identifier_CSS_selector>' - iterator_identifier_CSS_selector is a valid selector that identifies the item's title. It is calculated relative to the root_item_CSS_selector (eg: `h2`) <br />
 Elements: <br /> - here you can define multiple elements <br />
    Name: '<element_name>' -> element_name - a name for the element (eg: 'Button') <br />
    Selector: '<element_selector>' -> element_selector is a valid selector that identifies the item's button. It is calculated relative to the root_item_CSS_selector (eg: `.btn-block`) <br />
 
 <ins>Affects</ins><br />
  Execution Output (discovery) <br />
  Method Creation and Execution <br />
  
  ### Workspace - Root Folder
  
  <ins>Details</ins> <br />
  
  While the base URL of the application under test is defined in the configuration section and is loaded directly from the code using Puppeteer, when creating a Marvin workspace from the scratch or changing the base URL in the configuration page, the root folder shall allow loading the base URL from the Marvin UI by pressing the run button next to the root folder.  
  
  ### Workspace - Create a new method
  
  <ins>Details</ins> <br />
  
  While the discovery is finished, when the user wants to navigate to another page in the application under test, the create method functionality shall allow adding new methods, by clicking on 'Add button' ('+' sign) and then by clicking on 'Create a new method' button. 
  
  > 🚩 **Note**
  - For the sequence, the user can select multiple locators. <br />
  - The supported actions for a locator are: check, click, clearAndFill, fill, noAction. <br />
  - 'fill' and 'clearandFill' should be used for input elements <br />
  - 'check' can be used for any elements and performs a comparison between the text content of the current element and the value provided at method execution <br />
  - For 'check' action, the available operators are: eq (equal), neq (not equal), gt (greater than), lt (less than), gte (greater than or equal), lte (less then or equal), contains, doesNotContain <br />
  - For 'check' action, the default comparison is 'by string' but there is also the posibility to define a number comparison by checking 'Is Number' <br />
  - For 'check' action, text content of the current element can be processed before the comparison is performed, by defining a string processing using javascript code inside the 'Post Process value' field <br />
  - For any action, by checking 'Store content or attribute value' the user can define a 'Variable Name' - where to store the text content of the current element, or can store an attribute value of the current element by specifying the attribute name in 'Store value from attribute' field <br />
  - By default, any method is local - meaning that the method is accessible only on the specified URL (the one used at method creation time) <br />
  - By checking 'Global Method' the method becomes global - meaning that the method is accessible from any page of the application under test <br />
  - After selecting an element from the list, the user can customize the locator because the field is editable <br />

  ### Workspace - Create a method execution
  
  <ins>Details</ins><br />
  
 While the method is already created, when the user wants to define a method execution, the create method execution functionality shall allow adding new execution (step) in the tree by clicking on the 'Add button' ('+' sign) and then selecting an existing method from the dropdown, defining values for input parameters and saving the execution by clicking on 'Submit' button.
 
 <ins>Example</ins><br />
 Let's say the login page of the application under test is loaded in the browser. To log in the application using Marvin, these steps are necessary:
 - create a new method using (eg: Login) that has: 'username' input - clearAndFill type, 'password' input - clearAndFill type and 'Sign In' button - click type
 - select the 'Login' method from the dropdown 
 - fill in username and password values for the input fields

<ins>Affects</ins><br />
Method Execution<br />
  
  ### Workspace - Execute a step
  
  While the step (method) is already added in the tree, when the user wants to execute a specific flow from the tree, the play functionality shall allow executing a flow (from the root up to the current step) by clicking on a step from the tree and clicking on the 'play' button.
  
  ### Workspace - How to use memory store random values in flow
  
  Let's say we have a banking application. We want to create a new transaction with some details - eg: 'test-123`. Then search for that specific transaction (test-123) to check the transaction details. Below is an example for a Marvin flow for this situation:
  - a login method
  - a method that navigates to the new transaction page
  - a method that clicks on the 'Create' button
  - a method that fills in all the details for a bancking transaction (amount, payment details). 'Amount' and 'payment datials' are 'clearAndFill' elements. For payment details element you have to check 'stote' option and provide a name for tha global variable where you want to store the payment details value - eg: `paymentDetails` the name of the variable and the value `Test-${library.func.random()}` meaning that it will generate a random value at runtime, somtehing like this: `paymentDetails = Test-5667767878788`
  - a method that navigates to the transaction list
  - a method that clicks on the created transction - it should click on a specific transaction that matches the value stored in `paymentDetails` variable. eg: `${store.paymentDetails}`
  
  ### Workspace - How to define loops and conditions
  
  Let's say we have an online shop application. We want to iterate through all the products and add to favorites only the ones from a specific brand (eg: Nike). Below is an example for a Marvin flow for this situation:
  - a method that iterates through all the products:
            - select the 'brand name' element and select for it 'noAction' type
            - check 'store' and fill in a variable name where to keep the brand name value - eg: `brandName`
            - in ‘For Each Matched Element’ dropdown select the parent element (the one that identifies a product item from the list)
           
  - a method that clicks on 'Add to Favorites' button based on a condition on `brandName`
            - select the 'Add to Favorites' element with type 'click'
            - in 'Condition' field fill in `'${store.brandName}'==='NIKE'`

   > 🚩 **Note**
    When the user executes a method that contains a loop it executes all the children within that loop. 
    
  
  ### Methods 
  
  All the methods are listed under the 'Methods' page. 
  Are grouped by:<br />
      - URL - in case the method is local<br />
      - global - in case the method is global<br />
      
  In case the method is used in the workspace tree, the 'highlight' icon is displayed with a number of executions next to the method name, otherwise the 'trash' icon is displayed without any number.
  Clicking on the method name, the method body is displayed on the right side and the user can update the method. 
  Clicking on the highghlight icon, the user is redirected to the workspace tree and that specific method is highlighted with green in the tree.
  Clicking on the 'trash' icon the method is deleted. 
  
  ### Sequences
  
  
  ### Generate Cypress Tests
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
 


 
  
  





























