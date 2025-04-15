
let logoLoaded = false;

function inicializarContadorCotizacion() {
  let contador = localStorage.getItem("contadorCotizacion");
  if (!contador) {
    contador = 1;
    localStorage.setItem("contadorCotizacion", contador);
  }
  actualizarVisualizacionContador(parseInt(contador));
}

function incrementarContadorCotizacion() {
  let contador =
    parseInt(localStorage.getItem("contadorCotizacion")) || 1;
  contador++;
  localStorage.setItem("contadorCotizacion", contador);
  actualizarVisualizacionContador(contador);
  return contador;
}

function actualizarVisualizacionContador(contador) {
  const contadorFormateado = contador.toString().padStart(4, "0");
  document.getElementById("numero-cotizacion").textContent =
    contadorFormateado;
}

function calcularTotalFila(fila) {
  const cantidad =
    parseFloat(fila.querySelector("td:nth-child(1) input").value) || 0;
  const unidad =
    parseFloat(fila.querySelector("td:nth-child(3) input").value) || 0;
  const totalInput = fila.querySelector("td:nth-child(4) input");
  const total = cantidad * unidad;
  totalInput.value = total.toFixed(2);
  return total;
}

function calcularTotales() {
  const filas = document.querySelectorAll("#detalle tr");
  let subtotal = 0;
  filas.forEach((fila) => {
    const total = calcularTotalFila(fila);
    subtotal += total;
  });
  const iva = subtotal * 0.13;
  const total = subtotal + iva;
  document.getElementById("subtotal").textContent = subtotal.toFixed(2);
  document.getElementById("iva").textContent = iva.toFixed(2);
  document.getElementById("total").textContent = total.toFixed(2);
}

function obtenerIncrementoKm() {
  const esKm = document.getElementById("chkKm").checked;
  const esMillas = document.getElementById("chkMillas").checked;
  if (esKm) return 5000;
  if (esMillas) return 3100;
  return 0;
}

function calcularProximoMotor() {
  if (
    !document.getElementById("chkKm").checked &&
    !document.getElementById("chkMillas").checked
  ) {
    document.getElementById("motor_proximo").value = "";
    return;
  }
  const incremento = obtenerIncrementoKm();
  const motorActualStr = document.getElementById("motor_actual").value;
  if (!motorActualStr.trim()) {
    document.getElementById("motor_proximo").value = "";
    return;
  }
  const motorActual = parseFloat(motorActualStr.replace(/,/g, "")) || 0;
  const resultado = motorActual + incremento;
  document.getElementById("motor_proximo").value =
    resultado.toLocaleString();
}

function calcularProximoCaja() {
  if (
    !document.getElementById("chkKm").checked &&
    !document.getElementById("chkMillas").checked
  ) {
    document.getElementById("caja_proximo").value = "";
    return;
  }
  const incremento = obtenerIncrementoKm();
  const cajaActualStr = document.getElementById("caja_actual").value;
  if (!cajaActualStr.trim()) {
    document.getElementById("caja_proximo").value = "";
    return;
  }
  const cajaActual = parseFloat(cajaActualStr.replace(/,/g, "")) || 0;
  const resultado = cajaActual + incremento;
  document.getElementById("caja_proximo").value =
    resultado.toLocaleString();
}

function actualizarFecha() {
  const fechaInput = document.getElementById("fecha");
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");
  // Establecer el valor en formato YYYY-MM-DD
  fechaInput.value = `${anio}-${mes}-${dia}`;
}

// Llamar a la función al cargar la página
document.addEventListener("DOMContentLoaded", actualizarFecha);

function mostrarModalConfirmacion() {
  const modal = document.getElementById("confirmModal");
  const modalTitle = modal.querySelector(".modal-title");
  const modalText = modal.querySelector(".modal-text");
  const btnConfirmar = document.getElementById("btnConfirmar");
  const btnCancelar = document.getElementById("btnCancelar");

  if (!logoLoaded) {
    modalTitle.textContent = "Advertencia";
    modalText.textContent =
      "Debe seleccionar un logo antes de generar el PDF.";
    btnConfirmar.textContent = "Aceptar";
    btnCancelar.style.display = "none";
  } else {
    modalTitle.textContent = "Confirmación";
    modalText.textContent =
      "¿Desea descargar la cotización en formato PDF?";
    btnConfirmar.textContent = "Confirmar";
    btnCancelar.style.display = "inline-block";
  }

  modal.style.display = "flex";
}

function ocultarModalConfirmacion() {
  document.getElementById("confirmModal").style.display = "none";
}

