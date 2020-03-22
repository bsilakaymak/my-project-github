import React, { useState, useEffect, useContext } from "react";
import { useParams, useHistory, Link } from "react-router-dom";
import BucketListItem from "./BucketListItem";
import useHttpClient from "../../shared/hooks/http-hook";
import "./BucketList.css";
import LoadingSpinner from "../../shared/component/UIElements/LoadingSpinner";
import { AuthContext } from "../../shared/context/auth-context";
import ErrorModal from "../../shared/component/UIElements/ErrorModal";

let herokuLink = process.env.PUBLIC_URL;
const BucketList = () => {
  const [placesLoading, setPlacesLoading] = useState(false);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const history = useHistory();
  const [places, setPlaces] = useState();
  const { userId } = useParams();
  const auth = useContext(AuthContext);
  const deleteFromBucketList = id => {
    setPlaces(prevPlaces => prevPlaces.filter(place => place.id._id !== id));
    history.push(`/`);
  };
  useEffect(() => {
    setPlacesLoading(true);
    const getBucketList = async () => {
      try {
        const data = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/places/user/${userId}/mybucketlist`
        );
        setPlaces(data.userWithBucketList);
        setPlacesLoading(false);
      } catch (err) {}
    };
    getBucketList();
  }, [sendRequest, userId]);
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
  const getError = err => {
    if (userId === auth.userId && !places && !isLoading) {
      return (
        <h2
          className="center yellow-text fade-in"
          style={{ flexDirection: "column" }}
        >
          You don't have any places in your bucket list. Maybe check some
          places?
          <Link to="/"> Go to home</Link>
        </h2>
      );
    }
    if (userId !== auth.userId && !places && !isLoading) {
      return (
        <h2 className="center yellow-text fade-in">
          This user does not have any places in their bucket list
        </h2>
      );
    }else{
      return (
        <h2 className="center yellow-text fade-in">
          {err}
        </h2>
      )
    }
  };
  const goHome = () => {
    clearError();
    history.push("/");
  };

  if (error) {
    return <ErrorModal error={getError(error)} onClear={goHome} header={`Hey!`} />;
  }
  if (isLoading)
    return (
      <div className="center">
        <LoadingSpinner />
      </div>
    );

  return (
    <div>
      {userId === auth.userId && (
        <div className="share-box">
          <div className="share-button">
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                `${herokuLink}/${userId}/mybucketlist`
              )}&text=My%2C+Travel%2C+Bucket%2C+List.&hashtags=travelling,wanderlust,yourplacesapp`}
            >
              <i className="fab fa-twitter-square"></i>
            </a>
            <a
              href={`https://www.facebook.com/sharer.php?u=${encodeURIComponent(
                `${herokuLink}/${userId}/mybucketlist`
              )}`}
            >
              <i className="fab fa-facebook-square"></i>
            </a>
          </div>
          <p>SHARE</p>
        </div>
      )}
      <React.Fragment>
        <h2 className="center yellow-text">
          Bucket List of{" "}
          <span className="pink-text"> {user && user.user.name}</span>{" "}
        </h2>

        <div className="bucket-list-content">
          {places &&
            places.map((bucket, index) => {
              return (
                <BucketListItem
                  bucket={bucket}
                  key={index}
                  index={index}
                  deleteBucket={deleteFromBucketList}
                />
              );
            })}
        </div>
      </React.Fragment>
    </div>
  );
};

export default BucketList;
