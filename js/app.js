// app.js — Application initialization, DOM setup, UI components
// Auto-extracted from monolithic HTML

// Spec version and last-updated are stamped statically in index.html by the deploy script.
// No runtime date generation needed.


// ============================================================
// RENDERER — Enhanced with all UI improvements
// ============================================================
const functionsAccordion = document.getElementById("functionsAccordion");
const summary = document.getElementById("summary");
const searchBox = document.getElementById("searchBox");
const expandAllBtn = document.getElementById("expandAllBtn");
const collapseAllBtn = document.getElementById("collapseAllBtn");
const jumpToSelect = document.getElementById("jumpToSelect");
const implementationGuidance = document.getElementById("implementation-guidance");
const implementationGuidanceBody = document.getElementById("implementationGuidanceBody");

const guidanceTabs = {
  "security-ops": "security-ops-tab",
  "content-model": "content-model-tab",
  "sku-identity": "sku-identity-tab"
};

function renderNewBadge(item) {
  if (!item || !item.isNew) return "";
  return `<span class="new-badge">${escapeHtml(item.newLabel || "New")}</span>`;
}

// Populate jump-to dropdown
integrationSpec.forEach(fn => {
  const opt = document.createElement("option");
  opt.value = fn.key;
  opt.textContent = `${fn.title} (${fn.endpoints.length})`;
  jumpToSelect.appendChild(opt);
});
[
  { value: "security-ops", text: "Security and operational requirements" },
  { value: "content-model", text: "Content model and write semantics" },
  { value: "sku-identity", text: "SKU identity rules" }
].forEach(target => {
  const opt = document.createElement("option");
  opt.value = target.value;
  opt.textContent = target.text;
  jumpToSelect.appendChild(opt);
});
// Add NS Contract Summary to jump-to
const summaryOpt = document.createElement("option");
summaryOpt.value = "ns-contract-summary";
summaryOpt.textContent = "── NS Contract Summary ──";
jumpToSelect.appendChild(summaryOpt);
jumpToSelect.addEventListener("change", () => {
  if (!jumpToSelect.value) return;
  if (jumpToSelect.value === 'ns-contract-summary' || jumpToSelect.value === 'proposed-additions') {
    const el = document.getElementById(jumpToSelect.value);
    if (el) el.scrollIntoView({behavior:'smooth',block:'start'});
    return;
  }
  if (guidanceTabs[jumpToSelect.value]) {
    expandGuidancePanel();
    openGuidanceTab(jumpToSelect.value);
    if (implementationGuidance) implementationGuidance.scrollIntoView({behavior:'smooth',block:'start'});
    return;
  }
  const el = document.querySelector(`[data-function="${jumpToSelect.value}"]`);
  if (el) {
    const c = el.querySelector('.accordion-collapse');
    if (c) new bootstrap.Collapse(c, {show:true});
    el.scrollIntoView({behavior:'smooth',block:'start'});
  }
});

function openGuidanceTab(sectionKey) {
  const tabId = guidanceTabs[sectionKey];
  if (!tabId) return;
  const tabTrigger = document.getElementById(tabId);
  if (tabTrigger) bootstrap.Tab.getOrCreateInstance(tabTrigger).show();
}

function expandGuidancePanel() {
  if (!implementationGuidanceBody) return;
  bootstrap.Collapse.getOrCreateInstance(implementationGuidanceBody, {toggle: false}).show();
}

if (implementationGuidanceBody) {
  bootstrap.Collapse.getOrCreateInstance(implementationGuidanceBody, {toggle: false}).show();
}

// Keyboard shortcuts
document.addEventListener("keydown", e => {
  if ((e.ctrlKey||e.metaKey) && e.key==="k") { e.preventDefault(); searchBox.focus(); searchBox.select(); }
  if (e.key==="Escape" && document.activeElement===searchBox) { searchBox.value=""; render(""); searchBox.blur(); }
  if ((e.ctrlKey||e.metaKey) && e.key===",") { e.preventDefault(); document.getElementById("settingsPanel").classList.toggle("open"); }
});


