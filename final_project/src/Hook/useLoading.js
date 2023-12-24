import { useContext } from "react";
import LoadingContext from "../Context/LoadingContext";

// Use show loading when call api
export default function useLoading() {
  const { setLoading } = useContext(LoadingContext);

  const showLoading = () => {
    setLoading(true);
  };

  const hideLoading = () => {
    setLoading(false);
  };
  return [showLoading, hideLoading];
}