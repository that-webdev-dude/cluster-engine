# Render Pipeline Library

`pipelineLibrary` is a private render subservice for backend pipeline ownership.

It normalizes portable renderer-intent pipeline descriptors, computes stable
renderer-owned cache keys, compiles backend-specific programs, invalidates
compiled state when graphics status changes, and releases backend programs on
stop or dispose.

WebGL2 GLSL and WebGPU WGSL source selection live inside this package.
Submitters describe shader family, pass, material, primitive, blend, and vertex
layout intent without carrying native shader source or backend handles.

Pipeline records are implementation details. Public render input describes
items, layers, materials, and resource ids rather than exposing pipeline handles.
