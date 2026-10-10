(function legiaoBuilding() {
  'use strict';

  // Port do SkillTree da Infuser (yangalasso-brain/scripts/dashboard/public/skilltree.js): mesma
  // roda, mesmo mergulho no andar, mesmo leitor lateral. Troca o progresso local pelo "como chamar".
  const model = window.LegiaoModel;
  if (!model) return;

  const DATA_URL = '/legiao/assets/agents-v2.json';
  const WHEEL_SCROLL_GAIN = 0.1;
  const WHEEL_EASE = 0.11;
  const CAMERA_EASE = 0.13;
  const WHEEL_SNAP_DELAY = 300;
  const DIVE_FOCUS_DELAY = 520;
  const FAN_SETTLE_DELAY = 1250;
  const WHEEL_ROOT_RADIUS = 310;
  const WHEEL_LABEL_OFFSET = 470;
  const INITIAL_MAP_ANCHOR_X = .62;
  const COMPACT_WIDTH = 700;
  const BUILDING_SCENES = ['overview', ...model.DEPARTMENTS.map(department => department.id)];
  const REDUCED_MOTION = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const state = {
    tree: null,
    view: 'map',
    mapMode: 'overview',
    departmentId: null,
    selectedKey: null,
    readerOrigin: null,
    zoom: 1,
    panX: 0,
    panY: 0,
    pointer: null,
    chartQuery: '',
    wheelAngle: 0,
    wheelTarget: 0,
    wheelFrame: 0,
    wheelSnapTimer: 0,
    sceneScale: 1,
    sceneScaleTarget: 1,
    sceneY: 0,
    sceneYTarget: 0,
    transitionToken: 0,
    transitionTimers: new Map(),
    transitioning: false,
    pendingDepartmentId: null,
    hoveredDepartmentId: null,
  };

  const dom = {};

  function byId(id) { return document.getElementById(id); }

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, character => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[character]));
  }

  function escapeAttr(value) { return escapeHtml(value).replace(/`/g, '&#96;'); }

  function departmentById(id) {
    return state.tree && state.tree.departments.find(department => department.id === id);
  }

  function itemByKey(key) {
    return state.tree && state.tree.items.find(item => item.key === key);
  }

  function itemById(id) {
    return state.tree && state.tree.items.find(item => item.id === id);
  }

  function isCompact() { return window.innerWidth < COMPACT_WIDTH; }

  function callPhrase(item) {
    return `Use A Legião com o agente ${item.title}: ${item.pedido}`;
  }

  function waitForTransition(milliseconds, token) {
    if (REDUCED_MOTION || milliseconds <= 0) return Promise.resolve(token === state.transitionToken);
    return new Promise(resolve => {
      const timer = window.setTimeout(() => {
        state.transitionTimers.delete(timer);
        resolve(token === state.transitionToken);
      }, milliseconds);
      state.transitionTimers.set(timer, resolve);
    });
  }

  function init() {
    Object.assign(dom, {
      page: byId('st-page'),
      building: byId('st-building'),
      svg: byId('st-svg'),
      mapBack: byId('st-map-back'),
      reader: byId('st-reader'),
      search: byId('st-search'),
      searchInput: byId('st-search-input'),
      searchResults: byId('st-search-results'),
      chart: byId('st-chart'),
    });

    byId('st-map-back').addEventListener('click', showOverview);
    byId('st-search-open').addEventListener('click', openSearch);
    byId('st-search-close').addEventListener('click', closeSearch);
    byId('st-search-backdrop').addEventListener('click', closeSearch);
    byId('st-fullscreen').addEventListener('click', toggleFullscreen);
    document.querySelectorAll('#st-top-tabs [data-st-view]').forEach(button => {
      button.addEventListener('click', () => setView(button.dataset.stView));
    });

    dom.svg.addEventListener('click', onMapClick);
    dom.svg.addEventListener('pointerdown', startPan);
    dom.svg.addEventListener('pointermove', movePan);
    dom.svg.addEventListener('pointerup', endPan);
    dom.svg.addEventListener('pointercancel', endPan);
    dom.svg.addEventListener('wheel', onWheel, { passive: false });
    dom.svg.addEventListener('pointerover', onDepartmentHover);
    dom.svg.addEventListener('pointerout', onDepartmentLeave);
    dom.svg.addEventListener('pointerover', onAgentHover);
    dom.svg.addEventListener('pointerout', onAgentLeave);
    dom.searchInput.addEventListener('input', renderSearchResults);
    dom.chart.addEventListener('click', onChartClick);
    dom.reader.addEventListener('click', onReaderClick);
    document.addEventListener('keydown', onGlobalKeydown);
  }

  function showBuildingScene(sceneId) {
    const scene = BUILDING_SCENES.includes(sceneId) ? sceneId : 'overview';
    if (dom.building) dom.building.dataset.scene = scene;
    for (const candidate of BUILDING_SCENES) {
      const image = byId(`st-building-${candidate}`);
      if (!image) continue;
      const active = candidate === scene;
      image.classList.toggle('is-active', active);
      image.setAttribute('aria-hidden', String(!active));
    }
  }

  async function loadTree() {
    const response = await fetch(DATA_URL, { credentials: 'same-origin' });
    if (!response.ok) throw new Error(`Não foi possível carregar os agentes (${response.status}). Recarregue a página.`);
    return model.buildTree(await response.json());
  }

  async function start() {
    init();
    showBuildingScene('overview');
    byId('st-map-error').hidden = false;
    byId('st-map-error').textContent = 'carregando A Legião…';
    try {
      state.tree = await loadTree();
      setView('map');
      fitMap();
    } catch (error) {
      dom.svg.innerHTML = '';
      byId('st-map-error').hidden = false;
      byId('st-map-error').textContent = error.message || 'Não foi possível carregar o mapa.';
    }
  }

  function setView(view) {
    if (!['map', 'chart'].includes(view)) view = 'map';
    state.view = view;
    document.querySelectorAll('#st-top-tabs [data-st-view]').forEach(button => {
      button.setAttribute('aria-selected', String(button.dataset.stView === view));
    });
    byId('st-view-map').hidden = view !== 'map';
    byId('st-view-chart').hidden = view !== 'chart';
    if (!state.tree) return;
    if (view === 'map') renderMap();
    if (view === 'chart') renderChart();
  }

  async function showOverview() {
    if (state.mapMode !== 'department' || state.transitioning) return;
    showBuildingScene('overview');
    const token = ++state.transitionToken;
    state.transitioning = true;
    dom.page.classList.add('is-transitioning');
    closeReader({ restoreFocus: false });
    const world = byId('st-world');
    if (world) world.classList.add('is-collapsing');
    if (!await waitForTransition(380, token)) return;

    state.mapMode = 'overview';
    state.departmentId = null;
    state.sceneScale = 1;
    state.sceneScaleTarget = 1;
    state.sceneY = 0;
    state.sceneYTarget = 0;
    renderMap({ rising: true });
    fitMap();
    if (!await waitForTransition(450, token)) return;
    const risingWorld = byId('st-world');
    if (risingWorld) risingWorld.classList.remove('is-rising');
    state.transitioning = false;
    dom.page.classList.remove('is-transitioning');
  }

  async function showDepartment(id, options = {}) {
    const department = departmentById(id);
    if (!department || state.transitioning) return false;
    showBuildingScene(id);
    if (state.mapMode === 'department' || options.animate === false) {
      state.mapMode = 'department';
      state.departmentId = id;
      closeReader({ restoreFocus: false });
      renderMap({ entering: options.animate !== false });
      fitMap();
      return true;
    }

    const index = state.tree.departments.findIndex(candidate => candidate.id === id);
    const count = state.tree.departments.length;
    const token = ++state.transitionToken;
    state.transitioning = true;
    state.pendingDepartmentId = id;
    dom.page.classList.add('is-transitioning');
    closeReader({ restoreFocus: false });

    const target = model.seatWheelTarget(state.wheelAngle, index, count);
    const alignmentDelay = Math.min(800, 180 + Math.abs(target - state.wheelAngle) * 5);
    state.wheelTarget = target;
    startWheelAnimation();
    layoutOverviewWheel();
    if (!await waitForTransition(alignmentDelay, token)) return false;

    const overviewWorld = byId('st-world');
    if (overviewWorld) overviewWorld.classList.add('is-dive-focus');
    state.sceneScaleTarget = 1.58;
    state.sceneYTarget = -180;
    startWheelAnimation();
    if (!await waitForTransition(DIVE_FOCUS_DELAY, token)) return false;

    state.mapMode = 'department';
    state.departmentId = id;
    state.pendingDepartmentId = null;
    renderMap({ entering: true });
    fitMap();
    if (!await waitForTransition(FAN_SETTLE_DELAY, token)) return false;

    state.transitioning = false;
    dom.page.classList.remove('is-transitioning');
    return true;
  }

  function startWheelAnimation() {
    if (state.wheelFrame || state.mapMode !== 'overview') return;
    state.wheelFrame = requestAnimationFrame(animateWheel);
  }

  function animateWheel() {
    state.wheelFrame = 0;
    if (state.mapMode !== 'overview') return;
    const wheelDifference = state.wheelTarget - state.wheelAngle;
    const scaleDifference = state.sceneScaleTarget - state.sceneScale;
    const yDifference = state.sceneYTarget - state.sceneY;
    state.wheelAngle = REDUCED_MOTION ? state.wheelTarget : state.wheelAngle + wheelDifference * WHEEL_EASE;
    state.sceneScale = REDUCED_MOTION ? state.sceneScaleTarget : state.sceneScale + scaleDifference * CAMERA_EASE;
    state.sceneY = REDUCED_MOTION ? state.sceneYTarget : state.sceneY + yDifference * CAMERA_EASE;
    if (Math.abs(wheelDifference) <= 0.01) state.wheelAngle = state.wheelTarget;
    if (Math.abs(scaleDifference) <= 0.001) state.sceneScale = state.sceneScaleTarget;
    if (Math.abs(yDifference) <= 0.05) state.sceneY = state.sceneYTarget;
    layoutOverviewWheel();
    const wheelMoving = Math.abs(state.wheelTarget - state.wheelAngle) > 0.01;
    const cameraMoving = Math.abs(state.sceneScaleTarget - state.sceneScale) > 0.001 || Math.abs(state.sceneYTarget - state.sceneY) > 0.05;
    if (wheelMoving || cameraMoving) startWheelAnimation();
  }

  function applyOverviewCamera() {
    const scene = byId('st-overview-scene');
    if (!scene) return;
    scene.setAttribute('transform', `translate(0 ${state.sceneY.toFixed(2)}) scale(${state.sceneScale.toFixed(4)})`);
  }

  function layoutOverviewWheel() {
    if (state.mapMode !== 'overview' || !state.tree) return;
    const count = state.tree.departments.length;
    const step = 360 / Math.max(1, count);
    const focusedIndex = ((Math.round((180 - state.wheelAngle) / step) % count) + count) % count;
    dom.svg.querySelectorAll('[data-wheel-index]').forEach(element => {
      const index = Number(element.dataset.wheelIndex);
      const angle = state.wheelAngle + index * step;
      element.setAttribute('transform', `rotate(${angle.toFixed(3)})`);
      const label = element.querySelector('.st-ref-mini-label-face');
      if (label) label.setAttribute('transform', `translate(0 ${-(WHEEL_ROOT_RADIUS + WHEEL_LABEL_OFFSET)}) rotate(${(-angle).toFixed(3)})`);
      element.classList.toggle('is-focused', index === focusedIndex);
      element.classList.toggle('is-selected', state.tree.departments[index].id === state.pendingDepartmentId);
      element.classList.toggle('is-hovered', state.tree.departments[index].id === state.hoveredDepartmentId);
    });
    const world = byId('st-world');
    if (world) world.classList.toggle('has-hovered-department', Boolean(state.hoveredDepartmentId));
    const spokes = dom.svg.querySelector('[data-wheel-spokes]');
    if (spokes) spokes.setAttribute('transform', `rotate(${state.wheelAngle.toFixed(3)})`);
    applyOverviewCamera();
  }

  function onDepartmentHover(event) {
    if (state.mapMode !== 'overview' || state.transitioning) return;
    const target = event.target.closest('[data-dept]');
    const id = target && target.dataset.dept;
    if (!id || id === state.hoveredDepartmentId) return;
    state.hoveredDepartmentId = id;
    layoutOverviewWheel();
  }

  function onDepartmentLeave(event) {
    if (state.mapMode !== 'overview' || !state.hoveredDepartmentId) return;
    const target = event.target.closest('[data-dept]');
    if (!target || target.contains(event.relatedTarget)) return;
    state.hoveredDepartmentId = null;
    layoutOverviewWheel();
  }

  function onAgentHover(event) {
    if (state.mapMode !== 'department' || state.transitioning) return;
    const target = event.target.closest('[data-node]');
    if (!target || !target.classList.contains('st-ref-fan-node')) return;
    const world = byId('st-world');
    if (!world) return;
    world.querySelectorAll('.st-ref-fan-node.is-hovered').forEach(node => node.classList.remove('is-hovered'));
    target.classList.add('is-hovered');
    world.classList.add('has-hovered-agent');
  }

  function onAgentLeave(event) {
    if (state.mapMode !== 'department') return;
    const target = event.target.closest('[data-node]');
    if (!target || !target.classList.contains('st-ref-fan-node') || target.contains(event.relatedTarget)) return;
    target.classList.remove('is-hovered');
    const world = byId('st-world');
    if (world && !world.querySelector('.st-ref-fan-node.is-hovered')) world.classList.remove('has-hovered-agent');
  }

  function fitMap() {
    state.zoom = 1;
    state.panX = initialMapPanX();
    state.panY = 0;
    applyMapTransform();
  }

  function initialMapPanX() {
    const building = document.querySelector('.st-building');
    if (!building || window.getComputedStyle(building).display === 'none') return 0;
    const rect = dom.svg.getBoundingClientRect();
    const viewBox = dom.svg.viewBox.baseVal;
    const scale = Math.min(rect.width / Math.max(1, viewBox.width), rect.height / Math.max(1, viewBox.height));
    if (!Number.isFinite(scale) || scale <= 0) return 0;
    return (rect.width * (INITIAL_MAP_ANCHOR_X - .5)) / scale;
  }

  function zoomBy(factor) {
    state.zoom = Math.min(2.2, Math.max(.48, state.zoom * factor));
    applyMapTransform();
  }

  function applyMapTransform() {
    const world = byId('st-world');
    if (world) world.setAttribute('transform', `translate(${state.panX} ${state.panY}) scale(${state.zoom})`);
  }

  function startPan(event) {
    if (state.transitioning || event.button !== 0 || event.target.closest('[data-dept],[data-node]')) return;
    state.pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, panX: state.panX, panY: state.panY };
    dom.svg.setPointerCapture(event.pointerId);
    dom.svg.classList.add('is-panning');
    const world = byId('st-world');
    if (world) world.classList.add('is-panning');
  }

  function movePan(event) {
    if (!state.pointer || state.pointer.id !== event.pointerId) return;
    const rect = dom.svg.getBoundingClientRect();
    const scaleX = dom.svg.viewBox.baseVal.width / Math.max(1, rect.width);
    const scaleY = dom.svg.viewBox.baseVal.height / Math.max(1, rect.height);
    state.panX = state.pointer.panX + (event.clientX - state.pointer.x) * scaleX;
    state.panY = state.pointer.panY + (event.clientY - state.pointer.y) * scaleY;
    applyMapTransform();
  }

  function endPan(event) {
    if (!state.pointer || state.pointer.id !== event.pointerId) return;
    state.pointer = null;
    dom.svg.classList.remove('is-panning');
    const world = byId('st-world');
    if (world) world.classList.remove('is-panning');
  }

  function onWheel(event) {
    event.preventDefault();
    if (state.transitioning) return;
    if (event.ctrlKey || event.metaKey) {
      zoomBy(event.deltaY > 0 ? .91 : 1.1);
      return;
    }
    if (state.mapMode === 'overview') {
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      state.wheelTarget += delta * WHEEL_SCROLL_GAIN;
      window.clearTimeout(state.wheelSnapTimer);
      state.wheelSnapTimer = window.setTimeout(() => {
        state.wheelTarget = model.snapWheelAngle(state.wheelTarget, state.tree.departments.length);
        startWheelAnimation();
      }, WHEEL_SNAP_DELAY);
      startWheelAnimation();
      return;
    }
    const rect = dom.svg.getBoundingClientRect();
    state.panX -= event.deltaX * (dom.svg.viewBox.baseVal.width / Math.max(1, rect.width));
    state.panY -= event.deltaY * (dom.svg.viewBox.baseVal.height / Math.max(1, rect.height));
    applyMapTransform();
  }

  function renderMap(options = {}) {
    if (!state.tree) return;
    byId('st-map-error').hidden = true;
    dom.mapBack.hidden = state.mapMode !== 'department';
    if (state.mapMode === 'overview') {
      dom.svg.innerHTML = overviewMarkup();
      dom.svg.setAttribute('viewBox', window.innerWidth < 1100 ? '-980 -980 1960 1960' : '-820 -820 1640 1640');
    } else {
      const department = departmentById(state.departmentId);
      const layout = model.layoutFanDepartment(department, isCompact() ? 'compact' : 'wide');
      dom.svg.innerHTML = departmentMarkup(department, layout, options.entering === true);
      const reach = layout.maxRadius + (layout.showLabels ? 150 : 90);
      dom.svg.setAttribute('viewBox', isCompact()
        ? `${-reach} ${-reach} ${reach * 2} ${reach * 2}`
        : `-960 ${-reach} 1920 ${reach + 260}`);
    }
    const world = byId('st-world');
    if (world && options.rising) world.classList.add('is-rising');
    applyMapTransform();
    if (state.mapMode === 'overview') layoutOverviewWheel();
  }

  function svgDefs() {
    return `<defs>
      <radialGradient id="st-ref-node-fill" cx="35%" cy="30%"><stop offset="0" stop-color="#F0F0E4"/><stop offset="1" stop-color="var(--node-color, #C6FF34)"/></radialGradient>
      <filter id="st-ref-glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="5"/></filter>
    </defs>`;
  }

  function seededRandom(seedValue) {
    let seed = seedValue;
    return () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
  }

  function coreMarkup() {
    const rand = seededRandom(7);
    const colors = ['#C6FF34', '#3BD0A0', '#2FA084', '#1F6F5F', '#F0F0E4'];
    const pickColor = () => rand() < .32 ? '#F0F0E4' : colors[Math.floor(rand() * colors.length)];
    const dot = (x, y, radius, color, opacity, pulse) => `<circle class="st-ref-core-dot${pulse ? ' is-pulsing' : ''}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${radius.toFixed(1)}" fill="${color}" opacity="${opacity.toFixed(2)}" style="animation-delay:-${(rand() * 4).toFixed(1)}s"/>`;
    const edge = (x0, y0, x1, y1, opacity, dashed) => `<path d="M${x0.toFixed(1)} ${y0.toFixed(1)}L${x1.toFixed(1)} ${y1.toFixed(1)}" stroke="rgba(240,240,228,${opacity.toFixed(2)})" stroke-width=".85"${dashed ? ' stroke-dasharray="1.5 3"' : ''} fill="none"/>`;
    let freeDots = '';
    for (let index = 0; index < 130; index += 1) {
      const angle = rand() * Math.PI * 2;
      const radius = 112 * Math.sqrt(rand());
      freeDots += dot(radius * Math.cos(angle), radius * Math.sin(angle), .8 + rand() * 1.2, pickColor(), .25 + rand() * .5, rand() < .25);
    }
    for (let index = 0; index < 55; index += 1) {
      const angle = rand() * Math.PI * 2;
      const radius = 96 + rand() * 17;
      freeDots += dot(radius * Math.cos(angle), radius * Math.sin(angle), .7 + rand(), pickColor(), .3 + rand() * .45, rand() < .2);
    }
    const burst = (centerX, centerY, count, spread) => {
      let markup = '';
      for (let index = 0; index < count; index += 1) {
        const angle = rand() * Math.PI * 2;
        const radius = spread * (.35 + rand() * .65);
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        markup += edge(centerX, centerY, x, y, .16 + rand() * .1);
        markup += dot(x, y, 1.1 + rand() * 1.3, pickColor(), .55 + rand() * .4, rand() < .4);
        if (rand() < .32) {
          const angle2 = angle + (rand() - .5) * .9;
          const radius2 = 8 + rand() * 11;
          const x2 = x + radius2 * Math.cos(angle2);
          const y2 = y + radius2 * Math.sin(angle2);
          markup += edge(x, y, x2, y2, .12);
          markup += dot(x2, y2, .9 + rand() * .8, pickColor(), .35 + rand() * .35, false);
        }
      }
      return markup;
    };
    let bursts = burst(-20, -15, 28, 52) + burst(17, 19, 35, 58);
    bursts += edge(-20, -15, 17, 19, .16);
    bursts += '<circle class="st-ref-nucleus" cx="-20" cy="-15" r="4.5" fill="#C6FF34"/><circle cx="17" cy="19" r="3.4" fill="#F0F0E4" opacity=".9"/>';
    const centers = [];
    let clusters = '';
    for (let clusterIndex = 0; clusterIndex < 11; clusterIndex += 1) {
      const angle = clusterIndex / 11 * Math.PI * 2 + rand() * .5;
      const radius = 54 + rand() * 42;
      const centerX = radius * Math.cos(angle);
      const centerY = radius * Math.sin(angle);
      centers.push([centerX, centerY]);
      let group = dot(centerX, centerY, 1.7 + rand(), pickColor(), .85, false);
      const count = 5 + Math.floor(rand() * 7);
      const base = rand() * Math.PI * 2;
      const span = Math.PI * (.7 + rand() * 1.3);
      for (let index = 0; index < count; index += 1) {
        const branchAngle = base + span * (index / count) + (rand() - .5) * .2;
        const branchRadius = 6.5 + rand() * 9;
        const x = centerX + branchRadius * Math.cos(branchAngle);
        const y = centerY + branchRadius * Math.sin(branchAngle);
        group += edge(centerX, centerY, x, y, .18);
        group += dot(x, y, .9 + rand(), pickColor(), .45 + rand() * .4, rand() < .3);
      }
      clusters += `<g class="st-ref-core-drift" style="animation-duration:${(9 + rand() * 8).toFixed(1)}s;animation-delay:-${(rand() * 9).toFixed(1)}s">${group}</g>`;
    }
    let longEdges = '';
    for (let index = 0; index < 6; index += 1) {
      const start = centers[Math.floor(rand() * centers.length)];
      const end = centers[Math.floor(rand() * centers.length)];
      if (start !== end) longEdges += edge(start[0], start[1], end[0], end[1], .07 + rand() * .06, true);
    }
    const totals = state.tree.totals;
    return `<g class="st-ref-core" aria-label="A Legião, núcleo do mapa" transform="scale(1.27)">
      <circle r="122" fill="rgba(31,111,95,.04)"/>
      <g class="st-ref-core-spin">${freeDots}${longEdges}${clusters}${bursts}</g>
      <text class="st-ref-core-name" x="0" y="142" text-anchor="middle">A LEGIÃO</text>
      <text class="st-ref-core-sub" x="0" y="154" text-anchor="middle">${totals.especialistas} ESPECIALISTAS · ${totals.orquestradores} ORQUESTRADORES</text>
    </g>`;
  }

  function departmentGlyph(glyph, x, y) {
    const paths = {
      comando: '<path d="M0-11 3-3l8 3-8 3-3 8-3-8-8-3 8-3z"/><circle r="3"/>',
      copy: '<path d="M-8 9 7-6l3 3L-5 12h-3z"/><path d="M4-9l3-3 3 3-3 3"/>',
      aquisicao: '<path d="M-8 5h4l8 5V-10l-8 5h-4z"/><path d="M-5 5l2 6"/>',
      vendas: '<path d="M-9 5l6-6 4 4 8-9"/><path d="M4-6h5v5"/>',
      oferta: '<path d="M0-11v22M6-7C4-10-6-10-6-4c0 7 12 2 12 9 0 6-10 6-13 2"/>',
      estrategia: '<circle r="8"/><path d="M-2 2l5-5m-1-4 4 4-4 4"/>',
      operacao: '<circle r="5"/><path d="M0-11v3M0 8v3M-11 0h3M8 0h3M-8-8l2 2M6 6l2 2M8-8 6-6M-6 6-8 8"/>',
    };
    return `<g class="st-dept-glyph" transform="translate(${x} ${y})">${paths[glyph] || paths.operacao}</g>`;
  }

  function nodeGlyph(item) {
    if (item.orquestrador) return '<path d="M-9-10L11 0-9 10Z"/>';
    return '<path d="M-8 8V-7l8-4 8 4V8l-8 4z"/><path d="M-3-1h6M0-4v6"/>';
  }

  // Hero e orquestrador aparecem cheios; Core e Especialista, contornados. Nenhum some: todos estão prontos.
  function visualClass(item) {
    return item.orquestrador || item.tier === 'Hero' ? 'is-deployed' : 'is-assisted';
  }

  function miniNodeMarkup(node) {
    const visual = visualClass(node.item);
    return `<path class="st-ref-mini-line ${visual}" d="M${node.fromX.toFixed(1)} ${node.fromY.toFixed(1)}L${node.x.toFixed(1)} ${node.y.toFixed(1)}"/><circle class="st-ref-mini-dot ${visual}" cx="${node.x.toFixed(1)}" cy="${node.y.toFixed(1)}" r="7.5"><title>${escapeHtml(node.item.title)}</title></circle>`;
  }

  function miniDepartmentMarkup(department) {
    const layout = model.layoutMiniDepartment(department);
    const branches = layout.branches.map(branch => `<path class="st-ref-mini-line" d="M${branch.startX.toFixed(1)} ${branch.startY.toFixed(1)}L${branch.x.toFixed(1)} ${branch.y.toFixed(1)}"/><circle cx="${branch.x.toFixed(1)}" cy="${branch.y.toFixed(1)}" r="4" fill="${department.color}"/>`).join('');
    const nodes = layout.nodes.map(miniNodeMarkup).join('');
    return `${branches}${nodes}<circle class="st-ref-mini-root" r="32"/><g transform="scale(.9)">${departmentGlyph(department.glyph, 0, 0)}</g><circle class="st-dept-hit st-dept-entry-hit" r="48"/>`;
  }

  function overviewMarkup() {
    const departments = state.tree.departments;
    const count = departments.length;
    const step = 360 / Math.max(1, count);
    const spokes = [];
    [168, 236].forEach((radius, ringIndex) => {
      spokes.push(`<circle r="${radius}" class="st-ref-wheel-ring" stroke-dasharray="${ringIndex ? '1 6' : '2 9'}"/>`);
    });
    departments.forEach((department, index) => {
      const angle = index * step * Math.PI / 180;
      const startX = 115 * Math.sin(angle);
      const startY = -115 * Math.cos(angle);
      const endX = (WHEEL_ROOT_RADIUS - 40) * Math.sin(angle);
      const endY = -(WHEEL_ROOT_RADIUS - 40) * Math.cos(angle);
      spokes.push(`<path class="st-ref-wheel-spoke" d="M${startX.toFixed(1)} ${startY.toFixed(1)}L${endX.toFixed(1)} ${endY.toFixed(1)}"/>`);
      [168, 236].forEach(radius => spokes.push(`<circle class="st-ref-wheel-junction" cx="${(radius * Math.sin(angle)).toFixed(1)}" cy="${(-radius * Math.cos(angle)).toFixed(1)}" r="1.8"/>`));
    });
    const rand = seededRandom(19);
    for (let index = 0; index < 30; index += 1) {
      const angle = rand() * Math.PI * 2;
      const radius = 132 + rand() * 156;
      spokes.push(`<circle class="st-ref-wheel-mote" cx="${(radius * Math.sin(angle)).toFixed(1)}" cy="${(-radius * Math.cos(angle)).toFixed(1)}" r="${(.9 + rand() * 1.2).toFixed(1)}" opacity="${(.1 + rand() * .18).toFixed(2)}"/>`);
    }
    const clusters = departments.map((department, index) => `<g class="st-ref-mini" data-wheel-index="${index}" data-dept="${department.id}" tabindex="0" role="button" aria-label="Abrir o andar ${escapeAttr(department.label)}" style="--node-color:${department.color};--d:${(index * .12).toFixed(2)}s">
      <g class="st-ref-mini-scale" transform="translate(0 ${-WHEEL_ROOT_RADIUS})">${miniDepartmentMarkup(department)}</g>
      <g class="st-ref-mini-label-face">
        <text class="st-ref-mini-name" text-anchor="middle">${escapeHtml(department.label)}</text>
        <text class="st-ref-mini-sub" y="23" text-anchor="middle">${escapeHtml(department.subtitle)}</text>
      </g>
    </g>`).join('');
    return `${svgDefs()}<g id="st-world" class="st-world">
      <g id="st-overview-scene" class="st-overview-scene">
        <g data-wheel-spokes>${spokes.join('')}</g>
        ${coreMarkup()}
        ${clusters}
      </g>
    </g>`;
  }

  function arcPath(radius, startAngle, endAngle) {
    const startX = radius * Math.sin(startAngle);
    const startY = -radius * Math.cos(startAngle);
    const endX = radius * Math.sin(endAngle);
    const endY = -radius * Math.cos(endAngle);
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
    return `M${startX.toFixed(1)} ${startY.toFixed(1)}A${radius} ${radius} 0 ${largeArc} 1 ${endX.toFixed(1)} ${endY.toFixed(1)}`;
  }

  function fanNodeMarkup(node, department, animate) {
    const item = node.item;
    return `<g class="st-ref-fan-node ${visualClass(item)}" transform="translate(${node.x.toFixed(1)} ${node.y.toFixed(1)})" style="--d:${(node.delay + .18).toFixed(2)}s;--node-color:${department.color}" data-node="${escapeAttr(item.key)}" tabindex="0" role="button" aria-label="${escapeAttr(item.title)}">
      <title>${escapeHtml(item.title)}</title>
      <circle class="st-node-hit" r="48"/>
      <g class="st-ref-fan-node-hover">
        <g class="st-ref-fan-node-shell${animate ? ' st-ref-node-pop' : ''}">
          <circle class="st-ref-fan-node-disc" r="37"/>
          <g class="st-ref-fan-node-icon">${nodeGlyph(item)}</g>
          <text class="st-ref-fan-node-label" y="64" text-anchor="middle">${escapeHtml(item.title)}</text>
        </g>
      </g>
    </g>`;
  }

  function departmentMarkup(department, layout, animate) {
    if (!department) return overviewMarkup();
    const lineClass = animate ? ' st-draw-line' : '';
    const ringRadii = [248, 400, 540, 680].filter(radius => radius <= layout.maxRadius + 140);
    const rings = ringRadii.map((radius, index) => `<path class="st-ref-fan-ring${lineClass}" pathLength="1" style="--d:${(.1 + index * .07).toFixed(2)}s" d="${arcPath(radius, -layout.span / 2 - .06, layout.span / 2 + .06)}"/>`).join('');
    const branches = layout.branches.map(branch => `<path class="st-ref-fan-line${lineClass}" pathLength="1" style="--d:.15s" d="M${branch.startX.toFixed(1)} ${branch.startY.toFixed(1)}L${branch.x.toFixed(1)} ${branch.y.toFixed(1)}"/><circle class="st-ref-branch-dot${animate ? ' st-ref-pop-dot' : ''}" style="--d:.3s" cx="${branch.x.toFixed(1)}" cy="${branch.y.toFixed(1)}" r="5" fill="${department.color}"/>`).join('');
    const lines = layout.nodes.map(node => `<path class="st-ref-fan-line${lineClass}" pathLength="1" style="--d:${node.delay.toFixed(2)}s" d="M${node.fromX.toFixed(1)} ${node.fromY.toFixed(1)}L${node.x.toFixed(1)} ${node.y.toFixed(1)}"/>`).join('');
    const nodes = layout.nodes.map(node => fanNodeMarkup(node, department, animate)).join('');
    const labels = layout.showLabels ? layout.branches.map((branch, index) => {
      const count = branch.group.items.length;
      return `<g class="st-ref-team-label${animate ? ' st-ref-fade-in' : ''}" transform="translate(${branch.labelX.toFixed(1)} ${branch.labelY.toFixed(1)})" style="--d:${(.55 + index * .07).toFixed(2)}s">
        <text class="st-ref-team-name" text-anchor="middle">${escapeHtml(branch.group.label.toUpperCase())}</text>
        <text class="st-ref-team-count" y="28" text-anchor="middle">${count} AGENTE${count === 1 ? '' : 'S'}</text>
      </g>`;
    }).join('') : '';
    const root = department.root;
    const rootAttributes = root ? ` data-node="${escapeAttr(root.key)}" tabindex="0" role="button" aria-label="${escapeAttr(root.title)}"` : '';
    return `${svgDefs()}<g id="st-world" class="st-world st-ref-fan-world" style="--node-color:${department.color}">
      <text class="st-ref-ghost" x="0" y="-430" text-anchor="middle">${escapeHtml(department.label)}</text>
      ${rings}${branches}${lines}${nodes}${labels}
      <g class="st-ref-root${animate ? ' st-ref-node-pop' : ''}" style="--d:0s;--node-color:${department.color}"${rootAttributes}>
        ${root ? '<circle class="st-node-hit" r="66"/>' : ''}
        <circle class="st-ref-root-disc" r="55"/>
        <g transform="scale(1.55)">${departmentGlyph(department.glyph, 0, 0)}</g>
      </g>
      <g class="st-ref-fan-name${animate ? ' st-ref-fade-in' : ''}" style="--d:.4s">
        <text x="0" y="96" text-anchor="middle">${escapeHtml(root ? root.title.replace(/\s*\(.*\)$/, '').toUpperCase() : department.label)}</text>
        <text class="st-ref-fan-sub" x="0" y="130" text-anchor="middle">${escapeHtml(department.subtitle)}</text>
      </g>
    </g>`;
  }

  function onMapClick(event) {
    if (state.pointer || state.transitioning) return;
    const departmentTarget = event.target.closest('[data-dept]');
    if (departmentTarget) { showDepartment(departmentTarget.dataset.dept); return; }
    const nodeTarget = event.target.closest('[data-node]');
    if (nodeTarget) openReader(nodeTarget.dataset.node, nodeTarget);
  }

  function chainMarkup(title, ids) {
    const names = ids.map(id => itemById(id)).filter(Boolean);
    if (!names.length) return '';
    return `<section class="st-reader-section st-reader-executive"><h3>${escapeHtml(title)}</h3><ul>${names.map(item => `<li><button class="lg-link" type="button" data-lg-open="${escapeAttr(item.key)}">${escapeHtml(item.title)}</button></li>`).join('')}</ul></section>`;
  }

  function openReader(key, origin) {
    const item = itemByKey(key);
    if (!item) return;
    state.readerOrigin = origin && typeof origin.focus === 'function' ? origin : null;
    const department = departmentById(item.departmentId);
    state.selectedKey = key;
    dom.reader.hidden = false;
    dom.reader.innerHTML = `<button class="st-icon-btn st-reader-close" type="button" data-lg-close aria-label="Fechar detalhes">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6 6 18"/></svg>
      </button>
      <p class="st-reader-kicker" style="color:${department.color}">${escapeHtml(item.tierLabel)} · ${escapeHtml(department.label)}</p>
      <h2>${escapeHtml(item.title)}</h2>
      <p class="st-reader-desc">${escapeHtml(item.descricao)}</p>
      <section class="st-reader-section lg-call">
        <h3>Como chamar</h3>
        <p class="lg-call-phrase" id="lg-call-phrase">${escapeHtml(callPhrase(item))}</p>
        <button class="st-action st-action--primary lg-copy" type="button" data-lg-copy="${escapeAttr(callPhrase(item))}">Copiar frase</button>
        <p class="lg-call-hint">Cole numa conversa do Claude ou do Codex com A Legião conectada. Também vale pedir do seu jeito, com as suas palavras.</p>
      </section>
      <div class="st-reader-meta">
        <div><span>Andar</span><strong>${escapeHtml(department.label)}</strong></div>
        <div><span>${item.orquestrador ? 'Tipo' : 'Categoria'}</span><strong>${escapeHtml(item.orquestrador ? 'Orquestrador' : item.categoria)}</strong></div>
        ${item.especialista && !item.orquestrador ? `<div><span>Método</span><strong>${escapeHtml(item.especialista)}</strong></div>` : ''}
        ${item.conexao ? `<div><span>Usa seus números</span><strong>${escapeHtml(item.conexao)}</strong></div>` : ''}
      </div>
      ${chainMarkup('Encadeia estes agentes', item.encadeia)}
      ${chainMarkup('Faz parte destes jobs', item.orquestradores)}`;
  }

  function closeReader({ restoreFocus = true } = {}) {
    if (!dom.reader || dom.reader.hidden) return;
    const origin = state.readerOrigin;
    state.readerOrigin = null;
    dom.reader.hidden = true;
    dom.reader.innerHTML = '';
    state.selectedKey = null;
    if (restoreFocus && origin && typeof origin.focus === 'function') origin.focus();
  }

  // Navegador embutido (app, webview) costuma negar a API de clipboard; o execCommand ainda copia lá.
  function copyWithSelection(text) {
    const field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.opacity = '0';
    document.body.appendChild(field);
    field.select();
    let copied = false;
    try { copied = document.execCommand('copy'); } catch { copied = false; }
    field.remove();
    return copied;
  }

  async function copyText(button, text) {
    const original = button.textContent;
    let copied;
    try {
      await navigator.clipboard.writeText(text);
      copied = true;
    } catch {
      copied = copyWithSelection(text);
    }
    button.textContent = copied ? 'Copiado' : 'Selecione e copie';
    window.setTimeout(() => { button.textContent = original; }, 1800);
  }

  function onReaderClick(event) {
    if (event.target.closest('[data-lg-close]')) { closeReader(); return; }
    const copyButton = event.target.closest('[data-lg-copy]');
    if (copyButton) { copyText(copyButton, copyButton.dataset.lgCopy); return; }
    const link = event.target.closest('[data-lg-open]');
    if (link) focusItem(link.dataset.lgOpen);
  }

  function openSearch() {
    if (!state.tree) return;
    dom.search.hidden = false;
    dom.searchInput.value = '';
    renderSearchResults();
    requestAnimationFrame(() => dom.searchInput.focus());
  }

  function closeSearch() {
    if (!dom.search) return;
    dom.search.hidden = true;
  }

  function renderSearchResults() {
    const query = dom.searchInput.value;
    const results = query.trim() ? model.searchTree(state.tree, query, 24) : state.tree.items.slice(0, 10);
    dom.searchResults.innerHTML = results.length ? results.map(item => {
      const department = departmentById(item.departmentId);
      return `<button class="st-search-result" type="button" data-search-key="${escapeAttr(item.key)}" style="--result-color:${department.color}">
        <i>${escapeHtml(item.tierLabel.charAt(0))}</i>
        <span><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(department.label)} · ${escapeHtml(item.categoria)}</span></span>
        <code>${escapeHtml(item.tierLabel)}</code>
      </button>`;
    }).join('') : '<div class="st-empty">nenhum agente encontrado</div>';
    dom.searchResults.querySelectorAll('[data-search-key]').forEach(button => {
      button.addEventListener('click', () => {
        closeSearch();
        focusItem(button.dataset.searchKey);
      });
    });
  }

  async function focusItem(key) {
    const item = itemByKey(key);
    if (!item) return;
    setView('map');
    if (state.mapMode !== 'department' || state.departmentId !== item.departmentId) {
      const entered = await showDepartment(item.departmentId);
      if (!entered) return;
    }
    openReader(key);
  }

  function renderChart() {
    const query = model.normalizeText(state.chartQuery).trim();
    const rows = state.tree.items.filter(item => !query || model.normalizeText([item.title, item.id, item.categoria, item.pedido, departmentById(item.departmentId).label].join(' ')).includes(query));
    dom.chart.innerHTML = `<div class="st-data-view">
      <div class="st-data-head"><div><p>Todos os agentes</p><h2>A Legião inteira.</h2></div><div class="st-data-actions"><span class="st-pill" style="--pill-color:var(--st-lime)">${rows.length} agentes</span></div></div>
      <div class="st-chart-tools"><input class="st-chart-filter" id="st-chart-filter" type="search" placeholder="Filtrar por nome, andar, categoria ou pedido…" value="${escapeAttr(state.chartQuery)}" aria-label="Filtrar agentes"></div>
      <div class="st-table-wrap"><table class="st-table"><thead><tr><th>Agente</th><th>Andar</th><th>Nível</th><th>Como pedir</th><th><span class="lg-sr">Copiar</span></th></tr></thead><tbody>
        ${rows.map(item => {
          const department = departmentById(item.departmentId);
          return `<tr data-st-row="${escapeAttr(item.key)}"><td><strong>${escapeHtml(item.title)}</strong></td><td><span class="st-pill" style="--pill-color:${department.color}">${escapeHtml(department.label)}</span></td><td>${escapeHtml(item.tierLabel)}</td><td class="lg-ask">${escapeHtml(item.pedido)}</td><td><button class="st-action lg-row-copy" type="button" data-lg-copy="${escapeAttr(callPhrase(item))}">Copiar</button></td></tr>`;
        }).join('') || '<tr><td colspan="5"><div class="st-empty">nenhum agente encontrado</div></td></tr>'}
      </tbody></table></div>
    </div>`;
    byId('st-chart-filter').addEventListener('input', event => {
      state.chartQuery = event.target.value;
      renderChart();
      byId('st-chart-filter').focus();
      byId('st-chart-filter').setSelectionRange(state.chartQuery.length, state.chartQuery.length);
    });
  }

  function onChartClick(event) {
    const copyButton = event.target.closest('[data-lg-copy]');
    if (copyButton) { copyText(copyButton, copyButton.dataset.lgCopy); return; }
    const row = event.target.closest('[data-st-row]');
    if (row) focusItem(row.dataset.stRow);
  }

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await dom.page.requestFullscreen();
    } catch { /* Tela cheia é um realce opcional. */ }
  }

  function onGlobalKeydown(event) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      openSearch();
      return;
    }
    if (event.key === 'Escape') {
      if (!dom.search.hidden) closeSearch();
      else if (!dom.reader.hidden) closeReader();
    }
    if ((event.key === 'Enter' || event.key === ' ') && document.activeElement) {
      const departmentTarget = document.activeElement.closest('[data-dept]');
      const nodeTarget = document.activeElement.closest('[data-node]');
      if (departmentTarget && !state.transitioning) { event.preventDefault(); showDepartment(departmentTarget.dataset.dept); }
      else if (nodeTarget) { event.preventDefault(); openReader(nodeTarget.dataset.node, document.activeElement); }
    }
  }

  start();
})();
