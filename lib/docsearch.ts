export default (() => {
  if (typeof global.XMLHttpRequest != "undefined") {
    const { host: targetHost, pathname: targetPath } = new URL(
      `https://${process.env.NEXT_PUBLIC_ALGOLIA_APP_ID ?? "JAJUDFJBI4"}-dsn.algolia.net`,
    );

    const originalOpen = global.XMLHttpRequest.prototype.open;
    const originalSend = global.XMLHttpRequest.prototype.send;

    global.XMLHttpRequest.prototype.open = function (method, url) {
      const { host, pathname } = new URL(url);
      (this as any).__is_docsearch_query = method === "POST" && host === targetHost && pathname === targetPath;

      return originalOpen.apply(this, arguments as any);
    };

    global.XMLHttpRequest.prototype.send = function (body) {
      const xhr = this;

      const modifyResponse = () => {
        if ((xhr as any).__is_docsearch_query) {
          const originalResponse = xhr.responseText;

          Object.defineProperty(xhr, "responseText", {
            get: () => {
              const response = JSON.parse(originalResponse);

              for (const result of response.results) {
                for (const hit of result.hits) {
                  hit.url = new URL(hit.url).pathname;
                }
              }

              return JSON.stringify(response);
            },
            configurable: true,
          });
        }
      };

      this.addEventListener("readystatechange", function () {
        if (xhr.readyState === 4) {
          modifyResponse();
        }
      });

      return originalSend.apply(this, arguments as any);
    };
  }
})();
