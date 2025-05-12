(() => {
  const { host: targetHost, pathname: targetPath } = new URL(
    `${document.currentScript.dataset.algoliaHost}/1/indexes/*/queries`,
  );

  const originalOpen = window.XMLHttpRequest.prototype.open;
  const originalSend = window.XMLHttpRequest.prototype.send;

  function open(method, url) {
    const { host, pathname } = new URL(url);
    this.__is_docsearch_query = method === "POST" && host === targetHost && pathname === targetPath;

    return originalOpen.apply(this, arguments);
  }

  function send() {
    this.addEventListener("readystatechange", () => {
      if (this.readyState === 4) {
        if (this.__is_docsearch_query) {
          const originalResponse = this.responseText;

          Object.defineProperty(this, "responseText", {
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
      }
    });

    return originalSend.apply(this, arguments);
  }

  window.XMLHttpRequest.prototype.open = open;
  window.XMLHttpRequest.prototype.send = send;
})();
