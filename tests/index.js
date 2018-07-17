import fs from 'fs'
import path from 'path'

import { should } from 'chai'
import { describe, it, before } from 'mocha'

import yaml from 'js-yaml'

import httpack from '../lib/index.js'

let configs

before((done) => {
  fs.readFile(path.resolve(__dirname, 'examples.yml'), (err, configText) => {
    if (err) return done(err)

    configs = yaml.safeLoad(configText)
    done()
  })
})
should() // Initialize ChaiJS assertions

describe('Validation', () => {
  it('Accepts a fully valid configuration', () => {
    httpack(configs.valid)
  })
})
