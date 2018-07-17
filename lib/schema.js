import joi from 'joi'

import { range } from 'lodash'

const statusCodes = {
  nonError: [
    ...range(200, 208),
    226,
    ...range(300, 308)
  ],
  error: [
    ...range(400, 418),
    ...range(421, 424),
    426,
    428,
    429,
    431,
    451,
    ...range(500, 511)
  ]
}
const httpMethods = [
  'get',
  'post',
  'put',
  'delete',
  'head',
  'options'
]
const templatingEngines = [
  'html',
  'react',
  'pug',
  'ejs',
  'mustache'
]
const cgiRuntimes = [
  'node',
  'php'
]

export default joi.object().keys({
  version: joi.number().min(1).max(1).required(), // The schema version to parse
  server: joi.object().keys({
    domain: joi.alternatives().try( // Domains that the server is attached to
      joi.string().hostname(),
      joi.array().items(joi.string().hostname())
    ),
    host: joi.alternatives().try( // Either a hostname or IP to listen on
      joi.string().hostname(),
      joi.string().ip()
    ).default('0.0.0.0'),
    port: joi.number().integer().positive().max(65536).default(3000), // The port to listen on
    routes: joi.array().items(joi.object().keys({
      path: joi.string().uri({ relativeOnly: true }).required(), // The URI path to route
      response: joi.object().keys({ // Response body configuration
        render: joi.object().keys({
          engine: joi.string().valid(...templatingEngines).default('html'), // Which templating engine to use
          template: joi.string().required(), // Either a filename, or the template in string format
          variables: joi.array().items(joi.string()) // User variables to pass into the templating engine
        }),
        cgi: joi.object().keys({
          runtime: joi.string().valid(...cgiRuntimes).required(), // The runtime in which to execute the script
          script: joi.string().required(), // The location of the script
          variables: joi.array().items(joi.string()) // Any variables to pass into the script
        }),
        file: joi.object().keys({
          location: joi.string().required() // The location of the file to send
        }),
        directory: joi.object().keys({ // Serve an entire directory statically
          location: joi.string().required(),
          listing: joi.alternatives().try(
            joi.boolean(), // Show directory listing
            joi.object().keys({ // Render a directory index page
              engine: joi.string().valid(...templatingEngines).required(),
              template: joi.string().required(),
              variables: joi.array().items(joi.string())
            }) // Location of index file
          ).default(false),
          exclude: joi.array().items(joi.string()), // Files or patterns to exclude
          include: joi.array().items(joi.string()), // Files or patterns to include
          hidden: joi.boolean().default(false) // Show hidden files
        }).xor(
          'exclude',
          'include'
        ),
        text: joi.string(), // Return plaintext
        redirect: joi.object().keys({
          location: joi.string().required(), // The redirect location
          permanent: joi.boolean().default(false) // Whether or not this is a permanent (301) redirect instead of a temporary (302) redirect
        }),
        gzip: joi.boolean().default(true), // GZIP the response
        minify: joi.boolean().default(false), // Minify the response if it is HTML, CSS, or JS
        headers: joi.array().items(joi.object().length(1)),
        statusCode: joi.number().valid(...statusCodes.nonError).default(200),
        cache: joi.object().keys({
          maxAge: joi.number().default(1 * 24 * 60 * 60), // Set to 0 to add no-cache flag
          public: joi.boolean(),
          private: joi.boolean(),
          noStore: joi.boolean()
        }).xor(
          'public',
          'private'
        )
      }).xor(
        'render',
        'cgi',
        'file',
        'directory',
        'redirect',
        'text'
      ).required(),
      request: joi.object().keys({
        filter: joi.object().keys({
          method: joi.string().valid(...httpMethods), // Leave unset to assume all methods
          headers: joi.array().items(joi.alternatives().try(
            joi.object().length(1),
            joi.string()
          )), // Allows for filtering for presence and specific values
          queries: joi.array().items(joi.alternatives().try(
            joi.object().length(1),
            joi.string()
          )), // URL query items
          body: joi.array().items(joi.alternatives().try(
            joi.object().length(1),
            joi.string()
          )), // POST body
          params: joi.array().items(joi.alternatives().try(
            joi.object().length(1),
            joi.string()
          )), // Query and body parameters
          domain: joi.alternatives().try(
            joi.string().hostname(),
            joi.array().items(joi.string().hostname()) // Only serve this response on a specific domain
          ),
          cookies: joi.array().items(joi.object().keys({
            name: joi.string().required(),
            value: joi.string().required(),
            domain: joi.string().hostname(),
            path: joi.string().uri({ relativeOnly: true })
          }))
        })
      })
    })),
    errors: joi.array().items(joi.object().keys({ // Makes an attempt at error-handling pages. If errors occur while generating an error document based on the configuration below, a generic error page will be used
      statusCode: joi.number().valid(...statusCodes.error).required(),
      render: joi.object().keys({
        engine: joi.string().valid(...templatingEngines).required().default('html'), // Which templating engine to use
        template: joi.string().required(), // Either a filename, or the template in string format
        variables: joi.array().items(joi.string()) // Variables to pass into the templating engine
      }),
      cgi: joi.object().keys({
        runtime: joi.string().valid(...cgiRuntimes).required(), // The runtime in which to execute the script
        script: joi.string().required(), // The location of the script
        variables: joi.array().items(joi.string()) // Any user variables to pass into the script
      }),
      text: joi.string(), // Return just plaintext
      gzip: joi.boolean().default(true), // GZIP the response
      minify: joi.boolean().default(false), // Minify the response if it is HTML, CSS, or JS
      headers: joi.array().items(joi.object().length(1))
    }).xor(
      'render',
      'cgi',
      'text'
    ).required())
  })
})