function render(query = "") {
  functionsAccordion.innerHTML = "";
  const q = query.trim().toLowerCase();
  let visibleFunctions = 0, visibleEndpoints = 0;

  integrationSpec.forEach((fn) => {
    const fnText = (fn.title + " " + fn.description).toLowerCase();
    const endpointMatches = fn.endpoints.filter(ep => {
      const epText = `${ep.method} ${ep.path} ${ep.direction} ${ep.purpose} ${ep.scope||""} ${(ep.versionNotes||[]).join(" ")} ${ep.idempotencyRecipe||""}`.toLowerCase();
      const fieldsText = ["4.60","4.90"].map(v => {
        const fields = ep.fields?.[v];
        if (!fields || !Array.isArray(fields)) return "";
        return fields.map(f => `${f.table}.${f.field} ${f.notes||""}`).join(" ");
      }).join(" ").toLowerCase();
      if (!q) return true;
      return fnText.includes(q) || epText.includes(q) || fieldsText.includes(q);
    });
    if (endpointMatches.length === 0) return;
    visibleFunctions++;
    visibleEndpoints += endpointMatches.length;

    const headingId = `heading-${fn.key}`, collapseId = `collapse-${fn.key}`;
    const endpointsHtml = endpointMatches.map((ep, i) => {
      const epCollapseId = `${collapseId}-ep-${i}`, epHeadingId = `${headingId}-ep-${i}`;
      const anchorId = `${fn.key}-${i}`;
      const pills = [
        `<span class="pill dir">direction: ${highlight(ep.direction, query)}</span>`,
        ep.scope ? `<span class="pill scope">scope: ${highlight(ep.scope, query)}</span>` : '',
        ep.idempotencyRequired ? `<span class="pill idemp">Idempotency-Key: required</span>` : '',
        ep.approvalRequired ? `<span class="pill approval">approval: required</span>` : `<span class="pill">approval: no</span>`,
        `<span class="pill ver">4.60 / 4.90</span>`
      ].filter(Boolean).join("\n");

      const vn = (ep.versionNotes||[]).length ? `<ul class="mb-0">${ep.versionNotes.map(n=>`<li>${highlight(n,query)}</li>`).join("")}</ul>` : `<div class="small-muted">No version notes.</div>`;
      const idempRecipe = ep.idempotencyRecipe ? `<div class="idempotency-recipe"><strong>Idempotency-Key recipe:</strong> <code>${highlight(ep.idempotencyRecipe, query)}</code></div>` : '';

      const f460 = ep.fields?.["4.60"];
      const f490 = ep.fields?.["4.90"];

      return `
        <div class="card card-endpoint mb-2" id="${anchorId}" style="border-left-color:${getMethodColor(ep.method)}">
          <div class="card-header bg-white">
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
              <div><span class="pill pill-method ${getMethodClass(ep.method)}">${highlight(ep.method,query)}</span> <span class="ms-2 mono">${highlight(ep.path,query)}</span>${renderNewBadge(ep)}<a href="#${anchorId}" class="anchor-link" title="Permalink">#</a>${renderStatusBadges(ep.httpStatuses)}</div>
              <div class="d-flex flex-wrap gap-1">${pills}</div>
            </div>
            <div class="small-muted mt-2">${highlight(ep.purpose,query)}</div>
            ${idempRecipe}
          </div>
          <div class="card-body">
            <div class="accordion" id="${fn.key}-ep-acc-${i}">
              <div class="accordion-item">
                <h2 class="accordion-header" id="${epHeadingId}">
                  <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${epCollapseId}" aria-expanded="false" aria-controls="${epCollapseId}">Details (fields, version notes)</button>
                </h2>
                <div id="${epCollapseId}" class="accordion-collapse collapse" aria-labelledby="${epHeadingId}">
                  <div class="accordion-body">
                    <div class="row g-3">
                      <div class="col-12"><div class="small-muted">Version notes</div>${vn}</div>
              <div class="col-12 col-lg-6"><h6 class="mb-2">Nopcommerce 4.60 fields</h6>${renderFieldTable("4.60",f460,query,Array.isArray(f490)?f490:null)}</div>
                      <div class="col-12 col-lg-6"><h6 class="mb-2">Nopcommerce 4.90 fields</h6>${renderFieldTable("4.90",f490,query,Array.isArray(f460)?f460:null)}</div>
                      ${renderExamplePayloads(ep, fn.key, i)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>`;
    }).join("");

    functionsAccordion.insertAdjacentHTML("beforeend", `
      <div class="accordion-item" data-function="${escapeHtml(fn.key)}">
        <h2 class="accordion-header" id="${headingId}">
          <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${collapseId}" aria-expanded="false" aria-controls="${collapseId}">
            <div><div class="fw-semibold">${highlight(fn.title,query)}${renderNewBadge(fn)}<span class="ep-count-badge">${endpointMatches.length}</span></div><div class="small-muted">${highlight(fn.description,query)}</div></div>
          </button>
        </h2>
        <div id="${collapseId}" class="accordion-collapse collapse" aria-labelledby="${headingId}" data-bs-parent="#functionsAccordion">
          <div class="accordion-body">${endpointsHtml}</div>
        </div>
      </div>`);
  });
  summary.textContent = `Showing ${visibleFunctions} function(s) and ${visibleEndpoints} endpoint(s).`;

  // Handle hash deep-link
  if (window.location.hash) {
    const target = document.querySelector(window.location.hash);
    if (target) setTimeout(() => target.scrollIntoView({behavior:'smooth',block:'start'}), 300);
  }
}

