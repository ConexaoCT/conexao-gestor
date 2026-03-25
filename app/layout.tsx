export const metadata = {
  title: 'Gestor Conexão',
  description: 'Sistema interno do CT',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
