
# Streamlined Scheduler - Database Seeding and Setup

This repository includes a seeding script to populate the database with initial data, including users, schedules, and events. This is helpful for setting up the development environment with predefined data for testing or demonstration purposes.

### Table of Contents

- [Prerequisites](#prerequisites)
- [Project Setup](#project-setup)
- [Seeding the Database](#seeding-the-database)
- [Verifying the Seeded Data](#verifying-the-seeded-data)
- [User Logins](#user-logins)

### Prerequisites

Before running the seeding script, ensure you have the following:

- **Node.js** (v14+ recommended)
- **MongoDB** installed and running
- **MongoDB connection string** set up in your environment (if you're not using the default `mongodb://localhost:27017/streamlinedscheduler`)
- **bcrypt** installed (used for password hashing)

### Project Setup

1. **Clone the Repository**

   ```bash
   git clone https://github.com/grahamprimm/streamlinedscheduler.git
   cd streamlinedscheduler
   ```
2. **Install Dependencies**

   Install the required Node.js packages by running:

   ```bash
   npm install
   ```

### Seeding the Database

1. **Run the Seeding Script**

   To seed the database with users, schedules, and events, execute the following command:

   ```bash
   node seed.js
   ```

   This will populate the database with the following data:

   - **5 Users**:
     - 1 Admin user with email `admin@domain.com`
     - 4 Regular users with different emails and passwords
   - **Schedules**:
     - Each user has their own schedule.
   - **Events**:
     - Each user (except the admin) has events associated with their schedule, and some events are shared between users.
2. **Verify Successful Seeding**

   After running the script, you should see a message indicating that the seeding completed successfully.

### Verifying the Seeded Data

To verify the seeded data, you can connect to your MongoDB instance using the MongoDB shell or any MongoDB GUI tool (e.g., MongoDB Compass) and run queries like:

```bash
db.users.find().pretty()
db.schedules.find().pretty()
db.events.find().pretty()
```

### User Logins

Here are the login details for the users created by the seeding script:

1. **Admin User:**

   - Email: `admin@domain.com`
   - Password: `password1`
2. **User 1:**

   - Email: `user1@domain.com`
   - Password: `password2`
3. **User 2:**

   - Email: `user2@domain.com`
   - Password: `password3`
4. **User 3:**

   - Email: `user3@domain.com`
   - Password: `password4`
5. **User 4:**

   - Email: `user4@domain.com`
   - Password: `password5`

---

This `README.md` should provide all the necessary information to set up the project and seed the database with initial data, along with user login details for testing. Let me know if you need any further adjustments!
