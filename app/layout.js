import "./globals.css";

export const metadata = {
  title: "Legacy Compliance Dashboard",
  description: "Trucking compliance tracker — Legacy Business Services LLC",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
