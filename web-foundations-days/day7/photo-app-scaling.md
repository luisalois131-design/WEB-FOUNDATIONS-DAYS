# SnapShare: Photo-App Scaling Plan

## 1. Introduction

SnapShare is a photo-sharing application where users upload photos and scroll through a feed containing photos from people they follow. The system must support a large number of users, deliver feed content quickly, store photo files reliably, and generate thumbnails efficiently.

This document estimates the system's traffic and storage requirements and proposes an architecture that can scale as usage increases.

## 2. Assumptions

The calculations use the following assumptions:

- The application has 10 million registered users.
- 10% of registered users are active each day.
- Each daily active user uploads one photo per day.
- Each daily active user views 50 feed pages per day.
- Each original photo averages 2 MB.
- Each photo has one thumbnail averaging 50 KB.
- A day contains 86,400 seconds, and a year contains 365 days.
- Peak feed traffic is estimated at five times the average feed traffic.
- All original photos and thumbnails are retained for at least one year.
- Storage uses decimal units: 1 MB = 1,000 KB, 1 TB = 1,000,000 MB.
- Traffic is distributed across the day for average-rate calculations, although actual traffic will vary.
- Storage estimates exclude backups, database records, replication overhead, and temporary files.

These assumptions provide an initial planning estimate. Production capacity should be adjusted using real traffic measurements.

## 3. Traffic and Storage Calculations

### 3.1 Daily Active Users

Daily active users (DAU) are calculated as 10% of registered users.

DAU = 10,000,000 × 0.10

**Daily active users = 1,000,000 users**

### 3.2 Photo Uploads per Second

Each daily active user uploads one photo per day.

Daily uploads = 1,000,000 × 1

Daily uploads = 1,000,000 photos

Average uploads per second:

1,000,000 ÷ 86,400 ≈ 11.57

**Average upload rate ≈ 11.6 photos per second.**

This is the daily average; actual upload traffic may be higher during busy periods.

### 3.3 Feed Views per Second

Each daily active user views 50 feed pages per day.

Daily feed views = 1,000,000 × 50

Daily feed views = 50,000,000 feed pages

Average feed views per second:

50,000,000 ÷ 86,400 ≈ 578.70

**Average feed rate ≈ 579 feed views per second.**

Peak feed traffic is five times the average:

578.70 × 5 ≈ 2,893.52

**Peak feed rate ≈ 2,894 feed views per second.**

These figures represent feed-page requests, not every HTTP request for photos, thumbnails, profiles, or other resources.

### 3.4 Photo Storage per Year

Each uploaded photo generates two stored files:

- Original photo: 2 MB.
- Thumbnail: 50 KB = 0.05 MB.

Total storage per photo:

2 MB + 0.05 MB = 2.05 MB

Daily storage growth:

1,000,000 × 2.05 MB = 2,050,000 MB = 2.05 TB

Annual storage growth:

2.05 TB × 365 = 748.25 TB

**Estimated annual storage growth = 748.25 TB**, or approximately 0.75 petabytes using decimal units.

This estimate assumes one original and one thumbnail per upload, with no deletion. The total storage required by the end of a year would be approximately 748.25 TB for the year's uploads alone, excluding older retained content and additional infrastructure overhead.

## 4. Is SnapShare Read-Heavy or Write-Heavy?

SnapShare is primarily a **read-heavy system**.

The application handles 50 million feed views per day compared with one million photo uploads per day. This means there are approximately 50 feed views for every photo upload.

The design should therefore prioritize fast feed retrieval. A cache can reduce repeated database queries, a CDN can deliver photos and thumbnails closer to users, and a database read replica can handle suitable read queries.

Photo uploads still require reliable writes and substantial storage capacity. The system must scale both its read performance and its ability to store and process uploaded images.

## 5. Why Photos Should Not Be Stored Inside the Database

Original photos and thumbnails are large binary files. Storing them directly inside the main relational database would increase database storage requirements, backup sizes, and the amount of data handled during maintenance and recovery.

Instead, SnapShare should store photo files in **object storage**, which is designed to store and retrieve large files at scale. The database should store metadata such as the photo ID, owner, upload time, object key, thumbnail key, and processing status.

This separation allows the database to focus on structured information while object storage handles the image files. A CDN can then cache and deliver frequently requested images efficiently.

## 6. Proposed Architecture Diagram

