// src/modules/recepcion/pages/ConsentimientosPage.jsx
// Consentimientos Informados — recibe paciente por prop desde EditarPacientePage
// 3 formatos: Sueroterapia | Enfermería General | Procedimientos Invasivos

import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
} from "@mui/material";
import {
  Print,
  AssignmentInd,
  MedicalServices,
  Vaccines,
  LocalHospital,
} from "@mui/icons-material";

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const logoUrl = "/clinica-farma/CLINICA300.png";

const HEADER_HTML = `
  <div style="display:flex;align-items:center;justify-content:space-between;
    margin-bottom:14px;padding-bottom:10px;border-bottom:3px solid #e65c00;">
    <img src="${logoUrl}" style="height:58px;" />
    <div style="text-align:right;">
      <div style="font-size:15px;font-weight:900;color:#333;text-transform:uppercase;">
        DINAMAX CENTRO MÉDICO SRL
      </div>
      <div style="font-size:10px;color:#555;margin-top:2px;">
        Sistema de Gestión Clínica
      </div>
    </div>
  </div>
`;

const BASE_STYLE = `
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: Arial, sans-serif; font-size:11.5px; padding:28px 32px; max-width:740px; color:#111; }
  h2 { font-size:13px; font-weight:900; text-transform:uppercase; text-align:center;
       letter-spacing:.5px; margin-bottom:4px; color:#003366; }
  h3 { font-size:12px; font-weight:900; text-transform:uppercase; text-align:center;
       color:#555; margin-bottom:16px; }
  .section { margin:12px 0 8px; font-size:11px; font-weight:700; text-transform:uppercase;
             background:#f0f0f0; padding:4px 8px; border-left:3px solid #e65c00; }
  ul { margin:4px 0 0 18px; }
  ul li { margin-bottom:3px; line-height:1.6; }
  .field-line { border-bottom:1px solid #aaa; display:inline-block; min-width:200px; margin-left:4px; }
  .field-line-sm { border-bottom:1px solid #aaa; display:inline-block; min-width:100px; margin-left:4px; }
  .sign-grid { display:grid; grid-template-columns:1fr 1fr; gap:24px; margin-top:28px; }
  .sign-box { border-top:1.5px solid #333; padding-top:6px; font-size:11px; text-align:center; line-height:2; }
  .sign-box p { font-weight:700; margin-bottom:2px; }
  p { line-height:1.8; margin:4px 0; }
  .divider { border-top:2px solid #333; margin:14px 0; }
  @page { margin:10mm; }
  @media print { button { display:none!important; } }
`;

const PRINT_BUTTON = `
  <br/>
  <button onclick="window.print()" style="width:100%;padding:10px;background:#003366;
    color:white;border:none;border-radius:4px;cursor:pointer;font-size:13px;
    font-weight:bold;margin-top:8px;">
    🖨️ Imprimir Consentimiento
  </button>
`;

const calcularEdad = (fechaNac) => {
  if (!fechaNac) return "";
  try {
    const hoy = new Date();
    const nac = new Date(fechaNac);
    if (nac.getFullYear() === 1850) return "";
    let edad = hoy.getFullYear() - nac.getFullYear();
    const m = hoy.getMonth() - nac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
    return edad > 0 ? String(edad) : "";
  } catch { return ""; }
};

