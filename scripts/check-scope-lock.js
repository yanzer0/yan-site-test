#!/usr/bin/env node
'use strict';

// Scope Lock guard.
//
// One executable source serves three positions:
// 1. CLI/report for a work order and its Git diff.
// 2. PreToolUse hook for proposed file writes.
// 3. Pre-commit for staged paths.
//
// The guard blocks only objective invariants. It cannot decide whether a work
// order is semantically correct or whether an abstraction is excessive.
// Learning: _learnings/risco-aumenta-profundidade-nao-largura.md.

const cp = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const ACTIVE_STATUS = /^(authorized|approved|active|in[-_ ]?(progress|build)|ready[-_ ]?for[-_ ]?build)/i;
const ARCHITECTURE_KEYS = [
  'production_files',
  'runtime_dependencies',
  'public_contracts',
  'persistence_surfaces',
  'background_jobs',
];

function normalizePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}

function unquote(value) {
  const text = String(value || '').trim();
  if (text.length >= 2 && ((text[0] === '"' && text.at(-1) === '"')
    || (text[0] === "'" && text.at(-1) === "'"))) {
    return text.slice(1, -1);
  }
  return text;
}

function parseInlineList(value) {
  const text = String(value || '').trim();
  if (text === '[]') return [];
  if (!text.startsWith('[') || !text.endsWith(']')) {
    throw new Error('listas do scope_lock devem usar [a, b] ou itens com "- "');
  }
  const inner = text.slice(1, -1).trim();
  if (!inner) return [];
  return inner.split(',').map((item) => unquote(item)).filter(Boolean);
}

function parseFrontmatter(raw) {
  const match = String(raw || '').match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) return { text: '', fields: {} };
  const fields = {};
  for (const line of match[1].split(/\r?\n/)) {
    const field = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (field) fields[field[1]] = unquote(field[2]);
  }
  return { text: match[1], fields };
}

function parseScopeLock(raw) {
  const frontmatter = parseFrontmatter(raw);
  if (!frontmatter.text) return { lock: null, errors: ['work order sem frontmatter YAML'] };
  const lines = frontmatter.text.split(/\r?\n/);
  const start = lines.findIndex((line) => /^scope_lock:\s*$/.test(line));
  if (start < 0) return { lock: null, errors: [] };

  const lock = { architecture_delta: {} };
  const errors = [];
  let listTarget = null;
  let architectureListTarget = null;

  for (let index = start + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line.trim()) continue;
    if (!line.startsWith(' ')) break;

    let match = line.match(/^  ([a-z_]+):\s*(.*)$/);
    if (match) {
      const [, key, rawValue] = match;
      architectureListTarget = null;
      if (key === 'architecture_delta') {
        if (rawValue.trim()) errors.push('architecture_delta deve ser um mapa');
        listTarget = 'architecture_delta';
        continue;
      }
      if (rawValue.trim().startsWith('[')) {
        try { lock[key] = parseInlineList(rawValue); } catch (error) { errors.push(error.message); }
        listTarget = null;
      } else if (rawValue.trim()) {
        lock[key] = unquote(rawValue);
        listTarget = null;
      } else {
        lock[key] = [];
        listTarget = key;
      }
      continue;
    }

    match = line.match(/^    ([a-z_]+):\s*(.*)$/);
    if (match && listTarget === 'architecture_delta') {
      const [, key, rawValue] = match;
      if (rawValue.trim().startsWith('[')) {
        try { lock.architecture_delta[key] = parseInlineList(rawValue); } catch (error) { errors.push(error.message); }
        architectureListTarget = null;
      } else if (rawValue.trim()) {
        errors.push('architecture_delta.' + key + ' deve ser uma lista');
        architectureListTarget = null;
      } else {
        lock.architecture_delta[key] = [];
        architectureListTarget = key;
      }
      continue;
    }

    match = line.match(/^    -\s+(.+)$/);
    if (match && listTarget && listTarget !== 'architecture_delta') {
      lock[listTarget].push(unquote(match[1]));
      continue;
    }

    match = line.match(/^      -\s+(.+)$/);
    if (match && listTarget === 'architecture_delta' && architectureListTarget) {
      lock.architecture_delta[architectureListTarget].push(unquote(match[1]));
      continue;
    }

    errors.push('linha não suportada no scope_lock: ' + line.trim());
  }

  return { lock, errors };
}

