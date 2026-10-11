
# School Database Design

## 1. Overview

The School Database stores information about students, courses, and student enrolments. It records which students take which courses and stores the grade each student receives in a course.

The database contains three tables: `students`, `courses`, and `enrolments`.

## 2. Table Descriptions

### Students Table

The `students` table stores each student's unique ID, full name, and email address.

- `student_id` is the primary key.
- `full_name` is required and cannot be NULL.
- `email` is required and must be unique.

The unique email constraint prevents multiple students from registering with the same email address.

### Courses Table

The `courses` table stores information about courses offered by the school.

- `course_id` is the primary key.
- `course_name` is required and unique.
- `course_code` is required and unique.

Each course has a unique identifier and course code.

### Enrolments Table

The `enrolments` table records which students are enrolled in which courses.

- `student_id` is a foreign key referencing `students`.
- `course_id` is a foreign key referencing `courses`.
- `grade` stores the student's grade for that course.

The combination of `student_id` and `course_id` forms a composite primary key. This prevents the same student from enrolling in the same course more than once.

The grade can be NULL until a result is available, but a recorded grade must be between 0 and 100.

## 3. Relationships Between Tables

### One-to-Many Relationships

**Students to Enrolments:** One student can have many enrolment records because a student can take several courses. Each enrolment record belongs to one student.

**Courses to Enrolments:** One course can have many enrolment records because many students can take the same course. Each enrolment record refers to one course.

### Many-to-Many Relationship

Students and courses have a many-to-many relationship. One student can enrol in several courses, and one course can have several students.

A direct many-to-many relationship cannot be represented cleanly using only the two tables. The `enrolments` junction table resolves this relationship by storing the student ID and course ID for each enrolment. It also stores the grade, which belongs to the relationship between a particular student and course.

## 4. Index

I would add an index on `enrolments(course_id)`.

This index helps the database find enrolments for a particular course more efficiently, especially when listing all students taking a course or counting enrolments per course. It is useful because the composite primary key begins with `student_id`, so it does not provide the same leading-column index for searches by `course_id`.

The index is created in `school.sql` using:

```sql
CREATE INDEX idx_enrolments_course_id
ON enrolments(course_id);
```

## 5. SQL or NoSQL?

I would choose a relational SQL database for this school system. Students, courses, and enrolments have clearly defined relationships, and the system requires primary keys, foreign keys, uniqueness constraints, and reliable updates to grades. SQL supports these requirements and provides JOIN operations for retrieving related information and aggregate functions for counting enrolments. A relational database also helps maintain data integrity by preventing invalid references and duplicate enrolments. A NoSQL database could be useful for flexible or unstructured data, but SQL is a better fit for this structured school database.

## 6. Conclusion

The database design organizes school information into three related tables, reduces unnecessary duplication, and maintains data integrity through constraints. JOINs, grouping, and an index support common operations such as listing courses, finding enrolled students, counting enrolments, and identifying students without enrolments.
