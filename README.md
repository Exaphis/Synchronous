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

## Usage

Visit <http://synchronous.localhost>.

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
