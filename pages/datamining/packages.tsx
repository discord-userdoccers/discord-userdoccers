import PackageView from "@components/data-packages/PackageView";
import ContentWrapper from "../../components/mdx/ContentWrapper";
import { H1 } from "../../components/mdx/Heading";
import Paragraph from "@components/mdx/Paragraph";

export default function Packages() {
  return (
    <ContentWrapper>
      <H1>Data Packages</H1>

      <Paragraph>
        {/* TODO(arhsm): replace this */}
        Extract your data package and upload it or something
      </Paragraph>
      <PackageView />
    </ContentWrapper>
  );
}

Packages.meta = {
  title: "Data Packages",
  description: "meow :3",
};
