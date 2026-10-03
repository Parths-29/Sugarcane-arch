# Software Testing — Manual Test Case Table

**Project:** DesiCane — AI-Driven Irrigation Advisory System  
**Module:** Frontend Web Application (5 Pages)  
**Tester:** _________________  
**Date:** _________________

---

## Page 1 — Sign Up (`/signup`)

| Test ID | Feature | Input | Expected Result | Actual Result | Pass/Fail |
|---------|---------|-------|-----------------|---------------|-----------|
| SU-01 | Empty name field | Leave "Full Name" blank, fill others correctly, submit | Inline error: "This field is required" under Name field | | |
| SU-02 | Empty phone field | Leave "Phone Number" blank, fill others correctly, submit | Inline error: "This field is required" under Phone field | | |
| SU-03 | Non-numeric phone | Enter "98765abcde" in Phone, submit | Inline error: "Phone number must contain only numbers" | | |
| SU-04 | Phone not 10 digits | Enter "12345" in Phone, submit | Inline error: "Phone number must be exactly 10 digits" | | |
| SU-05 | Password too short | Enter "abc" in Password, submit | Inline error: "Password must be at least 6 characters" | | |
| SU-06 | Password mismatch | Enter "password1" in Password, "password2" in Confirm Password, submit | Inline error: "Passwords do not match" under Confirm Password | | |
| SU-07 | Duplicate phone number | Enter "9876543210" (pre-seeded user), submit | Inline error: "An account with this number already exists" | | |
| SU-08 | Empty password | Leave Password blank, submit | Inline error: "This field is required" under Password | | |
| SU-09 | Empty confirm password | Fill Password, leave Confirm Password blank, submit | Inline error: "This field is required" under Confirm Password | | |
| SU-10 | All fields empty | Submit form with no data | Multiple inline errors under each required field | | |
| SU-11 | Successful signup | Fill all required fields correctly (e.g., "Test User", "9999999999", "test123", "test123"), submit | Green success banner appears, redirect to /login after 2s | | |
| SU-12 | Village optional | Fill required fields, leave Village blank, submit | Signup succeeds (Village is optional) | | |
| SU-13 | Language toggle | Click "Kannada" toggle | All form labels switch to Kannada text | | |

---

## Page 2 — Login (`/login`)

| Test ID | Feature | Input | Expected Result | Actual Result | Pass/Fail |
|---------|---------|-------|-----------------|---------------|-----------|
| LI-01 | Empty phone | Leave Phone blank, submit | Inline error: "This field is required" | | |
| LI-02 | Empty password | Leave Password blank, submit | Inline error: "This field is required" | | |
| LI-03 | Both fields empty | Submit form with no data | Inline errors under both fields | | |
| LI-04 | Phone not in database | Enter "1111111111" (not a registered user), submit | Inline error: "No account found with this number" | | |
| LI-05 | Wrong password | Enter "9876543210" (valid phone) and "wrongpassword", submit | Inline error: "Incorrect password" | | |
| LI-06 | Loading spinner | Enter valid credentials, submit | Spinner/loading state appears for ~1 second | | |
| LI-07 | Successful login | Enter "9876543210" + "ramesh123", submit | Loading spinner, then redirect to /home, greeting shows "Ramesh Patil" | | |
| LI-08 | 3 failed attempts | Submit wrong credentials 3 times | "Forgot password?" warning banner appears with hint text | | |
| LI-09 | Login after signup | Sign up with new credentials, navigate to login, use same credentials | Login succeeds, redirect to /home | | |
| LI-10 | Language toggle | Switch to Kannada on login page | Form labels switch to Kannada | | |

---

## Page 3 — Home (`/home`)

