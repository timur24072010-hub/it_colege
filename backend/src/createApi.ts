import express, { Request, Response } from 'express';
import { supabase } from './supabase';
import cors from 'cors';

const TABLES = [
  'groups',
  'profiles',
  'subjects',
  'lessons',
  'grades',
  'attendance',
  'homework',
  'homework_completion',
  'parent_students',
];

function registerCrudRoutes(app: express.Express, table: string) {
  const basePath = `/${table}`;

  // GET /table
  app.get(basePath, async (req: Request, res: Response) => {
    try {
      let query = supabase.from(table).select('*');

      for (const [key, value] of Object.entries(req.query)) {
        query = query.eq(key, value as string);
      }

      const { data, error } = await query;

      if (error) throw error;

      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET /table/:id
  app.get(`${basePath}/:id`, async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('id', req.params.id)
        .single();

      if (error) throw error;

      res.json(data);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  });

  // POST /table
  app.post(basePath, async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase
        .from(table)
        .insert(req.body)
        .select()
        .single();

      if (error) throw error;

      res.status(201).json(data);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // PATCH /table/:id
  app.patch(`${basePath}/:id`, async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase
        .from(table)
        .update(req.body)
        .eq('id', req.params.id)
        .select()
        .single();

      if (error) throw error;

      res.json(data);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // DELETE /table/:id
  app.delete(`${basePath}/:id`, async (req: Request, res: Response) => {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', req.params.id);

      if (error) throw error;

      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });
}

const createApi = () => {
  const app = express();

  // CORS
  app.use(cors());

  // JSON
  app.use(express.json());

  // CRUD routes
  TABLES.forEach((table) => registerCrudRoutes(app, table));

  // Главная страница API
  app.get('/', (_req: Request, res: Response) => {
    res.send(
      'Diary API is running. Available tables: ' + TABLES.join(', ')
    );
  });

  return app;
};

export default createApi;