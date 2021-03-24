import React, { useState } from "react";
import Card from "./Card";
import styles from "./ImagePicker.css";
import sectionStyles from "./Base.css";

const CustomImage = (props) => {
  const { schema } = props;
  const custom = schema.enumMetadata.customInput;
  const id = "custom-" + schema.id;
  const value = schema.value;
  return (
    <div className={styles.custom}>
      <label htmlFor={id + value}>
        <h5>{custom.title}</h5>
      </label>
      <input
        className="form-control"
        type="text"
        name={id}
        value={value}
        id={schema.name}
        placeholder={custom.placeholder}
      />
    </div>
  );
};

const ImagePicker = (props) => {
  const schema = props.schema;
  const suggestions = schema.enumMetadata.suggestions;

  const [selectedValue, setSelectedValue] = useState(props.value);

  return (
    <section className="border">
      <div className={sectionStyles.header}>
        <h3>{schema.title}</h3>
        <h6 className="text-muted">{schema.description}</h6>
      </div>
      <div>
        {suggestions.map((suggestion) => {
          return (
            <div
              key={suggestion.title}
              className={"border " + sectionStyles.subSection}
            >
              <h4 className="image-suggestion-header">{suggestion.title}</h4>
              <div className="row">
                {suggestion.images.map((image) => {
                  return (
                    <Card
                      key={props.id + image.value}
                      value={image.value}
                      description={image.description}
                      title={image.title}
                      selected={image.value === selectedValue}
                      onChange={() => setSelectedValue(image.value)}
                      id={props.id}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <CustomImage schema={schema} />
    </section>
  );
};

export default ImagePicker;
