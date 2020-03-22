import React, { useContext } from "react";
import { Link } from "react-router-dom";
import Avatar from "../../shared/component/UIElements/Avatar";
import Card from "../../shared/component/UIElements/Card";
import "./UserItem.css";
import { AuthContext } from "../../shared/context/auth-context";
const UserItem = ({ user }) => {
  const { id, image, name, places } = user;
  const auth = useContext(AuthContext);
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
        <div className="user-item__icon">
          <Link to={`/${id}/mybucketlist`}>
            <img src="/images/bucketicon.png" style={{ width: "100%" }}></img>
          </Link>
        </div>
      </Card>
    </li>
  );
};

export default UserItem;
