import React, { useState } from "react";
import styles from "./InterfacePicker.css";
import { SelectableGroup, createSelectable } from "react-selectable-fast";
import classnames from "classnames";

const Card = (props) => {
  const { title, description, value, id, selected, onChange } = props;

  const [isActive, setIsActive] = useState(false);

  const classes = [
    "custom-control custom-radio",
    "col-4",
    styles.option,
    selected ? styles.selected : null,
    isActive ? styles.active : null,
  ];
  return (
    <div
      className={classnames(classes)}
      onMouseOver={() => setIsActive(true)}
      onMouseLeave={() => setIsActive(false)}
    >
      <input
        className="custom-control-input"
        type="radio"
        name={id}
        value={value}
        onChange={onChange}
        checked={selected}
        id={id + value}
      />
      <label className="custom-control-label" htmlFor={id + value}>
        <h5>{title}</h5>
        <p className="muted-text">{description}</p>
      </label>
    </div>
  );
};

const InterfacePicker = (props) => {
  const interfaces = props.schema.enumMetadata.interfaces;

  const [selectedValue, setSelectedValue] = useState(props.value);

  return (
    <div className="interface-picker-container">
      <h4>Default user interface </h4>
      <h6 className="text-muted">Users will see this when they log in</h6>
      <div className="row">
        {interfaces.map((i) => {
          return (
            <Card
              id={props.id}
              key={i.value}
              value={i.value}
              title={i.title}
              description={i.description}
              selected={i.value === selectedValue}
              onChange={() => setSelectedValue(i.value)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default InterfacePicker;
