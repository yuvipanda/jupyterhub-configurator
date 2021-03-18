import React, { useState } from "react";

import styles from "./Card.css";
import classnames from "classnames";

const Card = (props) => {
  const { title, description, value, id, selected, onChange } = props;

  const [isActive, setIsActive] = useState(false);

  const classes = [
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
      <div className="custom-control custom-radio">
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
    </div>
  );
};

export default Card;
