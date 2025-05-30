```mermaid
---
title: User Login in Danayas Resorts Events Venue
---
flowchart TD
    START([Start]) -->
    CLICKS(User Clicks Login) -->
    DISPLAY(Display Login Form) -->
    FILLED{Form Filled Correctly?} -- No -->
    NO(Show Validation Errors) --> DISPLAY
    FILLED -- Yes --> 
    SUBMIT(Submit Form to Server) -->
    REDIRECT(Redirect User to Homepage) -->
    END([End])


                                  


```
