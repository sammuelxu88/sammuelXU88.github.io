import "./globals.css";
import PublicMediaGuard from "./public-media-guard";

export const metadata = {
  title: "Phantom Studios — Technology Creative Agency",
  description: "A high fidelity local recreation of Phantom's immersive technology creative portfolio experience."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <PublicMediaGuard />
        {children}
      </body>
    </html>
  );
}
