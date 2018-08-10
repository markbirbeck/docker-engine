const tap = require('tap')

const Builder = require('../src/lib/SwaggerRequestBuilder')
const builder = new Builder()

tap.test('SwaggerRequestBuilder', async t => {
  t.test('create a request object for container creation', async t => {
    const body = {
      Image: 'alpine',
      Cmd: ['/bin/sh', '-c', 'for i in 1 2 3 4 5; do echo "${i}"; sleep 1s; done']
    }
    const req = builder.ContainerCreate({ body })

    /**
     * Check that the basic components for a request are present:
     */

    t.equal(req.url, '/v1.37/containers/create')
    t.equal(req.method, 'POST')
    t.same(req.body, body)

    /**
     * Also check that there is a property that tells us how to verify the
     * result of the request:
     */

    t.ok(req.responses)

    t.end()
  })

  t.test('create a request object for deleting a container', async t => {
    const id = 'container-to-delete'
    const req = builder.ContainerDelete({ id })

    /**
     * Check that the basic components for a request are present:
     */

    t.equal(req.url, `/v1.37/containers/${id}?v=false&force=false&link=false`)
    t.equal(req.method, 'DELETE')

    /**
     * Also check that there is a property that tells us how to verify the
     * result of the request:
     */

    t.ok(req.responses)

    t.end()
  })
})
