require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { sequelize } = require('./model');

const app = express();

const PORT = process.env.PORT || 3000;

// ===============================
// Middleware
// ===============================

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ===============================
// Health Check
// ===============================

app.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'expense-management-api',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// ===============================
// API Routes
// ===============================

app.use('/api', routes);

// ===============================
// Error Handling
// ===============================

app.use(notFound);
app.use(errorHandler);

// ===============================
// Start Server
// ===============================

(async () => {
  try {
    // Test MySQL connection
    await sequelize.authenticate();
    console.log('✅ MySQL connection established.');

    // Create/synchronize database tables
    // Set DB_SYNC_ALTER=true only in development
    await sequelize.sync({
      alter: process.env.DB_SYNC_ALTER === 'true',
    });

    console.log('✅ Sequelize models synchronized.');

    // Start Express server
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`   Health check: http://localhost:${PORT}/health`);
    });

    // ===============================
    // Graceful Shutdown
    // ===============================

    const shutdown = async (signal) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);

      server.close(async () => {
        try {
          await sequelize.close();
          console.log('💤 Server & DB connection closed.');
          process.exit(0);
        } catch (error) {
          console.error('❌ Error while closing database:', error);
          process.exit(1);
        }
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('❌ Unable to start the server:', error);
    process.exit(1);
  }
})();
