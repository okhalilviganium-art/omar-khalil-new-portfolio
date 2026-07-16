import React from "react";

export default function ImageWithFallback({
  src,
  alt,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      src={src}
      alt={alt}
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).src = "/images/placeholder.jpg";
      }}
      {...props}
    />
  );
}