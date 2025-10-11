import React, { useState, useEffect, useCallback } from "react";
import { Box, Paper, Typography, Divider, Tabs, Tab } from "@mui/material";
import { db } from "../../../firebaseConfig";
import { auth } from "../../../firebaseAuthControlFile";
import { addDoc, collection, query, where, getDocs, setDoc, doc } from "firebase/firestore";
import { showAlert } from "../../../utils/swalConfig";
import { Button } from "../../common/Button";
import { useNavigate } from "react-router-dom";

// Hooks personalizados
import { useFileUpload } from "./hooks/useFileUpload";
import { useAutoFillUserData } from "./hooks/useAutoFillUserData";

// Servicios
import { sendRegistrationEmails } from "./services/emailService";
import { pdfGeneratorService } from "./services/pdfGeneratorService";

// Componentes de formulario
import { PersonalDataForm } from "./components/PersonalDataForm";
import { ProfessionalDataForm } from "./components/ProfessionalDataForm";
import { LocationForm } from "./components/LocationForm";
import { FilesForm } from "./components/FilesForm";
import { ExperienceForm } from "./components/ExperienceForm";
import { EducationForm } from "./components/EducationForm";
import { SkillsForm } from "./components/SkillsForm";
import { LanguagesForm } from "./components/LanguagesForm";
import { CertificationsForm } from "./components/CertificationsForm";
import { ProjectsForm } from "./components/ProjectsForm";
import { ReferencesForm } from "./components/ReferencesForm";
import { TemplateSelector } from "./components/TemplateSelector";
import CVPreview from "./components/CVPreview";
import { useFormValidation } from "./hooks/useFormValidation";

// Componente TabPanel fuera del componente principal para evitar recreaciones
const TabPanel = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);

