
-- Day 6 Assignment: School Database
-- SQLite-compatible SQL

PRAGMA foreign_keys = ON;

-- 1. Create the students table.
CREATE TABLE students (
    student_id INTEGER PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE
);

-- 2. Create the courses table.
CREATE TABLE courses (
    course_id INTEGER PRIMARY KEY,
    course_name TEXT NOT NULL UNIQUE,
    course_code TEXT NOT NULL UNIQUE
);

-- 3. Create the enrolments junction table.
CREATE TABLE enrolments (
    student_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    grade REAL CHECK (grade >= 0 AND grade <= 100),

    PRIMARY KEY (student_id, course_id),

    FOREIGN KEY (student_id)
        REFERENCES students(student_id),

    FOREIGN KEY (course_id)
        REFERENCES courses(course_id)
);

-- 4. Insert sample students.
INSERT INTO students (student_id, full_name, email) VALUES
(1, 'Victor Mshindi', 'victor@example.com'),
(2, 'Grace Wanjiku', 'grace@example.com'),
(3, 'Brian Otieno', 'brian@example.com'),
(4, 'Faith Achieng', 'faith@example.com');

-- 5. Insert sample courses.
INSERT INTO courses (course_id, course_name, course_code) VALUES
(1, 'Database Systems', 'SCO206'),
(2, 'Web Development', 'SCO205'),
(3, 'Data Structures', 'SCO204');

-- 6. Insert sample enrolments.
-- Faith Achieng has no enrolments, for Query 4.
INSERT INTO enrolments (student_id, course_id, grade) VALUES
(1, 1, 85),
(1, 2, 90),
(2, 1, 78),
(2, 3, 88),
(3, 2, 74);

-- 7. Add an index to speed up searches by course.
CREATE INDEX idx_enrolments_course_id
ON enrolments(course_id);


-- QUERY 1:
-- List all courses taken by a student, identified by name.
SELECT
    s.full_name AS student_name,
    c.course_name,
    c.course_code,
    e.grade
FROM students AS s
JOIN enrolments AS e
    ON s.student_id = e.student_id
JOIN courses AS c
    ON e.course_id = c.course_id
WHERE s.full_name = 'Victor Mshindi';


-- QUERY 2:
-- List all students enrolled in a particular course.
SELECT
    c.course_name,
    s.full_name AS student_name,
    s.email,
    e.grade
FROM courses AS c
JOIN enrolments AS e
    ON c.course_id = e.course_id
JOIN students AS s
    ON e.student_id = s.student_id
WHERE c.course_name = 'Database Systems';


-- QUERY 3:
-- Count the students enrolled in each course,
-- including courses with zero enrolments.
SELECT
    c.course_name,
    COUNT(e.student_id) AS number_of_students
FROM courses AS c
LEFT JOIN enrolments AS e
    ON c.course_id = e.course_id
GROUP BY c.course_id, c.course_name
ORDER BY c.course_name;


-- QUERY 4:
-- Find students who have no enrolments.
SELECT
    s.student_id,
    s.full_name,
    s.email
FROM students AS s
LEFT JOIN enrolments AS e
    ON s.student_id = e.student_id
WHERE e.student_id IS NULL;


-- QUERY 5:
-- Update one student's grade in one specific course.
UPDATE enrolments
SET grade = 92
WHERE student_id = 1
  AND course_id = 1;

-- Verify that the grade was updated.
SELECT
    s.full_name AS student_name,
    c.course_name,
    e.grade
FROM enrolments AS e
JOIN students AS s
    ON e.student_id = s.student_id
JOIN courses AS c
    ON e.course_id = c.course_id
WHERE e.student_id = 1
  AND e.course_id = 1;