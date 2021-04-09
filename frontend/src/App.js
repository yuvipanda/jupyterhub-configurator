import React, { useState, useEffect } from "react";
import Form from "@rjsf/bootstrap-4";
import RadioWidget from "./RadioWidget";
import TextWidget from "./TextWidget";
import styles from "./App.css";
import "./Base.css";

function updateConfig(formData) {
  // Saving state
  var submit = document.getElementById("submit");
  submit.value = "Saving..."

  const config = formData.formData;
  var alert = document.getElementById("alert");

  const response = fetch("/services/configurator/config", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(config),
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Form submission failed');
    }
    return response.status;
  })
  .then(status => {
    // Submit successful, hide the alert
    alert.style="opacity:0;transition:all 0.5s linear;"
    submit.value = "Saved"
  })
  .catch(error => {
    // Error on submit
    alert.innerText = 'There has been a problem with your form submit operation: \n' + error;
    alert.className="alert alert-danger"
    submit.value = "Error"
    submit.disabled = true
  });
}

function onChange(formData) {
  // Show the "needs saving" alert
  var alert = document.getElementById("alert");
  alert.style = "opacity:1"
  alert.innerText = "You have unsaved changes, click submit to save them."
  alert.className = "alert alert-warning"
  // Enable the submit button
  var submit = document.getElementById("submit");
  submit.disabled = false
  submit.value = "Submit"
}

const customWidgets = {
  RadioWidget: RadioWidget,
  TextWidget: TextWidget,
};

/**
 * Generate uiSchema programmatically
 * 
 * We make opinionated choices about how various JSON fields should
 * be displayed. This requires setting values in uiSchema. We generate
 * uiSchema, instead of asking users to make that too.
 *
 * @param {JSONSchema} schema 
 * @returns 
 */

const uiSchemaForSchema = (schema) => {
  let uiSchema = {};
  console.log(schema.properties);
  for(const propName of Object.keys(schema.properties)) {
    let options = {
      'ui:label': false
    }
    if (schema.properties[propName].enum !== undefined) {
      // We want our custom radio button for enums, not default select
      options['ui:widget'] = 'RadioWidget'
    }
    uiSchema[propName] = options;
  }

  return uiSchema;

}

const ConfiguratorForm = ({ schema, formData }) => {
  return (
    <Form
      schema={schema}
      uiSchema={uiSchemaForSchema(schema)}
      onChange={onChange}
      onSubmit={updateConfig}
      formData={formData}
      widgets={customWidgets}
      onError={console.log}>
      <div className="alert alert-warning collapse" id="alert" role="alert">You have unsaved changes, click submit to save them.</div>
      <input className="btn btn-primary" type="submit" id="submit" title="Noting to submit" value="Submit" disabled/>
    </Form>
  );
};

const App = (props) => {
  const [formData, setFormData] = useState(null);
  const [schema, setSchema] = useState(null);

  useEffect(() => {
    fetch("/services/configurator/config").then((resp) =>
      resp.json().then((data) => {
        setSchema(data.schema);
        setFormData(data.config);
      })
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
