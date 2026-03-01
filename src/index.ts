import { Cli } from 'incur'
import { registerLinkCommand } from './commands/link.js'
import { registerUnlinkCommand } from './commands/unlink.js'

declare const DON_VERSION: string | undefined
const version = typeof DON_VERSION !== 'undefined' ? DON_VERSION : '0.0.0-dev'

const cli = Cli.create('don', {
  description: 'Dotfiles manager - symbolic link management tool',
  version,
})

registerLinkCommand(cli)
registerUnlinkCommand(cli)

void cli.serve()
