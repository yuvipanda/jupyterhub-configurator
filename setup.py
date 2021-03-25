from setuptools import setup, find_packages

setup(
    name="jupyterhub-configurator",
    version="1.0",
    packages=find_packages(),
    license="3-BSD",
    author="yuvipanda",
    author_email="yuvipanda@gmail.com",
    install_requires=["tornado", "aiohttp", "jupyterhub", "deepmerge"],
    include_package_data=True,
)
