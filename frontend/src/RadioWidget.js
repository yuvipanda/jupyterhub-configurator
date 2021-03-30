import React, { useState } from "react";
import Card from "./Card";
import sectionStyles from "./Base.css";

const RadioWidget = (props) => {
  const optionMeta = props.schema.enumMetadata;
  const optionNames = props.schema.enum;

  const [selectedValue, setSelectedValue] = useState(props.value);

  return (
    <section className="border">
      <div className={sectionStyles.header}>
        <h4>Default user interface </h4>
        <h6 className="text-muted">Users will see this when they log in</h6>
      </div>
      <div className="row">
        {optionNames.map((o) => {
          const meta = optionMeta[o];
          return (
            <Card
              id={props.id}
              key={o}
              value={o}
              title={meta.title}
              description={meta.description}
              selected={o === selectedValue}
              onChange={() => {
                setSelectedValue(o);
                props.onChange(o);
              }}
            />
          );
        })}
      </div>
    </section>
  );
};

export default RadioWidget;
