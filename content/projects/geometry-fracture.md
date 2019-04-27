---
title: "Geometry Fracture"
date: 2014-04-30
thumbnail: "/img/geometry-fracture.png"
---

Computer code which fractures 3D geometry. Written in Python2 for Autodesk Maya <!--more-->

When run in Maya, this script creates a user interface with controls for creating a variety of breaks and fractures in geometry.
The script was written as a learning exercise to explore the [voronoi diagram algorithm](https://en.wikipedia.org/wiki/Voronoi_diagram), and its applications in procedural destruction.

{{< youtube C-x5FrOjVkI >}}

```python
import maya.cmds as cmds
import random
import string
import math

#debug new file
#cmds.file(f=True, new=True)

#before anything else, check for necessary plugin(s)
if (cmds.pluginInfo("nearestPointOnMesh", q=True, loaded=True) == False):
    try:
        cmds.loadPlugin("nearestPointOnMesh.mll")
    except:
        cmds.error("Cannot load necessary plugins (nearestPointOnMesh.mll). Script Cannot Continue.")

##############################
##                          ##
##    UI SYNC FUNCTIONS     ##
##                          ##
##############################

##################################
##         On selection         ##
##################################
def selectionChange():

    numVertices = 0
    numFaces = 0
    numEdges = 0

    selectedObjects = getSelectedMeshes()
    if len(selectedObjects) == 0:
        cmds.text("chipEdge", label="\n# of Edges selected: 0", e=True)
        cmds.text("chipVertex", label="\n# of Vertices selected: 0", e=True)
        cmds.text("chipFaces", label="\n# of Faces selected: 0", e=True)

    for obj in selectedObjects:
        ObjType = cmds.objectType(obj)

        if (ObjType == "mesh"):
            #get nums of current selection
            numVertices = cmds.polyEvaluate(selectedObjects[0], v=True)
            numFaces = cmds.polyEvaluate(selectedObjects[0], f=True)
            numEdges = cmds.polyEvaluate(selectedObjects[0], e=True)

            cmds.text("chipEdge", label="\n# of Edges selected: "+str(numEdges), e=True)
            cmds.text("chipVertex", label="\n# of Vertices selected: "+str(numVertices), e=True)
            cmds.text("chipFaces", label="\n# of Faces selected: "+str(numFaces), e=True)
        else:
            cmds.text("chipEdge", label="\n# of Edges selected: 0", e=True)
            cmds.text("chipVertex", label="\n# of Vertices selected: 0", e=True)
            cmds.text("chipFaces", label="\n# of Faces selected: 0", e=True)

##################################
##      Populate Node List      ##
##################################
def findDestNodes():

    #remove old nodes
    destNodes = cmds.optionMenu("destNodeSelect", q=True, ill=True)
    for node in destNodes:
        cmds.deleteUI(node)

    destNodes = []
    destNodes.append( cmds.menuItem(label="None", parent="destNodeSelect") )

    nodes = cmds.ls()
    for node in nodes:
        if cmds.objExists(node + ".destType"):
            destNodes.append( cmds.menuItem(label=node, parent="destNodeSelect") )

##################################
##        Selecte Node          ##
##################################
def selectDestNode( nodeName ):
    if(nodeName == "None"):
        return
    else:
        populateUI( nodeName )

##################################
##       Select Chip Type       ##
##################################
def chipOnChecked(checked):
    checked1 = cmds.checkBoxGrp("chipOn", q=True, v1=True)
    checked2 = cmds.checkBoxGrp("chipOn", q=True, v2=True)
    checked3 = cmds.checkBoxGrp("chipOn", q=True, v3=True)

    if checked1 == True:
        cmds.columnLayout("Vertices", e=True, en=True)
    else:
        cmds.columnLayout("Vertices", e=True, en=False)

    if checked2 == True:
        cmds.columnLayout("Edges", e=True, en=True)
    else:
        cmds.columnLayout("Edges", e=True, en=False)

    if checked3 == True:
        cmds.columnLayout("Faces", e=True, en=True)
    else:
        cmds.columnLayout("Faces", e=True, en=False)

##################################
##      Select Break Type       ##
##################################
def changeBreakPieces(selected):
    selected = cmds.radioButtonGrp("breakPieces", q=True, sl=True)

    if(selected == 2):
        cmds.rowLayout("breakPlane", edit=True, visible=False)
    else:
        cmds.rowLayout("breakPlane", edit=True,  visible=True)

##################################
##   Change Destruction Type    ##
##################################

def changeDefType(sel):
    sel = cmds.radioButtonGrp("defType", q=True, sl=True)

    cmds.columnLayout("Fracture", e=True, visible=False)
    cmds.columnLayout("Chip", e=True, visible=False)
    cmds.columnLayout("Break", e=True, visible=False)

    if(sel == 1):
        cmds.columnLayout("Fracture", e=True, visible=True)
    elif(sel == 2):
        cmds.columnLayout("Chip", e=True, visible=True)
    elif(sel == 3):
        cmds.columnLayout("Break", e=True, visible=True)


##################################
##  Change Attributes Function  ##
##################################

def changeAttributes( meshType ):

    options = ["Concrete", "Glass", "Plastic", "Styrofoam", "Stone", "Random" ]
    presetAttr = [ [ 0.7, 1, 1 ], [1, 3, 1], [0.4, 5, 0.2], [0.1, 0.5, 0.1], [1, 5, 0.9], [random.randrange(0,10), random.randrange(0,10), random.randrange(0,10), random.randrange(0,10), random.randrange(0,10)] ]

    for option in options:
        if option == meshType:
            optionNum = options.index(option)
            #print presetAttr[optionNum]
            cmds.floatSliderGrp("matDensity", e=True, v=presetAttr[optionNum][0] )
            cmds.floatSliderGrp("matGrainSize", e=True, v=presetAttr[optionNum][1] )
            cmds.floatSliderGrp("matScatterSize", e=True, v=presetAttr[optionNum][2] )

##############################
##                          ##
##       UI CREATION        ##
##                          ##
##############################

if(cmds.window("meshDes", exists=True)):
    cmds.deleteUI("meshDes", window=True)
win = cmds.window("meshDes", title="Mesh Destruction", menuBar=True, widthHeight=(483, 600))

cmds.columnLayout(rs=15)

###############################
##          Presets          ##
###############################
cmds.optionMenu(ni=6, label="Preset Options", cc=changeAttributes)
cmds.menuItem(label="Concrete")
cmds.menuItem(label="Glass")
cmds.menuItem(label="Plastic")
cmds.menuItem(label="Styrofoam")
cmds.menuItem(label="Stone")
cmds.menuItem(label="Random")

###############################
##    Destruction History    ##
###############################
cmds.optionMenu("destNodeSelect", label="Destruction Nodes:", cc=selectDestNode)
cmds.menuItem(label="None")

###############################
##      Mat Attributes       ##
###############################
cmds.frameLayout("Material Attributes (Advanced)", width=475, collapsable=True, cl=False)
cmds.floatSliderGrp("matDensity", label="Density", field=True, min=0.01, max=1, fmn=0.01, fmx=1)
cmds.columnLayout();
cmds.text("Granularity:", font="boldLabelFont")
cmds.floatSliderGrp("matGrainSize", label="Grain Size", field=True, min=0.01, max=5)
cmds.floatSliderGrp("matScatterSize", label="Scatter Size", field=True, min=0, max=1, fmn=0.01, fmx=1)
cmds.setParent("..")
cmds.setParent("..")

###############################
##       Deformations        ##
###############################
cmds.frameLayout(label="Deformation")
cmds.radioButtonGrp("defType", label="Type", nrb=3, la3=["Fracture", "Chip", "Break"], sl=1, cc=changeDefType)
cmds.text("Attributes:", font="boldLabelFont")

## FRACTURE
cmds.columnLayout("Fracture", width=475)
cmds.floatSliderGrp("fractureForce", label="Magnitude of force:", min=0, max=1, value=0.5, field=True)
cmds.rowLayout("fractureVector", nc=2)
cmds.button(l="Create Vector Control", c="createControlVector()")
cmds.textField("fractureVectorObject", text="--create vector--")
cmds.setParent("..")
cmds.setParent("..")

##CHIP
cmds.columnLayout("Chip", width=475, visible=False)
cmds.checkBoxGrp("chipOn", label="Chip mesh on: ", labelArray3=["Vertices", "Edges", "Faces"], ncb=3, cc=chipOnChecked)

cmds.columnLayout("Vertices", width=475, en=False)
cmds.text("chipVertex", label="\n# of Vertices selected: 0", font="boldLabelFont")
cmds.intSliderGrp("vertexPercentage", label="% of vertices to chip:", min=1, max=100, field=True)
cmds.setParent("..")

cmds.columnLayout("Edges", width=475, en=False)
cmds.text("chipEdge", label="\n# of Edges selected: 0", font="boldLabelFont")
cmds.intSliderGrp("edgePercentage", label="% of edges to chip:", min=1, max=100, field=True)
cmds.setParent("..")

cmds.columnLayout("Faces", width=475, en=False)
cmds.text("chipFaces", label="\n# of Faces selected: 0", font="boldLabelFont")
cmds.intSliderGrp("facePercentage", label="% of faces to chip:", min=1, max=100, field=True)
cmds.setParent("..")
cmds.setParent("..")


##BREAK
cmds.columnLayout("Break", width=475, visible=False)
cmds.radioButtonGrp("breakPieces", label="Pieces Amount: ", labelArray2=["Interactive Split", "Crumble"], nrb=2, sl=2, cc=changeBreakPieces)
cmds.rowLayout("breakPlane", nc=2, visible=False)
cmds.button(l="Create Plane Control", c="createControlPlane()")
cmds.textField("breakPlaneObject", text="--create plane--")
cmds.setParent("..")
cmds.setParent("..")


cmds.button(label="DEFORM", c=("performDeform()"))
cmds.setParent("..")
cmds.setParent("..")
cmds.showWindow(win)

#debug create default shape
changeAttributes( "Concrete" )
#cmds.polyTorus(r=4, sr=1)
#cmds.polyCube(w=5, h=5, d=5)

#populate ui
cmds.scriptJob(event=["SelectionChanged", selectionChange])
findDestNodes()

##############################
##                          ##
##    FRACTURE FUNCTIONS    ##
##                          ##
##############################

##############################
##       Main Function      ##
##############################
def performDeform():

    #open undo Chunk
    cmds.undoInfo( ock=True )
    #cmds.undoInfo( swf=False )

    #get selected meshes
    objs = getSelectedMeshes();
    if len(objs) == 0:
        cmds.warning("Please select a mesh before performing deformation")
        return

    #progress window
    #remove old window to avoid errors
    if(cmds.window("destProgress", exists=True)):
        cmds.deleteUI("destProgress", window=True)
    win = cmds.window("destProgress", title="Destruction Progress", width=350, h=50 )
    cmds.columnLayout(w=350)
    cmds.text("destProgressText", font="boldLabelFont", label="Getting Ready", rs=False, w=350, align="left")
    cmds.progressBar("destProgressBar", min=0, max=1000, w=350, ii=True)
    cmds.setParent("..")
    cmds.showWindow(win)

    #collect variables
    type = cmds.radioButtonGrp("defType", q=True, select=True)

    properties = []
    properties.append( cmds.floatSliderGrp("matDensity", q=True, v=True) )
    properties.append( cmds.floatSliderGrp("matGrainSize", q=True, v=True) )
    properties.append( cmds.floatSliderGrp("matScatterSize", q=True, v=True) )

    vectorPlane = []
    vectorPlane.append( cmds.textField("fractureVectorObject", q=True, text=True) )
    vectorPlane.append( cmds.textField("breakPlaneObject", q=True, text=True) )

    #do fracture
    pieces = []
    name = "unknown"
    if(type == 1):
        name = "fractureResult"
        pieces = doFracture(objs, properties, vectorPlane)

    #do chip
    elif(type == 2):
        name = "chipResult"
        pieces = doChip(objs, properties)

    #do break
    elif(type == 3):
        name = "breakResult"
        breakType = cmds.radioButtonGrp("breakPieces", q=True, select=True)
        pieces = doBreak(objs, breakType, properties, vectorPlane)

    #if successfull create node to store history
    if( len(pieces) > 0 ):
        destNode = createDestructionNode(objs[0], properties)
        #add controls to node if they exist
        for ctrl in vectorPlane:
            if cmds.objExists(ctrl):
                cmds.parent(ctrl, destNode)

        #put pieces under destruction node and rename them
        for piece in pieces:
            cmds.parent(piece, destNode)
            cmds.rename(piece, name)

        #repopulate ui
        findDestNodes()

        cmds.select(destNode)
    else:
        cmds.select(objs[0])

    #clean up
    #close undo Chunk
    cmds.undoInfo( cck=True )
    #cmds.undoInfo( swf=True )
    if(cmds.window("destProgress", exists=True)):
        cmds.deleteUI("destProgress", window=True)

##############################
##       Fracture           ##
##############################
def doFracture(mesh, matProperties, vectorPlane):

    force = cmds.floatSliderGrp("fractureForce", q=True, v=True)

    #IMPACT
    #check to see vector control exists
    if(cmds.objExists(vectorPlane[0]) == False):
        if vectorPlane[0] == "--create vector--":
            cmds.warning("Please define a control vector")
        else:
            cmds.warning("The specified vector control does not exist")
        cmds.textField("fractureVectorObject", edit=True, bgc=[0.86, 0.81, 0.53] )
        return []

    #get transformation matrix
    matrix = cmds.xform(vectorPlane[0], q=True, ws=True, matrix=True)
    #get line from vector by multiplying usual default points through matrix
    #first point is just translation
    pointA = [matrix[12], matrix[13], matrix[14]]
    #second is just [1, 0, 0]
    pointB = [ matrix[0] + matrix[12], matrix[1] + matrix[13], matrix[2] + matrix[14] ]

    #find impact point
    #find all intesecting faces
    impact = None
    lowestT = None
    faceEqn = None
    faceVerts = None
    numFaces = cmds.polyEvaluate(mesh[0], f=True)

    cmds.text("destProgressText", e=True, label="Fracture: Find Collision")
    cmds.progressBar("destProgressBar", e=True, pr=0, max=numFaces)

    for i in range(numFaces):
        face = cmds.select(mesh[0] + ".f[" + str(i) + "]")
        vertNums = cmds.polyInfo(faceToVertex=True)
        vertNums = string.split(vertNums[0], ":")[1]
        vertNums = string.split(vertNums, "Hard")[0]
        vertNums = string.split(vertNums)

        #make plane equation from vertices
        verts = []
        for num in vertNums:
            verts.append( cmds.xform(mesh[0] + ".vtx[" + num + "]", q=True, ws=True, translation=True) )
        planeEqn = getPlaneEquation(verts)

        #find intesection point
        t = getLinePlaneIntersect(planeEqn, pointA, pointB)
        if t is None:
            continue
        intersection = [ pointA[0] + t * (pointB[0] - pointA[0]), pointA[1] + t * (pointB[1] - pointA[1]), pointA[2] + t * (pointB[2] - pointA[2]) ]

        #check if its on the actual mesh
        if isPointOnMesh( mesh[0], intersection ):
            #keep the one farthest back on the line
            if( lowestT is None or t < lowestT ):
                impact = intersection
                lowestT = t
                faceEqn = planeEqn
                faceVerts = verts
        cmds.progressBar("destProgressBar", e=True, step=1)

    if lowestT is None:
        cmds.warning("control vector does not intersect the given mesh")
        return []

    #calc radius by force
    radius = force / matProperties[0]

    if matProperties[0] > radius:
        cmds.warning("Your material is too dense, or force too weak to cause destruction")
        return []

    #to get transform matrix, need three normal vectors for axis
    matrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
    #y axis is in plane equation
    matrix[4] = faceEqn[0]
    matrix[5] = faceEqn[1]
    matrix[6] = faceEqn[2]
    #z can be any edge vector
    zVec = [faceVerts[0][0] - faceVerts[1][0], faceVerts[0][1] - faceVerts[1][1], faceVerts[0][2] - faceVerts[1][2]]
    mag = getMag(zVec)
    zVec = [ zVec[0] / mag, zVec[1] / mag, zVec[2] / mag ]
    matrix[8] = zVec[0]
    matrix[9] = zVec[1]
    matrix[10] = zVec[2]
    #x is the cross product of Y and z vec
    xVec = getCrossProduct(faceEqn, zVec)
    matrix[0] = xVec[0]
    matrix[1] = xVec[1]
    matrix[2] = xVec[2]
    #Translation is impact point
    matrix[12] = impact[0]
    matrix[13] = impact[1]
    matrix[14] = impact[2]

    #starting from center, spiral out making centers
    numPiece = int((radius * 2.0) / matProperties[0]) + 2.0
    cmds.text("destProgressText", e=True, label="Fracture: Define Pieces")
    cmds.progressBar("destProgressBar", e=True, pr=0, max=radius/matProperties[0] + numPiece * numPiece)
    centers = []
    surroundingCenters = []
    for r in rangef( matProperties[0] * 0.5, radius, matProperties[0]):
        cmds.progressBar("destProgressBar", e=True, step=1)
        circ = 2 * math.pi * r
        step = (matProperties[0] / circ) * 360
        for deg in rangef( random.uniform(0, step), 360, step ):
            p = [ math.cos(deg) * r, 0, math.sin(deg) * r ]
            tp = [ p[0]*matrix[0] + p[1]*matrix[4] + p[2]*matrix[8] + matrix[12],  p[0]*matrix[1] + p[1]*matrix[5] + p[2]*matrix[9] + matrix[13], p[0]*matrix[2] + p[1]*matrix[6] + p[2]*matrix[10] + matrix[14]]
            centers.append( tp )
            surroundingCenters.append( tp )

    #create outsides by filling
    scatterRange = 0.45 * matProperties[1] * matProperties[2]
    for x in rangef( -numPiece/2.0, numPiece/2.0 + 0.1, 1.0):
        for z in rangef( -numPiece/2.0, numPiece/2.0 + 0.1, 1.0):
            cmds.progressBar("destProgressBar", e=True, step=1)
            #point above (no y scatter
            X = x * matProperties[0] + random.uniform(-scatterRange, scatterRange)
            Z = z * matProperties[0] + random.uniform(-scatterRange, scatterRange)
            surroundingCenters.append( [ X*matrix[0] + matProperties[0]*matrix[4] + Z*matrix[8] + matrix[12],  X*matrix[1] + matProperties[0]*matrix[5] + Z*matrix[9] + matrix[13], X*matrix[2] + matProperties[0]*matrix[6] + Z*matrix[10] + matrix[14] ] )
            #below
            X = x * matProperties[0] + random.uniform(-scatterRange, scatterRange)
            Z = z * matProperties[0] + random.uniform(-scatterRange, scatterRange)
            Y = -matProperties[0] + random.uniform(-scatterRange, scatterRange)
            surroundingCenters.append( [ X*matrix[0] + Y*matrix[4] + Z*matrix[8] + matrix[12],  X*matrix[1] + Y*matrix[5] + Z*matrix[9] + matrix[13], X*matrix[2] + Y*matrix[6] + Z*matrix[10] + matrix[14] ] )
            # in center if at edge
            if( x == -numPiece/2 or z == -numPiece/2 or x == numPiece/2 or z == numPiece/2 ):
                X = x * matProperties[0] + random.uniform(-scatterRange, scatterRange)
                Z = z * matProperties[0] + random.uniform(-scatterRange, scatterRange)
                Y = random.uniform(-scatterRange, scatterRange)
                surroundingCenters.append( [ X*matrix[0] + Y*matrix[4] + Z*matrix[8] + matrix[12],  X*matrix[1] + Y*matrix[5] + Z*matrix[9] + matrix[13], X*matrix[2] + Y*matrix[6] + Z*matrix[10] + matrix[14] ] )

    pieces = doVoronoi(mesh[0], centers, surroundingCenters )

    cmds.text("destProgressText", e=True, label="Fracture: Finalize")
    cmds.progressBar("destProgressBar", e=True, pr=0, max=3)

    combined = combinePieces(pieces)
    cmds.progressBar("destProgressBar", e=True, step=1)

    #sutract from original

    newMesh = cmds.duplicate(mesh[0])
    cmds.progressBar("destProgressBar", e=True, step=1)
    cmds.DeleteAllHistory()
    newMesh = cmds.polyBoolOp( mesh[0], combined, op=2, ch=False )
    cmds.progressBar("destProgressBar", e=True, step=1)

    pieces.append(newMesh)
    return pieces


##############################
##         Chip             ##
##############################
def doChip(mesh, matProperties):

    allPieces = []
    allMeshes = []
    #get number of vertices, edges, and faces of selected object
    numVertices = cmds.polyEvaluate(mesh, v=True)
    numFaces = cmds.polyEvaluate(mesh, f=True)
    numEdges = cmds.polyEvaluate(mesh, e=True)

    #check what to chip
    checked1 = cmds.checkBoxGrp("chipOn", q=True, v1=True)
    checked2 = cmds.checkBoxGrp("chipOn", q=True, v2=True)
    checked3 = cmds.checkBoxGrp("chipOn", q=True, v3=True)

    verticesToChip = 0
    edgesToChip = 0
    facesToChip = 0

    if checked1 == True:
        #get number of verts to chip
        vPercent = cmds.intSliderGrp("vertexPercentage", q=True, value=True)
        verticesToChip = (vPercent*numVertices) / 100



        #make sure no divide by zero
        if verticesToChip == 0:
            verticesToChip = 1

        #step for "randomly" choosing what to chip
        step = round(numVertices / verticesToChip)
        #start vertex so it isn't the same every time
        startValue = random.randrange(0, step)
        currentVert = startValue

        cmds.text("destProgressText", e=True, label="Chip: Creating Vertex Chips")
        cmds.progressBar("destProgressBar", e=True, max=verticesToChip, pr=0)

        #loop through amount of vertices that are to be chiped
        for i in range(verticesToChip):
            vertexPos = [] #holds three x,y,z
            verticesPosChip = [] #holds vertexPos to pass to voronoi
            vertexPos = cmds.xform(str(mesh[0])+".vtx["+str(int(currentVert))+"]", q=True, ws=True, translation=True)
            verticesPosChip.append(vertexPos)

            scatterRange = 0.45 * matProperties[1] * matProperties[2]

            #put start and end values for x, y, z in two lists
            start = []
            end = []
            for coord in vertexPos:
                startVal = coord -  matProperties[1]
                endVal = coord + matProperties[1]*1.1

                start.append(startVal)
                end.append(endVal)

            vertexSeeds = []
            #create locator box around vertex to chip
            for x in rangef( start[0], end[0], matProperties[1] ):
                for y in rangef( start[1], end[1], matProperties[1] ):
                    for z in rangef( start[2], end[2], matProperties[1] ):
                        if x==0 and y==0 and z==0:
                            continue
                        if(scatterRange > 0):
                            p = [x + random.uniform(-scatterRange, scatterRange), y + random.uniform(-scatterRange, scatterRange), z + random.uniform(-scatterRange, scatterRange) ]
                        else:
                            p = [x, y, z]
                        vertexSeeds.append(p)
                     #   cmds.spaceLocator(p=p)
                        if(cmds.progressBar("destProgressBar", q=True, isCancelled=True)):
                            return
                        else:
                            cmds.progressBar("destProgressBar", e=True, step=1)
            currentVert += step
            if len(vertexSeeds) > 1:
                pieces = doVoronoi(mesh[0], verticesPosChip, vertexSeeds)
                for piece in pieces:
                    allPieces.append(piece)
            else:
                cmds.warning("not enough seeds, try a larger grain size")

    if checked2 == True:
        #get number of edges to chip
        ePercent = cmds.intSliderGrp("edgePercentage", q=True, value=True)
        edgesToChip = (ePercent*numEdges) / 100

        #make sure no divide by zero
        if edgesToChip == 0:
            edgesToChip = 1

        #step for "randomly" choosing what to chip
        step = round(numEdges / edgesToChip)
        #start edge so it isn't the same every time
        startValue = random.randrange(0, step)
        currentEdge = startValue

        cmds.text("destProgressText", e=True, label="Chip: Creating Edge Chips")
        cmds.progressBar("destProgressBar", e=True, max=edgesToChip, pr=0)

        #loop through amount of vertices that are to be chiped
        for i in range(edgesToChip):
            vPos = [] #holds edge's vertices
            point = []  #holds point on edge to chip
            edgesPosChip = [] #holds point to pass to voronoi
            edge = cmds.select(mesh[0] + ".e[" + str(int(currentEdge)) + "]")
            vertNums = cmds.polyInfo(edgeToVertex=True)
            vertNums = string.split(vertNums[0], ":")[1]
            vertNums = string.split(vertNums, "Hard")[0]
            vertNums = string.split(vertNums)

            for j in vertNums:
                vPos.append( cmds.xform(mesh[0] + ".vtx[" + j + "]", q=True, ws=True, translation=True) )

            #get random point on edge using line equation and edge's vertices
            t = random.uniform(0.35, 0.55)
            for i in range(3):
                p = vPos[0][i] + t*(vPos[1][i] - vPos[0][i])
                point.append(p)

            edgesPosChip.append(point)
            scatterRange = 0.45 * matProperties[1] * matProperties[2]

            #put start and end values for x, y, z in two lists
            start = []
            end = []
            for coord in point:
                startVal = coord -  matProperties[1]
                endVal = coord + matProperties[1]*1.1

                start.append(startVal)
                end.append(endVal)
            edgeSeeds = []
            #create locator box around edge point to chip
            for x in rangef( start[0], end[0], matProperties[1] ):
                for y in rangef( start[1], end[1], matProperties[1] ):
                    for z in rangef( start[2], end[2], matProperties[1] ):
                        if x==0 and y==0 and z==0:
                            continue
                        if(scatterRange > 0):
                            p = [x + random.uniform(-scatterRange, scatterRange), y + random.uniform(-scatterRange, scatterRange), z + random.uniform(-scatterRange, scatterRange) ]
                        else:
                            p = [x, y, z]
                        edgeSeeds.append(p)
                        #cmds.spaceLocator(p=p)
                        if(cmds.progressBar("destProgressBar", q=True, isCancelled=True)):
                            return
                        else:
                            cmds.progressBar("destProgressBar", e=True, step=1)
            currentEdge += step

            if len(edgeSeeds) > 1:
                pieces = doVoronoi(mesh[0], edgesPosChip, edgeSeeds)
                for piece in pieces:
                    allPieces.append(piece)
            else:
                cmds.warning("not enough seeds, try a larger grain size")

    if checked3 == True:
        #get number of faces to chip
        fPercent = cmds.intSliderGrp("facePercentage", q=True, value=True)
        facesToChip = (fPercent*numFaces) / 100

        #make sure no divide by zero
        if facesToChip == 0:
            facesToChip = 1

        #step for "randomly" choosing what to chip
        step = round(numFaces / facesToChip)
        #start vertex so it isn't the same every time
        startValue = random.randrange(0, step)
        currentFace = startValue

        cmds.text("destProgressText", e=True, label="Chip: Creating Edge Chips")
        cmds.progressBar("destProgressBar", e=True, max=facesToChip, pr=0)

        #loop through amount of vertices that are to be chiped
        for i in range(facesToChip):
            edgePoints = [] # holds points on edge to average
            facePosChip = [] #holds point to pass to voronoi

            #get face values in to edges
            face = cmds.select(mesh[0] + ".f[" + str(int(currentFace)) + "]")
            edgeNum = cmds.polyInfo(faceToEdge=True)
            edgeNum = string.split(edgeNum[0], ":")[1]
            edgeNum = string.split(edgeNum, "Hard")[0]
            edgeNum = string.split(edgeNum)

            #loop through edges to get random point on edge to average
            for edge in edgeNum:
                vPos = [] #holds the vertex positions of face
                #get edge values in to vertices
                edge = cmds.select(mesh[0] + ".e[" + str(int(edge)) + "]")
                vertNum = cmds.polyInfo(edgeToVertex=True)
                vertNum = string.split(vertNum[0], ":")[1]
                vertNum = string.split(vertNum, "Hard")[0]
                vertNum = string.split(vertNum)

                #get vertex positions to get random point on edge
                for vertex in vertNum:
                    vPos.append( cmds.xform(mesh[0] + ".vtx[" + vertex + "]", q=True, ws=True, translation=True) )

                #get random point on edge using line equation and edge's vertices
                t = random.uniform(0.2, 0.8)
                point = []
                for i in range(3):
                    p = vPos[0][i] + t*(vPos[1][i] - vPos[0][i])
                    point.append(p)
                #print "point: "+str(point)
                edgePoints.append(point)

            averagedPoint = []
            #average random points and append to averagedPoint to send
            for i in range(3):
                ap = 0
                for j in range(len(edgePoints)):
                    ap += edgePoints[j][i]
                ap /= 4
                averagedPoint.append( ap )

            facePosChip.append(averagedPoint)
            scatterRange = 0.45 * matProperties[1] * matProperties[2]

            #put start and end values for x, y, z in two lists
            start = []
            end = []
            for coord in averagedPoint:
                startVal = coord -  matProperties[1]
                endVal = coord + matProperties[1]*1.1

                start.append(startVal)
                end.append(endVal)
            faceSeeds = []
            #create locator box around edge point to chip
            for x in rangef( start[0], end[0], matProperties[1] ):
                for y in rangef( start[1], end[1], matProperties[1] ):
                    for z in rangef( start[2], end[2], matProperties[1] ):
                        if x==0 and y==0 and z==0:
                            continue
                        if(scatterRange > 0):
                            p = [x + random.uniform(-scatterRange, scatterRange), y + random.uniform(-scatterRange, scatterRange), z + random.uniform(-scatterRange, scatterRange) ]
                        else:
                            p = [x, y, z]
                        faceSeeds.append(p)
                        #cmds.spaceLocator(p=p)
                        if(cmds.progressBar("destProgressBar", q=True, isCancelled=True)):
                            return
                        else:
                            cmds.progressBar("destProgressBar", e=True, step=1)
            currentFace += step

            if len(faceSeeds) > 1:
                pieces = doVoronoi(mesh[0], facePosChip, faceSeeds)
                for piece in pieces:
                    allPieces.append(piece)
            else:
                cmds.warning("not enough seeds, try a larger grain size")

    together = None
    for piece in allPieces:
        if together == None:
            together = [piece]
        else:
            together = cmds.polyBoolOp(together[0], piece, op=1, ch=False)

    temp = cmds.duplicate(together)
    newMesh = cmds.duplicate(mesh)
    newMesh = cmds.polyBoolOp(newMesh[0], temp, op=2, ch=False)

    cmds.select(together)
    if(cmds.polyEvaluate(shell=True) > 1):
        pieces = cmds.polySeparate(together)
        pieces.pop(len(pieces)-1)
    else:
        pieces = together
    pieces.append( newMesh[0] )

    return pieces


##############################
##          Break           ##
##############################
def doBreak(mesh, breakType, matProperties, vectorPlane):
    if(breakType == 1):
        #check to see vector control exists
        if(cmds.objExists(vectorPlane[1]) == False):
            if vectorPlane[1] == "--create plane--":
                cmds.warning("Please define a plane vector")
            else:
                cmds.warning("The specified plane control does not exist")
            cmds.textField("breakPlaneObject", edit=True, bgc=[0.86, 0.81, 0.53] )
            return []

        cmds.text("destProgressText", e=True, label="Split: Calculating Seeds")
        cmds.progressBar("destProgressBar", e=True, max=2, pr=0)

        #get bounding box
        bBox = cmds.polyEvaluate(mesh[0], boundingBox=True)

        #get plane
        #get transformation matrix
        matrix = cmds.xform(vectorPlane[1], q=True, ws=True, matrix=True)
        #get normal from plane by multiplying usual default points through matrix
        #first point is just translation
        pointA = [matrix[12], matrix[13], matrix[14]]
        #second is just [0, 0, 1]
        pointB = [ matrix[8] + matrix[12], matrix[9] + matrix[13], matrix[10] + matrix[14] ]
        planeEqn = [ pointB[0] - pointA[0], pointB[1] - pointA[1], pointB[2] - pointA[2] ]
        planeEqn = normalize(planeEqn)
        #Ax + By + Cz + D = 0
        #D = -(Ax + By + Cz)
        #get point on plane (point A) and multiply to get D
        planeEqn.append( -planeEqn[0] * pointA[0] - planeEqn[1] * pointA[1] - planeEqn[2] * pointA[2] )

        #decide on 4 edges
        #find where plane is most facing
        yDot = max( abs( getDotProduct(planeEqn, [0, 1, 0]) ), abs( getDotProduct(planeEqn, [0, -1, 0]) ) )
        xDot = max( abs( getDotProduct(planeEqn, [1, 0, 0]) ), abs( getDotProduct(planeEqn, [-1, 0, 0]) ) )
        zDot = max( abs( getDotProduct(planeEqn, [0, 0, 1]) ), abs( getDotProduct(planeEqn, [0, 0, -1]) ) )

        cmds.progressBar("destProgressBar", e=True, step=1)

        #get intersections
        #largest dot shows orientation of plane
        #then get intersecting bounding box points
        inMesh = False
        if yDot >= xDot and yDot >= zDot:
            edges = [
                [ [bBox[0][0], bBox[1][0], bBox[2][0]], [bBox[0][0], bBox[1][1], bBox[2][0]] ],
                [ [bBox[0][0], bBox[1][0], bBox[2][1]], [bBox[0][0], bBox[1][1], bBox[2][1]] ],
                [ [bBox[0][1], bBox[1][0], bBox[2][0]], [bBox[0][1], bBox[1][1], bBox[2][0]] ],
                [ [bBox[0][1], bBox[1][0], bBox[2][1]], [bBox[0][1], bBox[1][1], bBox[2][1]] ]
            ]
            points = []
            for edge in edges:
                #calculate y, keep x and z
                t = getLinePlaneIntersect(planeEqn, edge[0], edge[1])
                if t < 1 and t > 0:
                    inMesh = True
                points.append( [ edge[0][0], edge[0][1] + t * (edge[1][1] - edge[0][1]) , edge[0][2] ] )
        elif xDot >= yDot and xDot >= zDot:
            edges = [
                [ [bBox[0][0], bBox[1][0], bBox[2][0]], [bBox[0][1], bBox[1][0], bBox[2][0]] ],
                [ [bBox[0][0], bBox[1][0], bBox[2][1]], [bBox[0][1], bBox[1][0], bBox[2][1]] ],
                [ [bBox[0][0], bBox[1][1], bBox[2][0]], [bBox[0][1], bBox[1][1], bBox[2][0]] ],
                [ [bBox[0][0], bBox[1][1], bBox[2][1]], [bBox[0][1], bBox[1][1], bBox[2][1]] ]
            ]
            points = []
            for edge in edges:
                #calculate x, keep y and z
                t = getLinePlaneIntersect(planeEqn, edge[0], edge[1])
                if t < 1 and t > 0:
                    inMesh = True
                points.append( [ edge[0][0] + t * (edge[1][0] - edge[0][0]), edge[0][1], edge[0][2] ] )
        else:
            edges = [
                [ [bBox[0][0], bBox[1][0], bBox[2][0]], [bBox[0][0], bBox[1][0], bBox[2][1]] ],
                [ [bBox[0][0], bBox[1][1], bBox[2][0]], [bBox[0][0], bBox[1][1], bBox[2][1]] ],
                [ [bBox[0][1], bBox[1][0], bBox[2][0]], [bBox[0][1], bBox[1][0], bBox[2][1]] ],
                [ [bBox[0][1], bBox[1][1], bBox[2][0]], [bBox[0][1], bBox[1][1], bBox[2][1]] ]
            ]
            points = []
            for edge in edges:
                #calculate z, keep x and y
                t = getLinePlaneIntersect(planeEqn, edge[0], edge[1])
                if t < 1 and t > 0:
                    inMesh = True
                points.append( [ edge[0][0], edge[0][1], edge[0][2] + t * (edge[1][2] - edge[0][2]) ] )

        if(inMesh == False):
            cmds.warning("Control Plane does not intersect the selected mesh")
            return []

        #store two edges fro main interpolation
        topBottom = [
            [points[0], points[1]],
            [points[2], points[3]]
        ]

        cmds.progressBar("destProgressBar", e=True, step=1)

        #interpolate across edges, creating rows
        centers = []
        surroundingCenters = []
        scatterRange = 0.45 * matProperties[1] * matProperties[2]
        uStep = 1.0 / (getMag(topBottom[0][0], topBottom[0][1]) / matProperties[1])
        for u in rangef(0, 1, uStep):
            top = [
                topBottom[0][0][0] + u * (topBottom[0][1][0] - topBottom[0][0][0]),
                topBottom[0][0][1] + u * (topBottom[0][1][1] - topBottom[0][0][1]),
                topBottom[0][0][2] + u * (topBottom[0][1][2] - topBottom[0][0][2])
            ]
            bottom = [
                topBottom[1][0][0] + u * (topBottom[1][1][0] - topBottom[1][0][0]),
                topBottom[1][0][1] + u * (topBottom[1][1][1] - topBottom[1][0][1]),
                topBottom[1][0][2] + u * (topBottom[1][1][2] - topBottom[1][0][2])
            ]
            vStep = 1.0 / (getMag(top, bottom) / matProperties[1])
            for v in rangef(0, 1, vStep):
                    posX = top[0] + v * (bottom[0] - top[0])
                    posY = top[1] + v * (bottom[1] - top[1])
                    posZ = top[2] + v * (bottom[2] - top[2])
                    main = [
                        posX + random.uniform(-scatterRange, scatterRange),
                        posY + random.uniform(-scatterRange, scatterRange),
                        posZ + random.uniform(-scatterRange, scatterRange)
                    ]
                    centers.append( main )
                    surroundingCenters.append( main )
                    surroundingCenters.append( [posX + planeEqn[0] * matProperties[1] + random.uniform(-scatterRange, scatterRange), posY + planeEqn[1] * matProperties[1] + random.uniform(-scatterRange, scatterRange), posZ + planeEqn[2] * matProperties[1] + random.uniform(-scatterRange, scatterRange)] )

        cmds.progressBar("destProgressBar", e=True, step=1)

        #get pieces
        pieces = doVoronoi(mesh[0], centers, surroundingCenters, False)

        cmds.text("destProgressText", e=True, label="Split: Finalizing")
        cmds.progressBar("destProgressBar", e=True, max = 3 + len(pieces), pr=0)

        #add all pieces together to get one half
        combined = combinePieces( pieces )
        cmds.progressBar("destProgressBar", e=True, step=1)

        #delete pieces
        for piece in pieces:
            cmds.delete(piece)
            cmds.progressBar("destProgressBar", e=True, step=1)

        #bool with mesh
        half1 = cmds.duplicate(mesh[0])
        half1 = cmds.polyBoolOp(half1, combined, op=2, ch=False)
        cmds.progressBar("destProgressBar", e=True, step=1)

        #bool to get other half
        half2 = cmds.duplicate(mesh[0])
        temp = cmds.duplicate(half1[0])
        half2 = cmds.polyBoolOp(half2, temp, op=2, ch=False)
        cmds.progressBar("destProgressBar", e=True, step=1)

        cmds.select(half1, add=True)
        return [half1, half2]

    elif(breakType == 2):
        boundingBox = []
        seeds = []

        #get bounding box
        boundingBox = cmds.polyEvaluate(mesh[0], boundingBox=True)
        numPoints = ( boundingBox[0][1] - boundingBox[0][0] ) * ( boundingBox[1][1] - boundingBox[1][0] ) * ( boundingBox[2][1] - boundingBox[2][0] )

        cmds.text("destProgressText", e=True, label="Voronoi: Calculating Seeds")
        cmds.progressBar("destProgressBar", e=True, max=numPoints, pr=0)

        #generate seed zones with noise
        #only keep if inside mesh
        scatterRange = 0.45 * matProperties[1] * matProperties[2]
        for x in rangef( boundingBox[0][0], boundingBox[0][1], matProperties[1] ):
            for y in rangef( boundingBox[1][0], boundingBox[1][1], matProperties[1] ):
                for z in rangef( boundingBox[2][0], boundingBox[2][1], matProperties[1] ):
                    if(scatterRange > 0):
                        p = [x + random.uniform(-scatterRange, scatterRange), y + random.uniform(-scatterRange, scatterRange), z + random.uniform(-scatterRange, scatterRange) ]
                    else:
                        p = [x, y, z]
                    if(isPointInMesh(mesh[0], p)):
                        seeds.append(p)
                       # cmds.spaceLocator(p=p)
                    cmds.progressBar("destProgressBar", e=True, step=1)
        if len(seeds) > 1:
            return doVoronoi(mesh[0], seeds, seeds)
        else:
            cmds.warning("not enough seeds, try a smaller grain size")
            return []

##############################
##         Voronoi          ##
##############################
def doVoronoi( mesh, pieceCenters, surroundingCenters, boolMesh=True ):

    output = []

    #get bounding box
    boundingBox = cmds.polyEvaluate(mesh, boundingBox=True)
    #get mesh offset from 0 and dimensions
    offsetX = boundingBox[0][1] - 0.5 * (boundingBox[0][1] - boundingBox[0][0])
    offsetY = boundingBox[1][1] - 0.5 * (boundingBox[1][1] - boundingBox[1][0])
    offsetZ = boundingBox[2][1] - 0.5 * (boundingBox[2][1] - boundingBox[2][0])
    boundW = boundingBox[0][1] - boundingBox[0][0]
    boundH = boundingBox[1][1] - boundingBox[1][0]
    boundD = boundingBox[2][1] - boundingBox[2][0]
    boundMaxDist = math.sqrt( boundW * boundW + boundH * boundH + boundD * boundD )
    #create mesh from bounding box
    boundingBoxMesh = cmds.polyCube( w=boundW, h=boundH, d=boundD, sx=1, sy=1, sz=1, ch=False)
    cmds.move( offsetX, x=True, a=True)
    cmds.move( offsetY, y=True, a=True)
    cmds.move( offsetZ, z=True, a=True)

    cmds.text("destProgressText", e=True, label="Voronoi: Creating Pieces")
    cmds.progressBar("destProgressBar", e=True, pr=0, max=len(pieceCenters))
    #go through points left over and find close points
    for center in pieceCenters:
        #create initial piece
        #cube the size of mesh bounding box
        piece = cmds.duplicate(boundingBoxMesh[0])

        for point in surroundingCenters:
            if(point == center):
                continue
            #get vector to point and to dividing plane
            centerToPoint = [point[0] - center[0], point[1]-center[1], point[2]-center[2]]
            planeCenter = [center[0] + centerToPoint[0] * 0.5, center[1] + centerToPoint[1] * 0.5, center[2] + centerToPoint[2] * 0.5]
            #normalize plane normal vector
            mag = getMag(centerToPoint)
            planeEqn = [centerToPoint[0]/mag, centerToPoint[1]/mag, centerToPoint[2]/mag]
            #get local D for plane equation
            #planeEqn.append( -( planeEqn[0] * localPlaneCenter[0] + planeEqn[1] * localPlaneCenter[1] + planeEqn[2] * localPlaneCenter[2]) )
            planeEqn.append( -( planeEqn[0] * planeCenter[0] + planeEqn[1] * planeCenter[1] + planeEqn[2] * planeCenter[2]) )
            #also add magnitude of vector for halfway point
            planeCenterDist = getMag(planeCenter)
            #if it intersects with any current edges, use it
            useFace = False

            numEdges = cmds.polyEvaluate(piece[0], e=True)
            #go through edges and check for intersection
            for i in range(numEdges):
                edge = cmds.select(piece[0] + ".e[" + str(i) + "]")
                vertNums = cmds.polyInfo(edgeToVertex=True)
                vertNums = string.split(vertNums[0], ":")[1]
                vertNums = string.split(vertNums, "Hard")[0]
                vertNums = string.split(vertNums)

                verts = []
                for i in vertNums:
                    verts.append( cmds.xform(piece[0] + ".vtx[" + i + "]", q=True, ws=True, translation=True) )

                t = getLinePlaneIntersect(planeEqn, verts[0], verts[1])

                if t >= 0 and t <= 1 :
                    useFace = True
                    break

            if useFace:
                #create cube with proper plane and boolean with shape
                temp = cmds.polyPlane(axis=[planeEqn[0], planeEqn[1], planeEqn[2]], w=boundMaxDist * 2, h=boundMaxDist * 2, sx = 1, sy = 1, ch=False)
                #move to center point
                cmds.move(planeCenter[0], moveX=True, ws=True, a=True)
                cmds.move(planeCenter[1], moveY=True, ws=True, a=True)
                cmds.move(planeCenter[2], moveZ=True, ws=True, a=True)
                #extrude face to proper distance
                cmds.select(temp[0] + ".f[0]")
                cmds.polyExtrudeFacet(ltz = boundMaxDist, ch=False)
                cmds.select(temp[0])
                cmds.DeleteAllHistory()
                #cmds.polyNormal(normalMode=0, ch=False)
                #temp =cmds.duplicate()
                piece = cmds.polyBoolOp(piece[0], temp[0], op=2, ch=False)

        #harden edges
        cmds.polySoftEdge(a=0, ch=False)
        cmds.DeleteAllHistory()

        pieceFaceNum = cmds.polyEvaluate(f=True)
        #cmds.polyTriangulate(piece[0]+".f[0:"+str(pieceFaceNum)+"]", ch=False)

        #boolean with copy of original mesh
        if(boolMesh):
            cmds.select(mesh)
            temp = cmds.duplicate()
            cmds.DeleteAllHistory()
            #meshFaceNum = cmds.polyEvaluate(f=True)
            #cmds.polyTriangulate(temp[0]+".f[0:"+str(meshFaceNum)+"]", ch=False)
            piece = cmds.polyBoolOp(piece[0], temp[0], op=3, ch=False)

            #seperate
            if( cmds.polyEvaluate(shell=True) > 1):
                print "seperate"
                pieces = cmds.polySeparate(ch=False)
                keep = False
                #closestDist = boundMaxDist
                #choose closest to original point
                for check in pieces:
                    if keep == False and isPointInMesh(check, center):
                        keep = check
                    else:
                        cmds.delete(check)

        output.append( piece[0] )

        #center pivot on piece and check for break
        cmds.xform(piece[0], cp=True)
        cmds.progressBar("destProgressBar", e=True, step=1)
    cmds.delete(boundingBoxMesh[0])

    return output

##############################
##     Destruction Node     ##
##############################
def createDestructionNode(mesh, properties):

    destNode = cmds.group(empty=True, n="meshDestruction")
    #remove defaults
    cmds.setAttr( destNode + ".translateX", keyable=False, lock=True )
    cmds.setAttr( destNode + ".translateY", keyable=False, lock=True )
    cmds.setAttr( destNode + ".translateZ", keyable=False, lock=True )
    cmds.setAttr( destNode + ".rotateX", keyable=False, lock=True )
    cmds.setAttr( destNode + ".rotateY", keyable=False, lock=True )
    cmds.setAttr( destNode + ".rotateZ", keyable=False, lock=True )
    cmds.setAttr( destNode + ".scaleX", keyable=False, lock=True )
    cmds.setAttr( destNode + ".scaleY", keyable=False, lock=True )
    cmds.setAttr( destNode + ".scaleZ", keyable=False, lock=True )
    #add custom
    #material properties
    cmds.addAttr( ln="inputMesh", nn="Mesh", keyable=False, dt="string")
    cmds.addAttr( ln="density", nn="Density", keyable=False, at="float", min=0.0, max=1)
    cmds.addAttr( ln="grainSize", nn="Grain Size", keyable=False, at="float", min=0.01 )
    cmds.addAttr( ln="scatterSize", nn="Grain Size Scatter", keyable=False, at="float", min=0.0, max=1 )
    #set values
    cmds.setAttr( destNode + ".inputMesh", mesh, type="string", cb=True)
    cmds.setAttr( destNode + ".density", properties[0], cb=True)
    cmds.setAttr( destNode + ".grainSize", properties[1] ,cb=True)
    cmds.setAttr( destNode + ".scatterSize", properties[2], cb=True)
    #UI values
    cmds.addAttr( ln="destType", keyable=False, at="short")
    cmds.addAttr( ln="force", keyable=False, at="float")
    cmds.addAttr( ln="vectorControl", keyable=False, dt="string")
    cmds.addAttr( ln="chip1", keyable=False, at="bool")
    cmds.addAttr( ln="chip2", keyable=False, at="bool")
    cmds.addAttr( ln="chip3", keyable=False, at="bool")
    cmds.addAttr( ln="chipPerc", keyable=False, dt="short3")
    cmds.addAttr( ln="breakType", keyable=False, at="short")
    cmds.addAttr( ln="planeControl", keyable=False, dt="string")
    #fill ui values
    cmds.setAttr(destNode + ".destType", cmds.radioButtonGrp("defType", q=True, select=True))
    cmds.setAttr(destNode + ".force", cmds.floatSliderGrp("fractureForce", q=True, v=True))
    cmds.setAttr(destNode + ".vectorControl", cmds.textField("fractureVectorObject", q=True, text=True), type="string")
    cmds.setAttr(destNode + ".chip1", cmds.checkBoxGrp("chipOn", q=True, v1=True))
    cmds.setAttr(destNode + ".chip2", cmds.checkBoxGrp("chipOn", q=True, v2=True))
    cmds.setAttr(destNode + ".chip3", cmds.checkBoxGrp("chipOn", q=True, v3=True))
    cmds.setAttr(destNode + ".chipPerc", cmds.intSliderGrp("vertexPercentage", q=True, v=True), cmds.intSliderGrp("edgePercentage", q=True, v=True), cmds.intSliderGrp("facePercentage", q=True, v=True), type="short3" )
    cmds.setAttr(destNode + ".breakType", cmds.radioButtonGrp("breakPieces", q=True, select=True))
    cmds.setAttr(destNode + ".planeControl", cmds.textField("breakPlaneObject", q=True, text=True), type="string")

    return destNode

##############################
##    fill UI from Node     ##
##############################
def populateUI( destNode ):

    cmds.floatSliderGrp("matDensity", e=True, v= cmds.getAttr( destNode + ".density") )
    cmds.floatSliderGrp("matGrainSize", e=True, v=cmds.getAttr( destNode + ".grainSize") )
    cmds.floatSliderGrp("matScatterSize", e=True, v=cmds.getAttr( destNode + ".scatterSize") )

    cmds.radioButtonGrp("defType", e=True, select=cmds.getAttr(destNode + ".destType"))
    cmds.floatSliderGrp("fractureForce", e=True, v=cmds.getAttr(destNode + ".force"))
    cmds.textField("fractureVectorObject", e=True, text=cmds.getAttr(destNode + ".vectorControl"))
    cmds.checkBoxGrp("chipOn", e=True, v1=cmds.getAttr(destNode + ".chip1"))
    cmds.checkBoxGrp("chipOn", e=True, v2=cmds.getAttr(destNode + ".chip2"))
    cmds.checkBoxGrp("chipOn", e=True, v3=cmds.getAttr(destNode + ".chip3"))
    arr = cmds.getAttr(destNode + ".chipPerc")
    cmds.intSliderGrp("vertexPercentage", e=True, v=arr[0][0])
    cmds.intSliderGrp("edgePercentage", e=True, v=arr[0][1])
    cmds.intSliderGrp("facePercentage", e=True, v=arr[0][2])
    cmds.radioButtonGrp("breakPieces", e=True, select=cmds.getAttr(destNode + ".breakType"))
    cmds.textField("breakPlaneObject", e=True, text=cmds.getAttr(destNode + ".planeControl"))

    if(cmds.objExists(cmds.getAttr(destNode + ".inputMesh"))):
        cmds.select(cmds.getAttr(destNode + ".inputMesh"))
    else:
        cmds.warning("The mesh associated with this destruction has been renamed or no longer exists")

##############################
##     Controle Plane       ##
##############################
def createControlPlane(size=1):
    grp = cmds.createNode("transform", n="planeControl")
    border = cmds.curve(p=[(-0.5, -0.5, 0), (0.5, -0.5, 0), (0.5, 0.5, 0), (-0.5, 0.5, 0), (-0.5, -0.5, 0)], d=1)
    borderShape = cmds.listRelatives(border, shapes=True)
    cmds.setAttr(borderShape[0] + ".overrideEnabled", True)
    cmds.setAttr(borderShape[0] + ".overrideColor", 9)
    cmds.parent(borderShape[0], grp, s=True, r=True)
    cmds.delete(border)
    for i in rangef(-0.5, 0.5, 0.05):
        #negative
        line = cmds.curve(d=1, p=[(i, -0.5, 0), (-0.5, i, 0)])
        lineShape = cmds.listRelatives(line, shapes=True)
        cmds.setAttr(lineShape[0] + ".overrideEnabled", True)
        cmds.setAttr(lineShape[0] + ".overrideColor", 9)
        cmds.parent(lineShape[0], grp, s=True, r=True)
        cmds.delete(line)
        #positive
        line = cmds.curve(d=1, p=[(-i, 0.5, 0), (0.5, -i, 0)])
        lineShape = cmds.listRelatives(line, shapes=True)
        cmds.setAttr(lineShape[0] + ".overrideEnabled", True)
        cmds.setAttr(lineShape[0] + ".overrideColor", 9)
        cmds.parent(lineShape[0], grp, s=True, r=True)
        cmds.delete(line)
    cmds.delete()

    cmds.select(grp)
    cmds.scale(size, x=True, r=True)
    cmds.scale(size, y=True, r=True)
    cmds.makeIdentity(a=True, t=True, r=True, s=True)

    #connect to UI
    #break
    cmds.textField("breakPlaneObject", edit=True, text=grp, bgc=[0.47, 1.0, 0.48] )

    return grp

##############################
##     Control Vector       ##
##############################
def createControlVector(size=1):
    grp = cmds.createNode("transform", n="vectorControl")
    main = cmds.curve(p=[(-0.5, 0, 0), (0.5, 0, 0)], d=1)
    mainShape = cmds.listRelatives(main, shapes=True)
    cmds.setAttr(mainShape[0] + ".overrideEnabled", True)
    cmds.setAttr(mainShape[0] + ".overrideColor", 9)
    cmds.parent(mainShape[0], grp, s=True, r=True)
    cmds.delete(main)
    #outerLines
    for i in range(4):
        #negative
        line = cmds.curve(d=1, p=[(-0.45, 0.05 * (-0.5 + i%2), 0.05*(int(i/2.0)-0.5)), ( 0.45, 0.05*(-0.5 + i%2), 0.05*(int(i/2.0) - 0.5) )])
        lineShape = cmds.listRelatives(line, shapes=True)
        cmds.setAttr(lineShape[0] + ".overrideEnabled", True)
        cmds.setAttr(lineShape[0] + ".overrideColor", 9)
        cmds.parent(lineShape[0], grp, s=True, r=True)
        cmds.delete(line)

    #create directional arrows
    for i in rangef(-0.3, 0.5, 0.1):
        for j in range(4):
            #negative
            line = cmds.curve(d=1, p=[(i, 0, 0), ( i-0.08, (size / 10.0)*(-0.5 + j%2), (size/10.0)*(int(j/2.0) - 0.5) )])
            lineShape = cmds.listRelatives(line, shapes=True)
            cmds.setAttr(lineShape[0] + ".overrideEnabled", True)
            cmds.setAttr(lineShape[0] + ".overrideColor", 9)
            cmds.parent(lineShape[0], grp, s=True, r=True)
            cmds.delete(line)

    cmds.select(grp)
    cmds.scale(size, x=True, r=True)
    cmds.makeIdentity(a=True, t=True, r=True, s=True)
    #cmds.lockNode(grp)

    #connect to UI
    cmds.textField("fractureVectorObject", edit=True, text=grp, bgc=[0.47, 1.0, 0.48] )

    return grp

##############################
##                          ##
##    UTILITY FUNCTIONS     ##
##                          ##
##############################

#combines pieces that share faces which fail boolean union
def combinePieces( pieces ):
    #combine all pieces
    combined = None
    for pce in pieces:
        dup = cmds.duplicate(pce)
        if combined is None:
            combined = dup
        else:
            #print cmds.objectType(dup)
            combined = cmds.polyUnite(combined, dup, ch=False)
    #merge
    cmds.polyMergeVertex(d=0.0001, am=True, ch=False)

    #remove lamina faces
    toRemove = []
    numFaces = cmds.polyEvaluate(combined, f=True)
    for i in range(numFaces):
        face1 = cmds.select(combined[0] + ".f[" + str(i) + "]")
        vertNums1 = cmds.polyInfo(faceToVertex=True)
        vertNums1 = string.split(vertNums1[0], ":")[1]
        vertNums1 = string.split(vertNums1, "Hard")[0]
        vertNums1 = string.split(vertNums1)
        for j in range(i + 1, numFaces):
            face2 = cmds.select(combined[0] + ".f[" + str(j) + "]")
            vertNums2 = cmds.polyInfo(faceToVertex=True)
            vertNums2 = string.split(vertNums2[0], ":")[1]
            vertNums2 = string.split(vertNums2, "Hard")[0]
            vertNums2 = string.split(vertNums2)
            dup = True
            for vert in vertNums1:
                if (vert in vertNums2) is False:
                    dup = False
            if dup:
                toRemove.append( i )
                toRemove.append( j )
    cmds.select(clear=True)
    for faceNum in toRemove:
        cmds.select(combined[0] + ".f[" + str(faceNum) + "]", add=True)
    cmds.delete()
    cmds.select( combined[0] )
    cmds.polyMergeVertex(d=0.0001, am=True, ch=False)
    cmds.select( combined[0] )
    cmds.DeleteAllHistory()

    return combined[0]


def getSelectedMeshes():

    selObjects = cmds.ls(selection=True)

    objs = []

    for obj in selObjects:
            done = False
            while(done == False):
                objType = cmds.objectType(obj);

                if(objType == 'transform'):
                    #try children shapes
                    children = cmds.listRelatives(obj, fullPath=True, s=True)
                    if( children and len(children) != 0 ):
                        obj = children[0]
                    else:
                        done = True
                elif(objType == 'mesh'):
                    #store in list
                    objs.append(obj)
                    done = True
                else:
                    done = True
    return objs

#checks if a point is within a threshold of a meshes murface
def isPointOnMesh(mesh, point, thresh = 0.0001):
    #find closest point
    closestPoint = cmds.createNode("nearestPointOnMesh")
    cmds.setAttr(closestPoint + ".inPositionX", point[0])
    cmds.setAttr(closestPoint + ".inPositionY", point[1])
    cmds.setAttr(closestPoint + ".inPositionZ", point[2])
    cmds.connectAttr(mesh + ".worldMesh", closestPoint + ".inMesh", l=True)

    #get vector from surface
    pos = cmds.getAttr(closestPoint + ".position")
    vec = [ point[0] - pos[0][0], point[1] - pos[0][1], point[2] - pos[0][2] ]

    #distance is magnitude of vector
    dist = getMag( vec )

    if dist <= thresh:
        return True
    else:
        return False

#checks if a point is inside a mesh or not
def isPointInMesh(mesh, point):
    #find closest point
    closestPoint = cmds.createNode("nearestPointOnMesh")
    cmds.setAttr(closestPoint + ".inPositionX", point[0])
    cmds.setAttr(closestPoint + ".inPositionY", point[1])
    cmds.setAttr(closestPoint + ".inPositionZ", point[2])
    cmds.connectAttr(mesh + ".worldMesh", closestPoint + ".inMesh", l=True)

    #get surface normal
    norm = cmds.getAttr(closestPoint + ".normal")

    #get vector from surface
    pos = cmds.getAttr(closestPoint + ".position")
    vec = [ point[0] - pos[0][0], point[1] - pos[0][1], point[2] - pos[0][2] ]

    #dot product
    if getDotProduct(norm[0], vec) >= 0:
        return False
    else:
        return True
    #return result

#return plane equation
def getPlaneEquation( verts ):
    #get normal vector
    vNorm = getNormalVector( verts );

    #Ax + By + Cz + D = 0
    #D = -(Ax + By + Cz)
    #get point on plane (vertex A) and multiply to get D
    vNorm.append( -vNorm[0] * verts[0][0] - vNorm[1] * verts[0][1] - vNorm[2] * verts[0][2] )

    return vNorm;

#returns float array of normal vector
def getNormalVector( verts ):
    #create vectors
    vec1 = [ verts[1][0] - verts[0][0], verts[1][1] - verts[0][1], verts[1][2] - verts[0][2] ]
    vec2 = [ verts[2][0] - verts[0][0], verts[2][1] - verts[0][1], verts[2][2] - verts[0][2] ]

    #cross them to get perpendicular vector
    vNorm = getCrossProduct( vec1, vec2 )

    #normalize
    vNorm = normalize(vNorm)

    return vNorm;


#returns intersection t ( 0->1 )
def getLinePlaneIntersect( pln, p1, p2 ):

    #get scalar value t
    #calculating denomiators tells if there's no intersect or infinite
    denom = pln[0] * (p1[0] - p2[0])  +  pln[1] * (p1[1] - p2[1])  +  pln[2] * (p1[2] - p2[2])

    if(denom == 0):# or (denom > -1.0e-5 and denom < 1.0e-5)):
        return None

    #do division
    perc = pln[0] * p1[0]  +  pln[1] * p1[1]  +  pln[2] * p1[2]  +  pln[3]

    perc /= denom

    return perc

#used to get floatin point ranges with given step
def rangef(x, y, step):
    while(x < y):
        yield x
        x += step

def normalize( vec ):
    mag = getMag(vec)
    new = []
    for i in vec:
        new.append( i / mag )
    return new

def getMag( pos1, pos2=False ):

    vec = []
    if(pos2 != False):
        for i in range(len(pos1)):
            vec.append( pos1[i] - pos2[i] )
    else:
        vec = pos1

    sum = 0
    for val in vec:
        sum += val * val

    return math.sqrt( sum )

def getDotProduct( vec1, vec2 ):
    loop = min(len(vec1), len(vec2))

    #multiply matching elements and add to sum
    sum = 0
    for i in range( loop ):
        sum += vec1[i] * vec2[i]

    return sum

def getCrossProduct( vec1, vec2 ):
    cProd = [];

    #no great looping process for cross product so just write equations
    #order is Y, Z, X or 1, 2, 0
    cProd.append( vec1[1] * vec2[2] - vec1[2] * vec2[1] )
    cProd.append( vec1[2] * vec2[0] - vec1[0] * vec2[2] )
    cProd.append( vec1[0] * vec2[1] - vec1[1] * vec2[0] )

    return cProd;
```