function parseWorkOrder(file, raw) {
  const content = raw === undefined ? fs.readFileSync(file, 'utf8') : raw;
  const { fields } = parseFrontmatter(content);
  const parsed = parseScopeLock(content);
  return {
    file: path.resolve(file),
    id: fields.work_order || path.basename(file, path.extname(file)),
    status: fields.status || '',
    active: ACTIVE_STATUS.test(fields.status || ''),
    centralBranch: String(fields.central_branch || '').trim(),
    lock: parsed.lock,
    errors: parsed.errors,
  };
}

function listMarkdownFiles(directory, output = []) {
  let entries = [];
  try { entries = fs.readdirSync(directory, { withFileTypes: true }); } catch { return output; }
  for (const entry of entries) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) listMarkdownFiles(target, output);
    else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) output.push(target);
  }
  return output;
}

function discoverWorkOrders(repo, options = {}) {
  const directory = path.join(repo, '.planning', 'work-orders');
  if (options.staged) {
    const listed = git(repo, ['ls-files', '--cached', '--', '.planning/work-orders']).stdout;
    return String(listed || '')
      .split(/\r?\n/)
      .map((file) => normalizePath(file))
      .filter((file) => file.toLowerCase().endsWith('.md'))
      .map((relative) => {
        const content = git(repo, ['show', ':' + relative]).stdout;
        return parseWorkOrder(path.join(repo, relative), content);
      });
  }
  return listMarkdownFiles(directory).map((file) => parseWorkOrder(file));
}

function globToRegExp(glob) {
  const source = normalizePath(glob);
  let output = '^';
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (char === '*') {
      if (source[index + 1] === '*') {
        const slashAfter = source[index + 2] === '/';
        output += slashAfter ? '(?:.*/)?' : '.*';
        index += slashAfter ? 2 : 1;
      } else {
        output += '[^/]*';
      }
    } else if (char === '?') {
      output += '[^/]';
    } else {
      output += char.replace(/[\\^$+?.()|[\]{}]/g, '\\$&');
    }
  }
  return new RegExp(output + '$', 'i');
}

function matchesAny(file, globs) {
  const target = normalizePath(file);
  return (Array.isArray(globs) ? globs : []).some((glob) => globToRegExp(glob).test(target));
}

function isRepositoryWideGlob(glob) {
  const segments = normalizePath(String(glob).trim()).split('/').filter(Boolean);
  return segments.length > 0 && segments.every((segment) => segment === '*' || segment === '**');
}

function git(repo, args, allowFailure = false) {
  const result = cp.spawnSync('git', ['-C', repo, '-c', 'core.quotepath=false', ...args], {
    encoding: 'utf8',
    windowsHide: true,
  });
  if (result.status !== 0 && !allowFailure) {
    throw new Error((result.stderr || result.stdout || 'git falhou').trim());
  }
  return result;
}

// Branch atual do checkout (vazio em HEAD destacado, ex.: no meio de um rebase). Uma work order
// que declara `central_branch` só conta como ATIVA na própria branch: em 07/09/2026 uma frente
// deixou a WO dela ativa no master e toda branch rebaseada passou a ter duas ativas (SL002), o que
// bloqueava até commit planning-only. WO sem `central_branch` mantém o comportamento antigo
// (conta em qualquer branch). Learning: scope-lock-wo-nova-so-com-zero-ativa-rito-em-dois-commits.
function currentBranch(repo, options = {}) {
  if (options.branch !== undefined) return String(options.branch || '').trim();
  const result = git(repo, ['symbolic-ref', '--short', '-q', 'HEAD'], true);
  return result.status === 0 ? String(result.stdout || '').trim() : '';
}

function parseNameStatus(output) {
  const changes = [];
  for (const line of String(output || '').split(/\r?\n/)) {
    if (!line.trim()) continue;
    const columns = line.split('\t');
    const rawStatus = columns.shift() || '';
    const status = rawStatus[0] || 'M';
    if ((status === 'R' || status === 'C') && columns.length >= 2) {
      changes.push({ status: status === 'R' ? 'D' : 'C', file: normalizePath(columns[0]) });
      changes.push({ status: 'A', file: normalizePath(columns.at(-1)) });
      continue;
    }
    if (columns[0]) changes.push({ status, file: normalizePath(columns[0]) });
  }
  return changes;
}

