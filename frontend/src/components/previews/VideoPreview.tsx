import React from "react";
import { Box } from "@chakra-ui/react";

interface VideoPreviewProps {
  url: string;
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({ url }) => (
  <Box maxW="100%" borderRadius="md" overflow="hidden">
    <video controls style={{ width: "100%", maxHeight: "500px" }}>
      <source src={url} />
      Your browser does not support the video tag.
    </video>
  </Box>
);
