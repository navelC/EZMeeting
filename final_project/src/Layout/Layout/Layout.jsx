import React, { useState } from "react";
import LoadingContext from "../../Context/LoadingContext";
import Loading from "../../Loading";
// import { OverLayContext } from "../context";

const Layout = (props) => {
  const [loading, setLoading] = useState(false);
  return (
    <LoadingContext.Provider value={{ loading, setLoading}}>
      {loading && <Loading loading={loading} />}
      {props.children}
    </LoadingContext.Provider>
  );
};

export default Layout;