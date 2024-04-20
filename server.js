const express = require("express");
const app = express();
const path = require("path");
const port = 3000;
const bodyParser = require("body-parser");
const fs = require("fs").promises;
const oracle = require('oracledb');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static("static"));

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/index.html"));
});

app.get("/registroCandidatos", async (req, res) => {
 

  try {
    const conexion = await getConexion();
    const rows = await consultar(conexion,'tipodoc');
    console.log(rows)
    console.log(conexion)
    res.render("registro_candidatos", { documentos: rows });
  } catch (error) {
    // Manejar el error aquí, puedes enviar una respuesta de error al cliente o registrar el error, según sea necesario
    res.status(500).send("Error en el servidor");
  }
});

async function getConexion() {
  try {
    con = await run();
    return con;
  } catch (err) {
    console.error("Error connecting to database:", err);
    throw err; // Es importante lanzar el error para que la función que llama pueda manejarlo
  }
}

async function consultar(con,tabla) {
  try {
    const result = await con.execute(`SELECT * FROM ${tabla}`);
    const rows = result.rows;
    console.log(result)
    return rows;
  } catch (err) {
    console.error("Error reading records:", err);
    throw err; // Lanzar el error para manejarlo en la llamada a esta función
  }
}
async function consultar2(con,tabla) {
  try {
    const result = await con.execute(`SELECT usuario,idtipodoc_candidato,nombre,apellido,TO_CHAR(fechanac,'DAY "de" MONTH "de" YYYY'),ndoc FROM ${tabla}`);
    const rows = result.rows;
    console.log(result)
    return rows;
  } catch (err) {
    console.error("Error reading records:", err);
    throw err; // Lanzar el error para manejarlo en la llamada a esta función
  }
}

async function createRecord(usuario, nombre, apellido, fecha, numDoc, tipoDoc) {
  let conexion;
  try {
    // Obtener la conexión a la base de datos
    conexion = await getConexion();

    // Realizar la inserción con enlaces de nombres
    const result = await conexion.execute(
      `INSERT INTO candidato (usuario,IDTIPODOC_CANDIDATO, nombre, apellido, fechanac, ndoc) VALUES (:usuario,:tipoDoc, :nombre, :apellido, TO_DATE(:fecha,'YYYY-MM-DD'), :numDoc)`,
      { usuario, nombre, apellido, fecha, numDoc, tipoDoc }
    );

    console.log("Registro creado:", result);

    // Commit de la transacción
    await conexion.commit();
  } catch (err) {
    console.error("Error al crear el registro:", err);
    // Si hay un error, se debe hacer rollback de la transacción para evitar inconsistencias en la base de datos
    if (conexion) {
      await conexion.rollback();
    }
    throw err; // Lanzar el error para que pueda ser manejado por el código que llama a esta función
  } finally {
    // Cerrar la conexión después de usarla
    if (conexion) {
      conexion.close();
    }
  }
}



app.post("/registroCandidatos", async (req, res) => {
  console.log(req.body);
  //Hacer operaciones de la BD...


 
  async function evalCandidatos() {
    flag1 = false;
    flag2 = false;
    //candidatos = await readJSON(__dirname + "/candidatos.json"); //Reemplazar por consulta de la tabla de candidatos
    const conexion = await getConexion();
    const candidatos = await consultar(conexion,'candidato');
    for (let i = 0; i < candidatos.length; i++) {
      if (candidatos[i][0] === req.body.usuario) {
        flag1 = true;
      }

      if (
        candidatos[i][5] === req.body.numDoc &&
        candidatos[i][1] === req.body.tipoDoc
      ) {
        flag2 = true;
      }

      if (flag1 === true || flag2 === true) {
        break;
      }
    }

    if (flag1 === false && flag2 === false) {
      try {const variable = await createRecord(req.body.usuario,req.body.nombre,req.body.apellido, req.body.fecha,req.body.numDoc,req.body.tipoDoc)
      }catch(err){
        console.error('Error')
      }
      //writeJSON(__dirname + "/candidatos.json", { id: 0, ...req.body }); //Reemplazar por insert en la tabla de candidatos
    }
    res.send({ flag1: flag1, flag2: flag2 });
  }
  evalCandidatos();
});

app.get("/listaCandidatos", async (req, res) => {
  const conexion = await getConexion();
    const candidatos = await consultar2(conexion,'candidato');
  res.render("lista_candidatos", { candidatos: candidatos });

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



let clientOpts = {};
if (process.platform === 'win32') {
  // Windows
  // If you use backslashes in the libDir string, you will
  // need to double them.
  clientOpts = { libDir: 'C:\\oracle\\instantclient_21_13' };
} else if (process.platform === 'darwin' && process.arch === 'x64') {
  // macOS Intel
  clientOpts = { libDir: process.env.HOME + '/Downloads/instantclient_21_13' };
}
// else on other platforms like Linux the system library search path MUST always be
// set before Node.js is started, for example with ldconfig or LD_LIBRARY_PATH.

// enable node-oracledb Thick mode
oracle.initOracleClient(clientOpts);

async function run(){
    let con;

    try{

        con = await oracle.getConnection({
            user: "candidato",
            password: "candidato",
            connectString: "localhost/xe"
        });

        console.log('Conexión exitosa');
        return con

        
    }catch(err){
        console.log('Error al crear la conexión', err);
    }  
}
async function cerrarConexion(){
  if(con){
    try{
        await con.close();
        console.log('Se cerro la conexion exitosamente');
    }catch(err2){
        console.log('No se pudo cerrar la conexion',err2);
    }
}
}