import { type Cli, z } from 'incur'
import { unlinkAll } from '../manager.js'
import { InvalidGroupError, ConfigNotFoundError } from '../config.js'

export function registerUnlinkCommand(cli: ReturnType<typeof Cli.create>) {
  cli.command('unlink', {
    description: 'Remove symbolic links for all managed dotfiles',
    options: z.object({
      select: z.string().optional().describe('Select target group (e.g. "shell", "editor")'),
      force: z.boolean().optional().describe('Force unlink critical files (marked critical: true in config)'),
    }),
    alias: { select: 's' },
    output: z.object({
      unlinked: z.number().describe('Number of symlinks removed'),
      skipped: z.number().describe('Number of symlinks skipped'),
      items: z.array(z.object({
        destination: z.string().describe('Absolute path to symlink that was processed'),
        status: z.enum(['unlinked', 'skipped_critical', 'skipped_not_symlink']).describe('Result of the unlink operation'),
      })),
    }),
    examples: [
      { description: 'Unlink all dotfiles' },
      { options: { select: 'shell' }, description: 'Unlink only the "shell" group' },
      { options: { force: true }, description: 'Force unlink including critical files' },
      { options: { select: 'editor', force: true }, description: 'Force unlink the "editor" group' },
    ],
    hint: 'Critical files (e.g. .ssh/config) are skipped by default. Use --force to remove them. Non-symlink files at destination paths are always skipped.',
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
