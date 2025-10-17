

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../hooks/context/AuthContext";
import api from "../../lib/utils/axios";
import { styled } from "@mui/material/styles";
import {
  AppBar,
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Paper,
  CircularProgress,
} from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

// Gradient header
const CanvaHeader = styled(AppBar)(({ theme }) => ({
  background: "linear-gradient(135deg, #00c4cc 0%, #7b68ee 100%)",
  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  zIndex: theme.zIndex.drawer + 1,
  padding: theme.spacing(3),
  textAlign: "center",
}));

export default function RegisterPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/canvas-editor");
    }
  }, [isAuthenticated, router]);

  // Simple email regex
  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleRegister = async () => {
    let validationErrors: { name?: string; email?: string; password?: string } = {};

    if (!name.trim()) validationErrors.name = "Name is required";
    if (!email.trim()) validationErrors.email = "Email is required";
    else if (!validateEmail(email)) validationErrors.email = "Invalid email address";
    if (!password) validationErrors.password = "Password is required";
    else if (password.length < 6) validationErrors.password = "Password must be at least 6 characters";

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);

    try {
      const response = await api.post("/auth/register", { name, email, password });
      
      console.log('Register response:', response.data);

      // Extract token and user data
      const { accessToken, access_token, user } = response.data;
      const token = accessToken || access_token;

      if (token && user) {
        // Auto-login after successful registration
        localStorage.setItem('token', token);

        const userData = {
          id: user.id || user.userId,
          email: user.email,
          name: user.name,
          role: user.role as 'ADMIN' | 'USER',
        };

        login(token, userData);

        toast.success("Registration successful! Redirecting...");

        setTimeout(() => {
          router.push("/canvas-editor");
        }, 1000);
      } else {
        // If no token returned, redirect to login
        toast.success("Registered successfully! Redirecting to login...");

        setName("");
        setEmail("");
        setPassword("");

        setTimeout(() => {
          router.push("/auth/login");
        }, 1500);
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      toast.error(err.response?.data?.message || "Registration failed");
      setLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRegister();
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #e0f7fa 0%, #f4f6fc 100%)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CanvaHeader>
        <Typography variant="h4" sx={{ color: "#fff", fontWeight: 700 }}>
          Create Account
        </Typography>
        <Typography variant="subtitle1" sx={{ color: "#e0f7fa", mt: 1 }}>
          Register to access your dashboard
        </Typography>
      </CanvaHeader>

      <Container
        maxWidth="sm"
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: 8,
        }}
      >
        <Paper
          elevation={6}
          sx={{
            width: "100%",
            p: 6,
            borderRadius: 4,
            display: "flex",
            flexDirection: "column",
            gap: 3,
            background: "#ffffffcc",
            backdropFilter: "blur(8px)",
          }}
        >
          <TextField
            label="Name"
            variant="outlined"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyPress={handleKeyPress}
            error={!!errors.name}
            helperText={errors.name}
            disabled={loading}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
          />
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={handleKeyPress}
            error={!!errors.email}
            helperText={errors.email}
            disabled={loading}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
          />
          <TextField
            label="Password"
            variant="outlined"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            error={!!errors.password}
            helperText={errors.password}
            disabled={loading}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
          />

          <Button
            variant="contained"
            disabled={loading}
            sx={{
              background: "linear-gradient(135deg, #00c4cc 0%, #7b68ee 100%)",
              color: "#fff",
              fontWeight: 700,
              py: 1.8,
              fontSize: "1rem",
              borderRadius: 3,
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              "&:hover": {
                background: "linear-gradient(135deg, #00a7aa 0%, #684ecc 100%)",
                boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
              },
              "&:disabled": {
                background: "rgba(0, 0, 0, 0.12)",
              },
            }}
            onClick={handleRegister}
          >
            {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Register"}
          </Button>

          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Typography variant="body2" color="textSecondary">
              Already have an account?{" "}
              <Button
                variant="text"
                onClick={() => router.push("/auth/login")}
                disabled={loading}
                sx={{ 
                  textTransform: "none", 
                  fontWeight: 600,
                  color: "#00c4cc",
                }}
              >
                Login here
              </Button>
            </Typography>
          </Box>
        </Paper>
      </Container>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </Box>
  );
}