# docker-engine

A Docker Engine API client for Node, driven by Docker's Swagger definition.

## Why?

There are a number of excellent modules that allow you to connect to the Docker Engine API, but each of them caused me a problem in different ways. Whilst looking at making changes to these modules I realised that all a Docker API client needed was to use the Swagger file that Docker provides.

[harbor-master](https://www.npmjs.com/package/harbor-master): Has a minor issue with some endpoints. [I investigated how to fix this](https://github.com/arhea/harbor-master/issues/6#issuecomment-393490613) and discovered that the API endpoint definitions use Joi; since Swagger files are maintained by Docker themselves, I felt that this was the wrong way to go.

[dockerode](https://www.npmjs.com/package/dockerode): Dockerode also takes the approach of maintaining 'by hand' the connections between itself and the Docker API definitions. An example is the code required to [implement the 'inspect container' endpoint](https://github.com/apocas/dockerode/blob/master/lib/container.js#L46). As with `harbor-master` I felt that this part of the module should be driven by the Swagger file.

[docker-client](https://www.npmjs.com/package/docker-client): This module *is* driven the Swagger file. It's not dynamic--the client is generated with a code-generator that uses the Swagger file as input--but it would have been fine for my purposes. However, I was completely unable to get it to work with my local Docker Swarm. That's almost certain to be my fault, but I couldn't wait any longer, so had to move on. Note that because the client is generated it will be aligned with a specific version, whilst an approach that uses the Swagger file at *run-time* could be more dynamic.

## Our Approach

Key to the approach we've taken here is:

* to use the Swagger file as a *single source of truth* to drive the creation of the client. And more specifically, to do this at *run-time* so that the same module can be used for any version of the Docker API, without needing to be continually updated;
* to use ES6 proxies to allow the client methods to be wrapped and so present different kinds of interfaces to developers. This makes it very easy to present `harbor-master`- or `docker-client`-compatible interfaces that still benefit from being Swagger-driven.

## Future Work

The [docker-modem](https://www.npmjs.com/package/docker-modem) provides all of the connection code we would need for talking to the Docker API, handling TLS, duplex streaming, and so on. However, I wasn't quickly able to work out how to wire it in to `docker-engine`. This means that until `docker-modem` is incorporated the communication part of `docker-engine` is extremely basic.