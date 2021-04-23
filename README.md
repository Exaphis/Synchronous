# Synchronous

## Cloning the repository

```console
git clone --recurse-submodules https://github.com/pinkslp/Synchronous.git
```

## Retrieving new changes from the repository

```console
git pull origin main
git submodule update --recursive
```

## Installation

Download and install Docker (<https://www.docker.com/products/docker-desktop>).

Edit your hosts file (`/etc/hosts` on Linux/Mac,
`C:\Windows\System32\drivers\etc\hosts` on Windows) to include the following lines:

```console
# Synchronous
127.0.0.1 synchronous.localhost
127.0.0.1 tusd.synchronous.localhost
127.0.0.1 api.synchronous.localhost
127.0.0.1 etherpad.synchronous.localhost
127.0.0.1 spacedeck.synchronous.localhost
```

This allows you to access Synchronous and all necessary other services on
<http://synchronous.localhost> and its various subdomains, which allows for
SameSite cookies.

Start up Docker containers (the initial container build may take a long time!)

```console
docker compose up
```

Code changes for React and Django will be automatically detected, and the respective
servers will automatically restart. However, any changes that would normally require
a manual restart of the server would require you to stop all containers using Ctrl+C
and re-run the command.

## Deploying

### Frontend

`cd Frontend && npm run build` will build a production-ready version of the
frontend React app. This can be deployed using Netlify.

To prevent a 404 when refreshing a page that is not the root, you must follow the
steps in <https://answers.netlify.com/t/support-guide-direct-links-to-my-single-page-app-spa-dont-work/126>.

### Backend

Clone the repository (see [Cloning the repository](#cloning-the-repository)).

Then, start the production-ready Docker containers using the following command:

```console
docker-compose -f production.yml up -d
```

HTTPS must be enabled.

## Usage

Visit <https://synchronous.codes>.

## Troubleshooting

### I need to add a new dependency

React dependencies can be installed as usual using `npm install ... --save` within
the `Frontend/` directory.

Django dependencies must be added to `requirements.txt`.

After installing, restart the containers.

If it still doesn't work, enter the command line for the container using Docker
Desktop and run the installation command from the container itself.

### A docker container is not showing the changes I made

Try rebuilding the container using `docker compose up SERVICE_NAME --build` where
SERVICE_NAME is the name of the service whose container you want to rebuild. The
services can be found in `docker-compose.yml` (e.g. nginx, backend, frontend, etc.).
