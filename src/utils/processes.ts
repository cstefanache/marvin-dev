export function processUrl(rootUrl: string, replacers: any): string {
    let url = rootUrl;
    for (const replacer of replacers) {
        const regex = new RegExp(replacer.regex, 'g');
        if (regex.exec(url) !== null) {
            url = url.replace(regex, replacer.alias);
            break;
        }
    }
    return url;
}
