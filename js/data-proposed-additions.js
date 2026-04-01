// data-proposed-additions.js — Proposed endpoint additions pending team approval
// Auto-extracted from monolithic HTML

// ============================================================
// PROPOSED ADDITIONS — Pending Team Approval
// These were generated from team feedback and are NOT yet part
// of the approved spec. They appear in a visually distinct
// section for team review.
// ============================================================
const proposedAdditions = [
  // ==========================================================
  // PROPOSAL 5: DEFAULT PUBLISHED STATE + PUBLISHING CONTROLS
  // Feedback: "Automatic publishing does raise quality concerns"
  // "Dual approval before publishing remains essential"
  // ==========================================================
  {
    key: "proposed-publishing-controls",
    title: "Publishing controls & defaults",
    feedbackSource: "Theresa Feedback — Publishing controls & capacity",
    description: "This proposal adds a configurable default for the Published state when products are created via the API, and strengthens the approval workflow to support a separate publish-approval step. Currently, if a product upsert includes published: true and approval is disabled, the product goes live immediately. This is a risk when products require editing, enrichment, image checks, and description formatting before going live. This proposal covers: (1) a plugin setting DefaultPublishedStateOnCreate (default: false), (2) documentation that dual-approval is supported, and (3) a dedicated publish/unpublish endpoint.",
    rationale: "Product management currently accounts for ~70-80% of daily workload. A large portion of products require editing before going live. Auto-publishing risks rushed or inconsistent listings. The default should be unpublished, with explicit publish actions requiring approval.",
    endpoints: [
      {
        method: "POST",
        path: "/api/integration/v1/items/by-sku/{sku}/publish",
        direction: "admin / internal",
        scope: "items.write",
        idempotencyRequired: true,
        idempotencyRecipe: "NS:Publish:{sku}:{publishedState}:{utcNow}",
        approvalRequired: true,
        purpose: "Explicitly publish or unpublish a product by SKU. This is the recommended way to control product visibility after creation — separate from the data upsert. When approval is enabled, this creates a dedicated PUBLISH-type Acgs_PendingChange that only changes the Published field, making it easy for approvers to distinguish data changes from publish decisions. Supports a 'reason' field for audit trail (e.g. 'Images approved, descriptions checked by merchandising').",
        versionNotes: [
          "This is a separate action from the product upsert — it only changes Product.Published.",
          "When approval is enabled, creates an Acgs_PendingChange with EntityType='ProductPublish' — distinct from 'Product' changes.",
          "This supports dual-approval workflows: one approval for data changes, a separate approval for publishing.",
          "The plugin setting DefaultPublishedStateOnCreate (default: false) means all new products created via API start as unpublished.",
          "To override the default on creation, explicitly include published: true in the upsert — but this will be staged for approval if approval is enabled.",
          "The reason field is stored in Acgs_PendingChange.ReviewNotes for audit trail."
        ],
        fields: {
          "4.60": [
            { table: "Product", field: "SKU (from path)", required: true, type: "string" },
            { table: "(request body)", field: "published", required: true, type: "bool", notes: "true = publish, false = unpublish" },
            { table: "(request body)", field: "reason", required: false, type: "string", notes: "Audit trail reason e.g. 'Approved by merchandising team'" },
            { table: "Product", field: "Published", required: true, notes: "Updated on approval" },
            { table: "Acgs_PendingChange", field: "EntityType='ProductPublish'", required: false, notes: "Separate from data changes for dual-approval" }
          ],
          "4.90": [
            { table: "Product", field: "Sku (from path)", required: true, type: "string" },
            { table: "(request body)", field: "published", required: true, type: "bool", notes: "true = publish, false = unpublish" },
            { table: "(request body)", field: "reason", required: false, type: "string", notes: "Audit trail reason e.g. 'Approved by merchandising team'" },
            { table: "Product", field: "Published", required: true, notes: "Updated on approval" },
            { table: "Acgs_PendingChange", field: "EntityType='ProductPublish'", required: false, notes: "Separate from data changes for dual-approval" }
          ]
        }
      }
    ]
  },

  // ==========================================================
  // PROPOSAL 6: PRODUCT PLACEMENT (DISPLAY ORDER HELPER)
  // Feedback: "A structured field such as 'Place After
  // Product/SKU' could assist with more controlled placement"
  // ==========================================================
  {
    key: "proposed-display-order",
    title: "Product placement (display order orchestration)",
    feedbackSource: "Theresa Feedback — Product placement",
    description: "This is a documentation/pattern proposal rather than a new endpoint. The existing category mapping endpoint already supports displayOrder. However, the team requested a 'Place After Product/SKU' concept for more controlled placement. This is best handled as a middleware orchestration pattern: (1) Call GET /items/by-sku/{targetSku}/categories to get the target product's display order, (2) Set the new product's display order to target + 1, (3) Optionally bump subsequent products. The API itself does not need a new endpoint — this section documents the recommended pattern.",
    rationale: "Display order is already available on category mappings. The 'place after SKU' logic is business orchestration that belongs in middleware, not in the API itself. Documenting this pattern helps the team understand how to achieve controlled placement.",
    endpoints: [
      {
        method: "PUT",
        path: "/api/integration/v1/items/by-sku/{sku}/categories (existing — enhanced documentation)",
        direction: "NetSuite → nop (push/upsert)",
        scope: "items.write",
        idempotencyRequired: true,
        idempotencyRecipe: "NS:ItemCat:{externalItemId}:{categorySetHash}:{lastModifiedUtc}",
        approvalRequired: true,
        purpose: "[EXISTING ENDPOINT — enhanced documentation] The existing PUT /items/by-sku/{sku}/categories endpoint already supports displayOrder per category assignment. For 'Place After SKU' behaviour, middleware should: (1) GET /items/by-sku/{targetSku}/categories to read the target's displayOrder per category, (2) Set the new product's displayOrder = target.displayOrder + 1 in the PUT request, (3) Optionally fetch other products in the same category and increment their displayOrder if they would collide. This pattern avoids adding complexity to the API while supporting controlled placement.",
        versionNotes: [
          "This is NOT a new endpoint — it documents a middleware orchestration pattern using existing endpoints.",
          "The displayOrder field on categories[] already supports this use case.",
          "Middleware should handle the 'place after' logic because it involves reading current state and computing new values — server-side would require a transaction lock on the entire category's products.",
          "For procurement ticket placement requirements, middleware can read the ticket's 'place after' instruction, resolve it to a displayOrder value, and include it in the category assignment payload."
        ],
        fields: { "4.60": [], "4.90": [] }
      }
    ]
  },


];