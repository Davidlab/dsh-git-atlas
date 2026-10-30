/**
 * Git Atlas — host half.
 *
 * Read-only Git observation for the Web GUI. It discovers the profile's
 * projects (workspace registry entries plus configured or user-picked folders),
 * locates the Git repository each one contains, and serves branch, upstream,
 * working-tree, and commit-graph data over a loopback-only prefix route.
 *
 * Nothing here writes to a repository: every command is a read (`rev-parse`,
 * `status`, `for-each-ref`, `log`, `config --get`), and optional Git locks are
 * disabled where Git allows it.
 *
 * @module @local/dsh-git-atlas
 */
import { execFile } from 'node:child_process'
import { existsSync, statSync } from 'node:fs'
import { readdir, realpath } from 'node:fs/promises'
import { basename, join } from 'node:path'

/** Prefix route the browser half reads from. */
export const API_PREFIX = '/git-atlas/api'

/** Field separator for `for-each-ref` / `log` records. */
const SEP = '\t'

/** One tab-separated branch record: name fields first, subject last. */
const BRANCH_FORMAT = [
  '%(refname)',
  '%(objectname)',
  '%(upstream)',
  '%(upstream:track)',
  '%(committerdate:unix)',
  '%(authorname)',
  '%(symref)',
  '%(contents:subject)',
].join(SEP)

/** One tab-separated commit record. */
const COMMIT_FORMAT = '%H%x09%P%x09%an%x09%ae%x09%ct%x09%D%x09%s'

/** Peer addresses the fence accepts. */
const LOOPBACK_ADDRESSES = ['127.0.0.1', '::1', '::ffff:127.0.0.1']

/** `Host` authorities the fence accepts. */
const LOOPBACK_HOSTNAMES = ['127.0.0.1', 'localhost', '::1']

/** Largest repository child scan per project. */
const MAX_CHILD_REPOS = 8

/** Plugin configuration is read from the Loader row and clamped in `normalizeSettings`. */

function clampNumber(value, fallback, min, max) {
  const number = typeof value === 'number' && Number.isFinite(value) ? Math.round(value) : fallback
  return Math.min(max, Math.max(min, number))
}

function normalizeSettings(config) {
  const source = config !== null && typeof config === 'object' ? config : {}
  const repositories = Array.isArray(source.repositories)
    ? source.repositories.filter(item => typeof item === 'string' && item.trim() !== '').map(item => item.trim())
    : []
  return {
    repositories: repositories.slice(0, 40),
    maxCommits: clampNumber(source.maxCommits, 60, 5, 200),
    maxBranches: clampNumber(source.maxBranches, 200, 10, 500),
    maxProjects: clampNumber(source.maxProjects, 40, 1, 100),
  }
}

/**
 * Mount the Host half.
 * @param {object} ctx - Host Cordis context.
 * @param {object} config - Row configuration.
 */
export function apply(ctx, config) {
  const settings = normalizeSettings(config)
  const handler = createHandler(ctx, settings)
  ctx.inject(['webServer'], (scope) => {
    scope.effect(
      () => scope.webServer.register({ kind: 'prefix', path: API_PREFIX, handler }),
      'git-atlas: loopback api',
    )
  })
}

/** Read an optional service without throwing for an absent one. */
function optionalService(ctx, name) {
  try {
    return ctx.get(name)
  } catch {
    return undefined
  }
}

/** Run one Git command inside `dir` (or without `-C` when `dir` is null). */
function runGit(dir, args, options) {
  const commandArgs = dir === null ? args : ['-C', dir, ...args]
  const timeout = options && options.timeout ? options.timeout : 10000
  const maxBuffer = options && options.maxBuffer ? options.maxBuffer : 8 * 1024 * 1024
  return new Promise((resolve, reject) => {
    execFile(
      'git',
      commandArgs,
      {
        timeout,
        maxBuffer,
        windowsHide: true,
        env: {
          ...process.env,
          GIT_OPTIONAL_LOCKS: '0',
          GIT_TERMINAL_PROMPT: '0',
          GIT_PAGER: 'cat',
          LC_ALL: 'C',
        },
      },
      (error, stdout, stderr) => {
        if (error) {
          const detail = String(stderr || '').trim() || (error && error.message) || 'git command failed'
          const failure = new Error(detail.slice(0, 500))
          failure.code = error && error.code
          reject(failure)
          return
        }
        resolve(String(stdout === undefined || stdout === null ? '' : stdout))
      },
    )
  })
}

let gitInfoCache = { at: 0, value: null }

