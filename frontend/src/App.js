import React, { useState, useEffect } from "react";
import Form from "@rjsf/bootstrap-4";
import Toast from 'react-bootstrap/Toast';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import RadioWidget from "./RadioWidget";
import TextWidget from "./TextWidget";
import styles from "./App.css";
import "./Base.css";

function updateConfig(event, setLoading, setAlertVariant, setAlertText, setAlertVisibility) {
  // Saving state
  setLoading(true);
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
    // Submit successful, show a success alert
    setLoading(false);
    setAlertVariant("bg-success text-white rounded");
    setAlertText("Changes saved successfully!");
    setAlertVisibility(true);
  })
  .catch(error => {
    // Error on submit, show an error alert
    setLoading(false);
    setAlertVariant("bg-danger text-white rounded");
    setAlertText("There has been a problem with your form submit operation: \n" + error);
    setAlertVisibility(true);
  });
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
  const [isLoading, setLoading] = useState(false);
  const [alertVariant, setAlertVariant] = useState("bg-dark text-white rounded");
  const [alertText, setAlertText] = useState("Click the submit button to save your changes");
  const [alertShow, setAlertVisibility] = useState(true);

  return (
    <Form
      schema={schema}
      uiSchema={uiSchemaForSchema(schema)}
      onChange={console.log}
      onSubmit={e => updateConfig(e, setLoading, setAlertVariant, setAlertText, setAlertVisibility)}
      formData={formData}
      widgets={customWidgets}
      onError={console.log}>
      <Row>
        <Col md="auto">
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? "Loading…" : "Submit"}
          </Button>
        </Col>
        <Col md="auto">
          <Toast onClose={() => setAlertVisibility(false)} show={alertShow} delay={2000} autohide>
           <Toast.Header className={alertVariant}>{alertText}</Toast.Header>
          </Toast>
        </Col>
      </Row>
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
