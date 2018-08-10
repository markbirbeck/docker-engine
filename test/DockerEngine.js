const tap = require('tap')

const DockerEngine = require('../src/lib/DockerEngine')
const api = new DockerEngine()

tap.test('DockerEngine', async t => {
  t.comment('creating a container')

  /**
   * Make the API call:
   */

  const body = {
    Image: 'alpine',
    Cmd: ['/bin/sh', '-c', 'for i in 1 2 3 4 5; do echo "${i}"; sleep 1s; done']
  }
  let res = await api.ContainerCreate({ body })

  /**
   * There should be no errors, and an ID should be returned:
   */

  t.equal(res.Warnings, null)
  t.ok(res.Id)

  t.comment('deleting the created container')

  /**
   * Prepare the request:
   */

  res = await api.ContainerDelete({ id: res.Id })

  /**
   * Nothing is returned, but if there's no error thrown then all is well:
   */

  t.equal(res, '')

  t.end()
})
