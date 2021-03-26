"""An example service authenticating with the Hub.

This example service serves `/services/whoami/`,
authenticated with the Hub,
showing the user their own info.
"""
import json
import secrets
import os
from urllib.parse import urlparse

from functools import partial
from tornado import web
from tornado.web import authenticated
from tornado.httpserver import HTTPServer
from tornado.ioloop import IOLoop

from jupyterhub.services.auth import HubOAuthCallbackHandler
from jupyterhub.services.auth import HubOAuthenticated
from jupyterhub.utils import url_path_join, auth_decorator

from traitlets.config import Application
from traitlets import Dict, Unicode, default

from deepmerge import always_merger

from jinja2 import Environment, FileSystemLoader

HERE = os.path.dirname(__file__)
jinja_env = Environment(loader=FileSystemLoader(os.path.join(HERE, "templates")))


class StorageBackend:
    def __init__(self):
        self.config_path = os.path.join(os.getcwd(), "configurator_data.json")

    def write(self, config):
        with open(self.config_path, "w") as f:
            json.dump(config, f)

    # FIXME: Cache this, perhaps based on stat call?
    # Don't want to keep in-memory state, since that forces this class to be a singleton
    def read(self):
        try:
            with open(self.config_path) as f:
                return json.load(f)
        except FileNotFoundError:
            return {}


@auth_decorator
def admin_only(self):
    """
    Only allow admin JupyterHub users access.

    The version in jupyterhub.util requires that the user object
    have attribute access to 'admin', while our user objects are
    just JSON.
    """
    user = self.current_user
    if user is None or user["admin"] != True:
        raise web.HTTPError(403)


class ConfiguratorHandler(HubOAuthenticated, web.RequestHandler):
    # FIXME: PUT THIS BEHIND AUTH AGAIN,
    # BUT ONLY WHEN THE HUB PROCESS CAN TALK TO IT AFTER
    # BEING AUTHENTICATED
    async def get(self):
        storage_backend = self.settings["storage_backend"]
        self.set_header("content-type", "application/json")
        self.write(storage_backend.read())

    @authenticated
    @admin_only
    async def post(self):
        storage_backend = self.settings["storage_backend"]
        config = json.loads(self.request.body)
        storage_backend.write(config)


class UIHandler(HubOAuthenticated, web.RequestHandler):
    @authenticated
    @admin_only
    def get(self):
        print(self.current_user)
        ui_template = jinja_env.get_template("index.html")
        self.write(ui_template.render(base_url=self.settings["base_url"]))

class SchemaHandler(HubOAuthenticated, web.RequestHandler):
    @authenticated
    @admin_only
    def get(self):
        self.set_header("content-type", "application/json; charset=utf-8")
        self.write(json.dumps(self.settings['configurator'].full_schema))

class Configurator(Application):
    schemas = Dict(
        {},
        help="""
        Dictionary of dicts of JSON Schema used by the configurator.

        Each value should be a JSON Schema describing an object. Object
        properties should be named with the traitlet key they are going to set -
        for example, `KubeSpawner.image` or `Spawner.default_url`. The value
        specified by the user will be used to set these traitlets *just before
        spawning*. "title", "description" and "default" values of the properties
        are displayed as you would expect

        All the dictionary entries will be merged to produce the JSONSchema
        given to the frontend. This allows easy overrides and additions to
        the schema.
        """,
        config=True
    )


    @property
    def full_schema(self):
        schema = {}
        for s in self.schemas.values():
            always_merger.merge(schema, s)
        return schema

    config_file = Unicode(
        "jupyterhub_configurator_config.py",
        help="""
        File to read configurator config from
        """,
        config=True
    )


    def start(self):
        self.load_config_file(self.config_file)
        print(self.schemas)

        prefix = os.environ["JUPYTERHUB_SERVICE_PREFIX"]
        mp = partial(url_path_join, prefix)

        tornado_settings = {
            "cookie_secret": secrets.token_bytes(32),
            "storage_backend": StorageBackend(),
            "static_path": os.path.join(HERE, "static"),
            "static_url_prefix": mp("static/"),
            "base_url": prefix,
            "configurator": self
        }

        handlers = [
            (mp("oauth_callback"), HubOAuthCallbackHandler),
            (mp("config"), ConfiguratorHandler),
            (mp("schema"), SchemaHandler),
            (mp(r"/"), UIHandler),
        ]
        app = web.Application(handlers, debug=True, **tornado_settings)

        http_server = HTTPServer(app)

        http_server.listen(10101, "0.0.0.0")

        IOLoop.current().start()


if __name__ == "__main__":
    configurator = Configurator()
    configurator.initialize()
    configurator.start()
