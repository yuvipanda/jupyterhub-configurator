import React, { useState, useEffect, useRef } from "react";
import Form from "@rjsf/bootstrap-4";
import Alert from 'react-bootstrap/Alert'
import RadioWidget from "./RadioWidget";
import TextWidget from "./TextWidget";
import styles from "./App.css";
import "./Base.css";

function updateConfig(event, setProgress, setAlertVariant, setAlertText, setAlertVisibility, setButtonVisibility) {
  // Saving state
  setProgress("Saving...")
  const config = event.formData;

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
    setAlertVariant("success");
    setAlertVisibility(true);
    setAlertText("Changes saved successfully!");
    setProgress("Saved");
    setButtonVisibility(false);
  })
  .catch(error => {
    // Error on submit
    setAlertText('There has been a problem with your form submit operation: \n' + error);
    setAlertVariant('danger');
    setProgress("Error");
  });
}

function onChange(setButtonVisibility, setAlertText, setAlertVariant, setAlertVisibility, setProgress) {
  setAlertVisibility(true);
  setButtonVisibility(true);
  setProgress("Submit");
  setAlertText("You have unsaved changes, click submit to save them.");
  setAlertVariant("warning");
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
  const [progress, setProgress] = useState("Submit");
  const [buttonShow, setButtonVisibility] = useState(false);
  const [alertVariant, setAlertVariant] = useState();
  const [alertText, setAlertText] = useState();
  const [alertShow, setAlertVisibility] = useState();

  return (
    <Form
      schema={schema}
      uiSchema={uiSchemaForSchema(schema)}
      onChange={e => onChange(setButtonVisibility, setAlertText, setAlertVariant, setAlertVisibility, setProgress)}
      onSubmit={e => updateConfig(e, setProgress, setAlertVariant, setAlertText, setAlertVisibility, setButtonVisibility)}
      formData={formData}
      widgets={customWidgets}
      onError={console.log}>
      <Alert show={alertShow} variant={alertVariant}>{alertText}</Alert>
      <input className="btn btn-primary" type="submit" value={progress} disabled={!buttonShow}/>
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
