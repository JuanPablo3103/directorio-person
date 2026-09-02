// Definición de rutas de los catálogos del sistema.
// Solo declara las rutas y las enlaza con su controlador; no contiene lógica.
// Todas son de solo lectura: no se declara ningún POST, PUT ni DELETE.

const express = require('express');
const catalogosController = require('../controllers/catalogos.controller');

const router = express.Router();

// GET /api/catalogos/tipos-telefono -> Person.PhoneNumberType
router.get('/tipos-telefono', catalogosController.listarTiposTelefono);

// GET /api/catalogos/tipos-direccion -> Person.AddressType
router.get('/tipos-direccion', catalogosController.listarTiposDireccion);

// GET /api/catalogos/paises -> Person.CountryRegion
router.get('/paises', catalogosController.listarPaises);

// GET /api/catalogos/estados -> Person.StateProvince (filtro opcional ?pais=US)
router.get('/estados', catalogosController.listarEstados);

module.exports = router;