| Test ID | Feature | Input | Expected Result | Actual Result | Pass/Fail |
|---------|---------|-------|-----------------|---------------|-----------|
| HM-01 | Greeting with name | Login as "Ramesh Patil" | Page shows "Welcome, Ramesh Patil" | | |
| HM-02 | Hero image display | Navigate to /home after login | img1.jpg displayed prominently, full-width, with overlay text | | |
| HM-03 | Stat boxes | View home page | 4 stat boxes visible: 2,400+ / 850 / 32% / 3 | | |
| HM-04 | Navigation cards | View home page | 3 explore cards visible: Problem, Solution, Latest News | | |
| HM-05 | News card link | Click "Latest News" explore card | Navigates to /news | | |
| HM-06 | Navbar presence | View home page | Navbar shows DesiCane logo, Home, News, Language toggle, Logout | | |
| HM-07 | Logout clears session | Click Logout | Redirects to /login, session state cleared | | |
| HM-08 | Unauthenticated access | Open /home directly without logging in | Redirects to /login (route guard works) | | |
| HM-09 | Language toggle in navbar | Switch to Kannada in navbar | All labels on home page switch to Kannada | | |

---

## Page 4 — News Listing (`/news`)

| Test ID | Feature | Input | Expected Result | Actual Result | Pass/Fail |
|---------|---------|-------|-----------------|---------------|-----------|
| NW-01 | Article grid | Navigate to /news | 4 article cards displayed (first page) | | |
| NW-02 | Load More | Click "Load More" button | 4 more articles appear (total 8), Load More button disappears | | |
| NW-03 | Search keyword match | Type "irrigation" in search bar | Only articles with "irrigation" in title/excerpt shown | | |
| NW-04 | Search no results | Type "xyznotfound" in search bar | Empty state: "No articles found" with icon | | |
| NW-05 | Empty search | Clear search bar | All articles shown again | | |
| NW-06 | Search resets pagination | Load More to show 8, then search | Pagination resets, showing max 4 matching results first | | |
| NW-07 | Article card link | Click on first article card | Navigates to /article/1 (correct article ID) | | |
| NW-08 | Card hover effects | Hover over article card | Card lifts up slightly, shadow increases | | |
| NW-09 | Image loading | Observe article thumbnails | Images load with lazy loading, no layout shift | | |

---

## Page 5 — Article Detail (`/article/:id`)

| Test ID | Feature | Input | Expected Result | Actual Result | Pass/Fail |
|---------|---------|-------|-----------------|---------------|-----------|
| AD-01 | Valid article | Navigate to /article/1 | Full article: title, date, author, body text, hero image | | |
| AD-02 | Invalid article ID | Navigate to /article/999 | "Article not found" fallback page, not a blank/crash | | |
| AD-03 | Non-numeric ID | Navigate to /article/abc | "Article not found" fallback page | | |
| AD-04 | Back to News | Click "Back to News" link | Navigates to /news (not /home) | | |
| AD-05 | Long article body | View article with long body text | Text wraps properly, no overflow on mobile | | |
| AD-06 | Article metadata | View any article | Date in "DD Month YYYY" format, author name visible | | |
| AD-07 | Responsive layout | Resize browser to 360px width | Single column, readable text, no horizontal scroll | | |

---

## Cross-Cutting Tests

| Test ID | Feature | Input | Expected Result | Actual Result | Pass/Fail |
|---------|---------|-------|-----------------|---------------|-----------|
| CC-01 | Route guard all protected routes | Visit /home, /news, /article/1 without login | All redirect to /login | | |
| CC-02 | Language persists across pages | Set language to Kannada, navigate all pages | Kannada labels persist on all pages | | |
| CC-03 | Root redirect unauthenticated | Visit / without login | Redirects to /login | | |
| CC-04 | Root redirect authenticated | Visit / while logged in | Redirects to /home | | |
| CC-05 | Catch-all route | Visit /nonexistent | Redirects to / then to /login or /home | | |
| CC-06 | Mobile responsiveness | Test all pages at 360px width | All pages correct, no overflow, large tap targets | | |

---

**Total Test Cases:** 48  
**Coverage:** Form validation (14), Auth flow (10), Navigation (8), Content display (9), Edge cases (7)
