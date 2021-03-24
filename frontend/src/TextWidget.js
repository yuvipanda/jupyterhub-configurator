import React, { useState } from "react";
import sectionStyles from "./Base.css";

const TextField = (props) => {
  const { schema, id, value, onChange } = props;

  return (
    <section className="form-group border">
      <label className={sectionStyles.header}>
        <h4>{schema.title}</h4>
        <h6 className="text-muted">{schema.description}</h6>
      </label>
      <input
        className="form-control"
        type="input"
        name={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <small className="text-muted">{schema.help}</small>
    </section>
  );
};

export default TextField;
