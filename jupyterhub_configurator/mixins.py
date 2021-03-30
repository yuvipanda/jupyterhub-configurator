import aiohttp
from traitlets.config import LoggingConfigurable
from traitlets import Unicode


class ConfiguratorSpawnerMixin(LoggingConfigurable):
    service_url = Unicode(
        "http://127.0.0.1:10101/services/configurator",
        help="URL where the configurator service is available",
        config=True,
    )

    async def fetch_config(self):
        """
        Fetch current config from configurator service

        This failing will cause spawns to fail, and that's
        ok for now.
        """
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{self.service_url}/config") as response:
                data = await response.json()
                return data["config"], data["schema"]

    async def start(self, *args, **kwargs):
        config, schema = await self.fetch_config()
        # Traitlets are of the form `ClassName.property_name`.
        # We should pick up properties where ClassName is any
        # class we inherit from. So Spawner.default_url will work
        # for both KubeSpawner and SystemdSpawner, but
        # KubeSpawner.extra_containers won't show up in SystemdSpawner.
        # This is happening at runtime rather than by updating the
        # config itself, since we want admins to be able to change these
        # without having to restart their hub.
        base_classes = [c.__name__ for c in self.__class__.__mro__]
        properties = schema["properties"]
        for k, v in config.items():
            traitlet = properties[k]["traitlet"]
            cls, prop = traitlet.split(".")
            # Only overwrite values if they are truthy.
            # Admins can 'reset to default' by just emptying something
            # out.
            # FIXME: Support explicitly making something unset
            if cls in base_classes and v:
                self.log.info(f"Setting {traitlet} to {v}, for config {k}")
                setattr(self, prop, v)
        return await super().start(*args, **kwargs)
