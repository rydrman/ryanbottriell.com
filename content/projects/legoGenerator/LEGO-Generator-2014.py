import maya.cmds as cmds
import math

#Copyright 2014 Ryan Bottriell
#cmds.file(new=True, f=True) 

colorMap = {
    "White" : [1, 1, 1],
    "Black" : [0.05, 0.05, 0.05],
    "Red" : [0.87, 0, 0.05],
    "Blue" : [0, 0.34, 0.66],
    "Yellow" : [1.0, 0.77, 0],
    "Green" : [0, 0.48, 0.16],
    "Bright Green" : [0, 0.59, 0.14],
    "Medium Blue" : [0.28, 0.55, 0.78],
    "Orange" : [0.91, 0.39, 0.09],
    "Lime" : [0.58, 0.73, 0.04],
    "Magenta" : [0.61, 0, 0.42],
    "Sand Blue" : [0.37, 0.45, 0.55],
    "Sand Green" : [0.37, 0.51, 0.4],
    "Olive Green" : [0.33, 0.42, 0.18],
    "Medium Lime" : [0.59, 0.73, 0.23],
    "Bright Light Orange" : [0.96, 0.61, 0],
    "Light Grey" : [0.61, 0.57, 0.57],
    "Dark Grey" : [0.3, 0.32, 0.34],
    "Very Light Grey" : [0.89, 0.89, 0.85],
    "Light Blue" : [0.53, 0.75, 0.92],
    "Bright Pink" : [0.87, 0.22, 0.55],
    "Light Pink" : [0.93, 0.62, 0.76],
    "Blonde" : [1, 1, 0.6],
    "Tan" : [0.85, 0.73, 0.48],
    "Flesh" : [0.84, 0.45, 0.25],
    "Light Flesh" : [0.96, 0.76, 0.54],
    "Reddish Brown" : [0.36, 0.11, 0.05],
    "Medium Dark Flesh" : [0.67, 0.49, 0.33],
    "Dark Brown" : [0.19, 0.06, 0.02],
    "Dark Red" : [0.5, 0.03, 0.11],
    "Dark Tan" : [0.55, 0.45, 0.32],
    "Dark Blue" : [0, 0.15, 0.25],
    "Dark Green" : [0, 0.2, 0.09],
    "Dark Orange" : [0.66, 0.24, 0.08],
    "Dark Purple" : [0.17, 0.08, 0.47]
}

connectorMap = {
    0 : "Hole Connector",
    1 : "Half Hole Connector",
    2 : "Double Hole Connector",
    3 : "Axel",
    4 : "Female Axel",
    5 : "Brick"
}

#functions for syncing UI fields
def changeTab():
    tab = cmds.tabLayout("blockTypeTab", q=True, sti=True)
    if(tab > 2 and tab < 5):
        cmds.frameLayout("colorSelector", edit=True, vis=False, cl=True)
        cmds.text("noColorSelector", edit=True, vis=True)
        if(tab == 4):
            colorChange("Dark Grey")
        else:
            colorChange("Black")
    else:
        cmds.text("noColorSelector", edit=True, vis=False)
        cmds.frameLayout("colorSelector", edit=True, vis=True)
        if(tab == 5):
            colorChange("Black")
            
def updateSquareHeight(sel):
    sel = cmds.radioButtonGrp("squareHeight", q=True, sl=True)
    if(sel == 1):
        cmds.checkBoxGrp("squareNoNubs", e=True, en=True)
    else:
        cmds.checkBoxGrp("squareNoNubs", e=True, en=False, v1=False)
            
def toggleSquareHoles(isOn):
    if(isOn):
        cmds.intSliderGrp("squareDepth", edit=True, value=1, en=False)
        cmds.radioButtonGrp("squareHeight", e=True, sl=2, en=False)
        cmds.textFieldGrp("squareAxelPos", edit=True, en=True)
    else:
        cmds.intSliderGrp("squareDepth", edit=True, en=True)
        cmds.radioButtonGrp("squareHeight", e=True, en=True)
        cmds.textFieldGrp("squareAxelPos", edit=True, en=False)
    
def updateRoundBend(sel):
    sel = cmds.radioButtonGrp("roundCreateBend", q=True, sl=True)
    if(sel == 1):
        cmds.columnLayout("roundBendGrp", edit=True, en=False)
    elif(sel > 1):
        cmds.checkBoxGrp("roundSpacerEnd", edit=True, v1=False)
        cmds.columnLayout("roundBendGrp", edit=True, en=True)
        cmds.radioButtonGrp("roundBendAngle", edit=True, en=True)
        width = cmds.intSliderGrp("roundWidth", q=True, v=True)
        if(width < 3):
            cmds.intSliderGrp("roundWidth", edit=True, v=3)
        if(sel == 3):
            cmds.radioButtonGrp("roundBendAngle", edit=True, en=False)
        
def updateBendHoleNum(width):
    cmds.intSliderGrp("roundBendHoleNum", edit=True, max=width-1, v=2)
    if(width < 3):
        cmds.radioButtonGrp("roundCreateBend", edit=True, sl=1)
        updateRoundBend(1)   

def toggleRoundSpacerEnd(isSpacerEnd):
    if(isSpacerEnd):
        cmds.radioButtonGrp("roundCreateBend", edit=True, sl=1) 
        updateRoundBend(1)
        
def colorChange(name):
    cmds.textField("blockColorPreview", edit=True, bgc=colorMap[name])
    cmds.textField("blockColorName", edit=True, text=name)

winW = 500;
#remove old window to avoid errors
if(cmds.window("legoGen", exists=True)):
    cmds.deleteUI("legoGen", window=True)
#create window for block creation
window = cmds.window("legoGen", title="LEGO Generator", menuBar=True, width=winW )

cmds.columnLayout(w=winW, rs=20)
cmds.text("Welcome to the LEGO part generator!", align="center", w=winW, font="boldLabelFont", bgc=[0.1, 0.1, 0.1]);

