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
  let req = builder.ContainerCreate({ body })

  /**
   * Make the API call:
   */

  let res = await modem.dial(req)

  /**
   * There should be no errors, and an ID should be returned:
   */

  t.equal(res.Warnings, null)
  t.ok(res.Id)

  /**
   * Attach to the container but with streaming off to ensure that we
   * do NOT get a streaming object:
   */

  const id = res.Id
  req = builder.ContainerAttach({
    id,
    stream: false,
    stdout: true,
    stderr: true
  })

  res = await modem.dial(req)

  /**
   * Verify that we didn't get a streaming object:
   *
   * We could test against an empty string but when the test fails we will
   * get the entire streaming object displayed as 'not matching' the empty
   * string. Checking the type means that we get a much more compact error
   * message!
   */

  t.type(res, 'string')

  t.comment('deleting the created container')

  /**
   * Prepare the request:
   */

  req = builder.ContainerDelete({ id })

  /**
   * Make the API call:
   */

  res = await modem.dial(req)

  /**
   * Nothing is returned, but if there's no error thrown then all is well:
   */

  t.equal(res, '')

  t.end()
})
