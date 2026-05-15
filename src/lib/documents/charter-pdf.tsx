import { Document, Font, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import React from "react";

Font.register({
  family: "BeVietnamPro",
  fonts: [
    { src: "https://cdn.jsdelivr.net/fontsource/fonts/be-vietnam-pro@latest/latin-400-normal.ttf" },
    {
      src: "https://cdn.jsdelivr.net/fontsource/fonts/be-vietnam-pro@latest/latin-700-normal.ttf",
      fontWeight: 700,
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "BeVietnamPro",
    fontSize: 11,
    paddingTop: 56,
    paddingBottom: 56,
    paddingLeft: 64,
    paddingRight: 64,
    lineHeight: 1.5,
  },
  centerHeader: { textAlign: "center", marginBottom: 16 },
  republic: { fontWeight: 700, fontSize: 12 },
  motto: { fontWeight: 700, fontSize: 11, marginTop: 2 },
  title: { fontWeight: 700, fontSize: 16, textAlign: "center", marginTop: 24, marginBottom: 24 },
  preamble: { marginBottom: 16, textAlign: "justify" },
  chapter: { fontWeight: 700, fontSize: 12, textAlign: "center", marginTop: 16, marginBottom: 10 },
  article: { marginBottom: 8 },
  articleTitle: { fontWeight: 700, marginBottom: 2 },
  signatureBlock: { marginTop: 32 },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 64,
    right: 64,
    fontSize: 8,
    color: "#666",
    textAlign: "center",
  },
});

export interface CharterPdfProps {
  charter: {
    title: string;
    preamble: string;
    chapters: Array<{
      title: string;
      articles: Array<{ number: number; title: string; content: string }>;
    }>;
    signature_block: string;
    legal_references: string[];
  };
  promptVersion: string;
  generatedAt: Date;
}

export function CharterPdf({ charter, promptVersion, generatedAt }: CharterPdfProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.centerHeader}>
          <Text style={styles.republic}>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</Text>
          <Text style={styles.motto}>Độc lập - Tự do - Hạnh phúc</Text>
          <Text>------------</Text>
        </View>

        <Text style={styles.title}>{charter.title}</Text>

        <Text style={styles.preamble}>{charter.preamble}</Text>

        {charter.chapters.map((ch, ci) => (
          <View key={ci}>
            <Text style={styles.chapter}>{ch.title}</Text>
            {ch.articles.map((a) => (
              <View key={a.number} style={styles.article}>
                <Text style={styles.articleTitle}>
                  Điều {a.number}. {a.title}
                </Text>
                <Text>{a.content}</Text>
              </View>
            ))}
          </View>
        ))}

        <Text style={styles.signatureBlock}>{charter.signature_block}</Text>

        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `Trang ${pageNumber}/${totalPages} · Khởi Doanh AI · ${promptVersion} · ${generatedAt.toISOString().slice(0, 10)}`
          }
          fixed
        />
      </Page>
    </Document>
  );
}
