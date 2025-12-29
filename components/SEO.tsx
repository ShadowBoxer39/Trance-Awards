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
  const finalUrl = url || defaultUrl;
  const finalImage = image || defaultImage;

  // JSON-LD Structured Data for Organization (shows logo in Google)
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "יוצאים לטראק",
    "alternateName": "Track Trip",
    "url": "https://tracktrip.co.il",
    "logo": "https://tracktrip.co.il/images/logo.png",
    "sameAs": [
      "https://www.instagram.com/track_trip.trance/",
      "https://www.facebook.com/tracktripil",
      "https://www.youtube.com/@tracktripil",
      "https://open.spotify.com/show/0LGP2n3IGqeFVv1fIZOkeZ"
    ],
    "description": "תכנית הטראנס הגדולה בישראל. עושים כבוד לאגדות, נותנים במה לצעירים."
  };

  // JSON-LD for Website (helps with site search)
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "יוצאים לטראק",
    "alternateName": "Track Trip",
    "url": "https://tracktrip.co.il"
  };

  return (
    <Head>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      
      {/* Favicon */}
      <link rel="icon" href="/images/logo.png" />
      <link rel="apple-touch-icon" href="/images/logo.png" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={finalUrl} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={finalImage} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={finalUrl} />
      
      {/* Language */}
      <meta property="og:locale" content="he_IL" />
      <meta httpEquiv="content-language" content="he" />
      
      {/* Robots */}
      <meta name="robots" content="index, follow" />
      
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    </Head>
  );
}
