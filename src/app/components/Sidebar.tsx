// "use client";
// import React, { useState, useEffect } from "react";
// import { Drawer, IconButton, Tooltip, Divider, Box } from "@mui/material";
// import { styled } from "@mui/material/styles";
// import TextFieldsIcon from "@mui/icons-material/TextFields";
// import DashboardIcon from "@mui/icons-material/Dashboard";
// import WidgetsIcon from "@mui/icons-material/Widgets";
// import DeleteIcon from "@mui/icons-material/Delete";
// import VerticalAlignTopIcon from "@mui/icons-material/VerticalAlignTop";
// import FolderIcon from "@mui/icons-material/Folder"; 
// import VerticalAlignBottomIcon from "@mui/icons-material/VerticalAlignBottom";
// import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
// import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
// import CreateIcon from "@mui/icons-material/Create"; 
// import TemplatesPanel from "./panal/TemplatePanel";
// import DynamicElementsPanel from "./panal/DynamicElementsPanel";

// const CanvaSidebar = styled(Drawer)(({ theme }) => ({
//   "& .MuiDrawer-paper": {
//     width: 80,
//     backgroundColor: "#f8fafc",
//     borderRight: "1px solid #e2e8f0",
//     marginTop: "64px",
//     paddingTop: theme.spacing(2),
//     boxSizing: "border-box",
//   },
// }));

// const SidebarIconButton = styled(IconButton)(({ theme }) => ({
//   width: 48,
//   height: 48,
//   margin: "4px 8px",
//   borderRadius: "12px",
//   color: "#64748b",
//   transition: "all 0.2s ease",
//   "&:hover": {
//     backgroundColor: "#e2e8f0",
//     color: "#00c4cc",
//     transform: "translateY(-1px)",
//   },
// }));

// const SectionDivider = styled(Divider)(({ theme }) => ({
//   margin: "12px 16px",
//   backgroundColor: "#e2e8f0",
// }));

// interface SidebarProps {
//   onAddText: () => void;
//   onAddShape: (shapeOrJson: any) => void;
//   onDelete: () => void;
//   onBringForward: () => void;
//   onSendBackward: () => void;
//   onBringToFront: () => void;
//   onSendToBack: () => void;
//   onDrawMode: () => void; 
//     drawMode: boolean; 
// }

// const Sidebar: React.FC<SidebarProps> = ({
//   onAddText,
//   onAddShape,
//   onDelete,
//   onBringForward,
//   onSendBackward,
//   onBringToFront,
//   onSendToBack,
//   onDrawMode,
// }) => {
//   const [mounted, setMounted] = useState(false);
//   const [elementsOpen, setElementsOpen] = useState(false);
//   const [templatesOpen, setTemplatesOpen] = useState(false);
//    const [projectsOpen, setProjectsOpen] = useState(false);

//   useEffect(() => setMounted(true), []);
//   if (!mounted) return null;

//   const toggleElementsPanel = () => setElementsOpen((open) => !open);
//   const closeElementsPanel = () => setElementsOpen(false);

//   const toggleTemplatesPanel = () => setTemplatesOpen((open) => !open);
//   const closeTemplatesPanel = () => setTemplatesOpen(false);


// const handleTemplateData = (templateData: any) => {
//   console.log("Template received in Sidebar:", templateData);

//   if (templateData && templateData.elements && Array.isArray(templateData.elements)) {
//     console.log("Processing template elements:", templateData.elements);

//     // Direct call to onAddShape with LOAD_TEMPLATE structure
//     onAddShape({
//       type: "LOAD_TEMPLATE",
//       template: templateData,
//     });
//   }
// };

//   return (
//     <>
//       <CanvaSidebar
//         variant="permanent"
//         anchor="left"
//         sx={{ "& .MuiDrawer-paper": { position: "fixed", zIndex: 1200 } }}
//       >
//         <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", height: "100%", overflowY: "auto" }}>
//           {/* Templates */}
//           <Tooltip title="Templates" placement="right" arrow>
//             <SidebarIconButton onClick={toggleTemplatesPanel}>
//               <DashboardIcon />
//             </SidebarIconButton>
//           </Tooltip>

//           {/* Add Text */}
//           <Tooltip title="Add Text" placement="right" arrow>
//             <SidebarIconButton onClick={onAddText}>
//               <TextFieldsIcon />
//             </SidebarIconButton>
//           </Tooltip>

//           {/* Pencil / Draw */}
//           <Tooltip title="Draw / Pencil" placement="right" arrow>
//             <SidebarIconButton onClick={onDrawMode}>
//               <CreateIcon />
//             </SidebarIconButton>
//           </Tooltip>

//           <SectionDivider />

//           {/* Elements */}
//           <Tooltip title="Elements" placement="right" arrow>
//             <SidebarIconButton onClick={toggleElementsPanel}>
//               <WidgetsIcon />
//             </SidebarIconButton>
//           </Tooltip>

