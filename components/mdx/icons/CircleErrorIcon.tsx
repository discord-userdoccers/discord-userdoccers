import { FC } from "react";

export const CircleErrorIcon: FC<React.JSX.IntrinsicElements["svg"]> = (props) => (
  <svg
    aria-label="CircleErrorIcon"
    aria-hidden="false"
    role="img"
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <circle cx="12" cy="12" r="10" fill="transparent"></circle>
    <path
      fill-rule="evenodd"
      d="M12 23a11 11 0 1 0 0-22 11 11 0 0 0 0 22Zm1.44-15.94L13.06 14a1.06 1.06 0 0 1-2.12 0l-.38-6.94a1 1 0 0 1 1-1.06h.88a1 1 0 0 1 1 1.06Zm-.19 10.69a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0Z"
      clip-rule="evenodd"
    ></path>
  </svg>
);
