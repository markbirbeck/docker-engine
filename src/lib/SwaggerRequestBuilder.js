const fs = require('fs')
const path = require('path')

const Swagger = require('swagger-client')
const yaml = require('js-yaml')

class SwaggerRequestBuilder {
  constructor(apiVersion = 'v1.37') {
    this.apiVersion = apiVersion

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

    const yamlFile = path.resolve(__dirname, `../swagger/${apiVersion}/swagger.yaml`)
    this.spec = yaml.safeLoad(fs.readFileSync(yamlFile))

    /**
     * Set up a handler that will cope with all operation IDs:
     */

    const handler = {
      get(obj, prop) {
        return parameters => {
          return obj.buildRequest(prop, parameters)
        }
      }
    }

    return new Proxy(this, handler)
  }

  buildRequest(operationId, parameters) {
    const params = {
      spec: this.spec,
      operationId,
      parameters
    }

    const req = Swagger.buildRequest(params)

    /**
     * Attach the acceptable response codes:
     */

    /**
     * The paths are in an object so convert to an array so that we can use
     * find():
     */

    const pathsAsArray = Object.keys(this.spec.paths).map(k => this.spec.paths[k])

    /**
     * Now find the operation that corresponds to the operationId and method that
     * we have:
     */

    const method = req.method.toLowerCase()
    const definition = pathsAsArray.find(p => {
      return p[method] && (p[method].operationId === operationId)
    })
    req.responses = definition[method].responses

    return req
  }
}

module.exports = SwaggerRequestBuilder
