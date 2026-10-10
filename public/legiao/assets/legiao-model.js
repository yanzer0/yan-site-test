(function legiaoModelFactory(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.LegiaoModel = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createLegiaoModel() {
  'use strict';

  // Port do SkillTree da Infuser (yangalasso-brain/scripts/dashboard/public/skilltree-model.js).
  // Os 7 andares agrupam as 13 categorias + os orquestradores; cada grupo vira um ramo do leque.
  const DEPARTMENTS = [
    {
      id: 'comando', label: 'COMANDO', subtitle: 'orquestradores · jobs ponta a ponta', color: '#C6FF34', glyph: 'comando',
      rootId: 'esquadrao',
      groups: [
        { label: 'Oferta e venda', ids: ['oferta_irresistivel', 'pagina_completa', 'maquina_vendas'] },
        { label: 'Aquisição', ids: ['campanha_trafego', 'conteudo_semana', 'lancamento_completo'] },
        { label: 'Funil e marca', ids: ['funil_completo', 'email_machine', 'marca_do_zero', 'diagnostico_negocio'] },
      ],
    },
    {
      id: 'copy', label: 'COPY', subtitle: 'copy · vídeo · persuasão', color: '#3BD0A0', glyph: 'copy',
      groups: [{ label: 'Copy', categoria: 'Copy & Resposta Direta' }, { label: 'Vídeo', categoria: 'Roteiros de Vídeo' }],
    },
    {
      id: 'aquisicao', label: 'AQUISIÇÃO', subtitle: 'tráfego · conteúdo · social', color: '#2FA084', glyph: 'aquisicao',
      groups: [{ label: 'Tráfego', categoria: 'Tráfego & Aquisição' }, { label: 'Conteúdo', categoria: 'Conteúdo & Social' }],
    },
    {
      id: 'vendas', label: 'VENDAS', subtitle: 'fechamento · funis · lançamentos', color: '#1F6F5F', glyph: 'vendas',
      groups: [{ label: 'Fechamento', categoria: 'Vendas & Fechamento' }, { label: 'Funis', categoria: 'Funis & Lançamentos' }],
    },
    {
      id: 'oferta', label: 'OFERTA', subtitle: 'oferta · preço · marca', color: '#C6FF34', glyph: 'oferta',
      groups: [{ label: 'Oferta', categoria: 'Ofertas & Monetização' }, { label: 'Marca', categoria: 'Branding & Posicionamento' }],
    },
    {
      id: 'estrategia', label: 'ESTRATÉGIA', subtitle: 'negócio · mentores · nichos', color: '#3BD0A0', glyph: 'estrategia',
      groups: [
        { label: 'Negócio', categoria: 'Estratégia & Negócio' },
        { label: 'Mentores', categoria: 'Clones de Especialistas' },
        { label: 'Nichos', categoria: 'Verticais & Nichos' },
      ],
    },
    {
      id: 'operacao', label: 'OPERAÇÃO', subtitle: 'retenção · e-mail · backoffice', color: '#2FA084', glyph: 'operacao',
      groups: [{ label: 'Retenção', categoria: 'CX, Retenção & Email' }, { label: 'Backoffice', categoria: 'Operação & Backoffice' }],
    },
  ];
  const TIER_ORDER = { Orquestrador: 0, Hero: 1, Core: 2, Specialist: 3 };
  const TIER_LABELS = { Orquestrador: 'Orquestrador', Hero: 'Hero', Core: 'Core', Specialist: 'Especialista' };

  function normalizeText(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase();
  }

  function displayText(value) {
    return String(value || '').replace(/[–—]/g, '-');
  }

  function itemText(item) {
    return normalizeText([item.id, item.title, item.descricao, item.categoria, item.pedido, item.especialista].join(' '));
  }

  function toItem(agent) {
    return {
      id: agent.id,
      key: `agent:${agent.id}`,
      title: displayText(agent.nome),
      descricao: displayText(agent.resumo),
      categoria: displayText(agent.categoria),
      tier: agent.tier,
      tierLabel: TIER_LABELS[agent.tier] || agent.tier,
      especialista: displayText(agent.especialista),
      pedido: displayText(agent.pedido),
      conexao: displayText(agent.conexao),
      orquestrador: agent.orquestrador === true,
      encadeia: Array.isArray(agent.encadeia) ? agent.encadeia : [],
      orquestradores: Array.isArray(agent.orquestradores) ? agent.orquestradores : [],
    };
  }

  function byTierThenTitle(left, right) {
    return (TIER_ORDER[left.tier] ?? 9) - (TIER_ORDER[right.tier] ?? 9) || left.title.localeCompare(right.title, 'pt-BR');
  }

  function buildTree(data) {
    const agents = (data && data.agents || []).map(toItem);
    const byId = new Map(agents.map(item => [item.id, item]));
    const placed = new Set();

    const departments = DEPARTMENTS.map(meta => {
      const department = { ...meta, root: null, items: [], branchGroups: [] };
      if (meta.rootId && byId.has(meta.rootId)) {
        department.root = { ...byId.get(meta.rootId), departmentId: meta.id, group: null };
        placed.add(meta.rootId);
      }
      department.branchGroups = meta.groups.map(group => {
        const members = group.ids
          ? group.ids.map(id => byId.get(id)).filter(Boolean)
          : agents.filter(item => item.categoria === group.categoria);
        const items = members
          .filter(item => !placed.has(item.id))
          .sort(byTierThenTitle)
          .map(item => ({ ...item, departmentId: meta.id, group: group.label }));
        items.forEach(item => placed.add(item.id));
        return { label: group.label, items };
      });
      department.items = [...(department.root ? [department.root] : []), ...department.branchGroups.flatMap(group => group.items)];
      return department;
    });

    const items = departments.flatMap(department => department.items);
    const unplaced = agents.filter(item => !placed.has(item.id)).map(item => item.id);
    return {
      departments,
      items,
      searchItems: items,
      unplaced,
      totals: {
        items: items.length,
        orquestradores: items.filter(item => item.orquestrador).length,
        especialistas: items.filter(item => !item.orquestrador).length,
      },
    };
  }

  function searchTree(tree, query, limit) {
    const needle = normalizeText(query).trim();
    if (!needle) return [];
    const words = needle.split(/\s+/).filter(Boolean);
    return (tree && tree.searchItems || [])
      .map(item => {
        const haystack = itemText(item);
        const title = normalizeText(item.title);
        if (!words.every(word => haystack.includes(word))) return null;
        let score = words.reduce((sum, word) => sum + (title.startsWith(word) ? 6 : title.includes(word) ? 3 : 1), 0);
        if (normalizeText(item.id) === needle) score += 10;
        return { item, score };
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title, 'pt-BR'))
      .slice(0, Number.isFinite(limit) ? limit : 20)
      .map(result => result.item);
  }

  function seatWheelTarget(currentAngle, index, count, seatAngle = 180) {
    const step = 360 / Math.max(1, count);
    let target = seatAngle - index * step;
    while (target - currentAngle > 180) target -= 360;
    while (target - currentAngle < -180) target += 360;
    return target;
  }

  function snapWheelAngle(angle, count, seatAngle = 180) {
    const step = 360 / Math.max(1, count);
    return seatAngle + Math.round((angle - seatAngle) / step) * step;
  }

  function polarPoint(radius, angle) {
    return { x: radius * Math.sin(angle), y: -radius * Math.cos(angle) };
  }

  // Mesma geometria do mini-leque do SkillTree: cada ramo empilha os agentes para fora.
  function layoutMiniDepartment(department) {
    const groups = (department && department.branchGroups || []).filter(group => group.items.length);
    const spanTotal = 140 * Math.PI / 180;
    const branchRadius = 80;
    const nodeRadius = 146;
    const nodeRadiusMax = nodeRadius + 3 * 56;
    const branches = [];
    const nodes = [];
    let cursor = -spanTotal / 2;

    groups.forEach((group, groupIndex) => {
      const span = spanTotal / groups.length;
      const angle = cursor + span / 2;
      const start = polarPoint(36, angle);
      const anchor = polarPoint(branchRadius, angle);
      branches.push({ group, groupIndex, angle, startX: start.x, startY: start.y, x: anchor.x, y: anchor.y });
      let previous = anchor;
      group.items.forEach((item, itemIndex) => {
        const zig = (itemIndex % 2 ? 1 : -1) * Math.min(span * .22, .075) * (itemIndex ? 1 : .45);
        const radius = nodeRadius + (group.items.length > 1 ? itemIndex * (nodeRadiusMax - nodeRadius) / (group.items.length - 1) : 0);
        const point = polarPoint(radius, angle + zig);
        nodes.push({ item, groupIndex, itemIndex, angle: angle + zig, radius, x: point.x, y: point.y, fromX: previous.x, fromY: previous.y });
        previous = point;
      });
      cursor += span;
    });

    return { branches, nodes, span: spanTotal, maxRadius: nodeRadiusMax };
  }

  // O leque do SkillTree empilha um agente por raio; com até 17 agentes por andar isso sairia da
  // tela. Aqui cada ramo enche anéis concêntricos pela capacidade do arco, ligando cada agente ao
  // vizinho mais próximo do anel de dentro. `compact` fecha o leque em quase um círculo para o celular.
  const FAN_VARIANTS = {
    wide: { spanDegrees: 182, branchRadius: 248, ringStart: 400, ringStep: 140, nodeGap: 100, groupPad: .05, labelGap: 100 },
    compact: { spanDegrees: 324, branchRadius: 150, ringStart: 290, ringStep: 120, nodeGap: 92, groupPad: .04, labelGap: 0 },
  };

  function layoutFanDepartment(department, variant = 'wide') {
    const config = FAN_VARIANTS[variant] || FAN_VARIANTS.wide;
    const groups = (department && department.branchGroups || []).filter(group => group.items.length);
    const spanTotal = config.spanDegrees * Math.PI / 180;
    const totalItems = groups.reduce((sum, group) => sum + group.items.length, 0);
    const branches = [];
    const nodes = [];
    let cursor = -spanTotal / 2;
    let maxRadius = config.ringStart;

    groups.forEach((group, groupIndex) => {
      const span = totalItems ? spanTotal * group.items.length / totalItems : 0;
      const angle = cursor + span / 2;
      const usable = Math.max(span - config.groupPad * 2, .01);
      const start = polarPoint(64, angle);
      const anchor = polarPoint(config.branchRadius, angle);
      let previousRing = [{ angle, x: anchor.x, y: anchor.y }];
      let placed = 0;
      let ring = 0;
      let radius = config.ringStart;

      while (placed < group.items.length) {
        radius = config.ringStart + ring * config.ringStep;
        const capacity = Math.max(1, Math.floor(usable * radius / config.nodeGap));
        const count = Math.min(capacity, group.items.length - placed);
        const currentRing = [];
        for (let slot = 0; slot < count; slot += 1) {
          const nodeAngle = count === 1 ? angle : angle - usable / 2 + usable * (slot + .5) / count;
          const point = polarPoint(radius, nodeAngle);
          const parent = previousRing.reduce((best, candidate) => Math.abs(candidate.angle - nodeAngle) < Math.abs(best.angle - nodeAngle) ? candidate : best);
          const node = {
            item: group.items[placed + slot], groupIndex, itemIndex: placed + slot,
            angle: nodeAngle, radius, x: point.x, y: point.y, fromX: parent.x, fromY: parent.y,
            delay: .32 + ring * .14 + slot * .03,
          };
          nodes.push(node);
          currentRing.push(node);
        }
        placed += count;
        previousRing = currentRing;
        ring += 1;
      }

      maxRadius = Math.max(maxRadius, radius);
      const label = polarPoint(radius + config.labelGap, angle);
      branches.push({ group, groupIndex, angle, span, startX: start.x, startY: start.y, x: anchor.x, y: anchor.y, labelX: label.x, labelY: label.y });
      cursor += span;
    });

    return { branches, nodes, span: spanTotal, maxRadius, showLabels: config.labelGap > 0 };
  }

  return {
    DEPARTMENTS,
    buildTree,
    normalizeText,
    searchTree,
    seatWheelTarget,
    snapWheelAngle,
    layoutMiniDepartment,
    layoutFanDepartment,
  };
});
