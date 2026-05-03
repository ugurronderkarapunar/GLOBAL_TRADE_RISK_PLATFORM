// frontend/app/[locale]/layout.tsx
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';

const locales = ['en', 'tr', 'ar', 'zh'];

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  let messages;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }

  // Arapça için HTML yönünü ayarla
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} className="dark">
      <body className="bg-background text-foreground">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <div className={dir === 'rtl' ? 'font-arabic' : 'font-sans'}>
            {children}
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
