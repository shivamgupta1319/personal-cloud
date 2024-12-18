/* eslint-disable react-hooks/exhaustive-deps */
import {
  Badge,
  Box,
  Button,
  Container,
  Flex,
  HStack,
  Heading,
  IconButton,
  SimpleGrid,
  Text,
  VStack,
  useColorModeValue,
  useToast,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import {
  FaDownload,
  FaEye,
  FaFile,
  FaFileAlt,
  FaImage,
  FaList,
  FaMusic,
  FaTh,
  FaTrash,
  FaVideo,
  FaFilter,
} from "react-icons/fa";
import { FileList } from "../components/FileList";
import { FileUpload } from "../components/FileUpload";
import { Navbar } from "../components/layout/Navbar";
import axiosInstance from "../config/axios";
import { useAuth } from "../contexts/AuthContext";

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

export const Dashboard: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { user } = useAuth();
  const toast = useToast();
  const cardBg = useColorModeValue("white", "gray.700");
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    fetchFiles();
  }, [user]);

  const fetchFiles = async () => {
    try {
      const response = await axiosInstance.get("/files");
      setFiles(response.data);
    } catch (error) {
      toast({
        title: "Error fetching files",
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const categories = [
    { id: "all", label: "All Files", icon: FaFile },
    { id: "document", label: "Documents", icon: FaFileAlt },
    { id: "image", label: "Images", icon: FaImage },
    { id: "video", label: "Videos", icon: FaVideo },
    { id: "audio", label: "Audio", icon: FaMusic },
    { id: "other", label: "Others", icon: FaFile },
  ];

  const getCategoryIcon = (category: string) => {
    const found = categories.find((cat) => cat.id === category);
    return found?.icon || FaFile;
  };

  const handleDelete = async (fileId: string) => {
    try {
      await axiosInstance.delete(`/files/${fileId}`);
      fetchFiles();
      toast({
        title: "File deleted successfully",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error deleting file",
        status: "error",
        duration: 3000,
      });
    }
  };

  const filteredFiles = files.filter((file) =>
    selectedCategory === "all" ? true : file.category === selectedCategory
  );

  const FileCard: React.FC<{ file: File }> = ({ file }) => {
    const Icon = getCategoryIcon(file.category);
    const [isHovered, setIsHovered] = useState(false);
    const isMobile = window.innerWidth < 768;

    return (
      <Box
        p={[2, 3, 4]}
        borderRadius="lg"
        bg={cardBg}
        boxShadow="md"
        transition="all 0.2s"
        _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
        position="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <VStack spacing={2}>
          <Flex
            justify="center"
            align="center"
            h={["80px", "90px", "100px"]}
            w="100%"
            bg="gray.100"
            borderRadius="md"
          >
            <Icon size={isMobile ? "30px" : "40px"} color="gray.500" />
          </Flex>

          <VStack
            align="start"
            spacing={1}
            w="100%"
            minH={["60px", "70px", "80px"]}
          >
            <Box position="relative" width="100%">
              <Text
                fontWeight="bold"
                fontSize={["xs", "sm"]}
                noOfLines={2}
                title={file.originalName}
              >
                {file.originalName}
              </Text>
              {isHovered && !isMobile && file.originalName.length > 40 && (
                <Box
                  position="absolute"
                  top="100%"
                  left="0"
                  zIndex="tooltip"
                  bg="gray.800"
                  color="white"
                  p={2}
                  borderRadius="md"
                  maxW="300px"
                  fontSize="sm"
                  boxShadow="lg"
                >
                  {file.originalName}
                </Box>
              )}
            </Box>

            <Flex
              justify="space-between"
              width="100%"
              align="center"
              flexWrap="wrap"
              gap={1}
            >
              <Badge
                colorScheme={file.syncStatus === "synced" ? "green" : "yellow"}
                fontSize="xs"
              >
                {file.syncStatus}
              </Badge>
              <Text fontSize="xs" color="gray.500">
                {new Date(file.createdAt).toLocaleDateString()}
              </Text>
            </Flex>
          </VStack>

          <HStack spacing={1} justify="center">
            <IconButton
              aria-label="Preview"
              icon={<FaEye />}
              size={["xs", "sm"]}
              colorScheme="blue"
              variant="ghost"
            />
            <IconButton
              aria-label="Download"
              icon={<FaDownload />}
              size={["xs", "sm"]}
              colorScheme="green"
              variant="ghost"
              as="a"
              href={file.path}
              download
            />
            <IconButton
              aria-label="Delete"
              icon={<FaTrash />}
              size={["xs", "sm"]}
              colorScheme="red"
              variant="ghost"
              onClick={() => handleDelete(file.id)}
            />
          </HStack>
        </VStack>
      </Box>
    );
  };

  const CategoryDrawer = () => (
    <Drawer isOpen={isOpen} placement="bottom" onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent borderTopRadius="20px">
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px">Select Category</DrawerHeader>
        <DrawerBody py={4}>
          <VStack spacing={3}>
            {categories.map((category) => (
              <Button
                key={category.id}
                leftIcon={<category.icon />}
                variant={selectedCategory === category.id ? "solid" : "ghost"}
                colorScheme="blue"
                onClick={() => {
                  setSelectedCategory(category.id);
                  onClose();
                }}
                size="lg"
                width="100%"
                justifyContent="flex-start"
                px={4}
              >
                {category.label}
              </Button>
            ))}
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );

  return (
    <>
      <Navbar />
      <Container maxW="container.xl" py={4} px={[2, 4, 6, 8]}>
        <Box mb={6}>
          <Heading size={["lg", "xl"]}>My Files</Heading>
          <Box mt={4}>
            <FileUpload onUploadComplete={fetchFiles} />
          </Box>
        </Box>

        {/* Mobile Category Button */}
        <Box display={["block", "block", "none"]} mb={4}>
          <Button
            onClick={onOpen}
            width="100%"
            leftIcon={<FaFilter />}
            colorScheme="blue"
            variant="outline"
            justifyContent="space-between"
            rightIcon={
              <Badge colorScheme="blue" fontSize="sm">
                {categories.find((cat) => cat.id === selectedCategory)?.label}
              </Badge>
            }
          >
            Filter by Category
          </Button>
        </Box>

        {/* Desktop Category Buttons */}
        <Flex
          direction={["column", "column", "row"]}
          justify="space-between"
          align={["stretch", "stretch", "center"]}
          mb={6}
          gap={4}
        >
          <Box display={["none", "none", "block"]} overflowX="auto">
            <HStack spacing={2} pb={2}>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  leftIcon={<category.icon />}
                  variant={selectedCategory === category.id ? "solid" : "ghost"}
                  colorScheme="blue"
                  onClick={() => setSelectedCategory(category.id)}
                  size={["sm", "md"]}
                  whiteSpace="nowrap"
                >
                  {category.label}
                </Button>
              ))}
            </HStack>
          </Box>

          <HStack justify={["center", "center", "flex-end"]}>
            <IconButton
              aria-label="List view"
              icon={<FaList />}
              variant={viewMode === "list" ? "solid" : "ghost"}
              onClick={() => setViewMode("list")}
            />
            <IconButton
              aria-label="Grid view"
              icon={<FaTh />}
              variant={viewMode === "grid" ? "solid" : "ghost"}
              onClick={() => setViewMode("grid")}
            />
          </HStack>
        </Flex>

        {viewMode === "list" ? (
          <FileList
            files={filteredFiles}
            isLoading={isLoading}
            onDelete={fetchFiles}
          />
        ) : (
          <SimpleGrid
            columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
            spacing={[2, 4, 6]}
          >
            {filteredFiles.map((file) => (
              <FileCard key={file.id} file={file} />
            ))}
          </SimpleGrid>
        )}
      </Container>

      {/* Mobile Category Drawer */}
      <CategoryDrawer />
    </>
  );
};
