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

export const RegisterForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        status: "error",
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);

    try {
      await register(email, password);
      toast({
        title: "Registration successful",
        description: "You can now login with your credentials",
        status: "success",
        duration: 3000,
      });
      navigate("/login");
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "Please try again with different credentials",
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
          <Heading size="lg">Register</Heading>
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

              <FormControl isRequired>
                <FormLabel>Confirm Password</FormLabel>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
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
                Register
              </Button>
            </VStack>
          </Box>
          <Text>
            Already have an account?{" "}
            <ChakraLink as={Link} to="/login" color="blue.500">
              Login here
            </ChakraLink>
          </Text>
        </VStack>
      </Box>
    </Container>
  );
};
