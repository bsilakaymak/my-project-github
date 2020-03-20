import React, { useReducer, useEffect } from "react";
import { validate } from "../../Util/validators";
import "./Input.css";
const inputReducer = (state, action) => {
  switch (action.type) {
    case "CHANGE":
      return {
        ...state,
        value: action.val,
        isValid: validate(action.val, action.validators)
      };
    case "TOUCH":
      return {
        ...state,
        isTouched: true
      };

    default:
      return state;
  }
};

const Input = props => {
  const changeHandeler = event => {
    dispatch({
      type: "CHANGE",
      val: event.target.value,
      validators: props.validators
    });
  };
  const touchHandler = event => {
    dispatch({ type: "TOUCH" });
  };
  const inaialState = {
    value: props.initailValue || "",
    isValid: props.initailValid || false,
    isTouched: false
  };
  const [state, dispatch] = useReducer(inputReducer, inaialState);

  const { id, onInput } = props;
  const { value, isValid } = state;
  useEffect(() => {
    onInput(id, value, isValid);
  }, [id, value, isValid, onInput]);

  const element =
    props.element === "input" ? (
      <input
        id={props.id}
        type={props.type}
        placeholder={props.placeholder}
        onChange={changeHandeler}
        onBlur={touchHandler}
        value={state.value}
      />
    ) : (
      <textarea
        id={props.id}
        rows={props.rows || 3}
        onChange={changeHandeler}
        onBlur={touchHandler}
        value={state.value}
      />
    );

  return (
    <div
      className={`form-control ${!state.isValid &&
        state.isTouched &&
        "form-control--invalid"}`}
    >
      <label htmlFor={props.id}>{props.label}</label>
      {element}
      {!state.isValid && state.isTouched && <p>{props.errorText}</p>}
    </div>
  );
};

export default Input;
