#!/usr/bin/env bash
#/bin/bash
#============================================
# Proxy config cookie updater
#--------------------------------------------
# Version 2
# Reads host details from a proxy config file
# and gets a fresh Cookie
#============================================

# Config file
proxyConfig="proxy-config-vapp.json"
echo "Reading host details from $proxyConfig"

# Protocol
printf "Getting protocol: "
protocol=`grep -Poh '"protocol":\s*?"\K.*(?=",?)' $proxyConfig`
if [ -n "$protocol" ]
then
  echo $protocol
else
  echo "not found, quitting"
  exit 1
fi

# Host
printf "Getting host: "
host=`grep -Poh '"host":\s*?"\K.*(?=",?)' $proxyConfig`
if [ -n "$host" ]
then
  echo $host
else
  echo "not found, quitting"
  exit 1
fi

# Username
printf "Getting username: "
username=`grep -Poh '"UserID":\s*?"\K.*(?=",?)' $proxyConfig`
if [ -n "$username" ]
then
  echo $username
else
  echo "not found, quitting"
  exit 1
fi

# Password
password="TestPassw0rd"

# Cookies
cookiejar="`basename $PWD`.cookiejar"
printf "Fetching cookie... "
curl -k --request POST "$protocol://$host/login" -d IDToken1="$username" -d IDToken2="$password" -c "$cookiejar" && echo "OK"

# get from cookiejar file
newCookie=`grep -Poh 'iPlanetDirectoryPro[[:blank:]]\K.*' $cookiejar`
newCookie=$(echo "$newCookie" | sed 's/\./\\\./g')
newCookie=$(echo "$newCookie" | sed 's/\*/\\\*/g')

# get from proxyConfig file
oldCookie=`grep -Poh '"Cookie":\s*"\K.*(?=",?)' $proxyConfig`
oldCookie=$(echo "$oldCookie" | sed 's/\./\\\./g')
oldCookie=$(echo "$oldCookie" | sed 's/\*/\\\*/g')

# Use sed to replace one string with another in a file
printf "Replacing cookie... "
sed -i "s/$oldCookie/iPlanetDirectoryPro=$newCookie/g" $proxyConfig && echo "OK"

# Start serving
#echo "Starting cdt serve..."
#cdt2 serve --proxy-config proxy-config-vapp.json
