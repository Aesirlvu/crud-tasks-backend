import { connectDB } from "../config/db.js";

// Creamos y exportamos la funcion getTasks que se encargará de obtener todas las tareas de la base de datos.
export const getTasks = async (req, res) => {
  const connection = await connectDB();
  const query = `SELECT * FROM tasks`;
  const [result] = await connection.query(query);

  if (!result.length) {
    res.status(404).send("No hay tareas registradas.");
  }

  res.status(200).json(result);
};

// Obtenemos una tarea por su id y la exportamos, ejecutando la consulta en la base de datos.
export const getOneTask = async (req, res) => {
  const connection = await connectDB();
  const { id } = req.params;

  const query = `
  SELECT * FROM tasks
  WHERE id = ?`;

  const [result] = await connection.query(query, [id]);
  console.log(result);

  if (!result.length) {
    return res.status(404).send("No se encontró la tarea");
  }

  res.status(200).json(result);
};

// la función createTask valida los campos isComplete, title y description, y luego inserta la tarea en la base de datos.
export const createTask = async (req, res) => {
  const connection = await connectDB();
  const { title, description, isComplete } = req.body;

  if (isComplete !== 0 && isComplete !== 1) {
    return res.status(400).send("El campo isComplete solo puede ser 0 o 1");
  }

  const query = `
    INSERT INTO tasks (title, description, isComplete)
    VALUES (?, ?, ?)`;

  const checkQuery = `
    SELECT * FROM tasks
    WHERE title = ?
    AND description = ?
    AND isComplete = ?`;

  const [checkTask] = await connection.query(checkQuery, [
    title,
    description,
    isComplete,
  ]);

  if (checkTask.length) {
    return res.status(400).send("La tarea ya existe");
  }

  await connection.query(query, [title, description, isComplete]);
  res.status(201).send("Tarea creada.");
};

// updateTask actualiza una tarea por su id, validando el campo isComplete y luego actualizando el registro en la base de datos.
export const updateTask = async (req, res) => {
  const connection = await connectDB();
  const { id } = req.params;
  const { title, description, isComplete } = req.body;

  if (isComplete !== 0 && isComplete !== 1) {
    return res.status(400).send("El campo isComplete solo puede ser 0 o 1");
  }

  const query = `
    SELECT title, description, isComplete 
    FROM tasks 
    WHERE id = ?
    `;

  const updateQuery = `
    UPDATE tasks
    SET title = ?, description = ?, isComplete = ?
    WHERE id = ?`;

  const [checkTask] = await connection.query(query, [id]);

  if (checkTask.length) {
    return res.status(400).send("La tarea ya existe");
  }

  if (!checkTask.length) {
    return res
      .status(404)
      .send("No se puede actualizar, no se encuentra el registro.");
  }

  await connection.query(updateQuery, [title, description, isComplete, id]);
  res.status(200).send("Registro actualizado con éxito.");
};

// deleteTask elimina una tarea por su id, validando si existe el registro y luego eliminándolo de la base de datos.
export const deleteTask = async (req, res) => {
  const connection = await connectDB();

  const { id } = req.params;

  const querySelect = `
  SELECT * FROM tasks
  WHERE id = ?`;

  const queryDelete = `
  DELETE FROM tasks
  WHERE id = ?
  `;

  const [checkTask] = await connection.query(querySelect, [id]);

  if (!checkTask.length) {
    return res
      .status(404)
      .send("No se puede eliminar, no se encuentra el registro.");
  }

  await connection.query(queryDelete, [id]);
  res.status(200).send("Tarea eliminada.");
};
