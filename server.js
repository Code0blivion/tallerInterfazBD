const express = require("express");
const app = express();
const path = require("path");
const port = 3000;
const bodyParser = require("body-parser");
const fs = require("fs").promises;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static("static"));

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/index.html"));
});

app.get("/registroCandidatos", (req, res) => {
  async function getDocs() {
    documentos = await readJSON(__dirname + "/documentos.json"); //Reemplazar por consulta de la tabla de tipo documento
    res.render("registro_candidatos", { documentos: documentos });
  }
  getDocs();
});

app.post("/registroCandidatos", (req, res) => {
  console.log(req.body);
  //Hacer operaciones de la BD...

  async function evalCandidatos() {
    flag1 = false;
    flag2 = false;
    candidatos = await readJSON(__dirname + "/candidatos.json"); //Reemplazar por consulta de la tabla de candidatos
    for (let i = 0; i < candidatos.length; i++) {
      if (candidatos[i].usuario === req.body.usuario) {
        flag1 = true;
      }

      if (
        candidatos[i].numDoc === req.body.numDoc &&
        candidatos[i].tipoDoc === req.body.tipoDoc
      ) {
        flag2 = true;
      }

      if (flag1 === true || flag2 === true) {
        break;
      }
    }

    if (flag1 === false && flag2 === false) {
      writeJSON(__dirname + "/candidatos.json", { id: 0, ...req.body }); //Reemplazar por insert en la tabla de candidatos
    }
    res.send({ flag1: flag1, flag2: flag2 });
  }
  evalCandidatos();
});

app.get("/listaCandidatos", (req, res) => {
  async function getCandidatos() {
    candidatos = await readJSON(__dirname + "/candidatos.json"); //Reemplazar por consulta de la tabla de candidatos
    res.render("lista_candidatos", { candidatos: candidatos });
  }
  getCandidatos();
});

app.listen(port, () => {
  console.log(`Escuchando en puerto ${port}`);
});

async function writeJSON(ruta, info) {
  let obj = await readJSON(ruta);
  obj.push(info);

  try {
    await fs.writeFile(ruta, JSON.stringify(obj));
  } catch (err) {
    console.error(err);
  }
}

async function readJSON(ruta) {
  try {
    let data = await fs.readFile(ruta, "utf8");
    let obj = JSON.parse(data);
    return obj;
  } catch (err) {
    console.error(err);
  }
}