function collectGitChanges(repo, options = {}) {
  const head = options.head || 'HEAD';
  const changes = [];
  if (options.staged) {
    changes.push(...parseNameStatus(git(repo, ['diff', '--cached', '--name-status', '--diff-filter=ACDMRTUXB']).stdout));
  } else {
    if (!options.baseCommit) throw new Error('base_commit ausente');
    const ancestor = git(repo, ['merge-base', '--is-ancestor', options.baseCommit, head], true);
    if (ancestor.status !== 0) throw new Error('base_commit não é ancestral de ' + head);
    changes.push(...parseNameStatus(git(repo, ['diff', '--name-status', '--diff-filter=ACDMRTUXB', options.baseCommit + '..' + head]).stdout));
    if (head === 'HEAD' && options.includeWorktree !== false) {
      changes.push(...parseNameStatus(git(repo, ['diff', '--name-status', '--diff-filter=ACDMRTUXB']).stdout));
      changes.push(...parseNameStatus(git(repo, ['diff', '--cached', '--name-status', '--diff-filter=ACDMRTUXB']).stdout));
      const untracked = git(repo, ['ls-files', '--others', '--exclude-standard']).stdout;
      for (const file of String(untracked || '').split(/\r?\n/).filter(Boolean)) {
        changes.push({ status: 'A', file: normalizePath(file) });
      }
    }
  }

  const deduplicated = new Map();
  for (const change of changes) {
    const previous = deduplicated.get(change.file);
    if (!previous || change.status === 'A') deduplicated.set(change.file, change);
  }
  return [...deduplicated.values()].sort((a, b) => a.file.localeCompare(b.file));
}

function validateLockSchema(lock) {
  const blockers = [];
  const warnings = [];
  if (!lock) return { blockers: ['SL003 scope_lock ausente na única work order ativa'], warnings };
  if (String(lock.version || '') !== '1') blockers.push('SL004 scope_lock.version deve ser 1');
  if (!/^[0-9a-f]{7,40}$/i.test(String(lock.base_commit || ''))) {
    blockers.push('SL005 scope_lock.base_commit deve ser um commit Git explícito');
  }
  if (!Array.isArray(lock.allowed_write_globs) || lock.allowed_write_globs.length === 0) {
    blockers.push('SL006 allowed_write_globs deve declarar ao menos um caminho');
  }
  if ((lock.allowed_write_globs || []).some(isRepositoryWideGlob)) {
    blockers.push('SL007 allowed_write_globs não pode liberar o repositório inteiro');
  }
  for (const key of ARCHITECTURE_KEYS) {
    if (!Array.isArray(lock.architecture_delta && lock.architecture_delta[key])) {
      blockers.push('SL008 architecture_delta.' + key + ' deve ser lista; ausente não vira autorização');
    }
  }
  if (!Array.isArray(lock.acceptance_ids) || lock.acceptance_ids.length === 0) {
    blockers.push('SL009 acceptance_ids deve declarar critérios testáveis');
  }
  if (!Array.isArray(lock.stop_when) || lock.stop_when.length === 0) {
    blockers.push('SL010 stop_when deve declarar o ponto terminal');
  } else {
    const acceptance = new Set(lock.acceptance_ids || []);
    const unknown = lock.stop_when.filter((id) => !acceptance.has(id));
    if (unknown.length) blockers.push('SL011 stop_when referencia AC inexistente: ' + unknown.join(', '));
  }
  if (!Array.isArray(lock.passed_acceptance_ids)) {
    blockers.push('SL018 passed_acceptance_ids deve ser uma lista persistida');
  } else {
    const acceptance = new Set(lock.acceptance_ids || []);
    const unknownPassed = lock.passed_acceptance_ids.filter((id) => !acceptance.has(id));
    if (unknownPassed.length) blockers.push('SL019 passed_acceptance_ids contém AC inexistente: ' + unknownPassed.join(', '));
    const repeatedPassed = lock.passed_acceptance_ids.filter((id, index, all) => all.indexOf(id) !== index);
    if (repeatedPassed.length) blockers.push('SL012 passed_acceptance_ids duplicados: ' + [...new Set(repeatedPassed)].join(', '));
  }
  const duplicates = (lock.acceptance_ids || []).filter((id, index, all) => all.indexOf(id) !== index);
  if (duplicates.length) blockers.push('SL012 acceptance_ids duplicados: ' + [...new Set(duplicates)].join(', '));
  if ((lock.allowed_write_globs || []).some((glob) => /^[^/]+\/\*\*$/.test(glob))) {
    warnings.push('SLW01 glob amplo de diretório exige revisão semântica humana');
  }
  return { blockers, warnings };
}

