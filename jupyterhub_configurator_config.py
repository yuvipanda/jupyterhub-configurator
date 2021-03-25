import os
import json

HERE = os.path.dirname(os.path.abspath(__file__))

with open(os.path.join(HERE, 'default_schema.json')) as f:
    default_schema = json.load(f)

c.Configurator.schemas = {
    '00-default': default_schema
}

print("WHAAT")