//           <SectionDivider />

//           {/* Delete */}
//           <Tooltip title="Delete" placement="right" arrow>
//             <SidebarIconButton onClick={onDelete}>
//               <DeleteIcon />
//             </SidebarIconButton>
//           </Tooltip>

//           <SectionDivider />

//           {/* Layer Controls */}
//           <Tooltip title="Bring Forward" placement="right" arrow>
//             <SidebarIconButton onClick={onBringForward}>
//               <ArrowUpwardIcon />
//             </SidebarIconButton>
//           </Tooltip>

//           <Tooltip title="Send Backward" placement="right" arrow>
//             <SidebarIconButton onClick={onSendBackward}>
//               <ArrowDownwardIcon />
//             </SidebarIconButton>
//           </Tooltip>

//           <Tooltip title="Bring to Front" placement="right" arrow>
//             <SidebarIconButton onClick={onBringToFront}>
//               <VerticalAlignTopIcon />
//             </SidebarIconButton>
//           </Tooltip>

//           <Tooltip title="Send to Back" placement="right" arrow>
//             <SidebarIconButton onClick={onSendToBack}>
//               <VerticalAlignBottomIcon />
//             </SidebarIconButton>
//           </Tooltip>
//         </Box>
//       </CanvaSidebar>

//       {/* Dynamic Elements Panel */}
//       {elementsOpen && (
//         <DynamicElementsPanel 
//           onAddElement={onAddShape} 
//           onClose={closeElementsPanel} 
//         />
//       )}

//       {/* Templates Panel */}
//       {templatesOpen && (
//         <TemplatesPanel 
//           onTemplateSelect={handleTemplateData} 
//           onClose={closeTemplatesPanel} 
//         />
//       )}
//     </>
//   );
// };

// export default Sidebar;

"use client";
import React, { useState, useEffect } from "react";
import { Drawer, IconButton, Tooltip, Divider, Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import CreateIcon from "@mui/icons-material/Create";
import TemplatesPanel from "./panal/TemplatePanel";
import DynamicElementsPanel from "./panal/DynamicElementsPanel";
import MyProjectsPanel from "./panal/MyProjectsPanel";
import UploadsPanel from "./panal/UploadsPanel";
import TextPanel from "./panal/TextPanel";

const CanvaSidebar = styled(Drawer)(({ theme }) => ({
  "& .MuiDrawer-paper": {
    width: 80,
    backgroundColor: "#f8fafc",
    borderRight: "1px solid #e2e8f0",
    marginTop: "64px",
    paddingTop: theme.spacing(2),
    boxSizing: "border-box",
  },
}));

const SidebarIconButton = styled(IconButton)(({ theme }) => ({
  width: 48,
  height: 48,
  margin: "4px 8px",
  borderRadius: "12px",
  color: "#64748b",
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: "#e2e8f0",
    color: "#00c4cc",
    transform: "translateY(-1px)",
  },
}));

const SectionDivider = styled(Divider)(({ theme }) => ({
  margin: "12px 16px",
  backgroundColor: "#e2e8f0",
}));

