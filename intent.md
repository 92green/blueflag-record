# Blue Flag Webpack
A library to lower the barrier to using webpack in projects at Blue Flag.

## Reasoning
* Zero-config is great but once it fails it fails completely.
* Storing oppinionated configs in libraries but allowing projects to override works well 
* This library will store a base webpack config and provide a function to extend it 
* This library will hold webpack dependencies to bundle and make upgrade paths less severe.
