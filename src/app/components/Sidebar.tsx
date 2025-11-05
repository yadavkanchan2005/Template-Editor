
// "use client";
// import React, { useState, useEffect } from "react";
// import { Drawer, IconButton, Tooltip, Divider, Box } from "@mui/material";
// import { styled } from "@mui/material/styles";
// import CreateIcon from "@mui/icons-material/Create";
// import TemplatesPanel from "./panal/TemplatePanel";
// import DynamicElementsPanel from "./panal/DynamicElementsPanel";
// import MyProjectsPanel from "./panal/MyProjectsPanel";
// import UploadsPanel from "./panal/UploadsPanel";
// import TextPanel from "./panal/TextPanel";

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
//   onAddText: (textConfig?: {
//     text: string;
//     fontSize: number;
//     fontWeight: string | number;
//     fontFamily?: string;
//   }) => void;
//   onAddShape: (shapeOrJson: any) => void;
//   onDelete: () => void;
//   onDrawMode: () => void;
//   drawMode: boolean;
//   activeCategory?: string | null;
//   canvas?: any;
//   onAddUpload?: (data: any) => void;
//   onSelectProject?: (projectData: any) => void; // ✅ NEW PROP
// }

// const Sidebar: React.FC<SidebarProps> = ({
//   onAddText,
//   onAddShape,
//   onDrawMode,
//   onAddUpload,
//   onSelectProject, // ✅ NEW PROP
// }) => {
//   const [mounted, setMounted] = useState(false);
//   const [elementsOpen, setElementsOpen] = useState(false);
//   const [templatesOpen, setTemplatesOpen] = useState(false);
//   const [projectsOpen, setProjectsOpen] = useState(false);
//   const [uploadsOpen, setUploadsOpen] = useState(false);
//   const [textPanelOpen, setTextPanelOpen] = useState(false);

//   useEffect(() => setMounted(true), []);
//   if (!mounted) return null;

//   const toggleElementsPanel = () => {
//     setElementsOpen((open) => !open);
//     setTemplatesOpen(false);
//     setProjectsOpen(false);
//     setUploadsOpen(false);
//     setTextPanelOpen(false);
//   };

//   const toggleTemplatesPanel = () => {
//     setTemplatesOpen((open) => !open);
//     setElementsOpen(false);
//     setProjectsOpen(false);
//     setUploadsOpen(false);
//     setTextPanelOpen(false);
//   };

//   const toggleProjectsPanel = () => {
//     setProjectsOpen((open) => !open);
//     setElementsOpen(false);
//     setTemplatesOpen(false);
//     setUploadsOpen(false);
//     setTextPanelOpen(false);
//   };

//   const toggleTextPanel = () => {
//     setTextPanelOpen((open) => !open);
//     setElementsOpen(false);
//     setTemplatesOpen(false);
//     setProjectsOpen(false);
//     setUploadsOpen(false);
//   };

//   const toggleUploadsPanel = () => {
//     setUploadsOpen((open) => !open);
//     setElementsOpen(false);
//     setTemplatesOpen(false);
//     setProjectsOpen(false);
//     setTextPanelOpen(false);
//   };

//   const closeElementsPanel = () => setElementsOpen(false);
//   const closeTemplatesPanel = () => setTemplatesOpen(false);
//   const closeProjectsPanel = () => setProjectsOpen(false);
//   const closeTextPanel = () => setTextPanelOpen(false);
//   const closeUploadsPanel = () => setUploadsOpen(false);

//   //  Handle template selection from Templates Panel
//   const handleTemplateData = (templateData: any) => {
//     console.log("Template received in Sidebar:", {
//       name: templateData?.name,
//       pages: templateData?.pages?.length,
//       hasSize: !!templateData?.size
//     });

//     if (!templateData) {
//       console.error("No template data received");
//       return;
//     }

//     // Send proper LOAD_TEMPLATE action to CanvasEditor
//     onAddShape({
//       type: "LOAD_TEMPLATE",
//       template: {
//         ...templateData,
//         size: templateData.size || { width: 800, height: 600 },
//         isAdminTemplate: !templateData.userId
//       },
//     });

//     // closeTemplatesPanel();
//   };

//   // FIXED: Handle project selection - NO onAddShape call!
//   const handleProjectData = (projectData: any) => {
//     console.log(" Project received in Sidebar:", {
//       name: projectData?.name,
//       pages: projectData?.pages?.length,
//       size: projectData?.size,
//       hasUserId: !!projectData?.userId
//     });

//     if (!projectData) {
//       console.error("No project data received");
//       return;
//     }

//     // Validate pages
//     if (!projectData.pages || projectData.pages.length === 0) {
//       console.error(" Project has no pages");
//       alert("This project has no pages to load");
//       return;
//     }


