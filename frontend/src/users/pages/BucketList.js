import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import BucketListItem from "../components/BucketListItem";
import useHttpClient from "../../shared/hooks/http-hook";
import "./BucketList.css";
import LoadingSpinner from "../../shared/component/UIElements/LoadingSpinner";
import ErrorModal from "../../shared/component/UIElements/ErrorModal";
import { AuthContext } from "../../shared/context/auth-context";

let herokuLink = "http://sila.heroku.com";
const BucketList = () => {
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [places, setPlaces] = useState();
  const { userId } = useParams();
  const auth = useContext(AuthContext);
  const deleteFromBucketList = id => {
    setPlaces(prevPlaces => prevPlaces.filter(place => place.id._id !== id));
  };
  useEffect(() => {
    const getBucketList = async () => {
      try {
        const data = await sendRequest(
          `http://localhost:5000/api/places/user/${userId}/mybucketlist`
        );
        setPlaces(data.userWithBucketList);
      } catch (err) {}
    };
    getBucketList();
  }, [sendRequest, userId]);
  if (isLoading)
    return (
      <div className="center">
        <LoadingSpinner />
      </div>
    );
  if (error) {
    return <ErrorModal error={error} onClear={clearError} />;
  }
  return (
    <div>
      <div className="share-box">
        <div className="share-button">
          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
              `${herokuLink}/${userId}/mybucketlist`
            )}&text=${encodeURIComponent(
              "My Travel Bucket List"
            )}.&hashtags=travelling,wanderlust,yourplacesapp`}
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
      <React.Fragment>
        <p>{JSON.stringify(places)}</p>
        {userId !== auth.userId && (error || !places) && (
          <h2 className="center yellow-text">
            This user does not have any places in their bucket list
          </h2>
        )}
        {userId === auth.userId && (error || !places) && (
          <h2 className="center yellow-text" style={{ flexDirection: "column" }}>
            You don't have any places in your bucket list. Maybe check some
            places?
            <Link to="/"> Go to home</Link>
          </h2>
        )}
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
