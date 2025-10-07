import { db } from "../firebaseConfig";
import { collection, getDocs, updateDoc, doc, getDoc } from "firebase/firestore";

/**
 * Script de migración para actualizar CVs existentes al nuevo formato
 * 
 * Cambios:
 * - Ciudad → pais, estadoProvincia, ciudad, localidad
 * - Profesion → categoriaGeneral, categoriaEspecifica
 * - Agrega: motivoRechazo, fechaRechazo, versionCV
 * 
 * IMPORTANTE: Este script se ejecuta una sola vez desde la consola del navegador
 * Uso: importar y ejecutar migrateExistingCVs() desde la consola
 */

// Mapeo de profesiones antiguas a categorías generales
const PROFESION_TO_CATEGORIA = {
  "Ingeniero": "Ingeniería",
  "Doctor": "Medicina y Salud",
  "Abogado": "Derecho y Legal",
  "Carpintero": "Construcción y Mantenimiento",
  "Electricista": "Construcción y Mantenimiento",
  "Plomero": "Construcción y Mantenimiento",
  "Profesor": "Educación y Formación",
  "Enfermero": "Medicina y Salud",
  "Contador": "Contabilidad y Finanzas",
  "Mecánico": "Construcción y Mantenimiento",
  "Empleada Domestica": "Servicios Domésticos y Cuidado",
  "Administrativo": "Administración y Gestión",
  "Vendedor": "Ventas y Comercio",
  "Albanil": "Construcción y Mantenimiento",
  "Cajero": "Ventas y Comercio",
  "Cocinero": "Gastronomía y Hotelería",
  "cocinero": "Gastronomía y Hotelería",
  "Metalurgico": "Industria y Manufactura",
  "Soldador": "Construcción y Mantenimiento",
  "Vigilacia de Seguridad": "Seguridad",
  "Estilista": "Otros",
  "Recepcionista": "Administración y Gestión",
  "Jardinero": "Construcción y Mantenimiento",
  "Peluquero": "Otros",
  "Desarrollador de software": "Informática y Tecnología",
  "Psicologo": "Medicina y Salud",
  "Acompañante Terapeutico": "Medicina y Salud",
  "Cuidado de personas mayores": "Servicios Domésticos y Cuidado",
  "otros oficios": "Otros",
  "ventas": "Ventas y Comercio"
};

// Mapeo de ciudades a provincia y país
const CIUDAD_TO_LOCATION = {
  "San Nicolás": {
    ciudad: "San Nicolás de los Arroyos",
    estadoProvincia: "Buenos Aires",
    pais: "Argentina",
    localidad: ""
  },
  "San Nicolás de los Arroyos": {
    ciudad: "San Nicolás de los Arroyos",
    estadoProvincia: "Buenos Aires",
    pais: "Argentina",
    localidad: ""
  },
  "Ramallo": {
    ciudad: "Ramallo",
    estadoProvincia: "Buenos Aires",
    pais: "Argentina",
    localidad: ""
  }
};

/**
 * Migra un CV del formato antiguo al nuevo
 * @param {Object} cvData - Datos del CV en formato antiguo
 * @returns {Object} - Datos actualizados para el CV
 */
export const migrateCVData = (cvData) => {
  const updates = {};

  // Migrar ubicación si existe el campo Ciudad
  if (cvData.Ciudad && !cvData.pais) {
    const locationData = CIUDAD_TO_LOCATION[cvData.Ciudad] || {
      ciudad: cvData.Ciudad,
      estadoProvincia: "",
      pais: "",
      localidad: ""
    };
    
    updates.pais = locationData.pais;
    updates.estadoProvincia = locationData.estadoProvincia;
    updates.ciudad = locationData.ciudad;
    updates.localidad = locationData.localidad || "";
  }

  // Migrar profesión si existe el campo Profesion
  if (cvData.Profesion && !cvData.categoriaGeneral) {
    const categoriaGeneral = PROFESION_TO_CATEGORIA[cvData.Profesion] || "Otros";
    updates.categoriaGeneral = categoriaGeneral;
    updates.categoriaEspecifica = cvData.Profesion; // Guardar la profesión específica
  }

  // Agregar versionCV si no existe
  if (!cvData.versionCV) {
    updates.versionCV = 1;
  }

  // No migrar campos de rechazo si ya existen
  // (solo se agregan cuando un admin rechaza un CV)

  return updates;
};

/**
 * Migra todos los CVs existentes en la base de datos
 * @returns {Promise<Object>} - Resultado de la migración
 */