//     // Just pass directly to CanvasEditor's onSelectProject
//     if (onSelectProject) {
//       console.log(" Passing project to CanvasEditor directly");
//       onSelectProject(projectData);
//     } else {
//       console.error(" onSelectProject prop not provided!");
//     }

//     // closeProjectsPanel();
//   };

//   // Handle text addition from TextPanel
//   const handleAddTextFromPanel = (textConfig: {
//     text: string;
//     fontSize: number;
//     fontWeight: string | number;
//     fontFamily?: string;
//   }) => {
//     console.log("Text config received:", textConfig);
//     onAddText(textConfig);
//     closeTextPanel();
//   };

//   //  Handle elements from DynamicElementsPanel
//   const handleAddElement = (elementData: any) => {
//     console.log(" Element received in Sidebar:", elementData);
    
//     if (onAddUpload) {
//       onAddUpload(elementData);
//       // closeElementsPanel();
//     } else {
//       console.warn("onAddUpload not provided to Sidebar");
//     }
//   };

//   return (
//     <>
//       <CanvaSidebar
//         variant="permanent"
//         anchor="left"
//         sx={{ "& .MuiDrawer-paper": { position: "fixed", zIndex: 1200 } }}
//       >
//         <Box
//           sx={{
//             display: "flex",
//             flexDirection: "column",
//             alignItems: "center",
//             height: "100%",
//             overflowY: "auto",
//           }}
//         >
//           {/* Templates */}
//           <Tooltip title="Templates" placement="right" arrow>
//             <SidebarIconButton onClick={toggleTemplatesPanel}>
//               <img src="/uploadIcons/design.png" alt="Templates" width={70} height={70} />
//             </SidebarIconButton>
//           </Tooltip>

//           <SectionDivider />

//           {/* Elements */}
//           <Tooltip title="Elements" placement="right" arrow>
//             <SidebarIconButton onClick={toggleElementsPanel}>
//               <img src="/uploadIcons/element1.png" alt="Elements" width={35} height={35} />
//             </SidebarIconButton>
//           </Tooltip>
//           <SectionDivider />

//           {/* Add Text */}
//           <Tooltip title="Add Text" placement="right" arrow>
//             <SidebarIconButton onClick={toggleTextPanel}>
//               <img src="/uploadIcons/text.png" alt="Text" width={50} height={50} />
//             </SidebarIconButton>
//           </Tooltip>

//           <SectionDivider />

//           {/* My Projects */}
//           <Tooltip title="My Projects" placement="right" arrow>
//             <SidebarIconButton onClick={toggleProjectsPanel}>
//               <img src="/uploadIcons/folder.png" alt="Projects" width={50} height={50} />
//             </SidebarIconButton>
//           </Tooltip>
//           <SectionDivider />

//           {/* Pencil / Draw */}
//           <Tooltip title="Draw / Pencil" placement="right" arrow>
//             <SidebarIconButton onClick={onDrawMode}>
//               <CreateIcon />
//             </SidebarIconButton>
//           </Tooltip>

//           {/* Uploads */}
//           <Tooltip title="Uploads" placement="right" arrow>
//             <SidebarIconButton onClick={toggleUploadsPanel}>
//               <img src="/uploadIcons/uploadicon.png" alt="Uploads" width={35} height={35} />
//             </SidebarIconButton>
//           </Tooltip>
//           <SectionDivider />
//         </Box>
//       </CanvaSidebar>

//       {/* Dynamic Elements Panel */}
//       {elementsOpen && (
//         <DynamicElementsPanel 
//           onAddElement={handleAddElement} 
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

//       {/* My Projects Panel */}
//       {projectsOpen && (
//         <MyProjectsPanel 
//           onSelectProject={handleProjectData} 
//           onClose={closeProjectsPanel} 
//         />
//       )}

//       {/* Uploads Panel */}
//       {uploadsOpen && onAddUpload && (
//         <UploadsPanel 
//           onAddUpload={onAddUpload} 
//           onClose={closeUploadsPanel} 
//         />
//       )}

//       {/*  Text Panel */}
//       {textPanelOpen && (
//         <TextPanel 
//           onAddText={handleAddTextFromPanel} 
//           onClose={closeTextPanel} 
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
   backgroundColor: "#fff",  
    borderRight: "1px solid #e2e8f0",
    marginTop: "64px",
    paddingTop: theme.spacing(2),
    boxSizing: "border-box",
  },
}));


const SidebarIconButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== "active",
})<{ active?: boolean }>(({ active }) => ({
  width: 48,
  height: 48,
  margin: "4px 8px",
  borderRadius: "12px",
  color: active ? "#8b5cf6" : "#64748b", 
  backgroundColor: active ? "#ede9fe" : "transparent", 
  transition: "all 0.2s ease",

  "&:hover": {
    backgroundColor: "#ede9fe", 
    color: "#8b5cf6",
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
  onAddUpload?: (data: any) => void;
  onSelectProject?: (projectData: any) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  onAddText,
  onAddShape,
  onDrawMode,
  onAddUpload,
  onSelectProject,
}) => {
  const [mounted, setMounted] = useState(false);
  const [elementsOpen, setElementsOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [uploadsOpen, setUploadsOpen] = useState(false);
  const [textPanelOpen, setTextPanelOpen] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  //  Reset others when one opens
  const openPanel = (panel: string) => {
    setTemplatesOpen(panel === "templates");
    setElementsOpen(panel === "elements");
    setProjectsOpen(panel === "projects");
    setUploadsOpen(panel === "uploads");
    setTextPanelOpen(panel === "text");
  };

  // Manual close handlers
  const closeElementsPanel = () => setElementsOpen(false);
  const closeTemplatesPanel = () => setTemplatesOpen(false);
  const closeProjectsPanel = () => setProjectsOpen(false);
  const closeTextPanel = () => setTextPanelOpen(false);
  const closeUploadsPanel = () => setUploadsOpen(false);

  //  Handle template selection (does NOT close automatically)
  const handleTemplateData = (templateData: any) => {
    console.log("Template received:", templateData?.name);
    if (!templateData) return;

    onAddShape({
      type: "LOAD_TEMPLATE",
      template: {
        ...templateData,
        size: templateData.size || { width: 800, height: 600 },
        isAdminTemplate: !templateData.userId,
      },
    });
  };

  // Handle project selection (does NOT close automatically)
  const handleProjectData = (projectData: any) => {
    console.log("Project selected:", projectData?.name);
    if (!projectData) return;

    if (onSelectProject) {
      onSelectProject(projectData);
    }
  };

  // Handle text addition
  const handleAddTextFromPanel = (textConfig: {
    text: string;
    fontSize: number;
    fontWeight: string | number;
    fontFamily?: string;
  }) => {
    console.log("Text added:", textConfig);
    onAddText(textConfig);
  };

  // Handle element addition
  const handleAddElement = (elementData: any) => {
    console.log("Element added:", elementData);
    if (onAddUpload) {
      onAddUpload(elementData);
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
            bgcolor: "#fff",  
          }}
        >
          {/* Templates */}
          <Tooltip title="Templates" placement="right" arrow>
            <SidebarIconButton
              active={templatesOpen}
              onMouseEnter={() => openPanel("templates")}
            >
              <img src="/uploadIcons/design.png" alt="Templates" width={70} height={70} />
            </SidebarIconButton>
          </Tooltip>

          <SectionDivider />

          {/* Elements */}
          <Tooltip title="Elements" placement="right" arrow>
            <SidebarIconButton
              active={elementsOpen}
              onMouseEnter={() => openPanel("elements")}
            >
              <img src="/uploadIcons/element1.png" alt="Elements" width={35} height={35} />
            </SidebarIconButton>
          </Tooltip>

          <SectionDivider />

          {/* Add Text */}
          <Tooltip title="Add Text" placement="right" arrow>
            <SidebarIconButton
              active={textPanelOpen}
              onMouseEnter={() => openPanel("text")}
            >
              <img src="/uploadIcons/text.png" alt="Text" width={50} height={50} />
            </SidebarIconButton>
          </Tooltip>

          <SectionDivider />

          {/* My Projects */}
          <Tooltip title="My Projects" placement="right" arrow>
            <SidebarIconButton
              active={projectsOpen}
              onMouseEnter={() => openPanel("projects")}
            >
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

          <SectionDivider />

          {/* Uploads */}
          <Tooltip title="Uploads" placement="right" arrow>
            <SidebarIconButton
              active={uploadsOpen}
              onMouseEnter={() => openPanel("uploads")}
            >
              <img src="/uploadIcons/uploadicon.png" alt="Uploads" width={35} height={35} />
            </SidebarIconButton>
          </Tooltip>
        </Box>
      </CanvaSidebar>

      {/* Panels now stay open until user closes */}
      {elementsOpen && (
        <DynamicElementsPanel onAddElement={handleAddElement} onClose={closeElementsPanel} />
      )}

      {templatesOpen && (
        <TemplatesPanel onTemplateSelect={handleTemplateData} onClose={closeTemplatesPanel} />
      )}

      {projectsOpen && (
        <MyProjectsPanel onSelectProject={handleProjectData} onClose={closeProjectsPanel} />
      )}

      {uploadsOpen && onAddUpload && (
        <UploadsPanel onAddUpload={onAddUpload} onClose={closeUploadsPanel} />
      )}

      {textPanelOpen && (
        <TextPanel onAddText={handleAddTextFromPanel} onClose={closeTextPanel} />
      )}
    </>
  );
};

export default Sidebar;