#UI for color selector

cmds.rowLayout(nc=2)
cmds.textField("blockColorPreview", ed=False)
cmds.textField("blockColorName", ed=False)
colorChange("Red")
cmds.setParent("..")
cmds.text("noColorSelector", label="This block type has a pre-set color value.", vis=False, h=20, w=winW, align="center", bgc=[0.31, 0.31, 0.31])
cmds.frameLayout("colorSelector", label="Color Selection", w=winW, cll=True)
cmds.gridLayout(ag=True, nc=15, w=winW)
for col in colorMap:
    cmds.textField(col, bgc=colorMap[col], w=20, h=20, ed=False, rfc=("colorChange('" + col + "')"))
cmds.setParent("..")
cmds.setParent("..")

cmds.tabLayout("blockTypeTab", cc=changeTab)

########################################

cmds.columnLayout( "Square Blocks" )

cmds.frameLayout(label="Main Attributes", w=winW)
cmds.intSliderGrp("squareWidth", label="Block Width (numbs)", field=True, min=1, max=15, v=4)
cmds.intSliderGrp("squareDepth", label="Block Depth (numbs)", field=True, min=1, max=15, v=2)
cmds.radioButtonGrp("squareHeight", label="Square Height", labelArray2=["Flat", "Tall"], numberOfRadioButtons=2, sl=2, cc=updateSquareHeight)
cmds.checkBoxGrp("squareNoNubs", label="No Nubs", ncb=1, en=False, v1=False)
cmds.checkBoxGrp("squareBlockHoles", label="Generate Holes", v1=False, cc1=toggleSquareHoles)
cmds.textFieldGrp("squareAxelPos", label="Axel hole Positions", text="-- space seperated list --", en=False)
cmds.setParent("..")

cmds.button(label="Generate Block", c=("generatePart('square')"))
cmds.setParent("..")

########################################

cmds.columnLayout("Rounded Blocks" )

cmds.frameLayout(label="Main Attributes", w=winW)
cmds.intSliderGrp("roundWidth", label="Length (holes)", field=True, min=2, max=15, v=4, cc=updateBendHoleNum)
cmds.radioButtonGrp("roundDepth", label="Width", labelArray2=["Full", "Half"], numberOfRadioButtons=2, select=1)
cmds.textFieldGrp("roundAxelPos", label="Axel hole Positions", text="-- space seperated list --")
cmds.checkBoxGrp("roundSpacerEnd", label="", label1="End is perpendicular axel connection", v1=False, cc=toggleRoundSpacerEnd)
cmds.setParent("..")

cmds.frameLayout("roundBend", label="Bend", w=winW)
cmds.radioButtonGrp("roundCreateBend", label="Create with bend", nrb=3, labelArray3=["None", "Single", "Double"], sl=1, cc=updateRoundBend)
cmds.columnLayout("roundBendGrp", en=False, w=winW)
cmds.intSliderGrp("roundBendHoleNum", label="Bend at Hole Number", field=True, min=2, max=3, v=2)
cmds.radioButtonGrp("roundBendAngle", label="Bend Angle", labelArray2=["53 deg", "90 deg"], numberOfRadioButtons=2, sl=1)
cmds.setParent("..")
cmds.setParent("..")

cmds.button(label="Generate Block", c=("generatePart('round')"))
cmds.setParent("..")

########################################

cmds.columnLayout("Wheels / Axels" )

cmds.frameLayout(label="Wheel", w=winW)
cmds.radioButtonGrp("wheelHubSelection", label="Piece(s)", labelArray3=["Both", "Hub Only", "Tire Only"], numberOfRadioButtons=3, sl=1)
cmds.radioButtonGrp("wheelSize", label="Wheel Size", labelArray2=["Large", "Small"], numberOfRadioButtons=2, sl=1)
cmds.setParent("..")
cmds.button(label="Generate Wheel", c=("generatePart('wheel')"))

cmds.frameLayout(label="Axel", w=winW)
cmds.intSliderGrp("axelLength", label="Length (brick nubs)", field=True, min=1, max=10, v=4)
cmds.setParent("..")
cmds.button(label="Generate Axel", c=("generatePart('axel')"))

cmds.setParent("..")

########################################

cmds.columnLayout("Gears" )

cmds.frameLayout(label="Basic Gear", w=winW)
cmds.radioButtonGrp("gearNumTeeth", label="Size (number of teeth)", vertical=True, numberOfRadioButtons=4, sl=2, labelArray4=["Tiny (8)", "Small (16)", "Meduim (24)", "Large (40)"])
cmds.setParent("..")
cmds.button(label="Generate Gear", c=("generatePart('gear')"))

cmds.setParent("..")

########################################

cmds.columnLayout("Connectors / Spacers" )

cmds.frameLayout(label="Connector", w=winW)

cmds.radioCollection("connectorLeft")
cmds.radioCollection("connectorRight")
cmds.rowLayout(nc=3, cw=(1, int(winW*0.2)))
cmds.text("")
cmds.columnLayout()
cmds.rowLayout(nc=3, ad3=2, w=int(winW*0.6))
cmds.text("Left Side", font="boldLabelFont")
cmds.text("  Connection Description  ", font="boldLabelFont")
cmds.text("Right Side", font="boldLabelFont")
cmds.setParent("..")
for i in range(len(connectorMap)):
    cmds.rowLayout(nc=3, ad3=2, w=int(winW*0.6))
    cmds.radioButton(cl="connectorLeft", l="", sl=(i==0))
    cmds.text(connectorMap[i])
    cmds.radioButton(cl="connectorRight", l="", sl=(i==0))
    cmds.setParent("..")
