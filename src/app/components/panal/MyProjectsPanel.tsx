"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Stack,
  TextField,
  Chip,
  CircularProgress,
  Alert,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import EditIcon from "@mui/icons-material/Edit";
import { templateApi, UserTemplate } from "../../../../services/templateApi";

interface MyProjectsPanelProps {
  onSelectProject: (projectData: UserTemplate) => void;
  onClose?: () => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const MyProjectsPanel: React.FC<MyProjectsPanelProps> = ({ onSelectProject, onClose }) => {
  const [projects, setProjects] = useState<UserTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProject, setSelectedProject] = useState<UserTemplate | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch user's projects from backend
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await templateApi.getMyTemplates();
      setProjects(data);
    } catch (err: any) {
      console.error('Error fetching projects:', err);
      setError('Failed to load your projects. Please login first.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (project: UserTemplate) => {
    onSelectProject(project);
    onClose?.();
  };

  // Menu handlers
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, project: UserTemplate) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedProject(project);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    if (selectedProject) {
      onSelectProject(selectedProject);
      onClose?.();
    }
    handleMenuClose();
  };

  const handleDuplicate = async () => {
    if (!selectedProject) return;

    handleMenuClose();
    try {
      await templateApi.duplicateUserTemplate(selectedProject.id);
      fetchProjects(); // Refresh list
    } catch (err) {
      console.error('Error duplicating project:', err);
      alert('Failed to duplicate project');
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProject) return;

    setDeleting(true);
    try {
      await templateApi.deleteUserTemplate(selectedProject.id);
      setProjects(projects.filter((p) => p.id !== selectedProject.id));
      setDeleteDialogOpen(false);
      setSelectedProject(null);
    } catch (err) {
      console.error('Error deleting project:', err);
      alert('Failed to delete project');
    } finally {
      setDeleting(false);
    }
  };

  // Get thumbnail URL - matching TemplatesPanel logic
  const getThumbnailUrl = (thumbnail?: string) => {
    if (!thumbnail) return "/images/default-template.png";
    const t = thumbnail.trim();
    // If backend stored a base64 data URL, use it directly
    if (t.startsWith('data:')) return t;
    if (t.startsWith('http')) return t;
    if (t.startsWith('/')) return `${API_BASE_URL}${t}`;
    return `${API_BASE_URL}/${t}`;
  };

  // Filter projects by search query
  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <>
      <Box
        sx={{
          position: "fixed",
          top: 64,
          left: 80,
          width: 420,
          height: "calc(100vh - 64px)",
          bgcolor: "#fff",
          boxShadow: "0 12px 40px rgba(0,0,0,0.16)",
          borderRadius: "0 16px 16px 0",
          zIndex: 1400,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1.25rem" }}>
            My Projects
          </Typography>
          <IconButton onClick={() => onClose?.()}>
            <CloseIcon fontSize="medium" />
          </IconButton>
        </Box>

        {/* Search Bar */}
        <Box sx={{ px: 2, mb: 1 }}>
          <TextField
            fullWidth
            placeholder="Search your projects..."
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
                backgroundColor: "#f9f9f9",
                "&:hover fieldset": { borderColor: "#d1d5db" },
              },
            }}
          />
        </Box>

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", flex: 1 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Error State */}
        {error && (
          <Box sx={{ px: 2, mb: 2 }}>
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          </Box>
        )}

        {/* Projects List */}
        {!loading && !error && (
          <Box sx={{ flex: 1, overflowY: "auto", px: 2, pb: 2 }}>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              {filteredProjects.map((project) => {
                // Use baseTemplate thumbnail or project's own thumbnail
                const thumbnailUrl = getThumbnailUrl(
                  project.baseTemplate?.thumbnail || (project as any).thumbnail
                );

                return (
                  <Box
                    key={project.id}
                    sx={{
                      width: "calc(50% - 8px)",
                      mb: 2,
                      position: "relative",
                    }}
                  >
                    {/* Menu Button */}
                    <IconButton
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        zIndex: 10,
                        backgroundColor: "rgba(255,255,255,0.9)",
                        "&:hover": { backgroundColor: "white" },
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      }}
                      onClick={(e) => handleMenuOpen(e, project)}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>

                    <Card
                      sx={{
                        borderRadius: "14px",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                        transition: "transform 0.2s, box-shadow 0.2s",
                        "&:hover": { transform: "scale(1.02)", boxShadow: "0 8px 32px rgba(0,0,0,0.16)" },
                        bgcolor: "#f9f6ff"
                      }}
                    >
                      <CardActionArea onClick={() => handleSelect(project)}>
                        <CardMedia
                          component="img"
                          height={170}
                          image={thumbnailUrl}
                          alt={project.name}
                          sx={{
                            objectFit: "cover",
                            borderTopLeftRadius: "14px",
                            borderTopRightRadius: "14px",
                            backgroundColor: "#f5f5f5"
                          }}
                        />
                        <CardContent sx={{ pt: 1, pb: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: 15 }} noWrap>
                            {project.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {new Date(project.updatedAt).toLocaleDateString()}
                          </Typography>
                          {project.baseTemplate && (
                            <Chip
                              label={project.baseTemplate.name}
                              size="small"
                              sx={{ mt: 0.5, height: 20, fontSize: 11 }}
                            />
                          )}
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Box>
                );
              })}

              {/* Empty State */}
              {filteredProjects.length === 0 && (
                <Box sx={{ width: "100%" }}>
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", mt: 4 }}>
                    {searchQuery
                      ? `No projects found for "${searchQuery}"`
                      : "No projects yet. Start by selecting a template!"}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Box>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDuplicate}>
          <ContentCopyIcon fontSize="small" sx={{ mr: 1 }} />
          Duplicate
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: "error.main" }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => !deleting && setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Project?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{selectedProject?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" disabled={deleting}>
            {deleting ? <CircularProgress size={20} /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MyProjectsPanel;