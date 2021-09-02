export default function Paragraph(props: JSX.IntrinsicElements["p"]) {
  return (
    <p
      className="text-text-light dark:text-text-dark mb-4 mt-4 text-base leading-6"
      {...props}
    />
  );
}
