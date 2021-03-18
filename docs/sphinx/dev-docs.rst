=======================
Developer Documentation
=======================
 
This section is meant to give an overview of the design behind DJ-LabBook for developers who are interested in playing with the code.
 
The code is based built on react typescript with the backend being built on flask and datajoint, thus it is highly recommended to get familiar with React's components and typical architecture design
 
Requirements:
=============
`Docker <https://www.docker.com/>`_
 
`Docker Compose <https://docs.docker.com/compose/>`_
 
Architecture Overview
=====================
 
All the major app react components are stored under /src/Components and are comprised of the following parts:
 
- :ref:`Login Component`
- :ref:`Navigation Bar Component`
- :ref:`Home Component` (Parent component to handle data passing between sub components)
    - :ref:`Side Menu Navigator Component`
    - :ref:`Table View Component`
 
Login Component
===============
.. image:: _static/images/Login.png
 
The login component only parent is the App.tsx which is the parent component of the entire app
 
At the moment the login progress and authentication is done in the following step:
 
- User types in database, username, and password.
- Front end sends the information to the back end /api/login route to authenticate.
- If authentication was successful then front end will receive a jwt token containing the information above including the password in the payload (NOTE: We aware that this is unsecure, but this will fix later)
- All following api requests will use the JWT for authentication. JWT is stored at the App.tsx level
 
Navigation Bar Component
========================
.. image:: _static/images/NavBarHighlight.png
 
The navigation bar handles getting the front end and the api version number and displaying. Also handles displaying the logo and login and sign out.
 
Side Menu Navigator Component
=============================
.. image:: _static/images/SideMenuHighlight.png
 
The side menu navigator consists of two sub components, namely the schema and table list view.
 
It also store a few buffer variables to keep track what schema the user select so far and only reports
back to the home component
 
Schema List Component
---------------------
Schema List view is responsible for the following:
- Upon being loaded, fetch all available schema under the given database connection
- Display all the schemas and restrict if the user types a non empty string into search box
- Upon selection of schema, use the callback to send the selected schema back to SideMenu component
 
Table List Component
--------------------
Table List view is responsible for the following:
- After the user selected a schema, fetch all the tables and its type from the backend
- Display all the tables and restrict if the user types a non empty string into the search box
- Upon the selection of a table, use the callback to send the table info back to the SideMenu component where it will send the info back to the home component.
 
Table View Component
====================
.. image:: _static/images/TableViewHighlight.png
 
Responsible for the handling of two sub components, the TableContent and TableInfo, along with fetching of the data required by both of them once 
this component receive a valid table name
 
Table Content
-------------
 
TODO: Need to add image here
Table Content is mainly responsible for the viewing, filtering, insertion, update, and deletion of tuples given a table, as such it is divided into 5 components:
- Table Content View (Display the tuples of the table)
- Filter Component (Filter the tuples of the table)
- Insert Component (Single tuple at a time)
- Update Component (Single tuple at a time)
- Deletion Component (Single tuple at a time, uses delete_quick on the backend thus the tuple must not have any dependencies)
 
Table Content View
~~~~~~~~~~~~~~~~~~
Table Content View is responsible for:
- Fetching and display tuple
- Contain the Filter, Insert, Update, and Delete
- Allowing the user to check a specific tuple to send one of the specific subcomponent such as insert, update, and delete_quick
 
Filter Component
~~~~~~~~~~~~~~~~
.. image:: _static/images/FilterComponentHighlight.png
Filter Component Notes:
- Allow the user to filter the tuples based on the available attributes (Cannot filter by blob or long blob)
- Upon each change, all the restrictions (represented by filter cards) are checked to see if they are valid, if so then trigger fetch with the new restrictions
- There is 1 second delay from the last change (such as typing) before the back end get queried and the view updates
 
Insert Component
~~~~~~~~~~~~~~~~
.. image:: _static/images/InsertComponentHighlight.png
Insert Components Notes:
- Allow the users to insert tuple using html inputs elements
- If there is a checked tuple in the content viewer than ask the user if they want to copy overview
 
Update Component
~~~~~~~~~~~~~~~~
.. image:: _static/images/UpdateComponentHighlight.png
Notes:
- User must select a tuple from table content viewer which will be copy over to this component for update
- Only allow update of none primary and none blob fields
 
Delete Component
~~~~~~~~~~~~~~~~
.. image:: _static/images/DeleteComponentHighlight.png
Notes:
- User must select a tuple from a table content viewer which will be copied over to this component for deletion.
- Delete is using delete_quick which means the tuple cannot have any child dependencies otherwise delete will fail.