searchBox.addEventListener("input", e => render(e.target.value));
expandAllBtn.addEventListener("click", () => { document.querySelectorAll(".accordion .accordion-collapse").forEach(el => { try { new bootstrap.Collapse(el, {show:true}); } catch{} }); });
collapseAllBtn.addEventListener("click", () => { document.querySelectorAll(".accordion .accordion-collapse").forEach(el => { try { new bootstrap.Collapse(el, {hide:true}); } catch{} }); });
render("");

// ============================================================
// FLOATING SETTINGS PANEL
// ============================================================
const settingsFab = document.getElementById("settingsFab");
const settingsPanel = document.getElementById("settingsPanel");
const widthToggle = document.getElementById("widthToggle");
const fsBtns = document.querySelectorAll(".fs-btn");
const fsClasses = ["fs-xs", "fs-sm", "fs-md", "fs-lg"];

function initializeBodyToggle(toggle, bodyClass, storageKey) {
  const enabled = toggle.checked || document.body.classList.contains(bodyClass);
  document.body.classList.toggle(bodyClass, enabled);
  toggle.checked = enabled;
  localStorage.setItem(storageKey, enabled ? "1" : "0");
  return enabled;
}

function applyDiffHighlighting(enabled) {
  document.querySelectorAll('.field-table tbody').forEach(tbody => {
    if (!enabled) {
      tbody.querySelectorAll('.field-diff').forEach(tr => tr.classList.remove('field-diff'));
      return;
    }
    const accBody = tbody.closest('.accordion-body');
    if (!accBody) return;
    const allTbodies = accBody.querySelectorAll('.field-table tbody');
    if (allTbodies.length < 2) return;
    const idx = Array.from(allTbodies).indexOf(tbody);
    const otherTbody = allTbodies[idx === 0 ? 1 : 0];
    const otherKeys = new Set();
    otherTbody.querySelectorAll('tr').forEach(tr => {
      const cells = tr.querySelectorAll('td');
      if (cells.length >= 2) otherKeys.add(cells[0].textContent.trim() + '|' + cells[1].textContent.trim());
    });
    tbody.querySelectorAll('tr').forEach(tr => {
      const cells = tr.querySelectorAll('td');
      if (cells.length >= 2) {
        const key = cells[0].textContent.trim() + '|' + cells[1].textContent.trim();
        tr.classList.toggle('field-diff', !otherKeys.has(key));
      }
    });
  });
}

initializeBodyToggle(widthToggle, "full-width", "catalog-full-width");
const savedFs = localStorage.getItem("catalog-font-size");
if (savedFs && fsClasses.includes(savedFs)) { document.body.classList.add(savedFs); fsBtns.forEach(b => b.classList.toggle("active", b.dataset.fs === savedFs)); }
else { document.body.classList.add("fs-md"); }

