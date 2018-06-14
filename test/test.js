const tap = require('tap')

const dockerEngine = require('..')

tap.test('docker-engine', async t => {

  const client = await dockerEngine()

  /**
   * Create a container and check there are no warnings:
   */

  let res = await client.Container.ContainerCreate({
    body: {
      Image: 'hello-world'
    }
  })
  t.equal(res.Warnings, null)

  /**
   * Inspect the container and check a couple of properties:
   */

  const id = res.Id
  res = await client.Container.ContainerInspect({id})
  t.same(res.Config.Cmd, ['/hello'])
  t.same(res.Config.Image, 'hello-world')

  /**
   * Modify the container:
   */

  t.equal(res.HostConfig.Memory, 0)
  t.equal(res.HostConfig.MemorySwap, 0)
  const memoryLimit = 4 * 1024 * 1024
  await client.Container.ContainerUpdate({
    id,
    update: {
      Memory: memoryLimit,
      MemorySwap: memoryLimit
    }
  })
  res = await client.Container.ContainerInspect({id})
  t.equal(res.HostConfig.Memory, memoryLimit)
  t.equal(res.HostConfig.MemorySwap, memoryLimit)

  /**
   * Delete the container:
   */

  await client.Container.ContainerDelete({id})
  t.end()
})
