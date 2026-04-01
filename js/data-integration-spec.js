// data-integration-spec.js — Main endpoint specification data
// Auto-extracted from monolithic HTML


// ============================================================
// DATA — Aligned to Master Spec Parts 1–8
// Route prefix: /api/integration/v1
// ============================================================
const integrationSpec = [


  // ==========================================================
  // 0) META / OPERATIONS
  // ==========================================================
  {
    key: "meta",
    title: "Meta / operations",
    description: "Health checks, capability discovery, and approval workflow endpoints used by middleware and admin.",
    endpoints: [
      {
        method: "GET",
        path: "/api/integration/v1/meta/ping",
        direction: "middleware → nop (health check)",
        scope: "meta.read",
        idempotencyRequired: false,
        approvalRequired: false,
        purpose: "Proves auth works. Returns plugin version, API version, nop version, storeId, and current UTC time.",
        versionNotes: ["Minimal payload; always returns canonical envelope."],
        fields: { "4.60": [], "4.90": [] }
      },
      {
        method: "GET",
        path: "/api/integration/v1/meta/capabilities",
        direction: "middleware → nop (discovery)",
        scope: "meta.read",
        idempotencyRequired: false,
        approvalRequired: false,
        purpose: "Returns feature flags per module (items, inventory, pricing, orders, returns, vouchers, rfq, quotes, offlineTransactions), approval settings, and active provider modes.",
        versionNotes: ["Response shape defined in Part 4 §4.8.1."],
        fields: { "4.60": [], "4.90": [] }
      },
      {
        method: "GET",
        path: "/api/integration/v1/approvals?status=PENDING&entityType={type}",
        direction: "admin / internal",
        scope: "approvals.read",
        idempotencyRequired: false,
        approvalRequired: false,
        purpose: "List pending approval changes (staged product/pricing/voucher updates). Supports pagination and filtering by entityType, status, date range.",
        versionNotes: ["Reads from plugin table Acgs_PendingChange."],
        fields: {
          "4.60": [
            { table: "Acgs_PendingChange", field: "PendingChangeNumber", required: true },
            { table: "Acgs_PendingChange", field: "EntityType", required: true },
            { table: "Acgs_PendingChange", field: "EntityKey", required: true },
            { table: "Acgs_PendingChange", field: "Status", required: true },
            { table: "Acgs_PendingChange", field: "SubmittedOnUtc", required: true }
          ],
          "4.90": [
            { table: "Acgs_PendingChange", field: "PendingChangeNumber", required: true },
            { table: "Acgs_PendingChange", field: "EntityType", required: true },
            { table: "Acgs_PendingChange", field: "EntityKey", required: true },
            { table: "Acgs_PendingChange", field: "Status", required: true },
            { table: "Acgs_PendingChange", field: "SubmittedOnUtc", required: true }
          ]
        }
      },
      {
        method: "GET",
        path: "/api/integration/v1/approvals/{pendingChangeId}",
        direction: "admin / internal",
        scope: "approvals.read",
        idempotencyRequired: false,
        approvalRequired: false,
        purpose: "Get full detail of a pending change including field-level diffs (Acgs_PendingChangeField) and raw payload.",
        versionNotes: [],
        fields: { "4.60": [], "4.90": [] }
      },
      {
        method: "POST",
        path: "/api/integration/v1/approvals/{pendingChangeId}/approve",
        direction: "admin / internal",
        scope: "approvals.write",
        idempotencyRequired: true,
        idempotencyRecipe: "Approval:{pendingChangeId}:approve",
        approvalRequired: false,
        purpose: "Approve a pending change. Triggers the apply pipeline (updates live nop entity via nop services).",
        versionNotes: ["Returns APPLIED on success, FAILED + error on exception. Retryable."],
        fields: { "4.60": [], "4.90": [] }
      },
      {
        method: "POST",
        path: "/api/integration/v1/approvals/{pendingChangeId}/reject",
        direction: "admin / internal",
        scope: "approvals.write",
        idempotencyRequired: true,
        idempotencyRecipe: "Approval:{pendingChangeId}:reject",
        approvalRequired: false,
        purpose: "Reject a pending change with a required rejection reason.",
        versionNotes: [],
        fields: { "4.60": [], "4.90": [] }
      }
    ]
  },

  // ==========================================================
  // 1) ITEM RECORDS
  // ==========================================================
  {
    key: "item-records",
    title: "Item records",
    description: "Product master data: upsert products by SKU, read product lists. Includes category assignment, vendor/manufacturer assignment, attribute/variant management, image management, SEO slug management, and a composite full-sync endpoint for atomic product creation.",
    endpoints: [
      {
        method: "GET",
        path: "/api/integration/v1/items?page={p}&pageSize={n}&updatedSinceUtc={utc}&publishedOnly={bool}&includeDeleted={bool}",
        direction: "nop → middleware/NetSuite (pull)",
        scope: "items.read",
        idempotencyRequired: false,
        approvalRequired: false,
        purpose: "Pull paginated product list for reconciliation or incremental sync.",
        versionNotes: [
          "SKU column: 4.60 = Product.SKU, 4.90 = Product.Sku.",
          "4.60 includes HasTierPrices, HasDiscountsApplied (computed flags). 4.90 adds AgeVerification, MinimumAgeToPurchase."
        ],
        fields: {
          "4.60": [
            { table: "Product", field: "Id", required: true },
            { table: "Product", field: "SKU", required: true, notes: "4.60 column name" },
            { table: "Product", field: "Name", required: true },
            { table: "Product", field: "Published", required: true },
            { table: "Product", field: "Deleted", required: true },
            { table: "Product", field: "Price", required: false },
            { table: "Product", field: "OldPrice", required: false },
            { table: "Product", field: "ProductCost", required: false },
            { table: "Product", field: "StockQuantity", required: false },
            { table: "Product", field: "UseMultipleWarehouses", required: false },
            { table: "Product", field: "WarehouseId", required: false },
            { table: "Product", field: "ManageInventoryMethodId", required: false },
            { table: "Product", field: "UpdatedOnUtc", required: true }
          ],
          "4.90": [
            { table: "Product", field: "Id", required: true },
            { table: "Product", field: "Sku", required: true, notes: "4.90 column name" },
            { table: "Product", field: "Name", required: true },
            { table: "Product", field: "Published", required: true },
            { table: "Product", field: "Deleted", required: true },
            { table: "Product", field: "Price", required: false },
            { table: "Product", field: "OldPrice", required: false },
            { table: "Product", field: "ProductCost", required: false },
            { table: "Product", field: "StockQuantity", required: false },
            { table: "Product", field: "UseMultipleWarehouses", required: false },
            { table: "Product", field: "WarehouseId", required: false },
            { table: "Product", field: "ManageInventoryMethodId", required: false },
            { table: "Product", field: "UpdatedOnUtc", required: true }
          ]
        }
      },
      {
        method: "GET",
        path: "/api/integration/v1/items/by-sku/{sku}",
        direction: "middleware/NetSuite → nop (pull)",
        scope: "items.read",
        idempotencyRequired: false,
        approvalRequired: false,
        purpose: "Get full product detail by SKU. Returns canonical product payload including descriptions, shipping, tax, inventory, lifecycle, and meta fields.",
        versionNotes: [
          "Returns 404 ITEM_NOT_FOUND if SKU does not exist.",
          "The {sku} path value identifies the parent/base product SKU (Product.Sku), not a ProductAttributeCombination SKU. For products with variants, use the parent SKU here and query child variants via GET /items/by-sku/{sku}/combinations."
        ],
        fields: {
          "4.60": [
            { table: "Product", field: "Id", required: true },
            { table: "Product", field: "SKU", required: true },
            { table: "Product", field: "Name", required: true },
            { table: "Product", field: "ShortDescription", required: false },
            { table: "Product", field: "FullDescription", required: false },
            { table: "Product", field: "AdminComment", required: false },
            { table: "Product", field: "ManufacturerPartNumber", required: false },
            { table: "Product", field: "Gtin", required: false },
            { table: "Product", field: "Price", required: false },
            { table: "Product", field: "OldPrice", required: false },
            { table: "Product", field: "ProductCost", required: false },
            { table: "Product", field: "CustomerEntersPrice", required: false },
            { table: "Product", field: "ManageInventoryMethodId", required: false },
            { table: "Product", field: "StockQuantity", required: false },
            { table: "Product", field: "UseMultipleWarehouses", required: false },
            { table: "Product", field: "WarehouseId", required: false },
            { table: "Product", field: "MinStockQuantity", required: false },
            { table: "Product", field: "BackorderModeId", required: false },
            { table: "Product", field: "IsShipEnabled", required: false },
            { table: "Product", field: "IsFreeShipping", required: false },
            { table: "Product", field: "AdditionalShippingCharge", required: false },
            { table: "Product", field: "Weight", required: false },
            { table: "Product", field: "Length", required: false },
            { table: "Product", field: "Width", required: false },
            { table: "Product", field: "Height", required: false },
            { table: "Product", field: "ShipSeparately", required: false },
            { table: "Product", field: "IsTaxExempt", required: false },
            { table: "Product", field: "TaxCategoryId", required: false },
            { table: "Product", field: "Published", required: false },
            { table: "Product", field: "Deleted", required: false },
            { table: "Product", field: "AvailableStartDateTimeUtc", required: false },
            { table: "Product", field: "AvailableEndDateTimeUtc", required: false },
            { table: "Product", field: "MarkAsNew", required: false },
            { table: "Product", field: "MetaKeywords", required: false },
            { table: "Product", field: "MetaTitle", required: false },
            { table: "Product", field: "MetaDescription", required: false },
            { table: "Product", field: "VendorId", required: false, notes: "FK to Vendor table" },
            { table: "Acgs_ExternalReference", field: "ExternalId (NetSuite Item)", required: false }
          ],
          "4.90": [
            { table: "Product", field: "Id", required: true },
            { table: "Product", field: "Sku", required: true },
            { table: "Product", field: "Name", required: true },
            { table: "Product", field: "ShortDescription", required: false },
            { table: "Product", field: "FullDescription", required: false },
            { table: "Product", field: "AdminComment", required: false },
            { table: "Product", field: "ManufacturerPartNumber", required: false },
            { table: "Product", field: "Gtin", required: false },
            { table: "Product", field: "Price", required: false },
            { table: "Product", field: "OldPrice", required: false },
            { table: "Product", field: "ProductCost", required: false },
            { table: "Product", field: "CustomerEntersPrice", required: false },
            { table: "Product", field: "ManageInventoryMethodId", required: false },
            { table: "Product", field: "StockQuantity", required: false },
            { table: "Product", field: "UseMultipleWarehouses", required: false },
            { table: "Product", field: "WarehouseId", required: false },
            { table: "Product", field: "MinStockQuantity", required: false },
            { table: "Product", field: "BackorderModeId", required: false },
            { table: "Product", field: "IsShipEnabled", required: false },
            { table: "Product", field: "IsFreeShipping", required: false },
            { table: "Product", field: "AdditionalShippingCharge", required: false },
            { table: "Product", field: "Weight", required: false },
            { table: "Product", field: "Length", required: false },
            { table: "Product", field: "Width", required: false },
            { table: "Product", field: "Height", required: false },
            { table: "Product", field: "ShipSeparately", required: false },
            { table: "Product", field: "IsTaxExempt", required: false },
            { table: "Product", field: "TaxCategoryId", required: false },
            { table: "Product", field: "Published", required: false },
            { table: "Product", field: "Deleted", required: false },
            { table: "Product", field: "AvailableStartDateTimeUtc", required: false },
            { table: "Product", field: "AvailableEndDateTimeUtc", required: false },
            { table: "Product", field: "MarkAsNew", required: false },
            { table: "Product", field: "MetaKeywords", required: false },
            { table: "Product", field: "MetaTitle", required: false },
            { table: "Product", field: "MetaDescription", required: false },
            { table: "Product", field: "AgeVerification", required: false, notes: "4.90 only" },
            { table: "Product", field: "MinimumAgeToPurchase", required: false, notes: "4.90 only" },
            { table: "Product", field: "VendorId", required: false, notes: "FK to Vendor table" },
            { table: "Acgs_ExternalReference", field: "ExternalId (NetSuite Item)", required: false }
          ]
        }
      },
      {
        method: "PUT",
        path: "/api/integration/v1/items/by-sku/{sku}",
        direction: "NetSuite → nop (push/upsert)",
        scope: "items.write",
        isNew: true,
        newLabel: "Updated in v1.6.1",
        idempotencyRequired: true,
        idempotencyRecipe: "NS:Item:{externalItemId}:{lastModifiedUtc}",
        approvalRequired: true,
        purpose: "Upsert product by SKU. If approval is enabled, the change is staged in Acgs_PendingChange and returns 202 PENDING_APPROVAL. If approval is disabled, the change is applied immediately via IProductService and returns 200 OK. This endpoint does not create related entities such as categories, attributes, combinations, images, vendors, or manufacturers; use the dedicated sub-resource endpoints or the composite full-sync endpoint for those.",
        versionNotes: [
          "Canonical request body defined in Part 6 §6.3.2.1 (ItemUpsertRequest schema).",
          "Covers: name, single-language descriptions, identifiers, pricing, inventory, shipping, tax, lifecycle, meta, externalReferences, and storefront display controls.",
          "Replaces old POST /items (create) and PUT /items/{skuOrId} (update) — single upsert endpoint.",
          "The {sku} path value identifies the parent/base product SKU. Do not pass a variant or combination SKU here; create and maintain child SKUs through /items/by-sku/{sku}/combinations or /items/by-sku/{sku}/full-sync.",
          "This endpoint does not create or update UrlRecord (SEO slug); use PUT /items/by-sku/{sku}/seo-slug or full-sync.",
          "This endpoint does not set VendorId or manufacturer mappings; use the vendor/manufacturer endpoints or full-sync.",
          "Single-language contract: name, shortDescription, fullDescription, and meta fields represent one live storefront value. Localized translation arrays are intentionally out of scope in v1.6.1.",
          "For existing products, omitted optional scalar fields remain unchanged. For new products, omitted optional scalar fields fall back to nop defaults.",
          "Use null only to clear optional scalar/date/text fields where supported. Sending null for required or non-nullable fields, or for related collections and mapped entities, returns 422 VALIDATION_ERROR.",
          "For creating a complete product with variants, images, categories, and manufacturer in one call, use PUT /items/by-sku/{sku}/full-sync instead."
        ],
        fields: {
          "4.60": [
            { table: "Product", field: "SKU (from path)", required: true },
            { table: "Product", field: "Name", required: true },
            { table: "Product", field: "Published", required: true },
            { table: "Product", field: "Deleted", required: true },
            { table: "Product", field: "ProductTypeId", required: false, notes: "Default: 5 (Simple)" },
            { table: "Product", field: "ProductTemplateId", required: false, notes: "Default: 1 (Simple)" },
            { table: "Product", field: "VisibleIndividually", required: false, notes: "Default: true" },
            { table: "Product", field: "ShortDescription", required: false },
            { table: "Product", field: "FullDescription", required: false },
            { table: "Product", field: "AdminComment", required: false },
            { table: "Product", field: "ManufacturerPartNumber", required: false },
            { table: "Product", field: "Gtin", required: false },
            { table: "Product", field: "Price", required: false },
            { table: "Product", field: "OldPrice", required: false },
            { table: "Product", field: "ProductCost", required: false },
            { table: "Product", field: "CustomerEntersPrice/MinimumCustomerEnteredPrice/MaximumCustomerEnteredPrice", required: false },
            { table: "Product", field: "ManageInventoryMethodId", required: false },
            { table: "Product", field: "UseMultipleWarehouses", required: false },
            { table: "Product", field: "WarehouseId", required: false },
            { table: "Product", field: "StockQuantity", required: false },
            { table: "Product", field: "DisplayStockAvailability/DisplayStockQuantity", required: false },
            { table: "Product", field: "MinStockQuantity", required: false },
            { table: "Product", field: "LowStockActivityId/NotifyAdminForQuantityBelow", required: false },
            { table: "Product", field: "BackorderModeId", required: false },
            { table: "Product", field: "AllowBackInStockSubscriptions", required: false },
            { table: "Product", field: "OrderMinimumQuantity/OrderMaximumQuantity/AllowedQuantities", required: false },
            { table: "Product", field: "AllowAddingOnlyExistingAttributeCombinations", required: false },
            { table: "Product", field: "AllowCustomerReviews", required: false, notes: "Default: true" },
            { table: "Product", field: "DisableBuyButton/DisableWishlistButton", required: false },
            { table: "Product", field: "AvailableForPreOrder/CallForPrice", required: false },
            { table: "Product", field: "IsShipEnabled", required: false },
            { table: "Product", field: "IsFreeShipping", required: false },
            { table: "Product", field: "ShipSeparately", required: false },
            { table: "Product", field: "AdditionalShippingCharge", required: false },
            { table: "Product", field: "DeliveryDateId", required: false },
            { table: "Product", field: "Weight/Length/Width/Height", required: false },
            { table: "Product", field: "IsTaxExempt", required: false },
            { table: "Product", field: "TaxCategoryId", required: false },
            { table: "Product", field: "AvailableStartDateTimeUtc/AvailableEndDateTimeUtc", required: false },
            { table: "Product", field: "MarkAsNew/MarkAsNewStartDateTimeUtc/MarkAsNewEndDateTimeUtc", required: false },
            { table: "Product", field: "MetaKeywords/MetaTitle/MetaDescription", required: false },
            { table: "Product", field: "BasepriceEnabled/BasepriceAmount/BasepriceUnitId/BasepriceBaseAmount/BasepriceBaseUnitId", required: false },
            { table: "Product", field: "NotReturnable", required: false },
            { table: "Product", field: "HasTierPrices/HasDiscountsApplied", required: false, notes: "4.60 computed flags" },
            { table: "Acgs_ExternalReference", field: "ExternalSystem/ExternalType/ExternalId", required: false },
            { table: "Acgs_PendingChange", field: "(staged if approval enabled)", required: false }
          ],
          "4.90": [
            { table: "Product", field: "Sku (from path)", required: true },
            { table: "Product", field: "Name", required: true },
            { table: "Product", field: "Published", required: true },
            { table: "Product", field: "Deleted", required: true },
            { table: "Product", field: "ProductTypeId", required: false, notes: "Default: 5 (Simple)" },
            { table: "Product", field: "ProductTemplateId", required: false, notes: "Default: 1 (Simple)" },
            { table: "Product", field: "VisibleIndividually", required: false, notes: "Default: true" },
            { table: "Product", field: "ShortDescription", required: false },
            { table: "Product", field: "FullDescription", required: false },
            { table: "Product", field: "AdminComment", required: false },
            { table: "Product", field: "ManufacturerPartNumber", required: false },
            { table: "Product", field: "Gtin", required: false },
            { table: "Product", field: "Price", required: false },
            { table: "Product", field: "OldPrice", required: false },
            { table: "Product", field: "ProductCost", required: false },
            { table: "Product", field: "CustomerEntersPrice/MinimumCustomerEnteredPrice/MaximumCustomerEnteredPrice", required: false },
            { table: "Product", field: "ManageInventoryMethodId", required: false },
            { table: "Product", field: "UseMultipleWarehouses", required: false },
            { table: "Product", field: "WarehouseId", required: false },
            { table: "Product", field: "StockQuantity", required: false },
            { table: "Product", field: "DisplayStockAvailability/DisplayStockQuantity", required: false },
            { table: "Product", field: "MinStockQuantity", required: false },
            { table: "Product", field: "LowStockActivityId/NotifyAdminForQuantityBelow", required: false },
            { table: "Product", field: "BackorderModeId", required: false },
            { table: "Product", field: "AllowBackInStockSubscriptions", required: false },
            { table: "Product", field: "OrderMinimumQuantity/OrderMaximumQuantity/AllowedQuantities", required: false },
            { table: "Product", field: "AllowAddingOnlyExistingAttributeCombinations", required: false },
            { table: "Product", field: "DisplayAttributeCombinationImagesOnly", required: false, notes: "4.90 only" },
            { table: "Product", field: "AllowCustomerReviews", required: false, notes: "Default: true" },
            { table: "Product", field: "DisableBuyButton/DisableWishlistButton", required: false },
            { table: "Product", field: "AvailableForPreOrder/CallForPrice", required: false },
            { table: "Product", field: "IsShipEnabled", required: false },
            { table: "Product", field: "IsFreeShipping", required: false },
            { table: "Product", field: "ShipSeparately", required: false },
            { table: "Product", field: "AdditionalShippingCharge", required: false },
            { table: "Product", field: "DeliveryDateId", required: false },
            { table: "Product", field: "Weight/Length/Width/Height", required: false },
            { table: "Product", field: "IsTaxExempt", required: false },
            { table: "Product", field: "TaxCategoryId", required: false },
            { table: "Product", field: "AvailableStartDateTimeUtc/AvailableEndDateTimeUtc", required: false },
            { table: "Product", field: "MarkAsNew/MarkAsNewStartDateTimeUtc/MarkAsNewEndDateTimeUtc", required: false },
            { table: "Product", field: "MetaKeywords/MetaTitle/MetaDescription", required: false },
            { table: "Product", field: "AgeVerification/MinimumAgeToPurchase", required: false, notes: "4.90 only" },
            { table: "Product", field: "BasepriceEnabled/BasepriceAmount/BasepriceUnitId/BasepriceBaseAmount/BasepriceBaseUnitId", required: false },
            { table: "Product", field: "NotReturnable", required: false },
            { table: "Acgs_ExternalReference", field: "ExternalSystem/ExternalType/ExternalId", required: false },
            { table: "Acgs_PendingChange", field: "(staged if approval enabled)", required: false }
          ]
        }
      },
      {
        method: "PATCH",
        path: "/api/integration/v1/items/by-sku/{sku}",
        direction: "NetSuite/supplier → nop (push/partial)",
        scope: "items.write",
        isNew: true,
        newLabel: "Updated in v1.6.1",
        idempotencyRequired: true,
        idempotencyRecipe: "NS:ItemPatch:{externalItemId}:{fieldSetHash}:{lastModifiedUtc}",
        approvalRequired: true,
        purpose: "Partial update — only provided fields are updated/staged. Same approval behavior as PUT upsert. Useful when supplier feed updates only stock or cost. This is also the recommended endpoint for soft-deleting products (send { \"deleted\": true }) — no dedicated DELETE verb endpoint exists by design.",
        versionNotes: [
          "Same field mapping as PUT upsert; only supplied fields are applied.",
          "The {sku} path value identifies the parent/base product SKU. Do not use a variant or combination SKU on this endpoint; child SKUs are managed through the combinations and full-sync routes.",
          "Single-language contract: supplied content fields overwrite the single live storefront value. Localized translation payloads are not defined in this version.",
          "Omitted fields remain unchanged.",
          "Use null only to clear optional scalar/date/text fields where supported. Empty string may be used to clear optional free-text fields such as AdminComment and meta text.",
          "Related collections and mapped entities are not changed here; use dedicated sub-resource endpoints or full-sync for categories, images, combinations, tags, specifications, and store mappings.",
          "Recommended for soft-delete: PATCH with { \"deleted\": true } deactivates the product without removing data.",
          "To unpublish without deleting: PATCH with { \"published\": false }."
        ],
        fields: {
          "4.60": [
            { table: "Product", field: "SKU (from path)", required: true, type: "string" },
            { table: "Product", field: "Name", required: false, type: "string" },
            { table: "Product", field: "Published", required: false, type: "bool" },
            { table: "Product", field: "Deleted", required: false, type: "bool", notes: "Send true for soft-delete" },
            { table: "Product", field: "ShortDescription/FullDescription/AdminComment", required: false, type: "string" },
            { table: "Product", field: "ManufacturerPartNumber/Gtin", required: false, type: "string" },
            { table: "Product", field: "Price/OldPrice/ProductCost", required: false, type: "decimal" },
            { table: "Product", field: "ManageInventoryMethodId", required: false, type: "int" },
            { table: "Product", field: "StockQuantity", required: false, type: "int" },
            { table: "Product", field: "UseMultipleWarehouses/WarehouseId", required: false },
            { table: "Product", field: "Weight/Length/Width/Height", required: false, type: "decimal" },
            { table: "Product", field: "IsShipEnabled/IsFreeShipping/ShipSeparately", required: false, type: "bool" },
            { table: "Product", field: "IsTaxExempt/TaxCategoryId", required: false },
            { table: "Product", field: "MetaKeywords/MetaTitle/MetaDescription", required: false, type: "string" },
            { table: "Acgs_ExternalReference", field: "ExternalSystem/ExternalType/ExternalId", required: false },
            { table: "Acgs_PendingChange", field: "(staged if approval enabled)", required: false }
          ],
          "4.90": [
            { table: "Product", field: "Sku (from path)", required: true, type: "string" },
            { table: "Product", field: "Name", required: false, type: "string" },
            { table: "Product", field: "Published", required: false, type: "bool" },
            { table: "Product", field: "Deleted", required: false, type: "bool", notes: "Send true for soft-delete" },
            { table: "Product", field: "ShortDescription/FullDescription/AdminComment", required: false, type: "string" },
            { table: "Product", field: "ManufacturerPartNumber/Gtin", required: false, type: "string" },
            { table: "Product", field: "Price/OldPrice/ProductCost", required: false, type: "decimal" },
            { table: "Product", field: "ManageInventoryMethodId", required: false, type: "int" },
            { table: "Product", field: "StockQuantity", required: false, type: "int" },
            { table: "Product", field: "UseMultipleWarehouses/WarehouseId", required: false },
            { table: "Product", field: "Weight/Length/Width/Height", required: false, type: "decimal" },
            { table: "Product", field: "IsShipEnabled/IsFreeShipping/ShipSeparately", required: false, type: "bool" },
            { table: "Product", field: "IsTaxExempt/TaxCategoryId", required: false },
            { table: "Product", field: "AgeVerification/MinimumAgeToPurchase", required: false, notes: "4.90 only" },
            { table: "Product", field: "MetaKeywords/MetaTitle/MetaDescription", required: false, type: "string" },
            { table: "Acgs_ExternalReference", field: "ExternalSystem/ExternalType/ExternalId", required: false },
            { table: "Acgs_PendingChange", field: "(staged if approval enabled)", required: false }
          ]
        }
      },
      // --- Categories sub-domain ---
      {
        method: "GET",
        path: "/api/integration/v1/categories?page={p}&pageSize={n}&parentCategoryId={id}&publishedOnly={bool}",
        direction: "nop → middleware (pull)",
        scope: "items.read",
        idempotencyRequired: false,
        approvalRequired: false,
        purpose: "Pull paginated category list for reconciliation. Includes hierarchy (ParentCategoryId) and display order.",
        versionNotes: ["Category table is consistent across 4.60 and 4.90."],
        fields: {
          "4.60": [
            { table: "Category", field: "Id", required: true },
            { table: "Category", field: "Name", required: true },
            { table: "Category", field: "ParentCategoryId", required: false },
            { table: "Category", field: "Published", required: true },
            { table: "Category", field: "Deleted", required: true },
            { table: "Category", field: "DisplayOrder", required: false },
            { table: "Category", field: "Description", required: false },
            { table: "Category", field: "MetaKeywords/MetaTitle/MetaDescription", required: false },
            { table: "Category", field: "PictureId", required: false },
            { table: "Category", field: "CreatedOnUtc/UpdatedOnUtc", required: false }
          ],
          "4.90": [
            { table: "Category", field: "Id", required: true },
            { table: "Category", field: "Name", required: true },
            { table: "Category", field: "ParentCategoryId", required: false },
            { table: "Category", field: "Published", required: true },
            { table: "Category", field: "Deleted", required: true },
            { table: "Category", field: "DisplayOrder", required: false },
            { table: "Category", field: "Description", required: false },
            { table: "Category", field: "MetaKeywords/MetaTitle/MetaDescription", required: false },
            { table: "Category", field: "PictureId", required: false },
            { table: "Category", field: "CreatedOnUtc/UpdatedOnUtc", required: false }
          ]
        }
      },
      {
        method: "GET",
        path: "/api/integration/v1/items/by-sku/{sku}/categories",
        direction: "nop → middleware (pull)",
        scope: "items.read",
        idempotencyRequired: false,
        approvalRequired: false,
        purpose: "Get all category assignments for a product by SKU. Returns category IDs, names, and display orders from Product_Category_Mapping.",
        versionNotes: [],
        fields: {
          "4.60": [
            { table: "Product", field: "SKU (from path)", required: true },
            { table: "Product_Category_Mapping", field: "ProductId", required: true },
            { table: "Product_Category_Mapping", field: "CategoryId", required: true },
            { table: "Product_Category_Mapping", field: "DisplayOrder", required: false },
            { table: "Product_Category_Mapping", field: "IsFeaturedProduct", required: false },
            { table: "Category", field: "Name (joined)", required: false }
          ],
          "4.90": [
            { table: "Product", field: "Sku (from path)", required: true },
            { table: "Product_Category_Mapping", field: "ProductId", required: true },
            { table: "Product_Category_Mapping", field: "CategoryId", required: true },
            { table: "Product_Category_Mapping", field: "DisplayOrder", required: false },
            { table: "Product_Category_Mapping", field: "IsFeaturedProduct", required: false },
            { table: "Category", field: "Name (joined)", required: false }
          ]
        }
      },
      {
        method: "PUT",
        path: "/api/integration/v1/items/by-sku/{sku}/categories",
        direction: "NetSuite → nop (push/upsert)",
        scope: "items.write",
        idempotencyRequired: true,
        idempotencyRecipe: "NS:ItemCat:{externalItemId}:{categorySetHash}:{lastModifiedUtc}",
        approvalRequired: true,
        purpose: "Set category assignments for a product by SKU. Mode: REPLACE (remove all existing then assign) or MERGE (add missing, keep existing). Uses categoryId or category name for lookup.",
        versionNotes: ["Creates Product_Category_Mapping rows. If approval enabled, stages in Acgs_PendingChange."],
        fields: {
          "4.60": [
            { table: "Product", field: "SKU (from path)", required: true, type: "string" },
            { table: "(request body)", field: "mode", required: false, type: "string", notes: "'REPLACE' (default) or 'MERGE'" },
            { table: "(request body)", field: "categories", required: true, type: "object[]", notes: "Array of category assignments" },
            { table: "categories[]", field: "categoryName", required: true, type: "string", notes: "Server resolves to CategoryId" },
            { table: "categories[]", field: "categoryPath", required: false, type: "string", notes: "Hierarchical path e.g. 'Clothing/Shirts'; auto-creates missing levels" },
            { table: "categories[]", field: "displayOrder", required: false, type: "int" },
            { table: "categories[]", field: "isFeaturedProduct", required: false, type: "bool" },
            { table: "Acgs_PendingChange", field: "(staged if approval enabled)", required: false }
          ],
          "4.90": [
            { table: "Product", field: "Sku (from path)", required: true, type: "string" },
            { table: "(request body)", field: "mode", required: false, type: "string", notes: "'REPLACE' (default) or 'MERGE'" },
            { table: "(request body)", field: "categories", required: true, type: "object[]", notes: "Array of category assignments" },
            { table: "categories[]", field: "categoryName", required: true, type: "string", notes: "Server resolves to CategoryId" },
            { table: "categories[]", field: "categoryPath", required: false, type: "string", notes: "Hierarchical path e.g. 'Clothing/Shirts'; auto-creates missing levels" },
            { table: "categories[]", field: "displayOrder", required: false, type: "int" },
            { table: "categories[]", field: "isFeaturedProduct", required: false, type: "bool" },
            { table: "Acgs_PendingChange", field: "(staged if approval enabled)", required: false }
          ]
        }
      },
      // --- Attributes & combinations sub-domain ---
      {
        method: "GET",
        path: "/api/integration/v1/attributes?page={p}&pageSize={n}",
        direction: "nop → middleware (pull)",
        scope: "items.read",
        idempotencyRequired: false,
        approvalRequired: false,
        purpose: "Pull global product attribute definitions (e.g. Color, Size). These are reusable across products.",
        versionNotes: ["ProductAttribute table is consistent across 4.60 and 4.90."],
        fields: {
          "4.60": [
            { table: "ProductAttribute", field: "Id", required: true },
            { table: "ProductAttribute", field: "Name", required: true },
            { table: "ProductAttribute", field: "Description", required: false }
          ],
          "4.90": [
            { table: "ProductAttribute", field: "Id", required: true },
            { table: "ProductAttribute", field: "Name", required: true },
            { table: "ProductAttribute", field: "Description", required: false }
          ]
        }
      },
      {
        method: "PUT",
        path: "/api/integration/v1/attributes/by-name/{name}",
        direction: "NetSuite → nop (push/upsert)",
        scope: "items.write",
        idempotencyRequired: true,
        idempotencyRecipe: "NS:Attr:{attributeName}:{lastModifiedUtc}",
        approvalRequired: false,
        purpose: "Upsert a global product attribute by name. Creates if not found, updates description if exists.",
        versionNotes: ["Predefined attribute values (PredefinedProductAttributeValue) can optionally be included in the payload."],
        fields: {
          "4.60": [
            { table: "ProductAttribute", field: "Name (from path)", required: true },
            { table: "ProductAttribute", field: "Description", required: false },
            { table: "PredefinedProductAttributeValue", field: "Name/DisplayOrder/IsPreSelected/PriceAdjustment/WeightAdjustment/Cost", required: false, notes: "Optional predefined values" }
          ],
          "4.90": [
            { table: "ProductAttribute", field: "Name (from path)", required: true },
            { table: "ProductAttribute", field: "Description", required: false },
            { table: "PredefinedProductAttributeValue", field: "Name/DisplayOrder/IsPreSelected/PriceAdjustment/WeightAdjustment/Cost", required: false, notes: "Optional predefined values" }
          ]
        }
      },
      {
        method: "GET",
        path: "/api/integration/v1/items/by-sku/{sku}/attributes",
        direction: "nop → middleware (pull)",
        scope: "items.read",
        idempotencyRequired: false,
        approvalRequired: false,
        purpose: "Get all attribute mappings for a product by SKU. Returns attribute names, control types, values, and display settings.",
        versionNotes: ["Returns Product_ProductAttribute_Mapping + ProductAttributeValue rows for the product."],
        fields: {
          "4.60": [
            { table: "Product", field: "SKU (from path)", required: true },
            { table: "Product_ProductAttribute_Mapping", field: "Id", required: true },
            { table: "Product_ProductAttribute_Mapping", field: "ProductAttributeId", required: true },
            { table: "Product_ProductAttribute_Mapping", field: "AttributeControlTypeId", required: false },
            { table: "Product_ProductAttribute_Mapping", field: "DisplayOrder", required: false },
            { table: "Product_ProductAttribute_Mapping", field: "IsRequired", required: false },
            { table: "Product_ProductAttribute_Mapping", field: "TextPrompt", required: false },
            { table: "ProductAttribute", field: "Name (joined)", required: false },
            { table: "ProductAttributeValue", field: "Id/Name/PriceAdjustment/WeightAdjustment/Cost/IsPreSelected/DisplayOrder/PictureId", required: false }
          ],
          "4.90": [
            { table: "Product", field: "Sku (from path)", required: true },
            { table: "Product_ProductAttribute_Mapping", field: "Id", required: true },
            { table: "Product_ProductAttribute_Mapping", field: "ProductAttributeId", required: true },
            { table: "Product_ProductAttribute_Mapping", field: "AttributeControlTypeId", required: false },
            { table: "Product_ProductAttribute_Mapping", field: "DisplayOrder", required: false },
            { table: "Product_ProductAttribute_Mapping", field: "IsRequired", required: false },
            { table: "Product_ProductAttribute_Mapping", field: "TextPrompt", required: false },
            { table: "ProductAttribute", field: "Name (joined)", required: false },
            { table: "ProductAttributeValue", field: "Id/Name/PriceAdjustment/WeightAdjustment/Cost/IsPreSelected/DisplayOrder/PictureId", required: false }
          ]
        }
      },
      {
        method: "PUT",
        path: "/api/integration/v1/items/by-sku/{sku}/attributes",
        direction: "NetSuite → nop (push/upsert)",
        scope: "items.write",
        idempotencyRequired: true,
        idempotencyRecipe: "NS:ItemAttr:{externalItemId}:{attrSetHash}:{lastModifiedUtc}",
        approvalRequired: true,
        purpose: "Set attribute mappings + values for a product by SKU. Mode: REPLACE (remove all existing mappings/values then insert) or MERGE (upsert by attribute name). Creates global ProductAttribute if not found.",
        versionNotes: [
          "Each entry specifies: attributeName (resolved to ProductAttributeId), controlType, isRequired, and values array.",
          "Values include: name, priceAdjustment, weightAdjustment, cost, isPreSelected, displayOrder.",
          "If approval enabled, stages in Acgs_PendingChange."
        ],
        fields: {
          "4.60": [
            { table: "Product", field: "SKU (from path)", required: true, type: "string" },
            { table: "(request body)", field: "mode", required: false, type: "string", notes: "'REPLACE' (default) or 'MERGE'" },
            { table: "(request body)", field: "attributes", required: true, type: "object[]", notes: "Array of attribute mappings" },
            { table: "attributes[]", field: "attributeName", required: true, type: "string", notes: "Server resolves/creates global ProductAttribute" },
            { table: "attributes[]", field: "controlType", required: false, type: "string", notes: "'DropdownList' (default), 'ColorSquares', 'RadioList', etc." },
            { table: "attributes[]", field: "isRequired", required: false, type: "bool" },
            { table: "attributes[]", field: "displayOrder", required: false, type: "int" },
            { table: "attributes[]", field: "textPrompt", required: false, type: "string" },
            { table: "attributes[]", field: "values", required: true, type: "object[]", notes: "Array of attribute values" },
            { table: "attributes[].values[]", field: "name", required: true, type: "string" },
            { table: "attributes[].values[]", field: "colorSquaresRgb", required: false, type: "string", notes: "e.g. '#FF0000'" },
            { table: "attributes[].values[]", field: "priceAdjustment/weightAdjustment/cost", required: false, type: "decimal" },
            { table: "attributes[].values[]", field: "isPreSelected/displayOrder/quantity", required: false, type: "int|bool" },
            { table: "Acgs_PendingChange", field: "(staged if approval enabled)", required: false }
          ],
          "4.90": [
            { table: "Product", field: "Sku (from path)", required: true, type: "string" },
            { table: "(request body)", field: "mode", required: false, type: "string", notes: "'REPLACE' (default) or 'MERGE'" },
            { table: "(request body)", field: "attributes", required: true, type: "object[]", notes: "Array of attribute mappings" },
            { table: "attributes[]", field: "attributeName", required: true, type: "string", notes: "Server resolves/creates global ProductAttribute" },
            { table: "attributes[]", field: "controlType", required: false, type: "string", notes: "'DropdownList' (default), 'ColorSquares', 'RadioList', etc." },
            { table: "attributes[]", field: "isRequired", required: false, type: "bool" },
            { table: "attributes[]", field: "displayOrder", required: false, type: "int" },
            { table: "attributes[]", field: "textPrompt", required: false, type: "string" },
            { table: "attributes[]", field: "values", required: true, type: "object[]", notes: "Array of attribute values" },
            { table: "attributes[].values[]", field: "name", required: true, type: "string" },
            { table: "attributes[].values[]", field: "colorSquaresRgb", required: false, type: "string", notes: "e.g. '#FF0000'" },
            { table: "attributes[].values[]", field: "priceAdjustment/weightAdjustment/cost", required: false, type: "decimal" },
            { table: "attributes[].values[]", field: "isPreSelected/displayOrder/quantity", required: false, type: "int|bool" },
            { table: "Acgs_PendingChange", field: "(staged if approval enabled)", required: false }
          ]
        }
      },
      {
        method: "GET",
        path: "/api/integration/v1/items/by-sku/{sku}/combinations",
        direction: "nop → middleware (pull)",
        scope: "items.read",
        idempotencyRequired: false,
        approvalRequired: false,
        purpose: "Get all attribute combinations (variants) for a product by SKU. Each combination has its own SKU, stock, GTIN, MPN, overridden price, and picture.",
        versionNotes: [
          "AttributesXml is parsed and returned as structured attribute-value pairs for readability.",
          "The {sku} path value is always the parent/base product SKU. Returned child rows may expose their own ProductAttributeCombination.Sku values as the variant SKUs."
        ],
        fields: {
          "4.60": [
            { table: "Product", field: "SKU (from path)", required: true },
            { table: "ProductAttributeCombination", field: "Id", required: true },
            { table: "ProductAttributeCombination", field: "ProductId", required: true },
            { table: "ProductAttributeCombination", field: "AttributesXml", required: true, notes: "Parsed to structured pairs" },
            { table: "ProductAttributeCombination", field: "Sku", required: false, notes: "Variant SKU" },
            { table: "ProductAttributeCombination", field: "StockQuantity", required: false },
            { table: "ProductAttributeCombination", field: "AllowOutOfStockOrders", required: false },
            { table: "ProductAttributeCombination", field: "ManufacturerPartNumber", required: false },
            { table: "ProductAttributeCombination", field: "Gtin", required: false },
            { table: "ProductAttributeCombination", field: "OverriddenPrice", required: false },
            { table: "ProductAttributeCombination", field: "NotifyAdminForQuantityBelow", required: false },
            { table: "ProductAttributeCombination", field: "MinStockQuantity", required: false },
            { table: "ProductAttributeCombination", field: "PictureId", required: false }
          ],
          "4.90": [
            { table: "Product", field: "Sku (from path)", required: true },
            { table: "ProductAttributeCombination", field: "Id", required: true },
            { table: "ProductAttributeCombination", field: "ProductId", required: true },
            { table: "ProductAttributeCombination", field: "AttributesXml", required: true, notes: "Parsed to structured pairs" },
            { table: "ProductAttributeCombination", field: "Sku", required: false, notes: "Variant SKU" },
            { table: "ProductAttributeCombination", field: "StockQuantity", required: false },
            { table: "ProductAttributeCombination", field: "AllowOutOfStockOrders", required: false },
            { table: "ProductAttributeCombination", field: "ManufacturerPartNumber", required: false },
            { table: "ProductAttributeCombination", field: "Gtin", required: false },
            { table: "ProductAttributeCombination", field: "OverriddenPrice", required: false },
            { table: "ProductAttributeCombination", field: "NotifyAdminForQuantityBelow", required: false },
            { table: "ProductAttributeCombination", field: "MinStockQuantity", required: false },
            { table: "ProductAttributeCombination", field: "PictureId", required: false }
          ]
        }
      },
      {
        method: "PUT",
        path: "/api/integration/v1/items/by-sku/{sku}/combinations",
        direction: "NetSuite → nop (push/upsert)",
        scope: "items.write",
        idempotencyRequired: true,
        idempotencyRecipe: "NS:ItemCombo:{externalItemId}:{comboSetHash}:{lastModifiedUtc}",
        approvalRequired: true,
        purpose: "Set attribute combinations (variants) for a product by SKU. Mode: REPLACE or MERGE. Each combination is identified by its variant SKU or attribute-value set. Maps NetSuite child/matrix items to nop ProductAttributeCombination rows.",
        versionNotes: [
          "The {sku} path value is always the parent/base product SKU; child SKUs belong inside combinations[].variantSku.",
          "Each combination entry specifies: variantSku, attributes (name→value pairs), stockQuantity, overriddenPrice, gtin, mpn, allowOutOfStockOrders.",
          "Attribute mappings (Product_ProductAttribute_Mapping + values) must exist before combinations can reference them.",
          "Server builds AttributesXml from name→value pairs by resolving Product_ProductAttribute_Mapping IDs and ProductAttributeValue IDs.",
          "Combination-picture linking differs by version: 4.60 uses ProductAttributeCombination.PictureId (single FK). 4.90 uses ProductAttributeCombinationPicture join table (many-to-many, supports multiple images per combination).",
          "If approval enabled, stages in Acgs_PendingChange."
        ],
        fields: {
          "4.60": [
            { table: "Product", field: "SKU (from path)", required: true, type: "string" },
            { table: "(request body)", field: "mode", required: false, type: "string", notes: "'REPLACE' (default) or 'MERGE'" },
            { table: "(request body)", field: "combinations", required: true, type: "object[]", notes: "Array of variant/combination entries" },
            { table: "combinations[]", field: "variantSku", required: false, type: "string", notes: "Variant/child SKU" },
            { table: "combinations[]", field: "attributes", required: true, type: "object", notes: "Name→value pairs e.g. {'Color':'White','Size':'M'}; server builds AttributesXml" },
            { table: "combinations[]", field: "stockQuantity", required: false, type: "int" },
            { table: "combinations[]", field: "allowOutOfStockOrders", required: false, type: "bool" },
            { table: "combinations[]", field: "overriddenPrice", required: false, type: "decimal" },
            { table: "combinations[]", field: "manufacturerPartNumber", required: false, type: "string" },
            { table: "combinations[]", field: "gtin", required: false, type: "string" },
            { table: "combinations[]", field: "notifyAdminForQuantityBelow", required: false, type: "int" },
            { table: "combinations[]", field: "minStockQuantity", required: false, type: "int" },
            { table: "combinations[]", field: "imageUrl", required: false, type: "string", notes: "4.60: sets single PictureId FK on combination; server resolves Picture from URL" },
            { table: "Acgs_PendingChange", field: "(staged if approval enabled)", required: false }
          ],
          "4.90": [
            { table: "Product", field: "Sku (from path)", required: true, type: "string" },
            { table: "(request body)", field: "mode", required: false, type: "string", notes: "'REPLACE' (default) or 'MERGE'" },
            { table: "(request body)", field: "combinations", required: true, type: "object[]", notes: "Array of variant/combination entries" },
            { table: "combinations[]", field: "variantSku", required: false, type: "string", notes: "Variant/child SKU" },
            { table: "combinations[]", field: "attributes", required: true, type: "object", notes: "Name→value pairs e.g. {'Color':'White','Size':'M'}; server builds AttributesXml" },
            { table: "combinations[]", field: "stockQuantity", required: false, type: "int" },
            { table: "combinations[]", field: "allowOutOfStockOrders", required: false, type: "bool" },
            { table: "combinations[]", field: "overriddenPrice", required: false, type: "decimal" },
            { table: "combinations[]", field: "manufacturerPartNumber", required: false, type: "string" },
            { table: "combinations[]", field: "gtin", required: false, type: "string" },
            { table: "combinations[]", field: "notifyAdminForQuantityBelow", required: false, type: "int" },
            { table: "combinations[]", field: "minStockQuantity", required: false, type: "int" },
            { table: "combinations[]", field: "imageUrls", required: false, type: "string[]", notes: "4.90: array of image URLs; server creates ProductAttributeCombinationPicture join rows (many-to-many)" },
            { table: "Acgs_PendingChange", field: "(staged if approval enabled)", required: false }
          ]
        }
      },
      // --- Images sub-domain ---
      {
        method: "GET",
        path: "/api/integration/v1/items/by-sku/{sku}/images",
        direction: "nop → middleware (pull)",
        scope: "items.read",
        isNew: true,
        newLabel: "New in v1.6",
        idempotencyRequired: false,
        approvalRequired: false,
        purpose: "Get all image references for a product by SKU. Returns picture IDs, display order, alt text, title text, and resolved thumbnail/full image URLs that NetSuite can store as references.",
        versionNotes: [
          "Primary image contract for the central image library workflow: NetSuite stores image URLs, not image binaries.",
          "Response should expose resolved thumbnail and full-size URLs generated via nop's picture service so external systems can store canonical references.",
          "If variant-specific images exist, return the related combination SKU association so NetSuite can map URLs back to child items.",
          "Picture binary stored in database or file system depending on nop MediaSettings.StoreInDb."
        ],
        fields: {
          "4.60": [
            { table: "Product", field: "SKU (from path)", required: true },
            { table: "Product_Picture_Mapping", field: "ProductId", required: true },
            { table: "Product_Picture_Mapping", field: "PictureId", required: true },
            { table: "Product_Picture_Mapping", field: "DisplayOrder", required: false },
            { table: "Picture", field: "Id", required: true },
            { table: "Picture", field: "MimeType", required: false },
            { table: "Picture", field: "SeoFilename", required: false },
            { table: "Picture", field: "AltAttribute", required: false },
            { table: "Picture", field: "TitleAttribute", required: false },
            { table: "Picture", field: "VirtualPath", required: false },
            { table: "ProductAttributeCombination", field: "Sku/PictureId", required: false, notes: "Optional variant-specific image association for NetSuite image URL mapping" }
          ],
          "4.90": [
            { table: "Product", field: "Sku (from path)", required: true },
            { table: "Product_Picture_Mapping", field: "ProductId", required: true },
            { table: "Product_Picture_Mapping", field: "PictureId", required: true },
            { table: "Product_Picture_Mapping", field: "DisplayOrder", required: false },
            { table: "Picture", field: "Id", required: true },
            { table: "Picture", field: "MimeType", required: false },
            { table: "Picture", field: "SeoFilename", required: false },
            { table: "Picture", field: "AltAttribute", required: false },
            { table: "Picture", field: "TitleAttribute", required: false },
            { table: "Picture", field: "VirtualPath", required: false },
            { table: "ProductAttributeCombinationPicture", field: "ProductAttributeCombinationId/PictureId", required: false, notes: "Optional 4.90 variant image join used for NetSuite URL mapping" },
            { table: "ProductAttributeCombination", field: "Sku", required: false, notes: "Variant SKU returned with combination-specific URLs" }
          ]
        }
      },
      {
        method: "POST",
        path: "/api/integration/v1/items/by-sku/{sku}/images",
        direction: "NetSuite → nop (push/upload)",
        scope: "items.write",
        isNew: true,
        newLabel: "Updated in v1.6.1",
        idempotencyRequired: true,
        idempotencyRecipe: "NS:ItemImg:{externalItemId}:{imageHash}:{lastModifiedUtc}",
        approvalRequired: false,
        purpose: "Upload and attach a new image to a product by SKU. Accepts image as base64 payload or URL reference. Creates Picture + PictureBinary + Product_Picture_Mapping. Optionally links to a specific ProductAttributeCombination.",
        versionNotes: [
          "Supports JPEG, PNG, GIF, WebP.",
          "For central image library workflows, prefer imageUrl so nop stores a local copy while NetSuite retains the canonical URL reference.",
          "If imageUrl provided, server downloads and stores the image.",
          "If base64Data provided, server decodes and stores directly.",
          "Returns the new PictureId and mapped displayOrder.",
          "Optional combinationSku parameter: if provided, also links the picture to the specified ProductAttributeCombination (4.60: sets PictureId FK; 4.90: creates ProductAttributeCombinationPicture row).",
          "SeoFilename is auto-generated from product name if not provided (consistent with import scripts).",
          "AltAttribute and TitleAttribute default to the product name if not provided.",
          "imageUrl sources must be public HTTPS URLs. Private/internal hosts, localhost, link-local ranges, RFC1918 address space, and metadata-service endpoints are rejected.",
          "Fetch policy: maximum 3 redirects, 15-second download timeout, and 10 MB maximum size after download or base64 decode.",
          "Unsupported formats return 415, oversized payloads return 413, and blocked or invalid remote sources return 422 INVALID_IMAGE_SOURCE."
        ],
        fields: {
          "4.60": [
            { table: "Product", field: "SKU (from path)", required: true },
            { table: "Picture", field: "MimeType", required: true },
            { table: "Picture", field: "SeoFilename", required: false },
            { table: "Picture", field: "AltAttribute", required: false },
            { table: "Picture", field: "TitleAttribute", required: false },
            { table: "PictureBinary", field: "BinaryData", required: true, notes: "From base64 or URL download" },
            { table: "Product_Picture_Mapping", field: "DisplayOrder", required: false }
          ],
          "4.90": [
            { table: "Product", field: "Sku (from path)", required: true },
            { table: "Picture", field: "MimeType", required: true },
            { table: "Picture", field: "SeoFilename", required: false },
            { table: "Picture", field: "AltAttribute", required: false },
            { table: "Picture", field: "TitleAttribute", required: false },
            { table: "PictureBinary", field: "BinaryData", required: true, notes: "From base64 or URL download" },
            { table: "Product_Picture_Mapping", field: "DisplayOrder", required: false }
          ]
        }
      },
      {
        method: "PUT",
        path: "/api/integration/v1/items/by-sku/{sku}/images",
        direction: "NetSuite → nop (push/replace-all)",
        scope: "items.write",
        isNew: true,
        newLabel: "Updated in v1.6.1",
        idempotencyRequired: true,
        idempotencyRecipe: "NS:ItemImgSet:{externalItemId}:{imageSetHash}:{lastModifiedUtc}",
        approvalRequired: false,
        purpose: "Replace all images for a product by SKU. Deletes existing Product_Picture_Mapping + Picture rows, then uploads and attaches new images in order.",
        versionNotes: [
          "Accepts array of images (each with base64Data or imageUrl, alt, title, displayOrder).",
          "Supports NetSuite → nop refreshes where NetSuite provides canonical image URLs instead of binary payloads.",
          "Recommended for central image library synchronization when the upstream system republishes the product image set.",
          "An explicit empty images array clears all existing product images. Omit the property in full-sync if images should remain unchanged.",
          "imageUrl sources must be public HTTPS URLs. Private/internal hosts, localhost, link-local ranges, RFC1918 address space, and metadata-service endpoints are rejected.",
          "Fetch policy: maximum 3 redirects, 15-second download timeout, and 10 MB maximum size after download or base64 decode. Unsupported formats return 415; oversized payloads return 413."
        ],
        fields: {
          "4.60": [
            { table: "Product", field: "SKU (from path)", required: true, type: "string" },
            { table: "(request body)", field: "images", required: true, type: "object[]", notes: "Array of image entries — replaces ALL existing images" },
            { table: "images[]", field: "imageUrl", required: false, type: "string", notes: "Server downloads; provide imageUrl OR base64Data" },
            { table: "images[]", field: "base64Data", required: false, type: "string", notes: "Base64-encoded binary; provide imageUrl OR base64Data" },
            { table: "images[]", field: "mimeType", required: false, type: "string", notes: "Auto-detected if imageUrl used" },
            { table: "images[]", field: "altAttribute", required: false, type: "string", notes: "Defaults to product name" },
            { table: "images[]", field: "titleAttribute", required: false, type: "string", notes: "Defaults to product name" },
            { table: "images[]", field: "seoFilename", required: false, type: "string", notes: "Auto-generated from product name" },
            { table: "images[]", field: "displayOrder", required: false, type: "int" }
          ],
          "4.90": [
            { table: "Product", field: "Sku (from path)", required: true, type: "string" },
            { table: "(request body)", field: "images", required: true, type: "object[]", notes: "Array of image entries — replaces ALL existing images" },
            { table: "images[]", field: "imageUrl", required: false, type: "string", notes: "Server downloads; provide imageUrl OR base64Data" },
            { table: "images[]", field: "base64Data", required: false, type: "string", notes: "Base64-encoded binary; provide imageUrl OR base64Data" },
            { table: "images[]", field: "mimeType", required: false, type: "string", notes: "Auto-detected if imageUrl used" },
            { table: "images[]", field: "altAttribute", required: false, type: "string", notes: "Defaults to product name" },
            { table: "images[]", field: "titleAttribute", required: false, type: "string", notes: "Defaults to product name" },
            { table: "images[]", field: "seoFilename", required: false, type: "string", notes: "Auto-generated from product name" },
            { table: "images[]", field: "displayOrder", required: false, type: "int" }
          ]
        }
      },
      {
        method: "DELETE",
        path: "/api/integration/v1/items/by-sku/{sku}/images/{pictureId}",
        direction: "NetSuite → nop (push/delete)",
        scope: "items.write",
        idempotencyRequired: true,
        idempotencyRecipe: "NS:ItemImgDel:{externalItemId}:{pictureId}",
        approvalRequired: false,
        purpose: "Delete a specific image from a product by SKU and pictureId. Removes Product_Picture_Mapping and Picture/PictureBinary.",
        versionNotes: [],
        fields: {
          "4.60": [
            { table: "Product", field: "SKU (from path)", required: true },
            { table: "Picture", field: "Id (from path)", required: true },
            { table: "Product_Picture_Mapping", field: "(deleted)", required: false },
            { table: "PictureBinary", field: "(deleted)", required: false }
          ],
          "4.90": [
            { table: "Product", field: "Sku (from path)", required: true },
            { table: "Picture", field: "Id (from path)", required: true },
            { table: "Product_Picture_Mapping", field: "(deleted)", required: false },
            { table: "PictureBinary", field: "(deleted)", required: false }
          ]
        }
      },
      // --- Vendor sub-domain ---
      {
        method: "GET",
        path: "/api/integration/v1/vendors?page={p}&pageSize={n}&name={name}",
        direction: "nop → middleware (pull)",
        scope: "items.read",
        idempotencyRequired: false,
        approvalRequired: false,
        purpose: "Pull paginated vendor list. Used by middleware to resolve vendor names to IDs before product sync, or for reconciliation.",
        versionNotes: ["Vendor table is consistent across 4.60 and 4.90."],
        fields: {
          "4.60": [
            { table: "Vendor", field: "Id", required: true },
            { table: "Vendor", field: "Name", required: true },
            { table: "Vendor", field: "Email", required: false },
            { table: "Vendor", field: "Description", required: false },
            { table: "Vendor", field: "Active", required: true },
            { table: "Vendor", field: "Deleted", required: true },
            { table: "Vendor", field: "DisplayOrder", required: false },
            { table: "Vendor", field: "PageSize/PageSizeOptions", required: false },
            { table: "UrlRecord", field: "Slug (EntityName=Vendor)", required: false }
          ],
          "4.90": [
            { table: "Vendor", field: "Id", required: true },
            { table: "Vendor", field: "Name", required: true },
            { table: "Vendor", field: "Email", required: false },
            { table: "Vendor", field: "Description", required: false },
            { table: "Vendor", field: "Active", required: true },
            { table: "Vendor", field: "Deleted", required: true },
            { table: "Vendor", field: "DisplayOrder", required: false },
            { table: "Vendor", field: "PageSize/PageSizeOptions", required: false },
            { table: "UrlRecord", field: "Slug (EntityName=Vendor)", required: false }
          ]
        }
      },
      {
        method: "PUT",
        path: "/api/integration/v1/vendors/by-name/{name}",
        direction: "NetSuite → nop (push/upsert)",
        scope: "items.write",
        idempotencyRequired: true,
        idempotencyRecipe: "NS:Vendor:{vendorName}:{lastModifiedUtc}",
        approvalRequired: false,
        purpose: "Upsert vendor by name. Creates if not found (with UrlRecord SEO slug), updates if exists. Product.VendorId is set during product upsert or full-sync.",
        versionNotes: [
          "Creates UrlRecord (SEO slug) for new vendors automatically.",
          "If slug collision occurs, appends VendorId to slug (e.g. vendor-name-123)."
        ],
        fields: {
          "4.60": [
            { table: "Vendor", field: "Name (from path)", required: true },
            { table: "Vendor", field: "Email", required: false },
            { table: "Vendor", field: "Description", required: false },
            { table: "Vendor", field: "Active", required: true },
            { table: "Vendor", field: "PageSize/AllowCustomersToSelectPageSize/PageSizeOptions", required: false },
            { table: "Vendor", field: "MetaKeywords/MetaTitle/MetaDescription", required: false },
            { table: "Vendor", field: "PictureId/AddressId", required: false },
            { table: "UrlRecord", field: "Slug (auto-generated from name)", required: false }
          ],
          "4.90": [
            { table: "Vendor", field: "Name (from path)", required: true },
            { table: "Vendor", field: "Email", required: false },
            { table: "Vendor", field: "Description", required: false },
            { table: "Vendor", field: "Active", required: true },
            { table: "Vendor", field: "PageSize/AllowCustomersToSelectPageSize/PageSizeOptions", required: false },
            { table: "Vendor", field: "MetaKeywords/MetaTitle/MetaDescription", required: false },
            { table: "Vendor", field: "PictureId/AddressId", required: false },
            { table: "UrlRecord", field: "Slug (auto-generated from name)", required: false }
          ]
        }
      },
      // --- Manufacturer sub-domain ---
      {
        method: "GET",
        path: "/api/integration/v1/manufacturers?page={p}&pageSize={n}&name={name}",
        direction: "nop → middleware (pull)",
        scope: "items.read",
        idempotencyRequired: false,
        approvalRequired: false,
        purpose: "Pull paginated manufacturer list. Used to resolve manufacturer names to IDs or for reconciliation.",
        versionNotes: ["Manufacturer table is consistent across 4.60 and 4.90."],
        fields: {
          "4.60": [
            { table: "Manufacturer", field: "Id", required: true },
            { table: "Manufacturer", field: "Name", required: true },
            { table: "Manufacturer", field: "Description", required: false },
            { table: "Manufacturer", field: "Published", required: true },
            { table: "Manufacturer", field: "Deleted", required: true },
            { table: "Manufacturer", field: "DisplayOrder", required: false },
            { table: "Manufacturer", field: "PictureId", required: false },
            { table: "Manufacturer", field: "CreatedOnUtc/UpdatedOnUtc", required: false },
            { table: "UrlRecord", field: "Slug (EntityName=Manufacturer)", required: false }
          ],
          "4.90": [
            { table: "Manufacturer", field: "Id", required: true },
            { table: "Manufacturer", field: "Name", required: true },
            { table: "Manufacturer", field: "Description", required: false },
            { table: "Manufacturer", field: "Published", required: true },
            { table: "Manufacturer", field: "Deleted", required: true },
            { table: "Manufacturer", field: "DisplayOrder", required: false },
            { table: "Manufacturer", field: "PictureId", required: false },
            { table: "Manufacturer", field: "CreatedOnUtc/UpdatedOnUtc", required: false },
            { table: "UrlRecord", field: "Slug (EntityName=Manufacturer)", required: false }
          ]
        }
      },
      {
        method: "PUT",
        path: "/api/integration/v1/manufacturers/by-name/{name}",
        direction: "NetSuite → nop (push/upsert)",
        scope: "items.write",
        idempotencyRequired: true,
        idempotencyRecipe: "NS:Manuf:{manufacturerName}:{lastModifiedUtc}",
        approvalRequired: false,
        purpose: "Upsert manufacturer by name. Creates if not found (with UrlRecord SEO slug), updates if exists.",
        versionNotes: [
          "Creates UrlRecord (SEO slug) for new manufacturers automatically.",
          "Product_Manufacturer_Mapping is managed via the product full-sync or dedicated mapping endpoint."
        ],
        fields: {
          "4.60": [
            { table: "Manufacturer", field: "Name (from path)", required: true },
            { table: "Manufacturer", field: "Description", required: false },
            { table: "Manufacturer", field: "ManufacturerTemplateId", required: false, notes: "Default: 1" },
            { table: "Manufacturer", field: "Published", required: false, notes: "Default: true" },
            { table: "Manufacturer", field: "MetaKeywords/MetaTitle/MetaDescription", required: false },
            { table: "Manufacturer", field: "PictureId", required: false },
            { table: "Manufacturer", field: "PageSize/AllowCustomersToSelectPageSize/PageSizeOptions", required: false },
            { table: "UrlRecord", field: "Slug (auto-generated from name)", required: false }
          ],
          "4.90": [
            { table: "Manufacturer", field: "Name (from path)", required: true },
            { table: "Manufacturer", field: "Description", required: false },
            { table: "Manufacturer", field: "ManufacturerTemplateId", required: false, notes: "Default: 1" },
            { table: "Manufacturer", field: "Published", required: false, notes: "Default: true" },
            { table: "Manufacturer", field: "MetaKeywords/MetaTitle/MetaDescription", required: false },
            { table: "Manufacturer", field: "PictureId", required: false },
            { table: "Manufacturer", field: "PageSize/AllowCustomersToSelectPageSize/PageSizeOptions", required: false },
            { table: "UrlRecord", field: "Slug (auto-generated from name)", required: false }
          ]
        }
      },
      {
        method: "PUT",
        path: "/api/integration/v1/items/by-sku/{sku}/manufacturers",
        direction: "NetSuite → nop (push/upsert)",
        scope: "items.write",
        idempotencyRequired: true,
        idempotencyRecipe: "NS:ItemManuf:{externalItemId}:{manufSetHash}:{lastModifiedUtc}",
        approvalRequired: true,
        purpose: "Set manufacturer assignments for a product by SKU. Mode: REPLACE or MERGE. Resolves manufacturer by name (creates if not found). Creates Product_Manufacturer_Mapping rows.",
        versionNotes: ["Creates Manufacturer + UrlRecord if manufacturer does not exist. If approval is enabled, the change is staged in Acgs_PendingChange."],
        fields: {
          "4.60": [
            { table: "Product", field: "SKU (from path)", required: true, type: "string" },
            { table: "(request body)", field: "mode", required: false, type: "string", notes: "'REPLACE' (default) or 'MERGE'" },
            { table: "(request body)", field: "manufacturers", required: true, type: "object[]", notes: "Array of manufacturer assignments" },
            { table: "manufacturers[]", field: "name", required: true, type: "string", notes: "Server resolves/creates Manufacturer + UrlRecord" },
            { table: "manufacturers[]", field: "isFeaturedProduct", required: false, type: "bool" },
            { table: "manufacturers[]", field: "displayOrder", required: false, type: "int" },
            { table: "Acgs_PendingChange", field: "(staged if approval enabled)", required: false }
          ],
          "4.90": [
            { table: "Product", field: "Sku (from path)", required: true, type: "string" },
            { table: "(request body)", field: "mode", required: false, type: "string", notes: "'REPLACE' (default) or 'MERGE'" },
            { table: "(request body)", field: "manufacturers", required: true, type: "object[]", notes: "Array of manufacturer assignments" },
            { table: "manufacturers[]", field: "name", required: true, type: "string", notes: "Server resolves/creates Manufacturer + UrlRecord" },
            { table: "manufacturers[]", field: "isFeaturedProduct", required: false, type: "bool" },
            { table: "manufacturers[]", field: "displayOrder", required: false, type: "int" },
            { table: "Acgs_PendingChange", field: "(staged if approval enabled)", required: false }
          ]
        }
      },
      // --- SEO / URL Records sub-domain ---
      {
        method: "GET",
        path: "/api/integration/v1/items/by-sku/{sku}/seo-slug",
        direction: "nop → middleware (pull)",
        scope: "items.read",
        idempotencyRequired: false,
        approvalRequired: false,
        purpose: "Get the active SEO slug (UrlRecord) for a product by SKU. Returns the slug, language ID, and active status.",
        versionNotes: ["UrlRecord table is consistent across 4.60 and 4.90. EntityName='Product'."],
        fields: {
          "4.60": [
            { table: "Product", field: "SKU (from path)", required: true },
            { table: "UrlRecord", field: "EntityId", required: true },
            { table: "UrlRecord", field: "EntityName (=Product)", required: true },
            { table: "UrlRecord", field: "Slug", required: true },
            { table: "UrlRecord", field: "LanguageId", required: false },
            { table: "UrlRecord", field: "IsActive", required: true }
          ],
          "4.90": [
            { table: "Product", field: "Sku (from path)", required: true },
            { table: "UrlRecord", field: "EntityId", required: true },
            { table: "UrlRecord", field: "EntityName (=Product)", required: true },
            { table: "UrlRecord", field: "Slug", required: true },
            { table: "UrlRecord", field: "LanguageId", required: false },
            { table: "UrlRecord", field: "IsActive", required: true }
          ]
        }
      },
      {
        method: "PUT",
        path: "/api/integration/v1/items/by-sku/{sku}/seo-slug",
        direction: "NetSuite → nop (push/upsert)",
        scope: "items.write",
        idempotencyRequired: true,
        idempotencyRecipe: "NS:ItemSlug:{externalItemId}:{slug}:{lastModifiedUtc}",
        approvalRequired: false,
        purpose: "Set the SEO slug for a product by SKU. Creates or updates the UrlRecord. If slug collides with another entity, appends ProductId (e.g. product-name-123).",
        versionNotes: [
          "If no slug is provided, auto-generates from product name.",
          "Deactivates any previous active slug for this product before inserting the new one."
        ],
        fields: {
          "4.60": [
            { table: "Product", field: "SKU (from path)", required: true },
            { table: "UrlRecord", field: "Slug", required: true },
            { table: "UrlRecord", field: "LanguageId", required: false, notes: "Default: 0 (all languages)" },
            { table: "UrlRecord", field: "IsActive", required: false, notes: "Default: true" }
          ],
          "4.90": [
            { table: "Product", field: "Sku (from path)", required: true },
            { table: "UrlRecord", field: "Slug", required: true },
            { table: "UrlRecord", field: "LanguageId", required: false, notes: "Default: 0 (all languages)" },
            { table: "UrlRecord", field: "IsActive", required: false, notes: "Default: true" }
          ]
        }
      },
      // --- Composite Full Product Sync ---
      {
        method: "PUT",
        path: "/api/integration/v1/items/by-sku/{sku}/full-sync",
        direction: "NetSuite → nop (push/composite atomic)",
        scope: "items.write",
        isNew: true,
        newLabel: "Updated in v1.6.1",
        idempotencyRequired: true,
        idempotencyRecipe: "NS:FullSync:{externalItemId}:{payloadHash}:{lastModifiedUtc}",
        approvalRequired: true,
        purpose: "Atomic composite endpoint: creates or updates a complete product with all related entities in a single transactional call. Covers: product fields, vendor (upsert by name), manufacturer (upsert by name + mapping), categories (upsert hierarchy by path + mapping), store mappings, product tags, specification attributes, attributes (global upsert + product mapping + values with ColorSquaresRgb), combinations (with variant SKU, stock, overridden price, MPN, GTIN), images (by URL or base64 with product mapping + combination-picture linking), and SEO slug (UrlRecord). Server resolves all internal IDs — caller never needs nop-internal IDs. If approval enabled: stages entire composite as a single Acgs_PendingChange and returns 202. If approval disabled: applies all changes atomically within a transaction and returns 200.",
        versionNotes: [
          "This is the recommended endpoint for NetSuite/supplier full product pushes — eliminates multi-call choreography.",
          "The {sku} path value identifies the parent/base product SKU. Child or matrix SKUs belong inside combinations[].variantSku and are created or updated beneath that parent product.",
          "Server execution order: 1) Vendor upsert → 2) Manufacturer upsert → 3) Product upsert (with VendorId) → 4) UrlRecord (SEO slug) → 5) Category hierarchy upsert + Product_Category_Mapping → 6) Product_Manufacturer_Mapping → 7) StoreMapping upsert → 8) ProductTag upsert + Product_ProductTag_Mapping → 9) SpecificationAttribute / SpecificationAttributeOption upsert + Product_SpecificationAttribute_Mapping → 10) Global ProductAttribute upsert → 11) Product_ProductAttribute_Mapping + ProductAttributeValue (with ColorSquaresRgb) → 12) Image upload (Picture + PictureBinary + Product_Picture_Mapping) → 13) ProductAttributeCombination (with resolved AttributesXml) → 14) Combination-picture linking (4.60: PictureId FK; 4.90: ProductAttributeCombinationPicture join table).",
          "All steps execute in a single DB transaction — if any step fails, the entire operation rolls back.",
          "Category paths support hierarchical creation (e.g. 'Clothing/Shirts/Golf Shirts' creates all three levels if missing).",
          "storeMappings lets NetSuite decide which website(s) the product should appear on without a follow-up call.",
          "tags supports automated frontend ribbons/badges such as Recyclable, PET, WSL, or New Arrival.",
          "specifications supports structured product metadata for filtering and product page display.",
          "For central image library workflows, prefer imageUrl entries so external systems can keep canonical URL references while nop resolves and stores the asset.",
          "Attribute values support ColorSquaresRgb for colour swatch display (AttributeControlTypeId=40).",
          "Combination images: the images array on each combination entry references images by index from the top-level images array, or by imageUrl match. Server resolves Picture IDs after upload.",
          "4.90 uses ProductAttributeCombinationPicture join table (many-to-many) for combination images. 4.60 uses ProductAttributeCombination.PictureId (single FK).",
          "Product fields include display/storefront controls: ProductTypeId, VisibleIndividually, AllowCustomerReviews, AllowAddingOnlyExistingAttributeCombinations, DisplayStockAvailability, DisplayStockQuantity, OrderMinimumQuantity, OrderMaximumQuantity, DisableBuyButton, DisableWishlistButton, NotReturnable, BasepriceEnabled/Amount/Units.",
          "Single-language contract: name, descriptions, meta text, and seoSlug represent one live storefront value. Localized product translation payloads are intentionally out of scope in v1.6.1.",
          "For existing products, omitted child objects and collections remain unchanged. For new products, omitted child objects and collections are simply not created.",
          "Explicit empty arrays on categories, tags, specifications, attributes, images, and combinations mean clear and replace that collection. Clear explicit store mappings with { \"allStores\": true }.",
          "Use null only for optional scalar/date/text fields that are intended to be cleared. Do not use null for related collections or mapped entities.",
          "imageUrl entries follow the same public-HTTPS, redirect, timeout, size, and format controls as the dedicated image endpoints.",
          "Individual sub-resource endpoints (attributes, combinations, images, categories, manufacturers) remain available for incremental updates after initial full-sync."
        ],
        fields: {
          "4.60": [
            { table: "Product", field: "SKU (from path)", required: true, type: "string" },
            { table: "Product", field: "Name", required: true, type: "string" },
            { table: "Product", field: "Published", required: true, type: "bool" },
            { table: "Product", field: "Deleted", required: false, type: "bool", notes: "Default: false" },
            { table: "Product", field: "ShortDescription/FullDescription/AdminComment", required: false, type: "string" },
            { table: "Product", field: "ProductTypeId", required: false, type: "int", notes: "Default: 5 (Simple)" },
            { table: "Product", field: "ProductTemplateId", required: false, type: "int", notes: "Default: 1 (Simple)" },
            { table: "Product", field: "VisibleIndividually", required: false, type: "bool", notes: "Default: true" },
            { table: "Product", field: "ManufacturerPartNumber/Gtin", required: false, type: "string" },
            { table: "Product", field: "Price/OldPrice/ProductCost", required: false, type: "decimal" },
            { table: "Product", field: "ManageInventoryMethodId", required: false, type: "int", notes: "Default: 2 (TrackByAttributes) when combinations present" },
            { table: "Product", field: "StockQuantity", required: false, type: "int" },
            { table: "Product", field: "UseMultipleWarehouses/WarehouseId", required: false },
            { table: "Product", field: "Weight/Length/Width/Height", required: false, type: "decimal" },
            { table: "Product", field: "IsShipEnabled/IsFreeShipping/ShipSeparately", required: false, type: "bool" },
            { table: "Product", field: "IsTaxExempt/TaxCategoryId", required: false },
            { table: "Product", field: "AllowCustomerReviews", required: false, type: "bool", notes: "Default: true" },
            { table: "Product", field: "MetaKeywords/MetaTitle/MetaDescription", required: false, type: "string" },
            { table: "Product", field: "HasTierPrices/HasDiscountsApplied", required: false, type: "bool", notes: "4.60 computed flags" },
            { table: "(request body)", field: "seoSlug", required: false, type: "string", notes: "Auto-generated if omitted; collision-safe" },
            { table: "(request body)", field: "vendor", required: false, type: "object", notes: "Upserted by name; server resolves VendorId" },
            { table: "vendor", field: "name/email/description/active", required: false, type: "string|bool" },
            { table: "(request body)", field: "manufacturer", required: false, type: "object", notes: "Upserted by name; server creates Manufacturer + mapping" },
            { table: "manufacturer", field: "name/description/published", required: false, type: "string|bool" },
            { table: "(request body)", field: "categories", required: false, type: "object[]", notes: "Array of category assignments" },
            { table: "categories[]", field: "categoryPath", required: true, type: "string", notes: "e.g. 'Clothing/Shirts/Golf Shirts'; auto-creates missing levels" },
            { table: "categories[]", field: "displayOrder/isFeaturedProduct", required: false, type: "int|bool" },
            { table: "(request body)", field: "storeMappings", required: false, type: "object", notes: "Optional website allocation: { allStores: bool, stores: [{storeId, storeName}] }" },
            { table: "storeMappings", field: "allStores", required: false, type: "bool", notes: "true clears StoreMapping rows and makes the product visible across all stores" },
            { table: "storeMappings", field: "stores", required: false, type: "object[]", notes: "Explicit per-store visibility when allStores is false" },
            { table: "stores[]", field: "storeId/storeName", required: false, type: "int|string", notes: "Provide storeId or storeName; server resolves Store.Id" },
            { table: "(request body)", field: "tags", required: false, type: "string[]", notes: "Optional product ribbon/badge labels e.g. ['Recyclable', 'WSL']" },
            { table: "(request body)", field: "specifications", required: false, type: "object[]", notes: "Optional structured filter/display metadata" },
            { table: "specifications[]", field: "attributeName/optionValue", required: true, type: "string", notes: "Server resolves or creates SpecificationAttribute and SpecificationAttributeOption" },
            { table: "specifications[]", field: "allowFiltering/showOnProductPage/displayOrder", required: false, type: "bool|bool|int" },
            { table: "(request body)", field: "attributes", required: false, type: "object[]", notes: "Array of attribute mappings; server upserts global ProductAttribute by name" },
            { table: "attributes[]", field: "attributeName", required: true, type: "string", notes: "Server resolves/creates global ProductAttribute" },
            { table: "attributes[]", field: "controlType/isRequired/displayOrder/textPrompt", required: false, type: "string|bool|int" },
            { table: "attributes[]", field: "values", required: true, type: "object[]", notes: "Array of attribute values" },
            { table: "attributes[].values[]", field: "name/colorSquaresRgb/priceAdjustment/weightAdjustment/cost/isPreSelected/displayOrder", required: false, type: "string|decimal|bool|int" },
            { table: "(request body)", field: "images", required: false, type: "object[]", notes: "Array of images; each has imageUrl OR base64Data" },
            { table: "images[]", field: "imageUrl", required: false, type: "string", notes: "Server downloads; provide imageUrl OR base64Data" },
            { table: "images[]", field: "base64Data", required: false, type: "string", notes: "Base64-encoded binary" },
            { table: "images[]", field: "mimeType/altAttribute/titleAttribute/seoFilename/displayOrder", required: false, type: "string|int" },
            { table: "(request body)", field: "combinations", required: false, type: "object[]", notes: "Array of variant/combination entries" },
            { table: "combinations[]", field: "variantSku", required: false, type: "string", notes: "Variant/child SKU" },
            { table: "combinations[]", field: "attributes", required: true, type: "object", notes: "Name→value pairs e.g. {'Color':'White','Size':'M'}" },
            { table: "combinations[]", field: "stockQuantity/overriddenPrice/gtin/manufacturerPartNumber", required: false, type: "int|decimal|string" },
            { table: "combinations[]", field: "imageIndexes", required: false, type: "int[]", notes: "Indexes into top-level images[] array; 4.60 uses first index only (single PictureId FK)" },
            { table: "(request body)", field: "externalReferences", required: false, type: "object", notes: "Stored in Acgs_ExternalReference" },
            { table: "externalReferences", field: "externalSystem/externalType/externalId", required: false, type: "string" },
            { table: "Acgs_PendingChange", field: "(entire composite staged if approval enabled)", required: false }
          ],
          "4.90": [
            { table: "Product", field: "Sku (from path)", required: true, type: "string" },
            { table: "Product", field: "Name", required: true, type: "string" },
            { table: "Product", field: "Published", required: true, type: "bool" },
            { table: "Product", field: "Deleted", required: false, type: "bool", notes: "Default: false" },
            { table: "Product", field: "ShortDescription/FullDescription/AdminComment", required: false, type: "string" },
            { table: "Product", field: "ProductTypeId", required: false, type: "int", notes: "Default: 5 (Simple)" },
            { table: "Product", field: "ProductTemplateId", required: false, type: "int", notes: "Default: 1 (Simple)" },
            { table: "Product", field: "VisibleIndividually", required: false, type: "bool", notes: "Default: true" },
            { table: "Product", field: "ManufacturerPartNumber/Gtin", required: false, type: "string" },
            { table: "Product", field: "Price/OldPrice/ProductCost", required: false, type: "decimal" },
            { table: "Product", field: "ManageInventoryMethodId", required: false, type: "int", notes: "Default: 2 (TrackByAttributes) when combinations present" },
            { table: "Product", field: "StockQuantity", required: false, type: "int" },
            { table: "Product", field: "UseMultipleWarehouses/WarehouseId", required: false },
            { table: "Product", field: "Weight/Length/Width/Height", required: false, type: "decimal" },
            { table: "Product", field: "IsShipEnabled/IsFreeShipping/ShipSeparately", required: false, type: "bool" },
            { table: "Product", field: "IsTaxExempt/TaxCategoryId", required: false },
            { table: "Product", field: "AllowCustomerReviews", required: false, type: "bool", notes: "Default: true" },
            { table: "Product", field: "AgeVerification/MinimumAgeToPurchase", required: false, notes: "4.90 only" },
            { table: "Product", field: "MetaKeywords/MetaTitle/MetaDescription", required: false, type: "string" },
            { table: "(request body)", field: "seoSlug", required: false, type: "string", notes: "Auto-generated if omitted; collision-safe" },
            { table: "(request body)", field: "vendor", required: false, type: "object", notes: "Upserted by name; server resolves VendorId" },
            { table: "vendor", field: "name/email/description/active", required: false, type: "string|bool" },
            { table: "(request body)", field: "manufacturer", required: false, type: "object", notes: "Upserted by name; server creates Manufacturer + mapping" },
            { table: "manufacturer", field: "name/description/published", required: false, type: "string|bool" },
            { table: "(request body)", field: "categories", required: false, type: "object[]", notes: "Array of category assignments" },
            { table: "categories[]", field: "categoryPath", required: true, type: "string", notes: "e.g. 'Clothing/Shirts/Golf Shirts'; auto-creates missing levels" },
            { table: "categories[]", field: "displayOrder/isFeaturedProduct", required: false, type: "int|bool" },
            { table: "(request body)", field: "storeMappings", required: false, type: "object", notes: "Optional website allocation: { allStores: bool, stores: [{storeId, storeName}] }" },
            { table: "storeMappings", field: "allStores", required: false, type: "bool", notes: "true clears StoreMapping rows and makes the product visible across all stores" },
            { table: "storeMappings", field: "stores", required: false, type: "object[]", notes: "Explicit per-store visibility when allStores is false" },
            { table: "stores[]", field: "storeId/storeName", required: false, type: "int|string", notes: "Provide storeId or storeName; server resolves Store.Id" },
            { table: "(request body)", field: "tags", required: false, type: "string[]", notes: "Optional product ribbon/badge labels e.g. ['Recyclable', 'WSL']" },
            { table: "(request body)", field: "specifications", required: false, type: "object[]", notes: "Optional structured filter/display metadata" },
            { table: "specifications[]", field: "attributeName/optionValue", required: true, type: "string", notes: "Server resolves or creates SpecificationAttribute and SpecificationAttributeOption" },
            { table: "specifications[]", field: "allowFiltering/showOnProductPage/displayOrder", required: false, type: "bool|bool|int" },
            { table: "(request body)", field: "attributes", required: false, type: "object[]", notes: "Array of attribute mappings; server upserts global ProductAttribute by name" },
            { table: "attributes[]", field: "attributeName", required: true, type: "string", notes: "Server resolves/creates global ProductAttribute" },
            { table: "attributes[]", field: "controlType/isRequired/displayOrder/textPrompt", required: false, type: "string|bool|int" },
            { table: "attributes[]", field: "values", required: true, type: "object[]", notes: "Array of attribute values" },
            { table: "attributes[].values[]", field: "name/colorSquaresRgb/priceAdjustment/weightAdjustment/cost/isPreSelected/displayOrder", required: false, type: "string|decimal|bool|int" },
            { table: "(request body)", field: "images", required: false, type: "object[]", notes: "Array of images; each has imageUrl OR base64Data" },
            { table: "images[]", field: "imageUrl", required: false, type: "string", notes: "Server downloads; provide imageUrl OR base64Data" },
            { table: "images[]", field: "base64Data", required: false, type: "string", notes: "Base64-encoded binary" },
            { table: "images[]", field: "mimeType/altAttribute/titleAttribute/seoFilename/displayOrder", required: false, type: "string|int" },
            { table: "(request body)", field: "combinations", required: false, type: "object[]", notes: "Array of variant/combination entries" },
            { table: "combinations[]", field: "variantSku", required: false, type: "string", notes: "Variant/child SKU" },
            { table: "combinations[]", field: "attributes", required: true, type: "object", notes: "Name→value pairs e.g. {'Color':'White','Size':'M'}" },
            { table: "combinations[]", field: "stockQuantity/overriddenPrice/gtin/manufacturerPartNumber", required: false, type: "int|decimal|string" },
            { table: "combinations[]", field: "imageIndexes", required: false, type: "int[]", notes: "Indexes into top-level images[] array; 4.90 creates ProductAttributeCombinationPicture many-to-many rows" },
            { table: "(request body)", field: "externalReferences", required: false, type: "object", notes: "Stored in Acgs_ExternalReference" },
            { table: "externalReferences", field: "externalSystem/externalType/externalId", required: false, type: "string" },
            { table: "Acgs_PendingChange", field: "(entire composite staged if approval enabled)", required: false }
          ]
        }
      },
      // --- Bulk batch upsert ---
      {
        method: "POST",
        path: "/api/integration/v1/items/batch",
        direction: "NetSuite → nop (push/bulk upsert)",
        scope: "items.write",
        idempotencyRequired: true,
        idempotencyRecipe: "NS:ItemBatch:{batchId}:{submittedOnUtc}",
        approvalRequired: true,
        purpose: "Bulk upsert up to 500 products per call. Each entry follows the same schema as PUT /items/by-sku/{sku} (simple upsert, not full-sync). Returns per-item results including successes, failures, and not-found SKUs. Processing is sequential within the batch — if approval is enabled, all items are staged as individual Acgs_PendingChange rows. For full product creation (with attributes, images, combinations), use PUT /items/by-sku/{sku}/full-sync individually.",
        versionNotes: [
          "Max 500 items per batch. Returns 400 if exceeded.",
          "Each item is processed independently — a failure on one item does not roll back others.",
          "Request schema: array of ItemUpsertRequest objects, each keyed by SKU.",
          "Response includes per-item status: 'created', 'updated', 'staged' (if approval), or 'failed' with error details.",
          "For atomic composite creation (product + attributes + images + combinations), use full-sync endpoint per SKU instead.",
          "Idempotency-Key should be unique per batch submission."
        ],
        fields: {
          "4.60": [
            { table: "(request body)", field: "items", required: true, type: "object[]", notes: "Array of product upsert entries; max 500" },
            { table: "items[]", field: "sku", required: true, type: "string", notes: "Product SKU — used as upsert key" },
            { table: "items[]", field: "name", required: true, type: "string" },
            { table: "items[]", field: "published", required: true, type: "bool" },
            { table: "items[]", field: "deleted", required: false, type: "bool" },
            { table: "items[]", field: "price/oldPrice/productCost", required: false, type: "decimal" },
            { table: "items[]", field: "stockQuantity", required: false, type: "int" },
            { table: "items[]", field: "weight/length/width/height", required: false, type: "decimal" },
            { table: "items[]", field: "isShipEnabled/isFreeShipping/isTaxExempt", required: false, type: "bool" },
            { table: "items[]", field: "taxCategoryId", required: false, type: "int" },
            { table: "items[]", field: "shortDescription/fullDescription", required: false, type: "string" },
            { table: "items[]", field: "metaKeywords/metaTitle/metaDescription", required: false, type: "string" },
            { table: "items[]", field: "externalReferences", required: false, type: "object", notes: "{ externalSystem, externalType, externalId }" },
            { table: "Acgs_PendingChange", field: "(each item staged individually if approval enabled)", required: false }
          ],
          "4.90": [
            { table: "(request body)", field: "items", required: true, type: "object[]", notes: "Array of product upsert entries; max 500" },
            { table: "items[]", field: "sku", required: true, type: "string", notes: "Product SKU — used as upsert key" },
            { table: "items[]", field: "name", required: true, type: "string" },
            { table: "items[]", field: "published", required: true, type: "bool" },
            { table: "items[]", field: "deleted", required: false, type: "bool" },
            { table: "items[]", field: "price/oldPrice/productCost", required: false, type: "decimal" },
            { table: "items[]", field: "stockQuantity", required: false, type: "int" },
            { table: "items[]", field: "weight/length/width/height", required: false, type: "decimal" },
            { table: "items[]", field: "isShipEnabled/isFreeShipping/isTaxExempt", required: false, type: "bool" },
            { table: "items[]", field: "taxCategoryId", required: false, type: "int" },
            { table: "items[]", field: "shortDescription/fullDescription", required: false, type: "string" },
            { table: "items[]", field: "ageVerification/minimumAgeToPurchase", required: false, notes: "4.90 only" },
            { table: "items[]", field: "metaKeywords/metaTitle/metaDescription", required: false, type: "string" },
            { table: "items[]", field: "externalReferences", required: false, type: "object", notes: "{ externalSystem, externalType, externalId }" },
            { table: "Acgs_PendingChange", field: "(each item staged individually if approval enabled)", required: false }
          ]
        }
      }
    ]
  },

  // ==========================================================
  // 1A) STORE MAPPINGS
  // ==========================================================
  {
    key: "store-mappings",
    title: "Store mappings",
    isNew: true,
    newLabel: "New in v1.6",
    description: "Website and brand allocation endpoints for controlling which nop stores a product is visible on.",
    endpoints: [
      {
        method: "GET",
        path: "/api/integration/v1/items/by-sku/{sku}/store-mappings",
        direction: "nop → middleware (pull)",
        scope: "items.read",
        isNew: true,
        newLabel: "New in v1.6",
        idempotencyRequired: false,
        approvalRequired: false,
        purpose: "Get all store assignments for a product by SKU. Returns which stores the product is visible on, or an allStores flag when the product is visible everywhere.",
        versionNotes: [
          "Supports multi-site allocation directly from NetSuite-driven merchandising rules.",
          "StoreMapping table is consistent across 4.60 and 4.90. EntityName='Product'."
        ],
        fields: {
          "4.60": [
            { table: "Product", field: "SKU (from path)", required: true },
            { table: "Product", field: "LimitedToStores", required: true, notes: "If false, product is visible on all stores" },
            { table: "StoreMapping", field: "EntityId", required: false },
            { table: "StoreMapping", field: "EntityName (=Product)", required: false },
            { table: "StoreMapping", field: "StoreId", required: false },
            { table: "Store", field: "Name (joined)", required: false }
          ],
          "4.90": [
            { table: "Product", field: "Sku (from path)", required: true },
            { table: "Product", field: "LimitedToStores", required: true, notes: "If false, product is visible on all stores" },
            { table: "StoreMapping", field: "EntityId", required: false },
            { table: "StoreMapping", field: "EntityName (=Product)", required: false },
            { table: "StoreMapping", field: "StoreId", required: false },
            { table: "Store", field: "Name (joined)", required: false }
          ]
        }
      },
      {
        method: "PUT",
        path: "/api/integration/v1/items/by-sku/{sku}/store-mappings",
        direction: "NetSuite → nop (push/upsert)",
        scope: "items.write",
        isNew: true,
        newLabel: "New in v1.6",
        idempotencyRequired: true,
        idempotencyRecipe: "NS:ItemStore:{externalItemId}:{storeSetHash}:{lastModifiedUtc}",
        approvalRequired: true,
        purpose: "Set store assignments for a product by SKU. Supports REPLACE or MERGE modes, or allStores=true to make the product visible across every store.",
        versionNotes: [
          "If allStores is true, sets LimitedToStores=false and removes StoreMapping rows for the product.",
          "If allStores is false or omitted, sets LimitedToStores=true and manages explicit StoreMapping rows.",
          "storeId or storeName may be supplied; storeName is resolved server-side.",
          "If approval enabled, stages in Acgs_PendingChange."
        ],
        fields: {
          "4.60": [
            { table: "Product", field: "SKU (from path)", required: true, type: "string" },
            { table: "(request body)", field: "allStores", required: false, type: "bool", notes: "If true, clears store mappings and makes the product visible everywhere" },
            { table: "(request body)", field: "mode", required: false, type: "string", notes: "'REPLACE' (default) or 'MERGE'" },
            { table: "(request body)", field: "stores", required: false, type: "object[]", notes: "Array of store assignments when allStores is false" },
            { table: "stores[]", field: "storeId", required: false, type: "int", notes: "Provide storeId or storeName" },
            { table: "stores[]", field: "storeName", required: false, type: "string", notes: "Server resolves Store.Id from Store.Name" },
            { table: "Acgs_PendingChange", field: "(staged if approval enabled)", required: false }
          ],
          "4.90": [
            { table: "Product", field: "Sku (from path)", required: true, type: "string" },
            { table: "(request body)", field: "allStores", required: false, type: "bool", notes: "If true, clears store mappings and makes the product visible everywhere" },
            { table: "(request body)", field: "mode", required: false, type: "string", notes: "'REPLACE' (default) or 'MERGE'" },
            { table: "(request body)", field: "stores", required: false, type: "object[]", notes: "Array of store assignments when allStores is false" },
            { table: "stores[]", field: "storeId", required: false, type: "int", notes: "Provide storeId or storeName" },
            { table: "stores[]", field: "storeName", required: false, type: "string", notes: "Server resolves Store.Id from Store.Name" },
            { table: "Acgs_PendingChange", field: "(staged if approval enabled)", required: false }
          ]
        }
      }
    ]
  },

  // ==========================================================
  // 1B) PRODUCT TAGS
  // ==========================================================
  {
    key: "product-tags",
    title: "Product tags",
    isNew: true,
    newLabel: "New in v1.6",
    description: "Ribbon and badge assignment endpoints for product labels such as Recyclable, PET, WSL, or New Arrival.",
    endpoints: [
      {
        method: "GET",
        path: "/api/integration/v1/items/by-sku/{sku}/tags",
        direction: "nop → middleware (pull)",
        scope: "items.read",
        isNew: true,
        newLabel: "New in v1.6",
        idempotencyRequired: false,
        approvalRequired: false,
        purpose: "Get all product tag assignments for a product by SKU. Returns tag names and IDs from Product_ProductTag_Mapping.",
        versionNotes: [
          "Supports ribbon and badge synchronization from NetSuite or middleware business rules.",
          "ProductTag and Product_ProductTag_Mapping tables are consistent across 4.60 and 4.90."
        ],
        fields: {
          "4.60": [
            { table: "Product", field: "SKU (from path)", required: true },
            { table: "Product_ProductTag_Mapping", field: "Product_Id/ProductTag_Id", required: false },
            { table: "ProductTag", field: "Id/Name", required: false }
          ],
          "4.90": [
            { table: "Product", field: "Sku (from path)", required: true },
            { table: "Product_ProductTag_Mapping", field: "Product_Id/ProductTag_Id", required: false },
            { table: "ProductTag", field: "Id/Name", required: false }
          ]
        }
      },
      {
        method: "PUT",
        path: "/api/integration/v1/items/by-sku/{sku}/tags",
        direction: "NetSuite/middleware → nop (push/upsert)",
        scope: "items.write",
        isNew: true,
        newLabel: "New in v1.6",
        idempotencyRequired: true,
        idempotencyRecipe: "NS:ItemTag:{externalItemId}:{tagSetHash}:{lastModifiedUtc}",
        approvalRequired: true,
        purpose: "Set product tag assignments for a product by SKU. Supports REPLACE or MERGE modes and creates missing ProductTag records when needed.",
        versionNotes: [
          "Used to automate frontend ribbons and badges such as Recyclable, PET, WSL, and New Arrival.",
          "Tag names are matched case-insensitively; missing ProductTag rows are created automatically.",
          "If approval enabled, stages in Acgs_PendingChange."
        ],
        fields: {
          "4.60": [
            { table: "Product", field: "SKU (from path)", required: true, type: "string" },
            { table: "(request body)", field: "mode", required: false, type: "string", notes: "'REPLACE' (default) or 'MERGE'" },
            { table: "(request body)", field: "tags", required: true, type: "string[]", notes: "Array of tag names e.g. ['Recyclable', 'WSL', 'PET']" },
            { table: "Acgs_PendingChange", field: "(staged if approval enabled)", required: false }
          ],
          "4.90": [
            { table: "Product", field: "Sku (from path)", required: true, type: "string" },
            { table: "(request body)", field: "mode", required: false, type: "string", notes: "'REPLACE' (default) or 'MERGE'" },
            { table: "(request body)", field: "tags", required: true, type: "string[]", notes: "Array of tag names e.g. ['Recyclable', 'WSL', 'PET']" },
            { table: "Acgs_PendingChange", field: "(staged if approval enabled)", required: false }
          ]
        }
      }
    ]
  },

  // ==========================================================
  // 1C) SPECIFICATION ATTRIBUTES
  // ==========================================================
  {
    key: "specification-attributes",
    title: "Specification attributes",
    isNew: true,
    newLabel: "New in v1.6",
    description: "Structured product metadata endpoints used for filtering, product-page display, and downstream merchandising logic.",
    endpoints: [
      {
        method: "GET",
        path: "/api/integration/v1/items/by-sku/{sku}/specifications",
        direction: "nop → middleware (pull)",
        scope: "items.read",
        isNew: true,
        newLabel: "New in v1.6",
        idempotencyRequired: false,
        approvalRequired: false,
        purpose: "Get all specification attribute assignments for a product by SKU. Returns attribute names, option values, and display settings.",
        versionNotes: [
          "Specification attributes differ from product attributes and tags: they drive filtering and structured PDP metadata.",
          "SpecificationAttribute, SpecificationAttributeOption, and Product_SpecificationAttribute_Mapping are consistent across 4.60 and 4.90."
        ],
        fields: {
          "4.60": [
            { table: "Product", field: "SKU (from path)", required: true },
            { table: "Product_SpecificationAttribute_Mapping", field: "ProductId/SpecificationAttributeOptionId/AllowFiltering/ShowOnProductPage/DisplayOrder", required: false },
            { table: "SpecificationAttributeOption", field: "Id/Name/DisplayOrder/ColorSquaresRgb", required: false },
            { table: "SpecificationAttribute", field: "Id/Name/DisplayOrder", required: false }
          ],
          "4.90": [
            { table: "Product", field: "Sku (from path)", required: true },
            { table: "Product_SpecificationAttribute_Mapping", field: "ProductId/SpecificationAttributeOptionId/AllowFiltering/ShowOnProductPage/DisplayOrder", required: false },
            { table: "SpecificationAttributeOption", field: "Id/Name/DisplayOrder/ColorSquaresRgb", required: false },
            { table: "SpecificationAttribute", field: "Id/Name/DisplayOrder", required: false }
          ]
        }
      },
      {
        method: "PUT",
        path: "/api/integration/v1/items/by-sku/{sku}/specifications",
        direction: "NetSuite/middleware → nop (push/upsert)",
        scope: "items.write",
        isNew: true,
        newLabel: "New in v1.6",
        idempotencyRequired: true,
        idempotencyRecipe: "NS:ItemSpec:{externalItemId}:{specSetHash}:{lastModifiedUtc}",
        approvalRequired: true,
        purpose: "Set specification attribute assignments for a product by SKU. Supports REPLACE or MERGE modes and creates missing specification attribute records when needed.",
        versionNotes: [
          "Each entry specifies attributeName, optionValue, allowFiltering, showOnProductPage, and displayOrder.",
          "Missing SpecificationAttribute or SpecificationAttributeOption rows are created automatically.",
          "If approval enabled, stages in Acgs_PendingChange."
        ],
        fields: {
          "4.60": [
            { table: "Product", field: "SKU (from path)", required: true, type: "string" },
            { table: "(request body)", field: "mode", required: false, type: "string", notes: "'REPLACE' (default) or 'MERGE'" },
            { table: "(request body)", field: "specifications", required: true, type: "object[]", notes: "Array of specification attribute assignments" },
            { table: "specifications[]", field: "attributeName", required: true, type: "string", notes: "e.g. 'Material' or 'Certification'" },
            { table: "specifications[]", field: "optionValue", required: true, type: "string", notes: "e.g. 'Recycled PET' or 'FSC'" },
            { table: "specifications[]", field: "allowFiltering", required: false, type: "bool", notes: "Default: true" },
            { table: "specifications[]", field: "showOnProductPage", required: false, type: "bool", notes: "Default: true" },
            { table: "specifications[]", field: "displayOrder", required: false, type: "int" },
            { table: "Acgs_PendingChange", field: "(staged if approval enabled)", required: false }
          ],
          "4.90": [
            { table: "Product", field: "Sku (from path)", required: true, type: "string" },
            { table: "(request body)", field: "mode", required: false, type: "string", notes: "'REPLACE' (default) or 'MERGE'" },
            { table: "(request body)", field: "specifications", required: true, type: "object[]", notes: "Array of specification attribute assignments" },
            { table: "specifications[]", field: "attributeName", required: true, type: "string", notes: "e.g. 'Material' or 'Certification'" },
            { table: "specifications[]", field: "optionValue", required: true, type: "string", notes: "e.g. 'Recycled PET' or 'FSC'" },
            { table: "specifications[]", field: "allowFiltering", required: false, type: "bool", notes: "Default: true" },
            { table: "specifications[]", field: "showOnProductPage", required: false, type: "bool", notes: "Default: true" },
            { table: "specifications[]", field: "displayOrder", required: false, type: "int" },
            { table: "Acgs_PendingChange", field: "(staged if approval enabled)", required: false }
          ]
        }
      }
    ]
  },

  // ==========================================================
  // 2) STOCK ON HAND
  // ==========================================================
  {
    key: "stock-on-hand",
    title: "Stock on hand",
    description: "Inventory updates: single-SKU update or bulk snapshot. The server auto-detects whether a SKU belongs to a base product (Product.StockQuantity) or a variant/combination (ProductAttributeCombination.StockQuantity) — the caller never needs to know. Multi-warehouse supported via ProductWarehouseInventory.",
    endpoints: [
      {
        method: "GET",
        path: "/api/integration/v1/inventory?sku={sku1,sku2}&includeReserved={bool}&includeVariants={bool}",
        direction: "nop → middleware (pull)",
        scope: "inventory.read",
        idempotencyRequired: false,
        approvalRequired: false,
        purpose: "Pull inventory snapshot for one or more SKUs. Supports repeatable sku param or comma-separated. Returns base product stock AND variant/combination stock when the product uses ManageInventoryMethodId=2 (TrackByAttributes).",
        versionNotes: [
          "If Product.UseMultipleWarehouses is true, returns per-warehouse breakdown from ProductWarehouseInventory.",
          "If single-warehouse, returns Product.StockQuantity.",
          "If ManageInventoryMethodId=2 (TrackByAttributes), also returns per-variant stock from ProductAttributeCombination.StockQuantity.",
          "includeVariants defaults to true — set to false to return only base product stock.",
          "SKU resolution: the server checks Product.SKU first, then falls back to ProductAttributeCombination.Sku — so you can pass variant SKUs directly."
        ],
        fields: {
          "4.60": [
            { table: "Product", field: "Id", required: true },
            { table: "Product", field: "SKU", required: true },
            { table: "Product", field: "ManageInventoryMethodId", required: true, notes: "0=DontManage, 1=ManageStock, 2=TrackByAttributes" },
            { table: "Product", field: "UseMultipleWarehouses", required: false },
            { table: "Product", field: "WarehouseId", required: false },
            { table: "Product", field: "StockQuantity", required: false, notes: "Base product stock (MethodId=1)" },
            { table: "ProductWarehouseInventory", field: "WarehouseId/StockQuantity/ReservedQuantity", required: false, notes: "Multi-warehouse breakdown" },
            { table: "ProductAttributeCombination", field: "Sku", required: false, notes: "Variant SKU (MethodId=2)" },
            { table: "ProductAttributeCombination", field: "StockQuantity", required: false, notes: "Per-variant stock" },
            { table: "ProductAttributeCombination", field: "AllowOutOfStockOrders", required: false }
          ],
          "4.90": [
            { table: "Product", field: "Id", required: true },
            { table: "Product", field: "Sku", required: true },
            { table: "Product", field: "ManageInventoryMethodId", required: true, notes: "0=DontManage, 1=ManageStock, 2=TrackByAttributes" },
            { table: "Product", field: "UseMultipleWarehouses", required: false },
            { table: "Product", field: "WarehouseId", required: false },
            { table: "Product", field: "StockQuantity", required: false, notes: "Base product stock (MethodId=1)" },
            { table: "ProductWarehouseInventory", field: "WarehouseId/StockQuantity/ReservedQuantity", required: false, notes: "Multi-warehouse breakdown" },
            { table: "ProductAttributeCombination", field: "Sku", required: false, notes: "Variant SKU (MethodId=2)" },
            { table: "ProductAttributeCombination", field: "StockQuantity", required: false, notes: "Per-variant stock" },
            { table: "ProductAttributeCombination", field: "AllowOutOfStockOrders", required: false }
          ]
        }
      },
      {
        method: "POST",
        path: "/api/integration/v1/inventory/by-sku/{sku}",
        direction: "NetSuite → nop (push/single)",
        scope: "inventory.write",
        idempotencyRequired: true,
        idempotencyRecipe: "NS:Inv:{warehouseId}:{sku}:{asOfUtc}",
        approvalRequired: false,
        purpose: "Update stock for a single SKU — works for BOTH base products and variant/combination SKUs. The server auto-detects: (1) If {sku} matches a Product.SKU → updates Product.StockQuantity (or ProductWarehouseInventory if multi-warehouse). (2) If {sku} matches a ProductAttributeCombination.Sku → updates that combination's StockQuantity. (3) If neither matches → returns 404. The caller never needs to know the inventory tracking method — just pass the SKU.",
        versionNotes: [
          "Smart SKU resolution order: Product.SKU first → ProductAttributeCombination.Sku fallback.",
          "If the SKU matches a base product with ManageInventoryMethodId=2 (TrackByAttributes), the endpoint returns a warning — stock should be updated on the variant SKUs, not the parent.",
          "For multi-warehouse products: pass warehouseId in the request body to upsert ProductWarehouseInventory for a specific warehouse.",
          "Approval is always OFF for inventory updates — changes apply immediately.",
          "Optionally writes a StockQuantityHistory audit entry with a custom message.",
          "Response includes the resolved type ('product' or 'combination'), previous and new quantities, and the parent SKU if a variant was updated."
        ],
        fields: {
          "4.60": [
            { table: "(from path)", field: "sku", required: true, type: "string", notes: "Base product SKU or variant/combination SKU — server auto-detects" },
            { table: "(request body)", field: "stockQuantity", required: true, type: "int" },
            { table: "(request body)", field: "warehouseId", required: false, type: "int", notes: "For multi-warehouse products only" },
            { table: "(request body)", field: "allowOutOfStockOrders", required: false, type: "bool", notes: "Only applies to variant/combination SKUs" },
            { table: "(request body)", field: "minStockQuantity", required: false, type: "int", notes: "Low stock threshold" },
            { table: "(request body)", field: "message", required: false, type: "string", notes: "Audit message for StockQuantityHistory" },
            { table: "StockQuantityHistory", field: "(auto-created)", required: false, notes: "Audit trail entry" }
          ],
          "4.90": [
            { table: "(from path)", field: "sku", required: true, type: "string", notes: "Base product SKU or variant/combination SKU — server auto-detects" },
            { table: "(request body)", field: "stockQuantity", required: true, type: "int" },
            { table: "(request body)", field: "warehouseId", required: false, type: "int", notes: "For multi-warehouse products only" },
            { table: "(request body)", field: "allowOutOfStockOrders", required: false, type: "bool", notes: "Only applies to variant/combination SKUs" },
            { table: "(request body)", field: "minStockQuantity", required: false, type: "int", notes: "Low stock threshold" },
            { table: "(request body)", field: "message", required: false, type: "string", notes: "Audit message for StockQuantityHistory" },
            { table: "StockQuantityHistory", field: "(auto-created)", required: false, notes: "Audit trail entry" }
          ]
        }
      },
      {
        method: "POST",
        path: "/api/integration/v1/inventory/snapshot",
        direction: "NetSuite → nop (push/bulk)",
        scope: "inventory.write",
        idempotencyRequired: true,
        idempotencyRecipe: "NS:InvSnap:{warehouseId}:{asOfUtc}",
        approvalRequired: false,
        purpose: "Bulk set inventory from a NetSuite snapshot. Send up to 10,000 SKUs in one call — the server auto-detects each SKU type (base product vs variant/combination) and updates the correct table. Returns per-item results including successes, not-found SKUs, and warnings.",
        versionNotes: [
          "Each SKU in the items array uses the same smart resolution as POST /inventory/by-sku/{sku}: tries Product.SKU first, then ProductAttributeCombination.Sku.",
          "You can freely mix base product SKUs and variant SKUs in the same snapshot — the server handles both.",
          "Approval is always OFF for inventory — all stock changes apply immediately without staging in Acgs_PendingChange. This is by design: inventory is time-sensitive and should not wait for human approval.",
          "If a SKU is not found as either a product or combination, it appears in the notFoundSkus array — the rest of the batch still processes.",
          "Processing is sequential — a failure on one SKU does not roll back others.",
          "asOfUtc is the timestamp of the NetSuite snapshot (e.g. when the inventory count was taken). Stored in StockQuantityHistory for audit.",
          "warehouseId is optional — if provided, all items update ProductWarehouseInventory for that specific warehouse."
        ],
        fields: {
          "4.60": [
            { table: "(request body)", field: "warehouseId", required: false, type: "int", notes: "If provided, updates ProductWarehouseInventory for this warehouse. If omitted, updates Product.StockQuantity or combination StockQuantity." },
            { table: "(request body)", field: "asOfUtc", required: false, type: "DateTime?", notes: "Snapshot timestamp from NetSuite — when the count was taken" },
            { table: "(request body)", field: "message", required: false, type: "string", notes: "Audit message applied to all StockQuantityHistory entries" },
            { table: "(request body)", field: "items", required: true, type: "object[]", notes: "Array of SKU+quantity entries; max 10,000; can mix base + variant SKUs" },
            { table: "items[]", field: "sku", required: true, type: "string", notes: "Base product SKU or variant/combination SKU — server auto-detects" },
            { table: "items[]", field: "stockQuantity", required: true, type: "int" }
          ],
          "4.90": [
            { table: "(request body)", field: "warehouseId", required: false, type: "int", notes: "If provided, updates ProductWarehouseInventory for this warehouse. If omitted, updates Product.StockQuantity or combination StockQuantity." },
            { table: "(request body)", field: "asOfUtc", required: false, type: "DateTime?", notes: "Snapshot timestamp from NetSuite — when the count was taken" },
            { table: "(request body)", field: "message", required: false, type: "string", notes: "Audit message applied to all StockQuantityHistory entries" },
            { table: "(request body)", field: "items", required: true, type: "object[]", notes: "Array of SKU+quantity entries; max 10,000; can mix base + variant SKUs" },
            { table: "items[]", field: "sku", required: true, type: "string", notes: "Base product SKU or variant/combination SKU — server auto-detects" },
            { table: "items[]", field: "stockQuantity", required: true, type: "int" }
          ]
        }
      }
    ]
  },

  // ==========================================================
  // 3) CUSTOMER DATA
  // ==========================================================
  {
    key: "customer-data",
    title: "Customer data",
    description: "Customer master sync (optional — minimal sync principle). Upsert by email. Roles mapped via Customer_CustomerRole_Mapping.",
    endpoints: [
      {
        method: "GET",
        path: "/api/integration/v1/customers?page={p}&pageSize={n}&updatedSinceUtc={utc}&email={email}",
        direction: "nop → middleware (pull/export)",
        scope: "customers.read",
        idempotencyRequired: false,
        approvalRequired: false,
        purpose: "Export customers (paginated, incremental). Includes roles.",
        versionNotes: ["4.90 adds Customer.MustChangePassword (optional; do not rely on it)."],
        fields: {
          "4.60": [
            { table: "Customer", field: "Id", required: true },
            { table: "Customer", field: "Email", required: false },
            { table: "Customer", field: "Username", required: false },
            { table: "Customer", field: "FirstName", required: false },
            { table: "Customer", field: "LastName", required: false },
            { table: "Customer", field: "Company", required: false },
            { table: "Customer", field: "Phone", required: false },
            { table: "Customer", field: "VatNumber", required: false },
            { table: "Customer", field: "Active", required: true },
            { table: "Customer", field: "Deleted", required: true },
            { table: "Customer", field: "RegisteredInStoreId", required: false },
            { table: "Customer", field: "CreatedOnUtc", required: true },
            { table: "Customer", field: "LastActivityDateUtc", required: false },
            { table: "Customer_CustomerRole_Mapping", field: "Customer_Id", required: false },
            { table: "CustomerRole", field: "SystemName", required: false }
          ],
          "4.90": [
            { table: "Customer", field: "Id", required: true },
            { table: "Customer", field: "Email", required: false },
            { table: "Customer", field: "Username", required: false },
            { table: "Customer", field: "FirstName", required: false },
            { table: "Customer", field: "LastName", required: false },
            { table: "Customer", field: "Company", required: false },
            { table: "Customer", field: "Phone", required: false },
            { table: "Customer", field: "VatNumber", required: false },
            { table: "Customer", field: "MustChangePassword", required: false, notes: "4.90 only" },
            { table: "Customer", field: "Active", required: true },
            { table: "Customer", field: "Deleted", required: true },
            { table: "Customer", field: "RegisteredInStoreId", required: false },
            { table: "Customer", field: "CreatedOnUtc", required: true },
            { table: "Customer", field: "LastActivityDateUtc", required: false },
            { table: "Customer_CustomerRole_Mapping", field: "Customer_Id", required: false },
            { table: "CustomerRole", field: "SystemName", required: false }
          ]
        }
      },
      {
        method: "PUT",
        path: "/api/integration/v1/customers/by-email/{email}",
        direction: "NetSuite → nop (push/upsert)",
        scope: "customers.write",
        idempotencyRequired: true,
        idempotencyRecipe: "NS:Cust:{externalCustomerId}:{lastModifiedUtc}",
        approvalRequired: false,
        purpose: "Upsert customer by email. Creates if not found, updates if exists. Manages role assignments. Stores external ref in Acgs_ExternalReference.",
        versionNotes: [
          "May be optional for COD flows (order payload carries address details instead).",
          "Roles are resolved by SystemName — the endpoint does not create new CustomerRole records. Pass only existing role SystemNames.",
          "If a role SystemName is not found, the endpoint returns a VALIDATION_ERROR.",
          "Default Nopcommerce customer roles: Administrators (Id=1), Forum Moderators (Id=2), Registered (Id=3), Guests (Id=4), Vendors (Id=5). Custom roles (e.g. 'Wholesale') must be created in Admin → Customers → Customer roles before they can be assigned via this endpoint.",
          "Role assignment is idempotent — if the customer already has a role, re-assigning it is a no-op."
        ],
        fields: {
          "4.60": [
            { table: "Customer", field: "Email (from path)", required: true },
            { table: "Customer", field: "Username", required: false },
            { table: "Customer", field: "FirstName", required: false },
            { table: "Customer", field: "LastName", required: false },
            { table: "Customer", field: "Company", required: false },
            { table: "Customer", field: "Phone", required: false },
            { table: "Customer", field: "VatNumber", required: false },
            { table: "Customer", field: "Active", required: true },
            { table: "Customer_CustomerRole_Mapping", field: "CustomerRole.SystemName", required: false },
            { table: "Acgs_ExternalReference", field: "ExternalId (NetSuite Customer)", required: false }
          ],
          "4.90": [
            { table: "Customer", field: "Email (from path)", required: true },
            { table: "Customer", field: "Username", required: false },
            { table: "Customer", field: "FirstName", required: false },
            { table: "Customer", field: "LastName", required: false },
            { table: "Customer", field: "Company", required: false },
            { table: "Customer", field: "Phone", required: false },
            { table: "Customer", field: "VatNumber", required: false },
            { table: "Customer", field: "Active", required: true },
            { table: "Customer_CustomerRole_Mapping", field: "CustomerRole.SystemName", required: false },
            { table: "Acgs_ExternalReference", field: "ExternalId (NetSuite Customer)", required: false }
          ]
        }
      }
    ]
  },

  // ==========================================================
  // 4) CONTACTS (ADDRESSES)
  // ==========================================================
  {
    key: "contacts",
    title: "Contacts (addresses)",
    description: "Customer addresses (ship-to records). Upsert by addressKey stored in Acgs_ExternalReference.",
    endpoints: [
      {
        method: "GET",
        path: "/api/integration/v1/customers/{customerId}/addresses",
        direction: "nop → middleware (pull)",
        scope: "contacts.read",
        idempotencyRequired: false,
        approvalRequired: false,
        purpose: "Pull all addresses linked to a customer.",
        versionNotes: ["Address fields are consistent across 4.60 and 4.90."],
        fields: {
          "4.60": [
            { table: "CustomerAddresses", field: "Customer_Id", required: true },
            { table: "Address", field: "Id", required: true },
            { table: "Address", field: "FirstName/LastName/Email/Company", required: false },
            { table: "Address", field: "PhoneNumber", required: false },
            { table: "Address", field: "Address1/Address2/City/ZipPostalCode", required: false },
            { table: "Address", field: "CountryId/StateProvinceId", required: false },
            { table: "Address", field: "CustomAttributes", required: false }
          ],
          "4.90": [
            { table: "CustomerAddresses", field: "Customer_Id", required: true },
            { table: "Address", field: "Id", required: true },
            { table: "Address", field: "FirstName/LastName/Email/Company", required: false },
            { table: "Address", field: "PhoneNumber", required: false },
            { table: "Address", field: "Address1/Address2/City/ZipPostalCode", required: false },
            { table: "Address", field: "CountryId/StateProvinceId", required: false },
            { table: "Address", field: "CustomAttributes", required: false }
          ]
        }
      },
      {
        method: "POST",
        path: "/api/integration/v1/customers/{customerId}/addresses",
        direction: "NetSuite → nop (push/upsert)",
        scope: "contacts.write",
        idempotencyRequired: true,
        idempotencyRecipe: "NS:ShipTo:{externalCustomerId}:{addressKey}:{lastModifiedUtc}",
        approvalRequired: false,
        purpose: "Add or update address by addressKey. If addressKey exists in Acgs_ExternalReference, updates; else creates and links to customer.",
        versionNotes: ["addressKey stored in Acgs_ExternalReference (EntityType=Address, ExternalType=ShipTo)."],
        fields: {
          "4.60": [
            { table: "Address", field: "FirstName/LastName/Email/Company", required: false },
            { table: "Address", field: "PhoneNumber", required: false },
            { table: "Address", field: "Address1", required: true },
            { table: "Address", field: "City", required: true },
            { table: "Address", field: "CountryId", required: false },
            { table: "Address", field: "StateProvinceId", required: false },
            { table: "Address", field: "ZipPostalCode", required: false },
            { table: "CustomerAddresses", field: "Customer_Id / Address_Id", required: true },
            { table: "Acgs_ExternalReference", field: "addressKey → ExternalId", required: false }
          ],
          "4.90": [
            { table: "Address", field: "FirstName/LastName/Email/Company", required: false },
            { table: "Address", field: "PhoneNumber", required: false },
            { table: "Address", field: "Address1", required: true },
            { table: "Address", field: "City", required: true },
            { table: "Address", field: "CountryId", required: false },
            { table: "Address", field: "StateProvinceId", required: false },
            { table: "Address", field: "ZipPostalCode", required: false },
            { table: "CustomerAddresses", field: "Customer_Id / Address_Id", required: true },
            { table: "Acgs_ExternalReference", field: "addressKey → ExternalId", required: false }
          ]
        }
      }
    ]
  },

  // ==========================================================
  // 5) PRICING
  // ==========================================================
  {
    key: "pricing",
    title: "Pricing",
    description: "Base price + tier prices consolidated into one upsert endpoint per SKU. Supports REPLACE or MERGE mode for tiers.",
    endpoints: [
      {
        method: "GET",
        path: "/api/integration/v1/pricing/by-sku/{sku}",
        direction: "nop → middleware (pull)",
        scope: "pricing.read",
        idempotencyRequired: false,
        approvalRequired: false,
        purpose: "Get base price (price, oldPrice, cost) and all tier prices for a SKU.",
        versionNotes: [
          "TierPrice table is consistent across 4.60 and 4.90.",
          "This endpoint is for the parent/base product SKU. Variant-specific price overrides belong on ProductAttributeCombination and are returned or maintained through the combinations and full-sync item endpoints."
        ],
        fields: {
          "4.60": [
            { table: "Product", field: "SKU", required: true },
            { table: "Product", field: "Price", required: true },
            { table: "Product", field: "OldPrice", required: false },
            { table: "Product", field: "ProductCost", required: false },
            { table: "TierPrice", field: "ProductId", required: false },
            { table: "TierPrice", field: "Quantity", required: false },
            { table: "TierPrice", field: "Price", required: false },
            { table: "TierPrice", field: "StoreId", required: false },
            { table: "TierPrice", field: "CustomerRoleId", required: false },
            { table: "TierPrice", field: "StartDateTimeUtc", required: false },
            { table: "TierPrice", field: "EndDateTimeUtc", required: false }
          ],
          "4.90": [
            { table: "Product", field: "Sku", required: true },
            { table: "Product", field: "Price", required: true },
            { table: "Product", field: "OldPrice", required: false },
            { table: "Product", field: "ProductCost", required: false },
            { table: "TierPrice", field: "ProductId", required: false },
            { table: "TierPrice", field: "Quantity", required: false },
            { table: "TierPrice", field: "Price", required: false },
            { table: "TierPrice", field: "StoreId", required: false },
            { table: "TierPrice", field: "CustomerRoleId", required: false },
            { table: "TierPrice", field: "StartDateTimeUtc", required: false },
            { table: "TierPrice", field: "EndDateTimeUtc", required: false }
          ]
        }
      },
      {
        method: "PUT",
        path: "/api/integration/v1/pricing/by-sku/{sku}",
        direction: "NetSuite → nop (push/upsert)",
        scope: "pricing.write",
        idempotencyRequired: true,
        idempotencyRecipe: "NS:Price:{priceListOrContractId}:{sku}:{lastModifiedUtc}",
        approvalRequired: true,
        purpose: "Upsert base price + tier prices for a SKU. Mode: REPLACE (delete existing tiers then insert) or MERGE (upsert by composite key). Approval optional (configurable).",
        versionNotes: [
          "Request schema: PricingUpsertRequest (Part 6 §6.3.4.1).",
          "The {sku} path value identifies the parent/base product SKU. Do not use a variant or combination SKU here; variant-specific price overrides belong in combinations[].overriddenPrice on the item combination routes."
        ],
        fields: {
          "4.60": [
            { table: "Product", field: "SKU (from path)", required: true, type: "string" },
            { table: "(request body)", field: "price", required: true, type: "decimal" },
            { table: "(request body)", field: "oldPrice", required: false, type: "decimal" },
            { table: "(request body)", field: "productCost", required: false, type: "decimal" },
            { table: "(request body)", field: "mode", required: false, type: "string", notes: "'REPLACE' (default) or 'MERGE'" },
            { table: "(request body)", field: "tierPrices", required: false, type: "object[]", notes: "Array of tier price entries" },
            { table: "tierPrices[]", field: "quantity", required: true, type: "int" },
            { table: "tierPrices[]", field: "price", required: true, type: "decimal" },
            { table: "tierPrices[]", field: "storeId", required: true, type: "int" },
            { table: "tierPrices[]", field: "customerRoleId", required: false, type: "int" },
            { table: "tierPrices[]", field: "startDateTimeUtc/endDateTimeUtc", required: false, type: "DateTime?" },
            { table: "Acgs_PendingChange", field: "(staged if approval enabled)", required: false }
          ],
          "4.90": [
            { table: "Product", field: "Sku (from path)", required: true, type: "string" },
            { table: "(request body)", field: "price", required: true, type: "decimal" },
            { table: "(request body)", field: "oldPrice", required: false, type: "decimal" },
            { table: "(request body)", field: "productCost", required: false, type: "decimal" },
            { table: "(request body)", field: "mode", required: false, type: "string", notes: "'REPLACE' (default) or 'MERGE'" },
            { table: "(request body)", field: "tierPrices", required: false, type: "object[]", notes: "Array of tier price entries" },
            { table: "tierPrices[]", field: "quantity", required: true, type: "int" },
            { table: "tierPrices[]", field: "price", required: true, type: "decimal" },
            { table: "tierPrices[]", field: "storeId", required: true, type: "int" },
            { table: "tierPrices[]", field: "customerRoleId", required: false, type: "int" },
            { table: "tierPrices[]", field: "startDateTimeUtc/endDateTimeUtc", required: false, type: "DateTime?" },
            { table: "Acgs_PendingChange", field: "(staged if approval enabled)", required: false }
          ]
        }
      }
    ]
  },

  // ==========================================================
  // 6) RFQ
  // ==========================================================
  {
    key: "rfq",
    title: "RFQ (provider-based)",
    description: "Request-for-quote. Provider-based: Native490 (RFQRequestQuote tables), Plugin, or Disabled. Returns 501 RFQ_NOT_SUPPORTED if disabled.",
    endpoints: [
      {
        method: "GET", path: "/api/integration/v1/rfqs/requests?status={status}&sinceUtc={utc}&page={p}&pageSize={n}",
        direction: "nop → NetSuite (export)", scope: "rfq.read", idempotencyRequired: false, approvalRequired: false,
        purpose: "Export RFQ requests for NetSuite processing.",
        versionNotes: ["4.60: NS_QuoteRequest* tables (if present). 4.90: RFQRequestQuote* tables (if present). Returns 501 if provider disabled."],
        fields: {
          "4.60": [
            { table: "NS_QuoteRequest", field: "Id/CustomerId/StoreId/RequestStatusId/CreatedOnUtc", required: true, notes: "Non-standard" },
            { table: "NS_QuoteRequestItem", field: "QuoteRequestId/ProductId/Quantity", required: true }
          ],
          "4.90": [
            { table: "RFQRequestQuote", field: "Id/CustomerId/StatusId/CreatedOnUtc", required: true, notes: "Non-standard" },
            { table: "RFQRequestQuoteItem", field: "RequestQuoteId/ProductId/RequestedQty", required: true }
          ]
        }
      },
      {
        method: "POST", path: "/api/integration/v1/rfqs/quotes/{quoteId}",
        direction: "NetSuite → nop (push)", scope: "rfq.write", idempotencyRequired: true,
        idempotencyRecipe: "NS:RfqQuote:{quoteId}:{updatedOnUtc}", approvalRequired: false,
        purpose: "Update RFQ quote status and offered prices/qty per item (NetSuite responds to RFQ).",
        versionNotes: ["4.90 maps to RFQQuote.StatusId + RFQQuoteItem.OfferedQty/OfferedUnitPrice."],
        fields: {
          "4.60": [
            { table: "NS_QuoteRequest", field: "RequestStatusId", required: true },
            { table: "NS_QuoteNote", field: "ExternalQuotationNumber", required: false }
          ],
          "4.90": [
            { table: "RFQQuote", field: "StatusId/ExpirationDateUtc/AdminNotes", required: true },
            { table: "RFQQuoteItem", field: "OfferedQty/OfferedUnitPrice", required: false }
          ]
        }
      }
    ]
  },

  // ==========================================================
  // 7) QUOTES
  // ==========================================================
  {
    key: "quotes",
    title: "Quotes (provider-based)",
    description: "Non-RFQ quote workflows. Provider-based: Legacy460 (NS_Quote* tables), Plugin, or Disabled. Returns 501 QUOTES_NOT_SUPPORTED if disabled.",
    endpoints: [
      {
        method: "GET", path: "/api/integration/v1/quotes?page={p}&pageSize={n}",
        direction: "nop → middleware (pull)", scope: "quotes.read", idempotencyRequired: false, approvalRequired: false,
        purpose: "Pull quote requests for reconciliation.",
        versionNotes: ["4.60: NS_QuoteRequest + NS_QuoteNote tables. 4.90: likely disabled unless plugin tables created."],
        fields: { "4.60": [{ table: "NS_QuoteRequest", field: "Id/RequestStatusId/CreatedOnUtc", required: true }], "4.90": [] }
      },
      {
        method: "POST", path: "/api/integration/v1/quotes/{quoteId}/status",
        direction: "NetSuite → nop (push)", scope: "quotes.write", idempotencyRequired: true,
        idempotencyRecipe: "NS:Quote:{quoteId}:{statusId}:{updatedOnUtc}", approvalRequired: false,
        purpose: "Update quote status + optional PDF/notes for customer portal display.",
        versionNotes: ["Minimal if quotes are email-only and not portal-visible."],
        fields: { "4.60": [{ table: "NS_QuoteRequest", field: "RequestStatusId", required: true }], "4.90": [] }
      }
    ]
  },

  // ==========================================================
  // 8) OFFLINE TRANSACTIONS
  // ==========================================================
  {
    key: "offline-transactions",
    title: "Offline transaction info",
    description: "NetSuite-originated transactions (invoices, credits, payments) stored in plugin tables for nop visibility. Not forced into nop Order table.",
    endpoints: [
      {
        method: "POST", path: "/api/integration/v1/offline-transactions",
        direction: "NetSuite → nop (push/import)", scope: "offline.write", idempotencyRequired: true,
        idempotencyRecipe: "NS:Txn:{transactionType}:{netSuiteId}", approvalRequired: false,
        purpose: "Import an offline transaction (Invoice, CashSale, CreditMemo) with line items.",
        versionNotes: ["Stored in Acgs_OfflineTransaction + Acgs_OfflineTransactionLine. Unique by (StoreId, ExternalSystem, ExternalId)."],
        fields: {
          "4.60": [
            { table: "(request body)", field: "externalId", required: true, type: "string", notes: "NetSuite transaction ID" },
            { table: "(request body)", field: "transactionType", required: true, type: "string", notes: "'Invoice' | 'CashSale' | 'CreditMemo'" },
            { table: "(request body)", field: "customerEmail", required: false, type: "string" },
            { table: "(request body)", field: "transactionDateUtc", required: true, type: "DateTime" },
            { table: "(request body)", field: "currencyCode", required: true, type: "string" },
            { table: "(request body)", field: "total", required: true, type: "decimal" },
            { table: "(request body)", field: "status", required: true, type: "string", notes: "'Open' | 'Paid' | 'Cancelled'" },
            { table: "(request body)", field: "lines", required: true, type: "object[]", notes: "Array of transaction line items" },
            { table: "lines[]", field: "sku", required: true, type: "string" },
            { table: "lines[]", field: "quantity", required: true, type: "int" },
            { table: "lines[]", field: "unitPrice", required: true, type: "decimal" },
            { table: "lines[]", field: "lineTotal", required: true, type: "decimal" }
          ],
          "4.90": [
            { table: "(request body)", field: "externalId", required: true, type: "string", notes: "NetSuite transaction ID" },
            { table: "(request body)", field: "transactionType", required: true, type: "string", notes: "'Invoice' | 'CashSale' | 'CreditMemo'" },
            { table: "(request body)", field: "customerEmail", required: false, type: "string" },
            { table: "(request body)", field: "transactionDateUtc", required: true, type: "DateTime" },
            { table: "(request body)", field: "currencyCode", required: true, type: "string" },
            { table: "(request body)", field: "total", required: true, type: "decimal" },
            { table: "(request body)", field: "status", required: true, type: "string", notes: "'Open' | 'Paid' | 'Cancelled'" },
            { table: "(request body)", field: "lines", required: true, type: "object[]", notes: "Array of transaction line items" },
            { table: "lines[]", field: "sku", required: true, type: "string" },
            { table: "lines[]", field: "quantity", required: true, type: "int" },
            { table: "lines[]", field: "unitPrice", required: true, type: "decimal" },
            { table: "lines[]", field: "lineTotal", required: true, type: "decimal" }
          ]
        }
      },
      {
        method: "GET", path: "/api/integration/v1/offline-transactions?customerEmail={email}&sinceUtc={utc}&page={p}&pageSize={n}",
        direction: "nop → middleware (pull)", scope: "offline.read", idempotencyRequired: false, approvalRequired: false,
        purpose: "Fetch offline transactions for reconciliation or customer portal display.",
        versionNotes: ["Reads from plugin tables."],
        fields: { "4.60": [{ table: "Acgs_OfflineTransaction", field: "All columns", required: false }], "4.90": [{ table: "Acgs_OfflineTransaction", field: "All columns", required: false }] }
      }
    ]
  },

  // ==========================================================
  // 9) SALES (ORDERS)
  // ==========================================================
  {
    key: "sales",
    title: "Sales (orders)",
    description: "Order export from nop and status/payment updates from NetSuite. Sensitive card data (CardNumber, CardCvv2) is NEVER exposed.",
    endpoints: [
      {
        method: "GET", path: "/api/integration/v1/orders?sinceUtc={utc}&orderStatusId={id}&paymentStatusId={id}&storeId={id}&page={p}&pageSize={n}",
        direction: "nop → NetSuite (export)", scope: "orders.read", idempotencyRequired: false, approvalRequired: false,
        purpose: "Export orders (header + items + resolved billing/shipping addresses). COD orders include transactional address/VAT from checkout.",
        versionNotes: ["Schema: OrderExport (Part 6 §6.3.7). Max pageSize 500. Never exposes CardNumber/CardCvv2."],
        fields: {
          "4.60": [
            { table: "Order", field: "Id/OrderGuid/CustomOrderNumber", required: true },
            { table: "Order", field: "StoreId/CustomerId/CustomerIp", required: true },
            { table: "Order", field: "CreatedOnUtc/PaidDateUtc", required: true },
            { table: "Order", field: "OrderStatusId/PaymentStatusId/ShippingStatusId", required: true },
            { table: "Order", field: "PaymentMethodSystemName/MaskedCreditCardNumber", required: false },
            { table: "Order", field: "AuthorizationTransactionId/CaptureTransactionId", required: false },
            { table: "Order", field: "VatNumber", required: false },
            { table: "Order", field: "OrderTotal/OrderTax/OrderDiscount/RefundedAmount", required: true },
            { table: "Order", field: "OrderShippingInclTax/OrderShippingExclTax", required: false },
            { table: "Order", field: "OrderSubtotalInclTax/OrderSubtotalExclTax", required: false },
            { table: "Order", field: "BillingAddressId/ShippingAddressId/PickupAddressId/PickupInStore", required: false },
            { table: "Address", field: "FirstName/LastName/Company/PhoneNumber/Address1/Address2/City/ZipPostalCode/CountryId/StateProvinceId", required: false },
            { table: "OrderItem", field: "Id/ProductId/Quantity", required: true },
            { table: "OrderItem", field: "UnitPriceInclTax/UnitPriceExclTax/PriceInclTax/PriceExclTax", required: false },
            { table: "OrderItem", field: "DiscountAmountInclTax/DiscountAmountExclTax", required: false },
            { table: "OrderItem", field: "AttributesXml/AttributeDescription/OriginalProductCost", required: false },
            { table: "Product", field: "SKU (joined for each OrderItem)", required: false }
          ],
          "4.90": [
            { table: "Order", field: "Id/OrderGuid/CustomOrderNumber", required: true },
            { table: "Order", field: "StoreId/CustomerId/CustomerIp", required: true },
            { table: "Order", field: "CreatedOnUtc/PaidDateUtc", required: true },
            { table: "Order", field: "OrderStatusId/PaymentStatusId/ShippingStatusId", required: true },
            { table: "Order", field: "PaymentMethodSystemName/MaskedCreditCardNumber", required: false },
            { table: "Order", field: "AuthorizationTransactionId/CaptureTransactionId", required: false },
            { table: "Order", field: "VatNumber", required: false },
            { table: "Order", field: "OrderTotal/OrderTax/OrderDiscount/RefundedAmount", required: true },
            { table: "Order", field: "OrderShippingInclTax/OrderShippingExclTax", required: false },
            { table: "Order", field: "OrderSubtotalInclTax/OrderSubtotalExclTax", required: false },
            { table: "Order", field: "BillingAddressId/ShippingAddressId/PickupAddressId/PickupInStore", required: false },
            { table: "Address", field: "FirstName/LastName/Company/PhoneNumber/Address1/Address2/City/ZipPostalCode/CountryId/StateProvinceId", required: false },
            { table: "OrderItem", field: "Id/ProductId/Quantity", required: true },
            { table: "OrderItem", field: "UnitPriceInclTax/UnitPriceExclTax/PriceInclTax/PriceExclTax", required: false },
            { table: "OrderItem", field: "DiscountAmountInclTax/DiscountAmountExclTax", required: false },
            { table: "OrderItem", field: "AttributesXml/AttributeDescription/OriginalProductCost", required: false },
            { table: "Product", field: "Sku (joined for each OrderItem)", required: false }
          ]
        }
      },
      {
        method: "POST", path: "/api/integration/v1/orders/{orderId}/status",
        direction: "NetSuite → nop (push)", scope: "orders.write", idempotencyRequired: true,
        idempotencyRecipe: "NS:SOStatus:{netSuiteSalesOrderId}:{updatedOnUtc}:{orderStatusId}:{shippingStatusId}:{paymentStatusId}",
        approvalRequired: false,
        purpose: "Update order status fields. Stores NetSuite SO id in Acgs_ExternalReference. Optionally appends OrderNote.",
        versionNotes: ["If paymentStatus transitions to Paid, sets Order.PaidDateUtc if not already set."],
        fields: {
          "4.60": [
            { table: "Order", field: "Id (from path)", required: true },
            { table: "Order", field: "OrderStatusId", required: true },
            { table: "Order", field: "ShippingStatusId", required: true },
            { table: "Order", field: "PaymentStatusId", required: true },
            { table: "Order", field: "PaidDateUtc", required: false, notes: "Set if transitioning to Paid" },
            { table: "Acgs_ExternalReference", field: "EntityType=Order, ExternalType=SalesOrder", required: false },
            { table: "OrderNote", field: "Note/DisplayToCustomer", required: false }
          ],
          "4.90": [
            { table: "Order", field: "Id (from path)", required: true },
            { table: "Order", field: "OrderStatusId", required: true },
            { table: "Order", field: "ShippingStatusId", required: true },
            { table: "Order", field: "PaymentStatusId", required: true },
            { table: "Order", field: "PaidDateUtc", required: false, notes: "Set if transitioning to Paid" },
            { table: "Acgs_ExternalReference", field: "EntityType=Order, ExternalType=SalesOrder", required: false },
            { table: "OrderNote", field: "Note/DisplayToCustomer", required: false }
          ]
        }
      }
    ]
  },

  // ==========================================================
  // 10) CUSTOMER PAYMENTS
  // ==========================================================
  {
    key: "customer-payments",
    title: "Customer payments",
    description: "Payment status updates on orders. nop stores payment state on Order (no separate payment ledger).",
    endpoints: [
      {
        method: "GET", path: "/api/integration/v1/payments?sinceUtc={utc}&paymentStatusId=30&storeId={id}&page={p}&pageSize={n}",
        direction: "nop → middleware (pull/export)", scope: "payments.read", idempotencyRequired: false, approvalRequired: false,
        purpose: "Export paid orders with transaction fields (AuthorizationTransactionId, CaptureTransactionId, PaidDateUtc, totals).",
        versionNotes: ["Essentially a filtered view of orders with payment fields."],
        fields: {
          "4.60": [
            { table: "Order", field: "Id/PaymentStatusId/PaidDateUtc", required: true },
            { table: "Order", field: "AuthorizationTransactionId/CaptureTransactionId", required: false },
            { table: "Order", field: "OrderTotal/RefundedAmount", required: false }
          ],
          "4.90": [
            { table: "Order", field: "Id/PaymentStatusId/PaidDateUtc", required: true },
            { table: "Order", field: "AuthorizationTransactionId/CaptureTransactionId", required: false },
            { table: "Order", field: "OrderTotal/RefundedAmount", required: false }
          ]
        }
      },
      {
        method: "POST", path: "/api/integration/v1/orders/{orderId}/payment",
        direction: "NetSuite → nop (push)", scope: "payments.write", idempotencyRequired: true,
        idempotencyRecipe: "NS:Payment:{netSuitePaymentId}",
        approvalRequired: false,
        purpose: "Update payment status, PaidDateUtc, RefundedAmount. Stores NetSuite payment id in Acgs_ExternalReference.",
        versionNotes: [],
        fields: {
          "4.60": [
            { table: "Order", field: "Id (from path)", required: true },
            { table: "Order", field: "PaymentStatusId", required: true },
            { table: "Order", field: "PaidDateUtc", required: false },
            { table: "Order", field: "RefundedAmount", required: false },
            { table: "Acgs_ExternalReference", field: "EntityType=Order, ExternalType=Payment", required: false }
          ],
          "4.90": [
            { table: "Order", field: "Id (from path)", required: true },
            { table: "Order", field: "PaymentStatusId", required: true },
            { table: "Order", field: "PaidDateUtc", required: false },
            { table: "Order", field: "RefundedAmount", required: false },
            { table: "Acgs_ExternalReference", field: "EntityType=Order, ExternalType=Payment", required: false }
          ]
        }
      }
    ]
  },

  // ==========================================================
  // 11) VOUCHERS
  // ==========================================================
  {
    key: "vouchers",
    title: "Vouchers",
    description: "Discount coupon codes, gift cards, and discount usage history. Upsert by coupon code or gift card code. Export usage for reconciliation.",
    endpoints: [
      {
        method: "GET", path: "/api/integration/v1/vouchers/discounts?page={p}&pageSize={n}",
        direction: "nop → middleware (pull)", scope: "vouchers.read", idempotencyRequired: false, approvalRequired: false,
        purpose: "Pull discount definitions for reconciliation.",
        versionNotes: ["4.90 includes Discount.VendorId; 4.60 does not."],
        fields: {
          "4.60": [
            { table: "Discount", field: "Id/Name/CouponCode/RequiresCouponCode", required: true },
            { table: "Discount", field: "UsePercentage/DiscountPercentage/DiscountAmount", required: false },
            { table: "Discount", field: "MaximumDiscountAmount/StartDateUtc/EndDateUtc", required: false },
            { table: "Discount", field: "IsActive/IsCumulative/DiscountTypeId", required: false },
            { table: "Discount", field: "DiscountLimitationId/LimitationTimes/MaximumDiscountedQuantity", required: false },
            { table: "Discount", field: "AppliedToSubCategories", required: false }
          ],
          "4.90": [
            { table: "Discount", field: "Id/Name/CouponCode/RequiresCouponCode", required: true },
            { table: "Discount", field: "VendorId", required: false, notes: "4.90 only" },
            { table: "Discount", field: "UsePercentage/DiscountPercentage/DiscountAmount", required: false },
            { table: "Discount", field: "MaximumDiscountAmount/StartDateUtc/EndDateUtc", required: false },
            { table: "Discount", field: "IsActive/IsCumulative/DiscountTypeId", required: false },
            { table: "Discount", field: "DiscountLimitationId/LimitationTimes/MaximumDiscountedQuantity", required: false },
            { table: "Discount", field: "AppliedToSubCategories", required: false }
          ]
        }
      },
      {
        method: "PUT", path: "/api/integration/v1/vouchers/discounts/by-code/{couponCode}",
        direction: "NetSuite → nop (push/upsert)", scope: "vouchers.write", idempotencyRequired: true,
        idempotencyRecipe: "NS:Discount:{couponCode}:{lastModifiedUtc}", approvalRequired: true,
        purpose: "Upsert discount by coupon code. Approval optional (configurable). Schema: DiscountUpsertRequest (Part 6 §6.3.9.1).",
        versionNotes: ["4.90 supports vendorId field; ignored on 4.60."],
        fields: {
          "4.60": [
            { table: "Discount", field: "CouponCode (from path)", required: true },
            { table: "Discount", field: "Name/DiscountTypeId/UsePercentage", required: true },
            { table: "Discount", field: "DiscountAmount/DiscountPercentage/MaximumDiscountAmount", required: false },
            { table: "Discount", field: "StartDateUtc/EndDateUtc/RequiresCouponCode/IsActive/IsCumulative", required: false },
            { table: "Discount", field: "DiscountLimitationId/LimitationTimes", required: false },
            { table: "Acgs_PendingChange", field: "(staged if approval enabled)", required: false }
          ],
          "4.90": [
            { table: "Discount", field: "CouponCode (from path)", required: true },
            { table: "Discount", field: "Name/DiscountTypeId/UsePercentage", required: true },
            { table: "Discount", field: "DiscountAmount/DiscountPercentage/MaximumDiscountAmount", required: false },
            { table: "Discount", field: "StartDateUtc/EndDateUtc/RequiresCouponCode/IsActive/IsCumulative", required: false },
            { table: "Discount", field: "DiscountLimitationId/LimitationTimes", required: false },
            { table: "Discount", field: "VendorId", required: false, notes: "4.90 only" },
            { table: "Acgs_PendingChange", field: "(staged if approval enabled)", required: false }
          ]
        }
      },
      {
        method: "GET", path: "/api/integration/v1/vouchers/giftcards?page={p}&pageSize={n}",
        direction: "nop → middleware (pull)", scope: "vouchers.read", idempotencyRequired: false, approvalRequired: false,
        purpose: "Pull gift card definitions and activation states.",
        versionNotes: [],
        fields: {
          "4.60": [
            { table: "GiftCard", field: "Id/GiftCardCouponCode/Amount/IsGiftCardActivated", required: true },
            { table: "GiftCard", field: "RecipientName/RecipientEmail/SenderName/SenderEmail/Message", required: false },
            { table: "GiftCard", field: "CreatedOnUtc", required: false },
            { table: "GiftCardUsageHistory", field: "GiftCardId/UsedWithOrderId/UsedValue/CreatedOnUtc", required: false }
          ],
          "4.90": [
            { table: "GiftCard", field: "Id/GiftCardCouponCode/Amount/IsGiftCardActivated", required: true },
            { table: "GiftCard", field: "RecipientName/RecipientEmail/SenderName/SenderEmail/Message", required: false },
            { table: "GiftCard", field: "CreatedOnUtc", required: false },
            { table: "GiftCardUsageHistory", field: "GiftCardId/UsedWithOrderId/UsedValue/CreatedOnUtc", required: false }
          ]
        }
      },
      {
        method: "PUT", path: "/api/integration/v1/vouchers/giftcards/by-code/{giftCardCouponCode}",
        direction: "NetSuite → nop (push/upsert)", scope: "vouchers.write", idempotencyRequired: true,
        idempotencyRecipe: "NS:GiftCard:{giftCardCouponCode}:{lastModifiedUtc}", approvalRequired: false,
        purpose: "Upsert gift card by code. Update amount, activation, recipient/sender details.",
        versionNotes: [],
        fields: {
          "4.60": [{ table: "GiftCard", field: "GiftCardCouponCode (from path) + Amount/Activation/Recipient/Sender fields", required: true }],
          "4.90": [{ table: "GiftCard", field: "GiftCardCouponCode (from path) + Amount/Activation/Recipient/Sender fields", required: true }]
        }
      },
      // --- Gift card usage history sub-domain ---
      {
        method: "GET",
        path: "/api/integration/v1/vouchers/giftcards/usage?giftCardId={id}&sinceUtc={utc}&page={p}&pageSize={n}",
        direction: "nop → middleware (pull/export)",
        scope: "vouchers.read",
        idempotencyRequired: false,
        approvalRequired: false,
        purpose: "Export gift card usage history by nop GiftCardId. Shows which orders used this gift card and how much was deducted each time. Best for admin/internal use where the nop ID is already known.",
        versionNotes: ["GiftCardUsageHistory table is consistent across 4.60 and 4.90.", "For middleware lookups, prefer the by-code variant below — it doesn't require knowing the nop internal ID."],
        fields: {
          "4.60": [
            { table: "GiftCardUsageHistory", field: "Id", required: true },
            { table: "GiftCardUsageHistory", field: "GiftCardId", required: true },
            { table: "GiftCardUsageHistory", field: "UsedWithOrderId", required: true },
            { table: "GiftCardUsageHistory", field: "UsedValue", required: true },
            { table: "GiftCardUsageHistory", field: "CreatedOnUtc", required: true },
            { table: "GiftCard", field: "GiftCardCouponCode/Amount/IsGiftCardActivated (joined)", required: false },
            { table: "Order", field: "CustomOrderNumber/OrderTotal (joined)", required: false }
          ],
          "4.90": [
            { table: "GiftCardUsageHistory", field: "Id", required: true },
            { table: "GiftCardUsageHistory", field: "GiftCardId", required: true },
            { table: "GiftCardUsageHistory", field: "UsedWithOrderId", required: true },
            { table: "GiftCardUsageHistory", field: "UsedValue", required: true },
            { table: "GiftCardUsageHistory", field: "CreatedOnUtc", required: true },
            { table: "GiftCard", field: "GiftCardCouponCode/Amount/IsGiftCardActivated (joined)", required: false },
            { table: "Order", field: "CustomOrderNumber/OrderTotal (joined)", required: false }
          ]
        }
      },
      {
        method: "GET",
        path: "/api/integration/v1/vouchers/giftcards/usage/by-code/{giftCardCouponCode}?sinceUtc={utc}&page={p}&pageSize={n}",
        direction: "nop → middleware (pull/export)",
        scope: "vouchers.read",
        idempotencyRequired: false,
        approvalRequired: false,
        purpose: "Export gift card usage history by coupon code. Resolves GiftCard.GiftCardCouponCode → GiftCardId internally. Ideal for middleware that tracks gift cards by code from NetSuite.",
        versionNotes: [
          "Returns 404 if no gift card with the given coupon code exists.",
          "Code lookup is case-insensitive.",
          "Response includes remaining balance (Amount minus sum of UsedValue).",
          "Same response shape as the giftCardId variant."
        ],
        fields: {
          "4.60": [
            { table: "GiftCard", field: "GiftCardCouponCode (from path)", required: true, type: "string", notes: "Server resolves to GiftCardId" },
            { table: "GiftCardUsageHistory", field: "Id", required: true },
            { table: "GiftCardUsageHistory", field: "GiftCardId", required: true },
            { table: "GiftCardUsageHistory", field: "UsedWithOrderId", required: true },
            { table: "GiftCardUsageHistory", field: "UsedValue", required: true },
            { table: "GiftCardUsageHistory", field: "CreatedOnUtc", required: true },
            { table: "GiftCard", field: "Amount/IsGiftCardActivated (joined)", required: false },
            { table: "Order", field: "CustomOrderNumber/OrderTotal (joined)", required: false }
          ],
          "4.90": [
            { table: "GiftCard", field: "GiftCardCouponCode (from path)", required: true, type: "string", notes: "Server resolves to GiftCardId" },
            { table: "GiftCardUsageHistory", field: "Id", required: true },
            { table: "GiftCardUsageHistory", field: "GiftCardId", required: true },
            { table: "GiftCardUsageHistory", field: "UsedWithOrderId", required: true },
            { table: "GiftCardUsageHistory", field: "UsedValue", required: true },
            { table: "GiftCardUsageHistory", field: "CreatedOnUtc", required: true },
            { table: "GiftCard", field: "Amount/IsGiftCardActivated (joined)", required: false },
            { table: "Order", field: "CustomOrderNumber/OrderTotal (joined)", required: false }
          ]
        }
      },
      // --- Discount usage history sub-domain ---
      {
        method: "GET",
        path: "/api/integration/v1/vouchers/discounts/usage?discountId={id}&sinceUtc={utc}&page={p}&pageSize={n}",
        direction: "nop → middleware (pull/export)",
        scope: "vouchers.read",
        idempotencyRequired: false,
        approvalRequired: false,
        purpose: "Export discount usage history by nop DiscountId. Links discounts to orders with timestamps. Best for admin/internal use where the nop ID is already known.",
        versionNotes: ["DiscountUsageHistory table is consistent across 4.60 and 4.90.", "For middleware lookups, prefer the by-code or by-name variants below — they don't require knowing the nop internal ID."],
        fields: {
          "4.60": [
            { table: "DiscountUsageHistory", field: "Id", required: true },
            { table: "DiscountUsageHistory", field: "DiscountId", required: true },
            { table: "DiscountUsageHistory", field: "OrderId", required: true },
            { table: "DiscountUsageHistory", field: "CreatedOnUtc", required: true },
            { table: "Discount", field: "Name/CouponCode (joined)", required: false },
            { table: "Order", field: "CustomOrderNumber/OrderTotal (joined)", required: false }
          ],
          "4.90": [
            { table: "DiscountUsageHistory", field: "Id", required: true },
            { table: "DiscountUsageHistory", field: "DiscountId", required: true },
            { table: "DiscountUsageHistory", field: "OrderId", required: true },
            { table: "DiscountUsageHistory", field: "CreatedOnUtc", required: true },
            { table: "Discount", field: "Name/CouponCode (joined)", required: false },
            { table: "Order", field: "CustomOrderNumber/OrderTotal (joined)", required: false }
          ]
        }
      },
      {
        method: "GET",
        path: "/api/integration/v1/vouchers/discounts/usage/by-code/{couponCode}?sinceUtc={utc}&page={p}&pageSize={n}",
        direction: "nop → middleware (pull/export)",
        scope: "vouchers.read",
        idempotencyRequired: false,
        approvalRequired: false,
        purpose: "Export discount usage history by coupon code. Resolves Discount.CouponCode → DiscountId internally. Ideal for middleware that tracks promotions by coupon code from NetSuite.",
        versionNotes: [
          "Returns 404 if no discount with the given coupon code exists.",
          "CouponCode lookup is case-insensitive.",
          "Same response shape as the discountId variant."
        ],
        fields: {
          "4.60": [
            { table: "Discount", field: "CouponCode (from path)", required: true, type: "string", notes: "Server resolves to DiscountId" },
            { table: "DiscountUsageHistory", field: "Id", required: true },
            { table: "DiscountUsageHistory", field: "DiscountId", required: true },
            { table: "DiscountUsageHistory", field: "OrderId", required: true },
            { table: "DiscountUsageHistory", field: "CreatedOnUtc", required: true },
            { table: "Discount", field: "Name/CouponCode (joined)", required: false },
            { table: "Order", field: "CustomOrderNumber/OrderTotal (joined)", required: false }
          ],
          "4.90": [
            { table: "Discount", field: "CouponCode (from path)", required: true, type: "string", notes: "Server resolves to DiscountId" },
            { table: "DiscountUsageHistory", field: "Id", required: true },
            { table: "DiscountUsageHistory", field: "DiscountId", required: true },
            { table: "DiscountUsageHistory", field: "OrderId", required: true },
            { table: "DiscountUsageHistory", field: "CreatedOnUtc", required: true },
            { table: "Discount", field: "Name/CouponCode (joined)", required: false },
            { table: "Order", field: "CustomOrderNumber/OrderTotal (joined)", required: false }
          ]
        }
      },
      {
        method: "GET",
        path: "/api/integration/v1/vouchers/discounts/usage/by-name/{name}?sinceUtc={utc}&page={p}&pageSize={n}",
        direction: "nop → middleware (pull/export)",
        scope: "vouchers.read",
        idempotencyRequired: false,
        approvalRequired: false,
        purpose: "Export discount usage history by discount name. Resolves Discount.Name → DiscountId internally. Useful when NetSuite tracks discount rules by name rather than coupon code (e.g. auto-applied discounts that have no coupon code).",
        versionNotes: [
          "Returns 404 if no discount with the given name exists.",
          "If multiple discounts share the same name, returns usage history for ALL matching discounts (merged, sorted by CreatedOnUtc desc).",
          "Name lookup is case-insensitive.",
          "Same response shape as the discountId variant."
        ],
        fields: {
          "4.60": [
            { table: "Discount", field: "Name (from path)", required: true, type: "string", notes: "Server resolves to DiscountId(s)" },
            { table: "DiscountUsageHistory", field: "Id", required: true },
            { table: "DiscountUsageHistory", field: "DiscountId", required: true },
            { table: "DiscountUsageHistory", field: "OrderId", required: true },
            { table: "DiscountUsageHistory", field: "CreatedOnUtc", required: true },
            { table: "Discount", field: "Name/CouponCode (joined)", required: false },
            { table: "Order", field: "CustomOrderNumber/OrderTotal (joined)", required: false }
          ],
          "4.90": [
            { table: "Discount", field: "Name (from path)", required: true, type: "string", notes: "Server resolves to DiscountId(s)" },
            { table: "DiscountUsageHistory", field: "Id", required: true },
            { table: "DiscountUsageHistory", field: "DiscountId", required: true },
            { table: "DiscountUsageHistory", field: "OrderId", required: true },
            { table: "DiscountUsageHistory", field: "CreatedOnUtc", required: true },
            { table: "Discount", field: "Name/CouponCode (joined)", required: false },
            { table: "Order", field: "CustomOrderNumber/OrderTotal (joined)", required: false }
          ]
        }
      }
    ]
  },

  // ==========================================================
  // 12) RETURNS
  // ==========================================================
  {
    key: "returns",
    title: "Returns",
    description: "Return requests (RMA): export to NetSuite and receive status updates back.",
    endpoints: [
      {
        method: "GET", path: "/api/integration/v1/returns?sinceUtc={utc}&statusId={id}&storeId={id}&page={p}&pageSize={n}",
        direction: "nop → NetSuite (export)", scope: "returns.read", idempotencyRequired: false, approvalRequired: false,
        purpose: "Export return requests. Includes ReturnRequest fields and external references if present.",
        versionNotes: ["ReturnRequest table is consistent across 4.60 and 4.90."],
        fields: {
          "4.60": [
            { table: "ReturnRequest", field: "Id/CustomNumber/StoreId/CustomerId", required: true },
            { table: "ReturnRequest", field: "OrderItemId/Quantity/ReturnedQuantity", required: true },
            { table: "ReturnRequest", field: "ReasonForReturn/RequestedAction", required: false },
            { table: "ReturnRequest", field: "CustomerComments/StaffNotes", required: false },
            { table: "ReturnRequest", field: "ReturnRequestStatusId/CreatedOnUtc/UpdatedOnUtc", required: true }
          ],
          "4.90": [
            { table: "ReturnRequest", field: "Id/CustomNumber/StoreId/CustomerId", required: true },
            { table: "ReturnRequest", field: "OrderItemId/Quantity/ReturnedQuantity", required: true },
            { table: "ReturnRequest", field: "ReasonForReturn/RequestedAction", required: false },
            { table: "ReturnRequest", field: "CustomerComments/StaffNotes", required: false },
            { table: "ReturnRequest", field: "ReturnRequestStatusId/CreatedOnUtc/UpdatedOnUtc", required: true }
          ]
        }
      },
      {
        method: "POST", path: "/api/integration/v1/returns/{returnRequestId}/status",
        direction: "NetSuite → nop (push)", scope: "returns.write", idempotencyRequired: true,
        idempotencyRecipe: "NS:RMA:{netSuiteRmaId}:{updatedOnUtc}:{returnRequestStatusId}",
        approvalRequired: false,
        purpose: "Update return status and staff notes. Stores NetSuite RMA id in Acgs_ExternalReference.",
        versionNotes: [],
        fields: {
          "4.60": [
            { table: "ReturnRequest", field: "Id (from path)", required: true },
            { table: "ReturnRequest", field: "ReturnRequestStatusId", required: true },
            { table: "ReturnRequest", field: "StaffNotes", required: false },
            { table: "Acgs_ExternalReference", field: "EntityType=ReturnRequest, ExternalType=RMA", required: false }
          ],
          "4.90": [
            { table: "ReturnRequest", field: "Id (from path)", required: true },
            { table: "ReturnRequest", field: "ReturnRequestStatusId", required: true },
            { table: "ReturnRequest", field: "StaffNotes", required: false },
            { table: "Acgs_ExternalReference", field: "EntityType=ReturnRequest, ExternalType=RMA", required: false }
          ]
        }
      }
    ]
  },

  // ==========================================================
  // 13) REFERENCE DATA
  // ==========================================================
  {
    key: "reference-data",
    title: "Reference data",
    description: "Read-only lookup endpoints for countries, state/provinces, warehouses, tax categories, currencies, languages, stores, and customer roles. Used by middleware to resolve IDs before pushing data. All consistent across 4.60 and 4.90.",
    endpoints: [
      {
        method: "GET",
        path: "/api/integration/v1/reference/countries?publishedOnly={bool}",
        direction: "middleware → nop (lookup)",
        scope: "reference.read",
        idempotencyRequired: false,
        approvalRequired: false,
        purpose: "Get all countries. Used to resolve country names/ISO codes to nop CountryId for addresses, shipping rules, and tax configuration.",
        versionNotes: ["Country table is consistent across 4.60 and 4.90. Returns Id, Name, TwoLetterIsoCode, ThreeLetterIsoCode, NumericIsoCode, Published, DisplayOrder."],
        fields: {
          "4.60": [
            { table: "Country", field: "Id", required: true },
            { table: "Country", field: "Name", required: true },
            { table: "Country", field: "TwoLetterIsoCode", required: true },
            { table: "Country", field: "ThreeLetterIsoCode", required: false },
            { table: "Country", field: "NumericIsoCode", required: false },
            { table: "Country", field: "Published", required: true },
            { table: "Country", field: "DisplayOrder", required: false },
            { table: "Country", field: "AllowsBilling", required: false },
            { table: "Country", field: "AllowsShipping", required: false },
            { table: "Country", field: "SubjectToVat", required: false },
            { table: "Country", field: "LimitedToStores", required: false }
          ],
          "4.90": [
            { table: "Country", field: "Id", required: true },
            { table: "Country", field: "Name", required: true },
            { table: "Country", field: "TwoLetterIsoCode", required: true },
            { table: "Country", field: "ThreeLetterIsoCode", required: false },
            { table: "Country", field: "NumericIsoCode", required: false },
            { table: "Country", field: "Published", required: true },
            { table: "Country", field: "DisplayOrder", required: false },
            { table: "Country", field: "AllowsBilling", required: false },
            { table: "Country", field: "AllowsShipping", required: false },
            { table: "Country", field: "SubjectToVat", required: false },
            { table: "Country", field: "LimitedToStores", required: false }
          ]
        }
      },
      {
        method: "GET",
        path: "/api/integration/v1/reference/countries/{countryId}/states",
        direction: "middleware → nop (lookup)",
        scope: "reference.read",
        idempotencyRequired: false,
        approvalRequired: false,
        purpose: "Get all state/provinces for a country. Used to resolve state abbreviations/names to nop StateProvinceId for addresses.",
        versionNotes: ["StateProvince table is consistent across 4.60 and 4.90."],
        fields: {
          "4.60": [
            { table: "StateProvince", field: "Id", required: true },
            { table: "StateProvince", field: "CountryId", required: true },
            { table: "StateProvince", field: "Name", required: true },
            { table: "StateProvince", field: "Abbreviation", required: false },
            { table: "StateProvince", field: "Published", required: true },
            { table: "StateProvince", field: "DisplayOrder", required: false }
          ],
          "4.90": [
            { table: "StateProvince", field: "Id", required: true },
            { table: "StateProvince", field: "CountryId", required: true },
            { table: "StateProvince", field: "Name", required: true },
            { table: "StateProvince", field: "Abbreviation", required: false },
            { table: "StateProvince", field: "Published", required: true },
            { table: "StateProvince", field: "DisplayOrder", required: false }
          ]
        }
      },
      {
        method: "GET",
        path: "/api/integration/v1/reference/warehouses",
        direction: "middleware → nop (lookup)",
        scope: "reference.read",
        idempotencyRequired: false,
        approvalRequired: false,
        purpose: "Get all warehouses. Used to resolve warehouse names/codes to nop WarehouseId for multi-warehouse inventory sync.",
        versionNotes: ["Warehouse table is consistent across 4.60 and 4.90."],
        fields: {
          "4.60": [
            { table: "Warehouse", field: "Id", required: true },
            { table: "Warehouse", field: "Name", required: true },
            { table: "Warehouse", field: "AdminComment", required: false },
            { table: "Warehouse", field: "AddressId", required: false }
          ],
          "4.90": [
            { table: "Warehouse", field: "Id", required: true },
            { table: "Warehouse", field: "Name", required: true },
            { table: "Warehouse", field: "AdminComment", required: false },
            { table: "Warehouse", field: "AddressId", required: false }
          ]
        }
      },
      {
        method: "GET",
        path: "/api/integration/v1/reference/tax-categories",
        direction: "middleware → nop (lookup)",
        scope: "reference.read",
        idempotencyRequired: false,
        approvalRequired: false,
        purpose: "Get all tax categories. Used to resolve tax class names to nop TaxCategoryId for product upsert.",
        versionNotes: ["TaxCategory table is consistent across 4.60 and 4.90."],
        fields: {
          "4.60": [
            { table: "TaxCategory", field: "Id", required: true },
            { table: "TaxCategory", field: "Name", required: true },
            { table: "TaxCategory", field: "DisplayOrder", required: false }
          ],
          "4.90": [
            { table: "TaxCategory", field: "Id", required: true },
            { table: "TaxCategory", field: "Name", required: true },
            { table: "TaxCategory", field: "DisplayOrder", required: false }
          ]
        }
      },
      {
        method: "GET",
        path: "/api/integration/v1/reference/currencies",
        direction: "middleware → nop (lookup)",
        scope: "reference.read",
        idempotencyRequired: false,
        approvalRequired: false,
        purpose: "Get all currencies. Used to validate currency codes in offline transactions and pricing payloads.",
        versionNotes: ["Currency table is consistent across 4.60 and 4.90."],
        fields: {
          "4.60": [
            { table: "Currency", field: "Id", required: true },
            { table: "Currency", field: "Name", required: true },
            { table: "Currency", field: "CurrencyCode", required: true },
            { table: "Currency", field: "Rate", required: false },
            { table: "Currency", field: "DisplayLocale", required: false },
            { table: "Currency", field: "Published", required: true },
            { table: "Currency", field: "DisplayOrder", required: false },
            { table: "Currency", field: "RoundingTypeId", required: false }
          ],
          "4.90": [
            { table: "Currency", field: "Id", required: true },
            { table: "Currency", field: "Name", required: true },
            { table: "Currency", field: "CurrencyCode", required: true },
            { table: "Currency", field: "Rate", required: false },
            { table: "Currency", field: "DisplayLocale", required: false },
            { table: "Currency", field: "Published", required: true },
            { table: "Currency", field: "DisplayOrder", required: false },
            { table: "Currency", field: "RoundingTypeId", required: false }
          ]
        }
      },
      {
        method: "GET",
        path: "/api/integration/v1/reference/languages",
        direction: "middleware → nop (lookup)",
        scope: "reference.read",
        isNew: true,
        newLabel: "Updated in v1.6.1",
        idempotencyRequired: false,
        approvalRequired: false,
        purpose: "Get all languages. Used to resolve language codes for SEO slugs (UrlRecord.LanguageId) and store defaults. Product content in v1.6.1 remains intentionally single-language only.",
        versionNotes: ["Language table is consistent across 4.60 and 4.90.", "Localized product translation payloads are intentionally out of scope in v1.6.1."],
        fields: {
          "4.60": [
            { table: "Language", field: "Id", required: true },
            { table: "Language", field: "Name", required: true },
            { table: "Language", field: "LanguageCulture", required: true },
            { table: "Language", field: "UniqueSeoCode", required: true },
            { table: "Language", field: "Published", required: true },
            { table: "Language", field: "DisplayOrder", required: false },
            { table: "Language", field: "DefaultCurrencyId", required: false }
          ],
          "4.90": [
            { table: "Language", field: "Id", required: true },
            { table: "Language", field: "Name", required: true },
            { table: "Language", field: "LanguageCulture", required: true },
            { table: "Language", field: "UniqueSeoCode", required: true },
            { table: "Language", field: "Published", required: true },
            { table: "Language", field: "DisplayOrder", required: false },
            { table: "Language", field: "DefaultCurrencyId", required: false }
          ]
        }
      },
      {
        method: "GET",
        path: "/api/integration/v1/reference/stores",
        direction: "middleware → nop (lookup)",
        scope: "reference.read",
        idempotencyRequired: false,
        approvalRequired: false,
        purpose: "Get all stores in the nop instance. Used to resolve X-Store-Id header values and validate storeId parameters. Multi-store deployments have multiple entries.",
        versionNotes: ["Store table is consistent across 4.60 and 4.90."],
        fields: {
          "4.60": [
            { table: "Store", field: "Id", required: true },
            { table: "Store", field: "Name", required: true },
            { table: "Store", field: "Url", required: true },
            { table: "Store", field: "Hosts", required: false },
            { table: "Store", field: "DefaultLanguageId", required: false },
            { table: "Store", field: "DisplayOrder", required: false },
            { table: "Store", field: "CompanyName/CompanyAddress/CompanyPhoneNumber/CompanyVat", required: false }
          ],
          "4.90": [
            { table: "Store", field: "Id", required: true },
            { table: "Store", field: "Name", required: true },
            { table: "Store", field: "Url", required: true },
            { table: "Store", field: "Hosts", required: false },
            { table: "Store", field: "DefaultLanguageId", required: false },
            { table: "Store", field: "DisplayOrder", required: false },
            { table: "Store", field: "CompanyName/CompanyAddress/CompanyPhoneNumber/CompanyVat", required: false }
          ]
        }
      },
      {
        method: "GET",
        path: "/api/integration/v1/reference/customer-roles",
        direction: "middleware → nop (lookup)",
        scope: "reference.read",
        idempotencyRequired: false,
        approvalRequired: false,
        purpose: "Get all customer roles. Used to resolve role names/system names to nop CustomerRoleId for customer upsert and tier price assignments.",
        versionNotes: ["CustomerRole table is consistent across 4.60 and 4.90."],
        fields: {
          "4.60": [
            { table: "CustomerRole", field: "Id", required: true },
            { table: "CustomerRole", field: "Name", required: true },
            { table: "CustomerRole", field: "SystemName", required: true },
            { table: "CustomerRole", field: "FreeShipping", required: false },
            { table: "CustomerRole", field: "TaxExempt", required: false },
            { table: "CustomerRole", field: "Active", required: true },
            { table: "CustomerRole", field: "IsSystemRole", required: false },
            { table: "CustomerRole", field: "PurchasedWithProductId", required: false },
            { table: "CustomerRole", field: "OverrideTaxDisplayType/DefaultTaxDisplayTypeId", required: false }
          ],
          "4.90": [
            { table: "CustomerRole", field: "Id", required: true },
            { table: "CustomerRole", field: "Name", required: true },
            { table: "CustomerRole", field: "SystemName", required: true },
            { table: "CustomerRole", field: "FreeShipping", required: false },
            { table: "CustomerRole", field: "TaxExempt", required: false },
            { table: "CustomerRole", field: "Active", required: true },
            { table: "CustomerRole", field: "IsSystemRole", required: false },
            { table: "CustomerRole", field: "PurchasedWithProductId", required: false },
            { table: "CustomerRole", field: "OverrideTaxDisplayType/DefaultTaxDisplayTypeId", required: false }
          ]
        }
      },
      {
        method: "GET",
        path: "/api/integration/v1/reference/delivery-dates",
        direction: "middleware → nop (lookup)",
        scope: "reference.read",
        idempotencyRequired: false,
        approvalRequired: false,
        purpose: "Get all delivery date options. Used to resolve delivery date names to nop DeliveryDateId for product upsert.",
        versionNotes: ["DeliveryDate table is consistent across 4.60 and 4.90."],
        fields: {
          "4.60": [
            { table: "DeliveryDate", field: "Id", required: true },
            { table: "DeliveryDate", field: "Name", required: true },
            { table: "DeliveryDate", field: "DisplayOrder", required: false }
          ],
          "4.90": [
            { table: "DeliveryDate", field: "Id", required: true },
            { table: "DeliveryDate", field: "Name", required: true },
            { table: "DeliveryDate", field: "DisplayOrder", required: false }
          ]
        }
      },
      {
        method: "GET",
        path: "/api/integration/v1/reference/measure-weights",
        direction: "middleware → nop (lookup)",
        scope: "reference.read",
        idempotencyRequired: false,
        approvalRequired: false,
        purpose: "Get all weight measurement units. Used for unit conversions and baseprice (unit price) configuration.",
        versionNotes: ["MeasureWeight table is consistent across 4.60 and 4.90."],
        fields: {
          "4.60": [
            { table: "MeasureWeight", field: "Id", required: true },
            { table: "MeasureWeight", field: "Name", required: true },
            { table: "MeasureWeight", field: "SystemKeyword", required: true },
            { table: "MeasureWeight", field: "Ratio", required: false },
            { table: "MeasureWeight", field: "DisplayOrder", required: false }
          ],
          "4.90": [
            { table: "MeasureWeight", field: "Id", required: true },
            { table: "MeasureWeight", field: "Name", required: true },
            { table: "MeasureWeight", field: "SystemKeyword", required: true },
            { table: "MeasureWeight", field: "Ratio", required: false },
            { table: "MeasureWeight", field: "DisplayOrder", required: false }
          ]
        }
      },
      {
        method: "GET",
        path: "/api/integration/v1/reference/measure-dimensions",
        direction: "middleware → nop (lookup)",
        scope: "reference.read",
        idempotencyRequired: false,
        approvalRequired: false,
        purpose: "Get all dimension measurement units. Used for unit conversions in shipping calculations.",
        versionNotes: ["MeasureDimension table is consistent across 4.60 and 4.90."],
        fields: {
          "4.60": [
            { table: "MeasureDimension", field: "Id", required: true },
            { table: "MeasureDimension", field: "Name", required: true },
            { table: "MeasureDimension", field: "SystemKeyword", required: true },
            { table: "MeasureDimension", field: "Ratio", required: false },
            { table: "MeasureDimension", field: "DisplayOrder", required: false }
          ],
          "4.90": [
            { table: "MeasureDimension", field: "Id", required: true },
            { table: "MeasureDimension", field: "Name", required: true },
            { table: "MeasureDimension", field: "SystemKeyword", required: true },
            { table: "MeasureDimension", field: "Ratio", required: false },
            { table: "MeasureDimension", field: "DisplayOrder", required: false }
          ]
        }
      }
    ]
  },

];