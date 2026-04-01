// renderer.js — Pure rendering/helper functions
// Auto-extracted from monolithic HTML

function escapeHtml(s) { return String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;"); }
function highlight(text, query) {
  if (!query) return escapeHtml(text);
  const safe = escapeHtml(text), q = query.trim();
  if (!q) return safe;
  return safe.replace(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")})`,"ig"),"<mark>$1</mark>");
}

function getMethodClass(m) {
  const u = m.toUpperCase();
  return u==="GET"?"pill-method-get":u==="POST"?"pill-method-post":u==="PUT"?"pill-method-put":u==="PATCH"?"pill-method-patch":u==="DELETE"?"pill-method-delete":"";
}

function getMethodColor(m) {
  const u = m.toUpperCase();
  return u==="GET"?"#198754":u==="POST"?"#0d6efd":u==="PUT"?"#fd7e14":u==="PATCH"?"#6f42c1":u==="DELETE"?"#dc3545":"#6c757d";
}

function renderStatusBadges(statuses) {
  if (!statuses) return '';
  return statuses.map(s => {
    const cls = s>=500?"status-5xx":s>=400?"status-4xx":"status-2xx";
    return `<span class="status-badge ${cls}">${s}</span>`;
  }).join('');
}

function inferType(field) {
  const f = field.toLowerCase();
  if (/\bid\b/.test(f) && !f.includes('guid')) return 'int';
  if (f.includes('guid')) return 'Guid';
  if (f.includes('utc') || f.includes('date')) return 'DateTime?';
  if (f.includes('price') || f.includes('cost') || f.includes('amount') || f.includes('charge') || f.includes('total') || f.includes('discount') || f.includes('ratio') || f.includes('rate') || f.includes('adjustment') || f.includes('weight') || f.includes('length') || f.includes('width') || f.includes('height')) return 'decimal';
  if (f.includes('quantity') || f.includes('qty') || f.includes('order') || f.includes('typeid') || f.includes('modeid') || f.includes('statusid') || f.includes('categoryid') || f.includes('storeid') || f.includes('customerid') || f.includes('warehouseid') || f.includes('pictureid') || f.includes('vendorid') || f.includes('manufacturerid') || f.includes('templateid') || f.includes('addressid') || f.includes('roleid') || f.includes('languageid') || f.includes('currencyid') || f.includes('countryid') || f.includes('provinceid') || f.includes('deliverydateid') || f.includes('productid') || f.includes('limitationtimes') || f.includes('displayorder') || f.includes('below') || f.includes('pagesize') || f.includes('numericiso') || f.includes('ageto')) return 'int';
  if (/^(is|has|allow|disable|published|deleted|active|required|cumulative|returnable|exempt|separately|individually|preselected|usepercentage|usemultiple|available|markasne|customerenter|displaystock|subject|limited|freeshippin|taxexempt|issystem|override|ageverif)/.test(f) || f.includes('bool')) return 'bool';
  if (f.includes('xml') || f.includes('attributes') || f.includes('description') || f.includes('comment') || f.includes('name') || f.includes('sku') || f.includes('code') || f.includes('email') || f.includes('url') || f.includes('slug') || f.includes('path') || f.includes('phone') || f.includes('number') || f.includes('keyword') || f.includes('title') || f.includes('gtin') || f.includes('mime') || f.includes('locale') || f.includes('culture') || f.includes('seo') || f.includes('host') || f.includes('vat') || f.includes('ip') || f.includes('abbreviation') || f.includes('rgb') || f.includes('system') || f.includes('message') || f.includes('note') || f.includes('reason') || f.includes('action') || f.includes('currency') || f.includes('status') || f.includes('type')) return 'string';
  if (f.includes('binary') || f.includes('data')) return 'byte[]';
  return 'string';
}

function renderFieldTable(versionKey, fields, query, otherFields) {
  if (!fields || fields.length === 0) return `<div class="small-muted">No version-specific fields (see endpoint description).</div>`;
  const otherSet = new Set();
  if (otherFields && Array.isArray(otherFields)) otherFields.forEach(f => otherSet.add(`${f.table}|${f.field}`));
  const showDiffs = document.body.classList.contains("show-diffs");
  const contractBadge = (c) => {
    if (!c) return '<span class="badge badge-nop-internal">—</span>';
    switch(c) {
      case 'ns-required': return '<span class="badge badge-ns-required">ERP Required</span>';
      case 'ns-optional': return '<span class="badge badge-ns-optional">ERP Optional</span>';
      case 'nop-internal': return '<span class="badge badge-nop-internal">Nop Internal</span>';
      case 'auto-generated': return '<span class="badge badge-auto-generated">Auto-Gen</span>';
      default: return '<span class="badge badge-nop-internal">—</span>';
    }
  };
  const rows = fields.map(f => {
    const tbl = highlight(f.table, query), fld = highlight(f.field, query);
    const notes = f.notes ? highlight(f.notes, query) : "";
    const typeVal = f.type ? escapeHtml(f.type) : escapeHtml(inferType(f.field));
    const isDiff = showDiffs && otherFields && Array.isArray(otherFields) && !otherSet.has(`${f.table}|${f.field}`);
    const rowClass = (f.contract === 'nop-internal' || f.contract === 'auto-generated') ? 'row-nop-internal' : '';
    return `<tr class="${isDiff?'field-diff':''} ${rowClass}"><td class="${f.required?"field-required":""}">${tbl}</td><td class="${f.required?"field-required":""}">${fld}</td><td class="col-type mono">${typeVal}</td><td>${f.required?'<span class="badge badge-required">required</span>':'<span class="badge badge-optional">optional</span>'}</td><td class="col-contract">${contractBadge(f.contract)}</td><td class="small-muted">${notes}</td></tr>`;
  }).join("");
  return `<div class="table-responsive"><table class="table table-sm align-middle field-table"><thead><tr><th>Table</th><th>Field</th><th class="col-type">Type</th><th>Req</th><th class="col-contract">NS Contract</th><th>Notes</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

function renderVersionPane(ver) {
  if (!ver) return '';
  let c = '';
  if (ver.request) {
    c += ver.request.comment ? `<div class="payload-comment">${escapeHtml(ver.request.comment)}</div>` : '';
    c += ver.request.headers ? `<h6>Request headers</h6><pre>${escapeHtml(ver.request.headers)}</pre>` : '';
    c += ver.request.body ? `<h6>Request body</h6><pre>${escapeHtml(ver.request.body)}</pre>` : '';
  }
  if (ver.response) {
    c += ver.response.comment ? `<div class="payload-comment">Response: ${escapeHtml(ver.response.comment)}</div>` : '';
    c += ver.response.body ? `<pre>${escapeHtml(ver.response.body)}</pre>` : '';
  }
  return c;
}

function buildCurl(ep) {
  let c = `curl -X ${ep.method} 'https://shop.example.com${ep.path.split('?')[0]}' \\\n  -H 'X-Integration-Key: sk_live_YOUR_KEY' \\\n  -H 'Content-Type: application/json'`;
  if (ep.idempotencyRequired && ep.idempotencyRecipe) c += ` \\\n  -H 'Idempotency-Key: ${ep.idempotencyRecipe}'`;
  // Try old format first, then new format
  const ex = ep.examplePayloads;
  if (ex && ex["4.60"] && typeof ex["4.60"]==='object' && ex["4.60"].request && ex["4.60"].request.body) {
    c += ` \\\n  -d '${ex["4.60"].request.body.replace(/\n/g,'').replace(/\s{2,}/g,' ')}'`;
  } else {
    const key = _getPayloadKey(ep);
    const pe = _payloadExamples[key];
    if (pe) {
      const reqBody = pe.req_460 || pe.req;
      if (reqBody) c += ` \\\n  -d '${reqBody.replace(/\n/g,'').replace(/\s{2,}/g,' ')}'`;
    }
  }
  return c;
}


function _getPayloadKey(ep) {
  // Normalize the path: strip query params and reduce to template
  const p = ep.path.split('?')[0];
  return `${ep.method} ${p}`;
}

function renderExamplePayloads(ep, fnKey, idx) {
  const key = _getPayloadKey(ep);
  const ex = ep.examplePayloads || _payloadExamples[key];
  if (!ex) return '';

  const blockId = `payload-${fnKey}-${idx}`;

  // Support both old format (ep.examplePayloads with "4.60"/"4.90") and new format (flat req/resp/req_460/req_490)
  let pane460 = '', pane490 = '', isIdentical = false;

  if (ex["4.60"] || ex["4.90"]) {
    // Old format: ep.examplePayloads with version keys
    const v460 = ex["4.60"], v490raw = ex["4.90"];
    isIdentical = v490raw === "same";
    const v490 = isIdentical ? v460 : v490raw;
    pane460 = renderVersionPane(v460);
    pane490 = isIdentical ? pane460 : renderVersionPane(v490);
  } else {
    // New flat format from _payloadExamples
    const req460 = ex.req_460 || ex.req;
    const req490 = ex.req_490 || ex.req;
    const resp460 = ex.resp_460 || ex.resp;
    const resp490 = ex.resp_490 || ex.resp;
    isIdentical = (req460 === req490) && (resp460 === resp490);

    const buildPane = (req, resp) => {
      let c = '';
      if (req) { c += `<h6>Request body</h6><pre>${escapeHtml(req)}</pre>`; }
      if (resp) { c += `<div class="payload-comment">Response: 200 OK</div><pre>${escapeHtml(resp)}</pre>`; }
      return c;
    };
    pane460 = buildPane(req460, resp460);
    pane490 = buildPane(req490, resp490);
  }

  const identicalNote = isIdentical ? '<div class="payload-identical-note">✔ Payloads are identical across 4.60 and 4.90.</div>' : '';
  const curlCmd = buildCurl(ep);
  const curlBtn = `<button class="btn btn-outline-secondary copy-curl-btn ms-2" onclick="navigator.clipboard.writeText(this.dataset.curl).then(()=>{this.textContent='Copied!';this.classList.add('copied');setTimeout(()=>{this.textContent='Copy cURL';this.classList.remove('copied')},1500)})" data-curl="${escapeHtml(curlCmd)}">Copy cURL</button>`;
  return `<div class="col-12">
    <button class="btn btn-sm btn-outline-primary example-payload-toggle" type="button" onclick="var b=document.getElementById('${blockId}');b.classList.toggle('open');this.textContent=b.classList.contains('open')?'Hide example payloads':'Show example payloads'">Show example payloads</button>${curlBtn}
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

window._switchPayloadTab = function(btn, blockId, ver) {
  const block = document.getElementById(blockId);
  block.querySelectorAll('.payload-ver-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  block.querySelectorAll('.payload-ver-pane').forEach(p => p.classList.remove('active'));
  document.getElementById(blockId + '-' + ver).classList.add('active');
};