PY_VER="3.8"

IMAGE="djbase"

DISTRO="alpine"

PHARUS_VERSION="$(cat pharus/pharus/version.py | tail -1 | awk -F\" '{print $2}')"

DJLABBOOK_VERSION="$(cat package.json | grep \"version\" | awk -F\" '{print $4}')"

HOST_UID="$(id -u)"