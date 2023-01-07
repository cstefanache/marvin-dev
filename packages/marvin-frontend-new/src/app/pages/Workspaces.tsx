import { useEffect, useState } from 'react';

import { Button } from "@blueprintjs/core";

export default function Workspaces({
  selectWorkspace,
}: {
  selectWorkspace: Function;
}) {
  const [workspaces, setWorkspaces] = useState([]);

  useEffect(() => {
    const asyncFn = async () => {
      const workspaces = await window.electron.getWorkspaces();
      setWorkspaces(workspaces);
    };
    asyncFn();
  }, []);

  const selectWorkspaceFolder = () => {
    window.electron.selectNewWorkspaceFolder();
  }

  return (
    <Button intent="success" text="button content" />

    // <Container component="main" maxWidth="xs">
    //   <Box
    //     sx={{
    //       marginTop: 2,
    //       display: 'flex',
    //       flexDirection: 'column',
    //       alignItems: 'center',
    //     }}
    //   >
    //     {workspaces && workspaces.length > 0 ? (
    //       <Stack>
    //         <Typography variant="h5" component="h1" gutterBottom>
    //           Select workspace
    //         </Typography>
    //         {workspaces.map((workspace) => (
    //           <Typography
    //             variant="body1"
    //             component="p"
    //             gutterBottom
    //             key={workspace}
    //           >
    //             {workspace}
    //           </Typography>
    //         ))}
    //       </Stack>
    //     ) : (
    //       <Stack>
    //         <Typography textAlign="center">There are no workspaces</Typography>
    //         <Typography textAlign="center">
    //           Choose a different folder to create a new workspace
    //         </Typography>
    //       </Stack>
    //     )}

    //     <Typography textAlign="center">
    //       <Button variant="contained" onClick={selectWorkspaceFolder}>
    //         Select Workspace Folder
    //       </Button>
    //     </Typography>
    //   </Box>
    // </Container>
  );
}
