import pluggy

hookspec = pluggy.HookspecMarker("jupyterhub_configurator")
hookimpl = pluggy.HookimplMarker("jupyterhub_configurator")


@hookspec
def jupyterhub_configurator_available_fields():
    """
    Return key-value pairs of JSON schema fields.

    These can be used by hub admins to assemble a schema
    that works for their hub.
    """
    pass
