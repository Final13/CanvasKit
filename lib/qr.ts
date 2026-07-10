import QRCode from "qrcode";

export async function generateQR(text: string): Promise<string> {
  if (!text.trim()) throw new Error("Введите текст или ссылку");
  return QRCode.toDataURL(text.trim(), {
    width: 400,
    margin: 2,
    color: { dark: "#000000", light: "#ffffff" },
  });
}
