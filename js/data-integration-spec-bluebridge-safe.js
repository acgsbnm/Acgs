// data-integration-spec-bluebridge-safe.js — External BlueBridge-safe endpoint specification data

function bbCloneField(definition) {
  return { ...definition };
}

function bbField(table, name, required, type, contract, notes) {
  return { table, field: name, required, type, contract, notes };
}

function bbSameFields(fields) {
  return {
    "4.60": fields.map(bbCloneField),
    "4.90": fields.map(bbCloneField)
  };
}

function bbVersionFields(fields460, fields490) {
  return {
    "4.60": fields460.map(bbCloneField),
    "4.90": fields490.map(bbCloneField)
  };
}

const integrationSpec = [
  {
    key: "meta",
    title: "Meta / operations",
    description: "Health and capability endpoints used for environment checks and feature discovery.",
    endpoints: [
      {
        method: "GET",
        path: "/api/integration/v1/meta/ping",
        direction: "BlueBridge/NetSuite -> nop (health check)",
        scope: "meta.read",
        idempotencyRequired: false,
        approvalRequired: false,
        purpose: "Verify connectivity, authentication, API version, nopCommerce version, and store context.",
        versionNotes: [
          "Available in all supported environments.",
          "Returns the canonical success envelope."
        ],
        fields: bbSameFields([])
      },
      {
        method: "GET",
        path: "/api/integration/v1/meta/capabilities",
        direction: "BlueBridge/NetSuite -> nop (discovery)",
        scope: "meta.read",
        idempotencyRequired: false,
        approvalRequired: false,
        purpose: "Discover which modules are enabled for a specific site before implementation or testing begins.",
        versionNotes: [
          "Use this endpoint to confirm whether RFQ and other optional modules are enabled for the target site.",
          "Capability flags may vary by environment or site configuration."
        ],
        fields: bbSameFields([
          bbField("(response)", "data.modules.items.enabled", true, "bool", "ns-optional", "Whether item endpoints are enabled."),
          bbField("(response)", "data.modules.inventory.enabled", true, "bool", "ns-optional", "Whether inventory endpoints are enabled."),
          bbField("(response)", "data.modules.pricing.enabled", true, "bool", "ns-optional", "Whether pricing endpoints are enabled."),
          bbField("(response)", "data.modules.orders.enabled", true, "bool", "ns-optional", "Whether order export and status endpoints are enabled."),
          bbField("(response)", "data.modules.payments.enabled", true, "bool", "ns-optional", "Whether payment endpoints are enabled."),
          bbField("(response)", "data.modules.returns.enabled", true, "bool", "ns-optional", "Whether return endpoints are enabled."),
          bbField("(response)", "data.modules.rfq.enabled", true, "bool", "ns-optional", "Whether RFQ endpoints are enabled."),
          bbField("(response)", "data.modules.customers.enabled", true, "bool", "ns-optional", "Whether customer endpoints are enabled."),
          bbField("(response)", "data.modules.contacts.enabled", true, "bool", "ns-optional", "Whether contact/address endpoints are enabled."),
          bbField("(response)", "data.nopVersion", true, "string", "ns-optional", "nopCommerce application version for the current site."),
          bbField("(response)", "data.storeId", true, "int", "ns-optional", "Resolved store identifier for the current request context.")
        ])
      }
    ]
  },
  {
    key: "item-records",
    title: "Item records",
    description: "Base item creation, update, retrieval, and full item synchronization for product master data.",
    endpoints: [
      {
        method: "GET",
        path: "/api/integration/v1/items?page={p}&pageSize={n}&updatedSinceUtc={utc}&publishedOnly={bool}&includeDeleted={bool}",
        direction: "nop -> BlueBridge/NetSuite (pull)",
        scope: "items.read",
        idempotencyRequired: false,
        approvalRequired: false,
        purpose: "Retrieve a paginated product list for reconciliation or incremental synchronization.",
        versionNotes: [
          "The external payload contract is consistent across nopCommerce 4.60 and 4.90.",
          "SKU remains the canonical item identifier for external integrations."
        ],
        fields: bbSameFields([
          bbField("(query)", "page", false, "int", "ns-optional", "Page number; default 1."),
          bbField("(query)", "pageSize", false, "int", "ns-optional", "Page size; default 50."),
          bbField("(query)", "updatedSinceUtc", false, "DateTime", "ns-optional", "Filter for incremental export."),
          bbField("(query)", "publishedOnly", false, "bool", "ns-optional", "Return only published items when true."),
          bbField("(query)", "includeDeleted", false, "bool", "ns-optional", "Include soft-deleted products when true."),
          bbField("(response)", "data.items[].sku", true, "string", "ns-optional", "Base product SKU."),
          bbField("(response)", "data.items[].name", true, "string", "ns-optional", "Product name."),
          bbField("(response)", "data.items[].published", true, "bool", "ns-optional", "Published state."),
          bbField("(response)", "data.items[].deleted", true, "bool", "ns-optional", "Soft-delete state."),
          bbField("(response)", "data.items[].price", false, "decimal", "ns-optional", "Base selling price."),
          bbField("(response)", "data.items[].productCost", false, "decimal", "ns-optional", "Product cost where maintained."),
          bbField("(response)", "data.items[].stockQuantity", false, "int", "ns-optional", "Returned where stock is held on the base item."),
          bbField("(response)", "data.items[].updatedOnUtc", true, "DateTime", "ns-optional", "Last updated timestamp.")
        ])
      },
      {
        method: "GET",
        path: "/api/integration/v1/items/by-sku/{sku}",
        direction: "BlueBridge/NetSuite -> nop (pull)",
        scope: "items.read",
        idempotencyRequired: false,
        approvalRequired: false,
        purpose: "Retrieve the full external product payload for a base product SKU.",
        versionNotes: [
          "Use the parent or base product SKU on this route.",
          "Variant or child SKUs should be managed through item full-sync or stock-bearing child item flows where enabled."
        ],
        fields: bbSameFields([
          bbField("(from path)", "sku", true, "string", "ns-required", "Base product SKU."),
          bbField("(response)", "data.sku", true, "string", "ns-optional", "Base product SKU."),
          bbField("(response)", "data.name", true, "string", "ns-optional", "Product name."),
          bbField("(response)", "data.shortDescription", false, "string", "ns-optional", "Short storefront description."),
          bbField("(response)", "data.fullDescription", false, "string", "ns-optional", "Long storefront description."),
          bbField("(response)", "data.price", false, "decimal", "ns-optional", "Base selling price."),
          bbField("(response)", "data.oldPrice", false, "decimal", "ns-optional", "Original or compare-at price."),
          bbField("(response)", "data.productCost", false, "decimal", "ns-optional", "Product cost."),
          bbField("(response)", "data.manageInventoryMethodId", false, "int", "ns-optional", "Inventory management mode."),
          bbField("(response)", "data.stockQuantity", false, "int", "ns-optional", "Base item stock quantity where relevant."),
          bbField("(response)", "data.isShipEnabled", false, "bool", "ns-optional", "Whether the item is shippable."),
          bbField("(response)", "data.isTaxExempt", false, "bool", "ns-optional", "Tax exemption flag."),
          bbField("(response)", "data.taxCategoryId", false, "int", "ns-optional", "Configured tax category identifier."),
          bbField("(response)", "data.published", false, "bool", "ns-optional", "Published state."),
          bbField("(response)", "data.externalReferences.externalId", false, "string", "ns-optional", "External reference identifier when present.")
        ])
      },
      {
        method: "PUT",
        path: "/api/integration/v1/items/by-sku/{sku}",
        direction: "BlueBridge/NetSuite -> nop (push/upsert)",
        scope: "items.write",
        idempotencyRequired: true,
        idempotencyRecipe: "NS:Item:{externalItemId}:{lastModifiedUtc}",
        approvalRequired: true,
        purpose: "Create or update the base product record by SKU.",
        versionNotes: [
          "Use this route for base item fields such as identifiers, pricing, tax, shipping, and lifecycle values.",
          "For full composite item creation including categories, attributes, images, and combinations, use the full-sync endpoint."
        ],
        fields: bbSameFields([
          bbField("(from path)", "sku", true, "string", "ns-required", "Base product SKU."),
          bbField("(request body)", "name", true, "string", "ns-required", "Product name."),
          bbField("(request body)", "published", true, "bool", "ns-optional", "Published state for the product."),
          bbField("(request body)", "deleted", true, "bool", "ns-optional", "Soft-delete state for the product."),
          bbField("(request body)", "shortDescription", false, "string", "ns-optional", "Short storefront description."),
          bbField("(request body)", "fullDescription", false, "string", "ns-optional", "Long storefront description."),
          bbField("(request body)", "manufacturerPartNumber", false, "string", "ns-optional", "Manufacturer part number."),
          bbField("(request body)", "gtin", false, "string", "ns-optional", "GTIN or barcode value."),
          bbField("(request body)", "price", false, "decimal", "ns-required", "Base selling price."),
          bbField("(request body)", "oldPrice", false, "decimal", "ns-optional", "Original or compare-at price."),
          bbField("(request body)", "productCost", false, "decimal", "ns-required", "Product cost."),
          bbField("(request body)", "manageInventoryMethodId", false, "int", "ns-optional", "Inventory management mode."),
          bbField("(request body)", "stockQuantity", false, "int", "ns-required", "Base item stock quantity where applicable."),
          bbField("(request body)", "isShipEnabled", false, "bool", "ns-optional", "Whether the item is shippable."),
          bbField("(request body)", "isTaxExempt", false, "bool", "ns-optional", "Tax exemption flag."),
          bbField("(request body)", "taxCategoryId", false, "int", "ns-optional", "Tax category identifier."),
          bbField("(request body)", "metaTitle", false, "string", "ns-optional", "Meta title for storefront pages."),
          bbField("(request body)", "externalReferences.externalSystem", false, "string", "ns-optional", "External system name, for example NetSuite."),
          bbField("(request body)", "externalReferences.externalType", false, "string", "ns-optional", "External entity type, for example InventoryItem."),
          bbField("(request body)", "externalReferences.externalId", false, "string", "ns-required", "External item identifier.")
        ])
      },
      {
        method: "PATCH",
        path: "/api/integration/v1/items/by-sku/{sku}",
        direction: "BlueBridge/NetSuite -> nop (push/partial)",
        scope: "items.write",
        idempotencyRequired: true,
        idempotencyRecipe: "NS:ItemPatch:{externalItemId}:{fieldSetHash}:{lastModifiedUtc}",
        approvalRequired: true,
        purpose: "Apply a partial update to the base product record.",
        versionNotes: [
          "Only supplied fields are updated.",
          "Use this route for targeted changes such as price, publish state, or soft delete."
        ],
        fields: bbSameFields([
          bbField("(from path)", "sku", true, "string", "ns-required", "Base product SKU."),
          bbField("(request body)", "name", false, "string", "ns-optional", "Updated product name."),
          bbField("(request body)", "published", false, "bool", "ns-optional", "Updated published state."),
          bbField("(request body)", "deleted", false, "bool", "ns-optional", "Updated soft-delete state."),
          bbField("(request body)", "price", false, "decimal", "ns-optional", "Updated price."),
          bbField("(request body)", "oldPrice", false, "decimal", "ns-optional", "Updated compare-at price."),
          bbField("(request body)", "productCost", false, "decimal", "ns-optional", "Updated product cost."),
          bbField("(request body)", "stockQuantity", false, "int", "ns-optional", "Updated base item stock quantity."),
          bbField("(request body)", "metaTitle", false, "string", "ns-optional", "Updated meta title."),
          bbField("(request body)", "externalReferences.externalId", false, "string", "ns-optional", "Updated external reference identifier where applicable.")
        ])
      },
      {
        method: "PUT",
        path: "/api/integration/v1/items/by-sku/{sku}/full-sync",
        direction: "BlueBridge/NetSuite -> nop (push/full sync)",
        scope: "items.write",
        idempotencyRequired: true,
        idempotencyRecipe: "NS:FullSync:{externalItemId}:{payloadHash}:{lastModifiedUtc}",
        approvalRequired: true,
        purpose: "Create or update a complete product and its related presentation data in a single call.",
        versionNotes: [
          "Use this route when item creation or update includes categories, vendor or manufacturer context, images, attributes, or combinations.",
          "The external payload contract remains stable across nopCommerce 4.60 and 4.90."
        ],
        fields: bbSameFields([
          bbField("(from path)", "sku", true, "string", "ns-required", "Base product SKU."),
          bbField("(request body)", "name", true, "string", "ns-required", "Product name."),
          bbField("(request body)", "published", true, "bool", "ns-optional", "Published state."),
          bbField("(request body)", "shortDescription", false, "string", "ns-optional", "Short storefront description."),
          bbField("(request body)", "fullDescription", false, "string", "ns-optional", "Long storefront description."),
          bbField("(request body)", "price", false, "decimal", "ns-required", "Base selling price."),
          bbField("(request body)", "oldPrice", false, "decimal", "ns-optional", "Original or compare-at price."),
          bbField("(request body)", "productCost", false, "decimal", "ns-required", "Product cost."),
          bbField("(request body)", "weight", false, "decimal", "ns-optional", "Shipping weight."),
          bbField("(request body)", "isShipEnabled", false, "bool", "ns-optional", "Whether the item is shippable."),
          bbField("(request body)", "isTaxExempt", false, "bool", "ns-optional", "Tax exemption flag."),
          bbField("(request body)", "taxCategoryId", false, "int", "ns-optional", "Tax category identifier."),
          bbField("(request body)", "metaTitle", false, "string", "ns-optional", "Meta title for storefront pages."),
          bbField("(request body)", "seoSlug", false, "string", "ns-optional", "Preferred SEO slug."),
          bbField("(request body)", "vendor", false, "object", "ns-optional", "Vendor assignment data."),
          bbField("(request body)", "manufacturer", false, "object", "ns-optional", "Manufacturer assignment data."),
          bbField("(request body)", "categories", false, "object[]", "ns-optional", "Category assignments."),
          bbField("(request body)", "storeMappings", false, "object", "ns-optional", "Store visibility assignments."),
          bbField("(request body)", "tags", false, "string[]", "ns-optional", "Product label tags."),
          bbField("(request body)", "specifications", false, "object[]", "ns-optional", "Structured product metadata."),
          bbField("(request body)", "attributes", false, "object[]", "ns-optional", "Attribute definitions and values."),
          bbField("(request body)", "images", false, "object[]", "ns-optional", "Image URLs or binaries."),
          bbField("(request body)", "combinations", false, "object[]", "ns-optional", "Variant or combination definitions."),
          bbField("(request body)", "externalReferences.externalId", false, "string", "ns-required", "External item identifier.")
        ])
      }
    ]
  },
  {
    key: "stock-on-hand",
    title: "Stock on hand",
    description: "Single-item and bulk inventory synchronization for product and stock-bearing child SKUs.",
    endpoints: [
      {
        method: "GET",
        path: "/api/integration/v1/inventory?sku={sku1,sku2}&includeReserved={bool}&includeVariants={bool}",
        direction: "nop -> BlueBridge/NetSuite (pull)",
        scope: "inventory.read",
        idempotencyRequired: false,
        approvalRequired: false,
        purpose: "Retrieve inventory positions for one or more SKUs.",
        versionNotes: [
          "Returned structure may include base item quantities, warehouse breakdowns, or child SKU quantities depending on the configured inventory mode.",
          "Use this endpoint to validate stock mapping before first cutover."
        ],
        fields: bbSameFields([
          bbField("(query)", "sku", true, "string", "ns-required", "One or more SKUs supplied as repeated or comma-separated query values."),
          bbField("(query)", "includeReserved", false, "bool", "ns-optional", "Include reserved quantities when available."),
          bbField("(query)", "includeVariants", false, "bool", "ns-optional", "Include stock-bearing child SKUs when applicable."),
          bbField("(response)", "data.items[].sku", true, "string", "ns-optional", "Resolved SKU."),
          bbField("(response)", "data.items[].resolvedAs", true, "string", "ns-optional", "Whether the SKU resolved as a base item or child item."),
          bbField("(response)", "data.items[].stockQuantity", false, "int", "ns-optional", "Resolved stock quantity where returned."),
          bbField("(response)", "data.items[].warehouses[]", false, "object[]", "ns-optional", "Warehouse-level inventory breakdown when enabled."),
          bbField("(response)", "data.items[].variants[]", false, "object[]", "ns-optional", "Child SKU inventory breakdown when enabled.")
        ])
      },
      {
        method: "POST",
        path: "/api/integration/v1/inventory/by-sku/{sku}",
        direction: "BlueBridge/NetSuite -> nop (push/single)",
        scope: "inventory.write",
        idempotencyRequired: true,
        idempotencyRecipe: "NS:Inv:{warehouseId}:{sku}:{asOfUtc}",
        approvalRequired: false,
        purpose: "Update inventory for a single SKU.",
        versionNotes: [
          "Use the stock-bearing SKU that the target site expects for inventory updates.",
          "Inventory changes apply immediately and are not staged for approval in the external contract."
        ],
        fields: bbSameFields([
          bbField("(from path)", "sku", true, "string", "ns-required", "Base or stock-bearing child SKU."),
          bbField("(request body)", "stockQuantity", true, "int", "ns-required", "Updated stock quantity."),
          bbField("(request body)", "warehouseId", false, "int", "ns-optional", "Warehouse identifier when warehouse-specific updates are enabled."),
          bbField("(request body)", "message", false, "string", "ns-optional", "Optional sync message or audit note."),
          bbField("(response)", "data.previousQuantity", true, "int", "ns-optional", "Quantity before update."),
          bbField("(response)", "data.newQuantity", true, "int", "ns-optional", "Quantity after update.")
        ])
      },
      {
        method: "POST",
        path: "/api/integration/v1/inventory/snapshot",
        direction: "BlueBridge/NetSuite -> nop (push/bulk)",
        scope: "inventory.write",
        idempotencyRequired: true,
        idempotencyRecipe: "NS:InvSnap:{warehouseId}:{asOfUtc}",
        approvalRequired: false,
        purpose: "Submit a bulk inventory snapshot for multiple SKUs.",
        versionNotes: [
          "Recommended for scheduled stock snapshots or larger inventory refreshes.",
          "The response returns per-item results together with any not-found SKUs."
        ],
        fields: bbSameFields([
          bbField("(request body)", "warehouseId", false, "int", "ns-optional", "Warehouse identifier when warehouse-specific updates are enabled."),
          bbField("(request body)", "asOfUtc", false, "DateTime", "ns-optional", "Snapshot timestamp."),
          bbField("(request body)", "message", false, "string", "ns-optional", "Optional sync message or audit note."),
          bbField("(request body)", "items", true, "object[]", "ns-required", "Inventory snapshot entries."),
          bbField("(request body)", "items[].sku", true, "string", "ns-required", "SKU to update."),
          bbField("(request body)", "items[].stockQuantity", true, "int", "ns-required", "Stock quantity for the SKU."),
          bbField("(response)", "data.updated", true, "int", "ns-optional", "Number of successful stock updates."),
          bbField("(response)", "data.notFoundSkus", false, "string[]", "ns-optional", "SKUs that could not be resolved.")
        ])
      }
    ]
  },
  {
    key: "customer-data",
    title: "Customer data",
    description: "Customer account export and upsert where customer master synchronization is required.",
    endpoints: [
      {
        method: "GET",
        path: "/api/integration/v1/customers?page={p}&pageSize={n}&updatedSinceUtc={utc}&email={email}",
        direction: "nop -> BlueBridge/NetSuite (pull)",
        scope: "customers.read",
        idempotencyRequired: false,
        approvalRequired: false,
        purpose: "Retrieve customer account records for reconciliation or customer matching.",
        versionNotes: [
          "Customer master sync may be optional for cash or COD flows depending on the agreed process.",
          "Use email as the primary external lookup where customer sync is enabled."
        ],
        fields: bbSameFields([
          bbField("(query)", "page", false, "int", "ns-optional", "Page number; default 1."),
          bbField("(query)", "pageSize", false, "int", "ns-optional", "Page size; default 50."),
          bbField("(query)", "updatedSinceUtc", false, "DateTime", "ns-optional", "Filter for incremental export."),
          bbField("(query)", "email", false, "string", "ns-optional", "Exact-match email filter."),
          bbField("(response)", "data.items[].email", true, "string", "ns-optional", "Customer email."),
          bbField("(response)", "data.items[].firstName", false, "string", "ns-optional", "Customer first name."),
          bbField("(response)", "data.items[].lastName", false, "string", "ns-optional", "Customer last name."),
          bbField("(response)", "data.items[].company", false, "string", "ns-optional", "Company name."),
          bbField("(response)", "data.items[].active", true, "bool", "ns-optional", "Customer active flag."),
          bbField("(response)", "data.items[].roles", false, "string[]", "ns-optional", "Assigned customer roles where available."),
          bbField("(response)", "data.items[].createdOnUtc", true, "DateTime", "ns-optional", "Customer creation timestamp.")
        ])
      },
      {
        method: "PUT",
        path: "/api/integration/v1/customers/by-email/{email}",
        direction: "BlueBridge/NetSuite -> nop (push/upsert)",
        scope: "customers.write",
        idempotencyRequired: true,
        idempotencyRecipe: "NS:Cust:{externalCustomerId}:{lastModifiedUtc}",
        approvalRequired: false,
        purpose: "Create or update a customer account identified by email.",
        versionNotes: [
          "Use when customer master synchronization is part of the agreed integration flow.",
          "Roles supplied in the payload must already exist on the target site."
        ],
        fields: bbSameFields([
          bbField("(from path)", "email", true, "string", "ns-required", "Customer email address."),
          bbField("(request body)", "firstName", false, "string", "ns-optional", "Customer first name."),
          bbField("(request body)", "lastName", false, "string", "ns-optional", "Customer last name."),
          bbField("(request body)", "company", false, "string", "ns-optional", "Company name."),
          bbField("(request body)", "phone", false, "string", "ns-optional", "Primary contact number."),
          bbField("(request body)", "active", true, "bool", "ns-optional", "Customer active flag."),
          bbField("(request body)", "roles", false, "string[]", "ns-optional", "Customer roles by system name."),
          bbField("(request body)", "externalReferences.externalSystem", false, "string", "ns-optional", "External system name, for example NetSuite."),
          bbField("(request body)", "externalReferences.externalType", false, "string", "ns-optional", "External entity type, for example Customer."),
          bbField("(request body)", "externalReferences.externalId", false, "string", "ns-required", "External customer identifier.")
        ])
      }
    ]
  },
  {
    key: "contacts",
    title: "Contacts (addresses)",
    description: "Customer ship-to and contact address exchange.",
    endpoints: [
      {
        method: "GET",
        path: "/api/integration/v1/customers/{customerId}/addresses",
        direction: "nop -> BlueBridge/NetSuite (pull)",
        scope: "contacts.read",
        idempotencyRequired: false,
        approvalRequired: false,
        purpose: "Retrieve the addresses linked to a customer account.",
        versionNotes: [
          "Use this endpoint where ship-to or contact addresses need to be reconciled with ERP-side address records."
        ],
        fields: bbSameFields([
          bbField("(from path)", "customerId", true, "int", "ns-required", "Customer identifier in nopCommerce."),
          bbField("(response)", "data[].id", true, "int", "ns-optional", "Address identifier."),
          bbField("(response)", "data[].firstName", false, "string", "ns-optional", "Recipient first name."),
          bbField("(response)", "data[].lastName", false, "string", "ns-optional", "Recipient last name."),
          bbField("(response)", "data[].company", false, "string", "ns-optional", "Recipient company."),
          bbField("(response)", "data[].address1", true, "string", "ns-optional", "Address line 1."),
          bbField("(response)", "data[].city", true, "string", "ns-optional", "City or locality."),
          bbField("(response)", "data[].zipPostalCode", false, "string", "ns-optional", "Postal code."),
          bbField("(response)", "data[].countryId", false, "int", "ns-optional", "Country identifier."),
          bbField("(response)", "data[].stateProvinceId", false, "int", "ns-optional", "State or province identifier."),
          bbField("(response)", "data[].phoneNumber", false, "string", "ns-optional", "Phone number.")
        ])
      },
      {
        method: "POST",
        path: "/api/integration/v1/customers/{customerId}/addresses",
        direction: "BlueBridge/NetSuite -> nop (push/upsert)",
        scope: "contacts.write",
        idempotencyRequired: true,
        idempotencyRecipe: "NS:ShipTo:{externalCustomerId}:{addressKey}:{lastModifiedUtc}",
        approvalRequired: false,
        purpose: "Create or update a customer-linked address using an external address key.",
        versionNotes: [
          "Use a stable external address key so the same ship-to record can be updated safely over time."
        ],
        fields: bbSameFields([
          bbField("(from path)", "customerId", true, "int", "ns-required", "Customer identifier in nopCommerce."),
          bbField("(request body)", "addressKey", true, "string", "ns-required", "Stable external address key."),
          bbField("(request body)", "firstName", false, "string", "ns-optional", "Recipient first name."),
          bbField("(request body)", "lastName", false, "string", "ns-optional", "Recipient last name."),
          bbField("(request body)", "email", false, "string", "ns-optional", "Recipient email address."),
          bbField("(request body)", "company", false, "string", "ns-optional", "Recipient company."),
          bbField("(request body)", "phoneNumber", false, "string", "ns-optional", "Recipient phone number."),
          bbField("(request body)", "address1", true, "string", "ns-required", "Address line 1."),
          bbField("(request body)", "address2", false, "string", "ns-optional", "Address line 2."),
          bbField("(request body)", "city", true, "string", "ns-required", "City or locality."),
          bbField("(request body)", "zipPostalCode", false, "string", "ns-optional", "Postal code."),
          bbField("(request body)", "countryId", false, "int", "ns-optional", "Country identifier."),
          bbField("(request body)", "stateProvinceId", false, "int", "ns-optional", "State or province identifier.")
        ])
      }
    ]
  },
  {
    key: "pricing",
    title: "Pricing",
    description: "Base and tier pricing retrieval and update by SKU.",
    endpoints: [
      {
        method: "GET",
        path: "/api/integration/v1/pricing/by-sku/{sku}",
        direction: "nop -> BlueBridge/NetSuite (pull)",
        scope: "pricing.read",
        idempotencyRequired: false,
        approvalRequired: false,
        purpose: "Retrieve base price, cost, and tier pricing for a product SKU.",
        versionNotes: [
          "Use the parent or base product SKU for this route.",
          "Tier pricing is returned where configured for the target site."
        ],
        fields: bbSameFields([
          bbField("(from path)", "sku", true, "string", "ns-required", "Base product SKU."),
          bbField("(response)", "data.sku", true, "string", "ns-optional", "Base product SKU."),
          bbField("(response)", "data.price", true, "decimal", "ns-optional", "Base selling price."),
          bbField("(response)", "data.oldPrice", false, "decimal", "ns-optional", "Original or compare-at price."),
          bbField("(response)", "data.productCost", false, "decimal", "ns-optional", "Product cost."),
          bbField("(response)", "data.tierPrices[]", false, "object[]", "ns-optional", "Tier pricing entries when configured."),
          bbField("(response)", "data.tierPrices[].quantity", false, "int", "ns-optional", "Tier break quantity."),
          bbField("(response)", "data.tierPrices[].price", false, "decimal", "ns-optional", "Tier price."),
          bbField("(response)", "data.tierPrices[].storeId", false, "int", "ns-optional", "Store-specific tier pricing identifier."),
          bbField("(response)", "data.tierPrices[].customerRoleId", false, "int", "ns-optional", "Customer-role-specific tier pricing identifier.")
        ])
      },
      {
        method: "PUT",
        path: "/api/integration/v1/pricing/by-sku/{sku}",
        direction: "BlueBridge/NetSuite -> nop (push/upsert)",
        scope: "pricing.write",
        idempotencyRequired: true,
        idempotencyRecipe: "NS:Price:{priceListOrContractId}:{sku}:{lastModifiedUtc}",
        approvalRequired: true,
        purpose: "Create or update base price and tier prices for a product SKU.",
        versionNotes: [
          "Use the parent or base product SKU for this route.",
          "Mode determines whether supplied tier prices replace the existing set or merge into it."
        ],
        fields: bbSameFields([
          bbField("(from path)", "sku", true, "string", "ns-required", "Base product SKU."),
          bbField("(request body)", "price", true, "decimal", "ns-required", "Base selling price."),
          bbField("(request body)", "oldPrice", false, "decimal", "ns-optional", "Original or compare-at price."),
          bbField("(request body)", "productCost", false, "decimal", "ns-required", "Product cost."),
          bbField("(request body)", "mode", false, "string", "ns-optional", "REPLACE or MERGE tier pricing behavior."),
          bbField("(request body)", "tierPrices", false, "object[]", "ns-optional", "Tier pricing entries."),
          bbField("(request body)", "tierPrices[].quantity", true, "int", "ns-required", "Tier break quantity."),
          bbField("(request body)", "tierPrices[].price", true, "decimal", "ns-required", "Tier price."),
          bbField("(request body)", "tierPrices[].storeId", false, "int", "ns-optional", "Store identifier where store-specific tiers are used."),
          bbField("(request body)", "tierPrices[].customerRoleId", false, "int", "ns-optional", "Customer-role identifier where role-specific tiers are used.")
        ])
      }
    ]
  },
  {
    key: "rfq",
    title: "RFQ",
    description: "Request-for-quote export and RFQ quote feedback where RFQ is enabled for the target site.",
    endpoints: [
      {
        method: "GET",
        path: "/api/integration/v1/rfqs/requests?status={status}&sinceUtc={utc}&page={p}&pageSize={n}",
        direction: "nop -> BlueBridge/NetSuite (export)",
        scope: "rfq.read",
        idempotencyRequired: false,
        approvalRequired: false,
        purpose: "Export RFQ requests for processing in NetSuite.",
        versionNotes: [
          "RFQ capability is site-dependent; confirm enablement with GET /meta/capabilities.",
          "Field naming may vary slightly by site or version, but the external intent remains the same."
        ],
        fields: bbVersionFields([
          bbField("(query)", "status", false, "string", "ns-optional", "RFQ status filter."),
          bbField("(query)", "sinceUtc", false, "DateTime", "ns-optional", "Incremental export filter."),
          bbField("(query)", "page", false, "int", "ns-optional", "Page number."),
          bbField("(query)", "pageSize", false, "int", "ns-optional", "Page size."),
          bbField("(response)", "data.items[].id", true, "int", "ns-optional", "RFQ request identifier."),
          bbField("(response)", "data.items[].customerId", true, "int", "ns-optional", "Customer identifier."),
          bbField("(response)", "data.items[].requestStatusId", true, "int", "ns-optional", "RFQ request status identifier."),
          bbField("(response)", "data.items[].createdOnUtc", true, "DateTime", "ns-optional", "Creation timestamp."),
          bbField("(response)", "data.items[].items[]", true, "object[]", "ns-optional", "RFQ line items."),
          bbField("(response)", "data.items[].items[].productId", true, "int", "ns-optional", "Product identifier for the RFQ line."),
          bbField("(response)", "data.items[].items[].quantity", true, "int", "ns-optional", "Requested quantity.")
        ], [
          bbField("(query)", "status", false, "string", "ns-optional", "RFQ status filter."),
          bbField("(query)", "sinceUtc", false, "DateTime", "ns-optional", "Incremental export filter."),
          bbField("(query)", "page", false, "int", "ns-optional", "Page number."),
          bbField("(query)", "pageSize", false, "int", "ns-optional", "Page size."),
          bbField("(response)", "data.items[].id", true, "int", "ns-optional", "RFQ request identifier."),
          bbField("(response)", "data.items[].customerId", true, "int", "ns-optional", "Customer identifier."),
          bbField("(response)", "data.items[].statusId", true, "int", "ns-optional", "RFQ request status identifier."),
          bbField("(response)", "data.items[].createdOnUtc", true, "DateTime", "ns-optional", "Creation timestamp."),
          bbField("(response)", "data.items[].items[]", true, "object[]", "ns-optional", "RFQ line items."),
          bbField("(response)", "data.items[].items[].productId", true, "int", "ns-optional", "Product identifier for the RFQ line."),
          bbField("(response)", "data.items[].items[].requestedQty", true, "int", "ns-optional", "Requested quantity.")
        ])
      },
      {
        method: "POST",
        path: "/api/integration/v1/rfqs/quotes/{quoteId}",
        direction: "BlueBridge/NetSuite -> nop (push)",
        scope: "rfq.write",
        idempotencyRequired: true,
        idempotencyRecipe: "NS:RfqQuote:{quoteId}:{updatedOnUtc}",
        approvalRequired: false,
        purpose: "Send RFQ quote feedback or pricing back to nopCommerce.",
        versionNotes: [
          "Confirm RFQ capability before use.",
          "Use the payload variant that matches the target site or environment."
        ],
        fields: bbVersionFields([
          bbField("(from path)", "quoteId", true, "int", "ns-required", "RFQ quote identifier."),
          bbField("(request body)", "requestStatusId", true, "int", "ns-required", "Updated RFQ request status."),
          bbField("(request body)", "externalQuotationNumber", false, "string", "ns-optional", "External RFQ or quotation reference.")
        ], [
          bbField("(from path)", "quoteId", true, "int", "ns-required", "RFQ quote identifier."),
          bbField("(request body)", "statusId", true, "int", "ns-required", "Updated RFQ quote status."),
          bbField("(request body)", "expirationDateUtc", false, "DateTime", "ns-optional", "Quote expiration timestamp."),
          bbField("(request body)", "adminNotes", false, "string", "ns-optional", "Internal quote notes to display where configured."),
          bbField("(request body)", "items", false, "object[]", "ns-optional", "Quoted line items."),
          bbField("(request body)", "items[].offeredQty", false, "int", "ns-optional", "Quoted quantity."),
          bbField("(request body)", "items[].offeredUnitPrice", false, "decimal", "ns-optional", "Quoted unit price.")
        ])
      }
    ]
  },
  {
    key: "offline-transactions",
    title: "Offline transaction info",
    description: "NetSuite-originated transactions such as invoices, cash sales, or credit memos when they need to be represented in nopCommerce.",
    endpoints: [
      {
        method: "POST",
        path: "/api/integration/v1/offline-transactions",
        direction: "BlueBridge/NetSuite -> nop (push/import)",
        scope: "offline.write",
        idempotencyRequired: true,
        idempotencyRecipe: "NS:Txn:{transactionType}:{netSuiteId}",
        approvalRequired: false,
        purpose: "Import an offline transaction that originated in NetSuite.",
        versionNotes: [
          "Use this route where NetSuite-side invoices, cash sales, or credit memos need to be visible for lookup or reconciliation."
        ],
        fields: bbSameFields([
          bbField("(request body)", "externalId", true, "string", "ns-required", "External transaction identifier."),
          bbField("(request body)", "transactionType", true, "string", "ns-required", "Transaction type such as Invoice, CashSale, or CreditMemo."),
          bbField("(request body)", "customerEmail", false, "string", "ns-optional", "Related customer email when available."),
          bbField("(request body)", "transactionDateUtc", true, "DateTime", "ns-required", "Transaction date and time."),
          bbField("(request body)", "currencyCode", true, "string", "ns-required", "Currency code."),
          bbField("(request body)", "total", true, "decimal", "ns-required", "Transaction total."),
          bbField("(request body)", "status", true, "string", "ns-required", "Transaction status."),
          bbField("(request body)", "lines", true, "object[]", "ns-required", "Transaction line items."),
          bbField("(request body)", "lines[].sku", true, "string", "ns-required", "Line item SKU."),
          bbField("(request body)", "lines[].quantity", true, "int", "ns-required", "Line quantity."),
          bbField("(request body)", "lines[].unitPrice", true, "decimal", "ns-required", "Line unit price."),
          bbField("(request body)", "lines[].lineTotal", true, "decimal", "ns-required", "Line total.")
        ])
      },
      {
        method: "GET",
        path: "/api/integration/v1/offline-transactions?customerEmail={email}&sinceUtc={utc}&page={p}&pageSize={n}",
        direction: "nop -> BlueBridge/NetSuite (pull)",
        scope: "offline.read",
        idempotencyRequired: false,
        approvalRequired: false,
        purpose: "Retrieve imported offline transactions for reconciliation or customer visibility.",
        versionNotes: [
          "Use this route to confirm imported transaction visibility after synchronization."
        ],
        fields: bbSameFields([
          bbField("(query)", "customerEmail", false, "string", "ns-optional", "Customer email filter."),
          bbField("(query)", "sinceUtc", false, "DateTime", "ns-optional", "Incremental export filter."),
          bbField("(query)", "page", false, "int", "ns-optional", "Page number."),
          bbField("(query)", "pageSize", false, "int", "ns-optional", "Page size."),
          bbField("(response)", "data.items[].externalId", true, "string", "ns-optional", "External transaction identifier."),
          bbField("(response)", "data.items[].transactionType", true, "string", "ns-optional", "Transaction type."),
          bbField("(response)", "data.items[].customerEmail", false, "string", "ns-optional", "Related customer email."),
          bbField("(response)", "data.items[].total", true, "decimal", "ns-optional", "Transaction total."),
          bbField("(response)", "data.items[].status", true, "string", "ns-optional", "Transaction status."),
          bbField("(response)", "data.items[].transactionDateUtc", true, "DateTime", "ns-optional", "Transaction date and time.")
        ])
      }
    ]
  },
  {
    key: "sales",
    title: "Sales (orders)",
    description: "Sales order export from nopCommerce and order status feedback from NetSuite.",
    endpoints: [
      {
        method: "GET",
        path: "/api/integration/v1/orders?sinceUtc={utc}&orderStatusId={id}&paymentStatusId={id}&storeId={id}&page={p}&pageSize={n}",
        direction: "nop -> BlueBridge/NetSuite (export)",
        scope: "orders.read",
        idempotencyRequired: false,
        approvalRequired: false,
        purpose: "Export orders, line items, and billing or shipping data for processing in NetSuite.",
        versionNotes: [
          "Sensitive card data is never exposed by this interface.",
          "Order exports include transaction-level billing and shipping details required for fulfillment and accounting flows."
        ],
        fields: bbSameFields([
          bbField("(query)", "sinceUtc", false, "DateTime", "ns-optional", "Incremental export filter."),
          bbField("(query)", "orderStatusId", false, "int", "ns-optional", "Order status filter."),
          bbField("(query)", "paymentStatusId", false, "int", "ns-optional", "Payment status filter."),
          bbField("(query)", "storeId", false, "int", "ns-optional", "Store identifier filter."),
          bbField("(query)", "page", false, "int", "ns-optional", "Page number."),
          bbField("(query)", "pageSize", false, "int", "ns-optional", "Page size."),
          bbField("(response)", "data.items[].id", true, "int", "ns-optional", "Order identifier."),
          bbField("(response)", "data.items[].customOrderNumber", true, "string", "ns-optional", "Display order number."),
          bbField("(response)", "data.items[].storeId", true, "int", "ns-optional", "Store identifier."),
          bbField("(response)", "data.items[].customerId", true, "int", "ns-optional", "Customer identifier."),
          bbField("(response)", "data.items[].orderStatusId", true, "int", "ns-optional", "Order status."),
          bbField("(response)", "data.items[].paymentStatusId", true, "int", "ns-optional", "Payment status."),
          bbField("(response)", "data.items[].shippingStatusId", true, "int", "ns-optional", "Shipping status."),
          bbField("(response)", "data.items[].orderTotal", true, "decimal", "ns-optional", "Order total."),
          bbField("(response)", "data.items[].orderTax", false, "decimal", "ns-optional", "Order tax total."),
          bbField("(response)", "data.items[].createdOnUtc", true, "DateTime", "ns-optional", "Order creation timestamp."),
          bbField("(response)", "data.items[].paidDateUtc", false, "DateTime", "ns-optional", "Order paid timestamp where available."),
          bbField("(response)", "data.items[].billingAddress", false, "object", "ns-optional", "Billing address object."),
          bbField("(response)", "data.items[].shippingAddress", false, "object", "ns-optional", "Shipping address object when relevant."),
          bbField("(response)", "data.items[].orderItems[]", true, "object[]", "ns-optional", "Order line items."),
          bbField("(response)", "data.items[].orderItems[].sku", true, "string", "ns-optional", "Line item SKU."),
          bbField("(response)", "data.items[].orderItems[].quantity", true, "int", "ns-optional", "Line quantity."),
          bbField("(response)", "data.items[].orderItems[].unitPriceExclTax", false, "decimal", "ns-optional", "Unit price excluding tax."),
          bbField("(response)", "data.items[].orderItems[].priceExclTax", false, "decimal", "ns-optional", "Extended line price excluding tax.")
        ])
      },
      {
        method: "POST",
        path: "/api/integration/v1/orders/{orderId}/status",
        direction: "BlueBridge/NetSuite -> nop (push)",
        scope: "orders.write",
        idempotencyRequired: true,
        idempotencyRecipe: "NS:SOStatus:{netSuiteSalesOrderId}:{updatedOnUtc}:{orderStatusId}:{shippingStatusId}:{paymentStatusId}",
        approvalRequired: false,
        purpose: "Update order, shipping, and payment status fields in nopCommerce.",
        versionNotes: [
          "Use this route to feed NetSuite sales order progress back into nopCommerce.",
          "Optional order notes can be displayed to the customer where enabled."
        ],
        fields: bbSameFields([
          bbField("(from path)", "orderId", true, "int", "ns-required", "nopCommerce order identifier."),
          bbField("(request body)", "orderStatusId", true, "int", "ns-required", "Updated order status."),
          bbField("(request body)", "shippingStatusId", true, "int", "ns-required", "Updated shipping status."),
          bbField("(request body)", "paymentStatusId", true, "int", "ns-required", "Updated payment status."),
          bbField("(request body)", "externalReferences.externalSystem", false, "string", "ns-optional", "External system name, for example NetSuite."),
          bbField("(request body)", "externalReferences.externalType", false, "string", "ns-optional", "External entity type, for example SalesOrder."),
          bbField("(request body)", "externalReferences.externalId", false, "string", "ns-required", "External sales order identifier."),
          bbField("(request body)", "orderNote.note", false, "string", "ns-optional", "Order note text."),
          bbField("(request body)", "orderNote.displayToCustomer", false, "bool", "ns-optional", "Whether the note should be customer-visible.")
        ])
      }
    ]
  },
  {
    key: "customer-payments",
    title: "Customer payments",
    description: "Payment export and payment status feedback for order-linked payment flows.",
    endpoints: [
      {
        method: "GET",
        path: "/api/integration/v1/payments?sinceUtc={utc}&paymentStatusId=30&storeId={id}&page={p}&pageSize={n}",
        direction: "nop -> BlueBridge/NetSuite (pull/export)",
        scope: "payments.read",
        idempotencyRequired: false,
        approvalRequired: false,
        purpose: "Export paid-order payment details for reconciliation or financial posting.",
        versionNotes: [
          "Payment data is returned at order level because nopCommerce stores payment state on the order record."
        ],
        fields: bbSameFields([
          bbField("(query)", "sinceUtc", false, "DateTime", "ns-optional", "Incremental export filter."),
          bbField("(query)", "paymentStatusId", false, "int", "ns-optional", "Payment status filter."),
          bbField("(query)", "storeId", false, "int", "ns-optional", "Store identifier filter."),
          bbField("(query)", "page", false, "int", "ns-optional", "Page number."),
          bbField("(query)", "pageSize", false, "int", "ns-optional", "Page size."),
          bbField("(response)", "data.items[].orderId", true, "int", "ns-optional", "Order identifier."),
          bbField("(response)", "data.items[].paymentStatusId", true, "int", "ns-optional", "Payment status."),
          bbField("(response)", "data.items[].paidDateUtc", false, "DateTime", "ns-optional", "Paid timestamp."),
          bbField("(response)", "data.items[].authorizationTransactionId", false, "string", "ns-optional", "Authorization reference."),
          bbField("(response)", "data.items[].captureTransactionId", false, "string", "ns-optional", "Capture reference."),
          bbField("(response)", "data.items[].orderTotal", false, "decimal", "ns-optional", "Order total."),
          bbField("(response)", "data.items[].refundedAmount", false, "decimal", "ns-optional", "Refunded amount to date.")
        ])
      },
      {
        method: "POST",
        path: "/api/integration/v1/orders/{orderId}/payment",
        direction: "BlueBridge/NetSuite -> nop (push)",
        scope: "payments.write",
        idempotencyRequired: true,
        idempotencyRecipe: "NS:Payment:{netSuitePaymentId}",
        approvalRequired: false,
        purpose: "Update payment state for an existing order.",
        versionNotes: [
          "Use this route to feed payment confirmation or refund state back into nopCommerce."
        ],
        fields: bbSameFields([
          bbField("(from path)", "orderId", true, "int", "ns-required", "nopCommerce order identifier."),
          bbField("(request body)", "paymentStatusId", true, "int", "ns-required", "Updated payment status."),
          bbField("(request body)", "paidDateUtc", false, "DateTime", "ns-optional", "Paid timestamp."),
          bbField("(request body)", "refundedAmount", false, "decimal", "ns-optional", "Refunded amount where applicable."),
          bbField("(request body)", "externalReferences.externalSystem", false, "string", "ns-optional", "External system name, for example NetSuite."),
          bbField("(request body)", "externalReferences.externalType", false, "string", "ns-optional", "External entity type, for example Payment."),
          bbField("(request body)", "externalReferences.externalId", false, "string", "ns-required", "External payment identifier.")
        ])
      }
    ]
  },
  {
    key: "returns",
    title: "Returns",
    description: "Return request export and RMA or status feedback for return flows.",
    endpoints: [
      {
        method: "GET",
        path: "/api/integration/v1/returns?sinceUtc={utc}&statusId={id}&storeId={id}",
        direction: "nop -> BlueBridge/NetSuite (pull)",
        scope: "returns.read",
        idempotencyRequired: false,
        approvalRequired: false,
        purpose: "Retrieve return requests raised in nopCommerce.",
        versionNotes: [
          "Use this route when return requests created in nopCommerce need to be processed in NetSuite or BlueBridge middleware."
        ],
        fields: bbSameFields([
          bbField("(query)", "sinceUtc", false, "DateTime", "ns-optional", "Incremental export filter."),
          bbField("(query)", "statusId", false, "int", "ns-optional", "Return status filter."),
          bbField("(query)", "storeId", false, "int", "ns-optional", "Store identifier filter."),
          bbField("(response)", "data.items[].id", true, "int", "ns-optional", "Return request identifier."),
          bbField("(response)", "data.items[].customNumber", false, "string", "ns-optional", "Display return number."),
          bbField("(response)", "data.items[].storeId", true, "int", "ns-optional", "Store identifier."),
          bbField("(response)", "data.items[].customerId", true, "int", "ns-optional", "Customer identifier."),
          bbField("(response)", "data.items[].orderItemId", true, "int", "ns-optional", "Order line identifier."),
          bbField("(response)", "data.items[].quantity", true, "int", "ns-optional", "Requested return quantity."),
          bbField("(response)", "data.items[].reasonForReturn", false, "string", "ns-optional", "Return reason."),
          bbField("(response)", "data.items[].requestedAction", false, "string", "ns-optional", "Requested return action."),
          bbField("(response)", "data.items[].returnRequestStatusId", true, "int", "ns-optional", "Return status."),
          bbField("(response)", "data.items[].createdOnUtc", true, "DateTime", "ns-optional", "Creation timestamp.")
        ])
      },
      {
        method: "POST",
        path: "/api/integration/v1/returns/{returnRequestId}/status",
        direction: "BlueBridge/NetSuite -> nop (push)",
        scope: "returns.write",
        idempotencyRequired: true,
        idempotencyRecipe: "NS:Rma:{returnRequestId}:{updatedOnUtc}",
        approvalRequired: false,
        purpose: "Update a return request with return status and external RMA reference details.",
        versionNotes: [
          "This route supports RMA or return-status feedback against an existing nopCommerce return request."
        ],
        fields: bbSameFields([
          bbField("(from path)", "returnRequestId", true, "int", "ns-required", "nopCommerce return request identifier."),
          bbField("(request body)", "returnRequestStatusId", true, "int", "ns-required", "Updated return status."),
          bbField("(request body)", "staffNotes", false, "string", "ns-optional", "Return handling notes."),
          bbField("(request body)", "externalReferences.externalSystem", false, "string", "ns-optional", "External system name, for example NetSuite."),
          bbField("(request body)", "externalReferences.externalType", false, "string", "ns-optional", "External entity type, for example ReturnAuthorization."),
          bbField("(request body)", "externalReferences.externalId", false, "string", "ns-required", "External RMA or return authorization identifier.")
        ])
      }
    ]
  }
];