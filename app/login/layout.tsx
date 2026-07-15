export const metadata = {
  title: "Login — Dashboard",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <link href="/css/dashboard.css" rel="stylesheet" />
      {children}
    </>
  );
}
