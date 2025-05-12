type XMLHttpRequestOpen = (this: XMLHttpRequest, ...args: Parameters<XMLHttpRequest["open"]>) => void;

export default (() => {
  if (typeof global.XMLHttpRequest != "undefined") {
    const { host: targetHost, pathname: targetPath } = new URL(
      `https://${process.env.NEXT_PUBLIC_ALGOLIA_APP_ID ?? "JAJUDFJBI4"}-dsn.algolia.net`,
    );

    const originalOpen = global.XMLHttpRequest.prototype.open;
    const originalSend = global.XMLHttpRequest.prototype.send;

    function open(this: XMLHttpRequest, ...args: Parameters<XMLHttpRequestOpen>) {
      const [method, url] = args;

      const { host, pathname } = new URL(url);

      (this as any).__is_docsearch_query = method === "POST" && host === targetHost && pathname === targetPath;

      return originalOpen.apply(this, args);
    }

    function send(this: XMLHttpRequest, ...args: Parameters<XMLHttpRequest["send"]>) {
      this.addEventListener("readystatechange", () => {
        if (this.readyState === 4) {
          if ((this as any).__is_docsearch_query) {
            const originalResponse = this.responseText;

            Object.defineProperty(this, "responseText", {
              get: () => {
                const response = JSON.parse(originalResponse);

                for (const result of response.results) {
                  for (const hit of result.hits) {
                    hit.url = new URL(hit.url as string).pathname;
                  }
                }

                return JSON.stringify(response);
              },
              configurable: true,
            });
          }
        }
      });

      return originalSend.apply(this, args);
    }

    (global.XMLHttpRequest.prototype.open as XMLHttpRequestOpen) = open;
    global.XMLHttpRequest.prototype.send = send;
  }
})();
