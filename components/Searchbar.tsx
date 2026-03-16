import { DocSearch } from "@docsearch/react";

const config = {
  appId: import.meta.env.VITE_ALGOLIA_APP_ID ?? "JAJUDFJBI4",
  apiKey: import.meta.env.VITE_ALGOLIA_API_KEY ?? "bcee8efed01610170148dca8c067e80c",
  index: import.meta.env.VITE_ALGOLIA_INDEX_NAME ?? "discord-usercers",
  askAi: {
    indexName: import.meta.env.VITE_ALGOLIA_AI_INDEX ?? "discord-usercers-markdown",
    assistantId: import.meta.env.VITE_ALGOLIA_AI_ASSISTANT ?? "wJV42XivQUJI",
  },
};

export default function Searchbar() {
  return (
    <DocSearch
      appId={config.appId}
      apiKey={config.apiKey}
      indices={[config.index]}
      askAi={config.askAi}
      placeholder="Search documentation"
      transformItems={(items) =>
        items.map((hit) => {
          const url = new URL(hit.url);
          url.host = location.host;
          url.protocol = location.protocol;
          url.port = location.port;
          hit.url = url.toString();

          if (hit.url_without_anchor) {
            const url = new URL(hit.url_without_anchor);
            url.host = location.host;
            url.protocol = location.protocol;
            url.port = location.port;
            hit.url_without_anchor = url.toString();
          }

          return hit;
        })
      }
      insights
    />
  );
}
