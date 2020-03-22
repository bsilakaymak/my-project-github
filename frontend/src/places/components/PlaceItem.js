import React, { useState, Fragment, useContext, useEffect } from "react";
import "./PlaceItem.css";
import Card from "../../shared/component/UIElements/Card";
import Button from "../../shared/component/formElements/Button";
import Modal from "../../shared/component/UIElements/Modal";
import Map from "../../shared/component/UIElements/Map";
import LoadingSpinner from "../../shared/component/UIElements/LoadingSpinner";
import ErrorModal from "../../shared/component/UIElements/ErrorModal";
import { AuthContext } from "../../shared/context/auth-context";
import useHttpClient from "../../shared/hooks/http-hook";
const PlaceItem = ({ place, onDeletePlace }) => {
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const auth = useContext(AuthContext);
  const [showMap, setShowMap] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showTravelWishButton, setShowTravelWishButton] = useState(true);
  const [showTick, setShowTick] = useState(false);
  const openMapHandler = () => setShowMap(true);
  const closeMapHandler = () => setShowMap(false);
  const { id, image, name, title, address, description, location } = place;

  const showDeleteWaringHandler = () => {
    setShowConfirmModal(true);
  };
  const cancelDeleteHandler = () => {
    setShowConfirmModal(false);
  };

  const confirmDeleteHandler = async () => {
    setShowConfirmModal(false);
    try {
      await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/places/${id}`,
        "DELETE",
        null,
        {
          Authorization: "Bearer " + auth.token
        }
      );
      onDeletePlace(id);
    } catch (error) {}
  };
  const addBucketList = async () => {
    try {
      setShowTravelWishButton(false);
      await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/places/user/${id}`,
        "PATCH",
        null,
        {
          Authorization: "Bearer " + auth.token
        }
      );
      setShowTick(true);
    } catch (error) {
      setShowTravelWishButton(true);
    }
  };
  const [users, setUsers] = useState();
  useEffect(() => {
    const getUsers = async () => {
      try {
        const data = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/users`
        );
        setUsers(data.users);
      } catch (error) {}
    };
    getUsers();
  }, [sendRequest]);

  const checkAdded = users => {
    if (!auth.userId) {
      return false;
    }
    const currentUser = users.find(item => item._id === auth.userId);
    const nonUniqueArray = currentUser.bucketList.filter(item => {
      return item.id === id;
    });
    if (nonUniqueArray.length === 0) {
      return false;
    } else {
      return true;
    }
  };
  if (isLoading)
    return (
      <div className="center">
        <LoadingSpinner />
      </div>
    );
  return (
    <Fragment>
      <ErrorModal error={error} onClear={clearError} />
      <Modal
        show={showMap}
        onCancel={closeMapHandler}
        header={address}
        contentClass="place-item__modal-content"
        footerClass="place-item__actions"
        footer={<Button onClick={closeMapHandler}>Close</Button>}
      >
        <div className="map-container">
          <h2>THE MAP!</h2>
          <Map center={location} zoom={16} />
        </div>
      </Modal>
      <Modal
        show={showConfirmModal}
        onCancel={cancelDeleteHandler}
        header="Are you sure?"
        className="place-item__modal-actions"
        footer={
          <Fragment>
            <Button inverse onClick={cancelDeleteHandler}>
              CANCEL
            </Button>
            <Button danger onClick={confirmDeleteHandler}>
              DELETE
            </Button>
          </Fragment>
        }
      >
        <p>
          Do you want to proceed and delete this place? note that it can't be
          undone thereafter.
        </p>
      </Modal>
      {users && (
        <li className="place-item">
          <Card className="place-item__content">
            {isLoading && <LoadingSpinner asOverlay />}
            <div className="place-item__image">
              <img src={image.imageUrl} alt={name} />
            </div>
            <div className="place-item__info">
              <p>{JSON.stringify()}</p>
              <h2>{title}</h2>
              <h3>{address}</h3>
              <p>{description}</p>
            </div>
            <div className="place-item__actions">
              <Button inverse onClick={openMapHandler}>
                VIEW ON MAP
              </Button>
              {place.creator === auth.userId && (
                <Button to={`/places/${id}`}>EDIT</Button>
              )}
              {place.creator === auth.userId && (
                <Button danger onClick={showDeleteWaringHandler}>
                  DELETE
                </Button>
              )}
              {auth.token &&
                place.creator !== auth.userId &&
                showTravelWishButton &&
                !checkAdded(users) && (
                  <Button onClick={addBucketList}>ADD TO BUCKET LIST</Button>
                )}
              {checkAdded(users) && auth.userId && (
                <span className="animated">
                  Already in your bucket &#9989;{" "}
                </span>
              )}
              {showTick && (
                <span className="fadeOut animated">Added &#9989; </span>
              )}
            </div>
          </Card>
        </li>
      )}
    </Fragment>
  );
};

export default PlaceItem;
