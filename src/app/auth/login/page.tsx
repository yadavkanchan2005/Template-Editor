
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

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Validation state
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/canvas-editor");
    }
  }, [isAuthenticated, router]);

  // Simple email regex
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleLogin = async () => {
    let validationErrors: { email?: string; password?: string } = {};

    if (!email) {
      validationErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      validationErrors.email = "Invalid email address";
    }

    if (!password) {
      validationErrors.password = "Password is required";
    }

    setErrors(validationErrors);

    // Stop if there are errors
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });
      
      // Extract token and user data
      const { accessToken, access_token, user } = res.data;
      const token = accessToken || access_token; // Handle both response formats
      
      if (!token) {
        throw new Error("No token received from server");
      }

      // Store token in localStorage for axios interceptor
      localStorage.setItem('token', token);
      
      console.log('Login response:', res.data);
      console.log('Token saved:', token);

      // Map user data to expected format
      const userData = {
        id: user.id || user.userId,
        email: user.email,
        name: user.name,
        role: user.role as 'ADMIN' | 'USER',
      };

      // Login via AuthContext (this will also set token in templateApi)
      login(token, userData);

      toast.success("Login successful!");
      
      // Redirect to canvas editor
      setTimeout(() => {
        router.push("/canvas-editor");
      }, 500);
      
    } catch (err: any) {
      console.error('Login error:', err);
      toast.error(err.response?.data?.message || "Login failed");
      setLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
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
          Welcome Back
        </Typography>
        <Typography variant="subtitle1" sx={{ color: "#e0f7fa", mt: 1 }}>
          Login to your account
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
            onClick={handleLogin}
          >
            {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Login"}
          </Button>

          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Typography variant="body2" color="textSecondary">
              Don't have an account?{" "}
              <Button
                variant="text"
                onClick={() => router.push("/auth/register")}
                disabled={loading}
                sx={{ 
                  textTransform: "none", 
                  fontWeight: 600,
                  color: "#00c4cc",
                }}
              >
                Register here
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
