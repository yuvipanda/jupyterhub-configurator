import aiohttp
from traitlets.config import Configurable
from traitlets import Unicode


async def fetch_config(service_url):
    async with aiohttp.ClientSession() as session:
        async with session.get(f'{service_url}/config') as response:
            config = await response.json()
            return config


class ConfiguratorSpawnerMixin(Configurable):
    service_url = Unicode(
        "http://127.0.0.1:10101/services/configurator",
        help="URL where the configurator service is available",
        config=True
    )

    async def start(self, *args, **kwargs):
        config = await fetch_config(self.service_url)
        # Traitlets are of the form `ClassName.property_name`.
        # We should pick up properties where ClassName is any
        # class we inherit from. So Spawner.default_url will work
        # for both KubeSpawner and SystemdSpawner, but
        # KubeSpawner.extra_containers won't show up in SystemdSpawner.
        # This is happening at runtime rather than by updating the
        # config itself, since we want admins to be able to change these
        # without having to restart their hub.
        base_classes = [c.__name__ for c in self.__class__.__mro__]
        for k, v in config.items():
            cls, prop = k.split('.')
            # Only overwrite values if they are truthy.
            # Admins can 'reset to default' by just emptying something
            # out.
            # FIXME: Support explicitly making something unset
            if cls in base_classes and v:
                self.log.info(f'Setting {k} to {v}')
                setattr(self, prop, v)
        return await super().start(*args, **kwargs)