cmds.setParent("..")
cmds.setParent("..")   
cmds.setParent("..")
cmds.button(label="Generate Connector", c=("generatePart('connector')"))
cmds.frameLayout(label="Spacer", w=winW)
cmds.radioButtonGrp("spacerSize", label="Spacer Size", nrb=2, labelArray2=["Half", "Full"], sl=2)
cmds.setParent("..")
cmds.button(label="Generate Spacer", c=("generatePart('spacer')"))

cmds.setParent("..")

########################################

cmds.setParent("..")

cmds.intSlider("nextPartNum", v=1, visible=False)

cmds.setParent("..")

#show the window
cmds.showWindow( window )

######################
##    GENERATION    ##
######################
def generatePart(type):
        
    #create new namespace for block
    while True:
        nmSpc = cmds.intSlider("nextPartNum", q=True, v=True)
        cmds.intSlider("nextPartNum", e=True, min = nmSpc-5, max=nmSpc+5, v=(nmSpc+1))
        nmSpc = "block" + str(nmSpc).zfill(3)
        if(False == cmds.namespace(exists=nmSpc)):
            break
    cmds.select(clear=True)
    cmds.namespace(add=nmSpc)
    cmds.namespace(set=nmSpc)
    
    #get current color
    col = cmds.textField("blockColorName", q=True, text=True)
    
    #switch on the block type
    piece = ""
    if(type == "square"):
        piece = createSquarePolys()
    elif(type == "round"):
        piece = createRoundPolys()
    elif(type == "wheel"):
        piece = createWheelPolys(nmSpc)
    elif(type == "axel"):
        piece = createAxelPolys()
        if(cmds.intSliderGrp("axelLength", q=True, v=True) % 2 == 1):
            col = "Light Grey"
    elif(type == "gear"):
        piece = createGearPolys()
    elif(type == "connector"):
        piece = createConnectorPolys()
    elif(type == "spacer"):
        piece = createSpacerPolys()
        col= "Light Grey"
    
    #reset default namespace
    if(("g_" in piece[0]) == False):
        piece = [cmds.rename(nmSpc)]
    cmds.namespace(set=":")
    cmds.delete(ch=True)
    
    #create/apply shader
    if(("g_" in piece[0]) == False):
        applyColor(piece, col)
    
######################
##   SQUARE BLOCK   ##
######################   
def createSquarePolys():
    
    #query UI
    isHoles = cmds.checkBoxGrp("squareBlockHoles", q=True, v1=True)
    noNubs = cmds.checkBoxGrp("squareNoNubs", q=True, v1=True)
    width = cmds.intSliderGrp("squareWidth", q=True, v=True)
    depth = cmds.intSliderGrp("squareDepth", q=True, v=True)
    height = cmds.radioButtonGrp("squareHeight", q=True, sl=True)
    if(isHoles):
        axelPos = cmds.textFieldGrp("squareAxelPos", q=True, text=True)
        axelPos = [int(pos)-1 for pos in axelPos.split(" ") if pos.isdigit()]
    #get actual values
    sizeX = width * 0.8
    sizeZ = depth * 0.8
    sizeY = 0.32
    wallW = 0.12
    if( height == 2 ):
        sizeY = 0.96
    innerHeight = sizeY-0.1
    
    #progress window for huge blocks
    #remove old window to avoid errors
    if(cmds.window("LEGOProgrss", exists=True)):
        cmds.deleteUI("LEGOProgrss", window=True)
    win = cmds.window("LEGOProgrss", title="LEGO Progress", width=350, h=50 ) 
    cmds.columnLayout(w=350)
    cmds.progressBar("legoProgressBar", min=0, max=2*width*depth+30, w=350)
    cmds.setParent("..")
    cmds.showWindow(win)
    
    #create cube
    if(isHoles):
        innerHeight = 0.25
        wallW = 0.15
    base = cmds.polyCube(h=sizeY, w=sizeX, d=sizeZ, sx=width, sz=depth)
    cmds.progressBar("legoProgressBar", e=True, step=10)
    
    #create nubs
    if(False == noNubs):
        for i in range(width):
            for j in range(depth):
                nub = cmds.polyCylinder(r=0.25, h=0.2)
                if(isHoles):
                    center = cmds.polyCylinder(r=0.15, h=0.3)
                    nub = cmds.polyBoolOp(nub[0], center[0], op=2, caching=False, ch=False)
                cmds.move((sizeY/2.0 + 0.1), moveY=True, a=True)
                cmds.move((-sizeX/2.0 + (i+0.5)*0.8), moveX=True, a=True)
                cmds.move((-sizeZ/2.0 + (j+0.5)*0.8), moveZ=True, a=True)
                base = cmds.polyBoolOp(base[0], nub[0], op=1, ch=False)
                cmds.progressBar("legoProgressBar", e=True, step=1)
    
    #add holes
    if(isHoles):
        holes = width - 1
        if(holes == 0):
            holes = 1
        base = addHoles(base, width, 0, 0, axelPos);
    cmds.progressBar("legoProgressBar", e=True, step=10)
        
    #take out bottom
    tmp = cmds.polyCube(w=sizeX-wallW*2, h=innerHeight+0.05, d=sizeZ-wallW*2, sx=width-1, sz=depth-1)
    cmds.move(-0.1, moveY=True)
    if(isHoles):
        cmds.move(-0.4, moveY=True)
    base = cmds.polyBoolOp(base[0], tmp[0], op=2, ch=False)
    
    cmds.progressBar("legoProgressBar", e=True, step=10)
    
    #create inner nubs
    for i in range(width-1):
        for j in range(depth-1):
            nub = cmds.polyCylinder(r=0.3255, h=innerHeight+0.1, sx=10)
            center = cmds.polyCylinder(r=0.25, h=1, sx=10)
            nub = cmds.polyBoolOp(nub[0], center[0], op=2, caching=False, ch=False)
            cmds.move(-0.05, moveY=True, a=True)
            cmds.move((-sizeX/2.0 + (i+1)*0.8), moveX=True, a=True)
            cmds.move((-sizeZ/2.0 + (j+1)*0.8), moveZ=True, a=True)
            base = cmds.polyBoolOp(base[0], nub[0], op=1, ch=False)
            cmds.progressBar("legoProgressBar", e=True, step=1)
    
    cmds.deleteUI("LEGOProgrss", window=True)

    return base

