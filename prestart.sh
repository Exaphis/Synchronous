#!/bin/bash
# to be run by tiangolo/uvicorn-gunicorn-docker before start

python3 manage.py migrate
