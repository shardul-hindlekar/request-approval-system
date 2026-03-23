import { Box } from "@mui/material";
import Navbar from "./Navbar";

interface Props {
    children : React.ReactNode;
}

export default function AppLayout({children}: Props) {
    return (
        <Box sx={{ display: "flex"}}>
            <Navbar/>
            <Box component= "main" sx={{ flexGrow: 1, p : 3}}>
                {children}
            </Box>
        </Box>
    );
}