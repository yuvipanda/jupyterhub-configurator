"""An example service authenticating with the Hub.

This example service serves `/services/whoami/`,
authenticated with the Hub,
showing the user their own info.
"""
import json
import secrets
import os
from urllib.parse import urlparse
import binascii

from functools import partial
from tornado import web
from tornado.web import authenticated
from tornado.httpserver import HTTPServer
from tornado.ioloop import IOLoop

from jupyterhub.services.auth import HubOAuthCallbackHandler
from jupyterhub.services.auth import HubOAuthenticated
from jupyterhub.utils import url_path_join, auth_decorator

from traitlets.config import Application
from traitlets import Dict, Unicode, default, Bytes

from deepmerge import always_merger

from jinja2 import Environment, FileSystemLoader

HERE = os.path.dirname(__file__)
jinja_env = Environment(loader=FileSystemLoader(os.path.join(HERE, "templates")))

COOKIE_SECRET_BYTES = 32
# JupyterHub does this to try be compatible with Windows if possible
_mswindows = os.name == "nt"


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
        ui_template = jinja_env.get_template("index.html")
        template_ns = {
            "base_url": self.settings["base_url"],
            "xsrf_token": self.xsrf_token.decode("ascii"),
        }
        self.write(ui_template.render(template_ns))


class SchemaHandler(HubOAuthenticated, web.RequestHandler):
    @authenticated
    @admin_only
    def get(self):
        self.set_header("content-type", "application/json; charset=utf-8")
        self.write(json.dumps(self.settings["configurator"].full_schema))


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
        config=True,
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
        config=True,
    )

    cookie_secret = Bytes(
        help="""The cookie secret to use to encrypt cookies.

        Loaded from the CONFIGURATOR_COOKIE_SECRET env variable by default.

        Should be exactly 256 bits (32 bytes).
        """
    ).tag(config=True, env="CONFIGURATOR_COOKIE_SECRET")

    cookie_secret_file = Unicode(
        "jupyterhub_configurator_cookie_secret",
        help="""File in which to store the cookie secret.""",
        config=True,
    )

    def init_secrets(self):
        """
        Initialize cookie_secret securely
        """
        # Adapted from jupyterhub/app.py#init_secrets
        trait_name = "cookie_secret"
        trait = self.traits()[trait_name]
        env_name = trait.metadata.get("env")
        secret_file = os.path.abspath(os.path.expanduser(self.cookie_secret_file))
        secret = self.cookie_secret
        secret_from = "config"
        # load priority: 1. config, 2. env, 3. file
        secret_env = os.environ.get(env_name)
        if not secret and secret_env:
            secret_from = "env"
            self.log.info("Loading %s from env[%s]", trait_name, env_name)
            secret = binascii.a2b_hex(secret_env)
        if not secret and os.path.exists(secret_file):
            secret_from = "file"
            self.log.info("Loading %s from %s", trait_name, secret_file)
            try:
                if not _mswindows:  # Windows permissions don't follow POSIX rules
                    perm = os.stat(secret_file).st_mode
                    if perm & 0o07:
                        msg = "cookie_secret_file can be read or written by anybody"
                        raise ValueError(msg)
                with open(secret_file) as f:
                    text_secret = f.read().strip()
                secret = binascii.a2b_hex(text_secret)
            except Exception as e:
                self.log.error(
                    "Refusing to run Jupyteb configuratorrHu with invalid cookie_secret_file. "
                    "%s error was: %s",
                    secret_file,
                    e,
                )
                self.exit(1)

        if not secret:
            secret_from = "new"
            self.log.debug("Generating new %s", trait_name)
            secret = secrets.token_bytes(COOKIE_SECRET_BYTES)

        if secret_file and secret_from == "new":
            # if we generated a new secret, store it in the secret_file
            self.log.info("Writing %s to %s", trait_name, secret_file)
            text_secret = binascii.b2a_hex(secret).decode("ascii")
            with open(secret_file, "w") as f:
                f.write(text_secret)
                f.write("\n")
            if not _mswindows:  # Windows permissions don't follow POSIX rules
                try:
                    os.chmod(secret_file, 0o600)
                except OSError:
                    self.log.warning("Failed to set permissions on %s", secret_file)
                    raise
        # store the loaded trait value
        self.cookie_secret = secret

    def start(self):
        self.load_config_file(self.config_file)
        self.init_secrets()

        prefix = os.environ["JUPYTERHUB_SERVICE_PREFIX"]
        mp = partial(url_path_join, prefix)

        tornado_settings = {
            "cookie_secret": self.cookie_secret,
            "storage_backend": StorageBackend(),
            "static_path": os.path.join(HERE, "static"),
            "static_url_prefix": mp("static/"),
            "base_url": prefix,
            "configurator": self,
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