export const migrateExistingCVs = async () => {
  try {
    console.log("🚀 Iniciando migración de CVs...");
    
    const cvCollection = collection(db, "cv");
    const querySnapshot = await getDocs(cvCollection);
    
    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    const errors = [];

    for (const docSnap of querySnapshot.docs) {
      try {
        const cvData = docSnap.data();
        
        // Verificar si ya fue migrado (tiene los nuevos campos)
        if (cvData.pais && cvData.categoriaGeneral) {
          console.log(`⏭️  Saltando CV ${docSnap.id} - Ya migrado`);
          skippedCount++;
          continue;
        }

        // Generar actualizaciones
        const updates = migrateCVData(cvData);
        
        if (Object.keys(updates).length === 0) {
          console.log(`⏭️  Saltando CV ${docSnap.id} - No requiere cambios`);
          skippedCount++;
          continue;
        }

        // Aplicar actualizaciones
        await updateDoc(doc(db, "cv", docSnap.id), updates);
        
        console.log(`✅ Migrado CV ${docSnap.id}:`, updates);
        migratedCount++;
        
      } catch (error) {
        console.error(`❌ Error migrando CV ${docSnap.id}:`, error);
        errors.push({ id: docSnap.id, error: error.message });
        errorCount++;
      }
    }

    const result = {
      total: querySnapshot.size,
      migrated: migratedCount,
      skipped: skippedCount,
      errors: errorCount,
      errorDetails: errors
    };

    console.log("\n📊 Resumen de migración:");
    console.log(`Total de CVs: ${result.total}`);
    console.log(`Migrados exitosamente: ${result.migrated}`);
    console.log(`Saltados (ya migrados): ${result.skipped}`);
    console.log(`Errores: ${result.errors}`);
    
    if (errors.length > 0) {
      console.log("\n❌ Detalles de errores:");
      errors.forEach(e => console.log(`  - CV ${e.id}: ${e.error}`));
    }

    return result;

  } catch (error) {
    console.error("❌ Error fatal en la migración:", error);
    throw error;
  }
};

/**
 * Migra un solo CV por su ID (útil para testing)
 * @param {string} cvId - ID del documento CV en Firestore
 * @returns {Promise<Object>} - Resultado de la migración
 */
export const migrateSingleCV = async (cvId) => {
  try {
    const cvRef = doc(db, "cv", cvId);
    const cvSnap = await getDoc(cvRef);
    
    if (!cvSnap.exists()) {
      throw new Error(`CV con ID ${cvId} no existe`);
    }

    const cvData = cvSnap.data();
    const updates = migrateCVData(cvData);

    if (Object.keys(updates).length === 0) {
      console.log("⏭️  No requiere cambios");
      return { updated: false };
    }

    await updateDoc(cvRef, updates);
    console.log("✅ CV migrado exitosamente:", updates);
    
    return { updated: true, changes: updates };

  } catch (error) {
    console.error("❌ Error migrando CV:", error);
    throw error;
  }
};

/**
 * Modo dry-run: muestra qué cambios se harían sin aplicarlos
 * @returns {Promise<Array>} - Lista de cambios propuestos
 */
export const dryRunMigration = async () => {
  try {
    console.log("🔍 Ejecutando dry-run (sin aplicar cambios)...");
    
    const cvCollection = collection(db, "cv");
    const querySnapshot = await getDocs(cvCollection);
    
    const proposedChanges = [];

    for (const docSnap of querySnapshot.docs) {
      const cvData = docSnap.data();
      const updates = migrateCVData(cvData);
      
      if (Object.keys(updates).length > 0) {
        proposedChanges.push({
          id: docSnap.id,
          currentData: {
            Ciudad: cvData.Ciudad,
            Profesion: cvData.Profesion
          },
          proposedUpdates: updates
        });
      }
    }

    console.log(`📋 Se aplicarían cambios a ${proposedChanges.length} CVs:`);
    proposedChanges.forEach((change, index) => {
      console.log(`\n${index + 1}. CV ${change.id}:`);
      console.log("  Datos actuales:", change.currentData);
      console.log("  Cambios propuestos:", change.proposedUpdates);
    });

    return proposedChanges;

  } catch (error) {
    console.error("❌ Error en dry-run:", error);
    throw error;
  }
};

// Exportar para uso en consola del navegador
if (typeof window !== 'undefined') {
  window.migrateExistingCVs = migrateExistingCVs;
  window.migrateSingleCV = migrateSingleCV;
  window.dryRunMigration = dryRunMigration;
  
  console.log("🔧 Funciones de migración disponibles:");
  console.log("  - migrateExistingCVs(): Migra todos los CVs");
  console.log("  - migrateSingleCV(id): Migra un CV específico");
  console.log("  - dryRunMigration(): Muestra cambios sin aplicarlos");
}

export default {
  migrateExistingCVs,
  migrateSingleCV,
  dryRunMigration,
  migrateCVData
};

