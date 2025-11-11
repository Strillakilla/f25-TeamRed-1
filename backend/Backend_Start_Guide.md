# BingeBuddy Backend Quickstart (Windows)

This guide explains how to **run the BingeBuddy backend** for full stack testing and development. 

---

## Requirements

Before running, make sure you have:

* **Java 21 or newer** installed (check with `java -version`)
* The cloned repo (obviously)

You do **not** need to install Maven — the included Maven Wrapper handles everything automatically.

---

##  How to Run the Backend

### **Step 1 — Open the Project in Your IDE or Command Prompt (Recommended)**

Open the `backend` folder as the **project root** in your IDE. If you aren't using an IDE, just **cd** into the backend folder.

### **Step 2 — Run Using the Built-in Terminal**

In your terminal, type:

```bash
.\start-backend.cmd
```

This will:


1. Free port **8080** if needed
2. Build the backend jar using maven
3. Start Spring Boot automatically

Once it’s running, you’ll see logs like this:

```
o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat started on port 8080 (http) with context path '/'
com.TeamRed.backend.BackendApplication   : Started BackendApplication in 3.918 seconds (process running for 4.334)
```

That means it’s live and serving requests.

---

### **Stopping the Backend**

When you’re done testing:
* Click on the terminal window
* Press **Ctrl + C twice** to stop the server cleanly.

You should see the following message:
```
Backend successfully stopped. 
```
---
## Default Development Account
A persistent H2 database is included, so you do **not** need to register a new user each time you start the backend just login (Click Login not Create Account) with these credentials:

```
Email: johndoe@example.com
Password: JohnDoe123
```
Then, you won't have to re-login the next time you open the frontend page since it stays stored in your browsers local storage. You only need to log in the first time. Then you will have access to the endpoints. But since everyone will use the same account, if you ever edit the database like add to "John Doe" watchlist it WILL be stored and pushed to github so we all will have that current watchlist for "John Doe".

---
## Swagger UI

### NOTE: All GET requests under "Media" use TMDB (The Movie DataBase)'s API. If you want to know what information gets returned, just visit their API page for that particular request.
Once the backend is running, open:

```
http://localhost:8080/swagger-ui/index.html#/
```

This takes you to the endpoint layout. Now you can just make any requests that your heart desires. Note that to make a valid request you are going to need to first be registered and log in. The login POST request should return something like this (along with user information):
```
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5..."
}
```
That token must be included in every request made like so:
```
fetch("http://localhost:8080/api/watchlist", {
  headers: {
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5..."
  }
});

```
It's used to know who the user is so we can fetch the proper data for that user specifically.

## Summary

* **Run:** `start-backend.cmd` (from IDE terminal)
* **Stop:** Press **Ctrl + C twice**
* **Swagger:** [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)

If you have any questions just let me know and I will edit this document as needed.
