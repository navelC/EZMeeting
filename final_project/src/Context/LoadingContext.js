import React from "react";

const LoadingContext = React.createContext({
  loading: false,
  setLoading: () => {},
  user: {},
  setUser: () => {},
});
export default LoadingContext;