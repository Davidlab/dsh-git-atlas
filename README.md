# Git Atlas

A left-sidebar Git panel for the DeepSeek Harness Web UI: pick a project and see where it actually stands — current branch, upstream sync, working-tree changes, the commit graph across all refs, and every branch with its ahead/behind markers.

Built for the case where an agent creates, commits, and pushes branches for you and the shape of the work gets hard to follow.

## What it shows

- **Project picker** over the Harness workspace registry, plus "Open folder…" for any directory and an optional configured list.
- **Status cards**: branch and HEAD, upstream ahead/behind, working-tree counts, remote.
- **Commit graph**: lanes computed from parent links across all refs, with branch, tag, and remote badges and relative times.
- **Branch list**: local and remote, filtered by name or subject, marking `current`, `local only`, `upstream gone`, `↑n`, and `↓n`.

## Read-only by design

The Host half runs only `rev-parse`, `status --porcelain=v2`, `for-each-ref`, `log`, and `config --get`. It never fetches, checks out, commits, or pushes. Optional Git locks are disabled.

The browser half talks to the Host over a prefix route that answers **loopback requests only**. It exposes repository metadata — branch names, commit subjects, author names and emails — not file contents, and it is unreachable from a remote browser session.

## Install

From a checkout, install the directory:

```bash
dsh plugin --profile <profile> add link:/absolute/path/to/git-atlas
```

or use Plugin Manager / the `plugin_manager` tool with the directory as the target. From git:

```
github:Davidlab/dsh-git-atlas#v0.1.0
```

Plain JavaScript, no dependencies, no build step.

## How projects are found

1. Every workspace in the Harness registry.
2. Directories added to `repositories` in the plugin row's config.
3. A folder picked with "Open folder…", remembered in that browser.

For each project the Host inspects the directory itself and one level below it, so a parent folder holding several repositories works, while nothing deeper is crawled. A project with no repository says so and picks one up as soon as one exists.

## Configuration

Row config keys, all optional:

| Key | Default | Meaning |
|---|---|---|
| `repositories` | `[]` | Extra absolute directories to scan. |
| `maxCommits` | `60` | Commit graph window. |
| `maxBranches` | `200` | Branch rows per repository. |
| `maxProjects` | `40` | Projects listed in the picker. |

There is no settings form yet; edit the row's `config` in the profile patch.

## Limits

- Local Web GUI and desktop only (loopback fence).
- Ahead/behind reflects the last `git fetch`, not live GitHub; the panel never fetches.
- One graph per repository, newest 60 commits across all refs by default.
- English and Chinese copy; other locales fall back to English.

## License

MIT
