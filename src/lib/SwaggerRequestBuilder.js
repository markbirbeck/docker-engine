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
  }

  ContainerCreate(parameters) {
    const params = {
      spec: this.spec,
      operationId: 'ContainerCreate',
      parameters
    }

    const req = Swagger.buildRequest(params)

    /**
     * Attach the acceptable response codes:
     */

    const definition = this.spec.paths['/containers/create'][req.method.toLowerCase()]
    req.responses = definition.responses

    return req
  }

  ContainerDelete(parameters) {
    const params = {
      spec: this.spec,
      operationId: 'ContainerDelete',
      parameters
    }

    const req = Swagger.buildRequest(params)

    /**
     * Attach the acceptable response codes:
     */

    const definition = this.spec.paths['/containers/{id}'][req.method.toLowerCase()]
    req.responses = definition.responses

    return req
  }
}

module.exports = SwaggerRequestBuilder
