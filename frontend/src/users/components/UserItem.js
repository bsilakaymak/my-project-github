import React from "react";
import { Link } from "react-router-dom";
import Avatar from "../../shared/component/UIElements/Avatar";
import Card from "../../shared/component/UIElements/Card";
import "./UserItem.css";
const UserItem = ({ user }) => {
  const { id, image, name, places } = user;

  return (
    <li className="user-item">
      <Card className="user-item__content">
        <Link to={`/${id}/places`}>
          <div className="user-item__image">
            <Avatar image={image} alt={name} />
          </div>
          <div className="user-item__info">
            <h2>{name}</h2>
            <h3>
              {places.length} {places.length === 1 ? "Place" : "Places"}
            </h3>
          </div>
        </Link>
        <Link to={`/${id}/mybucketlist`}>
          <h4>See Bucket List</h4>
        </Link>
      </Card>
    </li>
  );
};

export default UserItem;
