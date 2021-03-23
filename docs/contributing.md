# Contributing

`jupyterhub-configurator` has three components:

1. A [tornado](https://torandoweb.org) based [JupyterHub
   service](https://jupyterhub.readthedocs.io/en/stable/reference/services.html)
   written in python, providing the backend for storing and retreiving config
2. A set of mixins to be used with your JupyterHub spawner for dynamic configuration
3. A [react](https://reactjs.org/) based frontend


## Backend & JupyterHub

Since `jupyterhub-configurator` is run as a JupyterHub service, it is best developed
when run by JupyterHub itself. We ship a `jupyterhub_config.py` that runs a JupyterHub
in development mode with appropriate service setup.

1. Install required dependencies and the configurator package itself
  
   ```bash
   pip install -r requirements.txt
   ```
   
2. Start a jupyterhub. You might first need to `npm install -g configurable-http-proxy`
   as well.

   ```
   jupyterhub
   ```
   
   This should start a JupyterHub on `http://localhost:8000`.
   
3. Log in to the hub with username `admin` and any password. 

4. Open the configurator UI at http://localhost:8000/services/configurator/

You'll need to stop and start the `jupyterhub` process whenever you make a change to
the backend.

## Frontend

You need [npm](https://www.npmjs.com/) to work on the frontend, which is contained inside
the `frontend/` directory.

1. Get inside the `frontend/` directory and install required dependencies
   
   ```bash
   cd frontend
   npm i
   ```

2. We use [webpack](https://webpack.js.org/) to build our dependencies, and it can
   automatically rebuild whenever you make a change.
   
   ```bash
   npm run dev
   ```

3. Your configurator page should now be running your latest local build of JS.
   You have to refresh the page to pick up any changes.
