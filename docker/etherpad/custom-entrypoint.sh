#!/bin/sh

export "DB_PASS=${ETHERPAD_PASSWORD}"
node src/node/server.js