######################
##    ROUND BLOCK   ##
######################    
def createRoundPolys():
    #query UI
    width = cmds.intSliderGrp("roundWidth", q=True, v=True)
    depth = cmds.radioButtonGrp("roundDepth", q=True, sl=True)
    
    axelPos = cmds.textFieldGrp("roundAxelPos", q=True, text=True)
    axelPos = [int(pos)-1 for pos in axelPos.split(" ") if pos.isdigit()]
    
    isSpacerEnd = cmds.checkBoxGrp("roundSpacerEnd", q=True, v1=True)
    
    #isPlusEnds = cmds.checkBoxGrp("roundPlusEnds", q=True, v1=True)
    bend = cmds.radioButtonGrp("roundCreateBend", q=True, sl=True)
    if(bend > 1):
        bendAt = cmds.intSliderGrp("roundBendHoleNum", q=True, v=True)
        if(bend == 2):
            bendAngle = cmds.radioButtonGrp("roundBendAngle", q=True, sl=True)
            if(bendAngle == 1):
                bendAngle = 53.13
            else:
                bendAngle = 90
        else:
            bendAngle = 45
            
    #get actual values
    sizeX = (width-1) * 0.8
    subDivX = width-1
    if(bend > 1):
        sizeX = (bendAt-1) * 0.8
        subDivX = bendAt-1
    sizeZ = 0.8
    halfHoles=False
    if(depth == 2):
        sizeZ = 0.4
        halfHoles=True
        
    sizeY = 0.7
    if(isSpacerEnd):
        sizeY=0.8
    
    #create cube
    base = cmds.polyCube(h=sizeY, w=sizeX, d=sizeZ, sx=subDivX)
    #create cylinders for ends
    ##left
    cyldr = cmds.polyCylinder(r=sizeY*0.5, h=sizeZ)
    cmds.rotate(90, rotateX=True, a=True)
    cmds.move((-sizeX * 0.5), moveX=True, a=True)
    base = cmds.polyBoolOp(base[0], cyldr[0], op=1, caching=False, ch=False)
    ##right
    if(isSpacerEnd):
        spacer = createSpacerPolys(False, 1, 0.4)
        axel = createAxelPolys(False)
        cmds.select(spacer[0], add=True)
        cmds.rotate(90, rotateZ=True, a=True)
        cmds.move((sizeX * 0.5), moveX=True, a=True)
        base = cmds.polyBoolOp(base[0], spacer[0], op=1, ch=False)
        cmds.select(axel[0])
        cmds.rotate(90, rotateZ=True, r=True)
        base = cmds.polyBoolOp(base[0], axel[0], op=2, ch=False)
    else:
        cyldr = cmds.polyCylinder(r=sizeY*0.5, h=sizeZ)
        cmds.rotate(90, rotateX=True, a=True)
        cmds.move((sizeX * 0.5), moveX=True, a=True)
        base = cmds.polyBoolOp(base[0], cyldr[0], op=1, caching=False, ch=False)
    
    #create second rect if needed for bend
    if(bend > 1):
        if(bend == 3):
            bendAt += 1
        sizeX = (width - bendAt) * 0.8
        subDivX = width - bendAt
        arm = cmds.polyCube(h=sizeY, w=sizeX, d=sizeZ, sx=subDivX)
        #end cylinder
        cyldr = cmds.polyCylinder(r=sizeY*0.5, h=sizeZ)
        cmds.rotate(90, rotateX=True, a=True)
        cmds.move((sizeX * 0.5), moveX=True, a=True)
        arm = cmds.polyBoolOp(arm[0], cyldr[0], op=1, caching=False, ch=False)
        #add holes
        print(axelPos)
        arm = addHoles(arm, subDivX, 0, 0.4, [(pos-bendAt) for pos in axelPos], halfHoles)
        print(axelPos)
        cmds.move(sizeX*0.5, moveX=True, a=True)
        cmds.rotate(bendAngle, rotateZ=True, a=True, p=[0, 0, 0])
        #add second bend if necessary
        if(bend == 3):
            bendAt -= 1            
            sizeX = math.sqrt(5.12)
            subDivX = 2
            cmds.move(sizeX*0.5, moveX=True, ws=True, r=True)
            arm2 = cmds.polyCube(h=sizeY, w=sizeX, d=sizeZ, sx=subDivX)
            #end cylinder
            cyldr = cmds.polyCylinder(r=sizeY*0.5, h=sizeZ)
            cmds.rotate(90, rotateX=True, a=True)
            cmds.move((sizeX * 0.5), moveX=True, a=True)
            arm2 = cmds.polyBoolOp(arm2[0], cyldr[0], op=1, ch=False)
            #take out center
            cntr = getHoleShape(halfHoles)
            cmds.rotate(90, rotateX=True)
            tmp = cmds.polyCube(w=1.0, h=1.0, d=1.0)
            cmds.move(0.5, moveX=True)
            cntr = cmds.polyBoolOp(cntr[0], tmp[0], op=2, ch=False)
            cmds.select(cntr[0] + ".f[0]")
            cmds.polyExtrudeFacet(ltz=0.5)
            cmds.select(cntr)
            cmds.move(-0.4, moveX=True)
            tmp = cmds.duplicate()
            cmds.rotate(180, rotateZ=True)
            cmds.move(0.4, moveX=True, a=True)
            cntr = cmds.polyBoolOp(cntr[0], tmp[0], op=1, ch=False)
            arm2 = cmds.polyBoolOp(arm2[0], cntr[0], op=2, ch=False)
            #combine
            arm = cmds.polyBoolOp(arm2[0], arm[0], op=1, ch=False)
            #hole
            cmds.move(-sizeX*0.5, moveX=True)
            cmds.rotate(45, rotateZ=True, p=[0, 0, 0], r=True)
            arm = addHoles(arm, 1, 0, 0, [(pos-bendAt) for pos in axelPos], halfHoles)
            cmds.rotate(-45, rotateZ=True, p=[0, 0, 0], r=True)
            cmds.move(sizeX, moveX=True, r=True)
            cmds.rotate(bendAngle, rotateZ=True, r=True, p=[0, 0, 0])
            cmds.delete(ch=True)     
        cmds.move((bendAt-1) * 0.4, moveX=True, ws=True, r=True)
        base = cmds.polyBoolOp(base[0], arm[0], op=1, ch=False)
    
    if(bend > 1):
        width = bendAt
    if(isSpacerEnd):
        base = addHoles(base, width-1, 0, -0.4, axelPos, halfHoles)
    else:
        base = addHoles(base, width, 0, 0, axelPos, halfHoles)
    return base

