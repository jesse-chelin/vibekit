---
name: pdf
description: Adds PDF generation via @react-pdf/renderer with pre-built invoice template, PDF viewer component, and download helpers. Use when the user needs to generate PDFs, create invoices/receipts/reports, export documents, or mentions PDF generation.
---

# PDF — Generation & Preview

Generate PDFs from React components using @react-pdf/renderer. Includes a pre-built invoice template, a PDF viewer/download component, and helpers for server-side PDF generation.

## When NOT to Use

- User just needs to print a web page (use `window.print()` with print CSS instead)
- User needs to edit/annotate existing PDFs (this generates new PDFs only)
- User needs to parse/extract data from uploaded PDFs (use a parsing library instead)

## What It Adds

| File | Purpose |
|------|---------|
| `src/components/patterns/pdf-viewer.tsx` | PDF preview + download component |
| `src/components/patterns/pdf-templates/invoice.tsx` | Invoice/receipt PDF template |
| `src/lib/pdf.ts` | Server-side PDF generation helpers |
| `src/app/api/pdf/invoice/route.ts` | API endpoint for generating invoice PDFs |

## Setup

No configuration needed. The skill installs `@react-pdf/renderer`.

IMPORTANT: @react-pdf/renderer is a large dependency (~2MB). It uses its own rendering engine separate from react-dom. PDF templates cannot use standard HTML elements — they use `@react-pdf/renderer` primitives (`Document`, `Page`, `View`, `Text`, `Image`).

## Usage

### Generate an Invoice PDF

```tsx
"use client";

import { PdfViewer } from "@/components/patterns/pdf-viewer";

const invoiceData = {
  invoiceNumber: "INV-001",
  date: "2025-01-15",
  dueDate: "2025-02-15",
  from: { name: "Your Company", address: "123 Main St", email: "billing@example.com" },
  to: { name: "Client Name", address: "456 Oak Ave", email: "client@example.com" },
  items: [
    { description: "Web Development", quantity: 40, unitPrice: 150 },
    { description: "Design", quantity: 10, unitPrice: 120 },
  ],
};

export function InvoicePage() {
  return <PdfViewer template="invoice" data={invoiceData} fileName="invoice-001.pdf" />;
}
```

### Server-Side PDF Generation (API Route)

```bash
# Download an invoice PDF
GET /api/pdf/invoice?id=inv-001
```

### Creating Custom Templates

1. Create a new file in `src/components/patterns/pdf-templates/`
2. Use @react-pdf/renderer components:

```tsx
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 12 },
  title: { fontSize: 24, marginBottom: 20, fontWeight: "bold" },
});

export function ReportDocument({ data }: { data: ReportData }) {
  return (
    <Document>
      <Page style={styles.page}>
        <Text style={styles.title}>{data.title}</Text>
        <Text>{data.content}</Text>
      </Page>
    </Document>
  );
}
```

## Architecture

- PDF templates are React components using @react-pdf/renderer primitives (NOT HTML)
- Client-side: `PdfViewer` renders a preview + download button
- Server-side: API routes generate PDFs and return them as binary responses
- Fonts: Uses @react-pdf/renderer built-in fonts. Custom fonts can be registered via `Font.register()`

## Troubleshooting

**"Text strings must be rendered within a <Text> component"**: @react-pdf/renderer doesn't support raw text outside `<Text>`. Wrap all strings in `<Text>`.

**Styles not working**: @react-pdf/renderer uses its own styling system (similar to React Native). CSS classes and Tailwind don't work. Use `StyleSheet.create()`.

**Slow rendering**: Complex PDFs with many pages are CPU-intensive. Generate server-side for large documents.

**Images not loading**: Use absolute URLs for images in PDFs. Relative paths don't work in the PDF renderer.