const CargaCv = ({ handleClose, setIsChange, updateDashboard }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [currentCv, setCurrentCv] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState('moderna');
  const [showPreview, setShowPreview] = useState(false);
  const [newCv, setNewCv] = useState({
    // Datos actuales
    Nombre: "",
    Apellido: "",
    Edad: "",
    categoriaGeneral: "",
    categoriaEspecifica: "",
    ciudad: "",
    localidad: "",
    Email: "",
    Foto: "",
    cv: "",
    estado: "pendiente",
    versionCV: 1,
    
    // Nuevos campos expandidos
    telefono: "",
    direccion: "",
    linkedin: "",
    sitioWeb: "",
    perfilProfesional: "",
    
    // Arrays de objetos
    experiencias: [],
    educacion: [],
    habilidades: [],
    idiomas: [],
    certificaciones: [],
    proyectos: [],
    referencias: [],
    
    // Configuración de CV generado
    cvGenerado: false,
    plantillaSeleccionada: "moderna",
    cvPdfUrl: ""
  });

  const navigate = useNavigate();

  // Usar hooks personalizados
  const { 
    isImageLoaded, 
    isCvLoaded, 
    loadingImage, 
    loadingCv, 
    handleFileChange 
  } = useFileUpload();
  const { autoFillData } = useAutoFillUserData(user, currentCv);
  const { validateForm, getValidationSummary } = useFormValidation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchCurrentCv(currentUser.uid);
        
        // Auto-completar datos del usuario si no tiene CV
        if (!currentCv) {
          try {
            const userData = await autoFillData();
            setNewCv(prevCv => ({
              ...prevCv,
              ...Object.fromEntries(
                Object.entries(userData).filter(([key, value]) => value && !prevCv[key])
              )
            }));
          } catch (error) {
            console.log('Error en auto-completado:', error);
          }
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchCurrentCv = async (uid) => {
    try {
      const cvCollection = collection(db, "cv");
      const q = query(cvCollection, where("uid", "==", uid));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        querySnapshot.forEach((doc) => {
          const cvData = doc.data();
          setCurrentCv({ id: doc.id, ...cvData });
          setNewCv({ ...cvData, estado: "pendiente" });
        });
      }
    } catch (error) {
      showAlert.error("Error", "Error al obtener el CV actual.");
    }
  };

  // Memoizar handleChange para evitar recreaciones y pérdida de foco
  const handleChange = useCallback((e) => {
    setNewCv(prevCv => ({ ...prevCv, [e.target.name]: e.target.value }));
  }, []);

  const handleTabChange = useCallback((event, newValue) => {
    setTabValue(newValue);
  }, []);

  const handleTemplateChange = useCallback((template) => {
    setSelectedTemplate(template);
    setNewCv(prev => ({ ...prev, plantillaSeleccionada: template }));
  }, []);

  const handleImageChange = useCallback((e) => {
    handleFileChange(e, "Foto", (url) => {
      setNewCv(prevCv => ({ ...prevCv, Foto: url }));
    });
  }, [handleFileChange]);

  const handleCvChange = useCallback((e) => {
    handleFileChange(e, "cv", (url) => {
      setNewCv(prevCv => ({ ...prevCv, cv: url }));
    });
  }, [handleFileChange]);

  // Función para llenar el formulario con datos de prueba EXTENSOS
  const fillWithExtensiveTestData = useCallback(() => {
    const extensiveTestData = {
      // Datos personales
      Nombre: "Alejandro Martín",
      Apellido: "Rodríguez Fernández",
      Edad: "35",
      Email: "alejandro.rodriguez@techlead.com",
      
      // Información de contacto
      telefono: "+54 9 11 4567-8901",
      direccion: "Av. Corrientes 1234, Piso 15, Oficina 1502, Buenos Aires, Argentina",
      linkedin: "https://linkedin.com/in/alejandro-rodriguez-tech",
      sitioWeb: "https://alejandro-rodriguez.dev",
      perfilProfesional: "Tech Lead y Arquitecto de Software con más de 12 años de experiencia en desarrollo full-stack, liderazgo de equipos y arquitecturas escalables. Especializado en React, Node.js, Python, microservicios y cloud computing. Experiencia internacional trabajando con equipos distribuidos en 5 países diferentes. Certificado en AWS Solutions Architect y Google Cloud Professional. Apasionado por la innovación tecnológica, la mentoría de desarrolladores y la implementación de mejores prácticas de desarrollo ágil. Lideré la transformación digital de 3 empresas Fortune 500, resultando en mejoras de rendimiento del 300% y reducción de costos del 40%. Experto en DevOps, CI/CD, Docker, Kubernetes y metodologías ágiles como Scrum y Kanban.",
      
      // Información profesional
      categoriaGeneral: "Informática y Tecnología",
      categoriaEspecifica: "Arquitecto de Software / Tech Lead",
      
      // Ubicación
      ciudad: "Buenos Aires",
      localidad: "Centro",
      
      // Experiencias laborales EXTENSAS
      experiencias: [
        {
          id: "exp-1",
          cargo: "Senior Tech Lead & Solutions Architect",
          empresa: "GloboTech Solutions International",
          ubicacion: "Buenos Aires, Argentina (Remoto Global)",
          fechaInicio: "01/2021",
          fechaFin: "Actualidad",
          descripcion: "Liderazgo técnico de un equipo de 15 desarrolladores distribuidos en 4 países. Arquitectura y diseño de sistemas de microservicios para plataformas de e-commerce que manejan más de 1 millón de transacciones diarias. Implementación de estrategias de CI/CD que redujeron el tiempo de deployment en un 80%. Migración exitosa de monolitos legacy a arquitecturas cloud-native en AWS y Google Cloud. Colaboración estrecha con equipos de Product, Design y DevOps para definir roadmaps técnicos a largo plazo. Implementación de metodologías ágiles y establecimiento de mejores prácticas de desarrollo que aumentaron la productividad del equipo en un 150%.",
          esActual: true
        },
        {
          id: "exp-2",
          cargo: "Lead Full-Stack Developer",
          empresa: "InnovateTech Corp",
          ubicacion: "Barcelona, España",
          fechaInicio: "03/2018",
          fechaFin: "12/2020",
          descripcion: "Desarrollo de aplicaciones web complejas utilizando React, Node.js, Python y PostgreSQL. Liderazgo de un equipo de 8 desarrolladores junior y mid-level. Implementación de arquitecturas serverless con AWS Lambda y API Gateway. Desarrollo de sistemas de analytics en tiempo real procesando más de 10TB de datos diarios. Integración de servicios de machine learning para recomendaciones personalizadas que aumentaron la conversión en un 25%. Mentoría de desarrolladores y establecimiento de code review processes que redujeron bugs en producción en un 60%.",
          esActual: false
        },
        {
          id: "exp-3",
          cargo: "Senior Software Engineer",
          empresa: "FinTech Innovations Ltd",
          ubicacion: "Londres, Reino Unido",
          fechaInicio: "06/2016",
          fechaFin: "02/2018",
          descripcion: "Desarrollo de plataformas financieras críticas con altos estándares de seguridad y compliance (PCI DSS, SOX). Trabajo con tecnologías como Java Spring Boot, Angular, Redis y Oracle. Implementación de sistemas de trading algorítmico que procesan más de 100,000 órdenes por segundo. Desarrollo de APIs REST y GraphQL con documentación automática. Participación en auditorías de seguridad y establecimiento de protocolos de backup y disaster recovery. Colaboración con equipos de compliance y legal para asegurar adherencia a regulaciones financieras internacionales.",
          esActual: false
        },
        {
          id: "exp-4",
          cargo: "Full-Stack Developer",
          empresa: "StartupHub Technologies",
          ubicacion: "San Francisco, California, USA",
          fechaInicio: "09/2014",
          fechaFin: "05/2016",
          descripcion: "Desarrollo de MVP y productos desde cero utilizando Ruby on Rails, React y MongoDB. Trabajo en metodologías ágiles con sprints de 2 semanas. Implementación de sistemas de pagos con Stripe y PayPal. Desarrollo de features de analytics y dashboards para tracking de métricas de negocio. Participación en fundraising y presentaciones técnicas a inversores. Trabajo con equipos de diseño para crear interfaces de usuario intuitivas y responsivas. Manejo de escalabilidad de aplicaciones desde 0 a 100,000 usuarios activos.",
          esActual: false
        },
        {
          id: "exp-5",
          cargo: "Software Developer",
          empresa: "Digital Solutions Argentina",
          ubicacion: "Buenos Aires, Argentina",
          fechaInicio: "01/2012",
          fechaFin: "08/2014",
          descripcion: "Desarrollo de aplicaciones web para clientes corporativos utilizando PHP, MySQL, JavaScript y jQuery. Mantenimiento y optimización de sistemas legacy. Desarrollo de módulos de e-commerce con integración a gateways de pago locales. Trabajo con frameworks como Laravel y CodeIgniter. Implementación de sistemas de gestión de contenido (CMS) personalizados. Participación en proyectos de migración de datos y integración de sistemas terceros. Desarrollo de APIs para integración con sistemas ERP y CRM.",
          esActual: false
        },
        {
          id: "exp-6",
          cargo: "Junior Web Developer",
          empresa: "WebDev Studio",
          ubicacion: "Buenos Aires, Argentina",
          fechaInicio: "06/2011",
          fechaFin: "12/2011",
          descripcion: "Desarrollo de sitios web corporativos y landing pages utilizando HTML, CSS, JavaScript y PHP. Diseño responsivo y optimización para motores de búsqueda (SEO). Integración con redes sociales y herramientas de analytics. Mantenimiento de sitios web existentes y resolución de bugs. Aprendizaje de metodologías de desarrollo y herramientas de versionado con Git.",
          esActual: false
        }
      ],
      
      // Educación EXTENSA
      educacion: [
        {
          id: "edu-1",
          titulo: "Master en Ingeniería de Software",
          institucion: "Universidad de Buenos Aires - Facultad de Ingeniería",
          ubicacion: "Buenos Aires, Argentina",
          fechaInicio: "03/2010",
          fechaFin: "12/2012",
          descripcion: "Especialización en Arquitecturas de Software, Patrones de Diseño y Metodologías Ágiles. Tesis: 'Implementación de Microservicios en Plataformas de E-commerce: Análisis de Performance y Escalabilidad'. Nota final: 9.2/10. Proyecto de investigación en colaboración con IBM Argentina sobre optimización de bases de datos distribuidas."
        },
        {
          id: "edu-2",
          titulo: "Grado en Ingeniería en Sistemas",
          institucion: "Universidad Nacional de La Plata",
          ubicacion: "La Plata, Argentina",
          fechaInicio: "03/2006",
          fechaFin: "12/2009",
          descripcion: "Formación integral en desarrollo de software, bases de datos, redes de computadoras y sistemas operativos. Proyecto final: 'Sistema de Gestión Hospitalaria con Interfaz Web'. Nota media: 8.5/10. Participación en competencias de programación universitarias."
        },
        {
          id: "edu-3",
          titulo: "Certificación AWS Solutions Architect Professional",
          institucion: "Amazon Web Services",
          ubicacion: "Online",
          fechaInicio: "01/2023",
          fechaFin: "04/2023",
          descripcion: "Certificación avanzada en arquitecturas de soluciones en AWS. Dominio de servicios como EC2, S3, Lambda, RDS, CloudFormation, VPC, IAM, CloudWatch y más. Proyecto final: Diseño de arquitectura multi-región para aplicación de alto tráfico."
        },
        {
          id: "edu-4",
          titulo: "Google Cloud Professional Cloud Architect",
          institucion: "Google Cloud Platform",
          ubicacion: "Online",
          fechaInicio: "06/2022",
          fechaFin: "09/2022",
          descripcion: "Certificación en arquitecturas de soluciones en Google Cloud Platform. Especialización en Compute Engine, Cloud Storage, BigQuery, Kubernetes Engine y servicios de machine learning."
        },
        {
          id: "edu-5",
          titulo: "Certificación Certified Kubernetes Administrator (CKA)",
          institucion: "Cloud Native Computing Foundation (CNCF)",
          ubicacion: "Online",
          fechaInicio: "03/2022",
          fechaFin: "05/2022",
          descripcion: "Certificación en administración de clusters Kubernetes. Dominio de conceptos avanzados como networking, storage, security, troubleshooting y cluster maintenance."
        },
        {
          id: "edu-6",
          titulo: "Diplomado en Machine Learning y Data Science",
          institucion: "Instituto Tecnológico de Buenos Aires (ITBA)",
          ubicacion: "Buenos Aires, Argentina",
          fechaInicio: "03/2021",
          fechaFin: "11/2021",
          descripcion: "Especialización en algoritmos de machine learning, deep learning, procesamiento de big data y herramientas como Python, TensorFlow, PyTorch, Pandas y Scikit-learn. Proyecto final: Sistema de recomendaciones para e-commerce."
        }
      ],
      
      // Habilidades EXTENSAS
      habilidades: [
        { id: "skill-1", nombre: "React.js", nivel: "Experto" },
        { id: "skill-2", nombre: "Node.js", nivel: "Experto" },
        { id: "skill-3", nombre: "TypeScript", nivel: "Experto" },
        { id: "skill-4", nombre: "JavaScript (ES6+)", nivel: "Experto" },
        { id: "skill-5", nombre: "Python", nivel: "Avanzado" },
        { id: "skill-6", nombre: "Java Spring Boot", nivel: "Avanzado" },
        { id: "skill-7", nombre: "Ruby on Rails", nivel: "Avanzado" },
        { id: "skill-8", nombre: "PHP Laravel", nivel: "Avanzado" },
        { id: "skill-9", nombre: "Vue.js", nivel: "Avanzado" },
        { id: "skill-10", nombre: "Angular", nivel: "Avanzado" },
        { id: "skill-11", nombre: "Next.js", nivel: "Avanzado" },
        { id: "skill-12", nombre: "GraphQL", nivel: "Avanzado" },
        { id: "skill-13", nombre: "REST APIs", nivel: "Experto" },
        { id: "skill-14", nombre: "PostgreSQL", nivel: "Experto" },
        { id: "skill-15", nombre: "MongoDB", nivel: "Avanzado" },
        { id: "skill-16", nombre: "MySQL", nivel: "Avanzado" },
        { id: "skill-17", nombre: "Redis", nivel: "Avanzado" },
        { id: "skill-18", nombre: "AWS", nivel: "Experto" },
        { id: "skill-19", nombre: "Google Cloud", nivel: "Avanzado" },
        { id: "skill-20", nombre: "Docker", nivel: "Experto" },
        { id: "skill-21", nombre: "Kubernetes", nivel: "Avanzado" },
        { id: "skill-22", nombre: "Terraform", nivel: "Avanzado" },
        { id: "skill-23", nombre: "Jenkins", nivel: "Avanzado" },
        { id: "skill-24", nombre: "GitLab CI/CD", nivel: "Avanzado" },
        { id: "skill-25", nombre: "Git", nivel: "Experto" },
        { id: "skill-26", nombre: "CSS/SASS", nivel: "Experto" },
        { id: "skill-27", nombre: "Tailwind CSS", nivel: "Avanzado" },
        { id: "skill-28", nombre: "Webpack", nivel: "Avanzado" },
        { id: "skill-29", nombre: "Jest", nivel: "Avanzado" },
        { id: "skill-30", nombre: "Cypress", nivel: "Intermedio" },
        { id: "skill-31", nombre: "Machine Learning", nivel: "Intermedio" },
        { id: "skill-32", nombre: "TensorFlow", nivel: "Intermedio" },
        { id: "skill-33", nombre: "Pandas", nivel: "Intermedio" },
        { id: "skill-34", nombre: "Scikit-learn", nivel: "Intermedio" },
        { id: "skill-35", nombre: "Liderazgo Técnico", nivel: "Experto" },
        { id: "skill-36", nombre: "Arquitectura de Software", nivel: "Experto" },
        { id: "skill-37", nombre: "Microservicios", nivel: "Experto" },
        { id: "skill-38", nombre: "DevOps", nivel: "Avanzado" },
        { id: "skill-39", nombre: "Scrum Master", nivel: "Avanzado" },
        { id: "skill-40", nombre: "Mentoría", nivel: "Avanzado" }
      ],
      
      // Idiomas
      idiomas: [
        { id: "lang-1", idioma: "Español", nivel: "Nativo" },
        { id: "lang-2", idioma: "Inglés", nivel: "Avanzado (C1)" },
        { id: "lang-3", idioma: "Portugués", nivel: "Intermedio (B2)" },
        { id: "lang-4", idioma: "Francés", nivel: "Básico (A2)" }
      ],
      
      // Certificaciones EXTENSAS
      certificaciones: [
        {
          id: "cert-1",
          nombre: "AWS Solutions Architect Professional",
          institucion: "Amazon Web Services",
          fecha: "04/2023",
          url: "https://aws.amazon.com/certification/certified-solutions-architect-professional/"
        },
        {
          id: "cert-2",
          nombre: "Google Cloud Professional Cloud Architect",
          institucion: "Google Cloud Platform",
          fecha: "09/2022",
          url: "https://cloud.google.com/certification/cloud-architect"
        },
        {
          id: "cert-3",
          nombre: "Certified Kubernetes Administrator (CKA)",
          institucion: "Cloud Native Computing Foundation",
          fecha: "05/2022",
          url: "https://www.cncf.io/certification/cka/"
        },
        {
          id: "cert-4",
          nombre: "React Developer Certification",
          institucion: "Meta (Facebook)",
          fecha: "12/2021",
          url: "https://www.meta.com/careers/learning-programs/"
        },
        {
          id: "cert-5",
          nombre: "Node.js Application Developer",
          institucion: "OpenJS Foundation",
          fecha: "08/2021",
          url: "https://openjsf.org/certification/"
        },
        {
          id: "cert-6",
          nombre: "MongoDB Certified Developer Associate",
          institucion: "MongoDB University",
          fecha: "03/2021",
          url: "https://university.mongodb.com/certification"
        },
        {
          id: "cert-7",
          nombre: "Professional Scrum Master I",
          institucion: "Scrum.org",
          fecha: "11/2020",
          url: "https://www.scrum.org/certifications/professional-scrum-master-i"
        },
        {
          id: "cert-8",
          nombre: "Certified Information Security Manager (CISM)",
          institucion: "ISACA",
          fecha: "06/2020",
          url: "https://www.isaca.org/credentialing/cism"
        }
      ],
      
      // Proyectos EXTENSOS
      proyectos: [
        {
          id: "proj-1",
          nombre: "E-commerce Global Platform",
          descripcion: "Plataforma de comercio electrónico internacional que maneja más de 1 millón de transacciones diarias. Arquitectura de microservicios con 50+ servicios, implementada en AWS con auto-scaling, load balancing y disaster recovery. Incluye sistema de pagos multi-currency, gestión de inventarios en tiempo real, analytics avanzados y machine learning para recomendaciones personalizadas. Tecnologías: React, Node.js, Python, PostgreSQL, Redis, AWS (EC2, S3, Lambda, RDS, ElastiCache), Docker, Kubernetes.",
          tecnologias: "React, Node.js, Python, PostgreSQL, Redis, AWS, Docker, Kubernetes, Machine Learning",
          url: "https://github.com/alejandro-rodriguez/global-ecommerce-platform"
        },
        {
          id: "proj-2",
          nombre: "Real-time Analytics Dashboard",
          descripcion: "Dashboard de analytics en tiempo real para monitoreo de KPIs de negocio. Procesa más de 10TB de datos diarios usando Apache Kafka, Apache Spark y Elasticsearch. Interfaz desarrollada en React con visualizaciones interactivas usando D3.js. Implementa machine learning para detección de anomalías y predicciones de tendencias. Desplegado en Google Cloud con auto-scaling horizontal y vertical.",
          tecnologias: "React, D3.js, Python, Apache Kafka, Apache Spark, Elasticsearch, Google Cloud, TensorFlow",
          url: "https://analytics-dashboard-demo.vercel.app"
        },
        {
          id: "proj-3",
          nombre: "Microservices Banking Platform",
          descripcion: "Plataforma bancaria digital con arquitectura de microservicios que cumple con estándares PCI DSS y SOX. Incluye servicios de autenticación, transferencias, pagos, notificaciones y reporting. Implementa circuit breakers, rate limiting, encryption end-to-end y auditoría completa. Desarrollada con Java Spring Boot, React, PostgreSQL y desplegada en Kubernetes con Istio service mesh.",
          tecnologias: "Java Spring Boot, React, PostgreSQL, Kubernetes, Istio, Redis, Prometheus, Grafana",
          url: "https://github.com/alejandro-rodriguez/banking-microservices"
        },
        {
          id: "proj-4",
          nombre: "AI-Powered Code Review Assistant",
          descripcion: "Herramienta de IA que automatiza el proceso de code review usando machine learning para detectar bugs, code smells y sugerir mejoras. Integrada con GitHub, GitLab y Bitbucket. Procesa código en múltiples lenguajes (JavaScript, Python, Java, Go) y proporciona feedback en tiempo real. Implementa NLP para análisis de comentarios y documentación.",
          tecnologias: "Python, TensorFlow, React, Node.js, MongoDB, Docker, AWS Lambda, OpenAI GPT",
          url: "https://ai-code-review.herokuapp.com"
        },
        {
          id: "proj-5",
          nombre: "Distributed Task Management System",
          descripcion: "Sistema distribuido de gestión de tareas que soporta equipos de hasta 10,000 usuarios concurrentes. Implementa WebSockets para actualizaciones en tiempo real, sistema de notificaciones push, colaboración en tiempo real y versionado de documentos. Arquitectura event-driven con CQRS pattern, usando Apache Kafka para messaging y Redis para caching distribuido.",
          tecnologias: "React, Node.js, Socket.io, PostgreSQL, Redis, Apache Kafka, Docker, Kubernetes, AWS",
          url: "https://distributed-tasks.vercel.app"
        },
        {
          id: "proj-6",
          nombre: "Blockchain Supply Chain Tracker",
          descripcion: "Sistema de trazabilidad de cadena de suministro basado en blockchain (Ethereum). Permite seguimiento completo de productos desde origen hasta consumidor final. Implementa smart contracts para automatización de procesos, sistema de certificaciones y verificación de autenticidad. Frontend desarrollado en React con integración a MetaMask para transacciones.",
          tecnologias: "React, Solidity, Web3.js, Node.js, PostgreSQL, Ethereum, IPFS, Docker",
          url: "https://supply-chain-tracker.herokuapp.com"
        }
      ],
      
      // Referencias EXTENSAS
      referencias: [
        {
          id: "ref-1",
          nombre: "Dr. Sarah Chen",
          cargo: "VP of Engineering",
          empresa: "GloboTech Solutions International",
          telefono: "+1 (555) 123-4567",
          email: "sarah.chen@globotech.com"
        },
        {
          id: "ref-2",
          nombre: "Miguel Torres",
          cargo: "CTO",
          empresa: "InnovateTech Corp",
          telefono: "+34 611 234 567",
          email: "miguel.torres@innovatetech.com"
        },
        {
          id: "ref-3",
          nombre: "James Mitchell",
          cargo: "Senior Engineering Manager",
          empresa: "FinTech Innovations Ltd",
          telefono: "+44 20 7946 0958",
          email: "james.mitchell@fintechinnovations.com"
        },
        {
          id: "ref-4",
          nombre: "Elena Vasquez",
          cargo: "Product Director",
          empresa: "StartupHub Technologies",
          telefono: "+1 (415) 555-0123",
          email: "elena.vasquez@startuphub.com"
        },
        {
          id: "ref-5",
          nombre: "Roberto Silva",
          cargo: "Tech Lead",
          empresa: "Digital Solutions Argentina",
          telefono: "+54 9 11 4567-8901",
          email: "roberto.silva@digitalsolutions.com.ar"
        }
      ]
    };
    
    setNewCv(prevCv => ({
      ...prevCv,
      ...extensiveTestData
    }));
    
    showAlert.success("Datos extensos cargados", "Se han cargado datos de prueba muy extensos para probar el comportamiento del CV con mucho contenido.");
  }, []);

  // Función para llenar el formulario con datos de prueba
  const fillWithTestData = useCallback(() => {
    const testData = {
      // Datos personales
      Nombre: "Juan Carlos",
      Apellido: "González Pérez",
      Edad: "28",
      Email: "juan.gonzalez@email.com",
      
      // Información de contacto
      telefono: "+34 612 345 678",
      direccion: "Calle Mayor 123, 3º A, Madrid",
      linkedin: "https://linkedin.com/in/juancgonzalez",
      sitioWeb: "https://juan-gonzalez.dev",
      perfilProfesional: "Desarrollador Frontend con 5 años de experiencia en React, Vue.js y tecnologías web modernas. Apasionado por crear interfaces de usuario intuitivas y experiencias digitales excepcionales.",
      
      // Información profesional
      categoriaGeneral: "Informática y Tecnología",
      categoriaEspecifica: "Desarrollador Frontend",
      
      // Ubicación
      ciudad: "San Nicolás",
      localidad: "Centro",
      
      // Experiencias laborales
      experiencias: [
        {
          id: "exp-1",
          cargo: "Desarrollador Frontend Senior",
          empresa: "TechCorp Solutions",
          ubicacion: "San Nicolás, Argentina",
          fechaInicio: "01/2022",
          fechaFin: "Actualidad",
          descripcion: "Liderazgo técnico en el desarrollo de aplicaciones web con React y TypeScript. Implementación de arquitecturas escalables y mejora de rendimiento en un 40%. Colaboración con equipos de diseño y backend para entregar productos de alta calidad.",
          esActual: true
        },
        {
          id: "exp-2",
          cargo: "Desarrollador Frontend",
          empresa: "Digital Agency Pro",
          ubicacion: "Ramallo, Argentina",
          fechaInicio: "03/2020",
          fechaFin: "12/2021",
          descripcion: "Desarrollo de sitios web y aplicaciones e-commerce para clientes internacionales. Uso de Vue.js, Nuxt.js y integración con APIs REST. Trabajo en equipo ágil con metodologías Scrum.",
          esActual: false
        },
        {
          id: "exp-3",
          cargo: "Desarrollador Junior",
          empresa: "StartupTech",
          ubicacion: "San Nicolás, Argentina",
          fechaInicio: "06/2019",
          fechaFin: "02/2020",
          descripcion: "Desarrollo de componentes React reutilizables y mantenimiento de código legacy. Participación en code reviews y mejora continua de procesos de desarrollo.",
          esActual: false
        }
      ],
      
      // Educación
      educacion: [
        {
          id: "edu-1",
          titulo: "Grado en Ingeniería Informática",
          institucion: "Universidad Nacional de Rosario",
          ubicacion: "San Nicolás, Argentina",
          fechaInicio: "09/2015",
          fechaFin: "06/2019",
          descripcion: "Especialización en Ingeniería del Software. Proyecto final: Aplicación web para gestión de inventarios con React y Node.js. Nota media: 8.2"
        },
        {
          id: "edu-2",
          titulo: "Certificación AWS Cloud Practitioner",
          institucion: "Amazon Web Services",
          ubicacion: "Online",
          fechaInicio: "01/2023",
          fechaFin: "03/2023",
          descripcion: "Fundamentos de computación en la nube, servicios AWS y mejores prácticas de seguridad."
        }
      ],
      
      // Habilidades
      habilidades: [
        { id: "skill-1", nombre: "React", nivel: "Experto" },
        { id: "skill-2", nombre: "TypeScript", nivel: "Avanzado" },
        { id: "skill-3", nombre: "JavaScript", nivel: "Experto" },
        { id: "skill-4", nombre: "Vue.js", nivel: "Avanzado" },
        { id: "skill-5", nombre: "Node.js", nivel: "Intermedio" },
        { id: "skill-6", nombre: "CSS/SASS", nivel: "Avanzado" },
        { id: "skill-7", nombre: "Git", nivel: "Avanzado" },
        { id: "skill-8", nombre: "Figma", nivel: "Intermedio" },
        { id: "skill-9", nombre: "Trabajo en Equipo", nivel: "Avanzado" },
        { id: "skill-10", nombre: "Resolución de Problemas", nivel: "Avanzado" }
      ],
      
      // Idiomas
      idiomas: [
        { id: "lang-1", idioma: "Español", nivel: "Nativo" },
        { id: "lang-2", idioma: "Inglés", nivel: "Avanzado" },
        { id: "lang-3", idioma: "Francés", nivel: "Básico" }
      ],
      
      // Certificaciones
      certificaciones: [
        {
          id: "cert-1",
          nombre: "AWS Cloud Practitioner",
          institucion: "Amazon Web Services",
          fecha: "03/2023",
          url: "https://aws.amazon.com/certification/certified-cloud-practitioner/"
        },
        {
          id: "cert-2",
          nombre: "React Developer Certification",
          institucion: "Meta (Facebook)",
          fecha: "08/2022",
          url: ""
        }
      ],
      
      // Proyectos
      proyectos: [
        {
          id: "proj-1",
          nombre: "E-commerce Platform",
          descripcion: "Plataforma de comercio electrónico completa desarrollada con React, Node.js y MongoDB. Incluye sistema de pagos, gestión de inventarios y panel administrativo. Proyecto personal con más de 1000 usuarios registrados.",
          tecnologias: "React, Node.js, MongoDB, Stripe, AWS",
          url: "https://github.com/juan-gonzalez/ecommerce-platform"
        },
        {
          id: "proj-2",
          nombre: "Task Management App",
          descripcion: "Aplicación de gestión de tareas con interfaz drag-and-drop, notificaciones en tiempo real y colaboración en equipo. Desarrollada con Vue.js y Firebase.",
          tecnologias: "Vue.js, Firebase, Vuex, CSS Grid",
          url: "https://taskmanager-demo.netlify.app"
        }
      ],
      
      // Referencias
      referencias: [
        {
          id: "ref-1",
          nombre: "María Rodríguez",
          cargo: "Tech Lead",
          empresa: "TechCorp Solutions",
          telefono: "+34 611 234 567",
          email: "maria.rodriguez@techcorp.com"
        },
        {
          id: "ref-2",
          nombre: "Carlos Martín",
          cargo: "CTO",
          empresa: "Digital Agency Pro",
          telefono: "+34 622 345 678",
          email: "carlos.martin@digitalagency.com"
        }
      ]
    };
    
    setNewCv(prevCv => ({
      ...prevCv,
      ...testData
    }));
    
    showAlert.success("Datos de prueba cargados", "El formulario se ha llenado automáticamente con datos de ejemplo para pruebas.");
  }, []);

  // Función para limpiar el formulario
  const clearForm = useCallback(() => {
    setNewCv({
      // Datos actuales
      Nombre: "",
      Apellido: "",
      Edad: "",
      categoriaGeneral: "",
      categoriaEspecifica: "",
      ciudad: "",
      localidad: "",
      Email: "",
      Foto: "",
      cv: "",
      estado: "pendiente",
      versionCV: 1,
      
      // Nuevos campos expandidos
      telefono: "",
      direccion: "",
      linkedin: "",
      sitioWeb: "",
      perfilProfesional: "",
      
      // Arrays de objetos
      experiencias: [],
      educacion: [],
      habilidades: [],
      idiomas: [],
      certificaciones: [],
      proyectos: [],
      referencias: [],
      
      // Configuración de CV generado
      cvGenerado: false,
      plantillaSeleccionada: "moderna",
      cvPdfUrl: ""
    });
    
    showAlert.success("Formulario limpiado", "Todos los campos han sido limpiados.");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    // Validar formulario completo
    const mode = tabValue === 0 ? 'generator' : 'upload';
    const validation = validateForm(newCv, mode);
    
    if (!validation.isValid) {
      const errorMessages = Object.values(validation.errors).flat().join(', ');
      showAlert.error("Error de validación", `Por favor corrige los siguientes errores: ${errorMessages}`);
      return;
    }

    // Mostrar warnings si existen
    if (validation.warnings && Object.keys(validation.warnings).length > 0) {
      const warningMessages = Object.values(validation.warnings).flat().join(', ');
      showAlert.warning("Advertencias", `Ten en cuenta: ${warningMessages}`);
    }

    setIsLoading(true);
    try {
      let docRef;
      let cvPdfUrl = "";
      
      // Si es un CV generado, crear el PDF y subirlo
      if (tabValue === 0) {
        console.log("🎨 Generando CV con plantilla:", selectedTemplate);
        
        // Validar datos antes de generar
        const validation = pdfGeneratorService.validateCVData(newCv);
        if (!validation.isValid) {
          const errorMessages = validation.errors.join(', ');
          showAlert.error("Error de validación", `Por favor corrige los siguientes errores: ${errorMessages}`);
          return;
        }
        
         // Generar PDF
         const pdfDoc = await pdfGeneratorService.generateCVPdf(newCv, selectedTemplate);
         const pdfBlob = pdfGeneratorService.getPDFAsBlob(pdfDoc);
        
        // Crear archivo para subir
        const fileName = `CV_${newCv.Nombre}_${newCv.Apellido}_${selectedTemplate}.pdf`;
        const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });
        
        // Subir PDF usando el hook de subida de archivos
        console.log("📤 Subiendo PDF generado...");
        await new Promise((resolve, reject) => {
          handleFileChange(
            { target: { files: [pdfFile] } }, 
            "cv", 
            (url) => {
              cvPdfUrl = url;
              console.log("✅ PDF generado y subido:", url);
              resolve();
            }
          );
        });
      }
      
      // Preparar datos según el modo
      const finalCvUrl = tabValue === 0 ? cvPdfUrl : newCv.cv;
      
      console.log("📋 Datos del CV a guardar:", {
        modo: tabValue === 0 ? "Generado" : "Subido manualmente",
        cvUrl: finalCvUrl,
        plantilla: tabValue === 0 ? selectedTemplate : "N/A"
      });
      
      const cvData = {
        ...newCv,
        estado: "pendiente",
        uid: user.uid,
        cv: finalCvUrl, // Campo principal para compatibilidad con Dashboard
        cvGenerado: tabValue === 0, // true si es generador, false si es subida
        plantillaSeleccionada: tabValue === 0 ? selectedTemplate : null,
        cvPdfUrl: finalCvUrl, // URL del PDF (compatibilidad futura)
        fechaCreacion: new Date().toISOString(),
        versionCV: currentCv ? (currentCv.versionCV || 1) + 1 : 1
      };
      
      if (currentCv) {
        docRef = doc(db, "cv", currentCv.id);
        await setDoc(docRef, cvData, { merge: true });
      } else {
        const docSnap = await addDoc(collection(db, "cv"), cvData);
        docRef = docSnap;
      }

      // Enviar correos electrónicos
      await sendRegistrationEmails(cvData);

      const mensaje = tabValue === 0 
        ? "Tu CV profesional ha sido creado exitosamente. Está en revisión y pronto estará disponible."
        : "Tu CV ha sido enviado exitosamente. Está en revisión y pronto estará disponible.";

      await showAlert.success(
        "CV Procesado",
        mensaje
      );

      navigate("/");
      if (setIsChange) setIsChange((prev) => !prev);
      if (handleClose) handleClose();
      if (updateDashboard) updateDashboard();
    } catch (error) {
      console.error("Error al procesar el CV:", error);
      showAlert.error("Error", "Hubo un problema al procesar el CV. Inténtalo nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ 
      width: "100%", 
      maxWidth: 1200,
      mx: "auto",
      p: 3
    }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ flex: 1, textAlign: 'center' }}>
            {currentCv ? "Actualizar tu perfil y CV" : "Cargar perfil y tu CV"}
          </Typography>
          
          {/* Botones de utilidad para pruebas */}
          {!currentCv && (
            <Box sx={{ display: 'flex', gap: 2, ml: 2 }}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={fillWithTestData}
                sx={{ 
                  minWidth: 200,
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                🧪 Llenar con datos de prueba
              </Button>
              <Button
                variant="outlined"
                color="primary"
                onClick={fillWithExtensiveTestData}
                sx={{ 
                  minWidth: 280,
                  fontSize: '13px',
                  fontWeight: 'bold'
                }}
              >
                📋 CV Extenso (6 exp + 40 skills + 8 certs)
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={clearForm}
                sx={{ 
                  minWidth: 120,
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                🗑️ Limpiar
              </Button>
            </Box>
          )}
        </Box>

        {/* Sistema de Pestañas */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} centered>
            <Tab 
              label="🎨 Generar CV Profesional" 
              sx={{ 
                fontSize: '16px', 
                fontWeight: 'bold',
                textTransform: 'none'
              }} 
            />
            <Tab 
              label="📄 Subir mi propio CV" 
              sx={{ 
                fontSize: '16px', 
                fontWeight: 'bold',
                textTransform: 'none'
              }} 
            />
          </Tabs>
        </Box>

        <Box component="form" onSubmit={handleSubmit}>
          {/* Pestaña 1: Generador de CV */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ color: 'primary.main', textAlign: 'center', mr: 2 }}>
                Crea tu CV profesional paso a paso
              </Typography>
              {!currentCv && (
                <Button
                  variant="contained"
                  color="secondary"
                  size="small"
                  onClick={fillWithTestData}
                  sx={{ 
                    fontSize: '12px',
                    fontWeight: 'bold',
                    px: 2,
                    py: 0.5
                  }}
                >
                  🧪 Datos de prueba
                </Button>
              )}
            </Box>
            
            <PersonalDataForm newCv={newCv} handleChange={handleChange} />
            <Box sx={{ my: 4, height: '2px', background: 'linear-gradient(90deg, transparent, #66bb6a, transparent)', borderRadius: '1px' }} />
            
            <ProfessionalDataForm newCv={newCv} handleChange={handleChange} />
            <Box sx={{ my: 4, height: '2px', background: 'linear-gradient(90deg, transparent, #4caf50, transparent)', borderRadius: '1px' }} />
            
            <LocationForm newCv={newCv} handleChange={handleChange} />
            <Box sx={{ my: 4, height: '2px', background: 'linear-gradient(90deg, transparent, #03a9f4, transparent)', borderRadius: '1px' }} />
            
            <ExperienceForm newCv={newCv} handleChange={handleChange} />
            <Box sx={{ my: 4, height: '2px', background: 'linear-gradient(90deg, transparent, #66bb6a, transparent)', borderRadius: '1px' }} />
            
            <EducationForm newCv={newCv} handleChange={handleChange} />
            <Box sx={{ my: 4, height: '2px', background: 'linear-gradient(90deg, transparent, #2196f3, transparent)', borderRadius: '1px' }} />
            
            <SkillsForm newCv={newCv} handleChange={handleChange} />
            <Box sx={{ my: 4, height: '2px', background: 'linear-gradient(90deg, transparent, #9c27b0, transparent)', borderRadius: '1px' }} />
            
            <LanguagesForm newCv={newCv} handleChange={handleChange} />
            <Box sx={{ my: 4, height: '2px', background: 'linear-gradient(90deg, transparent, #e91e63, transparent)', borderRadius: '1px' }} />
            
            <CertificationsForm newCv={newCv} handleChange={handleChange} />
            <Box sx={{ my: 4, height: '2px', background: 'linear-gradient(90deg, transparent, #ffc107, transparent)', borderRadius: '1px' }} />
            
            <ProjectsForm newCv={newCv} handleChange={handleChange} />
            <Box sx={{ my: 4, height: '2px', background: 'linear-gradient(90deg, transparent, #3f51b5, transparent)', borderRadius: '1px' }} />
            
            <ReferencesForm newCv={newCv} handleChange={handleChange} />
            <Box sx={{ my: 4, height: '2px', background: 'linear-gradient(90deg, transparent, #689f38, transparent)', borderRadius: '1px' }} />
            
            <TemplateSelector 
              selectedTemplate={selectedTemplate} 
              onTemplateChange={handleTemplateChange} 
            />
            <Divider sx={{ my: 3 }} />
            
            {/* Solo foto de perfil para el generador */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                📸 Foto de Perfil (Opcional)
              </Typography>
              <Box sx={{ 
                border: '2px dashed #ccc', 
                borderRadius: 2, 
                p: 3, 
                textAlign: 'center',
                backgroundColor: '#f9f9f9'
              }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                  id="photo-input"
                />
                <label htmlFor="photo-input">
                  <Button
                    variant="outlined"
                    component="span"
                    sx={{ cursor: 'pointer' }}
                  >
                    Seleccionar Foto
                  </Button>
                </label>
                {loadingImage && <Typography sx={{ mt: 1 }}>Cargando...</Typography>}
              </Box>
            </Box>
            
            {!isLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
                <Button 
                  variant="outlined" 
                  size="large"
                  onClick={() => setShowPreview(true)}
                  sx={{ px: 4, py: 1.5 }}
                >
                  Vista Previa
                </Button>
                <Button 
                  variant="contained" 
                  type="submit" 
                  size="large"
                  sx={{ px: 6, py: 1.5 }}
                >
                  Generar CV Profesional
                </Button>
              </Box>
            )}
          </TabPanel>

          {/* Pestaña 2: Subida tradicional */}
          <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" sx={{ mb: 3, color: 'primary.main', textAlign: 'center' }}>
              Sube tu CV en formato PDF
            </Typography>
            
            <PersonalDataForm newCv={newCv} handleChange={handleChange} />
            <Box sx={{ my: 4, height: '2px', background: 'linear-gradient(90deg, transparent, #ff9800, transparent)', borderRadius: '1px' }} />
            
            <ProfessionalDataForm newCv={newCv} handleChange={handleChange} />
            <Box sx={{ my: 4, height: '2px', background: 'linear-gradient(90deg, transparent, #4caf50, transparent)', borderRadius: '1px' }} />
            
            <LocationForm newCv={newCv} handleChange={handleChange} />
            <Box sx={{ my: 4, height: '2px', background: 'linear-gradient(90deg, transparent, #03a9f4, transparent)', borderRadius: '1px' }} />
            
            <FilesForm
              onImageChange={handleImageChange}
              onCvChange={handleCvChange}
              loadingImage={loadingImage}
              loadingCv={loadingCv}
            />
            
            {!isLoading && isImageLoaded && isCvLoaded && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Button 
                  variant="contained" 
                  type="submit" 
                  size="large"
                  sx={{ px: 6, py: 1.5 }}
                >
                  Finalizar Carga
                </Button>
              </Box>
            )}
          </TabPanel>
        </Box>
      </Paper>

      {/* Modal de Vista Previa */}
      <CVPreview
        open={showPreview}
        onClose={() => setShowPreview(false)}
        cvData={newCv}
        selectedTemplate={selectedTemplate}
        onTemplateChange={handleTemplateChange}
      />
    </Box>
  );
};

export default CargaCv;