function evaluateChanges(lock, changes) {
  const schema = validateLockSchema(lock);
  const blockers = [...schema.blockers];
  const warnings = [...schema.warnings];
  if (!lock || schema.blockers.length) return { blockers, warnings, stopRequired: false };

  for (const change of changes) {
    if (!matchesAny(change.file, lock.allowed_write_globs)) {
      blockers.push('SL020 caminho fora do lock: ' + change.file);
    }
  }

  const passed = new Set(lock.passed_acceptance_ids || []);
  const stopRequired = lock.stop_when.every((id) => passed.has(id));
  return { blockers: [...new Set(blockers)], warnings: [...new Set(warnings)], stopRequired };
}

function evaluateRepository(options) {
  const repo = path.resolve(options.repo || process.cwd());
  const workOrderDirectory = path.join(repo, '.planning', 'work-orders');
  const explicitWorkOrder = options.workOrder && path.resolve(options.workOrder);
  const workOrders = explicitWorkOrder
    ? [options.staged
      ? parseWorkOrder(explicitWorkOrder, git(repo, [
        'show', ':' + normalizePath(path.relative(repo, explicitWorkOrder)),
      ]).stdout)
      : parseWorkOrder(explicitWorkOrder)]
    : discoverWorkOrders(repo, { staged: Boolean(options.staged) });
  const branch = currentBranch(repo, options);
  const foreign = workOrders.filter((workOrder) => workOrder.active
    && workOrder.centralBranch && branch && workOrder.centralBranch !== branch);
  const active = workOrders.filter((workOrder) => workOrder.active && !foreign.includes(workOrder));
  const blockers = [];
  const warnings = foreign.map((workOrder) => 'SLW03 work order ativa de outra branch ignorada aqui ('
    + workOrder.centralBranch + ' vs ' + branch + '): ' + workOrder.id);

  if (active.length === 0) {
    const optedIn = Boolean(options.workOrder) || fs.existsSync(workOrderDirectory) || workOrders.length > 0;
    let changes = [];
    if (options.proposedPaths) {
      changes = options.proposedPaths.map((file) => ({
        status: options.proposedStatus || 'M',
        file: normalizePath(file),
      }));
    } else if (options.staged && optedIn) {
      changes = collectGitChanges(repo, { staged: true });
    }
    const onlyWorkOrderRecovery = changes.length > 0
      && changes.every((change) => change.file.startsWith('.planning/work-orders/'));
    const deletesLastLock = workOrders.length === 0
      && changes.some((change) => change.status === 'D' && change.file.startsWith('.planning/work-orders/'));
    if (optedIn && changes.length > 0 && (!onlyWorkOrderRecovery || deletesLastLock)) {
      blockers.push(deletesLastLock
        ? 'SL014 não é permitido apagar a última work order do repositório'
        : 'SL013 nenhuma work order ativa para a escrita proposta');
    } else if (optedIn && !onlyWorkOrderRecovery) {
      warnings.push('SLW02 repositório com Scope Lock sem work order ativa');
    }
    return {
      repo, branch, workOrders, active, lock: null, changes, blockers, warnings,
      notRequired: !optedIn, stopRequired: false, recoveryRequired: optedIn,
    };
  }
  if (active.length > 1) {
    blockers.push('SL002 mais de uma work order ativa: ' + active.map((workOrder) => workOrder.id).join(', '));
    return {
      repo, branch, workOrders, active, lock: null, changes: [], blockers, warnings,
      notRequired: false, stopRequired: false, recoveryRequired: true,
    };
  }

  const workOrder = active[0];
  blockers.push(...workOrder.errors.map((error) => 'SL001 ' + error));
  const schema = validateLockSchema(workOrder.lock);
  blockers.push(...schema.blockers);
  warnings.push(...schema.warnings);
  let changes = [];
  if (workOrder.lock && schema.blockers.length === 0) {
    const workOrderRelative = normalizePath(path.relative(repo, workOrder.file));
    if (!matchesAny(workOrderRelative, workOrder.lock.allowed_write_globs)) {
      blockers.push('SL017 a work order ativa deve incluir o próprio path em allowed_write_globs: ' + workOrderRelative);
    }
    const recoveryRequired = blockers.length > 0;
    changes = options.proposedPaths
      ? options.proposedPaths.map((file) => ({ status: options.proposedStatus || 'M', file: normalizePath(file) }))
      : collectGitChanges(repo, {
        baseCommit: workOrder.lock.base_commit,
        head: options.head || 'HEAD',
        staged: Boolean(options.staged),
        includeWorktree: options.includeWorktree,
      });
    const evaluated = evaluateChanges(workOrder.lock, changes);
    blockers.push(...evaluated.blockers);
    warnings.push(...evaluated.warnings);
    const mutationBoundary = Boolean(options.proposedPaths || options.staged);
    if (evaluated.stopRequired && mutationBoundary
      && changes.some((change) => change.file !== workOrderRelative)) {
      blockers.push('SL015 stop_when satisfeito; somente o closeout da work order ativa é permitido');
    }
    return {
      repo, branch, workOrders, active, lock: workOrder.lock, changes,
      blockers: [...new Set(blockers)], warnings: [...new Set(warnings)],
      notRequired: false, stopRequired: evaluated.stopRequired, recoveryRequired,
    };
  }

  return {
    repo, branch, workOrders, active, lock: workOrder.lock, changes,
    blockers: [...new Set(blockers)], warnings: [...new Set(warnings)],
    notRequired: false, stopRequired: false, recoveryRequired: true,
  };
}

