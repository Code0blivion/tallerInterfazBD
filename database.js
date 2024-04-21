const oracle = require("oracledb");

async function run() {
  try {
    let con = await oracle.getConnection({
      user: "candidato",
      password: "candidato",
      connectString: "localhost/xe",
    });

    console.log("Conexión exitosa");
    return con;
  } catch (err) {
    console.log("Error al crear la conexión", err);
  }
}

async function getConexion() {
  try {
    con = await run();
    return con;
  } catch (err) {
    console.error("Error connecting to database:", err);
    throw err; // Es importante lanzar el error para que la función que llama pueda manejarlo
  }
}

async function consultar(con, tabla) {
  try {
    const result = await con.execute(`SELECT * FROM ${tabla}`);
    const rows = result.rows;
    console.log(result);
    return rows;
  } catch (err) {
    console.error("Error reading records:", err);
    throw err; // Lanzar el error para manejarlo en la llamada a esta función
  } finally {
    if (con) {
      con.close();
    }
  }
}
async function consultar2(con, tabla) {
  try {
    const result = await con.execute(
      `SELECT usuario,idtipodoc_candidato,nombre,apellido,TO_CHAR(fechanac,'DAY "de" MONTH "de" YYYY'),ndoc FROM ${tabla}`
    );
    const rows = result.rows;
    console.log(result);
    return rows;
  } catch (err) {
    console.error("Error reading records:", err);
    throw err; // Lanzar el error para manejarlo en la llamada a esta función
  } finally {
    if (con) {
      con.close();
    }
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

module.exports = {
  getConexion,
  consultar,
  consultar2,
  createRecord,
};
