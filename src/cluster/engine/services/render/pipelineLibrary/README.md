# Render Pipeline Library

`pipelineLibrary` is a private render subservice for backend pipeline ownership.

It normalizes pipeline descriptors, compiles WebGL2 shader programs, caches
programs by renderer-owned keys, invalidates compiled state when graphics
status changes, and releases backend programs on stop or dispose.

Pipeline records are implementation details. Public render input describes
items, layers, materials, and resource ids rather than exposing pipeline handles.