function parseArgs(argv) {
  const options = { mode: process.env.SCOPE_LOCK_MODE || 'report' };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--repo') options.repo = argv[++index];
    else if (arg === '--work-order') options.workOrder = argv[++index];
    else if (arg === '--head') options.head = argv[++index];
    else if (arg === '--mode') options.mode = argv[++index];
    else if (arg === '--staged') options.staged = true;
    else if (arg === '--branch') options.branch = argv[++index];
    else if (arg === '--no-worktree') options.includeWorktree = false;
    else if (arg === '--json') options.json = true;
    else if (arg === '--hook') options.hook = true; // declarado pelo chamador de hook (settings.json); o payload vem do stdin
    else throw new Error('argumento desconhecido: ' + arg);
  }
  if (!['report', 'enforce'].includes(options.mode)) throw new Error('--mode deve ser report ou enforce');
  return options;
}

function extractToolPaths(payload) {
  const input = payload && payload.tool_input || {};
  const direct = input.file_path || input.notebook_path || input.path;
  const paths = direct ? [direct] : [];
  const patch = String(input.patch || input.input || input.code || input.source || '');
  const pattern = /^\*\*\* (?:Update|Add|Delete) File:\s*(.+)$/gm;
  let match;
  while ((match = pattern.exec(patch))) paths.push(match[1].trim());
  return [...new Set(paths.filter(Boolean))];
}

function findGitRoot(candidate, cwd) {
  let absolute = path.resolve(cwd || process.cwd(), candidate);
  try {
    while (!fs.existsSync(absolute)) {
      const parent = path.dirname(absolute);
      if (parent === absolute) return null;
      absolute = parent;
    }
    if (!fs.statSync(absolute).isDirectory()) absolute = path.dirname(absolute);
  } catch {
    return null;
  }
  const result = git(absolute, ['rev-parse', '--show-toplevel'], true);
  return result.status === 0 ? result.stdout.trim() : null;
}

function hookOutput(decision, reason, context) {
  const hookSpecificOutput = { hookEventName: 'PreToolUse', permissionDecision: decision };
  if (reason) hookSpecificOutput.permissionDecisionReason = reason;
  if (context) hookSpecificOutput.additionalContext = context;
  process.stdout.write(JSON.stringify({ hookSpecificOutput }));
}

