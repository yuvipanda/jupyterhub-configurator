import aiohttp
from traitlets.config import Configurable
from traitlets import Unicode


class ConfiguratorSpawnerMixin(Configurable):
    service_url = Unicode(
        "http://127.0.0.1:10101/services/configurator",
        help="URL where the configurator service is available",
        config=True
    )

    async def fetch_config(self):
        async with aiohttp.ClientSession() as session:
            async with session.get(f'{self.service_url}/config') as response:
                config = await response.json()
                return config

    async def start(self, *args, **kwargs):
        config = await self.fetch_config()
        self.default_url = config['Spawner.default_url']
        return await super().start(*args, **kwargs)
