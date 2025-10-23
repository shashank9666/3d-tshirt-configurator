import Navbar from "./components/Navbar";
import "./globals.css";

export const metadata = {
  title: "3D Tshirt Configurator",
  description: "Created with NextJS, R3F, drei , leva , gsap and Tailwindcss",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
