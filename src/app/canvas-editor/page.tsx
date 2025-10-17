// // app/canvas-editor/page.tsx
// "use client";

// import React from "react";
// import CanvasEditor from "../components/CanvasEditor";

// export default function CanvasEditorPage() {
//   return <CanvasEditor />;
// }


"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, CircularProgress, Typography } from "@mui/material";
import CanvasEditor from "../components/CanvasEditor";
import { useAuth } from "../../hooks/context/AuthContext";

export default function CanvasEditorPage() {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  // Show loading state
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <CircularProgress size={50} />
        <Typography variant="body1" color="textSecondary">
          Loading...
        </Typography>
      </Box>
    );
  }

  // Show nothing while redirecting
  if (!isAuthenticated) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <Typography variant="body1" color="textSecondary">
          Redirecting to login...
        </Typography>
      </Box>
    );
  }

  // Render Canvas Editor with user data
  return <CanvasEditor />;
}