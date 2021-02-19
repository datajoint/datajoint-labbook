#!/bin/bash

#Fix UID/GID
/startup -user=node -new_uid=$(id -u) -new_gid=$(id -g)

#Run command
"$@"
