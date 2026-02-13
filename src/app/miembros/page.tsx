import { readdir } from "node:fs/promises";
import path from "node:path";
import { MemberDashboard, type MemberDashboardCourseCatalog } from "@/components/members/MemberDashboard";

async function getDashboardBackgroundImage() {
  const directory = path.join(process.cwd(), "public", "img");
  try {
    const entries = await readdir(directory, { withFileTypes: true });
    const files = entries
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter((name) => /\.(png|jpe?g|webp|avif)$/i.test(name))
      .sort()
      .reverse();

    return files.length > 0 ? `/img/${files[0]}` : null;
  } catch {
    return null;
  }
}

async function getCourseLogos() {
  const directory = path.join(process.cwd(), "public", "img", "cursos");
  try {
    const entries = await readdir(directory, { withFileTypes: true });
    const files = entries
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter((name) => /\.(png|jpe?g|webp|avif)$/i.test(name));

    const map: Record<string, string> = {};
    for (const file of files) {
      const base = file.replace(/\.[^.]+$/, "");
      map[base.replace(/[^a-z0-9]/gi, "").toUpperCase()] = `/img/cursos/${file}`;
    }

    return map;
  } catch {
    return {} as Record<string, string>;
  }
}

export default async function MiembrosPage() {
  const bgSrc = await getDashboardBackgroundImage();
  const courseLogos = await getCourseLogos();

  const courseCatalog: MemberDashboardCourseCatalog = {
    "C.B.I": "CURSO BASICO DE INFANTERIA",
    "C.A.I": "CURSO AVANZADO DE INFANTERÍA",
    "C.O.S": "CURSO DE ORIENTACION Y SUPERVIVIVENCIA",
    "C.L": "CURSO DE LIDERAZGO",
    "C.R.L": "CURSO DE RADIO LARGA",
    "C.M.C": "CURSO DE MEDICO DE COMBATE",
    "C.A.C": "CURSO DE AMETRALLADOR DE COMBATE",
    "C.P.C": "CURSO DE PARACAIDISTA DE COMBATE",
    "C.C.E": "CURSO DE CONDUCTOR ESPECIALIZADO",
    "C.A.T": "CURSO DE ANTITANQUE Y ANTIAEREO",
    "C.I.C": "CURSO DE INGENIERO DE COMBATE",
    "C.E.E": "CURSO DE EXPERTO EN EXPLOSIVOS",
    "C.O.U": "CURSO DE OPERACIONES URBANAS",
    "C.T.S": "CURSO DE TIRADOR SELECTO (SHARPSHOTER)",
    "C.A.P": "CURSO DE AMETRALLADOR PESADO",
    "C.G.C": "CURSO DE GRANADERO DE COMBATE",
    "C.T.D": "CURSO DE TIRADOR DESIGNADO",
    "C.O.B": "CURSO BÁSICO DE OBSERVADOR",
    "C.O.A": "CURSO OBSERVADOR AVANZADO",
    "C.F.E.C": "CURSO FUERZA ESPECIAL CERBERUS",
    "C.R.A": "CURSO DE AVANCE Y REPLIEGUE",
    "C.M.O": "CURSO DE MORTERISTA",
    "C.A.T.P": "CURSO DE ANTITANQUE Y ANTIAEREO PESADO",
    "C.R.R": "CURSO DE RESCATE DE REHENES",
    "C.L.T": "CURSO DE LIDERAZGO TACTICO",
    "C.L.E": "CURSO DE LIDERAZGO ESTRATEGICO",
    "C.L.E.II": "CURSO DE LIDERAZGO ESTRATEGICO 2",
    "C.L.C": "CURSO DE LIDERAZGO CONJUNTO",
  };

  const member = {
    nombre: "Sgt. Alvarez",
    rango: "Sargento",
    rangoImg: "/img/Rangos/SSG.png",
    insigniaAlt: "Insignia de Sargento",
    division: "División Fenix",
    cursosAprobados: ["C.B.I", "C.T.D", "C.M.C", "C.R.L"],
    asistencias: {
      misiones: 12,
      entrenamientos: 8,
    },
    escudoImg: "/brand/logo2.png",
  };

  return (
    <MemberDashboard
      bgSrc={bgSrc}
      member={member}
      courseCatalog={courseCatalog}
      courseLogos={courseLogos}
    />
  );
}
