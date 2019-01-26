# PDS
Public Data Service for crypto markets

## Development workflow

To build `pds`:

`packages/PDS$ npm run tscbuild`

This runs `tsc --build --watch`. Since `core` is defined as a [project reference](https://www.typescriptlang.org/docs/handbook/project-references.html), changes in that project will be detected and recompiled.

