import React from "react";
import { Image, Box } from "@chakra-ui/react";

interface ImagePreviewProps {
  url: string;
  alt: string;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({ url, alt }) => (
  <Box maxW="100%" overflow="hidden" borderRadius="md">
    <Image src={url} alt={alt} objectFit="contain" maxH="500px" />
  </Box>
);
