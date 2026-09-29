

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
        robots: {
                index: false,
                follow: false,
                noimageindex: true,
                googleBot: {
                    index: false,
                    follow: false,
                    noimageindex: true,
                },
            },
    }
  }