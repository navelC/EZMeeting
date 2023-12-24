import { useContext } from "react";
import LoadingContext from "../Context/LoadingContext";

// Use show loading when call api
export default function useLoading() {
  const { setUser } = useContext(LoadingContext);

  const showLoading = () => {
    setLoading(true);
  };

 
  return [showLoading, hideLoading];
}