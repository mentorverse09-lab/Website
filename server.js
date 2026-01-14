// MentorVerse Backend Server
// File: server.js

const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'mentorverse',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_this';

// =============================================
// AUTHENTICATION MIDDLEWARE
// =============================================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Admin check middleware
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// =============================================
// AUTHENTICATION ROUTES
// =============================================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { full_name, email, password, college_name, branch, year, mobile } = req.body;

    // Validate input
    if (!full_name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user exists
    const [existing] = await pool.query('SELECT user_id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await pool.query(
      'INSERT INTO users (full_name, email, password_hash, college_name, branch, year, mobile) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [full_name, email, password_hash, college_name, branch, year, mobile]
    );

    // Create user settings
    await pool.query('INSERT INTO user_settings (user_id) VALUES (?)', [result.insertId]);

    res.status(201).json({ message: 'Registration successful', user_id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Get user
    const [users] = await pool.query(
      'SELECT user_id, full_name, email, password_hash, role, is_active FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];

    if (Number(user.is_active) !== 1) {
  return res.status(403).json({ error: 'Account is inactive' });
}


    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { user_id: user.user_id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// =============================================
// USER ROUTES
// =============================================

// Get user profile
app.get('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT user_id, full_name, email, college_name, branch, year, profile_pic, mobile, created_at FROM users WHERE user_id = ?',
      [req.user.user_id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
app.put('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    const { full_name, college_name, branch, year, mobile } = req.body;

    await pool.query(
      'UPDATE users SET full_name = ?, college_name = ?, branch = ?, year = ?, mobile = ?, updated_at = NOW() WHERE user_id = ?',
      [full_name, college_name, branch, year, mobile, req.user.user_id]
    );

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get user dashboard data
app.get('/api/users/dashboard', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user_id;

    const [enrollments] = await pool.query(
      'SELECT ce.*, c.title, c.thumbnail FROM course_enrollments ce JOIN courses c ON ce.course_id = c.course_id WHERE ce.user_id = ? AND ce.status = "active"',
      [userId]
    );

    const [applications] = await pool.query(
      'SELECT ia.*, i.title FROM internship_applications ia JOIN internship i ON ia.internship_id = i.internship_id WHERE ia.user_id = ? ORDER BY ia.applied_at DESC LIMIT 5',
      [userId]
    );

    const [registrations] = await pool.query(
      'SELECT wr.*, w.title, w.webinar_date FROM webinar_registrations wr JOIN webinars w ON wr.webinar_id = w.webinar_id WHERE wr.user_id = ? ORDER BY w.webinar_date DESC',
      [userId]
    );

    const [certificates] = await pool.query(
      'SELECT * FROM certificates WHERE user_id = ? ORDER BY issue_date DESC',
      [userId]
    );

    res.json({
      enrollments,
      applications,
      registrations,
      certificates
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// =============================================
// COURSES ROUTES
// =============================================

// Get all courses
app.get('/api/courses', async (req, res) => {
  try {
    const [courses] = await pool.query(
      'SELECT * FROM courses WHERE status = "active" ORDER BY created_at DESC'
    );
    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Get single course
app.get('/api/courses/:id', async (req, res) => {
  try {
    const [courses] = await pool.query('SELECT * FROM courses WHERE course_id = ?', [req.params.id]);
    if (courses.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json(courses[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch course' });
  }
});

// Enroll in course
app.post('/api/courses/:id/enroll', authenticateToken, async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.user.user_id;

    // Check if already enrolled
    const [existing] = await pool.query(
      'SELECT * FROM course_enrollments WHERE user_id = ? AND course_id = ?',
      [userId, courseId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Already enrolled in this course' });
    }

    await pool.query(
      'INSERT INTO course_enrollments (user_id, course_id) VALUES (?, ?)',
      [userId, courseId]
    );

    res.json({ message: 'Enrolled successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Enrollment failed' });
  }
});

// =============================================
// internship ROUTES
// =============================================

// Get all internship
app.get('/api/internship', async (req, res) => {
  try {
    const [internship] = await pool.query(
      'SELECT * FROM internship WHERE status = "active" ORDER BY created_at DESC'
    );
    res.json(internship);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch internship' });
  }
});

// Apply for internship
app.post('/api/internship/:id/apply', authenticateToken, upload.single('resume'), async (req, res) => {
  try {
    const { full_name, email, mobile, college_name, branch, year, why_internship } = req.body;
    const resume_path = req.file ? req.file.path : null;

    await pool.query(
      'INSERT INTO internship_applications (user_id, internship_id, full_name, email, mobile, college_name, branch, year, resume_path, why_internship) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [req.user.user_id, req.params.id, full_name, email, mobile, college_name, branch, year, resume_path, why_internship]
    );

    res.json({ message: 'Application submitted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Application failed' });
  }
});

// =============================================
// WEBINARS ROUTES
// =============================================

// Get all webinars
app.get('/api/webinars', async (req, res) => {
  try {
    const [webinars] = await pool.query(
      'SELECT * FROM webinars WHERE status IN ("scheduled", "ongoing") ORDER BY webinar_date ASC'
    );
    res.json(webinars);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch webinars' });
  }
});

// Register for webinar
app.post('/api/webinars/:id/register', authenticateToken, async (req, res) => {
  try {
    const { full_name, email, mobile, college_name, branch, year } = req.body;

    await pool.query(
      'INSERT INTO webinar_registrations (user_id, webinar_id, full_name, email, mobile, college_name, branch, year) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [req.user.user_id, req.params.id, full_name, email, mobile, college_name, branch, year]
    );

    res.json({ message: 'Registration successful' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Already registered for this webinar' });
    }
    console.error(error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// =============================================
// contact us ROUTES
// =============================================

// Submit contact us message
app.post('/api/contact us', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const ip_address = req.ip;

    await pool.query(
      'INSERT INTO contact us_messages (name, email, message, ip_address) VALUES (?, ?, ?, ?)',
      [name, email, message, ip_address]
    );

    res.json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// =============================================
// CERTIFICATES ROUTES
// =============================================

// Get user certificates
app.get('/api/certificates', authenticateToken, async (req, res) => {
  try {
    const [certificates] = await pool.query(
      'SELECT * FROM certificates WHERE user_id = ? ORDER BY issue_date DESC',
      [req.user.user_id]
    );
    res.json(certificates);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
});

// Verify certificate
app.get('/api/certificates/verify/:code', async (req, res) => {
  try {
    const [certificates] = await pool.query(
      'SELECT c.*, u.full_name FROM certificates c JOIN users u ON c.user_id = u.user_id WHERE c.certificate_code = ?',
      [req.params.code]
    );

    if (certificates.length === 0) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    res.json(certificates[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// =============================================
// LEARNING HUB ROUTES
// =============================================

// Get learning content by category
app.get('/api/learning/:category', async (req, res) => {
  try {
    const [content] = await pool.query(
      'SELECT * FROM learning_content WHERE category = ? AND status = "active" ORDER BY created_at DESC',
      [req.params.category]
    );
    res.json(content);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

// =============================================
// ADMIN ROUTES
// =============================================

// Get dashboard statistics
app.get('/api/admin/stats', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [stats] = await pool.query('SELECT * FROM dashboard_stats');
    res.json(stats[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Get all users
app.get('/api/admin/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT user_id, full_name, email, college_name, branch, year, role, is_active, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Add/Update course
app.post('/api/admin/courses', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { title, description, category, duration, price, is_free, status } = req.body;

    const [result] = await pool.query(
      'INSERT INTO courses (title, description, category, duration, price, is_free, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, description, category, duration, price, is_free, status]
    );

    res.json({ message: 'Course added successfully', course_id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add course' });
  }
});

// Get pending applications
app.get('/api/admin/applications/pending', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [applications] = await pool.query(
      'SELECT ia.*, i.title as internship_title FROM internship_applications ia JOIN internship i ON ia.internship_id = i.internship_id WHERE ia.application_status = "pending" ORDER BY ia.applied_at DESC'
    );
    res.json(applications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Update application status
app.put('/api/admin/applications/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { application_status } = req.body;

    await pool.query(
      'UPDATE internship_applications SET application_status = ?, reviewed_at = NOW() WHERE application_id = ?',
      [application_status, req.params.id]
    );

    res.json({ message: 'Application updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update application' });
  }
});

// =============================================
// HEALTH CHECK
// =============================================
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// =============================================
// START SERVER
// =============================================
app.listen(PORT, () => {
  console.log(`🚀 MentorVerse Server running on port ${PORT}`);
  console.log(`📝 API Documentation: http://localhost:${PORT}/api/health`);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await pool.end();
  process.exit(0);
});