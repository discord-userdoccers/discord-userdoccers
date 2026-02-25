import React from "react";

export default function Paragraph(props: React.JSX.IntrinsicElements["p"]) {
  return <p className="text-text-light dark:text-text-dark mt-4 mb-4 text-base leading-6" {...props} />;
}