settingsFab.addEventListener("click", () => settingsPanel.classList.toggle("open"));
document.addEventListener("click", e => { if (!settingsPanel.contains(e.target) && e.target !== settingsFab) settingsPanel.classList.remove("open"); });
widthToggle.addEventListener("change", () => { document.body.classList.toggle("full-width", widthToggle.checked); localStorage.setItem("catalog-full-width", widthToggle.checked ? "1" : "0"); });
fsBtns.forEach(btn => { btn.addEventListener("click", () => { fsClasses.forEach(c => document.body.classList.remove(c)); document.body.classList.add(btn.dataset.fs); fsBtns.forEach(b => b.classList.remove("active")); btn.classList.add("active"); localStorage.setItem("catalog-font-size", btn.dataset.fs); }); });

// Data types toggle
const typesToggle = document.getElementById("typesToggle");
initializeBodyToggle(typesToggle, "show-types", "catalog-show-types");
typesToggle.addEventListener("change", () => { document.body.classList.toggle("show-types", typesToggle.checked); localStorage.setItem("catalog-show-types", typesToggle.checked ? "1" : "0"); });

// NS Contract toggle — CSS-only, no re-render needed
const contractToggle = document.getElementById("contractToggle");
initializeBodyToggle(contractToggle, "show-contracts", "catalog-show-contracts");
contractToggle.addEventListener("change", () => { document.body.classList.toggle("show-contracts", contractToggle.checked); localStorage.setItem("catalog-show-contracts", contractToggle.checked ? "1" : "0"); });

// Diff highlighting toggle — updates field-diff classes in-place, no re-render
const diffToggle = document.getElementById("diffToggle");
applyDiffHighlighting(initializeBodyToggle(diffToggle, "show-diffs", "catalog-show-diffs"));
diffToggle.addEventListener("change", () => {
  document.body.classList.toggle("show-diffs", diffToggle.checked);
  localStorage.setItem("catalog-show-diffs", diffToggle.checked ? "1" : "0");
  applyDiffHighlighting(diffToggle.checked);
});

// Dark mode toggle
const darkToggle = document.getElementById("darkToggle");
if (localStorage.getItem("catalog-dark-mode") === "1") { document.body.classList.add("dark-mode"); darkToggle.checked = true; }
darkToggle.addEventListener("change", () => { document.body.classList.toggle("dark-mode", darkToggle.checked); localStorage.setItem("catalog-dark-mode", darkToggle.checked ? "1" : "0"); });

// Print mode toggle
const printToggle = document.getElementById("printToggle");
printToggle.addEventListener("change", () => { document.body.classList.toggle("print-mode", printToggle.checked); if (printToggle.checked) { expandAllBtn.click(); } });


// ============================================================
// STICKY ACCORDION HEADER — replaces sticky search when a
// function-group accordion is expanded and in viewport
// ============================================================
(function() {
  let currentPinned = null;
  const stickySearch = document.querySelector('.sticky-search');

  function getStickyOffset() {
    return stickySearch ? stickySearch.offsetHeight : 0;
  }

  function getExpandedAccordionInView() {
    const items = document.querySelectorAll('#functionsAccordion > .accordion-item');
    for (const item of items) {
      const collapse = item.querySelector('.accordion-collapse');
      if (!collapse || !collapse.classList.contains('show')) continue;
      const rect = item.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        return item;
      }
    }
    return null;
  }

  function updateStickyHeader() {
    const offset = getStickyOffset();
    const activeItem = getExpandedAccordionInView();
    let shouldPin = false;
    let header = null;
    if (activeItem) {
      header = activeItem.querySelector('.accordion-header');
      const itemRect = activeItem.getBoundingClientRect();
      shouldPin = itemRect.top <= offset && itemRect.bottom > (offset + 60);
    }

    if (shouldPin && header) {
      if (currentPinned !== header) {
        if (currentPinned) { currentPinned.classList.remove('pinned-header'); currentPinned.style.top = ''; }
        header.classList.add('pinned-header');
        header.style.top = offset + 'px';
        currentPinned = header;
      } else {
        header.style.top = offset + 'px';
      }
    } else {
      if (currentPinned) {
        currentPinned.classList.remove('pinned-header');
        currentPinned.style.top = '';
        currentPinned = null;
      }
    }
  }

  // Throttled scroll listener
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => { updateStickyHeader(); ticking = false; });
      ticking = true;
    }
  }, { passive: true });

  // Also update when accordions open/close
  document.getElementById('functionsAccordion').addEventListener('shown.bs.collapse', () => setTimeout(updateStickyHeader, 50));
  document.getElementById('functionsAccordion').addEventListener('hidden.bs.collapse', () => setTimeout(updateStickyHeader, 50));
})();


