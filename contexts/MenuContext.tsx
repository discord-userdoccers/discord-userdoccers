import { createContext } from "react";

const context = createContext({
  open: false,
  setOpen: () => {},
  setClose: () => {},
});
export default context;