/** Whether Git is available on this Host, and its version banner. */
async function gitInfo() {
  const now = Date.now()
  if (gitInfoCache.value !== null && now - gitInfoCache.at < 60000) return gitInfoCache.value
  let value
  try {
    const output = await runGit(null, ['--version'], { timeout: 5000 })
    value = { available: true, version: output.trim() || 'git', error: null }
  } catch (error) {
    value = {
      available: false,
      version: null,
      error: error instanceof Error ? error.message : String(error),
    }
  }
  gitInfoCache = { at: now, value }
  return value
}

/** The repository root containing `dir`, or null. */
async function gitRoot(dir) {
  try {
    const output = await runGit(dir, ['rev-parse', '--show-toplevel'], { timeout: 6000 })
    const root = output.trim()
    if (root === '') return null
    try {
      return await realpath(root)
    } catch {
      return root
    }
  } catch {
    return null
  }
}

/** Whether `dir` carries its own `.git` entry (directory or worktree file). */
function hasGitEntry(dir) {
  try {
    return existsSync(join(dir, '.git'))
  } catch {
    return false
  }
}

/** Direct child directories that are Git repository roots. */
async function childRepoRoots(dir) {
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return []
  }
  const roots = []
  let inspected = 0
  for (const entry of entries) {
    if (roots.length >= MAX_CHILD_REPOS || inspected >= 60) break
    if (!entry.isDirectory()) continue
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue
    inspected += 1
    const child = join(dir, entry.name)
    if (!hasGitEntry(child)) continue
    roots.push((await gitRoot(child)) || child)
  }
  return roots
}

/** Describe one project: its canonical path and the repositories it holds. */
async function scanProject(entry, settings) {
  let real
  try {
    real = await realpath(entry.path)
  } catch {
    return null
  }
  try {
    if (!statSync(real).isDirectory()) return null
  } catch {
    return null
  }
  const repos = []
  const root = (await gitRoot(real)) || (hasGitEntry(real) ? real : null)
  if (root !== null) {
    repos.push(root)
  } else {
    for (const child of await childRepoRoots(real)) repos.push(child)
  }
  const unique = [...new Set(repos)]
  return {
    name: basename(real),
    path: real,
    source: entry.source,
    repos: unique.map(path => ({ path, name: basename(path) })),
  }
}

/** Collect candidate project directories in picker order. */
function collectCandidates(ctx, settings, extras) {
  const candidates = []
  const seen = new Set()
  const add = (path, source) => {
    if (typeof path !== 'string') return
    const trimmed = path.trim()
    if (trimmed === '' || trimmed.includes('\0') || seen.has(trimmed)) return
    seen.add(trimmed)
    candidates.push({ path: trimmed, source })
  }
  for (const path of settings.repositories) add(path, 'config')
  const registry = optionalService(ctx, 'workspaceRegistry')
  if (registry !== undefined && typeof registry.list === 'function') {
    let list = []
    try {
      list = registry.list()
    } catch {
      list = []
    }
    for (const workspace of Array.isArray(list) ? list : []) {
      if (workspace !== null && typeof workspace === 'object') add(workspace.path, 'workspace')
    }
  }
  if (candidates.length === 0) {
    const workingDirectory = optionalService(ctx, 'workingDirectory')
    if (workingDirectory !== undefined && typeof workingDirectory.defaultDirectory === 'string') {
      add(workingDirectory.defaultDirectory, 'workspace')
    }
  }
  for (const extra of extras) add(extra, 'picked')
  return candidates
}

/** Discover projects, with a short cache so one panel refresh costs one scan. */
async function discoverProjects(ctx, settings, extras, fresh, cache) {
  const candidates = collectCandidates(ctx, settings, extras)
  const key = candidates.map(candidate => `${candidate.source}:${candidate.path}`).join('|')
  const now = Date.now()
  if (!fresh && cache.value !== null && cache.key === key && now - cache.at < 4000) return cache.value
  const projects = []
  for (const candidate of candidates.slice(0, settings.maxProjects)) {
    const project = await scanProject(candidate, settings)
    if (project !== null) projects.push(project)
  }
  const value = {
    projects,
    workspacePaths: candidates.filter(candidate => candidate.source === 'workspace').map(candidate => candidate.path),
  }
  cache.key = key
  cache.at = now
  cache.value = value
  return value
}