// ============================================================
// NS CONTRACT SUMMARY TABLE GENERATOR
// ============================================================
(function generateContractSummary() {
  const container = document.getElementById('contractSummaryTables');
  if (!container) return;
  let html = '';

  integrationSpec.forEach(fn => {
    // Collect unique NS-required and NS-optional fields across all endpoints in this section
    const nsFields = new Map(); // key: "table|field" → {table, field, contract, endpoints[], direction}
    fn.endpoints.forEach(ep => {
      if (!ep.fields) return;
      const direction = ep.direction || '';
      const isWrite = ep.method !== 'GET';
      const label = isWrite ? 'Send' : 'Receive';
      ['4.60'].forEach(ver => { // Use 4.60 as canonical (fields are mostly same)
        const fields = ep.fields[ver];
        if (!fields || !Array.isArray(fields)) return;
        fields.forEach(f => {
          if (f.contract !== 'ns-required' && f.contract !== 'ns-optional') return;
          const key = `${f.table}|${f.field}`;
          if (!nsFields.has(key)) {
            nsFields.set(key, {
              table: f.table,
              field: f.field,
              contract: f.contract,
              direction: label,
              endpoints: [`${ep.method} ${ep.path.split('?')[0]}`],
              notes: f.notes || ''
            });
          } else {
            const existing = nsFields.get(key);
            const epPath = `${ep.method} ${ep.path.split('?')[0]}`;
            if (!existing.endpoints.includes(epPath)) existing.endpoints.push(epPath);
            // Upgrade to ns-required if any endpoint requires it
            if (f.contract === 'ns-required') existing.contract = 'ns-required';
            // Track both directions
            if (!existing.direction.includes(label)) existing.direction += ' / ' + label;
          }
        });
      });
    });

    if (nsFields.size === 0) return;

    // Sort: ns-required first, then ns-optional
    const sorted = [...nsFields.values()].sort((a, b) => {
      if (a.contract === b.contract) return a.field.localeCompare(b.field);
      return a.contract === 'ns-required' ? -1 : 1;
    });

    html += `<h6 class="mt-3 mb-2">${fn.title} <span class="badge bg-secondary">${sorted.length} NS fields</span></h6>`;
    html += `<div class="table-responsive"><table class="table table-sm table-striped align-middle"><thead><tr><th>NetSuite Field</th><th>Object / Area</th><th>Contract</th><th>Direction</th><th>Used by</th><th>Notes</th></tr></thead><tbody>`;
    sorted.forEach(f => {
      const badge = f.contract === 'ns-required'
        ? '<span class="badge badge-ns-required">ERP Required</span>'
        : '<span class="badge badge-ns-optional">ERP Optional</span>';
      const eps = f.endpoints.map(e => `<code style="font-size:.72em">${e}</code>`).join(', ');
      html += `<tr><td class="mono" style="font-size:.85em">${f.field}</td><td class="small-muted">${f.table}</td><td>${badge}</td><td class="small-muted">${f.direction}</td><td>${eps}</td><td class="small-muted" style="font-size:.8em">${f.notes}</td></tr>`;
    });
    html += `</tbody></table></div>`;
  });

  container.innerHTML = html;
})();

