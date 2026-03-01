import { type Cli, z } from 'incur'
import { linkAll } from '../manager.js'
import { InvalidGroupError, ConfigNotFoundError } from '../config.js'

export function registerLinkCommand(cli: ReturnType<typeof Cli.create>) {
  cli.command('link', {
    description: 'Create symbolic links for all managed dotfiles',
    options: z.object({
      select: z.string().optional().describe('Select target group'),
    }),
    alias: { select: 's' },
    run(c) {
      const configRoot = process.cwd()
      try {
        const result = linkAll(configRoot, c.options.select)
        return { linked: result.linked, skipped: result.skipped, items: result.items }
      } catch (e) {
        if (e instanceof InvalidGroupError || e instanceof ConfigNotFoundError) {
          return c.error({ code: 'CONFIG_ERROR', message: e.message })
        }
        throw e
      }
    },
  })
}
