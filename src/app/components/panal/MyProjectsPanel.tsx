// "use client";

// import React, { useState, useEffect } from "react";
// import {
//   Box,
//   Typography,
//   IconButton,
//   Card,
//   CardActionArea,
//   CardMedia,
//   CardContent,
//   Stack,
//   TextField,
//   Chip,
//   CircularProgress,
//   Alert,
//   Menu,
//   MenuItem,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogContentText,
//   DialogActions,
//   Button,
// } from "@mui/material";
// import CloseIcon from "@mui/icons-material/Close";
// import MoreVertIcon from "@mui/icons-material/MoreVert";
// import DeleteIcon from "@mui/icons-material/Delete";
// import ContentCopyIcon from "@mui/icons-material/ContentCopy";
// import EditIcon from "@mui/icons-material/Edit";
// import { templateApi, UserTemplate } from "../../../../services/templateApi";

// interface MyProjectsPanelProps {
//   onSelectProject: (projectData: UserTemplate) => void;
//   onClose?: () => void;
// }

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// const MyProjectsPanel: React.FC<MyProjectsPanelProps> = ({ onSelectProject, onClose }) => {
//   const [projects, setProjects] = useState<UserTemplate[]>([]);
//   const [searchQuery, setSearchQuery] = useState<string>("");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
//   const [selectedProject, setSelectedProject] = useState<UserTemplate | null>(null);
//   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
//   const [deleting, setDeleting] = useState(false);

//   // Fetch user's projects from backend
//   useEffect(() => {
//     fetchProjects();
//   }, []);

//   const fetchProjects = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const data = await templateApi.getMyTemplates();
//       setProjects(data);
//     } catch (err: any) {
//       console.error('Error fetching projects:', err);
//       setError('Failed to load your projects. Please login first.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSelect = (project: UserTemplate) => {
//     onSelectProject(project);
//     onClose?.();
//   };

//   // Menu handlers
//   const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, project: UserTemplate) => {
//     event.stopPropagation();
//     setAnchorEl(event.currentTarget);
//     setSelectedProject(project);
//   };

//   const handleMenuClose = () => {
//     setAnchorEl(null);
//   };

//   const handleEdit = () => {
//     if (selectedProject) {
//       onSelectProject(selectedProject);
//       onClose?.();
//     }
//     handleMenuClose();
//   };

//   const handleDuplicate = async () => {
//     if (!selectedProject) return;

//     handleMenuClose();
//     try {
//       await templateApi.duplicateUserTemplate(selectedProject.id);
//       fetchProjects(); // Refresh list
//     } catch (err) {
//       console.error('Error duplicating project:', err);
//       alert('Failed to duplicate project');
//     }
//   };

//   const handleDeleteClick = () => {
//     setDeleteDialogOpen(true);
//     handleMenuClose();
//   };

//   const handleDeleteConfirm = async () => {
//     if (!selectedProject) return;

//     setDeleting(true);
//     try {
//       await templateApi.deleteUserTemplate(selectedProject.id);
//       setProjects(projects.filter((p) => p.id !== selectedProject.id));
//       setDeleteDialogOpen(false);
//       setSelectedProject(null);
//     } catch (err) {
//       console.error('Error deleting project:', err);
//       alert('Failed to delete project');
//     } finally {
//       setDeleting(false);
//     }
//   };

//   // Get thumbnail URL - matching TemplatesPanel logic
//   const getThumbnailUrl = (thumbnail?: string) => {
//     if (!thumbnail) return "/images/default-template.png";
//     const t = thumbnail.trim();
//     // If backend stored a base64 data URL, use it directly
//     if (t.startsWith('data:')) return t;
//     if (t.startsWith('http')) return t;
//     if (t.startsWith('/')) return `${API_BASE_URL}${t}`;
//     return `${API_BASE_URL}/${t}`;
//   };

//   // Filter projects by search query
//   const filteredProjects = projects.filter((project) => {
//     const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase());
//     return matchesSearch;
//   });

//   return (
//     <>
//       <Box
//         sx={{
//           position: "fixed",
//           top: 64,
//           left: 80,
//           width: 420,
//           height: "calc(100vh - 64px)",
//           bgcolor: "#fff",
//           boxShadow: "0 12px 40px rgba(0,0,0,0.16)",
//           borderRadius: "0 16px 16px 0",
//           zIndex: 1400,
//           display: "flex",
//           flexDirection: "column",
//           overflow: "hidden",
//           fontFamily: "Inter, sans-serif",
//         }}
//       >
//         {/* Header */}
//         <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 2 }}>
//           <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1.25rem" }}>
//             My Projects
//           </Typography>
//           <IconButton onClick={() => onClose?.()}>
//             <CloseIcon fontSize="medium" />
//           </IconButton>
//         </Box>

