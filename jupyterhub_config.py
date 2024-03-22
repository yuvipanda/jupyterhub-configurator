import sys
import json
import aiohttp
from jupyterhub.spawner import SimpleLocalProcessSpawner
from jupyterhub_configurator.mixins import ConfiguratorSpawnerMixin

c.JupyterHub.authenticator_class = "dummy"
c.JupyterHub.default_url = "/hub/home"

c.Authenticator.admin_users = ["admin"]

c.JupyterHub.services = [
    {
        "name": "configurator",
        "url": "http://127.0.0.1:10101",
        "command": [sys.executable, "-m", "jupyterhub_configurator.app"],
    }
]


class CustomSpawner(ConfiguratorSpawnerMixin, SimpleLocalProcessSpawner):
    pass


c.JupyterHub.spawner_class = CustomSpawner
