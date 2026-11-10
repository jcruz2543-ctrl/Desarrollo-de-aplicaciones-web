/* ==========================================================
   Calculadora Web — lógica
   Sin eval(): el estado se maneja con una clase.
   ========================================================== */

const MAX_DIGITOS = 15;

class Calculadora {
  constructor(previaEl, actualEl) {
    this.previaEl = previaEl;
    this.actualEl = actualEl;
    this.limpiar();
  }

  /* ---------- Estado ---------- */
  limpiar() {
    this.actual = "0";      // número que se está escribiendo (texto)
    this.previo = "";       // primer operando guardado
    this.operador = null;   // + − × ÷
    this.historial = "";    // texto de la última operación
    this.reiniciar = false; // true: el siguiente dígito empieza un número nuevo
    this.error = "";        // mensaje de error, si lo hay
    this.actualizarPantalla();
  }

  /* ---------- Entrada de datos ---------- */
  agregarNumero(n) {
    if (this.error) this.limpiar();
    if (this.reiniciar) {
      this.actual = "0";
      this.reiniciar = false;
      this.historial = this.operador ? this.historial : "";
    }
    if (this.actual === "0") this.actual = n;
    else if (this.actual === "-0") this.actual = "-" + n;
    else if (this.actual.replace(/[-.]/g, "").length < MAX_DIGITOS) this.actual += n;
    this.actualizarPantalla();
  }

  agregarPunto() {
    if (this.error) this.limpiar();
    if (this.reiniciar) {
      this.actual = "0";
      this.reiniciar = false;
    }
    if (!this.actual.includes(".")) this.actual += ".";
    this.actualizarPantalla();
  }

  borrar() {
    if (this.error) return this.limpiar();
    if (this.reiniciar) return;
    const sinSigno = this.actual.replace("-", "");
    this.actual = sinSigno.length > 1 ? this.actual.slice(0, -1) : "0";
    this.actualizarPantalla();
  }

  cambiarSigno() {
    if (this.error) return;
    if (parseFloat(this.actual) === 0 && !this.actual.includes(".")) return;
    this.actual = this.actual.startsWith("-") ? this.actual.slice(1) : "-" + this.actual;
    this.actualizarPantalla();
  }

  porcentaje() {
    if (this.error) return;
    this.actual = this.redondear(parseFloat(this.actual) / 100);
    this.reiniciar = true;
    this.actualizarPantalla();
  }

  /* ---------- Operaciones ---------- */
  elegirOperador(op) {
    if (this.error) return;
    // Si ya había un operador y aún no se escribió el 2.º número, solo se cambia
    if (this.operador && this.reiniciar) {
      this.operador = op;
      this.actualizarPantalla();
      return;
    }
    // Encadenar: 2 + 3 + → calcula 5 y sigue
    if (this.operador && !this.calcular(true)) return;

    this.previo = this.actual;
    this.operador = op;
    this.reiniciar = true;
    this.actualizarPantalla();
  }

  calcular(encadenado = false) {
    if (this.error) return false;
    if (!this.operador) return false;

    const a = parseFloat(this.previo);
    const b = parseFloat(this.actual);
    let r;

    switch (this.operador) {
      case "+": r = a + b; break;
      case "−": r = a - b; break;
      case "×": r = a * b; break;
      case "÷":
        if (b === 0) {
          this.error = "No se puede dividir entre 0";
          this.previo = "";
          this.operador = null;
          this.historial = "";
          this.actualizarPantalla();
          return false;
        }
        r = a / b;
        break;
    }

    if (!encadenado) {
      this.historial = `${this.formatear(this.previo)} ${this.operador} ${this.formatear(this.actual)} =`;
      this.previo = "";
      this.operador = null;
    }
    this.actual = this.redondear(r);
    this.reiniciar = true;
    this.actualizarPantalla();
    return true;
  }

  /* ---------- Utilidades ---------- */
  // Evita errores de coma flotante (0.1 + 0.2 → 0.3)
  redondear(n) {
    if (!isFinite(n)) {
      this.error = "Resultado fuera de rango";
      return "0";
    }
    return String(parseFloat(n.toPrecision(12)));
  }

  // Agrega separador de miles sin perder el punto decimal que se está escribiendo
  formatear(texto) {
    if (texto.includes("e")) return texto; // notación científica
    const [entero, decimal] = texto.split(".");
    const negativo = entero.startsWith("-");
    const digitos = entero.replace("-", "");
    const conMiles = digitos.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return (negativo ? "-" : "") + conMiles + (decimal !== undefined ? "." + decimal : "");
  }

  actualizarPantalla() {
    if (!this.actualEl) return; // permite probar la clase sin DOM
    const texto = this.error || this.formatear(this.actual);
    this.actualEl.textContent = texto;
    this.actualEl.classList.toggle("error", Boolean(this.error));
    this.actualEl.classList.toggle("largo", !this.error && texto.length > 9 && texto.length <= 13);
    this.actualEl.classList.toggle("muy-largo", !this.error && texto.length > 13);

    if (this.operador) {
      this.previaEl.textContent = `${this.formatear(this.previo)} ${this.operador}`;
    } else {
      this.previaEl.textContent = this.historial;
    }

    // Resalta el operador activo
    document.querySelectorAll("[data-operador]").forEach((b) => {
      b.classList.toggle("activo", b.dataset.operador === this.operador && this.reiniciar);
    });
  }
}

/* ==========================================================
   Conexión con la interfaz (solo en el navegador)
   ========================================================== */
if (typeof document !== "undefined") {
  const calc = new Calculadora(
    document.getElementById("previa"),
    document.getElementById("actual")
  );

  // Clics del mouse / toques
  document.querySelector(".teclado").addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    if (btn.dataset.numero !== undefined) return calc.agregarNumero(btn.dataset.numero);
    if (btn.dataset.operador) return calc.elegirOperador(btn.dataset.operador);

    switch (btn.dataset.accion) {
      case "limpiar":    calc.limpiar(); break;
      case "borrar":     calc.borrar(); break;
      case "porcentaje": calc.porcentaje(); break;
      case "signo":      calc.cambiarSigno(); break;
      case "punto":      calc.agregarPunto(); break;
      case "igual":      calc.calcular(); break;
    }
  });

  // Soporte de teclado
  const mapaOperadores = { "+": "+", "-": "−", "*": "×", "/": "÷" };

  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    if (/^[0-9]$/.test(e.key)) calc.agregarNumero(e.key);
    else if (e.key === "." || e.key === ",") calc.agregarPunto();
    else if (mapaOperadores[e.key]) {
      e.preventDefault(); // evita la búsqueda rápida de Firefox con "/"
      calc.elegirOperador(mapaOperadores[e.key]);
    }
    else if (e.key === "Enter" || e.key === "=") {
      e.preventDefault(); // evita "reclicar" el botón enfocado
      calc.calcular();
    }
    else if (e.key === "Backspace") calc.borrar();
    else if (e.key === "Escape") calc.limpiar();
    else if (e.key === "%") calc.porcentaje();
  });
}

// Exportar para pruebas con Node
if (typeof module !== "undefined") module.exports = Calculadora;