// ─── IMPRESIÓN: SUEROTERAPIA ──────────────────────────────────────────────────
function imprimirSueroterapia({ nombre, ci, edad }) {
  const w = window.open("", "_blank", "width=820,height=960");
  const ahora = new Date();
  const fecha = ahora.toLocaleDateString("es-BO", { day: "2-digit", month: "2-digit", year: "numeric" });
  const hora  = ahora.toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit" });

  w.document.write(`<html><head><title>Consentimiento Sueroterapia</title>
  <style>${BASE_STYLE}</style></head><body>
  ${HEADER_HTML}
  <h2>Consentimiento Informado</h2>
  <h3>Administración de Suero Terapia</h3>

  <p style="margin-bottom:8px;">
    <strong>Fecha:</strong> ${fecha} &nbsp;&nbsp;&nbsp;&nbsp; <strong>Hora:</strong> ${hora}
  </p>
  <p><strong>Nombre:</strong> <span class="field-line">${nombre}</span></p>
  <p>
    <strong>Edad:</strong> <span class="field-line-sm">${edad}</span>
    &nbsp;&nbsp;<strong>C.I.:</strong> <span class="field-line-sm">${ci}</span>
  </p>

  <div class="divider"></div>

  <div class="section">I. Información del Procedimiento</div>
  <p>Yo, <span class="field-line" style="min-width:280px;">${nombre}</span>,
    autorizo al personal de salud del <strong>CENTRO MÉDICO DINAMAX</strong> a realizar la
    administración de sueroterapia endovenosa (nutrientes, vitaminas, minerales).
    He sido informado/a de que:
  </p>
  <ul>
    <li><strong>Objetivo:</strong> Mejorar el estado de salud, energía o hidratación.</li>
    <li><strong>Procedimiento:</strong> Se canalizará una vía venosa periférica (brazo/mano) para infundir la solución.</li>
    <li><strong>Duración:</strong> Aproximadamente <span class="field-line-sm"></span> minutos.</li>
  </ul>

  <div class="section">II. Posibles Riesgos y Complicaciones</div>
  <p>Comprendo que, aunque es un procedimiento seguro, pueden ocurrir riesgos, incluyendo:</p>
  <ul>
    <li>Dolor, hematoma (moratón) o inflamación en el sitio de punción (flebitis).</li>
    <li>Mareos, sensación de calor.</li>
    <li>Reacciones alérgicas a los componentes (poco frecuente).</li>
    <li>Infección (muy raro).</li>
  </ul>

  <div class="section">III. Declaración del Paciente</div>
  <ul>
    <li>He informado al personal médico sobre mis alergias, medicamentos actuales, enfermedades crónicas (corazón, riñón) y si estoy embarazada o amamantando.</li>
    <li>He tenido la oportunidad de hacer preguntas y todas han sido contestadas.</li>
  </ul>

  <div class="sign-grid">
    <div class="sign-box">
      <p>Firma del Paciente</p>
      <p>Nombre: ________________________</p>
      <p>C.I.: ___________________________</p>
    </div>
    <div class="sign-box">
      <p>Firma y Sello del Profesional en Salud</p>
      <p>Nombre: ________________________</p>
      <p>C.I.: ___________________________</p>
    </div>
  </div>
  ${PRINT_BUTTON}
  </body></html>`);
  w.document.close(); w.focus();
  setTimeout(() => w.print(), 300);
}

// ─── IMPRESIÓN: ENFERMERÍA GENERAL ────────────────────────────────────────────
function imprimirEnfermeria({ nombre, ci, edad, telefono }) {
  const w = window.open("", "_blank", "width=820,height=960");
  const ahora = new Date();
  const fecha = ahora.toLocaleDateString("es-BO", { day: "2-digit", month: "2-digit", year: "numeric" });
  const hora  = ahora.toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit" });

  w.document.write(`<html><head><title>Consentimiento Enfermería</title>
  <style>${BASE_STYLE}</style></head><body>
  ${HEADER_HTML}
  <h2>Consentimiento Informado</h2>
  <h3>DINAMAX Centro Médico SRL</h3>

  <p>Yo, <span class="field-line" style="min-width:260px;">${nombre}</span>
    con C.I. Nº <span class="field-line-sm">${ci}</span>
    declaro que he sido informado/a de manera clara y comprensible sobre el procedimiento
    de enfermería que se me realizará (o a mi representado).
  </p>

  <div class="section">Procedimiento a Realizar</div>
  <p>El personal de salud me ha explicado:</p>
  <ul>
    <li>La naturaleza del procedimiento.</li>
    <li>Los beneficios esperados.</li>
    <li>Los posibles riesgos o molestias que podrían presentarse.</li>
    <li>Que puedo realizar preguntas y que estas han sido respondidas satisfactoriamente.</li>
  </ul>
  <p style="margin-top:6px;">Asimismo, entiendo que:</p>
  <ul>
    <li>El procedimiento será realizado por personal de enfermería capacitado.</li>
    <li>En caso de presentarse alguna reacción o complicación se tomarán las medidas médicas correspondientes.</li>
    <li>Puedo retirar mi consentimiento en cualquier momento antes del procedimiento.</li>
  </ul>
  <p style="margin-top:6px;font-weight:700;">
    Por lo tanto, AUTORIZO voluntariamente al personal del DINAMAX Centro Médico SRL a realizar el procedimiento mencionado.
  </p>

  <div class="section">Datos del Paciente</div>
  <p>
    <strong>Nombre:</strong> <span class="field-line">${nombre}</span>
    &nbsp;&nbsp;<strong>Edad:</strong> <span class="field-line-sm">${edad}</span>
    &nbsp;&nbsp;<strong>Teléfono:</strong> <span class="field-line-sm">${telefono}</span>
  </p>

  <div class="sign-grid">
    <div class="sign-box">
      <p>Firma del Paciente o Tutor</p>
      <p>Nombre: ________________________</p>
      <p>C.I.: ___________________________</p>
      <p>Fecha: _____ / _____ / _______</p>
      <p>Hora: _________________</p>
    </div>
    <div class="sign-box">
      <p>Personal de Salud Responsable</p>
      <p>Nombre: ________________________</p>
      <p>Firma: _________________________</p>
      <p>Sello: _________________________</p>
    </div>
  </div>
  ${PRINT_BUTTON}
  </body></html>`);
  w.document.close(); w.focus();
  setTimeout(() => w.print(), 300);
}