######################
##       WHEEL      ##
######################    
def createWheelPolys(nmSpc):
    pieces = cmds.radioButtonGrp("wheelHubSelection", q=True, sl=True)
    size = cmds.radioButtonGrp("wheelSize", q=True, sl=True)
    scl = 1
    if(size == 2):
        scl = 0.8
    
    if(pieces == 1 or pieces == 3):
        tire = createTirePolys(scl)
    if(pieces == 1 or pieces == 2):
        hub = createHubPolys(scl)
        
    #materials
    cmds.namespace(set=":")     
    if(pieces == 1 or pieces == 3):
        applyColor(tire, "Rubber")
    if(pieces == 1 or pieces == 2):
        applyColor(hub, "Light Grey")        
        
    #group tire and hub
    nmSpcNum = cmds.intSlider("nextPartNum", q=True, v=True)
    grp = cmds.group(n="g_Wheel" + str(nmSpcNum-1).zfill(3), em=True)
    if(pieces == 1 or pieces == 3):
        cmds.parent(tire[0], grp)
    if(pieces == 1 or pieces == 2):
        cmds.parent(hub[0], grp)
    cmds.delete(ch=True)
    cmds.select(grp)
    
    return [grp]
    
    
######################
##       TIRE       ##
######################
def createTirePolys(scl=1):
    #create base mesh
    tire = cmds.polyCylinder(r=3.5, h=3.5, sx=36)
    #round it out
    tmp = cmds.polySphere(r=3.35, sy=15, sx=36)
    cmds.scale(1.1, scaleY=True)
    tire = cmds.polyBoolOp(tire[0], tmp[0], op=3, ch=False)    
    #cylinder for tread
    tread = cmds.polyCylinder(r=2.8, h=1.75, sx=36)
    cmds.move(0.875, moveY=True, a=True)
    for i in range(35):
        if(i % 2 == 0):
            cmds.select(tread[0] + ".f[" + str(i) + "]")
            cmds.polyExtrudeFacet(ltz=1, lsx=1.35)
    #duplicate other half
    tread2 = cmds.duplicate(tread[0])
    cmds.select(tread2)
    cmds.move(-0.875, moveY=True, a=True)
    cmds.rotate(360.0/36, rotateY=True, a=True)
    #add central tread
    tmp = cmds.polyCylinder(r=3.7, h=0.3, sx=36)
    tread = cmds.polyBoolOp(tread[0], tmp[0], op=1, ch=False)
    tread = cmds.polyBoolOp(tread[0], tread2[0], op=1, ch=False)
    #round it out
    tmp = cmds.polySphere(r=3.5, sy=13, sx=36)
    cmds.scale(0.95, scaleY=True)
    tread = cmds.polyBoolOp(tread[0], tmp[0], op=3, ch=False)
    cmds.polyMergeVertex(d=0.05, ch=False)
    #combine
    tire = cmds.polyBoolOp(tire[0], tread[0], op=1, ch=False)
    #create notches in tread
    for i in range(2):
        tmp = cmds.polyCylinder(r=4, h=0.7, sx=36)
        tmp1 = cmds.polyCylinder(r=3.05, h=0.7, sx=36)
        cmds.select(tmp1[0] + ".f[" + str(36+i) + "]")
        cmds.xform(scale=[1.055, 1, 1.055], ws=True)
        tmp = cmds.polyBoolOp(tmp[0], tmp1[0], op=2, ch=False)
        cmds.move(1.4 - i*2.8, moveY=True, a=True)
        tire = cmds.polyBoolOp(tire[0], tmp[0], op=2, ch=False)
    #harden edges
    edges = cmds.polyEvaluate(tire[0], e=True)-1
    print(tire[0] + ".e[0:" + str(edges) +"]")
    cmds.select(tire[0] + ".e[0:" + str(edges) +"]")
    cmds.polySoftEdge(a=0)
    #create internal hole shape
    tmp = cmds.polyCylinder(r=2.4, h=0.1, sx=36)
    cmds.select(tmp[0] + ".f[" + str(37) + "]")
    cmds.polyExtrudeFacet(ls=[0.8958, 0.8958, 0], ltz=0.45)
    cmds.polyExtrudeFacet(ltz=0.15)
    cmds.polyExtrudeFacet(ls=[0.9302, 0.9302, 0])
    cmds.polyExtrudeFacet(ltz=0.2)
    cmds.polyExtrudeFacet(ls=[1/0.9302, 1/0.9302, 0])
    cmds.polyExtrudeFacet(ls=[1.4, 1.4, 0], ltz=-0.5)
    cmds.polyExtrudeFacet(ls=[1.1, 1.1, 0], ltz=1.45)
    cmds.polyExtrudeFacet(ls=[1/1.1, 1/1.1, 0], ltz=1.45)
    cmds.polyExtrudeFacet(ls=[1/1.4, 1/1.4, 0], ltz=-0.5)
    cmds.polyExtrudeFacet(ls=[0.9302, 0.9302, 0])
    cmds.polyExtrudeFacet(ltz=0.2)
    cmds.polyExtrudeFacet(ls=[1/0.9302, 1/0.9302, 0])
    cmds.polyExtrudeFacet(ltz=0.15)
    cmds.polyExtrudeFacet(ls=[1/0.8958, 1/0.8958, 0], ltz=0.45)
    cmds.polyExtrudeFacet(ltz=0.1)
    cmds.select(tmp[0])
    cmds.xform(cp=True)
    cmds.move(-1.8, moveY=True)
    cmds.delete(ch=True)
    #take it out
    tire = cmds.polyBoolOp(tire[0], tmp[0], op=2, ch=False)
    
    #rotate
    cmds.rotate(90, rotateX=True, a=True)
    #scale
    cmds.xform(scale=[scl, scl, scl], a=True)
    cmds.makeIdentity(a=True, s=True, t=True)
    
    return tire

