## Description

This is a web app to help users build positive habits and track their progress by providing a visual representation of what they have achieved, and reminders on what they need to do to keep their habits on the right track.

## User stories

### Authentication

- [] As a user, I can sign up for a new account with my email, username, password
- [] As a user, I can login with email and password and logout
- [] As a user, I can stay signed-in after refreshing page
- [] As a user, I can reset password if I don't remember it
- [] As a user, I can login with 3rd party account (Google)

### Users

- [] As a user, I can view my personal info
- [] As a user, I can update my personal info

### Habits

- [] As a user, I can add a new habit to track with
- [] As a user, I can edit an existing habit
- [] As a user, I can delete an existing habit
- [] As a user, I can view a list of habits that have been added along with their progress, filtered by day, status, or searching by name
- [] As a user, I can view what has been done for each habit each day (view calendar for all habits)
- [] As a user, I can view week calendar for all habits

### Tags

- [] As a user, I can create tags for habit filter

### Reminders

- [] As a user, I can set reminder for each habit to to remind me to complete the habit's goals. A reminder could be frequency (daily, per week, per month) or a specific time. A reminder could be set to work only once or repeatedly by email and SMS.
- [] As a user, I can pause a reminder.
- [] As a user, I can remove a reminder.

## Endpoint APIs

### Auth APIs

```JavaScript
/**
 * @route POST /auth/login
 * @description Login with email and password
 * @body { email, password }
 * @access Public
 */
```

### User APIs

```JavaScript
/**
 * @route POST /users
 * @description Register
 * @body { name, email, password }
 * @access Public
 */
```

```JavaScript
/**
 * @route GET /users/me
 * @description Get current user's info
 * @access Login required
 */
```

```JavaScript
/**
 * @route GET /users/:id
 * @description Get a user's profile
 * @access Login required
 */
```

```JavaScript
/**
 * @route PUT /users/me
 * @description Update user's profile
 * @body { name, password, avatarUrl }
 * @access Login required
 */
```

### Habit APIs

```JavaScript
/**
 * @route POST /habits
 * @description Create a new habits
 * @body { name, goal, startDate, duration }
 * @access Login required
 */
```

```JavaScript
/**
 * @route GET /habits
 * @description Get current user's habits, filtered by day, status, or searching by name
 * @access Login required
 */
```

```JavaScript
/**
 * @route GET /habits/user/:userId
 * @description Get habits of user with userId, filtered by day, status, or searching by name
 * @access Login required, admin
 */
```

```JavaScript
/**
 * @route GET /habits/:id
 * @description Get detail of the habit with id
 * @access Login required
 */
```

```JavaScript
/**
 * @route PUT /habits/:id
 * @description Update a specific habit
 * @body { name, description, goal, startDate, progress, duration, onWeekdays, reminders }
 * @access Login required
 */
```

```JavaScript
/**
 * @route DELETE /habits/:id
 * @description Delete a specific habit
 * @access Login required
 */
```

### Progress APIs

```JavaScript
/**
 * @route GET progress/habit/:id
 * @description Get progress of a specific habit with habit's id
 * @access Login required
 */
```

```JavaScript
/**
 * @route PUT progress/habit/:id
 * @description Update progress of a specific habit with habit's id by {status, duration, progressValue, time}
 * @access Login required
 */
```

### Reminder APIs

```JavaScript
/**
 * @route POST /reminders/habit/:id
 * @description Create a new reminder for a habit that has a specific id
 * @body { reminderFrequency, onWeekdays, time, status }
 * @access Login required
 */
```

```JavaScript
/**
 * @route PUT /reminders/habit/:id
 * @description Update a reminder for a habit that has a specific id
 * @body { reminderFrequency, onWeekdays, time, status }
 * @access Login required
 */
```

```JavaScript
/**
 * @route DELETE /reminders/habit/:id
 * @description Delete a reminder for a habit that has a specific id
 * @access Login required
 */
```

### Tag APIs

```JavaScript
/**
 * @route POST /tags
 * @description Create a new tag
 * @body { title }
 * @access Login required
 */
```

```JavaScript
/**
 * @route GET /tags
 * @description Get all tags created by the current user
 * @access Login required
 */
```

```JavaScript
/**
 * @route PUT /tags/:id
 * @description Update a tag with a specific id
 * @access Login required
 */
```

```JavaScript
/**
 * @route DELETE /tags/:id
 * @description Delete a tag with a specific id
 * @access Login required
 */
```