function runHook(payload, options) {
  const candidates = extractToolPaths(payload);
  const toolName = String(payload && (payload.tool_name || payload.tool) || '');
  const structuredWrite = /^(apply_patch|Edit|Write)$/i.test(toolName);
  if (candidates.length === 0) {
    if (structuredWrite) {
      const reason = '[Scope Lock] escrita estruturada sem path verificável (SL021)';
      if (options.mode === 'enforce') hookOutput('deny', reason, null);
      else hookOutput('allow', null, reason);
    }
    return 0;
  }
  const byRepo = new Map();
  for (const candidate of candidates) {
    const repo = findGitRoot(candidate, payload.cwd || process.cwd());
    if (!repo) continue;
    const relative = normalizePath(path.relative(repo, path.resolve(payload.cwd || process.cwd(), candidate)));
    if (!byRepo.has(repo)) byRepo.set(repo, []);
    byRepo.get(repo).push(relative);
  }

  const blockers = [];
  const warnings = [];
  for (const [repo, proposedPaths] of byRepo) {
    const result = evaluateRepository({ repo, proposedPaths });
    const recoveryOnly = proposedPaths.every((file) => file.startsWith('.planning/work-orders/'));
    const recoveryWrite = recoveryOnly && result.recoveryRequired;
    if (result.blockers.length && !recoveryWrite) {
      blockers.push(...result.blockers.map((item) => path.basename(repo) + ': ' + item));
    } else if (result.blockers.length) {
      warnings.push(path.basename(repo) + ': consolidação de work orders permitida para recuperar o lock');
    }
    warnings.push(...result.warnings.map((item) => path.basename(repo) + ': ' + item));
  }

  if (blockers.length && options.mode === 'enforce') {
    hookOutput('deny', '[Scope Lock] escrita bloqueada.\n' + blockers.join('\n'), null);
  } else if (blockers.length || warnings.length) {
    const label = blockers.length ? '[Scope Lock report-only] seria bloqueado:\n' : '[Scope Lock]\n';
    hookOutput('allow', null, label + [...blockers, ...warnings].join('\n'));
  }
  return 0;
}

function formatResult(result, mode) {
  const lines = [];
  if (result.notRequired) return '';
  lines.push('Scope Lock ' + (result.blockers.length ? 'FAIL' : 'PASS') + ' (' + mode + ')');
  lines.push('repo: ' + result.repo);
  lines.push('branch: ' + (result.branch || '(HEAD destacado)'));
  lines.push('work_orders_ativas: ' + result.active.map((item) => item.id).join(', '));
  lines.push('arquivos_avaliados: ' + result.changes.length);
  for (const blocker of result.blockers) lines.push('BLOCK ' + blocker);
  for (const warning of result.warnings) lines.push('WARN ' + warning);
  if (result.stopRequired) lines.push('STOP stop_when satisfeito: encerre a fatia, não amplie o build');
  return lines.join('\n');
}

function readHookPayloadIfPresent() {
  // Só lê stdin quando o chamador DECLARA que é hook (`--hook`). O guard antigo era
  // `!process.stdin.isTTY`, e isso é falso em três situações, não em uma: hook com payload (ler é
  // certo), stdin em /dev/null (ler devolve vazio) e stdin num pipe aberto que nunca fecha, que é
  // o caso de qualquer chamada encadeada num script ou tarefa de fundo. Nesse terceiro caso o
  // `readFileSync(0)` bloqueia PARA SEMPRE: em 07/09/2026 quatro processos ficaram até 8 horas
  // presos assim, sem consumir CPU e sem filho, cada um segurando uma tarefa viva.
  if (!process.argv.map(String).includes('--hook')) return null;
  if (process.stdin.isTTY) return null;
  let raw = '';
  try { raw = fs.readFileSync(0, 'utf8'); } catch { return null; }
  if (!raw.trim()) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed && parsed.hook_event_name === 'PreToolUse' ? parsed : null;
  } catch {
    return null;
  }
}

function main() {
  let options;
  try { options = parseArgs(process.argv.slice(2)); } catch (error) {
    process.stderr.write('Scope Lock: ' + error.message + '\n');
    process.exit(2);
  }

  const payload = readHookPayloadIfPresent();
  if (payload) {
    runHook(payload, options);
    return;
  }

  let result;
  try { result = evaluateRepository(options); } catch (error) {
    process.stderr.write('Scope Lock: ' + error.message + '\n');
    process.exit(2);
  }
  if (options.json) process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  else {
    const formatted = formatResult(result, options.mode);
    if (formatted) process.stdout.write(formatted + '\n');
  }
  if (result.blockers.length && options.mode === 'enforce') process.exit(2);
}

module.exports = {
  collectGitChanges,
  discoverWorkOrders,
  evaluateChanges,
  evaluateRepository,
  extractToolPaths,
  globToRegExp,
  isRepositoryWideGlob,
  matchesAny,
  parseScopeLock,
  parseWorkOrder,
  runHook,
  validateLockSchema,
};

if (require.main === module) main();
