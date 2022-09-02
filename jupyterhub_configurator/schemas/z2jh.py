from jupyterhub_configurator.hooks import hookimpl


@hookimpl
def jupyterhub_configurator_fields():
    return {
        "z2jh.image": {
            "type": "string",
            "title": "User docker image",
            "description": "Determines languages, libraries and interfaces available",
            "help": "Eg. \"quay.io/org/user-image:c4e586ff9240\". Leave this blank to use the default.",
            "traitlet": "KubeSpawner.image",
        },
        "z2jh.default_interface": {
            "type": "string",
            "traitlet": "Spawner.default_url",
            "title": "Default User Interface",
            "enum": ["/tree", "/lab", "/rstudio"],
            "default": "/tree",
            "enumMetadata": {
                "/tree": {
                    "title": "Classic Notebook",
                    "description": "The original single-document interface for creating Jupyter Notebooks.",
                },
                "/lab": {
                    "title": "JupyterLab",
                    "description": "A Powerful next generation notebook interface",
                },
                "/rstudio": {
                    "title": "RStudio",
                    "description": "An IDE For R, created by the RStudio company",
                },
            },
        },
    }
