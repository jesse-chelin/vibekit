"use client";

import dynamic from "next/dynamic";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  { ssr: false }
);

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 11 },
  header: { fontSize: 20, marginBottom: 20, fontWeight: "bold" },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  label: { color: "#666" },
  divider: { borderBottomWidth: 1, borderBottomColor: "#e5e7eb", marginVertical: 12 },
  total: { fontSize: 14, fontWeight: "bold", textAlign: "right", marginTop: 12 },
});

interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
}

interface InvoiceProps {
  invoiceNumber: string;
  date: string;
  items: InvoiceItem[];
  customerName: string;
}

export function InvoiceDocument({ invoiceNumber, date, items, customerName }: InvoiceProps) {
  const total = items.reduce((sum, item) => sum + item.quantity * item.price, 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Invoice #{invoiceNumber}</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Date: {date}</Text>
          <Text style={styles.label}>Bill to: {customerName}</Text>
        </View>
        <View style={styles.divider} />
        {items.map((item, i) => (
          <View key={i} style={styles.row}>
            <Text>{item.description}</Text>
            <Text>{item.quantity} x ${item.price.toFixed(2)}</Text>
          </View>
        ))}
        <View style={styles.divider} />
        <Text style={styles.total}>Total: ${total.toFixed(2)}</Text>
      </Page>
    </Document>
  );
}

export function PdfViewer({ children }: { children: React.ReactNode }) {
  return (
    <PDFViewer width="100%" height="600px" className="rounded-lg border">
      {children}
    </PDFViewer>
  );
}
