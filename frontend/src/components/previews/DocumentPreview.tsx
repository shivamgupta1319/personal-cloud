import React from "react";
import { Box, Link, Icon, Text } from "@chakra-ui/react";
import { FaFileAlt, FaDownload } from "react-icons/fa";

interface DocumentPreviewProps {
  url: string;
  filename: string;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  url,
  filename,
}) => (
  <Box p={4} borderWidth={1} borderRadius="md">
    <Box display="flex" alignItems="center" mb={3}>
      <Icon as={FaFileAlt} mr={2} />
      <Text fontWeight="medium">{filename}</Text>
    </Box>
    <Link href={url} download isExternal>
      <Box display="flex" alignItems="center" color="blue.500">
        <Icon as={FaDownload} mr={2} />
        <Text>Download</Text>
      </Box>
    </Link>
  </Box>
);
