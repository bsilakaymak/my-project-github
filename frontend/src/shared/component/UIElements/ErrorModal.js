import React from "react";

import Modal from "./Modal";
import Button from "../formElements/Button";

const ErrorModal = ({ error, onClear, header }) => {
  return (
    <Modal
      onCancel={onClear}
      header={header || "An Error Occurred!!!"}
      show={!!error}
      footer={<Button onClick={onClear}>Okay</Button>}
    >
      <div>{error}</div>
    </Modal>
  );
};

export default ErrorModal;
