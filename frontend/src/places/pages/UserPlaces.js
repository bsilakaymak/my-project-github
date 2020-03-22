import React, { Fragment, useState, useEffect } from "react";
import PlaceList from "../components/PlaceList";
import { useParams, useHistory } from "react-router-dom";
import useHttpClient from "../../shared/hooks/http-hook";
import ErrorModal from "../../shared/component/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/component/UIElements/LoadingSpinner";
import "./UserPlaces.css";

const UserPlaces = () => {
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [places, setPlaces] = useState();
  const userId = useParams().userId;
  const history = useHistory();
  const [user, setUser] = useState();
  useEffect(() => {
    const getUser = async () => {
      try {
        const data = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/users/${userId}/`
        );
        setUser(data);
      } catch (err) {}
    };
    getUser();
  }, [sendRequest, userId]);

  useEffect(() => {
    const getPlaces = async () => {
      try {
        const data = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/places/user/${userId}`
        );
        setPlaces(data.userWithPlaces);
      } catch (error) {}
    };
    getPlaces();
  }, [sendRequest, userId]);
  const placeDeleteHandler = detetedPlaceId => {
    setPlaces(prevPlaces =>
      prevPlaces.filter(places => places.id !== detetedPlaceId)
    );
  };
  const getError = err => {
    if (!places && !isLoading) {
      return (
        <h2 className="center yellow-text fade-in">
          There is no place shared by this user
        </h2>
      );
    } else {
      return <h2>{err}</h2>;
    }
  };
  const goHome = () => {
    history.push("/");
  };
  if (error)
    return (
      <ErrorModal
        error={getError(error)}
        header="Hello there!"
        onClear={goHome}
      />
    );
  if (isLoading)
    return (
      <div className="center">
        <LoadingSpinner />
      </div>
    );

  return (
    <Fragment>
      <div className="place-overlay-container">
        <div className="place-overlay animated fadeOut"></div>
        <h2 className="center yellow-text inline">
          Places of <span className="pink-text"> {user && user.user.name}</span>{" "}
        </h2>
        <ErrorModal error={error} onClear={clearError} />
        {!isLoading && places && (
          <PlaceList items={places} onDeletePlace={placeDeleteHandler} />
        )}
      </div>
    </Fragment>
  );
};

export default UserPlaces;
