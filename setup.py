from jupyter_packaging import wrap_installers, npm_builder
import os.path
from setuptools import setup, find_packages

HERE = os.path.abspath(os.path.dirname(__file__))

# Representative files that should exist after a successful build
jstargets = [
    os.path.join(HERE, "jupyterhub_configurator", "static", "index.js")
]

jsdeps = npm_builder(
    path="frontend",
    build_cmd="build",
    build_dir=os.path.join("jupyterhub_configurator", "static"),
    source_dir="frontend",
    # TODO: jupyter-packaging should autodetect whether to build/rebuild
    # but at present it's not working in the GitHub workflow 😢
    force=not all(os.path.exists(f) for f in jstargets),
)
cmdclass = wrap_installers(
    pre_develop=jsdeps, pre_dist=jsdeps,
    ensured_targets=jstargets)

setup(
    name="jupyterhub-configurator",
    version="1.0",
    packages=find_packages(),
    license="3-BSD",
    author="yuvipanda",
    author_email="yuvipanda@gmail.com",
    cmdclass=cmdclass,
    install_requires=["tornado", "aiohttp", "jupyterhub", "deepmerge", "pluggy"],
    include_package_data=True,
    entry_points={
        "jupyterhub_configurator": [
            "z2jh = jupyterhub_configurator.schemas.z2jh",
            "tljh = jupyterhub_configurator.schemas.tljh"
        ]
    },
)
