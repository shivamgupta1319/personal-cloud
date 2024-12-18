import React, { useState } from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  useDisclosure,
  Text,
  Spinner,
  VStack,
  HStack,
  Badge,
  useColorModeValue,
  Card,
  CardBody,
} from "@chakra-ui/react";
import { FaEye, FaTrash, FaDownload } from "react-icons/fa";
import { ImagePreview } from "./previews/ImagePreview";
import { VideoPreview } from "./previews/VideoPreview";
import { DocumentPreview } from "./previews/DocumentPreview";
import { OfficePreview } from "./previews/OfficePreview";
import axiosInstance from "../config/axios";

interface File {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  path: string;
  category: string;
  syncStatus: string;
  createdAt: string;
}

interface FileListProps {
  files: File[];
  isLoading: boolean;
  onDelete: () => void;
}

export const FileList: React.FC<FileListProps> = ({
  files,
  isLoading,
  onDelete,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const cardBg = useColorModeValue("white", "gray.700");

  const handlePreview = (file: File) => {
    setSelectedFile(file);
    onOpen();
  };

  const handleDelete = async (fileId: string) => {
    try {
      await axiosInstance.delete(`/files/${fileId}`);
      onDelete();
    } catch (error) {
      console.error("Failed to delete file:", error);
    }
  };

  const renderPreview = (file: File) => {
    if (
      file.mimeType.includes("pdf") ||
      file.mimeType.includes("powerpoint") ||
      file.mimeType.includes("msword") ||
      file.mimeType.includes("officedocument")
    ) {
      return <OfficePreview url={file.path} filename={file.originalName} />;
    }

    if (file.mimeType.startsWith("image/")) {
      return <ImagePreview url={file.path} alt={file.originalName} />;
    }

    if (file.mimeType.startsWith("video/")) {
      return <VideoPreview url={file.path} />;
    }

    return <DocumentPreview url={file.path} filename={file.originalName} />;
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={8}>
        <Spinner />
      </Box>
    );
  }

  if (files.length === 0) {
    return (
      <Box textAlign="center" p={8}>
        <Text>No files found</Text>
      </Box>
    );
  }

  // Mobile List View
  const MobileListView = () => (
    <VStack spacing={3} width="100%">
      {files.map((file) => (
        <Card key={file.id} width="100%" bg={cardBg}>
          <CardBody>
            <VStack align="stretch" spacing={2}>
              <Text fontWeight="bold" noOfLines={1}>
                {file.originalName}
              </Text>
              <HStack justify="space-between">
                <Badge
                  colorScheme={
                    file.syncStatus === "synced" ? "green" : "yellow"
                  }
                >
                  {file.syncStatus}
                </Badge>
                <Text fontSize="sm" color="gray.500">
                  {new Date(file.createdAt).toLocaleDateString()}
                </Text>
              </HStack>
              <HStack justify="center" spacing={2}>
                <IconButton
                  aria-label="Preview file"
                  icon={<FaEye />}
                  size="sm"
                  onClick={() => handlePreview(file)}
                />
                <IconButton
                  aria-label="Download file"
                  icon={<FaDownload />}
                  size="sm"
                  as="a"
                  href={file.path}
                  download
                />
                <IconButton
                  aria-label="Delete file"
                  icon={<FaTrash />}
                  colorScheme="red"
                  size="sm"
                  onClick={() => handleDelete(file.id)}
                />
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      ))}
    </VStack>
  );

  // Desktop List View
  const DesktopListView = () => (
    <Box overflowX="auto">
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Type</Th>
            <Th>Status</Th>
            <Th>Date</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {files.map((file) => (
            <Tr key={file.id}>
              <Td maxW="200px">
                <Text noOfLines={1}>{file.originalName}</Text>
              </Td>
              <Td>{file.category}</Td>
              <Td>
                <Badge
                  colorScheme={
                    file.syncStatus === "synced" ? "green" : "yellow"
                  }
                >
                  {file.syncStatus}
                </Badge>
              </Td>
              <Td>{new Date(file.createdAt).toLocaleDateString()}</Td>
              <Td>
                <HStack spacing={2}>
                  <IconButton
                    aria-label="Preview file"
                    icon={<FaEye />}
                    size="sm"
                    onClick={() => handlePreview(file)}
                  />
                  <IconButton
                    aria-label="Download file"
                    icon={<FaDownload />}
                    size="sm"
                    as="a"
                    href={file.path}
                    download
                  />
                  <IconButton
                    aria-label="Delete file"
                    icon={<FaTrash />}
                    colorScheme="red"
                    size="sm"
                    onClick={() => handleDelete(file.id)}
                  />
                </HStack>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );

  return (
    <>
      {/* Show different views based on screen size */}
      <Box display={{ base: "block", md: "none" }}>
        <MobileListView />
      </Box>
      <Box display={{ base: "none", md: "block" }}>
        <DesktopListView />
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalBody p={6}>
            {selectedFile && renderPreview(selectedFile)}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
