import { useEffect, useState } from "react";
import { db } from "../../../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import CVList from "./ProductsList"; // Cambiado de ProductsList a CVList

const CargaManual = () => {
  const [cvs, setCvs] = useState([]); // Cambiado de products a cvs
  const [isChange, setIsChange] = useState(true);

  useEffect(() => {
    setIsChange(false);
    let cvCollection = collection(db, "cv"); // Cambiado de Cv a cv
    getDocs(cvCollection).then((res) => {
      const newArr = res.docs.map((cv) => { // Cambiado de product a cv
        return {
          ...cv.data(),
          id: cv.id,
        };
      });
      setCvs(newArr); // Cambiado de setProducts a setCvs
    });
  }, [isChange]);

  return (
    <div>
      <CVList cvs={cvs} setIsChange={setIsChange} /> {/* Cambiado de ProductsList a CVList */}
    </div>
  );
};

export default CargaManual;
