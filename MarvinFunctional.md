#### Configurations - URL Replacers

<u>Details

While the URL could contain resource Ids, when accessing a page from the application under test, the URL Replacers configuration shall allow replacing that resource with an alias to generically address that page.

<u>Example

Let's say a page URL looks like this: https://localhost:4200/articles/2423453254354356465` and we want to replace the id with an alias - {articleId}
URL Replacers: 
Alias: {articleId}
Regex: (?<=articles/)[A-Za-z0-9-]+ OR Exact Match: '2423453254354356465'
   
<u>Affects
- Discovery
- Method Creation and Execution



























