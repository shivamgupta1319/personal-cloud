import React from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorMode,
  IconButton,
  HStack,
  Show,
  Hide,
} from "@chakra-ui/react";
import { FaMoon, FaSun, FaUser, FaBars } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { colorMode, toggleColorMode } = useColorMode();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Box px={[2, 4]} py={2} bg="blue.500" color="white">
      <Flex
        alignItems="center"
        justifyContent="space-between"
        maxW="container.xl"
        mx="auto"
      >
        <Text fontSize={["lg", "xl"]} fontWeight="bold">
          Personal Cloud
        </Text>

        <HStack spacing={[2, 4]}>
          <IconButton
            aria-label="Toggle color mode"
            icon={colorMode === "light" ? <FaMoon /> : <FaSun />}
            onClick={toggleColorMode}
            variant="ghost"
            color="white"
            _hover={{ bg: "blue.600" }}
            size={["sm", "md"]}
          />

          <Show above="sm">
            <Menu>
              <MenuButton
                as={Button}
                rightIcon={<FaUser />}
                variant="ghost"
                _hover={{ bg: "blue.600" }}
                size={["sm", "md"]}
              >
                {user?.email}
              </MenuButton>
              <MenuList color="black">
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </MenuList>
            </Menu>
          </Show>

          <Hide above="sm">
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<FaBars />}
                variant="ghost"
                _hover={{ bg: "blue.600" }}
                size="sm"
              />
              <MenuList color="black">
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </MenuList>
            </Menu>
          </Hide>
        </HStack>
      </Flex>
    </Box>
  );
};
