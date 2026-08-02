import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cadastro | Painel',
  description: 'Crie sua conta e comece a vender.',
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