// ============================================================
// PROPOSED ADDITIONS RENDERER
// Renders proposed endpoints in a visually distinct section
// ============================================================
(function renderProposedAdditions() {
  if (!proposedAdditions || proposedAdditions.length === 0) return;
  const mainContainer = document.querySelector('.container.container-narrow');
  const nsSummary = document.getElementById('ns-contract-summary');

  // Create proposed section HTML
  let proposedHtml = `
    <div class="pending-approval-banner" id="proposed-additions">
      <h4><span class="badge-pending">⚠ PENDING TEAM APPROVAL</span> &nbsp; Proposed Additions from Team Feedback</h4>
      <p class="mb-1">The following endpoints and enhancements were generated from team feedback and are <strong>NOT yet part of the approved specification</strong>. Each proposal includes its feedback source and rationale. The team should review, discuss, and approve/reject each proposal before it is merged into the main endpoint catalog above.</p>
      <div class="small-muted">
        <strong>How to review:</strong> Each section below is marked with a <span class="feedback-source">feedback source</span> badge showing where the requirement originated. Proposals that enhance existing endpoints are clearly labelled. New endpoints follow the same field table format as the approved spec above.
      </div>
    </div>
    <div class="accordion pending-section" id="proposedAccordion">`;

  proposedAdditions.forEach((fn, fnIdx) => {
    const headingId = `proposed-heading-${fn.key}`;
    const collapseId = `proposed-collapse-${fn.key}`;

    const endpointsHtml = fn.endpoints.map((ep, i) => {
      const epCollapseId = `${collapseId}-ep-${i}`;
      const epHeadingId = `${headingId}-ep-${i}`;
      const anchorId = `proposed-${fn.key}-${i}`;

      const pills = [
        `<span class="pill dir">direction: ${escapeHtml(ep.direction)}</span>`,
        ep.scope ? `<span class="pill scope">scope: ${escapeHtml(ep.scope)}</span>` : '',
        ep.idempotencyRequired ? `<span class="pill idemp">Idempotency-Key: required</span>` : '',
        ep.approvalRequired ? `<span class="pill approval">approval: required</span>` : `<span class="pill">approval: no</span>`,
        `<span class="pill ver">4.60 / 4.90</span>`
      ].filter(Boolean).join("\n");

      const vn = (ep.versionNotes||[]).length ? `<ul class="mb-0">${ep.versionNotes.map(n=>`<li>${escapeHtml(n)}</li>`).join("")}</ul>` : `<div class="small-muted">No version notes.</div>`;
      const idempRecipe = ep.idempotencyRecipe ? `<div class="idempotency-recipe"><strong>Idempotency-Key recipe:</strong> <code>${escapeHtml(ep.idempotencyRecipe)}</code></div>` : '';

      const f460 = ep.fields?.["4.60"];
      const f490 = ep.fields?.["4.90"];

      // Example payloads for proposed endpoints
      let payloadHtml = '';
      if (ep.examplePayloads) {
        const blockId = `proposed-payload-${fn.key}-${i}`;
        const ex = ep.examplePayloads;
        const v460 = ex["4.60"];
        const v490raw = ex["4.90"];
        const isIdentical = v490raw === "same";
        const v490 = isIdentical ? v460 : v490raw;

        const buildPane = (ver) => {
          if (!ver) return '';
          let c = '';
          if (ver.request) {
            c += ver.request.comment ? `<div class="payload-comment">${escapeHtml(ver.request.comment)}</div>` : '';
            c += ver.request.body ? `<h6>Request body</h6><pre>${escapeHtml(ver.request.body)}</pre>` : '';
          }
          if (ver.response) {
            c += ver.response.comment ? `<div class="payload-comment">${escapeHtml(ver.response.comment)}</div>` : '';
            c += ver.response.body ? `<pre>${escapeHtml(ver.response.body)}</pre>` : '';
          }
          return c;
        };

        const pane460 = buildPane(v460);
        const pane490 = isIdentical ? pane460 : buildPane(v490);
        const identicalNote = isIdentical ? '<div class="payload-identical-note">✔ Payloads are identical across 4.60 and 4.90.</div>' : '';

        payloadHtml = `<div class="col-12">
          <button class="btn btn-sm btn-outline-primary example-payload-toggle" type="button" onclick="var b=document.getElementById('${blockId}');b.classList.toggle('open');this.textContent=b.classList.contains('open')?'Hide example payloads':'Show example payloads'">Show example payloads</button>
          <div class="example-payload-block" id="${blockId}">
            <div class="payload-version-tabs">
              <button class="payload-ver-btn active" type="button" onclick="window._switchPayloadTab(this,'${blockId}','460')">Nopcommerce 4.60${isIdentical?' ✓':''}</button>
              <button class="payload-ver-btn" type="button" onclick="window._switchPayloadTab(this,'${blockId}','490')">Nopcommerce 4.90${isIdentical?' ✓':''}</button>
            </div>
            ${identicalNote}
            <div class="payload-ver-pane active" id="${blockId}-460">${pane460}</div>
            <div class="payload-ver-pane" id="${blockId}-490">${pane490}</div>
          </div>
        </div>`;
      }

      return `
        <div class="card card-endpoint mb-2" id="${anchorId}" style="border-left-color:${getMethodColor(ep.method)}; border-left-style: dashed;">
          <div class="card-header">
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
              <div><span class="pill pill-method ${getMethodClass(ep.method)}">${escapeHtml(ep.method)}</span> <span class="ms-2 mono">${escapeHtml(ep.path)}</span><span class="pending-ep-badge">PROPOSED</span></div>
              <div class="d-flex flex-wrap gap-1">${pills}</div>
            </div>
            <div class="small-muted mt-2">${escapeHtml(ep.purpose)}</div>
            ${idempRecipe}
          </div>
          <div class="card-body">
            <div class="accordion" id="proposed-${fn.key}-ep-acc-${i}">
              <div class="accordion-item">
                <h2 class="accordion-header" id="${epHeadingId}">
                  <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${epCollapseId}" aria-expanded="false" aria-controls="${epCollapseId}">Details (fields, version notes)</button>
                </h2>
                <div id="${epCollapseId}" class="accordion-collapse collapse" aria-labelledby="${epHeadingId}">
                  <div class="accordion-body">
                    <div class="row g-3">
                      <div class="col-12"><div class="small-muted">Version notes</div>${vn}</div>
                      <div class="col-12 col-lg-6"><h6 class="mb-2">Nopcommerce 4.60 fields</h6>${renderFieldTable("4.60",f460,"",Array.isArray(f490)?f490:null)}</div>
                      <div class="col-12 col-lg-6"><h6 class="mb-2">Nopcommerce 4.90 fields</h6>${renderFieldTable("4.90",f490,"",Array.isArray(f460)?f460:null)}</div>
                      ${payloadHtml}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>`;
    }).join("");

    proposedHtml += `
      <div class="accordion-item" data-function="proposed-${escapeHtml(fn.key)}">
        <h2 class="accordion-header" id="${headingId}">
          <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${collapseId}" aria-expanded="false" aria-controls="${collapseId}">
            <div>
              <div class="fw-semibold">${escapeHtml(fn.title)}<span class="pending-ep-badge">PROPOSED</span><span class="ep-count-badge">${fn.endpoints.length}</span>${fn.feedbackSource ? `<span class="feedback-source">${escapeHtml(fn.feedbackSource)}</span>` : ''}</div>
              <div class="small-muted">${escapeHtml(fn.description)}</div>
              ${fn.rationale ? `<div class="small-muted mt-1"><strong>Rationale:</strong> ${escapeHtml(fn.rationale)}</div>` : ''}
            </div>
          </button>
        </h2>
        <div id="${collapseId}" class="accordion-collapse collapse" aria-labelledby="${headingId}" data-bs-parent="#proposedAccordion">
          <div class="accordion-body">${endpointsHtml}</div>
        </div>
      </div>`;
  });

  proposedHtml += `</div>`;

  // Insert before the NS Contract Summary
  nsSummary.insertAdjacentHTML('beforebegin', proposedHtml);

  // Update summary count
  const totalProposed = proposedAdditions.reduce((sum, fn) => sum + fn.endpoints.length, 0);
  const existingSummary = document.getElementById('summary');
  if (existingSummary) {
    existingSummary.textContent += ` | ${proposedAdditions.length} proposed section(s) with ${totalProposed} endpoint(s) pending team approval.`;
  }

  // Add proposed sections to jump-to dropdown
  const jumpTo = document.getElementById('jumpToSelect');
  const proposedSep = document.createElement('option');
  proposedSep.value = 'proposed-additions';
  proposedSep.textContent = '── Proposed Additions ──';
  proposedSep.disabled = true;
  jumpTo.appendChild(proposedSep);
  proposedAdditions.forEach(fn => {
    const opt = document.createElement('option');
    opt.value = `proposed-${fn.key}`;
    opt.textContent = `⚠ ${fn.title} (${fn.endpoints.length})`;
    jumpTo.appendChild(opt);
  });
})();