//         {/* Search Bar */}
//         <Box sx={{ px: 2, mb: 1 }}>
//           <TextField
//             fullWidth
//             placeholder="Search your projects..."
//             size="small"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             sx={{
//               "& .MuiOutlinedInput-root": {
//                 borderRadius: "12px",
//                 backgroundColor: "#f9f9f9",
//                 "&:hover fieldset": { borderColor: "#d1d5db" },
//               },
//             }}
//           />
//         </Box>

//         {/* Loading State */}
//         {loading && (
//           <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", flex: 1 }}>
//             <CircularProgress />
//           </Box>
//         )}

//         {/* Error State */}
//         {error && (
//           <Box sx={{ px: 2, mb: 2 }}>
//             <Alert severity="error" onClose={() => setError(null)}>
//               {error}
//             </Alert>
//           </Box>
//         )}

//         {/* Projects List */}
//         {!loading && !error && (
//           <Box sx={{ flex: 1, overflowY: "auto", px: 2, pb: 2 }}>
//             <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
//               {filteredProjects.map((project) => {
//                 // Use baseTemplate thumbnail or project's own thumbnail
//                 const thumbnailUrl = getThumbnailUrl(
//                   project.baseTemplate?.thumbnail || (project as any).thumbnail
//                 );

//                 return (
//                   <Box
//                     key={project.id}
//                     sx={{
//                       width: "calc(50% - 8px)",
//                       mb: 2,
//                       position: "relative",
//                     }}
//                   >
//                     {/* Menu Button */}
//                     <IconButton
//                       sx={{
//                         position: "absolute",
//                         top: 8,
//                         right: 8,
//                         zIndex: 10,
//                         backgroundColor: "rgba(255,255,255,0.9)",
//                         "&:hover": { backgroundColor: "white" },
//                         boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
//                       }}
//                       onClick={(e) => handleMenuOpen(e, project)}
//                     >
//                       <MoreVertIcon fontSize="small" />
//                     </IconButton>

//                     <Card
//                       sx={{
//                         borderRadius: "14px",
//                         boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
//                         transition: "transform 0.2s, box-shadow 0.2s",
//                         "&:hover": { transform: "scale(1.02)", boxShadow: "0 8px 32px rgba(0,0,0,0.16)" },
//                         bgcolor: "#f9f6ff"
//                       }}
//                     >
//                       <CardActionArea onClick={() => handleSelect(project)}>
//                         <CardMedia
//                           component="img"
//                           height={170}
//                           image={thumbnailUrl}
//                           alt={project.name}
//                           sx={{
//                             objectFit: "cover",
//                             borderTopLeftRadius: "14px",
//                             borderTopRightRadius: "14px",
//                             backgroundColor: "#f5f5f5"
//                           }}
//                         />
//                         <CardContent sx={{ pt: 1, pb: 1 }}>
//                           <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: 15 }} noWrap>
//                             {project.name}
//                           </Typography>
//                           <Typography variant="caption" color="text.secondary" display="block">
//                             {new Date(project.updatedAt).toLocaleDateString()}
//                           </Typography>
//                           {project.baseTemplate && (
//                             <Chip
//                               label={project.baseTemplate.name}
//                               size="small"
//                               sx={{ mt: 0.5, height: 20, fontSize: 11 }}
//                             />
//                           )}
//                         </CardContent>
//                       </CardActionArea>
//                     </Card>
//                   </Box>
//                 );
//               })}

//               {/* Empty State */}
//               {filteredProjects.length === 0 && (
//                 <Box sx={{ width: "100%" }}>
//                   <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", mt: 4 }}>
//                     {searchQuery
//                       ? `No projects found for "${searchQuery}"`
//                       : "No projects yet. Start by selecting a template!"}
//                   </Typography>
//                 </Box>
//               )}
//             </Box>
//           </Box>
//         )}
//       </Box>

//       {/* Context Menu */}
//       <Menu
//         anchorEl={anchorEl}
//         open={Boolean(anchorEl)}
//         onClose={handleMenuClose}
//         transformOrigin={{ horizontal: "right", vertical: "top" }}
//         anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
//       >
//         <MenuItem onClick={handleEdit}>
//           <EditIcon fontSize="small" sx={{ mr: 1 }} />
//           Edit
//         </MenuItem>
//         <MenuItem onClick={handleDuplicate}>
//           <ContentCopyIcon fontSize="small" sx={{ mr: 1 }} />
//           Duplicate
//         </MenuItem>
//         <MenuItem onClick={handleDeleteClick} sx={{ color: "error.main" }}>
//           <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
//           Delete
//         </MenuItem>
//       </Menu>

