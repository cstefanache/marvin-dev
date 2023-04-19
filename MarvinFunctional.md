#### Configurations - URL Replacers

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

#### Configurations - Info / Action / Input Selectors

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
  
  
 #### Configurations - Iterators
 
 <ins>Details</ins>
 
 While the lists/tables require defining more specific CSS selectors to uniquely identify an item, when accessing a page from the application under test that contains a list of items, the Iterators configurations shall allow defining such specific rules to automatically discover a specific item from the list, based on its text content.
 
 <ins>Example</ins>
 
 
 <ins>Affects</ins> <br />
  Execution Output (discovery) <br /> 
 


 
  
  





























