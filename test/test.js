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
   * Delete the container:
   */

  await client.Container.ContainerDelete({id})
  t.end()
})
