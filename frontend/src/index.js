import React, { useState, useEffect } from "react";
import { render } from "react-dom";
// import Form from "@rjsf/core";
import 'bootstrap/dist/css/bootstrap.min.css';
import Form from '@rjsf/bootstrap-4';
import schema from './schema.json';
import uiSchema from './uiSchema.json';

function updateConfig(formData) {
    const config = formData.formData;
    const response = fetch('/services/configurator/config',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
    })
}

function App() {

    const [formData, setFormData] = useState(null);

    useEffect(() => {
        fetch('/services/configurator/config').then(
            resp => resp.json().then(data => setFormData(data)))
    }, []);
    return <Form
        schema={schema}
        uiSchema={uiSchema}
        onChange={console.log}
        onSubmit={updateConfig}
        formData={formData}
        onError={console.log} />

}

render(<App />, document.getElementById("configurator"));
