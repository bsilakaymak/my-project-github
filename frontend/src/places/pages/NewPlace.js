import React, { useContext, Fragment } from "react";
import { useHistory } from "react-router-dom";
import "./NewPlace.css";
import Input from "../../shared/component/formElements/Input";
import Button from "../../shared/component/formElements/Button";
import {
  VALIDATOR_REQUIRE,
  VALIDATOR_MINLENGTH
} from "../../shared/Util/validators";
import useHttpClient from "../../shared/hooks/http-hook";
import { useFrom } from "../../shared/hooks/form-hook";
import { AuthContext } from "../../shared/context/auth-context";
import ErrorModal from "../../shared/component/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/component/UIElements/LoadingSpinner";
import ImageUpload from "../../shared/component/formElements/ImageUpload";
const NewPlace = () => {
  const auth = useContext(AuthContext);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();

  const [state, inputHandler] = useFrom(
    {
      title: {
        value: "",
        isValid: false
      },
      description: {
        value: "",
        isValid: false
      },
      address: {
        value: "",
        isValid: false
      },
      image: {
        value: null,
        isValid: false
      }
    },
    false
  );
  const history = useHistory();
  const placeSubmitHandler = async event => {
    event.preventDefault();
    try {
      const formData = new FormData();
      formData.append("title", state.inputs.title.value);
      formData.append("description", state.inputs.description.value);
      formData.append("address", state.inputs.address.value);
      formData.append("creator", auth.userId);
      formData.append("image", state.inputs.image.value);
      await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/places/`,
        "POST",
        formData,
        {
          Authorization: "Bearer " + auth.token
        }
      );
      history.push("/");
    } catch (error) {}
  };

  return (
    <Fragment>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && <LoadingSpinner asOverlay />}
      <form className='place-form' onSubmit={placeSubmitHandler}>
        <Input
          id='title'
          element='input'
          type='text'
          label='Title'
          validators={[VALIDATOR_REQUIRE()]}
          errorText='Please enter a valid title'
          onInput={inputHandler}
        />
        <ImageUpload
          id={"image"}
          onInput={inputHandler}
          errorText='Please provide an image'
        />
        <Input
          id='description'
          element='textarea'
          type='text'
          label='Description'
          validators={[VALIDATOR_MINLENGTH(5)]}
          errorText='Please enter a valid description (at least 5 characters).'
          onInput={inputHandler}
        />
        <Input
          id='address'
          element='input'
          type='text'
          label='Address'
          validators={[VALIDATOR_REQUIRE()]}
          errorText='Please enter a valid description address.'
          onInput={inputHandler}
        />
        <Button type='submit' disabled={!state.isValid}>
          ADD PLACE
        </Button>
      </form>
    </Fragment>
  );
};

export default NewPlace;