/** Parse `git status --porcelain=v2 --branch`. */
function parseStatus(text) {
  const status = {
    branch: null,
    detached: false,
    oid: null,
    upstream: null,
    ahead: 0,
    behind: 0,
    hasAb: false,
    staged: 0,
    unstaged: 0,
    untracked: 0,
    conflicted: 0,
    changed: 0,
  }
  for (const line of text.split('\n')) {
    if (line === '') continue
    if (line.startsWith('# branch.oid ')) {
      const value = line.slice(13).trim()
      status.oid = value !== '' && value !== '(initial)' ? value : null
      continue
    }
    if (line.startsWith('# branch.head ')) {
      const value = line.slice(14).trim()
      if (value === '(detached)') status.detached = true
      else status.branch = value
      continue
    }
    if (line.startsWith('# branch.upstream ')) {
      const value = line.slice(18).trim()
      status.upstream = value !== '' ? value : null
      continue
    }
    if (line.startsWith('# branch.ab ')) {
      status.hasAb = true
      const match = /\+(\d+)\s+-(\d+)/.exec(line)
      if (match !== null) {
        status.ahead = Number(match[1])
        status.behind = Number(match[2])
      }
      continue
    }
    const kind = line[0]
    if (kind === '?') {
      status.untracked += 1
      continue
    }
    if (kind === 'u') {
      status.conflicted += 1
      status.changed += 1
      continue
    }
    if (kind === '1' || kind === '2') {
      status.changed += 1
      if (line[2] !== '.') status.staged += 1
      if (line[3] !== '.') status.unstaged += 1
    }
  }
  return status
}

/** Parse `%(upstream:track)` into ahead/behind/gone. */
function parseTrack(value) {
  if (value === undefined || value === null || value.trim() === '') return { ahead: 0, behind: 0, gone: false }
  if (value.includes('gone')) return { ahead: 0, behind: 0, gone: true }
  const ahead = /ahead (\d+)/.exec(value)
  const behind = /behind (\d+)/.exec(value)
  return {
    ahead: ahead !== null ? Number(ahead[1]) : 0,
    behind: behind !== null ? Number(behind[1]) : 0,
    gone: false,
  }
}

/** Parse `for-each-ref` output into local and remote branch rows. */
function parseBranches(text, currentName, limit) {
  const local = []
  const remote = []
  let localCount = 0
  let remoteCount = 0
  for (const line of text.split('\n')) {
    if (line === '') continue
    const parts = line.split(SEP)
    if (parts.length < 8) continue
    const ref = parts[0]
    const sha = parts[1]
    const upstream = parts[2]
    const track = parts[3]
    const unix = parts[4]
    const author = parts[5]
    const symref = parts[6]
    const subject = parts.slice(7).join(SEP)
    if (ref.startsWith('refs/heads/')) {
      localCount += 1
      if (local.length >= limit) continue
      const name = ref.slice('refs/heads/'.length)
      const parsed = parseTrack(track)
      local.push({
        name,
        ref,
        sha,
        short: sha.slice(0, 7),
        current: name === currentName,
        upstream: upstream !== '' ? upstream : null,
        ahead: parsed.ahead,
        behind: parsed.behind,
        gone: parsed.gone,
        author,
        subject,
        time: Number(unix || 0) * 1000,
        remote: false,
      })
      continue
    }
    if (ref.startsWith('refs/remotes/')) {
      if (symref !== '') continue
      const name = ref.slice('refs/remotes/'.length)
      if (name === '' || name.endsWith('/HEAD')) continue
      remoteCount += 1
      if (remote.length >= limit) continue
      remote.push({
        name,
        ref,
        sha,
        short: sha.slice(0, 7),
        current: false,
        upstream: null,
        ahead: 0,
        behind: 0,
        gone: false,
        author,
        subject,
        time: Number(unix || 0) * 1000,
        remote: true,
        remoteName: name.split('/')[0],
      })
    }
  }
  return {
    localCount,
    remoteCount,
    truncated: localCount > limit || remoteCount > limit,
    items: [...local, ...remote],
  }
}

/** Read the commit window across all refs plus HEAD. */
async function readCommits(root, oid, limit) {
  const args = ['log', '--date-order', `--max-count=${limit}`, `--format=${COMMIT_FORMAT}`, '--all']
  if (oid !== null && oid !== undefined && oid !== '') args.push('HEAD')
  let text = ''
  try {
    text = await runGit(root, args, { timeout: 20000, maxBuffer: 16 * 1024 * 1024 })
  } catch {
    return []
  }
  const commits = []
  for (const line of text.split('\n')) {
    if (line === '') continue
    const parts = line.split(SEP)
    if (parts.length < 7) continue
    const sha = parts[0]
    commits.push({
      sha,
      short: sha.slice(0, 7),
      parents: parts[1] === '' ? [] : parts[1].split(' ').filter(Boolean),
      author: parts[2],
      email: parts[3],
      time: Number(parts[4] || 0) * 1000,
      refs: parts[5] === '' ? [] : parts[5].split(', ').map(item => item.trim()).filter(Boolean),
      subject: parts.slice(6).join(SEP),
    })
  }
  return commits
}

