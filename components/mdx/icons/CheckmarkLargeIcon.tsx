import { FC } from "react";

export const CheckmarkLargeIcon: FC<React.JSX.IntrinsicElements["svg"]> = (props) => (
  <svg
    aria-label="CheckmarkLargeIcon"
    aria-hidden="false"
    role="img"
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    fill="currentColor"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M21.7 5.3a1 1 0 0 1 0 1.4l-12 12a1 1 0 0 1-1.4 0l-6-6a1 1 0 1 1 1.4-1.4L9 16.58l11.3-11.3a1 1 0 0 1 1.4 0Z"
      clipRule="evenodd"
    />
  </svg>
);
