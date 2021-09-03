import { createContext } from "react";

const context = createContext({ open: false, setOpen: () => {} });
export default context;
