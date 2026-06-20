import { createContext } from "react";

const context = createContext({
  open: false,
  setOpen: () => {},
  setClose: () => {},
  sidebarHidden: false,
  toggleSidebarHidden: () => {},
});
export default context;
