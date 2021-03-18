import React from "react";
import styles from "./InterfacePicker.css";

const InterfacePicker = (props) => {
  const schemaOptions = props.schema;

  let options = [];
  for (const id of schemaOptions.enum) {
    const option = schemaOptions.enumMetadata[id];
    options.push(
      <a
        href="#"
        className="card"
        onClick={() => props.onChange(id)}
        onBlur={() => props.onBlur(props.id, id)}
        onFocus={() => props.onBlur(props.id, id)}
        className={id === props.value ? styles.active : ""}
        key={props.id + id}
      >
        <div className="card-body">
          <h5 className="card-title">{option.title}</h5>
          <p className="card-text">{option.description}</p>
        </div>
      </a>
    );
  }
  return (
    <div className="interface-picker-container">
      <h4>Default user interface </h4>
      <h6 className="text-muted">Users will see this when they log in</h6>
      <div className={styles.options}>{options}</div>
    </div>
  );
};

export default InterfacePicker;
