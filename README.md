### CB-EX

Comic software for CB* collections

#### Pages

**Context Root / Port**
localhost:3800

**Views**

/organize	- List issues waiting to be filed, and process them.

**APIs**

/index/rebuild		- Rebuild the var

#### Databases
covers		- Issue name -> attachment

folders	- index: path
```javascript
{
   “_id”: “/Comic Strips/Calvin and Hobbes”,
   “_rev”: “1-55535e5668cb4302f398c59887112518”,
   “path”: “/Comic Strips/Calvin and Hobbes”,
   “parent”: “/Comic Strips”
}
```

issues - indexed by fully name
```javascript

Source
{
   “_id”: “/Volumes/VIDEO/comics/Comic Strips/Calvin and Hobbes/Calvin and Hobbes Complete Collection - 9 - Homocidal Psycho Jungle Cat.cbr”,
   “_rev”: “2-f557b1dd9ee37055b79dd24711cf7538”,
   “size”: 169995702,
   “name”: “Calvin and Hobbes Complete Collection - 9 - Homocidal Psycho Jungle Cat.cbr”,
   “location”: “/Comic Strips/Calvin and Hobbes/Calvin and Hobbes Complete Collection - 9 - Homocidal Psycho Jungle Cat.cbr”,
   “directory”: “/Comic Strips/Calvin and Hobbes/“
}
```

#### Commands

