import React, { useCallback, useState } from "react";
import {
  Box,
  Text,
  useToast,
  VStack,
  Progress,
  Button,
  HStack,
  IconButton,
  Flex,
} from "@chakra-ui/react";
import { useDropzone } from "react-dropzone";
import { useAuth } from "../contexts/AuthContext";
import { indexedDBService } from "../services/IndexedDBService";
import axiosInstance from "../config/axios";
import { FaTimes } from "react-icons/fa";

interface FileUploadProps {
  onUploadComplete: () => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onUploadComplete }) => {
  const toast = useToast();
  const { user } = useAuth();
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const uploadFile = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      await axiosInstance.post("/files/upload", formData, {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 0)
          );
          setUploadProgress((prev) => ({
            ...prev,
            [file.name]: progress,
          }));
        },
      });

      return true;
    } catch (error) {
      console.error("Upload failed:", error);
      return false;
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setSelectedFiles((prevFiles) => {
      // Filter out duplicates based on file name
      const newFiles = acceptedFiles.filter(
        (newFile) =>
          !prevFiles.some((prevFile) => prevFile.name === newFile.name)
      );
      return [...prevFiles, ...newFiles];
    });
  }, []);

  // Add this function to remove a file from the selection
  const removeFile = (fileName: string) => {
    setSelectedFiles((prevFiles) =>
      prevFiles.filter((file) => file.name !== fileName)
    );
    setUploadProgress((prev) => {
      const newProgress = { ...prev };
      delete newProgress[fileName];
      return newProgress;
    });
  };

  // Add this function to clear all selected files
  const clearAllFiles = () => {
    setSelectedFiles([]);
    setUploadProgress({});
  };

  const handleUpload = async () => {
    if (!user) return;

    const isOnline = navigator.onLine;
    let successCount = 0;

    for (const file of selectedFiles) {
      try {
        if (isOnline) {
          const success = await uploadFile(file);
          if (success) successCount++;
        } else {
          await indexedDBService.saveFile(file, user.id);
          successCount++;
        }
      } catch (error) {
        console.error("Failed to handle file:", error);
      }
    }

    if (successCount > 0) {
      toast({
        title: isOnline ? "Upload successful" : "Files saved offline",
        description: `${successCount} of ${selectedFiles.length} files processed`,
        status: "success",
        duration: 3000,
      });
      onUploadComplete();
    }

    setSelectedFiles([]);
    setUploadProgress({});
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <VStack spacing={4} width="100%">
      <Box
        {...getRootProps()}
        p={6}
        border="2px dashed"
        borderColor={isDragActive ? "blue.500" : "gray.200"}
        borderRadius="lg"
        textAlign="center"
        cursor="pointer"
        width="100%"
      >
        <input {...getInputProps()} />
        <Text>
          {isDragActive
            ? "Drop the files here..."
            : "Drag and drop files here, or click to select files"}
        </Text>
      </Box>

      {selectedFiles.length > 0 && (
        <VStack width="100%" spacing={2}>
          <Flex justify="space-between" width="100%">
            <Text fontWeight="bold">
              Selected Files ({selectedFiles.length})
            </Text>
            <Button size="sm" colorScheme="red" onClick={clearAllFiles}>
              Clear All
            </Button>
          </Flex>

          {selectedFiles.map((file) => (
            <Box
              key={file.name}
              width="100%"
              p={2}
              borderWidth={1}
              borderRadius="md"
            >
              <HStack justify="space-between">
                <VStack align="start" flex={1}>
                  <Text noOfLines={1}>{file.name}</Text>
                  {uploadProgress[file.name] !== undefined && (
                    <Progress
                      value={uploadProgress[file.name]}
                      size="sm"
                      width="100%"
                      colorScheme="blue"
                    />
                  )}
                </VStack>
                <IconButton
                  aria-label="Remove file"
                  icon={<FaTimes />}
                  size="sm"
                  onClick={() => removeFile(file.name)}
                  colorScheme="red"
                  variant="ghost"
                />
              </HStack>
            </Box>
          ))}

          <Button onClick={handleUpload} colorScheme="blue" width="100%" mt={2}>
            Upload {selectedFiles.length} file(s)
          </Button>
        </VStack>
      )}
    </VStack>
  );
};
