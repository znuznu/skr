#!/bin/env bash

docker rm -f skr-db;
docker volume rm skr_skr-db;
docker network rm skr_skr-network;