######################
##       HUB        ##
######################
def createHubPolys(scl=1):

    hub = cmds.polyCylinder(r=2.15, h=0.15, sx=24)
    cmds.select(hub[0] + ".f[" + str(25) + "]")
    cmds.polyExtrudeFacet(ls=[0.9302, 0.9302, 0])
    cmds.polyExtrudeFacet(ltz=0.2)
    cmds.polyExtrudeFacet(ls=[1/0.9302, 1/0.9302, 0])
    cmds.polyExtrudeFacet(ltz=0.15)
    cmds.polyExtrudeFacet(ls=[0.9302, 0.9302, 0])
    cmds.polyExtrudeFacet(ltz=0.1)
    cmds.polyExtrudeFacet(ls=[0.875, 0.875, 0], ltz=0.3)
    cmds.polyExtrudeFacet(ltz=0.5)
    cmds.polyExtrudeFacet(ls=[1/0.875, 1/0.875, 0], ltz=0.3)
    cmds.polyExtrudeFacet(ltz=0.4)
    cmds.polyExtrudeFacet(ls=[1/0.9302, 1/0.9302, 0])
    cmds.polyExtrudeFacet(ltz=0.15)
    cmds.polyExtrudeFacet(ls=[0.9302, 0.9302, 0])
    cmds.polyExtrudeFacet(ltz=0.2)
    cmds.polyExtrudeFacet(ls=[1/0.9302, 1/0.9302, 0])
    cmds.polyExtrudeFacet(ltz=0.15)
    cmds.select(hub)
    cmds.xform(cp=True)
    cmds.delete(ch=True)
    cmds.move(-1.225, moveY=True)
    #stuff to remove from center
    tmp = cmds.polyCylinder(r=2, h=0.1, sx=24)
    cmds.select(tmp[0] + ".f[" + str(25) + "]")
    cmds.polyExtrudeFacet(ls=[0.9302, 0.9302, 0], ltz=0.15)
    cmds.polyExtrudeFacet(ltz=0.4)
    cmds.polyExtrudeFacet(ls=[0.865, 0.865, 0], ltz=0.15)
    cmds.polyExtrudeFacet(ltz=0.9)
    cmds.polyExtrudeFacet(ls=[1/0.865, 1/0.865, 0], ltz=0.15)
    cmds.polyExtrudeFacet(ltz=0.7)
    cmds.polyExtrudeFacet(ls=[1/0.9302, 1/0.9302, 0], ltz=0.15)
    cmds.polyExtrudeFacet(ltz=0.1)
    cmds.select(tmp)
    cmds.xform(cp=True)
    cmds.move(-1.35, moveY=True)
    cmds.select(tmp[0])
    cmds.delete(ch=True)
    hub = cmds.polyBoolOp(hub[0], tmp[0], op=2, ch=False)
    #internal spokes
    tmp = cmds.polyCylinder(r=1.05, h=0.5, sx=6)
    for i in range(6):
        cmds.select(tmp[0] + ".f[" + str(i) + "]")
        cmds.polyExtrudeFacet(lsx=0.75, ltz=0.7)
    cmds.select(tmp)
    cmds.move(-0.35, moveY=True)
    hub = cmds.polyBoolOp(hub[0], tmp[0], op=1, ch=False)
    
    #scale
    cmds.xform(scale=[scl, scl, scl], a=True)
    cmds.makeIdentity(a=True, s=True, t=True)
    
    #add axel hole area
    tmp = cmds.polyCylinder(r=0.31 , h=1.5)
    hub = cmds.polyBoolOp(hub[0], tmp[0], op=1, ch=False)
    #add axel hole
    tmp = createAxelPolys(False)
    hub = cmds.polyBoolOp(hub[0], tmp[0], op=2, ch=False)
    #rotate properly
    cmds.select(hub)
    cmds.rotate(90, rotateX=True, a=True)
    #add holes for connectors
    cmds.move(0.2, moveZ=True, a=True)
    for i in range(6):
        angle = (i+0.5) * math.pi/3
        cmds.xform(translation=[math.cos(angle) * 0.7, math.sin(angle) * 0.7, 0], r=True)
        tmp = cmds.polyCylinder(r=0.32, h=0.8)
        cmds.rotate(90, rotateX=True)
        hub = cmds.polyBoolOp(hub[0], tmp[0], op=1, ch=False)
        hub = addHoles(hub, 1)
        cmds.xform(translation=[-math.cos(angle) * 0.7, -math.sin(angle) * 0.7, 0], r=True)
    cmds.move(-0.2, moveZ=True)
    cmds.xform(cp=True)
    cmds.makeIdentity(a=True, t=True)
    
    return hub
    
