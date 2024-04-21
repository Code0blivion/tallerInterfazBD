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
