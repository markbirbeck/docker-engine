const tap = require('tap')

const Builder = require('../src/lib/SwaggerRequestBuilder')
const builder = new Builder()
const Modem = require('../src/lib/SwaggerModem')
const modem = new Modem()

tap.test('SwaggerModem', async t => {
  t.comment('creating a container')

  /**
   * Prepare the request:
   */

  const body = {
    Image: 'alpine',
    Cmd: ['/bin/sh', '-c', 'for i in 1 2 3 4 5; do echo "${i}"; sleep 1s; done']
  }
  const req = builder.ContainerCreate({ body })

  /**
   * Make the API call:
   */

  const res = await modem.dial(req)

  /**
   * There should be no errors, and an ID should be returned:
   */

  t.equal(res.Warnings, null)
  t.ok(res.Id)

  t.end()
})
