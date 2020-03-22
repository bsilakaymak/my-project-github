import React, { useState, useContext } from "react";
import useHttpClient from "../../shared/hooks/http-hook";
import { useFrom } from "../../shared/hooks/form-hook";
import { AuthContext } from "../../shared/context/auth-context";
import { VALIDATOR_REQUIRE } from "../../shared/Util/validators";

import Card from "../../shared/component/UIElements/Card";
import Avatar from "../../shared/component/UIElements/Avatar";
import ErrorModal from "../../shared/component/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/component/UIElements/LoadingSpinner";
import Input from "../../shared/component/formElements/Input";
import Button from "../../shared/component/formElements/Button";
import ImageUpload from "../../shared/component/formElements/ImageUpload";

import "./UserProfile.css";
const UserProfile = props => {
  const {userId, token} = useContext(AuthContext);
  const [editImage, setEditImage] = useState(false);
  const [editName, setEditName] = useState(false);  
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const { name, image } = props.user;

  const [state, inputHandler, setFormData] = useFrom(
    {
      email: {
        value: "",
        isValid: false
      },
      password: {
        value: "",
        isValid: false
      }
    },
    false
  );

  const switchModelHandler = () => {
    if (editImage) {
      setFormData(
        {
          image: {
            value: null,
            isValid: false
          }
        },
        false
      );
    } else if(editName) {
      setFormData(
        {
          name: {
            value: name,
            isValid: false
          }
        },
        false
      );
    } else {      
      setFormData(
        {
          email: {
            value: "",
            isValid: false
          },
          password: {
            value: "",
            isValid: false
          }
        },
        false
      );
    }
  };

  const changeEditName = () => {
    setEditName(currentMode => !currentMode);
    switchModelHandler();
  }
  const changeEditImage = () => {
    setEditImage(currentMode => !currentMode);
    switchModelHandler();
  }

  const authSubmitHandler = async () => {
    if (editName) {
      try {
        const res = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/users/${userId}`,
          "PATCH",
          JSON.stringify({
            name: state.inputs.name.value
          }),
          {
            "Content-Type": "application/json",
            "Authorization" : `Bearer ${token}`
          }
        );
        setEditName(false);
        props.setUser(res.user);
      } catch (error) {}
    } else {
      try {
        const formData = new FormData();
        formData.append("image", state.inputs.image.value);

        const res = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/users/${userId}`,
          "PATCH",
          formData,
          {
            "Authorization" : `Bearer ${token}`
          }
        );
        setEditImage(false);
        props.setUser(res.user);
      } catch (error) {}
    }
  };

  return (
    <div className="profile">
      { isLoading && <LoadingSpinner />}
      <ErrorModal error={error} onClear={clearError} />
      {!isLoading && 
        <Card className="profile__card">
        {!editName && 
          <React.Fragment>
            {editImage ? 
              <ImageUpload
                center
                id={"image"}
                onInput={inputHandler}
                errorText='Please provide an image'
              /> : <Avatar image={image} className="profile__avatar"/>
            }
            {editImage && <Button inverse onClick={authSubmitHandler}>Save</Button>}
            <Button onClick={changeEditImage}>{editImage? 'Cancel' : 'Change Image'}</Button>
          </React.Fragment>
        }
        {!editImage && 
          <React.Fragment>
            { editName ? 
              <Input
                id='name'
                element='input'
                  type='text'
                  label='Your Name'
                  validators={[VALIDATOR_REQUIRE()]}
                  errorText='Please enter a valid name'
                  onInput={inputHandler}
                /> : <h4>{name}</h4>
              }
              {editName && <Button inverse onClick={authSubmitHandler}>Save</Button>}
              <Button onClick={changeEditName}>{editName? 'Cancel' : 'Edit Name'}</Button>
            </React.Fragment>
          }
        </Card>
      }
    </div>
  );
};

export default UserProfile;