/** Build the full snapshot for one repository root. */
async function snapshotRepo(path, settings) {
  const root = await gitRoot(path)
  if (root === null) throw new Error('not a Git repository')
  const statusText = await runGit(root, ['status', '--porcelain=v2', '--branch', '--untracked-files=normal'], {
    timeout: 20000,
  })
  const status = parseStatus(statusText)
  let headSubject = null
  if (status.oid !== null) {
    headSubject = await runGit(root, ['log', '-1', '--format=%s'], { timeout: 6000 })
      .then(output => output.trim())
      .catch(() => null)
  }
  const branchText = await runGit(
    root,
    ['for-each-ref', '--sort=-committerdate', `--format=${BRANCH_FORMAT}`, 'refs/heads', 'refs/remotes'],
    { timeout: 20000 },
  )
  const branches = parseBranches(branchText, status.branch, settings.maxBranches)
  const commits = await readCommits(root, status.oid, settings.maxCommits)
  const remoteUrl = await runGit(root, ['config', '--get', 'remote.origin.url'], { timeout: 6000 })
    .then(output => output.trim() || null)
    .catch(() => null)
  return {
    repo: { path: root, name: basename(root), remoteUrl },
    branch: {
      name: status.branch,
      detached: status.detached,
      oid: status.oid,
      short: status.oid !== null ? status.oid.slice(0, 7) : null,
      upstream: status.upstream,
      ahead: status.ahead,
      behind: status.behind,
      gone: status.upstream !== null && !status.hasAb,
      headSubject,
    },
    workingTree: {
      staged: status.staged,
      unstaged: status.unstaged,
      untracked: status.untracked,
      conflicted: status.conflicted,
      changed: status.changed,
      total: status.changed + status.untracked,
    },
    branches,
    commits,
    window: { commits: settings.maxCommits, branches: settings.maxBranches },
  }
}

function respondJson(res, status, body) {
  const text = `${JSON.stringify(body)}\n`
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(text),
    'cache-control': 'no-store',
  })
  res.end(text)
}

function fail(res, status, error) {
  respondJson(res, status, { error })
}

function parseUrl(raw) {
  try {
    return new URL(raw === undefined ? '/' : raw, 'http://localhost')
  } catch {
    return null
  }
}

function normalizePath(pathname) {
  return pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname
}

function hostnameOf(host) {
  const authority = host.trim().toLowerCase()
  if (authority.startsWith('[')) {
    const end = authority.indexOf(']')
    return end === -1 ? '' : authority.slice(1, end)
  }
  const first = authority.indexOf(':')
  if (first === -1) return authority
  return first === authority.lastIndexOf(':') ? authority.slice(0, first) : authority
}

/** Whether a request originates on this machine's loopback interface. */
function isLoopbackRequest(req) {
  const address = req.socket && req.socket.remoteAddress
  if (address === undefined || !LOOPBACK_ADDRESSES.includes(address)) return false
  const host = req.headers.host
  if (host === undefined) return false
  return LOOPBACK_HOSTNAMES.includes(hostnameOf(host))
}

/** Build the route handler. */
function createHandler(ctx, settings) {
  const cache = { key: '', at: 0, value: null }
  return async function handle(req, res) {
    try {
      if (!isLoopbackRequest(req)) {
        fail(res, 403, 'this endpoint answers loopback requests only')
        return
      }
      if ((req.method || 'GET').toUpperCase() !== 'GET') {
        fail(res, 405, 'only GET is supported')
        return
      }
      const url = parseUrl(req.url)
      if (url === null) {
        fail(res, 400, 'malformed request URL')
        return
      }
      const pathname = normalizePath(url.pathname)
      const git = await gitInfo()

      if (pathname === `${API_PREFIX}/projects`) {
        const extras = url.searchParams.getAll('extra').filter(value => value !== '').slice(0, 4)
        const fresh = url.searchParams.get('fresh') === '1'
        const discovery = await discoverProjects(ctx, settings, extras, fresh, cache)
        respondJson(res, 200, {
          generatedAt: new Date().toISOString(),
          git,
          projects: discovery.projects,
          workspacePaths: discovery.workspacePaths,
        })
        return
      }

      if (pathname === `${API_PREFIX}/repo`) {
        const requested = url.searchParams.get('path')
        if (requested === null || requested.trim() === '' || requested.includes('\0') || requested.length > 4096) {
          fail(res, 400, 'a repository path is required')
          return
        }
        if (!git.available) {
          fail(res, 503, 'Git is not available on this machine')
          return
        }
        let snapshot
        try {
          snapshot = await snapshotRepo(requested, settings)
        } catch (error) {
          fail(res, 404, error instanceof Error ? error.message : String(error))
          return
        }
        respondJson(res, 200, {
          generatedAt: new Date().toISOString(),
          git,
          ...snapshot,
        })
        return
      }

      fail(res, 404, `unknown endpoint ${pathname}`)
    } catch (error) {
      fail(res, 500, error instanceof Error ? error.message : String(error))
    }
  }
}
