import React, { useState, useEffect } from "react";
import Form from "@rjsf/bootstrap-4";
import uiSchema from "./uiSchema.json";
import InterfacePicker from "./InterfacePicker";
import ImagePicker from "./ImagePicker";
import TextWidget from "./TextWidget";
import styles from "./App.css";
import "./Base.css";

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
  TextWidget: TextWidget,
};

const ConfiguratorForm = ({schema, formData}) => {
  return (
    <Form
      schema={schema}
      uiSchema={uiSchema}
      onChange={console.log}
      onSubmit={updateConfig}
      formData={formData}
      widgets={customWidgets}
      onError={console.log}
    />
  );
};

const App = (props) => {
  const [formData, setFormData] = useState(null);
  const [schema, setSchema] = useState(null);

  useEffect(() => {
    fetch("/services/configurator/config").then((resp) =>
      resp.json().then((data) => setFormData(data))
    );
    fetch("/services/configurator/schema").then((resp) =>
      resp.json().then((data) => setSchema(data))
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
        {(formData !== null && schema !== null) ? (
          <ConfiguratorForm formData={formData} schema={schema} />
        ) : (
          <p>Loading</p>
        )}
      </div>
    </>
  );
};

export default App;
