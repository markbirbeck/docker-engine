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

  /**
   * Inspect the container and check a couple of properties:
   */

  t.comment('inspecting container')
  const id = res.Id
  res = await api.ContainerInspect({id})
  t.same(res.Config.Cmd, body.Cmd)
  t.same(res.Config.Image, body.Image)

  /**
   * Modify the container:
   */

  t.comment('updating container')
  t.equal(res.HostConfig.Memory, 0)
  t.equal(res.HostConfig.MemorySwap, 0)
  const memoryLimit = 4 * 1024 * 1024
  await api.ContainerUpdate({
    id,
    update: {
      Memory: memoryLimit,
      MemorySwap: -1
    }
  })
  res = await api.ContainerInspect({id})
  t.equal(res.HostConfig.Memory, memoryLimit)
  t.equal(res.HostConfig.MemorySwap, -1)

  /**
   * Run the container:
   */

  t.comment('running container')
  await api.ContainerStart({ id })

  /**
   * Attach the container, and receive the logs as a stream:
   */

  res = await api.ContainerAttach({
    id,
    logs: true,
    stream: true,
    stdout: true,
    stderr: true
  })
  res.setEncoding('utf8')

  /**
   * The logs should arrive 1s apart, which will ensure they are in separate
   * chunks:
   */

  const str = []
  res.on('data', chunk => {
    str.push(chunk)
  })

  /**
   * When we have all of the logs, check we have enough lines, and that each
   * line contains the line number:
   */

  res.on('end', async () => {
    t.equal(str.length, 5)
    for (let i = 0; i < 5; i++) {
      t.equal(str[i], `\x01\0\0\0\0\0\0\x02${i + 1}\n`)
    }
  })

  /**
   * Wait for the container to finish:
   */

  t.comment('waiting for the running container')
  res = await api.ContainerWait({ id })
  t.same(res, { Error: null, StatusCode: 0 })

  t.comment('deleting the created container')

  /**
   * Prepare the request:
   */

  res = await api.ContainerDelete({ id })

  /**
   * Nothing is returned, but if there's no error thrown then all is well:
   */

  t.equal(res, '')

  t.end()
})
