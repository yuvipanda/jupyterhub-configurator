import React, { useState, useEffect } from "react";
import Form from "@rjsf/bootstrap-4";
import uiSchema from "./uiSchema.json";
import InterfacePicker from "./InterfacePicker";
import ImagePicker from "./ImagePicker";
import TextWidget from "./TextWidget";
import styles from "./App.css";
import "./Base.css";

const jhdata = window.jhdata || {};
const base_url = jhdata.base_url || "/";
const xsrf_token = jhdata.xsrf_token;

function configuratorFetch(endpoint, method, data) {
  let api_url = new URL(`${base_url}` + endpoint, location.origin);
  if (xsrf_token) {
    api_url.searchParams.set("_xsrf", xsrf_token);
  }
  return fetch(api_url, {
    method: method,
    json: true,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/jupyterhub-pagination+json",
    },
    body: data ? JSON.stringify(data) : null,
  });
};

function updateConfig(formData) {
  const config = formData.formData;
  const response = configuratorFetch("config", "POST", JSON.stringify(config))
}

const customWidgets = {
  interfacePicker: InterfacePicker,
  imagePicker: ImagePicker,
  TextWidget: TextWidget,
};

const ConfiguratorForm = ({ schema, formData }) => {
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
    configuratorFetch("config").then((resp) =>
      resp.json().then((data) => setFormData(data))
    );
    configuratorFetch("schema").then((resp) =>
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
        {formData !== null && schema !== null ? (
          <ConfiguratorForm formData={formData} schema={schema} />
        ) : (
          <p>Loading</p>
        )}
      </div>
    </>
  );
};

export default App;
