-- Migration: 002_vidhilikhit_vedic_schema.sql
-- Description: Vedic astrology enhancements for Vidhilikhit REST API backend

-- Ensure users table has required columns
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS public_id VARCHAR(50) NULL AFTER id,
  ADD COLUMN IF NOT EXISTS gender ENUM('male', 'female', 'other', 'prefer_not_to_say') NULL AFTER password_hash,
  ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500) NULL AFTER gender,
  ADD COLUMN IF NOT EXISTS active_profile_id VARCHAR(50) NULL AFTER avatar_url,
  MODIFY COLUMN mobile_number VARCHAR(30) NULL;

-- Populate public_id for users if null
UPDATE users 
SET public_id = CONCAT('usr_', SUBSTRING(MD5(CONCAT(id, email, NOW())), 1, 8))
WHERE public_id IS NULL;

ALTER TABLE users MODIFY COLUMN public_id VARCHAR(50) NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_users_public_id ON users (public_id);

-- Create profiles table (multiple family profiles per user)
CREATE TABLE IF NOT EXISTS profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    public_id VARCHAR(50) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    relationship VARCHAR(50) NOT NULL DEFAULT 'self',
    gender ENUM('male', 'female', 'other', 'prefer_not_to_say') NOT NULL DEFAULT 'male',
    dob DATE NOT NULL,
    tob TIME NOT NULL,
    tob_choice ENUM('exact', 'approximate', 'not_sure') NOT NULL DEFAULT 'exact',
    pob VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 6) NOT NULL DEFAULT 19.076000,
    longitude DECIMAL(10, 6) NOT NULL DEFAULT 72.877700,
    time_zone VARCHAR(100) NOT NULL DEFAULT 'Asia/Kolkata',
    avatar_url VARCHAR(500) NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_profiles_user_id (user_id),
    INDEX idx_profiles_public_id (public_id),
    CONSTRAINT fk_profiles_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Migrate any existing user_profiles into profiles table
INSERT INTO profiles (public_id, user_id, name, relationship, gender, dob, tob, tob_choice, pob, latitude, longitude, time_zone, avatar_url, is_active)
SELECT 
    CONCAT('prof_', SUBSTRING(MD5(CONCAT(u.id, p.id)), 1, 8)),
    u.id,
    u.full_name,
    'self',
    COALESCE(p.gender, 'male'),
    COALESCE(p.dob, '1995-03-15'),
    COALESCE(p.tob_time, '10:30:00'),
    COALESCE(p.tob_choice, 'exact'),
    COALESCE(p.pob, 'Mumbai, Maharashtra, India'),
    19.076000,
    72.877700,
    'Asia/Kolkata',
    'https://cdn.vidhilikhit.com/avatars/default.jpg',
    1
FROM users u
JOIN user_profiles p ON u.id = p.user_id
WHERE NOT EXISTS (
    SELECT 1 FROM profiles pr WHERE pr.user_id = u.id
);

-- Update active_profile_id on users if null
UPDATE users u
JOIN profiles p ON u.id = p.user_id AND p.is_active = 1
SET u.active_profile_id = p.public_id
WHERE u.active_profile_id IS NULL;

-- Create calculation cache table
CREATE TABLE IF NOT EXISTS cached_calculations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    profile_id VARCHAR(50) NOT NULL,
    calc_type VARCHAR(50) NOT NULL,
    calc_data LONGTEXT NOT NULL,
    hash VARCHAR(64) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_profile_calc (profile_id, calc_type),
    INDEX idx_cached_calc_profile (profile_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create matchmaking records table
CREATE TABLE IF NOT EXISTS matchmaking_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    match_id VARCHAR(50) NOT NULL UNIQUE,
    user_id BIGINT NULL,
    person1_data JSON NOT NULL,
    person2_data JSON NOT NULL,
    overall_data JSON NOT NULL,
    highlights_data JSON NOT NULL,
    detailed_aspects_data JSON NOT NULL,
    ashtakoota_gunas_data JSON NOT NULL,
    manglik_analysis_data JSON NOT NULL,
    overall_recommendation_data JSON NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_matchmaking_match_id (match_id),
    INDEX idx_matchmaking_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create report jobs table
CREATE TABLE IF NOT EXISTS report_jobs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    report_job_id VARCHAR(50) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    profile_id VARCHAR(50) NOT NULL,
    report_type VARCHAR(50) NOT NULL,
    format VARCHAR(20) NOT NULL DEFAULT 'pdf',
    status ENUM('processing', 'ready', 'failed') NOT NULL DEFAULT 'processing',
    download_url VARCHAR(500) NULL,
    file_path VARCHAR(500) NULL,
    estimated_time_seconds INT NOT NULL DEFAULT 8,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME NULL,
    INDEX idx_report_jobs_id (report_job_id),
    INDEX idx_report_jobs_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create chat sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(50) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    profile_id VARCHAR(50) NOT NULL,
    title VARCHAR(255) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_chat_sessions_id (session_id),
    INDEX idx_chat_user_profile (user_id, profile_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    message_id VARCHAR(50) NOT NULL UNIQUE,
    session_id VARCHAR(50) NOT NULL,
    sender ENUM('user', 'bot') NOT NULL,
    text TEXT NOT NULL,
    suggested_follow_ups JSON NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_chat_messages_session (session_id),
    CONSTRAINT fk_chat_messages_session FOREIGN KEY (session_id) REFERENCES chat_sessions(session_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

