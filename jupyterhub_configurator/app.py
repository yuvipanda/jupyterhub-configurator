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

from jinja2 import Environment, FileSystemLoader

HERE = os.path.dirname(__file__)
jinja_env = Environment(loader=FileSystemLoader(os.path.join(HERE, 'templates')))

class StorageBackend:
    def __init__(self):
        self.config_path = os.path.join(HERE, 'config_data.json')


    def write(self, config):
        with open(self.config_path, 'w') as f:
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
    if user is None or user['admin'] != True:
        raise web.HTTPError(403)

class ConfiguratorHandler(HubOAuthenticated, web.RequestHandler):
    @authenticated
    @admin_only
    async def get(self):
        storage_backend = self.settings['storage_backend']
        self.set_header('content-type', 'application/json')
        self.write(storage_backend.read())

    @authenticated
    @admin_only
    async def post(self):
        storage_backend = self.settings['storage_backend']
        config = json.loads(self.request.body)
        storage_backend.write(config)

class UIHandler(HubOAuthenticated, web.RequestHandler):
    @authenticated
    @admin_only
    def get(self):
        print(self.current_user)
        ui_template = jinja_env.get_template('index.html')
        self.write(ui_template.render(
            base_url=self.settings['base_url']
        ))

def main():
    prefix = os.environ['JUPYTERHUB_SERVICE_PREFIX']
    mp = partial(url_path_join, prefix)

    tornado_settings = {
        'cookie_secret': secrets.token_bytes(32),
        'storage_backend': StorageBackend(),
        'static_path': os.path.join(HERE, "static"),
        'static_url_prefix': mp('static/'),
        'base_url': prefix
    }

    handlers = [
        (mp(r'oauth_callback'), HubOAuthCallbackHandler),
        (mp(r'config'), ConfiguratorHandler),
        (mp(r'/'), UIHandler)
    ]
    app = web.Application(
        handlers,
        debug=True,
        **tornado_settings
    )

    http_server = HTTPServer(app)

    http_server.listen(10101, '0.0.0.0')

    IOLoop.current().start()


if __name__ == '__main__':
    main()
