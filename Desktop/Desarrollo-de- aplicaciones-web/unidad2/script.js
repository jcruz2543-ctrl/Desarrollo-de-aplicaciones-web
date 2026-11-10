/* =====================================
   CALCULADORA CRUZ FAJARDO
   Motor de operaciones matemáticas
===================================== */

const pantalla = document.getElementById("actual");
const previa = document.getElementById("previa");
const teclado = document.querySelector(".teclado");

let actual = "0";
let anterior = null;
let operador = null;
let reiniciar = false;
let operacionTerminada = false;

// Mostrar números en pantalla
function actualizarPantalla() {
    pantalla.textContent = actual;
}

// Formatear números
function formatearNumero(numero) {
    if (!Number.isFinite(numero)) {
        throw new Error("Operación no válida");
    }

    const limpio = Number(numero.toPrecision(12));

    return String(limpio);
}

// Introducir números
function introducirNumero(numero) {

    if (reiniciar || actual === "Error") {
        actual = numero;
        reiniciar = false;
        operacionTerminada = false;
    } else if (actual.replace("-", "").length < 15) {

        if (actual === "0") {
            actual = numero;
        } else {
            actual += numero;
        }
    }

    actualizarPantalla();
}

// Introducir punto decimal
function introducirPunto() {

    if (reiniciar || actual === "Error") {
        actual = "0.";
        reiniciar = false;
        operacionTerminada = false;
    } else if (!actual.includes(".")) {
        actual += ".";
    }

    actualizarPantalla();
}

// Ejecutar operaciones
function calcular(a, b, op) {

    switch (op) {

        case "+":
            return a + b;

        case "−":
            return a - b;

        case "×":
            return a * b;

        case "÷":
            if (b === 0) {
                throw new Error("División por cero");
            }
            return a / b;

        default:
            return b;
    }
}

// Seleccionar operador
function seleccionarOperador(nuevoOperador) {

    if (actual === "Error") return;

    const valor = Number(actual);

    if (operador && anterior !== null && !reiniciar) {

        try {
            const resultado = calcular(
                anterior,
                valor,
                operador
            );

            actual = formatearNumero(resultado);
            actualizarPantalla();

            anterior = Number(actual);

        } catch (error) {
            mostrarError(error.message);
            return;
        }

    } else {
        anterior = valor;
    }

    operador = nuevoOperador;

    previa.textContent =
        `${actual} ${nuevoOperador}`;

    reiniciar = true;
    operacionTerminada = false;
}

// Obtener resultado
function obtenerResultado() {

    if (operador === null || anterior === null || reiniciar) {
        return;
    }

    const segundoNumero = Number(actual);

    const expresion =
        `${anterior} ${operador} ${segundoNumero}`;

    try {

        const resultado = calcular(
            anterior,
            segundoNumero,
            operador
        );

        actual = formatearNumero(resultado);

        previa.textContent = `${expresion} =`;

        anterior = null;
        operador = null;
        reiniciar = true;
        operacionTerminada = true;

        actualizarPantalla();

    } catch (error) {

        mostrarError(error.message);

    }
}

// Porcentaje
function porcentaje() {

    if (actual === "Error") return;

    const valor = Number(actual);

    actual = formatearNumero(valor / 100);

    actualizarPantalla();

    reiniciar = false;
}

// Cambiar signo
function cambiarSigno() {

    if (actual === "Error" || Number(actual) === 0) return;

    actual = actual.startsWith("-")
        ? actual.substring(1)
        : "-" + actual;

    actualizarPantalla();
}

// Borrar último dígito
function borrar() {

    if (actual === "Error" || reiniciar) {
        actual = "0";
        reiniciar = false;
    } else if (actual.length > 1) {

        actual = actual.slice(0, -1);

        if (actual === "-") {
            actual = "0";
        }

    } else {
        actual = "0";
    }

    actualizarPantalla();
}

// Limpiar calculadora
function limpiar() {

    actual = "0";
    anterior = null;
    operador = null;
    reiniciar = false;
    operacionTerminada = false;

    previa.textContent = "Bienvenido";

    actualizarPantalla();
}

// Mostrar errores
function mostrarError(mensaje) {

    actual = "Error";
    previa.textContent = mensaje;

    anterior = null;
    operador = null;
    reiniciar = true;

    actualizarPantalla();
}

// Procesar acciones
function ejecutarAccion(accion) {

    switch (accion) {

        case "limpiar":
            limpiar();
            break;

        case "borrar":
            borrar();
            break;

        case "porcentaje":
            porcentaje();
            break;

        case "signo":
            cambiarSigno();
            break;

        case "punto":
            introducirPunto();
            break;

        case "igual":
            obtenerResultado();
            break;
    }
}

// Eventos del teclado visual
teclado.addEventListener("click", (evento) => {

    const boton = evento.target.closest("button");

    if (!boton) return;

    if (boton.dataset.numero !== undefined) {
        introducirNumero(boton.dataset.numero);
        return;
    }

    if (boton.dataset.operador) {
        seleccionarOperador(boton.dataset.operador);
        return;
    }

    if (boton.dataset.accion) {
        ejecutarAccion(boton.dataset.accion);
    }

});

// Compatibilidad con teclado físico
document.addEventListener("keydown", (evento) => {

    const tecla = evento.key;

    if (/^[0-9]$/.test(tecla)) {
        introducirNumero(tecla);
        return;
    }

    switch (tecla) {

        case ".":
        case ",":
            introducirPunto();
            break;

        case "+":
            seleccionarOperador("+");
            break;

        case "-":
            seleccionarOperador("−");
            break;

        case "*":
        case "x":
        case "X":
            seleccionarOperador("×");
            break;

        case "/":
            evento.preventDefault();
            seleccionarOperador("÷");
            break;

        case "Enter":
        case "=":
            evento.preventDefault();
            obtenerResultado();
            break;

        case "Backspace":
            borrar();
            break;

        case "Escape":
            limpiar();
            break;

        case "%":
            porcentaje();
            break;
    }

});

// Inicialización
actualizarPantalla();