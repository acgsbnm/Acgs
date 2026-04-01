// data-contract-classification.js — Auto-tag NS contract labels on fields
// Auto-extracted from monolithic HTML


// ============================================================
// AUTO-TAG NS CONTRACT — assigns contract to fields that don't
// have one manually set. Rules-based assignment.
// ============================================================
(function autoTagContracts() {
  // Fields that NetSuite MUST provide for the integration to work
  const nsRequired = new Set([
    'sku', 'sku (from path)', 'name', 'price', 'productcost', 'stockquantity',
    'weight/length/width/height', 'weight', 'length', 'width', 'height',
    'externalsystem/externaltype/externalid', 'externalid', 'externalid (netsuite item)',
    'externalid (netsuite customer)', 'couponcode', 'couponcode (from path)',
    'giftcardcouponcode (from path)', 'amount', 'email (from path)',
    'transactiontype', 'transactiondateutc', 'currencycode', 'total', 'status',
    'quantity', 'unitprice', 'linetotal', 'attributename',
    'categorypath', 'categoryname', 'name (from path)',
    'variantsku', 'attributes', 'combinations', 'categories', 'images',
    'mode', 'items', 'tierprices', 'values',
    'orderstatusid', 'shippingstatusid', 'paymentstatusid',
    'returnrequeststatusid', 'requeststatusid',
    'address1', 'city'
  ]);

  // Fields NS can optionally provide  
  const nsOptional = new Set([
    'published', 'deleted', 'shortdescription', 'fulldescription',
    'manufacturerpartnumber', 'gtin', 'oldprice',
    'isshipenabled', 'isfreeshippping', 'istaxexempt',
    'metakeywords/metatitle/metadescription', 'metakeywords', 'metatitle', 'metadescription',
    'availablestartdatetimeutc/availableenddatetimeutc',
    'overriddenprice', 'allowoutofstockorders', 'minstockquantity',
    'imageurl', 'imageurls', 'base64data', 'mimetype',
    'altattribute', 'titleattribute', 'seofilename', 'displayorder',
    'controltype', 'isrequired', 'textprompt',
    'colorsquaresrgb', 'priceadjustment', 'weightadjustment', 'cost',
    'isfeaturedproduct', 'isgiftcardactivated',
    'recipientname', 'recipientemail', 'sendername', 'senderemail', 'message',
    'usepercentage', 'discountpercentage', 'discountamount', 'maximumdiscountamount',
    'startdateutc', 'enddateutc', 'requirescouponcode', 'isactive', 'iscumulative',
    'discounttypeid', 'discountlimitationid', 'limitationtimes',
    'firstname', 'lastname', 'email', 'company', 'username',
    'phone', 'phonenumber', 'vatnumber', 'active',
    'description', 'seoslug', 'slug', 'languageid',
    'vendorid', 'vendor', 'manufacturer',
    'roles', 'addresskey', 'address2', 'zippostalcode',
    'customerrole.systemname', 'countryid', 'stateprovinceid',
    'note', 'displaytocustomer', 'staffnotes', 'reason',
    'warehouseid', 'asofutc',
    'netsuitesalesorderid', 'netsuitepmaid', 'netsuitepaymentid',
    'paiddateutc', 'refundedamount',
    'storeid', 'customerroleid',
    'startdatetimeutc', 'enddatetimeutc',
    'customerentersricedprice', 'customeremail',
    'lines', 'imageindexes'
  ]);

  // Tables/field patterns that are always auto-generated
  const autoGenPatterns = [
    /^Acgs_pendingchange/i,
    /^stockquantityhistory/i,
    /^\(auto-created\)/i,
    /^\(staged/i,
    /^\(deleted\)/i,
    /^urlrecord.*slug.*auto/i
  ];

  // Tables that are always nop-internal
  const nopInternalTables = new Set([
    'product_category_mapping', 'product_picture_mapping', 'product_productattribute_mapping',
    'productattributevalue', 'picturebinary', 'customeraddresses',
    'customer_customerrole_mapping', 'discountusagehistory', 'giftcardusagehistory',
    'productattributecombinationpicture', 'predefinedproductattributevalue',
    'productwarehouseinventory'
  ]);

  // Field patterns always nop-internal
  const nopInternalFields = new Set([
    'id', 'productid', 'categoryid', 'customerid', 'orderid', 'pictureid',
    'productattributeid', 'entityid', 'entityname', 'mappingid',
    'producttypeid', 'producttemplateid', 'visibleindividually',
    'admincomment', 'attributesxml', 'attributedescription',
    'customerentersrice/minimumcustomerenteredprice/maximumcustomerenteredprice',
    'manageinventorymethodid', 'usemultiplewarehouses',
    'displaystockavailability/displaystockquantity',
    'lowstockactivityid/notifyadminforquantitybelow',
    'backordermodeid', 'allowbackinstocksubscriptions',
    'orderminimumquantity/ordermaximumquantity/allowedquantities',
    'allowaddingonlyexistingattributecombinations',
    'displayattributecombinationimagesonly',
    'allowcustomerreviews', 'disablebuybutton/disablewishlistbutton',
    'availableforpreorder/callforprice',
    'shipseparately', 'additionalshippingcharge', 'deliverydateid',
    'markasnew/markasnewstartdatetimeutc/markasnewenddatetimeutc',
    'basepriceenabled/basepriceamount/basepriceunitid/basepricebaseamount/basepricebaseunitid',
    'notreturnable', 'hastierprices/hasdiscountsapplied',
    'updatedonutc', 'createdonutc', 'lastactivitydateutc',
    'createdonutc/updatedonutc', 'registeredinstoreid',
    'customattributes', 'virtualpath', 'binarydata',
    'taxcategoryid', 'islanguage', 'isactive',
    'ageverification/minimumagetopurchase', 'ageverification', 'minimumagetopurchase',
    'mustchangepassword',
    'manufacturertemplateid', 'pagesize/allowcustomerstoselectpagesize/pagesizeoptions',
    'pagesize', 'pagesizeoptions',
    'appliedtosubcategories', 'parentcategoryid',
    'limitedtostores', 'subjecttovat',
    'overridetaxdisplaytype/defaulttaxdisplaytypeid',
    'issystemrole', 'purchasedwithproductid',
    'allcolumns', 'all columns',
    'roundingtypeid', 'defaultcurrencyid',
    'allowsbilling', 'allowsshipping'
  ]);

  integrationSpec.forEach(fn => {
    fn.endpoints.forEach(ep => {
      if (!ep.fields) return;
      ['4.60', '4.90'].forEach(ver => {
        const fields = ep.fields[ver];
        if (!fields || !Array.isArray(fields)) return;
        fields.forEach(f => {
          if (f.contract) return; // Already manually tagged
          const tbl = f.table.toLowerCase().trim();
          const fld = f.field.toLowerCase().trim();

          // Auto-generated patterns
          if (autoGenPatterns.some(p => p.test(tbl + ' ' + fld))) { f.contract = 'auto-generated'; return; }
          if (fld.includes('(auto-created)') || fld.includes('(staged') || fld.includes('(deleted)')) { f.contract = 'auto-generated'; return; }

          // Nop-internal tables
          if (nopInternalTables.has(tbl)) { f.contract = 'nop-internal'; return; }

          // Nop-internal fields by exact match
          if (nopInternalFields.has(fld)) { f.contract = 'nop-internal'; return; }

          // Request body fields: check if NS needs to send them
          if (tbl === '(request body)' || tbl === '(from path)' || tbl.startsWith('items[]') || tbl.startsWith('lines[]') || tbl.startsWith('tierprices[]') || tbl.startsWith('categories[]') || tbl.startsWith('attributes[]') || tbl.startsWith('combinations[]') || tbl.startsWith('images[]') || tbl.startsWith('manufacturers[]') || tbl === 'vendor' || tbl === 'manufacturer' || tbl === 'externalreferences') {
            if (f.required) { f.contract = 'ns-required'; return; }
            f.contract = 'ns-optional'; return;
          }

          // ExternalReference table
          if (tbl.includes('externalreference')) { f.contract = 'ns-required'; return; }

          // ERP Required by field name
          if (nsRequired.has(fld)) { f.contract = 'ns-required'; return; }

          // ERP Optional by field name
          if (nsOptional.has(fld)) { f.contract = 'ns-optional'; return; }

          // Joined fields from read endpoints
          if (fld.includes('(joined)') || f.notes?.includes('joined')) { f.contract = 'nop-internal'; return; }

          // UrlRecord
          if (tbl === 'urlrecord') { f.contract = 'auto-generated'; return; }

          // Reference data tables — all nop-internal (read-only lookups)
          const refTables = ['country','stateprovince','warehouse','taxcategory','currency','language','store','customerrole','deliverydate','measureweight','measuredimension'];
          if (refTables.includes(tbl)) { f.contract = 'nop-internal'; return; }

          // Default fallback: if it's on a nop table and not a request body, it's nop-internal
          if (tbl !== '(request body)' && !tbl.startsWith('(')) { f.contract = 'nop-internal'; return; }

          // Catch-all
          f.contract = 'ns-optional';
        });
      });
    });
  });
})();