######################
##       AXEL       ##
######################
def createAxelPolys(fromUI=True, length=5):
    
    sizeY=length
    if(fromUI):
        sizeY = cmds.intSliderGrp("axelLength", q=True, v=True) * 0.8
    
    #create axel shape
    axel = cmds.polyCube(w=0.5, h=sizeY, d=0.2)
    tmp = cmds.polyCube(w=0.2, h=sizeY, d=0.5)
    #combine them
    axel = cmds.polyBoolOp(axel[0], tmp[0], op=1, ch=False)
    
    #create outer edge
    pill = cmds.polyCylinder(r=0.25, h=sizeY-0.25)
    #top
    tmp = cmds.polySphere(r=0.25)
    cmds.scale(0.5, scaleY=True, a=True)
    cmds.move((sizeY-0.25)*0.5, moveY=True, a=True)
    pill = cmds.polyBoolOp(pill[0], tmp[0], op=1, ch=False)
    #bottom
    tmp = cmds.polySphere(r=0.25)
    cmds.scale(0.5, scaleY=True, a=True)
    cmds.move(-(sizeY-0.25)*0.5, moveY=True, a=True)
    pill = cmds.polyBoolOp(pill[0], tmp[0], op=1, ch=False)
    
    #get rounded axel shape
    axel = cmds.polyBoolOp(axel[0], pill[0], op=3, ch=False)
    
    return axel

######################
##       GEAR       ##
######################            
def createGearPolys():
    
    toothLen = 0.2
    teeth = cmds.radioButtonGrp("gearNumTeeth", q=True, sl=True)
    if(teeth == 4):
        teeth = 40
    else:
        teeth *= 8
        
    gearRad = teeth*0.05
    
    gear = cmds.polyCylinder(r=gearRad-toothLen*0.5, h=0.4, sx=teeth*2)
    for i in range(teeth*2-1):
        if(i % 2 == 0):
            cmds.select(gear[0] + ".f[" + str(i) + "]")
            cmds.polyExtrudeFacet(ltz=toothLen*0.5)
            cmds.polyExtrudeFacet(ltz=toothLen*0.5)
            cmds.polyMoveFacet(localScaleX=0.5)
    #sink in both sides
    print teeth
    if(teeth > 8):
        tmp = cmds.polyCylinder(r=gearRad-toothLen*0.5 - 0.1, h=0.2, sx=teeth*2)
        cmds.move(0.2, moveY=True, a=True)
        gear = cmds.polyBoolOp(gear[0], tmp[0], op=2, ch=False)
        tmp = cmds.polyCylinder(r=gearRad-toothLen*0.5 - 0.1, h=0.2, sx=teeth*2)
        cmds.move(-0.2, moveY=True, a=True)
        gear = cmds.polyBoolOp(gear[0], tmp[0], op=2, ch=False)
    #add axel hole
    tmp = cmds.polyCylinder(r=0.3, h=0.8, sx=teeth*2)
    gear = cmds.polyBoolOp(gear[0], tmp[0], op=1, ch=False)
    tmp = createAxelPolys(False)
    gear = cmds.polyBoolOp(gear[0], tmp[0], op=2, ch=False)
    
    cmds.rotate(90, rotateX=True, a=True)
    
    return gear

######################
##     CONNECTOR    ##
######################            
def createConnectorPolys():
    ends = [0, 0]
    leftArr = cmds.radioCollection("connectorLeft", q=True, cia=True)
    rightArr = cmds.radioCollection("connectorRight", q=True, cia=True)
    left = cmds.radioCollection("connectorLeft", q=True, sl=True)
    right = cmds.radioCollection("connectorRight", q=True, sl=True)
    
    i=0
    for name in leftArr:
        if(left in name):
            ends[0] = i
            break
        i+=1
    i=0
    for name in rightArr:
        if(right in name):
            ends[1] = i
            break
        i+=1
    
    print ends
    
    #dummy base obj
    connector = ["", ""]
    
    for i in range(2):
        type = connectorMap[ends[i]]
        #one side is axel
        if(type == "Axel"):
            pin = createAxelPolys(False, 1.6)
            cmds.rotate(90, rotateZ=True)
            tmp = cmds.polyCylinder(r=1, h=0.8, axis=[1, 0, 0])
            cmds.move(0.45 - i*0.9, moveX=True)
            pin = cmds.polyBoolOp(pin[0], tmp[0], op=2, ch=False)
        #female axel on one side (spacer)
        elif(type == "Female Axel"):
            pin = createSpacerPolys(False)
            cmds.move(-0.4 + i*0.8, moveX=True)
            tmp = cmds.polyCylinder(r=0.35, h=0.15, axis=[1, 0, 0])
            cmds.move(-0.075 + i*0.15, moveX=True)
            pin = cmds.polyBoolOp(pin[0], tmp[0], op=1, ch=False) 
        #nub for brick connector
        elif(type == "Brick"):
            pin = cmds.polyCylinder(r=0.25, h=0.29, axis=[1, 0, 0])
            tmp = cmds.polyCylinder(r=0.15, h=0.4, axis=[1, 0, 0])
            pin = cmds.polyBoolOp(pin[0], tmp[0], op=2, ch=False)
            cmds.move(-0.1 + i*0.2, moveX=True, a=True)
        #one side is default connector (or half or double)
        elif("Hole Connector" in type):
            #first find size
            half = False
            double = False
            if("Half" in type):
                half = True
            elif("Double" in type):
                double = True
            #sart with one hole
            pin = getHoleShape(half)
            cmds.rotate(90, rotateZ=True)
            if(half):
                cmds.move(-0.2 + i*0.4, moveX=True)
            else:
                cmds.move(-0.4 + i*0.8, moveX=True)
            if(double):
                tmp = cmds.duplicate(pin[0])
                cmds.move(-0.8 + 1.6*i, moveX=True, r=True)
                pin = cmds.polyBoolOp(pin[0], tmp[0], op=1, ch=False)
            #add slit
            tmp = cmds.polyCube(w=0.6, h=1, d=0.1)
            if(half):
                cmds.move(-0.4 + i*0.8, moveX=True)
            else:
                cmds.move(-0.8 + i*1.6, moveX=True)
            if(double):
                tmp2 = cmds.polyCube(w=0.6, h=1, d=0.1)
                cmds.move(-1.6 + i*3.2, moveX=True)
                tmp = cmds.polyUnite(tmp[0], tmp2[0], ch=False)
            pin = cmds.polyBoolOp(pin[0], tmp[0], op=2, ch=False)
            #take off outside
            tmp = cmds.polyCylinder(r=0.5, h=0.8, axis=[1, 0, 0])
            tmp2 = cmds.polyCylinder(r=0.28, h=0.8, axis=[1, 0, 0])
            tmp = cmds.polyBoolOp(tmp[0], tmp2[0], op=2, ch=False)
            cmds.move(-0.5 + 1.0*i, moveX=True)
            if(double):
                cmds.move(-0.8 + 1.6*i, moveX=True)
            pin = cmds.polyBoolOp(pin[0], tmp[0], op=2, ch=False)
            if(double):
                #add rounded center piece
                tmp = cmds.polyCylinder(r=0.5, h=0.2, axis=[1, 0, 0])
                tmp2 = cmds.polySphere(r=0.27, axis=[1, 0, 0])
                cmds.scale(1.5, scaleX=True)
                tmp = cmds.polyBoolOp(tmp[0], tmp2[0], op=2, ch=False)
                cmds.move(-0.8 + 1.6*i, moveX=True)
                #return pin
                pin = cmds.polyBoolOp(pin[0], tmp[0], op=2, ch=False)
            # hollow inside
            tmp = cmds.polyCylinder(r=0.19, h=1.6, axis=[1, 0, 0])
            cmds.move(-0.89 + 1.78*i, moveX=True)
            pin = cmds.polyBoolOp(pin[0], tmp[0], op=2, ch=False)
        connector[i] = pin[0]
    
    connector = cmds.polyBoolOp(connector[0], connector[1], op=1, ch=False)
    cmds.delete(ch=True)
    return connector
    
