import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  useToast,
  Container,
  Heading,
  Link as ChakraLink,
} from "@chakra-ui/react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      toast({
        title: "Login successful",
        status: "success",
        duration: 3000,
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again",
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="container.sm" py={10}>
      <Box p={8} borderWidth={1} borderRadius="lg" boxShadow="lg" bg="white">
        <VStack spacing={6}>
          <Heading size="lg">Login</Heading>
          <Box as="form" onSubmit={handleSubmit} width="100%">
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
              </FormControl>

              <Button
                type="submit"
                colorScheme="blue"
                width="100%"
                isLoading={isLoading}
                size="lg"
                mt={2}
              >
                Login
              </Button>
            </VStack>
          </Box>
          <Text>
            Don't have an account?{" "}
            <ChakraLink as={Link} to="/register" color="blue.500">
              Register here
            </ChakraLink>
          </Text>
        </VStack>
      </Box>
    </Container>
  );
};