// ─── IMPRESIÓN: PROCEDIMIENTOS INVASIVOS ─────────────────────────────────────
function imprimirInvasivo({ nombre, ci, edad, telefono }) {
  const w = window.open("", "_blank", "width=820,height=960");
  const ahora = new Date();
  const fecha = ahora.toLocaleDateString("es-BO", { day: "2-digit", month: "2-digit", year: "numeric" });
  const hora  = ahora.toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit" });

  w.document.write(`<html><head><title>Consentimiento Procedimiento Invasivo</title>
  <style>${BASE_STYLE}</style></head><body>
  ${HEADER_HTML}
  <h2>Consentimiento Informado para Procedimientos Invasivos</h2>
  <h3>DINAMAX Centro Médico SRL</h3>

  <p>Yo, <span class="field-line" style="min-width:260px;">${nombre}</span>
    con Cédula de Identidad Nº <span class="field-line-sm">${ci}</span>
    declaro que he sido informado/a de manera clara, suficiente y comprensible por el personal de
    salud del <strong>DINAMAX Centro Médico SRL</strong> acerca del procedimiento invasivo que se me realizará.
  </p>

  <div class="section">1. Procedimiento a Realizar</div>
  <p style="min-height:36px;">&nbsp;</p>

  <div class="section">2. Información Recibida</div>
  <p>Se me ha explicado:</p>
  <ul>
    <li>La naturaleza y finalidad del procedimiento.</li>
    <li>Los beneficios esperados.</li>
    <li>Los posibles riesgos, molestias o complicaciones que podrían presentarse.</li>
    <li>Las alternativas disponibles, en caso de existir.</li>
    <li>Las consecuencias de no realizar el procedimiento.</li>
  </ul>
  <p style="margin-top:6px;">Entiendo que, aunque el personal médico y de enfermería tomará todas las medidas necesarias para realizar el procedimiento de manera segura, no se pueden garantizar resultados absolutos ni la ausencia total de riesgos.</p>

  <div class="section">3. Riesgos Posibles</div>
  <ul>
    <li>Dolor o molestias durante o después del procedimiento.</li>
    <li>Sangrado.</li>
    <li>Infección.</li>
    <li>Reacción a medicamentos o anestesia.</li>
    <li>Inflamación o hematomas.</li>
    <li>Otras complicaciones poco frecuentes.</li>
  </ul>

  <div class="section">4. Autorización</div>
  <p>Habiendo comprendido la información proporcionada y habiendo tenido la oportunidad de realizar
    preguntas, <strong>AUTORIZO</strong> de manera libre y voluntaria al personal de salud del
    DINAMAX Centro Médico SRL a realizar el procedimiento descrito.
  </p>
  <p style="margin-top:4px;">Asimismo, autorizo que se realicen procedimientos adicionales necesarios
    en caso de presentarse alguna complicación durante la atención.</p>

  <div class="section">Datos del Paciente</div>
  <p>
    <strong>Nombre:</strong> <span class="field-line">${nombre}</span>
    &nbsp;&nbsp;<strong>Edad:</strong> <span class="field-line-sm">${edad}</span>
  </p>
  <p><strong>Teléfono:</strong> <span class="field-line">${telefono}</span></p>

  <div class="sign-grid">
    <div class="sign-box">
      <p>Firma del Paciente o Representante Legal</p>
      <p>Nombre: ________________________</p>
      <p>C.I.: ___________________________</p>
      <p>Fecha: _____ / _____ / _______</p>
      <p>Hora: _________________</p>
    </div>
    <div class="sign-box">
      <p>Profesional Responsable</p>
      <p>Nombre: ________________________</p>
      <p>Cargo: _________________________</p>
      <p>Firma: _________________________</p>
      <p>Sello profesional: ______________</p>
    </div>
  </div>
  ${PRINT_BUTTON}
  </body></html>`);
  w.document.close(); w.focus();
  setTimeout(() => w.print(), 300);
}

