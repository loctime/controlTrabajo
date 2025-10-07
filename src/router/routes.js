//import Cart from "../components/pages/cart/Cart";
//import Checkout from "../components/pages/checkout/Checkout";
import CargaCv from "../components/pages/cargaCv/cargaCv";
import Home from "../components/pages/home/Home";
//import ItemDetail from "../components/pages/itemDetail/ItemDetail";
import ItemListContainer from "../components/pages/itemlist/ItemListContainer";
import CvStatus from "../components/pages/cvStatus/CvStatus";
//import UserOrders from "../components/pages/userOrders/UserOrders";

export const routes = [
  {
    id: "home",
    path: "/",
    Element: Home,
  },
  {
    id: "cv",
    path: "/cv",
    Element: ItemListContainer,
  },
  {
    id: "cargacv",
    path: "/cvc",
    Element: CargaCv,
  },
  {
    id: "mi-cv",
    path: "/mi-cv",
    Element: CvStatus,
  },
]