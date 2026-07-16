interface LegalPageProps {
  title: string;
  children: React.ReactNode;
}

export function LegalPage({ title, children }: LegalPageProps) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">{title}</h1>
      <div className="prose prose-zinc mt-6 max-w-none text-sm leading-7 text-zinc-600">
        {children}
      </div>
    </div>
  );
}
