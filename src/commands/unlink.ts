import { type Cli, z } from 'incur'
import { unlinkAll } from '../manager.js'
import { InvalidGroupError, ConfigNotFoundError } from '../config.js'

export function registerUnlinkCommand(cli: ReturnType<typeof Cli.create>) {
  cli.command('unlink', {
    description: 'Remove symbolic links for all managed dotfiles',
    options: z.object({
      select: z.string().optional().describe('Select target group'),
      force: z.boolean().optional().describe('Force unlink critical files'),
    }),
    alias: { select: 's' },
    run(c) {
      const configRoot = process.cwd()
      try {
        const result = unlinkAll(configRoot, c.options.select, c.options.force ?? false)
        return { unlinked: result.unlinked, skipped: result.skipped, items: result.items }
      } catch (e) {
        if (e instanceof InvalidGroupError || e instanceof ConfigNotFoundError) {
          return c.error({ code: 'CONFIG_ERROR', message: e.message })
        }
        throw e
      }
    },
  })
}
