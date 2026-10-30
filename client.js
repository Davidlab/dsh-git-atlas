/**
 * Git Atlas — browser half.
 *
 * Registers a global panel icon (`sidebar.panellist`) and its page (`main`) in
 * the Harness Web UI. All Git data comes from the package's Host half through
 * the loopback route registered by `index.js`; this module only renders.
 *
 * @module @local/dsh-git-atlas/client
 */
window.__ModuleLoader__.load({
  id: '@local/dsh-git-atlas',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    const API = '/git-atlas/api'
    const ROW_HEIGHT = 36
    const LANE_PITCH = 14
    const LANE_COLORS = ['#5b9cf8', '#e3a33f', '#58c48c', '#c07ae6', '#46c2d8', '#e07a86']
    const PANEL_ID = 'git-atlas'
    const STORE_PREFIX = 'git-atlas:'

    const EN = {
      'panel.label': 'Git',
      'title': 'Git status',
      'project.label': 'Project',
      'project.none': 'No project selected',
      'repo.label': 'Repository',
      'openFolder': 'Open folder…',
      'refresh': 'Refresh',
      'refreshing': 'Refreshing…',
      'retry': 'Try again',
      'loading': 'Reading projects…',
      'loadingRepo': 'Reading Git history…',
      'git.title': "Git isn't installed",
      'git.body': 'Your projects are listed, but their repositories cannot be read until Git is available on this machine.',
      'git.mac': 'macOS: xcode-select --install',
      'git.win': 'Windows: install Git for Windows',
      'git.linux': 'Linux: install the git package',
      'projects.empty': 'No projects yet',
      'projects.emptyBody': 'Projects come from your workspace list, so anything you open later appears here automatically.',
      'project.noRepo': 'Not a Git repository yet',
      'project.noRepoBody': 'This folder has no Git repository. It appears here as soon as one exists.',
      'error.title': "Couldn't reach the Git panel service",
      'error.repo': "Couldn't read this repository",
      'card.branch': 'Branch',
      'card.upstream': 'Upstream',
      'card.worktree': 'Working tree',
      'card.remote': 'Remote',
      'card.detached': 'detached',
      'card.noRemote': 'No remote',
      'card.noRemoteSub': 'origin is not configured',
      'sync.noUpstream': 'No upstream',
      'sync.localOnly': 'local only',
      'sync.gone': 'upstream gone',
      'sync.toPush': '{n} to push',
      'sync.toPull': '{n} to pull',
      'worktree.clean': 'Clean',
      'worktree.cleanSub': 'no changes',
      'worktree.changed': '{n} changed',
      'worktree.staged': '{n} staged',
      'worktree.unstaged': '{n} unstaged',
      'worktree.untracked': '{n} untracked',
      'worktree.conflicted': '{n} conflicted',
      'summary.inSync': 'On {branch}, in sync with {upstream}.',
      'summary.ahead': 'On {branch}, {n} commit(s) to push to {upstream}.',
      'summary.behind': 'On {branch}, {n} commit(s) to pull from {upstream}.',
      'summary.diverged': 'On {branch}, {ahead} to push and {behind} to pull against {upstream}.',
      'summary.noUpstream': 'On {branch}, with no upstream branch set.',
      'summary.gone': 'On {branch}, whose upstream {upstream} no longer exists.',
      'summary.detached': 'HEAD is detached at {sha}.',
      'summary.clean': 'Working tree is clean.',
      'summary.dirty': '{n} file(s) changed in the working tree.',
      'graph.title': 'Commit graph',
      'graph.hint': 'all refs · newest {n}',
      'graph.empty': 'No commits yet.',
      'branches.title': 'Branches',
      'branches.count': '{local} local · {remote} remote',
      'branches.filter': 'Filter branches…',
      'branches.empty': 'No branches match this filter.',
      'branches.current': 'current',
      'branches.remote': 'remote',
      'branches.localOnly': 'local only',
      'branches.gone': 'gone',
      'branches.ahead': '↑{n}',
      'branches.behind': '↓{n}',
      'commit.noSubject': '(no subject)',
      'refs.more': '+{n}',
      'files.title': 'Changed files',
      'files.count': '{n} file(s)',
      'files.truncated': 'first {shown} of {total}',
      'files.staged': 'staged',
      'files.unstaged': 'unstaged',
      'files.untracked': 'untracked',
      'files.conflicted': 'conflicted',
      'relative.now': 'just now',
      'relative.minutes': '{n}m ago',
      'relative.hours': '{n}h ago',
      'relative.days': '{n}d ago',
      'relative.months': '{n}mo ago',
      'relative.years': '{n}y ago',
      'footer.git': 'git {version} · read-only',
      'footer.noGit': 'git not found',
      'footer.readonly': 'Read-only Git metadata · nothing is fetched or changed',
    }

    const ZH = {
      'panel.label': 'Git',
      'title': 'Git 状态',
      'project.label': '项目',
      'project.none': '未选择项目',
      'repo.label': '仓库',
      'openFolder': '打开文件夹…',
      'refresh': '刷新',
      'refreshing': '刷新中…',
      'retry': '重试',
      'loading': '正在读取项目…',
      'loadingRepo': '正在读取 Git 历史…',
      'git.title': '未安装 Git',
      'git.body': '项目列表可用，但在本机安装 Git 之前无法读取仓库信息。',
      'git.mac': 'macOS：xcode-select --install',
      'git.win': 'Windows：安装 Git for Windows',
      'git.linux': 'Linux：安装 git 包',
      'projects.empty': '还没有项目',
      'projects.emptyBody': '项目来自工作区列表，之后打开的新项目会自动出现在这里。',
      'project.noRepo': '还不是 Git 仓库',
      'project.noRepoBody': '该文件夹中没有 Git 仓库；创建仓库后会自动出现在这里。',
      'error.title': '无法连接 Git 面板服务',
      'error.repo': '无法读取该仓库',
      'card.branch': '分支',
      'card.upstream': '上游',
      'card.worktree': '工作区',
      'card.remote': '远程',
      'card.detached': '分离 HEAD',
      'card.noRemote': '无远程',
      'card.noRemoteSub': '未配置 origin',
      'sync.noUpstream': '无上游',
      'sync.localOnly': '仅本地',
      'sync.gone': '上游已删除',
      'sync.toPush': '{n} 待推送',
      'sync.toPull': '{n} 待拉取',
      'worktree.clean': '干净',
      'worktree.cleanSub': '没有改动',
      'worktree.changed': '{n} 个改动',
      'worktree.staged': '{n} 已暂存',
      'worktree.unstaged': '{n} 未暂存',
      'worktree.untracked': '{n} 未跟踪',
      'worktree.conflicted': '{n} 冲突',
      'summary.inSync': '位于 {branch}，与 {upstream} 同步。',
      'summary.ahead': '位于 {branch}，比 {upstream} 多 {n} 个提交待推送。',
      'summary.behind': '位于 {branch}，比 {upstream} 少 {n} 个提交待拉取。',
      'summary.diverged': '位于 {branch}，相对 {upstream} 有 {ahead} 个待推送、{behind} 个待拉取。',
      'summary.noUpstream': '位于 {branch}，未设置上游分支。',
      'summary.gone': '位于 {branch}，其上游 {upstream} 已不存在。',
      'summary.detached': 'HEAD 处于分离状态，位于 {sha}。',
      'summary.clean': '工作区干净。',
      'summary.dirty': '工作区有 {n} 个文件改动。',
      'graph.title': '提交图谱',
      'graph.hint': '全部引用 · 最新 {n}',
      'graph.empty': '还没有提交。',
      'branches.title': '分支',
      'branches.count': '{local} 本地 · {remote} 远程',
      'branches.filter': '筛选分支…',
      'branches.empty': '没有匹配的分支。',
      'branches.current': '当前',
      'branches.remote': '远程',
      'branches.localOnly': '仅本地',
      'branches.gone': '已删除',
      'branches.ahead': '↑{n}',
      'branches.behind': '↓{n}',
      'commit.noSubject': '（无标题）',
      'refs.more': '+{n}',
      'files.title': '改动文件',
      'files.count': '{n} 个文件',
      'files.truncated': '显示前 {shown} 个，共 {total} 个',
      'files.staged': '已暂存',
      'files.unstaged': '未暂存',
      'files.untracked': '未跟踪',
      'files.conflicted': '冲突',
      'relative.now': '刚刚',
      'relative.minutes': '{n} 分钟前',
      'relative.hours': '{n} 小时前',
      'relative.days': '{n} 天前',
      'relative.months': '{n} 个月前',
      'relative.years': '{n} 年前',
      'footer.git': 'git {version} · 只读',
      'footer.noGit': '未找到 git',
      'footer.readonly': '只读取 Git 元数据 · 不会拉取或修改任何内容',
    }

    const CSS = `
.ga-page{display:flex;flex-direction:column;height:100%;min-height:0;overflow:hidden;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font-size:14px;line-height:1.6}
.ga-scroll{flex:1;min-height:0;overflow:auto;scrollbar-gutter:stable;--dsh-scrollbar-width:9px;--dsh-scrollbar-thumb-border:2px}
.ga-content{max-width:1040px;margin:0 auto;padding:0 clamp(20px,4vw,44px) 44px}
.ga-heading{display:flex;flex-wrap:wrap;align-items:flex-start;justify-content:space-between;gap:14px 16px;padding-top:28px;margin-bottom:18px}
[data-platform='darwin'] .ga-heading{padding-top:calc(28px + var(--dsw-frame-top-clearance,0px))}
.ga-headingMain{min-width:0;flex:1 1 320px}
.ga-title{margin:0;font-size:20px;line-height:28px;font-weight:500}
.ga-path{margin:4px 0 0;font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary);overflow-wrap:anywhere}
.ga-actions{display:flex;flex-wrap:wrap;align-items:center;gap:8px;flex:none}
.ga-field{position:relative;display:inline-flex;min-width:0}
.ga-field::after{content:'';position:absolute;right:13px;top:50%;width:5px;height:5px;border-right:1.4px solid var(--dsw-alias-label-tertiary);border-bottom:1.4px solid var(--dsw-alias-label-tertiary);transform:translateY(-70%) rotate(45deg);pointer-events:none}
.ga-select{box-sizing:border-box;height:32px;max-width:240px;padding:0 30px 0 12px;border:.5px solid var(--dsw-alias-border-l2);border-radius:16px;background:var(--dsw-alias-bg-layer-1);color:inherit;font:inherit;font-size:13px;line-height:20px;appearance:none;cursor:pointer;text-overflow:ellipsis}
.ga-select:hover{border-color:var(--dsw-alias-border-l1)}
.ga-select:disabled{opacity:.6;cursor:default}
.ga-button{display:inline-flex;align-items:center;gap:5px;height:32px;padding:0 13px;border:.5px solid var(--dsw-alias-border-l2);border-radius:16px;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;line-height:20px;white-space:nowrap;cursor:pointer}
.ga-button:hover{background:var(--dsw-alias-interactive-bg-hover)}
.ga-button:disabled{opacity:.6;cursor:default}
.ga-buttonPrimary{background:var(--dsw-alias-bg-layer-2);border-color:transparent}
.ga-buttonIcon{display:inline-block;font-size:13px;line-height:1}
.ga-button[aria-busy='true'] .ga-buttonIcon{animation:ga-spin .9s linear infinite}
@keyframes ga-spin{to{transform:rotate(360deg)}}
.ga-summary{margin:0 0 16px;padding:11px 14px;border-radius:12px;background:var(--dsw-specific-sidebar-fill);color:var(--dsw-alias-label-secondary);font-size:13px;line-height:21px;overflow-wrap:anywhere}
.ga-summaryWarn{box-shadow:inset 2px 0 0 var(--dsw-alias-state-warn-primary)}
.ga-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;margin-bottom:26px}
.ga-card{min-width:0;padding:11px 14px;border:.5px solid var(--dsw-alias-border-l1);border-radius:14px;background:var(--dsw-alias-bg-layer-1)}
.ga-cardLabel{margin:0 0 2px;font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary)}
.ga-cardValue{margin:0;font-size:14px;line-height:22px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ga-cardSub{margin:2px 0 0;font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ga-cardWarn .ga-cardValue{color:var(--dsw-alias-state-warn-primary)}
.ga-cardOk .ga-cardValue{color:var(--dsw-alias-state-success-primary)}
.ga-section{margin-bottom:26px}
.ga-sectionHead{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin-bottom:10px}
.ga-sectionHead h2{margin:0;font-size:14px;line-height:22px;font-weight:500}
.ga-hint{font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary);white-space:nowrap}
.ga-files{list-style:none;margin:0;padding:0;border:.5px solid var(--dsw-alias-border-l1);border-radius:14px;max-height:280px;overflow:auto;background:var(--dsw-alias-bg-base)}
.ga-file{display:flex;align-items:center;gap:10px;padding:6px 12px;border-bottom:.5px solid var(--dsw-alias-border-l1);font-size:12.5px;line-height:18px}
.ga-file:last-child{border-bottom:0}
.ga-fileCode{display:inline-flex;align-items:center;justify-content:center;flex:none;min-width:26px;height:18px;padding:0 5px;border-radius:5px;background:var(--dsw-alias-bg-layer-2);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:10.5px;line-height:18px;font-weight:500;color:var(--dsw-alias-label-secondary)}
.ga-fileOk{color:var(--dsw-alias-state-success-primary)}
.ga-fileWarn{color:var(--dsw-alias-state-warn-primary)}
.ga-fileBad{color:var(--dsw-alias-state-error-primary)}
.ga-fileMuted{color:var(--dsw-alias-label-tertiary)}
.ga-filePath{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ga-fileDir{color:var(--dsw-alias-label-caption)}
.ga-fileBase{color:var(--dsw-alias-label-primary)}
.ga-fileFlag{flex:none;color:var(--dsw-alias-label-caption);font-size:11px;line-height:16px;white-space:nowrap}
.ga-graph{border:.5px solid var(--dsw-alias-border-l1);border-radius:14px;overflow:hidden;background:var(--dsw-alias-bg-base)}
.ga-commit{display:flex;align-items:stretch;gap:10px;min-height:36px;padding:0 12px 0 8px;border-bottom:.5px solid var(--dsw-alias-border-l1)}
.ga-commit:last-child{border-bottom:0}
.ga-commit:hover{background:var(--dsw-alias-interactive-bg-hover)}
.ga-graphCell{flex:none;display:flex;align-items:stretch;justify-content:flex-start}
.ga-graphCell svg{display:block;overflow:visible}
.ga-commitBody{flex:1;min-width:0;overflow:hidden;padding:5px 0 6px}
.ga-subject{font-size:13px;line-height:19px;color:var(--dsw-alias-label-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ga-commitHead .ga-subject{font-weight:500}
.ga-commitMeta{display:flex;flex-wrap:nowrap;align-items:center;gap:6px;margin-top:1px;font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary);white-space:nowrap;overflow:hidden}
.ga-sha{flex:none;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:10.5px;padding:0 4px;border-radius:4px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary)}
.ga-metaSep{opacity:.55}
.ga-metaText{min-width:0;overflow:hidden;text-overflow:ellipsis}
.ga-chip{display:inline-flex;align-items:center;flex:none;max-width:220px;height:17px;padding:0 6px;border:.5px solid var(--dsw-alias-border-l2);border-radius:9px;font-size:10.5px;line-height:16px;color:var(--dsw-alias-label-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ga-chipHead{border-color:transparent;background:var(--dsw-alias-brand-primary);color:var(--dsw-alias-label-primary-foreground,#fff)}
.ga-chipLocal{color:var(--dsw-alias-brand-primary);border-color:color-mix(in srgb,var(--dsw-alias-brand-primary) 42%,transparent)}
.ga-chipTag{color:var(--dsw-alias-state-warn-primary);border-color:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 45%,transparent)}
.ga-chipMore{border-style:dashed;color:var(--dsw-alias-label-tertiary)}
.ga-filterRow{margin-bottom:10px}
.ga-input{box-sizing:border-box;width:100%;height:34px;padding:0 12px;border:.5px solid var(--dsw-alias-border-l3);border-radius:10px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;line-height:20px;outline:none}
.ga-input:hover{border-color:var(--dsw-alias-border-l2)}
.ga-input:focus{border-color:var(--dsw-alias-state-business-primary)}
.ga-branches{list-style:none;margin:0;padding:0;border:.5px solid var(--dsw-alias-border-l1);border-radius:14px;overflow:hidden}
.ga-branch{display:flex;flex-wrap:wrap;align-items:center;gap:6px 10px;padding:8px 12px;border-bottom:.5px solid var(--dsw-alias-border-l1);font-size:13px}
.ga-branch:last-child{border-bottom:0}
.ga-branchCurrent{background:var(--dsw-alias-interactive-bg-hover)}
.ga-branchName{display:flex;align-items:center;gap:7px;flex:1 1 170px;min-width:0;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ga-branchDot{flex:none;width:6px;height:6px;border-radius:50%;background:var(--dsw-alias-label-caption)}
.ga-branchCurrent .ga-branchDot{background:var(--dsw-alias-state-success-primary)}
.ga-branchChips{display:flex;flex-wrap:wrap;gap:4px;flex:none}
.ga-branchSubject{flex:2 1 200px;min-width:0;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ga-branchTime{flex:none;margin-left:auto;color:var(--dsw-alias-label-caption);font-size:11px;line-height:17px;white-space:nowrap}
.ga-empty{display:flex;flex-direction:column;align-items:center;padding:54px 18px;text-align:center;color:var(--dsw-alias-label-tertiary)}
.ga-emptyGlyph{color:var(--dsw-alias-label-caption)}
.ga-empty h2{margin:12px 0 6px;font-size:14px;line-height:22px;font-weight:500;color:var(--dsw-alias-label-secondary)}
.ga-empty p{margin:0;max-width:520px;font-size:13px;line-height:21px}
.ga-mono{margin-top:10px!important;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11.5px;color:var(--dsw-alias-label-caption);overflow-wrap:anywhere}
.ga-notice{display:flex;align-items:flex-start;gap:14px;margin:0 0 20px;padding:13px 15px;border:.5px solid var(--dsw-alias-border-l1);border-radius:14px;background:var(--dsw-alias-bg-layer-1)}
.ga-noticeError{border-color:color-mix(in srgb,var(--dsw-alias-state-error-primary) 42%,transparent)}
.ga-noticeBody{flex:1;min-width:0}
.ga-noticeBody h2{margin:0 0 4px;font-size:13px;line-height:20px;font-weight:500}
.ga-noticeBody p{margin:0;font-size:12.5px;line-height:20px;color:var(--dsw-alias-label-secondary);overflow-wrap:anywhere}
.ga-noticeBody ul{margin:8px 0 0;padding-left:18px;font-size:12px;line-height:20px;color:var(--dsw-alias-label-tertiary)}
.ga-loading{padding:20px 0 8px;color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:20px}
.ga-skeleton{display:flex;flex-direction:column;gap:8px;margin-top:14px}
.ga-skeletonRow{height:34px;border-radius:10px;background:linear-gradient(90deg,var(--dsw-alias-bg-layer-1),var(--dsw-alias-bg-layer-2),var(--dsw-alias-bg-layer-1));background-size:220% 100%;animation:ga-shimmer 1.6s ease-in-out infinite}
@keyframes ga-shimmer{0%{background-position:0 0}100%{background-position:-220% 0}}
.ga-quiet{margin:0;padding:14px 2px;color:var(--dsw-alias-label-tertiary);font-size:13px}
.ga-footer{display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px;margin-top:8px;padding-top:14px;border-top:.5px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-caption);font-size:11.5px;line-height:18px}
.ga-sr{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap;border:0}
.ga-page :focus-visible{outline:2px solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:2px}
.ga-input:focus-visible{outline:none}
@media (prefers-reduced-motion:reduce){.ga-skeletonRow,.ga-button[aria-busy='true'] .ga-buttonIcon{animation:none}}
@media (max-width:640px){.ga-branchSubject{flex-basis:100%;white-space:normal}.ga-branchTime{margin-left:0}}
`

    let TRANSLATOR = null
    let CLIENT_CTX = null

    function safeGet(ctx, name) {
      try {
        return ctx.get(name)
      } catch {
        return undefined
      }
    }

    function createTranslator(ctx) {
      const locale = ctx ? safeGet(ctx, 'locale') : undefined
      let bound = null
      const registerDictionary = (id, dict) => {
        try {
          const dispose = locale.register('gitAtlas', id, dict)
          if (typeof dispose === 'function' && ctx && typeof ctx.effect === 'function') {
            ctx.effect(() => dispose, 'git-atlas: locale ' + id)
          }
        } catch (error) {
          console.warn('[git-atlas] locale dictionary registration failed:', error)
        }
      }
      if (locale && typeof locale.register === 'function' && typeof locale.bind === 'function') {
        registerDictionary('en', EN)
        registerDictionary('zh', ZH)
        try {
          bound = locale.bind('gitAtlas')
        } catch {
          bound = null
        }
      }
      const activeId = () => {
        if (!locale || typeof locale.getSnapshot !== 'function') return 'en'
        try {
          const snapshot = locale.getSnapshot()
          if (snapshot === null || typeof snapshot !== 'object') return 'en'
          const candidate = snapshot.id !== undefined ? snapshot.id : snapshot.locale
          return typeof candidate === 'string' ? candidate : 'en'
        } catch {
          return 'en'
        }
      }
      return {
        locale,
        t(key, vars) {
          let template = null
          if (bound !== null) {
            try {
              const value = bound(key)
              if (typeof value === 'string' && value !== key) template = value
            } catch {
              template = null
            }
          }
          if (template === null) {
            const dict = activeId().toLowerCase().indexOf('zh') === 0 ? ZH : EN
            template = dict[key] !== undefined ? dict[key] : EN[key] !== undefined ? EN[key] : key
          }
          if (vars === undefined || vars === null) return template
          return template.replace(/\{(\w+)\}/g, (match, name) => (
            vars[name] === undefined ? match : String(vars[name])
          ))
        },
      }
    }

    function useLocaleVersion(translator) {
      const [, bump] = React.useState(0)
      React.useEffect(() => {
        const locale = translator && translator.locale
        if (!locale || typeof locale.subscribe !== 'function') return undefined
        return locale.subscribe(() => bump(value => value + 1))
      }, [translator])
      return undefined
    }

    function messageOf(error) {
      if (error instanceof Error) return error.message
      return String(error)
    }

    function readStored(key) {
      try {
        return window.localStorage.getItem(STORE_PREFIX + key)
      } catch {
        return null
      }
    }

    function writeStored(key, value) {
      try {
        if (value === null || value === undefined || value === '') window.localStorage.removeItem(STORE_PREFIX + key)
        else window.localStorage.setItem(STORE_PREFIX + key, String(value))
      } catch {
        // Private-mode storage failures are not worth surfacing.
      }
    }

    function shortenPath(path) {
      if (typeof path !== 'string') return ''
      const match = /^\/Users\/[^/]+/.exec(path)
      if (match !== null) return '~' + path.slice(match[0].length)
      return path
    }

    function relativeTime(time, t) {
      if (typeof time !== 'number' || !Number.isFinite(time) || time <= 0) return ''
      const delta = Date.now() - time
      const minutes = Math.floor(delta / 60000)
      if (minutes < 1) return t('relative.now')
      if (minutes < 60) return t('relative.minutes', { n: minutes })
      const hours = Math.floor(minutes / 60)
      if (hours < 24) return t('relative.hours', { n: hours })
      const days = Math.floor(hours / 24)
      if (days < 31) return t('relative.days', { n: days })
      const months = Math.floor(days / 30)
      if (months < 12) return t('relative.months', { n: months })
      return t('relative.years', { n: Math.floor(days / 365) })
    }

    function parseRemote(url) {
      if (typeof url !== 'string' || url === '') return null
      const cleaned = url.replace(/\.git$/i, '')
      if (/^[a-z][a-z0-9+.-]*:\/\//i.test(cleaned)) {
        try {
          const parsed = new URL(cleaned)
          return { host: parsed.hostname, path: parsed.pathname.replace(/^\/+/, '') }
        } catch {
          return null
        }
      }
      const scp = /^(?:[^@/]+@)?([^:/]+)[:/](.+)$/.exec(cleaned)
      if (scp !== null) return { host: scp[1], path: scp[2].replace(/^\/+/, '') }
      return null
    }

    function classifyRef(raw) {
      if (raw.indexOf('HEAD -> ') === 0) return { kind: 'head', label: raw.slice(8) }
      if (raw === 'HEAD') return { kind: 'head', label: 'HEAD' }
      if (raw.indexOf('tag: ') === 0) return { kind: 'tag', label: raw.slice(5) }
      if (/^[^/]+\//.test(raw)) return { kind: 'remote', label: raw }
      return { kind: 'local', label: raw }
    }

    /** Shorten a full ref name to the form people read. */
    function displayRef(ref) {
      if (typeof ref !== 'string') return ref
      if (ref.indexOf('refs/remotes/') === 0) return ref.slice('refs/remotes/'.length)
      if (ref.indexOf('refs/heads/') === 0) return ref.slice('refs/heads/'.length)
      return ref
    }

    /** Parent directory name, used to disambiguate identical project names. */
    function parentName(path) {
      if (typeof path !== 'string') return ''
      const parts = path.split('/').filter(Boolean)
      return parts.length >= 2 ? parts[parts.length - 2] : ''
    }

    /**
     * Assign a lane to every commit and record the lane each parent continues
     * in, so one row can draw both continuations and branch joins.
     */
    function layoutCommits(commits) {
      const rows = []
      let lanes = []
      let laneCount = 1
      for (let index = 0; index < commits.length; index += 1) {
        const commit = commits[index]
        let lane = lanes.indexOf(commit.sha)
        if (lane === -1) {
          lane = lanes.indexOf(null)
          if (lane === -1) lane = lanes.length
          lanes[lane] = commit.sha
        }
        const after = lanes.slice()
        after[lane] = null
        const parents = []
        for (const parentSha of commit.parents) {
          let parentLane = after.indexOf(parentSha)
          if (parentLane === -1) {
            parentLane = after.indexOf(null)
            if (parentLane === -1) parentLane = after.length
            after[parentLane] = parentSha
          }
          parents.push({ sha: parentSha, lane: parentLane })
        }
        while (after.length > 0 && after[after.length - 1] === null) after.pop()
        laneCount = Math.max(laneCount, lane + 1, after.length)
        for (const parent of parents) laneCount = Math.max(laneCount, parent.lane + 1)
        rows.push({
          commit,
          lane,
          parents,
          after,
          head: commit.refs.some(ref => ref === 'HEAD' || ref.indexOf('HEAD -> ') === 0),
        })
        lanes = after
      }
      return { rows, laneCount }
    }

    function laneColor(lane) {
      return LANE_COLORS[lane % LANE_COLORS.length]
    }

    function GitAtlasIcon(props) {
      const size = props && typeof props.size === 'number' ? props.size : 16
      return h(
        'svg',
        {
          width: size,
          height: size,
          viewBox: '0 0 16 16',
          fill: 'none',
          'aria-hidden': 'true',
          style: { display: 'block' },
        },
        h('path', { d: 'M4 5.3v5.4', stroke: 'currentColor', strokeWidth: 1.3, strokeLinecap: 'round' }),
        h('path', { d: 'M4 8h5.4', stroke: 'currentColor', strokeWidth: 1.3, strokeLinecap: 'round' }),
        h('circle', { cx: 4, cy: 3.4, r: 1.9, stroke: 'currentColor', strokeWidth: 1.3 }),
        h('circle', { cx: 4, cy: 12.6, r: 1.9, stroke: 'currentColor', strokeWidth: 1.3 }),
        h('circle', { cx: 11.6, cy: 8, r: 1.9, stroke: 'currentColor', strokeWidth: 1.3 }),
      )
    }

    function EmptyGlyph() {
      return h(
        'svg',
        { width: 34, height: 34, viewBox: '0 0 34 34', fill: 'none', 'aria-hidden': 'true' },
        h('path', { d: 'M9 8v18', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', opacity: 0.7 }),
        h('path', { d: 'M9 15h8', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', opacity: 0.7 }),
        h('circle', { cx: 9, cy: 6.5, r: 2.6, stroke: 'currentColor', strokeWidth: 1.6 }),
        h('circle', { cx: 9, cy: 27.5, r: 2.6, stroke: 'currentColor', strokeWidth: 1.6 }),
        h('circle', { cx: 22, cy: 15, r: 2.6, stroke: 'currentColor', strokeWidth: 1.6, opacity: 0.7 }),
      )
    }

    async function fetchJson(url, signal) {
      const response = await fetch(url, {
        signal,
        cache: 'no-store',
        headers: { accept: 'application/json' },
      })
      let body = null
      try {
        body = await response.json()
      } catch {
        body = null
      }
      if (!response.ok) {
        const message = body && typeof body.error === 'string' ? body.error : 'HTTP ' + response.status
        throw new Error(message)
      }
      if (body === null || typeof body !== 'object') throw new Error('the host returned an unexpected response')
      return body
    }

    function GitAtlasPanel() {
      const translator = TRANSLATOR || createTranslator(null)
      const t = translator.t
      useLocaleVersion(translator)

      const [projectVersion, setProjectVersion] = React.useState(0)
      const [tick, setTick] = React.useState(0)
      const [extraPath, setExtraPath] = React.useState(() => readStored('extra'))
      const [projectPath, setProjectPath] = React.useState(() => readStored('project'))
      const [repoPath, setRepoPath] = React.useState(() => readStored('repo'))
      const [projectsState, setProjectsState] = React.useState({
        status: 'loading',
        git: null,
        projects: [],
        workspacePaths: [],
        error: null,
      })
      const [snapshotState, setSnapshotState] = React.useState({ status: 'idle', data: null, error: null })
      const [filter, setFilter] = React.useState('')
      const [busy, setBusy] = React.useState(false)
      const busyTimer = React.useRef(0)
      const projectsRef = React.useRef([])

      const projects = projectsState.projects
      projectsRef.current = projects
      const project = projects.find(candidate => candidate.path === projectPath) || projects[0] || null
      const repos = project !== null ? project.repos : []
      const repo = repos.find(candidate => candidate.path === repoPath) || repos[0] || null
      const repoKey = repo !== null ? repo.path : ''

      React.useEffect(() => () => {
        if (busyTimer.current) window.clearTimeout(busyTimer.current)
      }, [])

      // Projects: workspace registry entries plus configured/picked folders.
      React.useEffect(() => {
        const controller = new AbortController()
        let cancelled = false
        if (projectsRef.current.length === 0) {
          setProjectsState(previous => ({ ...previous, status: 'loading', error: null }))
        }
        const query = new URLSearchParams()
        if (projectVersion > 0) query.set('fresh', '1')
        if (extraPath) query.append('extra', extraPath)
        const suffix = query.toString() === '' ? '' : '?' + query.toString()
        fetchJson(API + '/projects' + suffix, controller.signal)
          .then(body => {
            if (cancelled) return
            setProjectsState({
              status: 'ready',
              git: body.git !== undefined && body.git !== null ? body.git : null,
              projects: Array.isArray(body.projects) ? body.projects : [],
              workspacePaths: Array.isArray(body.workspacePaths) ? body.workspacePaths : [],
              error: null,
            })
          })
          .catch(error => {
            if (cancelled || (error && error.name === 'AbortError')) return
            setProjectsState(previous => ({
              ...previous,
              status: previous.projects.length > 0 ? 'ready' : 'error',
              error: messageOf(error),
            }))
          })
        return () => {
          cancelled = true
          controller.abort()
        }
      }, [projectVersion, extraPath])

      // Keep the selected project addressable as the list changes.
      React.useEffect(() => {
        if (projects.length === 0) return
        if (projects.some(candidate => candidate.path === projectPath)) return
        const next = projects[0].path
        setProjectPath(next)
        writeStored('project', next)
      }, [projects, projectPath])

      // Keep the selected repository addressable as the project changes.
      React.useEffect(() => {
        if (project === null) return
        const list = project.repos
        if (list.length === 0) {
          if (repoPath !== null) {
            setRepoPath(null)
            writeStored('repo', null)
          }
          return
        }
        if (list.some(candidate => candidate.path === repoPath)) return
        const next = list[0].path
        setRepoPath(next)
        writeStored('repo', next)
      }, [project, repoPath])

      // Repository snapshot.
      React.useEffect(() => {
        if (repoKey === '') {
          setSnapshotState({ status: 'idle', data: null, error: null })
          return undefined
        }
        const controller = new AbortController()
        let cancelled = false
        setSnapshotState(previous => {
          const same = previous.data !== null && previous.data.repo !== undefined && previous.data.repo.path === repoKey
          return {
            status: same ? 'refreshing' : 'loading',
            data: same ? previous.data : null,
            error: null,
          }
        })
        fetchJson(API + '/repo?path=' + encodeURIComponent(repoKey), controller.signal)
          .then(body => {
            if (cancelled) return
            setSnapshotState({ status: 'ready', data: body, error: null })
          })
          .catch(error => {
            if (cancelled || (error && error.name === 'AbortError')) return
            setSnapshotState(previous => ({
              status: previous.data !== null ? 'ready' : 'error',
              data: previous.data,
              error: messageOf(error),
            }))
          })
        return () => {
          cancelled = true
          controller.abort()
        }
      }, [repoKey, projectVersion, tick])

      // Ambient refresh: the working tree moves while the panel is open.
      React.useEffect(() => {
        const timer = window.setInterval(() => {
          if (document.visibilityState !== 'visible') return
          setTick(value => value + 1)
        }, 30000)
        return () => window.clearInterval(timer)
      }, [])

      const refresh = () => {
        if (busy) return
        setBusy(true)
        setProjectVersion(value => value + 1)
        setTick(value => value + 1)
        if (busyTimer.current) window.clearTimeout(busyTimer.current)
        busyTimer.current = window.setTimeout(() => {
          setBusy(false)
          busyTimer.current = 0
        }, 1200)
      }

      const picker = safeGet(CLIENT_CTX, 'uiWorkspace')
      const canPick = picker !== undefined && picker !== null && typeof picker.pickDirectory === 'function'

      const openFolder = () => {
        if (!canPick) return
        Promise.resolve(picker.pickDirectory())
          .then(path => {
            if (typeof path !== 'string' || path === '') return
            setExtraPath(path)
            writeStored('extra', path)
            setProjectPath(path)
            writeStored('project', path)
            setRepoPath(null)
            setProjectVersion(value => value + 1)
          })
          .catch(error => console.warn('[git-atlas] directory picker failed:', error))
      }

      const changeProject = event => {
        const next = event.target.value
        setProjectPath(next)
        writeStored('project', next)
        setRepoPath(null)
        writeStored('repo', null)
      }

      const changeRepo = event => {
        const next = event.target.value
        setRepoPath(next)
        writeStored('repo', next)
      }

      const selectField = (labelText, value, onChange, options, disabled) => h(
        'label',
        { className: 'ga-field' },
        h('span', { className: 'ga-sr' }, labelText),
        h(
          'select',
          {
            className: 'ga-select',
            value,
            onChange,
            disabled: disabled === true,
            'aria-label': labelText,
          },
          options,
        ),
      )

      const projectOptions = projects.length === 0
        ? [h('option', { key: 'none', value: '' }, t('project.none'))]
        : projects.map(candidate => h(
          'option',
          { key: candidate.path, value: candidate.path },
          projects.filter(other => other.name === candidate.name).length > 1
            ? candidate.name + ' — ' + parentName(candidate.path)
            : candidate.name,
        ))

      const repoOptions = repos.map(candidate => h('option', { key: candidate.path, value: candidate.path }, candidate.name))

      const notice = (title, message, showRetry, extra) => h(
        'div',
        { className: 'ga-notice ga-noticeError' },
        h(
          'div',
          { className: 'ga-noticeBody' },
          h('h2', null, title),
          message ? h('p', null, message) : null,
          extra !== undefined ? extra : null,
        ),
        showRetry === true
          ? h('button', { type: 'button', className: 'ga-button', onClick: refresh }, t('retry'))
          : null,
      )

      const loading = label => h(
        'div',
        { className: 'ga-loading' },
        label,
        h(
          'div',
          { className: 'ga-skeleton', 'aria-hidden': 'true' },
          [0, 1, 2, 3].map(index => h('div', { key: index, className: 'ga-skeletonRow' })),
        ),
      )

      const emptyState = (title, body, detail) => h(
        'div',
        { className: 'ga-empty' },
        h('div', { className: 'ga-emptyGlyph' }, h(EmptyGlyph)),
        h('h2', null, title),
        h('p', null, body),
        detail ? h('p', { className: 'ga-mono' }, detail) : null,
      )

      const git = projectsState.git

      const renderGitMissing = () => h(
        'div',
        { className: 'ga-notice ga-noticeError' },
        h(
          'div',
          { className: 'ga-noticeBody' },
          h('h2', null, t('git.title')),
          h('p', null, t('git.body')),
          h(
            'ul',
            null,
            h('li', null, t('git.mac')),
            h('li', null, t('git.win')),
            h('li', null, t('git.linux')),
          ),
          git && git.error ? h('p', { className: 'ga-mono' }, git.error) : null,
        ),
        h('button', { type: 'button', className: 'ga-button', onClick: refresh }, t('refresh')),
      )

      const renderNoProjects = () => emptyState(
        t('projects.empty'),
        t('projects.emptyBody'),
        projectsState.workspacePaths.length > 0 ? projectsState.workspacePaths.join('  ·  ') : null,
      )

      const renderNoRepo = () => emptyState(
        t('project.noRepo'),
        t('project.noRepoBody'),
        project !== null ? shortenPath(project.path) : null,
      )

      const summaryLine = data => {
        const branch = data.branch
        const upstream = displayRef(branch.upstream)
        const parts = []
        if (branch.detached) {
          parts.push(t('summary.detached', { sha: branch.short || '' }))
        } else if (branch.upstream === null) {
          parts.push(t('summary.noUpstream', { branch: branch.name || '' }))
        } else if (branch.gone) {
          parts.push(t('summary.gone', { branch: branch.name || '', upstream }))
        } else if (branch.ahead > 0 && branch.behind > 0) {
          parts.push(t('summary.diverged', {
            branch: branch.name || '',
            ahead: branch.ahead,
            behind: branch.behind,
            upstream,
          }))
        } else if (branch.ahead > 0) {
          parts.push(t('summary.ahead', { branch: branch.name || '', n: branch.ahead, upstream }))
        } else if (branch.behind > 0) {
          parts.push(t('summary.behind', { branch: branch.name || '', n: branch.behind, upstream }))
        } else {
          parts.push(t('summary.inSync', { branch: branch.name || '', upstream }))
        }
        const tree = data.workingTree
        parts.push(tree.total > 0 ? t('summary.dirty', { n: tree.total }) : t('summary.clean'))
        return parts.join(' ')
      }

      const card = (label, value, sub, tone) => h(
        'div',
        { className: 'ga-card' + (tone ? ' ' + tone : '') },
        h('p', { className: 'ga-cardLabel' }, label),
        h('p', { className: 'ga-cardValue', title: value }, value),
        sub ? h('p', { className: 'ga-cardSub', title: sub }, sub) : null,
      )

      const renderCards = data => {
        const branch = data.branch
        const tree = data.workingTree
        const remote = parseRemote(data.repo.remoteUrl)

        const branchValue = branch.detached ? t('card.detached') : (branch.name || t('card.detached'))
        const branchSub = branch.short ? 'HEAD · ' + branch.short : ''

        let upstreamValue
        let upstreamSub
        let upstreamTone = ''
        if (branch.upstream === null) {
          upstreamValue = t('sync.noUpstream')
          upstreamSub = t('sync.localOnly')
        } else if (branch.gone) {
          upstreamValue = t('sync.gone')
          upstreamSub = displayRef(branch.upstream)
          upstreamTone = 'ga-cardWarn'
        } else {
          upstreamValue = '↑ ' + branch.ahead + '   ↓ ' + branch.behind
          upstreamSub = displayRef(branch.upstream)
          if (branch.ahead > 0 || branch.behind > 0) upstreamTone = 'ga-cardWarn'
        }

        const treePieces = []
        if (tree.staged > 0) treePieces.push(t('worktree.staged', { n: tree.staged }))
        if (tree.unstaged > 0) treePieces.push(t('worktree.unstaged', { n: tree.unstaged }))
        if (tree.untracked > 0) treePieces.push(t('worktree.untracked', { n: tree.untracked }))
        if (tree.conflicted > 0) treePieces.push(t('worktree.conflicted', { n: tree.conflicted }))

        return h(
          'div',
          { className: 'ga-cards' },
          card(t('card.branch'), branchValue, branchSub, ''),
          card(t('card.upstream'), upstreamValue, upstreamSub, upstreamTone),
          card(
            t('card.worktree'),
            tree.total === 0 ? t('worktree.clean') : t('worktree.changed', { n: tree.total }),
            treePieces.length > 0 ? treePieces.join(' · ') : t('worktree.cleanSub'),
            tree.total === 0 ? 'ga-cardOk' : 'ga-cardWarn',
          ),
          card(
            t('card.remote'),
            remote !== null ? remote.host : t('card.noRemote'),
            remote !== null ? remote.path : t('card.noRemoteSub'),
            '',
          ),
        )
      }

      const renderRefChips = refs => {
        const classified = refs.map(classifyRef)
        const shown = classified.slice(0, 3)
        const chips = shown.map((ref, index) => h(
          'span',
          {
            key: 'ref' + index,
            className: 'ga-chip ' + (ref.kind === 'head' ? 'ga-chipHead' : ref.kind === 'tag' ? 'ga-chipTag' : 'ga-chipLocal'),
            title: ref.label,
          },
          ref.label,
        ))
        if (classified.length > shown.length) {
          chips.push(h('span', { key: 'more', className: 'ga-chip ga-chipMore' }, t('refs.more', { n: classified.length - shown.length })))
        }
        return chips
      }

      const renderFiles = data => {
        const tree = data.workingTree
        const files = Array.isArray(tree.files) ? tree.files : []
        if (files.length === 0) return null
        return h(
          'section',
          { className: 'ga-section' },
          h(
            'div',
            { className: 'ga-sectionHead' },
            h('h2', null, t('files.title')),
            h('span', { className: 'ga-hint' }, tree.filesTruncated
              ? t('files.truncated', { shown: files.length, total: tree.total })
              : t('files.count', { n: tree.total })),
          ),
          h(
            'ul',
            { className: 'ga-files' },
            files.map(file => {
              const path = file.path || ''
              const split = path.lastIndexOf('/')
              const dir = split === -1 ? '' : path.slice(0, split + 1)
              const base = split === -1 ? path : path.slice(split + 1)
              const code = typeof file.code === 'string' && file.code !== '' ? file.code : '·'
              const tone = code.indexOf('?') === 0 || code === '·'
                ? 'ga-fileMuted'
                : code.indexOf('A') !== -1
                  ? 'ga-fileOk'
                  : code.indexOf('D') !== -1 || code.indexOf('U') !== -1
                    ? 'ga-fileBad'
                    : 'ga-fileWarn'
              return h(
                'li',
                { key: (file.origPath || '') + ':' + path, className: 'ga-file' },
                h('span', { className: 'ga-fileCode ' + tone }, code),
                h(
                  'span',
                  { className: 'ga-filePath', title: file.origPath ? file.origPath + ' → ' + path : path },
                  dir !== '' ? h('span', { className: 'ga-fileDir' }, dir) : null,
                  h('span', { className: 'ga-fileBase' }, base),
                ),
                file.conflicted
                  ? h('span', { className: 'ga-fileFlag' }, t('files.conflicted'))
                  : file.untracked
                    ? h('span', { className: 'ga-fileFlag' }, t('files.untracked'))
                    : file.staged && file.unstaged
                      ? h('span', { className: 'ga-fileFlag' }, t('files.staged') + ' + ' + t('files.unstaged'))
                      : file.staged
                        ? h('span', { className: 'ga-fileFlag' }, t('files.staged'))
                        : null,
              )
            }),
          ),
        )
      }

      const renderGraph = data => {
        const layout = layoutCommits(data.commits)
        if (data.commits.length === 0) return h('p', { className: 'ga-quiet' }, t('graph.empty'))
        const pitch = layout.laneCount > 9 ? 10 : LANE_PITCH
        const width = 18 + layout.laneCount * pitch
        const x = lane => 9 + lane * pitch
        return h(
          'div',
          { className: 'ga-graph' },
          layout.rows.map(row => {
            const commit = row.commit
            const paths = []
            row.after.forEach((sha, lane) => {
              if (sha === null || sha === undefined) return
              paths.push(h('path', {
                key: 'v' + lane,
                d: 'M ' + x(lane) + ' 0 V ' + ROW_HEIGHT,
                stroke: laneColor(lane),
                strokeWidth: 1.4,
                fill: 'none',
                opacity: 0.5,
              }))
            })
            row.parents.forEach((parent, index) => {
              if (parent.lane === row.lane) return
              paths.push(h('path', {
                key: 'p' + index,
                d: 'M ' + x(row.lane) + ' ' + (ROW_HEIGHT / 2)
                  + ' C ' + x(row.lane) + ' ' + (ROW_HEIGHT / 2 + 7)
                  + ' ' + x(parent.lane) + ' ' + (ROW_HEIGHT - 7)
                  + ' ' + x(parent.lane) + ' ' + ROW_HEIGHT,
                stroke: laneColor(parent.lane),
                strokeWidth: 1.4,
                fill: 'none',
                opacity: 0.85,
              }))
            })
            paths.push(h('circle', {
              key: 'dot',
              cx: x(row.lane),
              cy: ROW_HEIGHT / 2,
              r: 3.4,
              fill: laneColor(row.lane),
            }))
            if (row.head) {
              paths.push(h('circle', {
                key: 'ring',
                cx: x(row.lane),
                cy: ROW_HEIGHT / 2,
                r: 6.4,
                fill: 'none',
                stroke: laneColor(row.lane),
                strokeWidth: 1.1,
                opacity: 0.45,
              }))
            }
            return h(
              'div',
              {
                key: commit.sha,
                className: 'ga-commit' + (row.head ? ' ga-commitHead' : ''),
                title: commit.sha + '\n' + (commit.subject || ''),
              },
              h(
                'div',
                { className: 'ga-graphCell', style: { width: width + 'px' } },
                h(
                  'svg',
                  { width: width, height: ROW_HEIGHT, viewBox: '0 0 ' + width + ' ' + ROW_HEIGHT, 'aria-hidden': 'true' },
                  paths,
                ),
              ),
              h(
                'div',
                { className: 'ga-commitBody' },
                h('div', { className: 'ga-subject' }, commit.subject || t('commit.noSubject')),
                h(
                  'div',
                  { className: 'ga-commitMeta' },
                  renderRefChips(commit.refs),
                  h('span', { className: 'ga-sha', title: commit.sha }, commit.short),
                  h('span', { className: 'ga-metaText', title: commit.author }, commit.author || '—'),
                  h('span', { className: 'ga-metaSep' }, '·'),
                  h('span', { className: 'ga-metaText' }, relativeTime(commit.time, t)),
                ),
              ),
            )
          }),
        )
      }

      const renderBranches = data => {
        const query = filter.trim().toLowerCase()
        const items = data.branches.items.filter(item => (
          query === '' || item.name.toLowerCase().indexOf(query) !== -1 || (item.subject || '').toLowerCase().indexOf(query) !== -1
        ))
        return h(
          'section',
          { className: 'ga-section' },
          h(
            'div',
            { className: 'ga-sectionHead' },
            h('h2', null, t('branches.title')),
            h('span', { className: 'ga-hint' }, t('branches.count', {
              local: data.branches.localCount,
              remote: data.branches.remoteCount,
            })),
          ),
          h(
            'div',
            { className: 'ga-filterRow' },
            h('input', {
              className: 'ga-input',
              type: 'search',
              value: filter,
              placeholder: t('branches.filter'),
              'aria-label': t('branches.filter'),
              onChange: event => setFilter(event.target.value),
            }),
          ),
          items.length === 0
            ? h('p', { className: 'ga-quiet' }, t('branches.empty'))
            : h(
              'ul',
              { className: 'ga-branches' },
              items.map(item => {
                const chips = []
                if (item.current) chips.push(h('span', { key: 'c', className: 'ga-chip ga-chipHead' }, t('branches.current')))
                if (item.remote) chips.push(h('span', { key: 'r', className: 'ga-chip' }, t('branches.remote')))
                if (!item.remote && item.upstream === null) {
                  chips.push(h('span', { key: 'l', className: 'ga-chip ga-chipLocal' }, t('branches.localOnly')))
                }
                if (item.gone) chips.push(h('span', { key: 'g', className: 'ga-chip ga-chipTag' }, t('branches.gone')))
                if (item.ahead > 0) chips.push(h('span', { key: 'a', className: 'ga-chip ga-chipTag' }, t('branches.ahead', { n: item.ahead })))
                if (item.behind > 0) chips.push(h('span', { key: 'b', className: 'ga-chip' }, t('branches.behind', { n: item.behind })))
                return h(
                  'li',
                  {
                    key: (item.remote ? 'r:' : 'l:') + item.name,
                    className: 'ga-branch' + (item.current ? ' ga-branchCurrent' : ''),
                  },
                  h(
                    'span',
                    { className: 'ga-branchName', title: item.name },
                    h('span', { className: 'ga-branchDot', 'aria-hidden': 'true' }),
                    item.name,
                  ),
                  h('span', { className: 'ga-branchChips' }, chips),
                  h('span', { className: 'ga-branchSubject', title: item.subject }, item.subject || '—'),
                  h('span', { className: 'ga-branchTime' }, relativeTime(item.time, t)),
                )
              }),
            ),
        )
      }

      const renderSnapshot = data => {
        const branch = data.branch
        const dirty = data.workingTree.total > 0 || branch.ahead > 0 || branch.behind > 0 || branch.detached
        const gitVersion = data.git && data.git.version ? data.git.version : ''
        const versionMatch = /version\s+(\S+)/.exec(gitVersion)
        return h(
          React.Fragment,
          null,
          snapshotState.error !== null
            ? h(
              'div',
              { className: 'ga-notice ga-noticeError' },
              h(
                'div',
                { className: 'ga-noticeBody' },
                h('h2', null, t('error.repo')),
                h('p', null, snapshotState.error),
              ),
              h('button', { type: 'button', className: 'ga-button', onClick: refresh }, t('retry')),
            )
            : null,
          h('p', { className: 'ga-summary' + (dirty ? ' ga-summaryWarn' : '') }, summaryLine(data)),
          renderCards(data),
          renderFiles(data),
          h(
            'section',
            { className: 'ga-section' },
            h(
              'div',
              { className: 'ga-sectionHead' },
              h('h2', null, t('graph.title')),
              h('span', { className: 'ga-hint' }, t('graph.hint', { n: data.commits.length })),
            ),
            renderGraph(data),
          ),
          renderBranches(data),
          h(
            'footer',
            { className: 'ga-footer' },
            h('span', null, data.git && data.git.available
              ? t('footer.git', { version: versionMatch !== null ? versionMatch[1] : gitVersion })
              : t('footer.noGit')),
            h('span', null, t('footer.readonly')),
          ),
        )
      }

      const renderBody = () => {
        if (projectsState.status === 'loading' && projects.length === 0) return loading(t('loading'))
        if (projectsState.status === 'error' && projects.length === 0) {
          return notice(t('error.title'), projectsState.error, true)
        }
        if (git !== null && git.available === false) return renderGitMissing()
        if (projects.length === 0) return renderNoProjects()
        if (project === null) return loading(t('loading'))
        if (repos.length === 0) return renderNoRepo()
        if (repo === null) return loading(t('loading'))
        if (snapshotState.data === null) {
          if (snapshotState.status === 'error') return notice(t('error.repo'), snapshotState.error, true)
          return loading(t('loadingRepo'))
        }
        return renderSnapshot(snapshotState.data)
      }

      return h(
        'div',
        { className: 'ga-page' },
        h('style', { key: 'ga-style' }, CSS),
        h(
          'div',
          { className: 'ga-scroll' },
          h(
            'div',
            { className: 'ga-content' },
            h(
              'header',
              { className: 'ga-heading' },
              h(
                'div',
                { className: 'ga-headingMain' },
                h('h1', { className: 'ga-title' }, t('title')),
                h(
                  'p',
                  { className: 'ga-path', title: project !== null ? project.path : '' },
                  project !== null ? shortenPath(project.path) : t('project.none'),
                ),
              ),
              h(
                'div',
                { className: 'ga-actions' },
                selectField(t('project.label'), project !== null ? project.path : '', changeProject, projectOptions, projects.length === 0),
                repos.length > 1
                  ? selectField(t('repo.label'), repo !== null ? repo.path : '', changeRepo, repoOptions, false)
                  : null,
                canPick ? h('button', { type: 'button', className: 'ga-button', onClick: openFolder }, t('openFolder')) : null,
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'ga-button ga-buttonPrimary',
                    onClick: refresh,
                    disabled: busy,
                    'aria-busy': busy ? 'true' : undefined,
                  },
                  h('span', { className: 'ga-buttonIcon', 'aria-hidden': 'true' }, '↻'),
                  busy ? t('refreshing') : t('refresh'),
                ),
              ),
            ),
            renderBody(),
          ),
        ),
      )
    }

    return {
      inject: ['slots'],
      apply(ctx) {
        CLIENT_CTX = ctx
        TRANSLATOR = createTranslator(ctx)
        ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
          name: 'sidebar.panellist',
          id: PANEL_ID,
          order: 20,
          label: () => TRANSLATOR.t('panel.label'),
        }, GitAtlasIcon))
        ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: PANEL_ID }, GitAtlasPanel))
      },
    }
  },
})
