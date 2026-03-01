import { type Cli, z } from 'incur'
import { linkAll } from '../manager.js'
import { InvalidGroupError, ConfigNotFoundError } from '../config.js'

export function registerLinkCommand(cli: ReturnType<typeof Cli.create>) {
  cli.command('link', {
    description: 'Create symbolic links for all managed dotfiles',
    options: z.object({
      select: z.string().optional().describe('Select target group (e.g. "shell", "editor")'),
    }),
    alias: { select: 's' },
    output: z.object({
      linked: z.number().describe('Number of symlinks created'),
      skipped: z.number().describe('Number of already-existing symlinks skipped'),
      items: z.array(z.object({
        source: z.string().describe('Absolute path to source file'),
        destination: z.string().describe('Absolute path to symlink destination'),
        status: z.enum(['linked', 'skipped']).describe('Whether the symlink was created or skipped'),
      })),
    }),
    examples: [
      { description: 'Link all dotfiles' },
      { options: { select: 'shell' }, description: 'Link only the "shell" group' },
    ],
    hint: 'Reads dotfiles.json from the current directory. Each mapping group defines source → destination symlinks. Existing symlinks are skipped.',
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
