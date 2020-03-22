import React, { useEffect, useState, Fragment, useContext } from "react";
import { useParams, useHistory } from "react-router-dom";
import Input from "../../shared/component/formElements/Input";
import Button from "../../shared/component/formElements/Button";
import Card from "../../shared/component/UIElements/Card";
import LoadingSpinner from "../../shared/component/UIElements/LoadingSpinner";
import ErrorModal from "../../shared/component/UIElements/ErrorModal";
import useHttpClient from "../../shared/hooks/http-hook";
import { AuthContext } from "../../shared/context/auth-context";
import {
  VALIDATOR_REQUIRE,
  VALIDATOR_MINLENGTH
} from "../../shared/Util/validators";
import { useFrom } from "../../shared/hooks/form-hook";
import "./NewPlace.css";
const UpdatePlace = () => {
  const auth = useContext(AuthContext);

  const placeId = useParams().placeId;
  const history = useHistory();

  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [place, setPlace] = useState();
  const [state, inputHandler, setFormData] = useFrom(
    {
      title: {
        value: "",
        isValid: false
      },
      description: {
        value: "",
        isValid: false
      }
    },
    false
  );

  useEffect(() => {
    const getPlace = async () => {
      try {
        const data = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/places/${placeId}`
        );
        setPlace(data.place);
        setFormData(
          {
            title: {
              value: data.place.title,
              isValid: true
            },
            description: {
              value: data.place.description,
              isValid: true
            }
          },
          true
        );
      } catch (error) {}
    };
    getPlace();
  }, [sendRequest, placeId, setFormData]);

  if (isLoading)
    return (
      <div className='center'>
        <LoadingSpinner />
      </div>
    );

  if (!place && !error) {
    return (
      <div className='center'>
        <Card>
          <h2>Could not find place!</h2>
        </Card>
      </div>
    );
  }

  const placeUpdateSubmitHandler = event => {
    event.preventDefault();
    const updatePlace = async () => {
      try {
        await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/places/${placeId}`,
          "PATCH",
          JSON.stringify({
            title: state.inputs.title.value,
            description: state.inputs.description.value
          }),
          {
            "Content-Type": "application/json",
            Authorization: "Bearer " + auth.token
          }
        );
        history.push("/" + auth.userId + "/places");
      } catch (error) {}
    };
    updatePlace();
  };

  return (
    <Fragment>
      <ErrorModal error={error} onClear={clearError} />
      {!isLoading && place && (
        <form className='place-form' onSubmit={placeUpdateSubmitHandler}>
          <Input
            id='title'
            element='input'
            type='text'
            label='Title'
            validators={[VALIDATOR_REQUIRE()]}
            errorText='Please enter a valid title.'
            onInput={inputHandler}
            initailValue={place.title}
            initailValid={true}
          />
          <Input
            id='description'
            element='textarea'
            label='Description'
            validators={[VALIDATOR_MINLENGTH(5)]}
            errorText='Please enter a valid description (min. 5 characters).'
            onInput={inputHandler}
            initailValue={place.description}
            initailValid={true}
          />
          <Button type='submit' disabled={!state.isValid}>
            UPDATE PLACE
          </Button>
        </form>
      )}
    </Fragment>
  );
};

export default UpdatePlace;
