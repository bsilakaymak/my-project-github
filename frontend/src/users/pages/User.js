import React, { useEffect, useState, useContext, Fragment } from "react";
import ErrorModal from "../../shared/component/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/component/UIElements/LoadingSpinner";
import useHttpClient from "../../shared/hooks/http-hook";
import { AuthContext } from "../../shared/context/auth-context";
import UserProfile from '../components/UserProfile';
const User = () => {
  const {userId} = useContext(AuthContext);
  const [user, setUser] = useState();
  const { isLoading, error, sendRequest, clearError } = useHttpClient();

  useEffect(() => {
    const getUser = async () => {
      try {
        const data = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/users/${userId}`
        );
        setUser(data.user);
      } catch{}
    };
    getUser();
  }, [sendRequest, userId]);

  return (
    <Fragment>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && (
        <div className='center'>
          <LoadingSpinner />
        </div>
      )}
      {!isLoading && user && <UserProfile user={user} setUser={setUser}/>}
    </Fragment>
  );
};

export default User;
