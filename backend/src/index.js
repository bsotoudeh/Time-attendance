import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { router as authRouter } from './routes/auth.js';
import { router as attendanceRouter } from './routes/attendance.js';
import { runMigrations } from './db/migrate.js';
import { router as leaveRouter } from './routes/leaveRequests.js';
import { scheduleMissingAttendanceJob } from './jobs/missingAttendance.js';
import { authenticateJwt } from './middleware/auth.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const apiPrefix = '/api';
app.use(`${apiPrefix}/auth`, authRouter);
app.use(`${apiPrefix}/attendance`, authenticateJwt, attendanceRouter);
app.use(`${apiPrefix}/leaves`, authenticateJwt, leaveRouter);

app.get(`${apiPrefix}/health`, (req, res) => res.json({ ok: true }));

const port = process.env.PORT || 4000;
runMigrations().then(() => {
  app.listen(port, () => {
    console.log(`Backend listening on port ${port}`);
    scheduleMissingAttendanceJob();
  });
}).catch(err => {
  console.error('Failed to run migrations', err);
  process.exit(1);
});