interface SidebarProps {
  onAddText: (textConfig?: {
    text: string;
    fontSize: number;
    fontWeight: string | number;
    fontFamily?: string;
  }) => void;
  onAddShape: (shapeOrJson: any) => void;
  onDelete: () => void;
  onDrawMode: () => void;
  drawMode: boolean;
  activeCategory?: string | null;
  canvas?: any;
  onAddUpload?: (data: any) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  onAddText,
  onAddShape,
  onDrawMode,
  onAddUpload,
}) => {
  const [mounted, setMounted] = useState(false);
  const [elementsOpen, setElementsOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [uploadsOpen, setUploadsOpen] = useState(false);
  const [textPanelOpen, setTextPanelOpen] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const toggleElementsPanel = () => {
    setElementsOpen((open) => !open);
    setTemplatesOpen(false);
    setProjectsOpen(false);
    setUploadsOpen(false);
    setTextPanelOpen(false);
  };

  const toggleTemplatesPanel = () => {
    setTemplatesOpen((open) => !open);
    setElementsOpen(false);
    setProjectsOpen(false);
    setUploadsOpen(false);
    setTextPanelOpen(false);
  };

  const toggleProjectsPanel = () => {
    setProjectsOpen((open) => !open);
    setElementsOpen(false);
    setTemplatesOpen(false);
    setUploadsOpen(false);
    setTextPanelOpen(false);
  };

  const toggleTextPanel = () => {
    setTextPanelOpen((open) => !open);
    setElementsOpen(false);
    setTemplatesOpen(false);
    setProjectsOpen(false);
    setUploadsOpen(false);
  };

  const toggleUploadsPanel = () => {
    setUploadsOpen((open) => !open);
    setElementsOpen(false);
    setTemplatesOpen(false);
    setProjectsOpen(false);
    setTextPanelOpen(false);
  };

  const closeElementsPanel = () => setElementsOpen(false);
  const closeTemplatesPanel = () => setTemplatesOpen(false);
  const closeProjectsPanel = () => setProjectsOpen(false);
  const closeTextPanel = () => setTextPanelOpen(false);
  const closeUploadsPanel = () => setUploadsOpen(false);

  // Handle template selection from Templates Panel
  const handleTemplateData = (templateData: any) => {
    console.log("Template received in Sidebar:", templateData);

    if (templateData && templateData.elements) {
      console.log("Processing template elements:", templateData.elements);

      // Load template into canvas
      onAddShape({
        type: "LOAD_TEMPLATE",
        template: templateData,
      });

      closeTemplatesPanel();
    }
  };

  // Handle project selection from My Projects Panel
  const handleProjectData = (projectData: any) => {
    console.log("Project received in Sidebar:", projectData);

    if (projectData && projectData.elements) {
      console.log("Processing project elements:", projectData.elements);

      // Load user's project into canvas
      onAddShape({
        type: "LOAD_TEMPLATE",
        template: projectData,
        isUserProject: true,
      });

      closeProjectsPanel();
    }
  };

  // Handle text addition from TextPanel
  const handleAddTextFromPanel = (textConfig: {
    text: string;
    fontSize: number;
    fontWeight: string | number;
    fontFamily?: string;
  }) => {
    console.log("Text config received:", textConfig);
    onAddText(textConfig);
  };

  // ✅ Handle elements from DynamicElementsPanel
  const handleAddElement = (elementData: any) => {
    console.log("🎨 Element received in Sidebar:", elementData);
    
    if (onAddUpload) {
      onAddUpload(elementData);
    } else {
      console.warn("⚠️ onAddUpload not provided to Sidebar");
    }
  };

  return (
    <>
      <CanvaSidebar
        variant="permanent"
        anchor="left"
        sx={{ "& .MuiDrawer-paper": { position: "fixed", zIndex: 1200 } }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            height: "100%",
            overflowY: "auto",
          }}
        >
          {/* Templates */}
          <Tooltip title="Templates" placement="right" arrow>
            <SidebarIconButton onClick={toggleTemplatesPanel}>
              <img src="/uploadIcons/design.png" alt="Templates" width={70} height={70} />
            </SidebarIconButton>
          </Tooltip>

          <SectionDivider />

          {/* Elements */}
          <Tooltip title="Elements" placement="right" arrow>
            <SidebarIconButton onClick={toggleElementsPanel}>
              <img src="/uploadIcons/element1.png" alt="Elements" width={35} height={35} />
            </SidebarIconButton>
          </Tooltip>
          <SectionDivider />

          {/* Add Text */}
          <Tooltip title="Add Text" placement="right" arrow>
            <SidebarIconButton onClick={toggleTextPanel}>
              <img src="/uploadIcons/text.png" alt="Text" width={50} height={50} />
            </SidebarIconButton>
          </Tooltip>

          <SectionDivider />

          {/* My Projects */}
          <Tooltip title="My Projects" placement="right" arrow>
            <SidebarIconButton onClick={toggleProjectsPanel}>
              <img src="/uploadIcons/folder.png" alt="Projects" width={50} height={50} />
            </SidebarIconButton>
          </Tooltip>
          <SectionDivider />

          {/* Pencil / Draw */}
          <Tooltip title="Draw / Pencil" placement="right" arrow>
            <SidebarIconButton onClick={onDrawMode}>
              <CreateIcon />
            </SidebarIconButton>
          </Tooltip>

          {/* Uploads */}
          <Tooltip title="Uploads" placement="right" arrow>
            <SidebarIconButton onClick={toggleUploadsPanel}>
              <img src="/uploadIcons/uploadicon.png" alt="Uploads" width={35} height={35} />
            </SidebarIconButton>
          </Tooltip>
          <SectionDivider />
        </Box>
      </CanvaSidebar>

      {/* ✅ Dynamic Elements Panel - NOW USES handleAddElement */}
      {elementsOpen && (
        <DynamicElementsPanel 
          onAddElement={handleAddElement} 
          onClose={closeElementsPanel} 
        />
      )}

      {/* Templates Panel */}
      {templatesOpen && (
        <TemplatesPanel onTemplateSelect={handleTemplateData} onClose={closeTemplatesPanel} />
      )}

      {/* My Projects Panel */}
      {projectsOpen && (
        <MyProjectsPanel onSelectProject={handleProjectData} onClose={closeProjectsPanel} />
      )}

      {/* Uploads Panel */}
      {uploadsOpen && (
        <UploadsPanel onAddUpload={onAddUpload!} onClose={closeUploadsPanel} />
      )}

      {/* Text Panel */}
      {textPanelOpen && (
        <TextPanel onAddText={handleAddTextFromPanel} onClose={closeTextPanel} />
      )}
    </>
  );
};

export default Sidebar;