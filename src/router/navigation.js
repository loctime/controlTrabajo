import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AssignmentIcon from '@mui/icons-material/Assignment';
import HomeIcon from '@mui/icons-material/Home';
import FolderSharedIcon from '@mui/icons-material/FolderShared';
//import StoreIcon from '@mui/icons-material/Store';

//import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
//import ShopIcon from '@mui/icons-material/Shop';
export const menuItems = [
    
   
    {
        id: "home",
        path: "/",
        title: "Inicio",
        Icon: HomeIcon
    },
    {
        id: "cv",
        path: "/cv",
        title: "Ver Curriculum",
        Icon: AssignmentIcon
    },
    {
        id: "mi-cv",
        path: "/mi-cv",
        title: "Mi CV",
        Icon: FolderSharedIcon
    },
    {
        id: "Cargar Cv",
        path: "/cvc",
        title: "Cargar Curriculum",
        Icon: AccountCircleIcon
    },
]