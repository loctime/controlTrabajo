import { db } from '../firebaseConfig';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { isFirebaseStorageUrl, isControlFileId } from '../lib/controlFileStorage';

/**
 * Migra CVs existentes agregando campos de metadatos
 */
export async function migrateCVsMetadata() {
  console.log('🔄 Iniciando migracion de CVs...');
  
  const cvCollection = collection(db, 'cv');
  const querySnapshot = await getDocs(cvCollection);
  
  let migrated = 0;
  let skipped = 0;
  
  for (const cvDoc of querySnapshot.docs) {
    const cvData = cvDoc.data();
    const updates = {};
    
    // Marcar archivos antiguos de Firebase Storage
    if (cvData.Foto && isFirebaseStorageUrl(cvData.Foto)) {
      updates.Foto_metadata = {
        source: 'firebase-storage',
        url: cvData.Foto,
        legacy: true,
        migratedAt: new Date().toISOString()
      };
    }
    
    if (cvData.cv && isFirebaseStorageUrl(cvData.cv)) {
      updates.cv_metadata = {
        source: 'firebase-storage',
        url: cvData.cv,
        legacy: true,
        migratedAt: new Date().toISOString()
      };
    }
    
    // Si hay actualizaciones, aplicarlas
    if (Object.keys(updates).length > 0) {
      await updateDoc(doc(db, 'cv', cvDoc.id), updates);
      migrated++;
      console.log(`✅ CV migrado: ${cvDoc.id}`);
    } else {
      skipped++;
    }
  }
  
  console.log(`✅ Migracion completada: ${migrated} migrados, ${skipped} omitidos`);
  return { migrated, skipped };
}
