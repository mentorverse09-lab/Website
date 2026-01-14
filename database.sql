-- MentorVerse Complete Database Schema
-- Execute this in MySQL to create your database

CREATE DATABASE IF NOT EXISTS mentorverse CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE mentorverse;

-- =============================================
-- 1. USERS TABLE
-- =============================================
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    college_name VARCHAR(150),
    branch VARCHAR(50),
    year VARCHAR(20),
    profile_pic VARCHAR(255),
    mobile VARCHAR(15),
    role ENUM('student', 'admin') DEFAULT 'student',
    is_active BOOLEAN DEFAULT TRUE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    login_alerts BOOLEAN DEFAULT FALSE,
    show_profile_publicly BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB;

-- =============================================
-- 2. COURSES TABLE
-- =============================================
CREATE TABLE courses (
    course_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    duration VARCHAR(50),
    price DECIMAL(10, 2) DEFAULT 0.00,
    is_free BOOLEAN DEFAULT FALSE,
    thumbnail VARCHAR(255),
    instructor_name VARCHAR(100),
    difficulty_level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
    status ENUM('active', 'coming_soon', 'inactive') DEFAULT 'coming_soon',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_status (status)
) ENGINE=InnoDB;

-- =============================================
-- 3. COURSE ENROLLMENTS
-- =============================================
CREATE TABLE course_enrollments (
    enrollment_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    progress INT DEFAULT 0,
    status ENUM('active', 'completed', 'dropped') DEFAULT 'active',
    completion_date TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    INDEX idx_user_course (user_id, course_id)
) ENGINE=InnoDB;

-- =============================================
-- 4. internship TABLE
-- =============================================
CREATE TABLE internship (
    internship_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    company_name VARCHAR(150),
    duration VARCHAR(50),
    stipend VARCHAR(50),
    requirements TEXT,
    skills_required VARCHAR(255),
    location VARCHAR(100),
    internship_type ENUM('remote', 'onsite', 'hybrid') DEFAULT 'remote',
    status ENUM('active', 'closed', 'coming_soon') DEFAULT 'coming_soon',
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status)
) ENGINE=InnoDB;

-- =============================================
-- 5. INTERNSHIP APPLICATIONS
-- =============================================
CREATE TABLE internship_applications (
    application_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    internship_id INT NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    mobile VARCHAR(15) NOT NULL,
    college_name VARCHAR(150) NOT NULL,
    branch VARCHAR(50) NOT NULL,
    year VARCHAR(20) NOT NULL,
    resume_path VARCHAR(255),
    cover_letter TEXT,
    why_internship TEXT,
    application_status ENUM('pending', 'reviewed', 'shortlisted', 'accepted', 'rejected') DEFAULT 'pending',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (internship_id) REFERENCES internship(internship_id) ON DELETE CASCADE,
    INDEX idx_status (application_status)
) ENGINE=InnoDB;

-- =============================================
-- 6. WEBINARS TABLE
-- =============================================
CREATE TABLE webinars (
    webinar_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    speaker_name VARCHAR(100),
    webinar_date DATE NOT NULL,
    webinar_time TIME NOT NULL,
    duration_minutes INT DEFAULT 120,
    meeting_link VARCHAR(255),
    is_free BOOLEAN DEFAULT TRUE,
    price DECIMAL(10, 2) DEFAULT 0.00,
    max_participants INT,
    platform VARCHAR(50) DEFAULT 'Google Meet',
    thumbnail VARCHAR(255),
    status ENUM('scheduled', 'ongoing', 'completed', 'cancelled') DEFAULT 'scheduled',
    recording_link VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_date (webinar_date),
    INDEX idx_status (status)
) ENGINE=InnoDB;

