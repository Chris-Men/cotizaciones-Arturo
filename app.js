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
  let contador = parseInt(localStorage.getItem("contadorCotizacion")) || 1;
  contador++;
  localStorage.setItem("contadorCotizacion", contador);
  actualizarVisualizacionContador(contador);
  return contador;
}

function actualizarVisualizacionContador(contador) {
  const contadorFormateado = contador.toString().padStart(4, "0");
  document.getElementById("numero-cotizacion").textContent = contadorFormateado;
}

function calcularTotalFila(fila) {
  const cantidad = parseFloat(fila.querySelector("td:nth-child(1) input").value) || 0;
  const unidad = parseFloat(fila.querySelector("td:nth-child(3) input").value) || 0;
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

function actualizarFecha() {
  const fechaInput = document.getElementById("fecha");
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");
  fechaInput.value = `${anio}-${mes}-${dia}`;
}

document.addEventListener("DOMContentLoaded", actualizarFecha);

function mostrarModalConfirmacion() {
  const modal = document.getElementById("confirmModal");
  const modalTitle = modal.querySelector(".modal-title");
  const modalText = modal.querySelector(".modal-text");
  const btnConfirmar = document.getElementById("btnConfirmar");
  const btnCancelar = document.getElementById("btnCancelar");

  if (!logoLoaded) {
    modalTitle.textContent = "Advertencia";
    modalText.textContent = "Debe seleccionar un logo antes de generar el PDF.";
    btnConfirmar.textContent = "Aceptar";
    btnCancelar.style.display = "none";
  } else {
    modalTitle.textContent = "Confirmación";
    modalText.textContent = "¿Desea descargar la cotización en formato PDF?";
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
  incrementarContadorCotizacion();

  const elementosAEliminar = [
    document.getElementById("logo-input"),
    document.getElementById("firma-input"),
    document.getElementById("btnPDF"),
    document.getElementById("confirmModal"),
    document.getElementById("logo-placeholder"),
    document.getElementById("firma-placeholder")
  ];

  // Ocultar los elementos antes de generar el PDF
  elementosAEliminar.forEach((el) => {
    if (el) el.style.display = "none";
  });

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
      // Restaurar los elementos después del PDF
      elementosAEliminar.forEach((el) => {
        if (el) el.style.display = "";
      });

      ocultarModalConfirmacion();
      setTimeout(mostrarMensajeExito, 500);
    })
    .catch((error) => {
      console.error("Error al generar el PDF:", error);
      alert("Ocurrió un error al generar el PDF: " + error.message);

      elementosAEliminar.forEach((el) => {
        if (el) el.style.display = "";
      });

      ocultarModalConfirmacion();
    });
}

window.onload = function () {
  actualizarFecha();
  inicializarContadorCotizacion();

  document.getElementById("logo-input").addEventListener("change", handleLogoUpload);

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

  document.getElementById("btnPDF").addEventListener("click", mostrarModalConfirmacion);

  document.getElementById("btnConfirmar").addEventListener("click", function () {
    if (logoLoaded) {
      generarPDF();
    } else {
      ocultarModalConfirmacion();
    }
  });

  document.getElementById("btnCancelar").addEventListener("click", ocultarModalConfirmacion);
};
