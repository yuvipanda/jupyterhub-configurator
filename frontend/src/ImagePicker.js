import React, { useState } from "react";
import Card from "./Card";

const Image = (props) => {
  const image = props.image;

  return (
    <div className="form-check col-4" key={domId}>
      <input
        className="form-check-input"
        type="radio"
        name={props.id}
        value=""
        id={domId}
      />
      <label className="form-check-label" htmlFor={domId}>
        <h5>{image.name}</h5>
        <p className="muted-text">hello{image.description}</p>
      </label>
      <a href={image.link}>More info</a>
    </div>
  );
};

const ImagePicker = (props) => {
  const schema = props.schema;
  const suggestions = schema.enumMetadata.suggestions;

  const [selectedValue, setSelectedValue] = useState(props.value);

  return (
    <div>
      <h4>{schema.title}</h4>
      <h6 className="text-muted">{schema.description}</h6>
      <div>
        {suggestions.map((suggestion) => {
          return (
            <div key={suggestion.title}>
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
    </div>
  );
};

export default ImagePicker;
