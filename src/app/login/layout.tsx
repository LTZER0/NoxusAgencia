import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login | Painel',
  description: 'Acesse o painel do seu estabelecimento.',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
