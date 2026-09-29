
const videos = "oh";

export const generateMetadata = async (
    { params, searchParams }: Props,
    parent: ResolvingMetadata
  ): Promise<Metadata> => {
    // read route params
    const { id } = await params
   
    // fetch data
    const product = await fetch(`https://.../${id}`).then((res) => res.json())
   
    // optionally access and extend (rather than replace) parent metadata
    const previousImages = (await parent).openGraph?.images || []
   
    return {
      title: product.title,
      openGraph: {
        images: ['/some-specific-page-image.jpg', ...previousImages],
      },
    }
  }
  
   export const metadata = {
    title: 'Matt Scullino',
    description: 'Media | Production | Technology',
    keywords: ['Media', 'Production', 'Technology', 'Matt Scullino', 'sculli.net'],
    authors: [{ name: 'Matt Scullino' }, { name: 'sculli.net', url: 'https://sculli.net' }],
    creator: 'Matt Scullino',
    metadataBase: new URL('https://mattscullino.com'),
    robots: {
      index: true,
      follow: true,
      nocache: false,
    },
    openGraph: {
      title: 'Matt Scullino',
      description: 'Media | Production | Technology',
      url: 'https://mattscullino.com',
      siteName: 'mattscullino.com',
      locale: 'en_AU',
      type: 'website',
        images: [
          {
            url: `https://mattscullino.com/og`, // Must be an absolute URL
            width: 1200,
            height: 630,
          },
        ]
    },
  }