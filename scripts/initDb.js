import pool from '../src/config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const init = async () => {
  const sql = fs.readFileSync(path.join(__dirname, 'init.sql')).toString();
  try {
    await pool.query(sql);
    console.log('Database initialized');
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
};

init();