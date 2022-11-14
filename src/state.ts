import {
    PageEmittedEvents,
    Page,
    PageEventObject,
    HTTPRequest,
    HTTPResponse,
} from 'puppeteer';
import {log} from './utils/logger';

export class State {
    private netowrkRequests: any = {};

    constructor(private readonly page: Page) {
        const logRequests = false;

        page.on(
            PageEmittedEvents.Request,
            (interceptedRequest: HTTPRequest) => {
                const url = interceptedRequest.url();
                if (logRequests) {
                    log(`Request: ${url}`, 'yellow');
                }
                if (this.netowrkRequests[url]) {
                    log(`Request ${url} already exists`, 'red');
                }

                this.netowrkRequests[url] = new Date().getTime();

                interceptedRequest.continue();
            }
        );

        page.on(PageEmittedEvents.Response, (response: HTTPResponse) => {
            const url = response.url();
            if (logRequests) {
                log(`Response: ${url}`, 'yellow');
            }
            delete this.netowrkRequests[url];
        });
    }

    public reportOnPendingRequests() {
        console.log('Report');
        console.log(this.netowrkRequests);
        const pendingRequests = Object.keys(this.netowrkRequests);
        const now = new Date().getTime();
        if (pendingRequests.length > 0) {
            for (const url of pendingRequests) {
                const time = now - this.netowrkRequests[url];
                log(
                    `Pending request ${url.slice(0, 100)} for ${time} ms`,
                    'red'
                );
            }
        }
    }
}
