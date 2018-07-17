import fs from 'fs'

import { isString, isObject } from 'lodash'
import yaml from 'js-yaml'
import joi from 'joi'

import schema from './schema.js'
import bootstrap from './bootstrap.js'

function loadConfig (config) {
  // Load the config, either from a file, or using the passed in object
  if (isString(config)) {
    let configFile = fs.statSync(config)

    if (configFile.isFile()) {
      let configText = fs.readFileSync(config).toString()

      return yaml.safeLoad(configText) // Try to load YAML and/or JSON, otherwise throw an error which will be handled higher up
    }
  } else if (isObject(config)) {
    return config // The configuration object was passed in, not a reference to it
  } else {
    throw new Error('No configuration provided')
  }
}

export default function httpack (userconf) {
  try {
    // Load the config, either from a file or from a user provided object
    let config = loadConfig(userconf) // The configuration to use for set up

    // Check that the config is valid
    let validationStatus = joi.validate(config, schema)
    if (validationStatus.error != null) throw validationStatus.error // Throw the first validation error

    // Set up the server
    let preparedServer = bootstrap(config)
    preparedServer.listen = preparedServer.listen.bind(preparedServer, config.port || 3000, config.host || '0.0.0.0')
    return preparedServer // Pass the prepared server to the command/binary handler or to a script that programmatically called httpack
  } catch (err) {
    throw err
  }
}
