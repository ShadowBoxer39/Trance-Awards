import Head from 'next/head';

interface SEOProps {
  title: string; 
  description: string;
  url?: string;
  image?: string;
  type?: string;
}

export default function SEO({ title, description, url, image, type = "website" }: SEOProps) {
  const siteName = "יוצאים לטראק";
  const fullTitle = `${title} | ${siteName}`;
  const defaultImage = "https://tracktrip.co.il/images/logo.png";
  const defaultUrl = "https://tracktrip.co.il";

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url || defaultUrl} />
      <meta property="og:image" content={image || defaultImage} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image || defaultImage} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url || defaultUrl} />
      
      {/* Language */}
      <meta property="og:locale" content="he_IL" />
      <meta httpEquiv="content-language" content="he" />
    </Head>
  );
}
