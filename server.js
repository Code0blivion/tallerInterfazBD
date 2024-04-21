const express = require("express");
const app = express();
const path = require("path");
const port = 3000;
const bodyParser = require("body-parser");
const fs = require("fs").promises;
const {
  configuraciónLibreria,
  getConexion,
  consultar,
  consultar2,
  createRecord,
} = require("./database");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static("static"));

app.set("view engine", "ejs");

configuraciónLibreria();

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/index.html"));
});

app.get("/registroCandidatos", async (req, res) => {
  try {
    const conexion = await getConexion();
    const rows = await consultar(conexion, "tipodoc");
    res.render("registro_candidatos", { documentos: rows });
  } catch (error) {
    // Manejar el error aquí, puedes enviar una respuesta de error al cliente o registrar el error, según sea necesario
    res.status(500).send("Error en el servidor");
  }
});

app.post("/registroCandidatos", async (req, res) => {
  console.log(req.body);
  //Hacer operaciones de la BD...

  async function evalCandidatos() {
    flag1 = false;
    flag2 = false;
    //candidatos = await readJSON(__dirname + "/candidatos.json"); //Reemplazar por consulta de la tabla de candidatos
    const conexion = await getConexion();
    const candidatos = await consultar(conexion, "candidato");
    for (let i = 0; i < candidatos.length; i++) {
      if (candidatos[i][0] === req.body.usuario) {
        flag1 = true;
      }

      if (
        candidatos[i][5] === Number(req.body.numDoc) &&
        candidatos[i][1] === req.body.tipoDoc
      ) {
        flag2 = true;
      }

      if (flag1 === true || flag2 === true) {
        break;
      }
    }

    if (flag1 === false && flag2 === false) {
      try {
        const variable = await createRecord(
          req.body.usuario,
          req.body.nombre,
          req.body.apellido,
          req.body.fecha,
          req.body.numDoc,
          req.body.tipoDoc
        );
      } catch (err) {
        console.error("Error");
      }
      //writeJSON(__dirname + "/candidatos.json", { id: 0, ...req.body }); //Reemplazar por insert en la tabla de candidatos
    }
    res.send({ flag1: flag1, flag2: flag2 });
  }
  evalCandidatos();
});

app.get("/listaCandidatos", async (req, res) => {
  const conexion = await getConexion();
  const candidatos = await consultar2(conexion, "candidato");
  res.render("lista_candidatos", { candidatos: candidatos });
});

app.listen(port, () => {
  console.log(`Escuchando en puerto ${port}`);
});