```text
                         USERS
                           |
              +------------+------------+
              |                         |
          Feed Requests             Photo Uploads
              |                         |
              v                         v
             [ CDN ]              [ Load Balancer ]
        Cached photo delivery            |
              |                    +-----+-----+
              |                    |           |
              |                [ App 1 ]    [ App 2 ]
              |                    |           |
              |                    +-----+-----+
              |                          |
              |              +-----------+-----------+
              |              |                       |
              |           [ Cache ]            [ Database ]
              |                                      |
              |                               +------+------+
              |                               |             |
              |                          [ Primary ]  [ Read Replica ]
              |                               |
              |                               |
              |                         Metadata Writes
              |                               |
              |                         [ App Servers ]
              |                               |
              |                    +----------+----------+
              |                    |                     |
              |                    v                     v
              |             [ Object Storage ]      [ Message Queue ]
              |               Original Photos             |
              |                     ^                     v
              |                     |             [ Thumbnail Worker ]
              |                     |                     |
              |                     +---------------------+
              |                         Stores Thumbnails
              |
              +------ Retrieves images from Object Storage
                     when not already cached
```

The diagram shows the logical components. In production, application servers write metadata to the primary database and use the read replica for suitable read operations. The CDN delivers cached images and retrieves uncached files from object storage through an authorized origin path.

## 7. Components and the Problems They Solve

1. **CDN:** Delivers cached photos and thumbnails from locations close to users, reducing image latency and origin traffic.

2. **Load balancer:** Distributes incoming requests across healthy application servers so that traffic does not overwhelm a single server.

3. **Application servers:** Handle authentication, upload validation, feed generation, follow relationships, and communication with the other services.

4. **Cache:** Stores frequently requested feed data and other reusable results in memory to reduce database load and response times.

5. **Primary database:** Stores structured data such as users, follow relationships, photo metadata, object keys, and processing status.

6. **Database read replica:** Serves suitable read queries so that feed and profile reads place less pressure on the primary database.

7. **Object storage:** Stores original photos and thumbnails independently of the relational database and scales to accommodate large image volumes.

8. **Message queue:** Holds thumbnail-generation jobs until workers can process them, separating image processing from the upload request.

9. **Thumbnail worker:** Consumes queued jobs, creates smaller photo versions, stores them in object storage, and updates processing status when needed.

## 8. Step-by-Step Photo Upload Flow

1. **Photo selection:** A user selects a photo and initiates an upload in SnapShare.

2. **Request routing:** The request reaches the load balancer, which directs it to a healthy application server.

3. **Validation:** The application verifies the user's identity and checks the file type, file size, and upload permissions.

4. **Original file storage:** The application stores the original photo in object storage under a unique object key. A direct upload using a time-limited, authorized upload URL can reduce the load on application servers.

5. **Metadata creation:** The application records the photo ID, owner, object key, upload timestamp, and processing status in the primary database.

6. **Queue submission:** After the original file is stored successfully, the application publishes a thumbnail-generation job to the message queue.

7. **Upload confirmation:** The application tells the user that the photo has been uploaded successfully, while thumbnail processing may still be pending.

8. **Job processing:** A thumbnail worker retrieves the job from the queue and reads the original photo from object storage.

9. **Thumbnail generation:** The worker creates a smaller thumbnail, targeting the assumed average size of 50 KB.

10. **Thumbnail storage:** The worker stores the thumbnail in object storage and updates the thumbnail reference or processing status in the database.

11. **Feed availability:** The photo can appear in the owner's and followers' feeds according to the application's feed-generation strategy. The interface can show a placeholder until the thumbnail is ready.

12. **Image delivery:** When a user views the photo, the CDN serves a cached copy if available or retrieves the image from object storage through the authorized origin path.

The queue allows thumbnail processing to happen asynchronously, so the user does not need to wait for image processing to finish before receiving an upload confirmation. Failed jobs should be retried safely, and repeatedly failing jobs should be isolated for investigation.

## 9. Trade-Offs

### 9.1 Caching Versus Freshness

Caching feed results improves response time and reduces database load. However, cached results may become outdated when new photos are uploaded or follow relationships change. Shorter cache lifetimes improve freshness but increase cache misses and database requests.

### 9.2 Asynchronous Processing Versus Immediate Availability

A queue allows uploads to finish without waiting for thumbnail generation, improving the upload experience. However, thumbnails may appear later, requiring the application to show a processing state and handle failed jobs.

### 9.3 Read Replicas Versus Strongly Consistent Reads

Read replicas increase read capacity by distributing queries away from the primary database. However, replication lag can cause recently updated information to appear late, so operations requiring the latest committed data may need to read from the primary.

### 9.4 Storage Cost Versus Image Quality

Keeping originals and thumbnails provides high-quality images and faster feed loading