import React from "react";
// import BounceLoader from "react-spinners/BounceLoader";
import "./loading.scss"

const Loading = ({ loading }) => {
  return (
    <div className="overlay">
        <div className="spinner">
            {/* <BounceLoader color="#fff" loading={loading} size={50} /> */}
        </div>
    </div>
  );
};

export default Loading;