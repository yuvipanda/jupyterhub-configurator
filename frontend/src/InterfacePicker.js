import React, { useState } from "react";
import Card from "./Card";
import sectionStyles from "./Base.css";

const InterfacePicker = (props) => {
  const interfaces = props.schema.enumMetadata.interfaces;

  const [selectedValue, setSelectedValue] = useState(props.value);

  return (
    <section className="border">
      <div className={sectionStyles.header}>
        <h4>Default user interface </h4>
        <h6 className="text-muted">Users will see this when they log in</h6>
      </div>
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
              onChange={() => {
                setSelectedValue(i.value);
                props.onChange(i.value);
              }}
            />
          );
        })}
      </div>
    </section>
  );
};

export default InterfacePicker;
