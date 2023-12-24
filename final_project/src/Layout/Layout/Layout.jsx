import React, { useState } from "react";
import LoadingContext from "../../Context/LoadingContext";
import Loading from "../../Loading";
// import { OverLayContext } from "../context";

const Layout = (props) => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({});
  return (
    <LoadingContext.Provider value={{ loading, setLoading, user, setUser }}>
      {loading && <Loading loading={loading} />}
      {props.children}
    </LoadingContext.Provider>
  );
};

export default Layout;