#!/bin/sh

rsync \
--exclude .github \
--exclude .git \
--exclude .next \
--exclude dist \
--exclude src/uploads \
--exclude node_modules \
--exclude *.sh \
--exclude .env \
--exclude Dockerfile \
--exclude deployment \
--include copy.sh \
-og \
--chmod=Du=rwx,Dgo=rx,Fu=rw,Fog=r \
--chown=ec2-user: \
--verbose --recursive --update \
../ ec2-user@inventorycapture.com:/home/ec2-user/inventory-locator/api