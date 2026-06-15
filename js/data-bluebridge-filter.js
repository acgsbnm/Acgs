// data-bluebridge-filter.js
// Bluebridge-facing filter layer applied to the full ACGS integration spec.

(function applyBluebridgeFilter() {
  if (!Array.isArray(integrationSpec)) return;

  const internalEndpointPrefixes = [
    "/api/integration/v1/approvals"
  ];

  const internalNotePatterns = [
    /Acgs_PendingChange/i,
    /Acgs_PendingChangeField/i,
    /GenericAttribute/i,
    /IProductService/i,
    /AttributesXml/i,
    /plugin table/i,
    /join table/i,
    /\bFK\b/i,
    /internal IDs?/i,
    /server execution order/i
  ];

  const stringReplacements = [
    [/Acgs_ExternalReference/gi, "external references"],
    [/Acgs_PendingChangeField/gi, "approval change detail"],
    [/Acgs_PendingChange/gi, "approval staging"],
    [/GenericAttribute/gi, "platform metadata"],
    [/UrlRecord/gi, "SEO slug"],
    [/IProductService/gi, "the product service"],
    [/ProductWarehouseInventory/gi, "warehouse inventory"],
    [/ProductAttributeCombinationPicture/gi, "combination image associations"],
    [/ProductAttributeCombination/gi, "product combinations"],
    [/Product_ProductAttribute_Mapping/gi, "product attribute mappings"],
    [/Product_Picture_Mapping/gi, "product image mappings"],
    [/Product_SpecificationAttribute_Mapping/gi, "product specifications"],
    [/Product_Manufacturer_Mapping/gi, "product manufacturer assignments"],
    [/Product_Category_Mapping/gi, "product category assignments"]
  ];

  const tableNameMap = new Map([
    ["Acgs_ExternalReference", "externalReferences"],
    ["Acgs_PendingChange", "approval staging"],
    ["UrlRecord", "seoSlug"],
    ["Product_Category_Mapping", "categories[]"],
    ["Product_Manufacturer_Mapping", "manufacturers[]"],
    ["Product_ProductAttribute_Mapping", "attributes[]"],
    ["ProductAttributeValue", "attributes[].values[]"],
    ["ProductAttributeCombination", "combinations[]"],
    ["ProductAttributeCombinationPicture", "combinations[].images[]"],
    ["Product_Picture_Mapping", "images[]"],
    ["Picture", "images[]"],
    ["StoreMapping", "storeMappings.stores[]"],
    ["ProductTag", "tags[]"],
    ["Product_ProductTag_Mapping", "tags[]"],
    ["Product_SpecificationAttribute_Mapping", "specifications[]"],
    ["SpecificationAttribute", "specifications[]"],
    ["SpecificationAttributeOption", "specifications[]"],
    ["ProductWarehouseInventory", "warehouseInventory[]"]
  ]);

  function sanitizeText(value) {
    if (!value) return value;
    let output = value;
    for (const [pattern, replacement] of stringReplacements) {
      output = output.replace(pattern, replacement);
    }
    return output
      .replace(/\s{2,}/g, " ")
      .replace(/\s+([.,;:])/g, "$1")
      .trim();
  }

  function isInternalNote(value) {
    return internalNotePatterns.some(pattern => pattern.test(value || ""));
  }

  function sanitizeFieldTableName(name) {
    if (!name || name.startsWith("(")) return name;
    return tableNameMap.get(name) || name;
  }

  function sanitizeFields(fields) {
    if (!Array.isArray(fields)) return fields;
    return fields
      .filter(field => {
        if (!field) return false;
        if ((field.table || "").toLowerCase() === "acgs_pendingchange") return false;
        if (/\(staged if approval enabled\)/i.test(field.field || "")) return false;
        return true;
      })
      .map(field => {
        const next = { ...field };
        next.table = sanitizeFieldTableName(next.table);
        next.notes = sanitizeText(next.notes);
        return next;
      });
  }

  integrationSpec.forEach(section => {
    section.description = sanitizeText(section.description);
    section.endpoints = (section.endpoints || [])
      .filter(endpoint => {
        const path = endpoint.path || "";
        return !internalEndpointPrefixes.some(prefix => path.startsWith(prefix));
      })
      .map(endpoint => {
        const next = { ...endpoint };
        next.direction = sanitizeText(next.direction);
        next.purpose = sanitizeText(next.purpose);
        next.versionNotes = (next.versionNotes || [])
          .filter(note => !isInternalNote(note))
          .map(note => sanitizeText(note));

        if (next.fields && typeof next.fields === "object") {
          next.fields = {
            "4.60": sanitizeFields(next.fields["4.60"]),
            "4.90": sanitizeFields(next.fields["4.90"])
          };
        }

        return next;
      });
  });

  for (let i = integrationSpec.length - 1; i >= 0; i -= 1) {
    if (!integrationSpec[i].endpoints || integrationSpec[i].endpoints.length === 0) {
      integrationSpec.splice(i, 1);
    }
  }

  if (typeof proposedAdditions !== "undefined" && Array.isArray(proposedAdditions)) {
    proposedAdditions.length = 0;
  }
})();
