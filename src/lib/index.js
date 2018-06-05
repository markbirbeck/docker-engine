const http = require('http')
const Swagger = require('swagger-client')
const yaml = require('js-yaml')
const fs = require('fs')

/**
 * We could load directly from docker.com, but having the file locally means
 * we can run in airplane mode:
 *
 *  Swagger('https://docs.docker.com/engine/api/v1.37/swagger.yaml')...
 */

/**
 * Swagger can't load local files, but it can take a 'spec'. So load the YAML
 * and convert to JSON:
 */

const apiVersion = `v1.37`
const yamlFile = __dirname + `/swagger/${apiVersion}/swagger.yaml`
const spec = yaml.safeLoad(fs.readFileSync(yamlFile))

const dockerEngine = async () => {
  const swagger = await Swagger(
    'localhost',
    {
      spec,
      userFetch: (...args) => {

        /**
         * Add the socket path to the current request options:
         */

        const options = {
          socketPath: '/var/run/docker.sock',
          ...args[1]
        }

        /**
         * Use path instead of url (note that the hostname will be set to the
         * location of the Swagger file, but the unix socket doesn't care about
         * the host name:
         */

        options.path = options.url
        delete options.url

        /**
         * Return a promise that does the request:
         */

        return new Promise((resolve, reject) => {
          const req = http.request(options, res => {

            /**
             * Collect all of the input:
             */

            let str = ''
            res.setEncoding('utf8')
            res.on('data', chunk => str += chunk)

            /**
             * Once the request has been fully received we need to set up a
             * Respone object that provides methods that give access to the
             * returned data:
             */

            res.on('end', () => {

              /**
               * See https://github.com/swagger-api/swagger-js#response-shape
               */

              resolve({
                ok: res.statusCode >= 200 && res.statusCode <= 299,
                headers: new Map(Object.entries(res.headers)),
                status: res.statusCode,
                statusText: res.statusMessage,
                text: async () => str,
                buffer: async () => str
              })
            })
          })

          req.on('error', reject)

          if (options.method === 'POST') {
            req.write(options.body)
          }
          req.end()
        })
      }
    }
  )

  const fnHandler = {
    apply: async (target, thisArg, argumentsList) => {
      const ret = await target.apply(thisArg, argumentsList)
      return ret.obj || ret.text
    }
  }

  /**
   * Wrap the function with our own handler:
   */

  const actionHandler = {
    get: (obj, prop) => {
      return new Proxy(obj[prop], fnHandler)
    }
  }

  /**
   * Wrap the top level objects so that we can get at their functions:
   */

  const typesHandler = {
    get: (obj, prop) => {
      if (obj[prop] && typeof obj[prop] === 'object') {
        return new Proxy(obj[prop], actionHandler)
      }
      return obj[prop]
    }
  }
  return new Proxy(swagger.apis, typesHandler)
}

module.exports = dockerEngine;