######################
##      SPACER      ##
######################            
def createSpacerPolys(fromUI=True, width=1, rimSize=0.35):
    
    size=width*0.8
    if(fromUI):
        size = 0.4 * cmds.radioButtonGrp("spacerSize", q=True, sl=True)
    
    spacer = cmds.polyCylinder(r=rimSize, h=size, axis=[1, 0, 0])
    
    #smaller ring
    if(size == 0.4):
        tmp = cmds.polyTorus(r=rimSize, sr=0.08, axis=[1, 0, 0], sy=14)
    else:
        tmp = cmds.polyCylinder(r=0.5, h=0.5, axis=[1,0,0])
        tmp2 = cmds.polyCylinder(r=0.27, h=0.5, axis=[1,0,0])
        tmp = cmds.polyBoolOp(tmp[0], tmp2[0], op=2, ch=False)
        tmp2 = cmds.polyCube(w=0.45, h=1, d=0.1)
        tmp = cmds.polyBoolOp(tmp[0], tmp2[0], op=1, ch=False)
    spacer = cmds.polyBoolOp(spacer[0], tmp[0], op=2, ch=False)

    #axel hole
    tmp = createAxelPolys(False)
    cmds.rotate(90, rotateZ=True)
    spacer = cmds.polyBoolOp(spacer[0], tmp[0], op=2, ch=False)
           
    cmds.delete(ch=True)
    return spacer
    
######################
##     ADD HOLES    ##
######################
def addHoles(base, numHoles, offsetY=0.0, offsetX=0.0, axelPos=[], isHalfDepth=False):
    for i in range(numHoles):
        if(i in axelPos):
            hole = createAxelPolys(False)
        else:
            hole = getHoleShape(isHalfDepth)
        #rotate and subtract from base block
        cmds.rotate(90, rotateX=True, a=True)
        cmds.move((((numHoles - 1.0)/2.0) * (-0.8) + i * 0.8 + offsetX), moveX=True, a=True)
        cmds.move(offsetY, moveY=True, a=True)
        base = cmds.polyBoolOp(base[0], hole[0], op=2, caching=False, ch=False)
    return base     
    
######################
##    HOLE SHAPE    ##
######################
def getHoleShape(isHalfDepth=False):
    
    width=0.8
    if(isHalfDepth):
        width=0.4
    #create inner cylinder
    hole = cmds.polyCylinder(r=0.25, h=width)
    #create and add top edge flange
    edge = cmds.polyCylinder(r=0.31, h=0.09)
    cmds.move(width*0.5 - 0.045, moveY=True, a=True)
    hole = cmds.polyBoolOp(hole[0], edge[0], op=1, caching=False, ch=False)
    #create and add bottom edge flange
    edge = cmds.polyCylinder(r=0.31, h=0.09)
    cmds.move(-width*0.5 + 0.045, moveY=True, a=True)
    hole = cmds.polyBoolOp(hole[0], edge[0], op=1, caching=False, ch=False)

    return hole  

######################
##   APPLY COLOUR   ##
######################
def applyColor(piece, col):
    
    #check for namespace
    if(cmds.namespace(ex="LEGOMaterials") == False):
        cmds.namespace(add="LEGOMaterials")
    cmds.namespace(set="LEGOMaterials" )
    
    #get ready to do shader
    matName = col.replace(" ", "")
    matType="phong"
    if(matName == "Rubber"):
        matType="lambert"
        col="Black"
    rgb = colorMap[col]
    

    #create new node if doesn't exist
    if(cmds.objExists("LEGOMaterials:" + matName) == False):
        matName = cmds.shadingNode(matType, asShader=True, name=matName)
        cmds.setAttr(matName + ".color", rgb[0], rgb[1], rgb[2], type='double3')
    else:
        matName = "LEGOMaterials:" + matName
    #reset default namespace
    cmds.namespace(set=":")
    
    #set color
    cmds.delete(ch=True)
    cmds.select(piece[0])
    cmds.hyperShade(assign=matName)
    
    