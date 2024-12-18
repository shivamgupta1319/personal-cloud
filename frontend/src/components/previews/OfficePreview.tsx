import React from "react";
import { Box, Link, Icon, Text, AspectRatio } from "@chakra-ui/react";
import { FaFileAlt, FaDownload } from "react-icons/fa";

interface OfficePreviewProps {
  url: string;
  filename: string;
}

export const OfficePreview: React.FC<OfficePreviewProps> = ({
  url,
  filename,
}) => {
  // Google Docs Viewer URL
  const previewUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(
    url
  )}&embedded=true`;

  return (
    <Box p={4} borderWidth={1} borderRadius="md">
      <Box display="flex" alignItems="center" mb={3}>
        <Icon as={FaFileAlt} mr={2} />
        <Text fontWeight="medium">{filename}</Text>
      </Box>

      <AspectRatio ratio={16 / 9} maxH="600px" mb={4}>
        <iframe
          src={previewUrl}
          title={filename}
          width="100%"
          height="100%"
          style={{ border: "none" }}
        />
      </AspectRatio>

      <Link href={url} download isExternal>
        <Box display="flex" alignItems="center" color="blue.500">
          <Icon as={FaDownload} mr={2} />
          <Text>Download</Text>
        </Box>
      </Link>
    </Box>
  );
};