function mostrarMensajeExito() {
  const modal = document.getElementById("confirmModal");
  const modalTitle = modal.querySelector(".modal-title");
  const modalText = modal.querySelector(".modal-text");
  const btnConfirmar = document.getElementById("btnConfirmar");
  const btnCancelar = document.getElementById("btnCancelar");

  modalTitle.textContent = "¡Éxito!";
  modalText.textContent = "El PDF se ha descargado correctamente.";
  btnConfirmar.textContent = "Aceptar";
  btnCancelar.style.display = "none";

  modal.style.display = "flex";
  setTimeout(ocultarModalConfirmacion, 2000);
}

function handleLogoUpload(event) {
  const logoImg = document.getElementById("logo-img");
  const logoPlaceholder = document.getElementById("logo-placeholder");
  const file = event.target.files[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      logoImg.src = e.target.result;
      logoImg.style.display = "block";
      logoPlaceholder.style.display = "none";
      logoLoaded = true;
    };
    reader.readAsDataURL(file);
  }
}

function generarPDF() {
  calcularTotales();
  calcularProximoMotor();
  calcularProximoCaja();
  incrementarContadorCotizacion();
  document.getElementById("logo-input").style.display = "none";

  const element = document.getElementById("cotizacion");
  const opt = {
    margin: [0.3, 0.3, 0.3, 0.3],
    filename: "cotizacion_taller_arturo.pdf",
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: true,
      scrollY: 0,
      allowTaint: true,
      backgroundColor: "#FFFFFF",
    },
    jsPDF: {
      unit: "in",
      format: "letter",
      orientation: "portrait",
      compress: true,
    },
    pagebreak: { mode: "avoid-all" },
  };

  html2pdf()
    .from(element)
    .set(opt)
    .save()
    .then(() => {
      document.getElementById("logo-input").style.display = "block";
      ocultarModalConfirmacion();
      setTimeout(mostrarMensajeExito, 500);
    })
    .catch((error) => {
      console.error("Error al generar el PDF:", error);
      alert("Ocurrió un error al generar el PDF: " + error.message);
      document.getElementById("logo-input").style.display = "block";
      ocultarModalConfirmacion();
    });
}

window.onload = function () {
  actualizarFecha();
  inicializarContadorCotizacion();

  document
    .getElementById("logo-input")
    .addEventListener("change", handleLogoUpload);

  const detalle = document.getElementById("detalle");
  for (let i = 0; i < 15; i++) {
    const tr = document.createElement("tr");
    const cantidadTd = document.createElement("td");
    const descripcionTd = document.createElement("td");
    const unidadTd = document.createElement("td");
    const totalTd = document.createElement("td");

    const cantidadInput = document.createElement("input");
    cantidadInput.type = "number";
    cantidadInput.style.textAlign = "center";
    cantidadInput.addEventListener("input", calcularTotales);

    const descripcionInput = document.createElement("input");
    descripcionInput.type = "text";

    const unidadInput = document.createElement("input");
    unidadInput.type = "number";
    unidadInput.style.textAlign = "center";
    unidadInput.addEventListener("input", calcularTotales);

    const totalInput = document.createElement("input");
    totalInput.type = "number";
    totalInput.readOnly = true;
    totalInput.style.textAlign = "center";

    cantidadTd.appendChild(cantidadInput);
    descripcionTd.appendChild(descripcionInput);
    unidadTd.appendChild(unidadInput);
    totalTd.appendChild(totalInput);

    tr.appendChild(cantidadTd);
    tr.appendChild(descripcionTd);
    tr.appendChild(unidadTd);
    tr.appendChild(totalTd);
    detalle.appendChild(tr);
  }

  document
    .getElementById("btnPDF")
    .addEventListener("click", mostrarModalConfirmacion);
  document
    .getElementById("btnConfirmar")
    .addEventListener("click", function () {
      if (logoLoaded) {
        generarPDF();
      } else {
        ocultarModalConfirmacion();
      }
    });
  document
    .getElementById("btnCancelar")
    .addEventListener("click", ocultarModalConfirmacion);

  document
    .getElementById("chkKm")
    .addEventListener("change", function () {
      if (this.checked)
        document.getElementById("chkMillas").checked = false;
      calcularProximoMotor();
      calcularProximoCaja();
    });

  document
    .getElementById("chkMillas")
    .addEventListener("change", function () {
      if (this.checked) document.getElementById("chkKm").checked = false;
      calcularProximoMotor();
      calcularProximoCaja();
    });
};
