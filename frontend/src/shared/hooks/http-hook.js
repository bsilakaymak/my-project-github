import { useState, useCallback, useRef, useEffect } from "react";
const useHttpClient = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();

  const activeHttpRequests = useRef([]);

  const sendRequest = useCallback(
    async (url, method = "GET", body = null, headers = {}) => {
      setIsLoading(true);
      const httpAbortCtrll = new AbortController();
      activeHttpRequests.current.push(httpAbortCtrll);
      try {
        const res = await fetch(url, {
          method,
          body,
          headers,
          signal: httpAbortCtrll.signal
        });
        const data = await res.json();
        activeHttpRequests.current = activeHttpRequests.current.filter(
          reqCtrl => reqCtrl !== httpAbortCtrll
        );
        if (!res.ok) {
          throw new Error(data.message);
        }
        setIsLoading(false);
        return data;
      } catch (error) {
        setError(error.message || "Somthing went wrong, pleace try again.");
        setIsLoading(false);
        throw error;
      }
    },
    []
  );
  const clearError = () => {
    setError(null);
  };
  useEffect(() => {
    return () => {
      activeHttpRequests.current.forEach(abortCtrl => abortCtrl.abort());
    };
  }, []);
  return { isLoading, error, sendRequest, clearError };
};
export default useHttpClient;
