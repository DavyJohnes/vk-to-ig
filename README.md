vk-to-ig
========

VK to Instagram migration tool

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/vk-to-ig.svg)](https://npmjs.org/package/vk-to-ig)
[![Downloads/week](https://img.shields.io/npm/dw/vk-to-ig.svg)](https://npmjs.org/package/vk-to-ig)
[![License](https://img.shields.io/npm/l/vk-to-ig.svg)](https://github.com/DavyJohnes/vk-to-ig/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g vk-to-ig
$ vk-to-ig COMMAND
running command...
$ vk-to-ig (-v|--version|version)
vk-to-ig/0.0.3 darwin-x64 node-v14.15.4
$ vk-to-ig --help [COMMAND]
USAGE
  $ vk-to-ig COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`vk-to-ig help [COMMAND]`](#vk-to-ig-help-command)
* [`vk-to-ig photos`](#vk-to-ig-photos)

## `vk-to-ig help [COMMAND]`

display help for vk-to-ig

```
USAGE
  $ vk-to-ig help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.2/src/commands/help.ts)_

## `vk-to-ig photos`

Moves photos from VK to Instagram

```
USAGE
  $ vk-to-ig photos

OPTIONS
  -h, --help                       show CLI help
  -t, --type=(wall|profile|saved)  (required) Photos type

EXAMPLE
  $ vk-to-ig photos --type wall
```

_See code: [src/commands/photos.ts](https://github.com/DavyJohnes/vk-to-ig/blob/v0.0.3/src/commands/photos.ts)_
<!-- commandsstop -->
