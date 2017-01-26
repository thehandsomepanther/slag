#!/bin/sh

# Check proper node version (>= 7.0.0) to run program

RED="\033[0;31m"
GRN="\033[0;32m"
NC="\033[0m"
VERSIONS="v[7-9].\d.\d"
VALID_NODE_VERSION="7.2.1"

# Only execute start script if valid node version is found
if [[ $(node --version | grep ${VERSIONS}) ]] ; then
  echo "${GRN}Starting program...${NC}"
  node ./bin/slag.js
else
  echo "${RED}It appears that you don't have the appropriate node version to run this program${GRN}"
  read -p "Would you like to install it? (Y/N): " res
  case "${res}" in [yY]|[yY][eE][sS])
    echo "${NC}Installing prerequisites..."
    if [[ ! $(npm list -g n) ]] ; then
      npm i -g n
    fi
    n $VALID_NODE_VERSION
  esac
fi
