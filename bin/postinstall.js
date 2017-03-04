#!/usr/bin/env node

let fs = require('fs-extra')
let path = require('path')

const bannerPath = path.join(__dirname, '../assets/banner.txt')

try {
  const banner = fs.readFileSync(bannerPath, { encoding: 'utf-8' })
  console.log(banner)
} catch(err) {
  if (err.code == 'ENOENT') 
    console.log('Welcome to Slag Client')
}

console.log('Type `slag --man` to get started\n')
