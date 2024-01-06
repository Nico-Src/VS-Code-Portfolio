# A Picross 3D Web Clone. (WIP)
[Play yourself](https://nico-src.github.io/VS-Code-Portfolio/projects/picross-3d/)<br>

## Level 2 Example
> 
![Level 2](https://i.imgur.com/hJQDvJD.png)

### Features (WIP):
| **Feature** | **Missing Implementation**                                                    |
|-------------|-------------------------------------------------------------------------------|
| Levels      | Colorization of the Final Result, Import / Export of the Level as a File      |
| Gameplay    | No Winning Screen yet (WIP), Level Select (Design not finished), Life & Timer |
| Editor      | Not implemented yet.                                                          |

### Rules:
> While Picross presents a rectangular grid of squares, which must be filled in to create a picture, Picross 3D uses a rectangular prism made of a number of smaller cubes, and must be chipped away in order to construct an image in three dimensions. Each row or column has at most one number corresponding to it, and many do not have any numbers at all; the number indicates how many cubes the row/column should contain when the picture is complete. If a number has a circle around it, it means that, while that number of cubes is the total amount in the row/column, they will be split up into two groups (for example, a 4 with a circle around it will be in two groups of either 1 and 3 or 2 and 2). If a number has a square around it, the cubes will be split up into three or more groups. A paintbrush may be used to mark cubes that definitely will remain in the image **[Right Click]** (which also prevents them from being broken accidentally), or a hammer to chip away at the unnecessary cubes **(Right Click + Alt)**. If an attempt is made to break a cube that is part of the image, the game will count this as a strike. If the player receives five strikes, the player is out and will have to start the puzzle over again. Players will also need to complete the stage within a certain amount of time.

Source: [Picross Fandom](https://picross.fandom.com/wiki/Picross_3D)

### Controls:
| **Key/Button** | **Special Key** | **Description**                                                                              |
|----------------|-----------------|----------------------------------------------------------------------------------------------|
| Left Click     |                 | Drag Handles / Rotate Camera                                                                 |
| Right Click    |                 | Mark Block that should remain (Marked Blocks cannot be broken until they are unmarked again) |
| Right Click    | + Alt           | Destroy Block (Will remove 1 Life if Block that should remain is broken)                     |
