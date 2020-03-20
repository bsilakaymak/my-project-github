import React, { useState, useContext } from "react";
import Button from "../../shared/component/formElements/Button";
import Modal from "../../shared/component/UIElements/Modal";
import { AuthContext } from "../../shared/context/auth-context";
import useHttpClient from "../../shared/hooks/http-hook";
import "./BucketListItem.css";
import LoadingSpinner from "../../shared/component/UIElements/LoadingSpinner";
import ErrorModal from "../../shared/component/UIElements/ErrorModal";
import {Link} from 'react-router-dom'

const BucketListItem = ({ bucket, deleteBucket }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [visited, setVisited] = useState(false);
  const auth = useContext(AuthContext);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const { id } = bucket;
  const openDetailsHandler = () => {
    setShowDetails(true);
  };
  const closeDetailsHandler = () => {
    setShowDetails(false);
  };

  const deleteFromBucketList = async () => {
    try {
      await sendRequest(
        `http://localhost:5000/api/places/user/${bucket.id._id}`,
        "DELETE",
        null,
        {
          Authorization: "Bearer " + auth.token
        }
      );
      deleteBucket(bucket.id._id);
    } catch (err) {}
  };

  const visitedPlace = async () => {
    setVisited(!visited);
    try {
      await sendRequest(
        `http://localhost:5000/api/places/user/${auth.userId}/mybucketlist`,
        "PATCH",
        JSON.stringify({
          isVisited: visited,
          placeId: bucket.id._id
        }),
        {
          "Content-Type": "application/json",
          Authorization: "Bearer " + auth.token
        }
      );
    } catch (error) {}
  };


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
    <div className="bucket-list-item">
      <Modal
        show={showDetails}
        onCancel={closeDetailsHandler}
        header={bucket.name}
        contentClass="place-item__modal-content"
        footerClass="place-item__actions"
        footer={<Button onClick={closeDetailsHandler}>Close</Button>}
      >
        <div className="detail-content">
          <img style={{ width: "30%" }} src={id.image.imageUrl}></img>
  
            <div className="bucket-info">
              <p>{id.description}</p>
              <p>{id.address}</p>
              <p>Shared by: <Link to={`/${id.creator}/places`}>{bucket.createdBy}</Link></p>
            </div>

          </div>
      </Modal>
      <p style={{ textDecoration: visited ? "line-through" : "none" }}>
        {bucket && bucket.id.title}
      </p>
      <Button
        danger
        onClick={() => {
          deleteFromBucketList();
        }}
      >
        Delete
      </Button>
      <Button onClick={() => openDetailsHandler()}>Show Details</Button>
      <Button inverse onClick={() => visitedPlace()}>
        {visited ? "Not Visited" : "Visited"}
      </Button>
    </div>
  );
};
export default BucketListItem;
