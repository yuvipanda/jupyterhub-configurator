import React, { useState, useEffect } from "react";
import Form from "@rjsf/bootstrap-4";
import schema from "./schema.json";
import uiSchema from "./uiSchema.json";
import InterfacePicker from "./InterfacePicker";
import ImagePicker from "./ImagePicker";
import styles from "./App.css";

function updateConfig(formData) {
  const config = formData.formData;
  const response = fetch("/services/configurator/config", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(config),
  });
}

const customWidgets = {
  interfacePicker: InterfacePicker,
  imagePicker: ImagePicker,
};

const ConfiguratorForm = (props) => {
  return (
    <Form
      schema={schema}
      uiSchema={uiSchema}
      onChange={console.log}
      onSubmit={updateConfig}
      formData={props.formData}
      widgets={customWidgets}
      onError={console.log}
    />
  );
};

const App = (props) => {
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    fetch("/services/configurator/config").then((resp) =>
      resp.json().then((data) => setFormData(data))
    );
  }, []);

  return (
    <>
      <nav className="navbar navbar-dark bg-dark">
        <div className="container">
          <a href="#" className="navbar-brand">
            JupyterHub Configurator
          </a>
        </div>
      </nav>
      <div className={styles.mainBody + " container"}>
        {formData !== null ? (
          <ConfiguratorForm formData={formData} />
        ) : (
          <p>Loading</p>
        )}
      </div>
    </>
  );
};

export default App;