-- =============================================
-- 7. WEBINAR REGISTRATIONS
-- =============================================
CREATE TABLE webinar_registrations (
    registration_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    webinar_id INT NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    mobile VARCHAR(15) NOT NULL,
    college_name VARCHAR(150),
    branch VARCHAR(50),
    year VARCHAR(20),
    registration_status ENUM('registered', 'attended', 'absent', 'cancelled') DEFAULT 'registered',
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (webinar_id) REFERENCES webinars(webinar_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_webinar (user_id, webinar_id),
    INDEX idx_status (registration_status)
) ENGINE=InnoDB;

-- =============================================
-- 8. CERTIFICATES TABLE
-- =============================================
CREATE TABLE certificates (
    certificate_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    certificate_type ENUM('course', 'internship', 'webinar') NOT NULL,
    reference_id INT NOT NULL, -- course_id, internship_id, or webinar_id
    certificate_code VARCHAR(50) UNIQUE NOT NULL,
    certificate_url VARCHAR(255),
    issue_date DATE NOT NULL,
    expiry_date DATE,
    is_verified BOOLEAN DEFAULT TRUE,
    verification_link VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_code (certificate_code)
) ENGINE=InnoDB;

-- =============================================
-- 9. contact us MESSAGES
-- =============================================
CREATE TABLE contact us_messages (
    message_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    subject VARCHAR(200),
    message TEXT NOT NULL,
    status ENUM('new', 'read', 'responded', 'archived') DEFAULT 'new',
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP NULL,
    INDEX idx_status (status),
    INDEX idx_created (created_at)
) ENGINE=InnoDB;

-- =============================================
-- 10. NOTIFICATIONS TABLE
-- =============================================
CREATE TABLE notifications (
    notification_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    notification_type ENUM('course', 'internship', 'webinar', 'certificate', 'system') NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    link VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_unread (user_id, is_read),
    INDEX idx_created (created_at)
) ENGINE=InnoDB;

-- =============================================
-- 11. LEARNING HUB CONTENT
-- =============================================
CREATE TABLE learning_content (
    content_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    content_type ENUM('video', 'book', 'blog', 'certification', 'mindmap', 'tutorial') NOT NULL,
    content_url VARCHAR(500) NOT NULL,
    description TEXT,
    is_free BOOLEAN DEFAULT TRUE,
    difficulty_level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
    rating DECIMAL(3, 2) DEFAULT 0.00,
    views INT DEFAULT 0,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_type (content_type)
) ENGINE=InnoDB;

-- =============================================
-- 12. USER SETTINGS
-- =============================================
CREATE TABLE user_settings (
    setting_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    webinar_notifications BOOLEAN DEFAULT TRUE,
    internship_alerts BOOLEAN DEFAULT TRUE,
    course_updates BOOLEAN DEFAULT TRUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT FALSE,
    dark_mode BOOLEAN DEFAULT TRUE,
    language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================
-- 13. ADMIN LOGS
-- =============================================
CREATE TABLE admin_logs (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    admin_id INT NOT NULL,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50),
    record_id INT,
    description TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_admin (admin_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB;

-- =============================================
-- 14. PAYMENTS TABLE (for future use)
-- =============================================
CREATE TABLE payments (
    payment_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    payment_type ENUM('course', 'webinar', 'certification', 'other') NOT NULL,
    reference_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100) UNIQUE,
    payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_status (payment_status)
) ENGINE=InnoDB;

-- =============================================
-- INSERT DEFAULT ADMIN USER
-- =============================================
-- Password: Admin@123 (CHANGE THIS IMMEDIATELY!)
INSERT INTO users (full_name, email, password_hash, role, is_active) VALUES 
('Admin User', 'admin@mentorverse.co.in', '$2b$10$rOzx8KE9pU.KvH4Z7yqxc.1T8oKRVq7VnJzZLMWdN8xYYZ5PQWG9C', 'admin', TRUE);

-- =============================================
-- INSERT SAMPLE DATA FOR TESTING
-- =============================================

-- Sample Courses
INSERT INTO courses (title, description, category, duration, is_free, status) VALUES
('Python Full Stack Development', 'Complete Python web development course', 'Programming', '3 months', TRUE, 'active'),
('Data Science with Python', 'Learn data analysis and machine learning', 'Data Science', '4 months', FALSE, 'active'),
('React.js Masterclass', 'Build modern web applications with React', 'Web Development', '2 months', TRUE, 'coming_soon');

-- Sample Webinars
INSERT INTO webinars (title, description, speaker_name, webinar_date, webinar_time, is_free, status) VALUES
('Everything About Tech', 'Complete technology roadmap for students', 'Tech Expert', '2026-01-25', '19:00:00', TRUE, 'scheduled');

-- Sample Learning Content
INSERT INTO learning_content (title, category, subcategory, content_type, content_url, is_free) VALUES
('Python Tutorial', 'Programming', 'Python', 'video', 'https://youtu.be/python-tutorial', TRUE),
('Machine Learning Book', 'AI/ML', 'Machine Learning', 'book', 'https://archive.org/ml-book', TRUE);

-- =============================================
-- CREATE VIEWS FOR COMMON QUERIES
-- =============================================

-- View: Active Users with Enrollments
CREATE VIEW active_users_summary AS
SELECT 
    u.user_id,
    u.full_name,
    u.email,
    u.college_name,
    COUNT(DISTINCT ce.course_id) as enrolled_courses,
    COUNT(DISTINCT ia.internship_id) as applied_internship,
    COUNT(DISTINCT wr.webinar_id) as registered_webinars
FROM users u
LEFT JOIN course_enrollments ce ON u.user_id = ce.user_id
LEFT JOIN internship_applications ia ON u.user_id = ia.user_id
LEFT JOIN webinar_registrations wr ON u.user_id = wr.user_id
WHERE u.is_active = TRUE
GROUP BY u.user_id;

-- View: Dashboard Statistics
CREATE VIEW dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM users WHERE role = 'student' AND is_active = TRUE) as total_students,
    (SELECT COUNT(*) FROM courses WHERE status = 'active') as active_courses,
    (SELECT COUNT(*) FROM internship WHERE status = 'active') as active_internship,
    (SELECT COUNT(*) FROM webinars WHERE status = 'scheduled') as upcoming_webinars,
    (SELECT COUNT(*) FROM internship_applications WHERE application_status = 'pending') as pending_applications,
    (SELECT COUNT(*) FROM certificates) as total_certificates;

-- =============================================
-- STORED PROCEDURES
-- =============================================

-- Procedure: Register User for Webinar
DELIMITER //
CREATE PROCEDURE register_for_webinar(
    IN p_user_id INT,
    IN p_webinar_id INT,
    IN p_full_name VARCHAR(100),
    IN p_email VARCHAR(100),
    IN p_mobile VARCHAR(15)
)
BEGIN
    INSERT INTO webinar_registrations (user_id, webinar_id, full_name, email, mobile)
    VALUES (p_user_id, p_webinar_id, p_full_name, p_email, p_mobile);
    
    INSERT INTO notifications (user_id, title, message, notification_type)
    VALUES (p_user_id, 'Webinar Registration Successful', 
            'You have successfully registered for the webinar', 'webinar');
END//
DELIMITER ;

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX idx_user_created ON users(created_at);
CREATE INDEX idx_course_created ON courses(created_at);
CREATE INDEX idx_enrollment_status ON course_enrollments(status, user_id);

-- =============================================
-- END OF DATABASE SCHEMA
-- =============================================