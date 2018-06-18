const tap = require('tap')

const dockerEngine = require('..')

tap.test('docker-engine', async t => {
  let config

  if (process.env.DOCKER_AWS) {
    config = {
      username: 'docker',
      privateKey: require('fs').readFileSync(__dirname + '/docker-swarm.pem', 'utf8'),
      host: process.env.DOCKER_AWS,
      socketPath: '/var/run/docker.sock'
    }
  }

  const client = await dockerEngine(config)

  /**
   * Create a container and check there are no warnings:
   */

  t.comment('creating container')
  let res = await client.Container.ContainerCreate({
    body: {
      Image: 'hello-world'
    }
  })
  t.equal(res.Warnings, null)

  /**
   * Inspect the container and check a couple of properties:
   */

  t.comment('inspecting container')
  const id = res.Id
  res = await client.Container.ContainerInspect({id})
  t.same(res.Config.Cmd, ['/hello'])
  t.same(res.Config.Image, 'hello-world')

  /**
   * Modify the container:
   */

  t.comment('updating container')
  t.equal(res.HostConfig.Memory, 0)
  t.equal(res.HostConfig.MemorySwap, 0)
  const memoryLimit = 4 * 1024 * 1024
  await client.Container.ContainerUpdate({
    id,
    update: {
      Memory: memoryLimit,
      MemorySwap: -1
    }
  })
  res = await client.Container.ContainerInspect({id})
  t.equal(res.HostConfig.Memory, memoryLimit)
  t.equal(res.HostConfig.MemorySwap, -1)

  /**
   * Delete the container:
   */

  t.comment('deleting container')
  await client.Container.ContainerDelete({id})
  t.end()
})
