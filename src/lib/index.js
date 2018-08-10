const DockerEngine = require('./DockerEngine')

const dockerEngine = async (tunnelConfig) => {

  /**
   * If a tunnel is requested then set one up:
   */

  let config
  if (tunnelConfig) {
    const tunnel = require('./tunnel')
    config = await tunnel(tunnelConfig);
  }

  return new DockerEngine(config)
}

module.exports = dockerEngine;
