import { Replacer } from '../models/config';

export function processUrl(currentUrl: string, replacers: Replacer[], rootUrl: string): string {
  let url = currentUrl.replace(rootUrl, '');
  
  if (replacers && replacers.length) {
    for (const replacer of replacers) {
      const regex = new RegExp(replacer.regex, 'g');
      if (regex.exec(url) !== null) {
        url = url.replace(regex, replacer.alias);
        break;
      }
    }
  }
  return url;
}
