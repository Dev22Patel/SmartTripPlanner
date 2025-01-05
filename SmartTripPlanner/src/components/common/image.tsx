interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    fallback?: string;
  }

  export const Image = ({ alt, src, className, fallback = '/placeholder.svg', ...props }: ImageProps) => {
    const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      const img = e.currentTarget;
      if (img.src !== fallback) {
        img.src = fallback;
      }
    };

    return (
      <img
        src={src}
        alt={alt}
        className={className}
        onError={handleError}
        loading="lazy"
        {...props}
      />
    );
  };
