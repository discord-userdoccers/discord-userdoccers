import { DocSearch } from "@docsearch/react";

const config = {
  appId: process.env.NEXT_PUBLIC_ALGOLIA_APP_ID ?? "JAJUDFJBI4",
  apiKey: process.env.NEXT_PUBLIC_ALGOLIA_API_KEY ?? "13092021a31a84e0e8676c10affb9a16",
  index: process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME ?? "discord-usercers",
};

export default function Searchbar() {
  return (
    <DocSearch
      appId={config.appId}
      apiKey={config.apiKey}
      indexName={config.index}
      placeholder="Search documentation"
      transformItems={(items) => items.map((hit) => ({ ...hit, url: new URL(hit.url).pathname }))}
      insights
    />
  );
}
