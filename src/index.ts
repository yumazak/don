import { Cli } from 'incur'
import { registerLinkCommand } from './commands/link.js'
import { registerUnlinkCommand } from './commands/unlink.js'

const cli = Cli.create('don', {
  description: 'Dotfiles manager - symbolic link management tool',
  version: '0.0.1',
})

registerLinkCommand(cli)
registerUnlinkCommand(cli)

void cli.serve()