//       {/* Delete Confirmation Dialog */}
//       <Dialog open={deleteDialogOpen} onClose={() => !deleting && setDeleteDialogOpen(false)}>
//         <DialogTitle>Delete Project?</DialogTitle>
//         <DialogContent>
//           <DialogContentText>
//             Are you sure you want to delete "{selectedProject?.name}"? This action cannot be undone.
//           </DialogContentText>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
//             Cancel
//           </Button>
//           <Button onClick={handleDeleteConfirm} color="error" disabled={deleting}>
//             {deleting ? <CircularProgress size={20} /> : "Delete"}
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </>
//   );
// };

// export default MyProjectsPanel;




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

interface PageItem {
  id: string;
  name: string;
  fabricJSON: any;
  thumbnail?: string | null;
  locked?: boolean;
}

interface ExtendedUserTemplate extends UserTemplate {
  pages?: PageItem[];
  createdBy?: string | null; 
}

interface MyProjectsPanelProps {
  onSelectProject: (projectData: ExtendedUserTemplate) => void;
  onClose?: () => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const MyProjectsPanel: React.FC<MyProjectsPanelProps> = ({ onSelectProject, onClose }) => {
  const [projects, setProjects] = useState<ExtendedUserTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProject, setSelectedProject] = useState<ExtendedUserTemplate | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loadingProjectId, setLoadingProjectId] = useState<string | null>(null);

  // Fetch projects and normalize pages
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await templateApi.getMyTemplates();

      const normalized = data.map((proj: any) => ({
        ...proj,
        pages: (proj.pages || []).map((pg: any, index: number) => ({
          id: pg.id || `page-${index}`,
          name: pg.name || `Page ${index + 1}`,
          fabricJSON: typeof pg.fabricJSON === "string" ? JSON.parse(pg.fabricJSON) : pg.fabricJSON,
          thumbnail: pg.thumbnail || null,
          locked: pg.locked ?? false,
        })),
      }));

      setProjects(normalized);
    } catch (err: any) {
      console.error('Error fetching projects:', err);
      setError('Failed to load your projects. Please login first.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleRefresh = () => fetchProjects();
    window.addEventListener('refreshProjects', handleRefresh);
    return () => window.removeEventListener('refreshProjects', handleRefresh);
  }, []);

  const handleSelect = (project: ExtendedUserTemplate) => {
    console.log('🎯 Loading project:', project.name, {
      pages: project.pages?.length,
      hasSize: !!project.size,
      projectId: project.id
    });

    if (!project.pages || project.pages.length === 0) {
      console.warn('⚠️ No pages found in project');
      return;
    }

    // ✅ Parse pages properly
    const parsedPages = project.pages.map((pg, index) => {
      let fabricJSON = pg.fabricJSON;
      
      // If string, parse it
      if (typeof fabricJSON === "string") {
        try {
          fabricJSON = JSON.parse(fabricJSON);
        } catch (e) {
          console.error(`❌ Failed to parse page ${index} JSON:`, e);
          fabricJSON = { version: "5.3.0", objects: [], background: "white" };
        }
      }

      // Deep clone to prevent reference issues
      fabricJSON = JSON.parse(JSON.stringify(fabricJSON));

      return {
        id: pg.id || `page-${index}`,
        name: pg.name || `Page ${index + 1}`,
        fabricJSON: fabricJSON,
        thumbnail: pg.thumbnail || null,
        locked: pg.locked ?? false,
      };
    });

    // ✅ Create proper template structure for CanvasEditor
    const templateData = {
      ...project,
      pages: parsedPages,
      // Ensure size is included
      size: project.size || { width: 800, height: 600 },
      // Ensure fabricJSON from first page if main fabricJSON is missing
      fabricJSON: project.fabricJSON || parsedPages[0]?.fabricJSON,
      userId: project.userId,
      createdBy: project.createdBy || null,
    };

    console.log('✅ Sending template data:', {
      name: templateData.name,
      id: templateData.id,
      pages: templateData.pages.length,
      size: templateData.size,
      firstPageObjects: templateData.pages[0]?.fabricJSON?.objects?.length
    });

    // ✅ Send data and close panel
    onSelectProject(templateData);
    
    // Small delay before closing to ensure data is processed
    setTimeout(() => {
      onClose?.();
    }, 100);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, project: ExtendedUserTemplate) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedProject(project);
  };

  const handleMenuClose = () => setAnchorEl(null);

  const handleEdit = () => {
    if (selectedProject) handleSelect(selectedProject);
    handleMenuClose();
  };

  const handleDuplicate = async () => {
    if (!selectedProject) return;
    handleMenuClose();
    try {
      await templateApi.duplicateUserTemplate(selectedProject.id);
      fetchProjects();
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
      setProjects(projects.filter(p => p.id !== selectedProject.id));
      setDeleteDialogOpen(false);
      setSelectedProject(null);
    } catch (err) {
      console.error('Error deleting project:', err);
      alert('Failed to delete project');
    } finally {
      setDeleting(false);
    }
  };

  const getThumbnailUrl = (project: ExtendedUserTemplate) => {
    const timestamp = new Date(project.updatedAt).getTime();

    // ✅ FIXED: Always show FIRST page thumbnail, not last/current
    if (project.pages?.length) {
      const firstPageThumb = project.pages[0].thumbnail?.trim();
      if (firstPageThumb) {
        if (firstPageThumb.startsWith('data:')) return firstPageThumb;
        if (firstPageThumb.startsWith('http')) return `${firstPageThumb}?t=${timestamp}`;
        if (firstPageThumb.startsWith('/')) return `${API_BASE_URL}${firstPageThumb}?t=${timestamp}`;
        return `${API_BASE_URL}/${firstPageThumb}?t=${timestamp}`;
      }
    }

    if (project.thumbnail) {
      const t = project.thumbnail.trim();
      if (t.startsWith('data:')) return t;
      if (t.startsWith('http')) return `${t}?t=${timestamp}`;
      if (t.startsWith('/')) return `${API_BASE_URL}${t}?t=${timestamp}`;
      return `${API_BASE_URL}/${t}?t=${timestamp}`;
    }

    if (project.baseTemplate?.thumbnail) {
      const bt = project.baseTemplate.thumbnail.trim();
      if (bt.startsWith('data:')) return bt;
      if (bt.startsWith('http')) return bt;
      if (bt.startsWith('/')) return `${API_BASE_URL}${bt}`;
      return `${API_BASE_URL}/${bt}`;
    }

    return "/images/default-template.png";
  };

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1.25rem" }}>
            My Projects
          </Typography>
          <IconButton onClick={() => onClose?.()}><CloseIcon /></IconButton>
        </Box>

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

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", flex: 1 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Box sx={{ px: 2, mb: 2 }}>
            <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>
          </Box>
        )}

        {!loading && !error && (
          <Box sx={{ flex: 1, overflowY: "auto", px: 2, pb: 2 }}>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              {filteredProjects.map(project => {
                const thumbnailUrl = getThumbnailUrl(project);
                const pageCount = project.pages?.length || 1;

                return (
                  <Box key={project.id} sx={{ width: "calc(50% - 8px)", mb: 2, position: "relative" }}>
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
                          image={thumbnailUrl || undefined} 
                          alt={project.name}
                          sx={{ objectFit: "cover", borderTopLeftRadius: "14px", borderTopRightRadius: "14px", backgroundColor: "#f5f5f5" }}
                        />
                        <CardContent sx={{ pt: 1, pb: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: 15 }} noWrap>{project.name}</Typography>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">{new Date(project.updatedAt).toLocaleDateString()}</Typography>
                            {pageCount > 1 && <Chip label={`${pageCount} pages`} size="small" sx={{ height: 20, fontSize: 11, bgcolor: "#e9d5ff", color: "#7c3aed" }} />}
                          </Box>
                          {project.baseTemplate && <Chip label={`From: ${project.baseTemplate.name}`} size="small" sx={{ mt: 0.5, height: 20, fontSize: 11, bgcolor: "#dbeafe", color: "#2563eb" }} />}
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Box>
                );
              })}

              {filteredProjects.length === 0 && (
                <Box sx={{ width: "100%" }}>
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", mt: 4 }}>
                    {searchQuery ? `No projects found for "${searchQuery}"` : "No projects yet. Start by selecting a template!"}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Box>

      {/* Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={handleEdit}><EditIcon fontSize="small" sx={{ mr: 1 }} />Edit</MenuItem>
        <MenuItem onClick={handleDuplicate}><ContentCopyIcon fontSize="small" sx={{ mr: 1 }} />Duplicate</MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: "error.main" }}><DeleteIcon fontSize="small" sx={{ mr: 1 }} />Delete</MenuItem>
      </Menu>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => !deleting && setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Project?</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete "{selectedProject?.name}"? This action cannot be undone.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" disabled={deleting}>
            {deleting ? <CircularProgress size={20} /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MyProjectsPanel;