// ─── CARD DE CONSENTIMIENTO ───────────────────────────────────────────────────
function ConsentimientoCard({ titulo, descripcion, icon, color, bgColor, onImprimir }) {
  return (
    <Card sx={{
      borderRadius: 2,
      border: `1px solid ${bgColor}`,
      boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
      bgcolor: "white",
      transition: "box-shadow .15s",
      "&:hover": { boxShadow: "0 3px 12px rgba(0,0,0,0.13)" },
    }}>
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
          <Box sx={{
            width: 40, height: 40, borderRadius: 2,
            bgcolor: bgColor, display: "flex", alignItems: "center",
            justifyContent: "center", flexShrink: 0,
          }}>
            {React.cloneElement(icon, { sx: { color, fontSize: 20 } })}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" fontWeight={700} color="#111827" sx={{ mb: 0.5 }}>
              {titulo}
            </Typography>
            <Typography variant="caption" color="#6b7280" sx={{ lineHeight: 1.5, display: "block" }}>
              {descripcion}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Print />}
            onClick={onImprimir}
            sx={{
              bgcolor: color,
              "&:hover": { filter: "brightness(0.9)", bgcolor: color },
              borderRadius: 1.5, fontWeight: 700, textTransform: "none",
              boxShadow: "none", flexShrink: 0, alignSelf: "center",
              fontSize: "0.78rem", px: 1.5,
            }}
          >
            Imprimir
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function ConsentimientosPage({ paciente = null }) {
  const datosImpresion = paciente
    ? {
        nombre: paciente.nombreCompletoPaciente || "",
        ci: paciente.numeroDocumento || "",
        edad: calcularEdad(paciente.fechaNacimiento),
        telefono: paciente.telefonoCelular || paciente.telefono || "",
      }
    : { nombre: "", ci: "", edad: "", telefono: "" };

  return (
    <Box>
      {/* Paciente activo */}
      {paciente ? (
        <Box sx={{
          mb: 2.5, p: 1.5, bgcolor: "#f0fdf4",
          borderRadius: 1.5, border: "1px solid #bbf7d0",
          display: "flex", alignItems: "center", gap: 1.5,
        }}>
          <AssignmentInd sx={{ color: "#16a34a", fontSize: 20 }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" fontWeight={700} color="#15803d">
              {paciente.nombreCompletoPaciente}
            </Typography>
            <Typography variant="caption" color="#16a34a">
              CI: {paciente.numeroDocumento}
              {datosImpresion.edad && ` · ${datosImpresion.edad} años`}
              {datosImpresion.telefono && ` · ${datosImpresion.telefono}`}
            </Typography>
          </Box>
          <Chip
            label="Datos pre-llenados ✓"
            size="small"
            sx={{ bgcolor: "#dcfce7", color: "#15803d", fontWeight: 700, fontSize: 10 }}
          />
        </Box>
      ) : (
        <Typography variant="caption" color="#9ca3af" sx={{ mb: 2, display: "block" }}>
          Sin paciente — los campos de nombre se imprimirán en blanco.
        </Typography>
      )}

      {/* Formatos */}
      <Typography variant="caption" fontWeight={700} color="#6b7280"
        sx={{ textTransform: "uppercase", fontSize: 10, mb: 1.5, display: "block", letterSpacing: .5 }}>
        Seleccione el formato a imprimir
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        <ConsentimientoCard
          titulo="Sueroterapia"
          descripcion="Administración de suero terapia endovenosa (nutrientes, vitaminas, minerales). Incluye riesgos y declaración del paciente."
          icon={<Vaccines />}
          color="#0369a1"
          bgColor="#e0f2fe"
          onImprimir={() => imprimirSueroterapia(datosImpresion)}
        />
        <ConsentimientoCard
          titulo="Procedimiento de Enfermería"
          descripcion="Consentimiento general para procedimientos de enfermería. Incluye naturaleza, beneficios, riesgos y autorización al personal de DINAMAX."
          icon={<MedicalServices />}
          color="#065f46"
          bgColor="#d1fae5"
          onImprimir={() => imprimirEnfermeria(datosImpresion)}
        />
        <ConsentimientoCard
          titulo="Procedimiento Invasivo"
          descripcion="Para procedimientos que requieren consentimiento detallado: naturaleza, beneficios, riesgos (sangrado, infección, anestesia) y autorización plena."
          icon={<LocalHospital />}
          color="#7c3aed"
          bgColor="#ede9fe"
          onImprimir={() => imprimirInvasivo(datosImpresion)}
        />
      </Box>

      <Typography variant="caption" color="#9ca3af" sx={{ mt: 1.5, display: "block" }}>
        Cada consentimiento se abre en una nueva ventana lista para imprimir y firmar.
      </Typography>
    </Box>
  );
}