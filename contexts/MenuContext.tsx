import { createContext } from "react";

/* eslint-disable @typescript-eslint/no-empty-function */

const context = createContext({
  open: false,
  setOpen: () => {},
  setClose: () => {},
});
export default context;
