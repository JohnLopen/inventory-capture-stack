#!/bin/sh

rsync \
--exclude .github \
--exclude .git \
--exclude dist \
--exclude node_modules \
--exclude *.sh \
--exclude .env \
-og \
--chmod=Du=rwx,Dgo=rx,Fu=rw,Fog=r \
--chown=pabski: \
--verbose --recursive --update \
../ pabski@upstimate.com:/var/www/api.upstimate.com