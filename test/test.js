/**
 * TODO(MB): These tests are very crude...they only work with my setup.
 * They will be replaced shortly with tests that create and delete
 * containers so that they can run anywhere.
 */

const tap = require('tap')

const dockerEngine = require('..')

tap.test('docker-engine', async t => {

  const client = await dockerEngine()

  /**
   * Get a list of containers:
   */

  let list = await client.Service.ServiceList()
  let container = list[0]

  t.equal(container.ID, '0z538jyrieb90gb0f331cruce')

  /**
   * Inspect the container:
   */

  const id = '8069499d00246a5caba4f48684b3d0345362ee8b4a4b9c46a83c87e7b4c6b8f1'
  container = await client.Container.ContainerInspect({id})
  t.equal(container.Id, id)

  /**
   * Get a list of images:
   */

  list = await client.Image.ImageList()
  const image = list[0]

  t.equal(image.Size, 114522907)
  t.end()
})
