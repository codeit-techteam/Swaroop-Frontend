import type {
  GstInvoiceDocument,
  InvoiceDocument,
  ProformaInvoiceDocument,
  PurchaseOrderDocument,
} from '@/types/documents';

const inr = (amount: number) => `₹ ${amount.toLocaleString('en-IN')}`;

export function buildPoDocumentContent(po: PurchaseOrderDocument): string {
  return [
    'PETROTRADE — PURCHASE ORDER',
    '===========================',
    '',
    `PO Number     : ${po.poNumber}`,
    `Order Number  : ${po.orderNumber}`,
    `PO Date       : ${po.poDate}`,
    '',
    'BUYER',
    `  ${po.buyer.name}`,
    `  GSTIN: ${po.buyer.gstin || '—'}`,
    `  ${po.buyer.address || '—'}`,
    '',
    'BILL FROM',
    `  ${po.sellerInfo.name}`,
    `  GSTIN: ${po.sellerInfo.gstin || '—'}`,
    `  ${po.sellerInfo.address || '—'}`,
    '',
    'SUPPLY NETWORK',
    `  Supply Source : ${po.seller}`,
    `  Warehouse Hub : ${po.warehouse}`,
    '',
    'PRODUCT',
    `  ${po.product} (${po.grade})`,
    `  Quantity: ${po.quantityMt} MT`,
    '',
    'PRICING',
    `  Taxable     : ${inr(po.pricing.taxableValue)}`,
    `  CGST        : ${inr(po.pricing.cgst)}`,
    `  SGST        : ${inr(po.pricing.sgst)}`,
    `  IGST        : ${inr(po.pricing.igst)}`,
    `  Freight     : ${inr(po.pricing.freight)}`,
    `  Insurance   : ${inr(po.pricing.insurance)}`,
    `  Grand Total : ${inr(po.pricing.grandTotal)}`,
    '',
    `Payment Terms : ${po.paymentTerms}`,
    `Delivery Terms: ${po.deliveryTerms}`,
    '',
    '© PetroTrade Customer Portal',
  ].join('\n');
}

export function buildInvoiceDocumentContent(inv: InvoiceDocument): string {
  return [
    'TAX INVOICE',
    '===========',
    '',
    `Invoice No.   : ${inv.invoiceNumber}`,
    `Order Number  : ${inv.orderNumber}`,
    `PO Number     : ${inv.poNumber}`,
    `Invoice Date  : ${inv.invoiceDate}`,
    '',
    `Bill From     : ${inv.company.name} (${inv.company.gstin || '—'})`,
    `Buyer         : ${inv.buyer.name} (${inv.buyer.gstin || '—'})`,
    `Supply Source : ${inv.seller}`,
    '',
    `Product       : ${inv.product} (${inv.grade})`,
    `Warehouse Hub : ${inv.warehouse}`,
    '',
    `Taxable Value : ${inr(inv.pricing.taxableValue)}`,
    `CGST / SGST   : ${inr(inv.pricing.cgst)} / ${inr(inv.pricing.sgst)}`,
    `IGST          : ${inr(inv.pricing.igst)}`,
    `Freight       : ${inr(inv.pricing.freight)}`,
    `Insurance     : ${inr(inv.pricing.insurance)}`,
    `Grand Total   : ${inr(inv.pricing.grandTotal)}`,
    '',
    `Payment       : ${inv.paymentInfo.method}`,
    `UTR           : ${inv.paymentInfo.utr ?? '—'}`,
    `Payment To    : PetroTrade`,
    '',
    '© PetroTrade Customer Portal',
  ].join('\n');
}

export function buildProformaDocumentContent(pi: ProformaInvoiceDocument): string {
  return buildGenericDocumentContent({
    title: 'Proforma Invoice',
    documentNumber: pi.proformaNumber,
    orderNumber: pi.orderNumber,
    seller: pi.seller,
    warehouse: pi.warehouse,
    product: `${pi.product} (${pi.grade})`,
    extraLines: [
      `Amount        : ${inr(pi.amount)}`,
      `Created       : ${pi.createdDate}`,
      `Expiry        : ${pi.expiryDate}`,
      `Status        : ${pi.status}`,
      `Payment Terms : ${pi.paymentTerms}`,
      `Validity      : ${pi.validityNote}`,
    ],
  });
}

export function buildGstDocumentContent(g: GstInvoiceDocument): string {
  return buildGenericDocumentContent({
    title: 'GST Tax Invoice',
    documentNumber: g.invoiceNumber,
    orderNumber: g.orderNumber,
    seller: g.seller,
    warehouse: g.warehouse,
    product: g.product,
    extraLines: [
      `GSTIN         : ${g.gstNumber}`,
      `PO Number     : ${g.poNumber}`,
      `Taxable Value : ${inr(g.taxableValue)}`,
      `CGST          : ${inr(g.cgst)}`,
      `SGST          : ${inr(g.sgst)}`,
      `IGST          : ${inr(g.igst)}`,
      `Total GST     : ${inr(g.totalGst)}`,
      `Grand Total   : ${inr(g.grandTotal)}`,
      `Place of Supply: ${g.placeOfSupply}`,
      `HSN           : ${g.hsn}`,
      `Buyer GSTIN   : ${g.buyerGstin}`,
      `Seller GSTIN  : ${g.sellerGstin}`,
    ],
  });
}

export function buildGenericDocumentContent(meta: {
  title: string;
  documentNumber: string;
  orderNumber?: string;
  seller?: string;
  warehouse?: string;
  product?: string;
  extraLines?: string[];
}): string {
  return [
    `PETROTRADE CUSTOMER PORTAL — ${meta.title.toUpperCase()}`,
    '='.repeat(48),
    '',
    `Document No.  : ${meta.documentNumber}`,
    meta.orderNumber ? `Order Number  : ${meta.orderNumber}` : null,
    meta.product ? `Product       : ${meta.product}` : null,
    meta.seller ? `Supply Source : ${meta.seller}` : null,
    meta.warehouse ? `Warehouse Hub : ${meta.warehouse}` : null,
    '',
    ...(meta.extraLines ?? []),
    '',
    '© PetroTrade Customer Portal',
  ]
    .filter(Boolean)
    .join('\n');
}
