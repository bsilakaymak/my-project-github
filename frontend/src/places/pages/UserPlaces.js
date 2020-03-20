import React, { Fragment, useState, useEffect } from "react";
import PlaceList from "../components/PlaceList";
import { useParams } from "react-router-dom";
import useHttpClient from "../../shared/hooks/http-hook";
import ErrorModal from "../../shared/component/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/component/UIElements/LoadingSpinner";

const UserPlaces = () => {
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [places, setPlaces] = useState();
  const userId = useParams().userId;

  useEffect(() => {
    const getPlaces = async () => {
      try {
        const data = await sendRequest(
          `http://localhost:5000/api/places/user/${userId}`
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
  return (
    <Fragment>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && (
        <div className="center">
          {" "}
          <LoadingSpinner />
        </div>
      )}
      {(error || !places) && !isLoading && <h2 className="center yellow-text">There is no place shared by this user</h2>}
      {!isLoading && places && (
        <PlaceList items={places} onDeletePlace={placeDeleteHandler} />
      )}
    </Fragment>
  );
};

export default UserPlaces;
