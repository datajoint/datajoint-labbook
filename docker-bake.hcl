variable "PY_VER" {
    default = "3.8"
}

variable "IMAGE" {
    default = "djbase"
}

variable "DISTRO" {
    default = "alpine"
}

variable "PHARUS_VERSION" {
    default = "$(cat pharus/pharus/version.py | tail -1 | awk -F\" '{print $2}')"
}

variable "DJLABBOOK_VERSION" {
    default = "$(cat package.json | grep \"version\" | awk -F\" '{print $4}')"
}

variable "HOST_UID" {
    default = "$(id -u)"
}

target "app" {
    dockerfile = "Dockerfile"
    platforms = ["linux/amd64"]
    args = {
        PY_VER = "${PY_VER}"
        HOST_UID = "${HOST_UID}"
        DJLABBOOK_VERSION = "${DJLABBOOK_VERSION}"
        PHARUS_VERSION = "${PHARUS_VERSION}"
        DISTRO = "${DISTRO}"
        IMAGE = "${IMAGE}"
    }
}