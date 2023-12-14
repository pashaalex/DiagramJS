const Statuses = {
    None: 0,
    CustomMove: 1,
    DrawConnector: 2,
    MoveMeAutomaticaly: 3
}

const EndpointTypes = {
    SimpleLine: 0,
    OneToMany: 1,
    Arrow: 2,
    Inheritance: 3,
    Implementation: 4,
    Dependancy: 5,
    Aggregation: 6,
    Composition: 7
}

const VerticalAlignTypes = {
    Over: 0,
    Top: 1,
    Center: 2,
    Bottom: 3,
    Under: 4
}

const PropertyTypes = {
    OneLineString: 0,
    MultilineString: 1,
    Enum: 2,
    Numbers: 3,
    Boolean: 4,
    Color: 5
}

class GetConnectionObjectResult {
    status;
    objectForConnect;
    connectionPointerIndex;
    constructor(status, objectForConnect, connectionPointerIndex) {
        this.status = status;
        this.objectForConnect = objectForConnect;
        this.connectionPointerIndex = connectionPointerIndex;
    }
}

class PropertyGridItem {
    objectToSet;
    propertyName;
    propertyDisplayName;
    propertyType;
    enumType;
    constructor(objectToSet, propertyName, propertyDisplayName, propertyType, enumType) {
        this.objectToSet = objectToSet;
        this.propertyName = propertyName;
        this.propertyDisplayName = propertyDisplayName;
        this.propertyType = propertyType;
        this.enumType = enumType;
    }
}

class ObjectTypeInfo {
    objectTypeName;
    objectDisplayName;
    objectActivator;
    objectDrawIcon;
    constructor(objectTypeName, objectDisplayName, objectActivator, objectDrawIcon) {
        this.objectTypeName = objectTypeName;
        this.objectDisplayName = objectDisplayName;
        this.objectActivator = objectActivator;
        this.objectDrawIcon = objectDrawIcon;
    }
}

class BasePoint {
    x;
    y;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    getDistance(p) {
        return Math.sqrt((p.x - this.x) * (p.x - this.x) + (p.y - this.y) * (p.y - this.y));
    }
    getDistanceToCoordinates(x, y) {
        return Math.sqrt((x - this.x) * (x - this.x) + (y - this.y) * (y - this.y));
    }
}

class ConnectionPoint extends BasePoint {
    directionX;
    directionY;
    constructor(x, y, directionX, directionY) {
        super(x, y);
        this.directionX = directionX;
        this.directionY = directionY;
    }
}

class BaseRectangle {
    x;
    y;
    width;
    height;
    constructor() {
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
    }
}

class BaseFigure extends BaseRectangle {
    objectId;
    svg_object;
    parentObject;
    IsInitialized;
    connectors;
    _isSelected;
    _innerObjects;
    _isVisible;
    constructor() {
        super();
        this.objectId = 0;
        this.IsInitialized = false;
        this.parentObject = null;
        this.connectors = [];
        this._isSelected = false;
        this._innerObjects = [];
    }
    removeItemFromArray(item, array) {
        var index = array.indexOf(item);
        if (index != -1)
            array.splice(index, 1);
    }
    IsPointInRectangle(x, y, rect) {
        if ((x < rect.x)
            || (y < rect.y)
            || (x > rect.x + rect.width)
            || (y > rect.y + rect.height))
            return false;
        return true;
    }
    get isVisible() {
        return this._isVisible;
    }
    set isVisible(val) {
        if (val)
            this.svg_object.style.display = "block";
        else
            this.svg_object.style.display = "none";
        this._isVisible = val;
    }
    mouse_down(x, y) {
        return new GetConnectionObjectResult(Statuses.None, null);
    }
    mouse_up(x, y) {
    }
    double_click(x, y) {
        return false;
    }
    getConnectionPoints() {
        return [];
    }
    IsPointInMe(x, y) {
        return this.IsPointInRectangle(x, y, this);
    } 
    getSecondObjectForConnect(x, y) {
        return null;
    }
    setParent(parentObject) {
        this.parentObject = parentObject;
    }
    rebuild() { }
    get X() {
        return this.x;
    }
    set X(val) {
        let prevX = this.x;
        this.x = val;
        if (this.svg_object != null)
            this.svg_object.setAttributeNS(null, "x", val);
        this.positionChanged(this.x - prevX, 0);
    }
    get Y() {
        return this.y;
    }
    set Y(val) {
        let prevY = this.y;
        this.y = val;
        if (this.svg_object != null)
            this.svg_object.setAttributeNS(null, "y", val);
        this.positionChanged(0, this.y - prevY);
    }
    get Width() {
        return this.width;
    }
    set Width(val) {
        this.width = val;
        if (this.svg_object != null)
            this.svg_object.setAttributeNS(null, "width", val);
        this.sizeChanged();
    }
    get Height() {
        return this.height;
    }
    set Height(val) {
        this.height = val;
        if (this.svg_object != null)
            this.svg_object.setAttributeNS(null, "height", val);
        this.sizeChanged();
    }
    moveXY(dx, dy) {
        this.X = this.X + dx;
        this.Y = this.Y + dy;        
    }
    positionChanged(dx, dy) {
        for (let i = 0; i < this._innerObjects.length; i++) {
            this._innerObjects[i].moveXY(dx, dy);
        }
        this.refreshConnectors();
    }
    sizeChanged() {
        this.refreshConnectors();
        this.refreshInnerObjectPositions();
    }
    get IsSelected() {
        return this._isSelected;
    }
    set IsSelected(val) {
        if (val != this._isSelected) {
            this._isSelected = val;
            if (this.svg_object != null) {
                if (this._isSelected)
                    this.svg_object.setAttributeNS(null, 'stroke-width', 2);
                else
                    this.svg_object.setAttributeNS(null, 'stroke-width', 1);
            }
        }
    }
    addConnector(connector) {
        this.connectors.push(connector);
    }
    removeConnector(connector) {
        this.removeItemFromArray(connector, this.connectors);
    }
    refreshConnectors() {
        for (let i = 0; i < this.connectors.length; i++) 
            this.connectors[i].refresh();
    }
    // callback function, that calls every time when parrent contron update position
    parentUpdatePosition() {
    }
    refreshInnerObjectPositions() {
        for (let i = 0; i < this._innerObjects.length; i++)
            this._innerObjects[i].parentUpdatePosition();
    }
    addInnerObject(obj) {
        this._innerObjects.push(obj);
    }
    removeInnerObject(obj) {
        this.removeItemFromArray(obj, this._innerObjects);
    }
    dispose() {
        if (this.svg_object != null)
            this.svg.removeChild(this.svg_object);

        while(this.connectors.length > 0) {
            this.model.removeConnector(this.connectors[0]);
            this.connectors[0].dispose(); // connector.dispose remove connector from owner connectors collection            
        }

        for (let i = 0; i < this._innerObjects.length; i++) 
            this._innerObjects[i].dispose();
    }
}

class PointerCircle extends BaseFigure {
    radius;
    opacityString;
    cursorString;    
    constructor(parent, parentUpdatePosition) {
        super();
        this.x = 0;
        this.y = 0;
        this.radius = 5;
        this.opacityString = ".25";
        this.cursorString = "default";        
        this.setParent(parent);
        this.parentUpdatePosition = parentUpdatePosition;
        this.init(parent.svg, parent.model);
        this.isVisible = false;
        this.parentUpdatePosition();        
    }
    init(svg, model) {
        this.model = model;
        this.svg = svg;
        this.svg_object = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        this.X = this.x;
        this.Y = this.y;
        this.svg_object.setAttribute("r", this.radius);        
        this.svg.appendChild(this.svg_object);
        this.IsInitialized = true;
        this.rebuild();
    }
    setFillColor(val) {
        this.svg_object.setAttribute("fill", val);
    }
    IsPointInMe(x, y) {
        return Math.sqrt((x - this.x) * (x - this.x) + (y - this.y) * (y - this.y)) <= this.radius;
    }
    rebuild() {
        this.svg_object.setAttributeNS(null, 'style', "fill-opacity:" + this.opacityString + ";cursor:" + this.cursorString);
    }
    get X() {
        return this.x;
    }
    set X(val) {
        this.x = val;
        this.svg_object.setAttributeNS(null, "cx", val);
    }
    get Y() {
        return this.y;
    }
    set Y(val) {
        this.y = val;
        this.svg_object.setAttributeNS(null, "cy", val);
    }
    dispose() {
        super.dispose();
    }
}

class ConnectionPointCircle extends PointerCircle { // realize ConnectionPoint
    directionX;
    directionY;
    constructor(parent, parentUpdatePosition, directionX, directionY) {
        super(parent, parentUpdatePosition);
        this.directionX = directionX;
        this.directionY = directionY;
        this.setFillColor("green");
        this.opacityString = ".5";
        this.rebuild();
        this.isVisible = false;
    }
    getDistance(p) {
        return Math.sqrt((p.x - this.x) * (p.x - this.x) + (p.y - this.y) * (p.y - this.y));
    }
    getDistanceToCoordinates(x, y) {
        return Math.sqrt((x - this.x) * (x - this.x) + (y - this.y) * (y - this.y));
    }
}

class BaseLine {
    x1;
    y1;
    x2;
    y2;
    IsInitialized;
    static globalLineId = 0;
    #svg_object;
    #selected;
    isDisposed;
    _isDashed;
    _strokeWidth;
    constructor() {
        this.IsInitialized = false;
        this.lineId = BaseLine.globalLineId++;
        this.#selected = false;
        this.isDisposed = false;
        this._isDashed = false;
        this.x1 = 0;
        this.y1 = 0;
        this.x2 = 0;
        this.y2 = 0;
        this._strokeWidth = 1;
    }
    init(svg) {
        this.svg = svg;
        this.#svg_object = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        this.#svg_object.setAttributeNS(null, 'id', 'line_' + this.lineId);
        this.X1 = this.x1;
        this.Y1 = this.Y1;
        this.X2 = this.X2;
        this.Y2 = this.Y2;
        this.#svg_object.setAttribute("stroke", "#000000");
        this.svg.appendChild(this.#svg_object);
        this.IsInitialized = true;
    }
    get LineColor() {
        return this.#svg_object.getAttribute("stroke");
    }
    set LineColor(val) {
        this.#svg_object.setAttribute("stroke", val);
    }
    get IsDashed() {
        return this._isDashed;
    }
    set IsDashed(val) {
        this._isDashed = val;
        if (val)
            this.#svg_object.setAttribute("stroke-dasharray", "4");
        else
            this.#svg_object.removeAttribute("stroke-dasharray");
    }
    get IsSelected() {
        return this.#selected;
    }
    set IsSelected(val) {
        if (val != this.#selected) {
            this.#selected = val;
            if (this.#selected)
                this.#svg_object.setAttributeNS(null, 'stroke-width', this._strokeWidth + 1);
            else
                this.#svg_object.setAttributeNS(null, 'stroke-width', this._strokeWidth);
        }
    }
    get StrokeWidth() {
        return this._strokeWidth;
    }
    set StrokeWidth(val) {
        if ((val > 0) && (val < 100)) {
            this._strokeWidth = val;
            this.#svg_object.setAttributeNS(null, 'stroke-width', this._strokeWidth);
        }
    }
    IsPointNear(x, y) {
        const maxDist = 10;
        let a = Math.sqrt((x - this.x1) * (x - this.x1) + (y - this.y1) * (y - this.y1));
        let b = Math.sqrt((x - this.x2) * (x - this.x2) + (y - this.y2) * (y - this.y2));
        let c = Math.sqrt((this.x1 - this.x2) * (this.x1 - this.x2) + (this.y1 - this.y2) * (this.y1 - this.y2));
        if ((a < c) && (b < c)) {
            let p = (a + b + c) / 2.0;
            let h = 2 * Math.sqrt(p * (p - 2) * (p - b) * (p - c)) / c;
            if (h < maxDist) return true;
        }
        if (Math.sqrt((x - this.x1) * (x - this.x1) + (y - this.y1) * (y - this.y1)) < maxDist) return true;
        if (Math.sqrt((x - this.x2) * (x - this.x2) + (y - this.y2) * (y - this.y2)) < maxDist) return true;
        return false;
    }
    get X1() {
        return this.x1;
    }
    set X1(val) {
        this.x1 = val;
        this.#svg_object.setAttributeNS(null, "x1", val);
    }
    get Y1() {
        return this.y1;
    }
    set Y1(val) {
        this.y1 = val;
        this.#svg_object.setAttributeNS(null, "y1", val);
    }
    get X2() {
        return this.x2;
    }
    set X2(val) {
        this.x2 = val;
        this.#svg_object.setAttributeNS(null, "x2", val);
    }
    get Y2() {
        return this.y2;
    }
    set Y2(val) {
        this.y2 = val;
        this.#svg_object.setAttributeNS(null, "y2", val);
    }
    moveXY(dx, dy) {
        this.X1 = this.X1 + dx;
        this.Y1 = this.Y1 + dy;
        this.X2 = this.X2 + dx;
        this.Y2 = this.Y2 + dy;
    }
    dispose() {
        if (!this.isDisposed) {
            //console.trace();
            //alert(1);
            this.svg.removeChild(this.#svg_object);
            this.isDisposed = true;
        }
    }
}

class TextBlock extends BaseFigure {
    text;
    svg;
    is_bold;
    model;
    enableEdit;
    #editModeOn;
    innerSpans;
    rotationAngle;
    constructor() {
        super();
        this.text = "";
        this.contentWidth = 0;
        this.contentHeight = 0;
        this.is_bold = false;
        this.enableEdit = false;
        this.#editModeOn = false;
        this.innerSpans = [];
        this.rotationAngle = 0;
    }
    init(svg, model) {
        this.svg = svg;
        this.model = model;
        this.svg_object = document.createElementNS("http://www.w3.org/2000/svg", "text");
        this.X = this.x;
        this.Y = this.x;
        this.svg_object.setAttributeNS(null, "font-family", this.model.fontFamily);
        this.svg_object.setAttributeNS(null, "font-size", this.model.fontSize);
        this.svg.appendChild(this.svg_object);        
        this.IsInitialized = true;
        this.rebuild();
    }
    editStart() {
        let contentText = this.Text;
        this.svg_object.innerHTML = "";
        this.createEditor(this.x, this.y, contentText);
        this.model.textEditModeOn = true;
        this.#editModeOn = true;
    }
    edit_complete(myforeign, textdiv) {
        if (this.#editModeOn) {
            this.svg_object.removeAttribute("contenteditable");
            this.#editModeOn = false;
            this.IsSelected = false;
            this.Text = textdiv.innerText;
            this.svg.removeChild(myforeign);
            this.model.textEditModeOn = false;
            if (this.parentObject != null) this.parentObject.rebuild();
            if (this.parentObject.model != null) {
                this.parentObject.model.refreshPropertyGrid();
            }
        }
    }
    double_click(x, y) {
        if (this.enableEdit && this.IsPointInMe(x, y) && (!this.#editModeOn)) {
            this.editStart();
            this.IsSelected = true;
            return true;
        }
        return false;
    }    
    createEditor(x, y, contentText) {
        let myforeign = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject')
        let textdiv = document.createElement("div");

        if (contentText.length > 0) {
            let lines = contentText.split(/\r?\n/);
            for (let i = 0; i < lines.length; i++) {
                let textnode = document.createTextNode(lines[i]);
                textdiv.appendChild(textnode);
                let br = document.createElement("br");
                if (i < lines.length - 1)
                    textdiv.appendChild(br);
            }
        } else {
            let textnode = document.createTextNode("Edit text");
            textdiv.appendChild(textnode);
        }
        
        textdiv.setAttribute("contentEditable", "true");
        textdiv.setAttribute("width", "auto");
        myforeign.setAttribute("width", "100%");
        myforeign.setAttribute("height", "100%");        
        myforeign.style["text-align"] = "left";        
        textdiv.style["display"] = "inline-block";
        textdiv.style["font-size"] = this.model.fontSize;
        textdiv.style["font-family"] = this.model.fontFamily;
        myforeign.setAttributeNS(null, "transform", "translate(" + x + " " + y + ")");
        this.svg.appendChild(myforeign);
        myforeign.appendChild(textdiv);
        textdiv.focus();
        let obj = this;        
        textdiv.addEventListener("blur", function () { obj.edit_complete(myforeign, textdiv); }, false);
        textdiv.addEventListener('keydown', function (e) {
            if ((e.key === 'Enter') && (!e.shiftKey) && (!e.ctrlKey)) {
                obj.edit_complete(myforeign, textdiv);
            }
        }, false);
    };
    setRotationAngle(angle) {
        this.rotationAngle = angle;
        this.rebuild();
    }
    rebuild() {
        if (this.IsInitialized) {
            this.X = this.x;
            this.Y = this.y;
            this.svg_object.innerHTML = "";
            let lines = this.text.split(/\r?\n/);
            this.innerSpans = [];
            this.svg_object.removeAttribute("transform");
            for (let i = 0; i < lines.length; i++) {
                let lObj = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
                lObj.setAttributeNS(null, "x", this.x);
                lObj.setAttributeNS(null, "dy", "1.0em");
                let text_node = document.createTextNode(lines[i]);
                lObj.appendChild(text_node);
                lObj.innerText = lines[i];
                this.svg_object.appendChild(lObj);
                this.innerSpans.push(lObj);
            }            
            let size = this.svg_object.getBBox();
            this.contentWidth = size.width;
            this.contentHeight = size.height;
            this.svg_object.setAttributeNS(null, "transform", "rotate(" + this.rotationAngle + ", " + this.x + ", " + this.y + ")");
        }
    }
    positionChanged(dx, dy) {
        super.positionChanged(dx,dy);
        this.#refreshSpans();
    }
    IsPointInMe(x, y) {
        if ((x < this.x)
            || (y < this.y)
            || (x > this.x + this.contentWidth)
            || (y > this.y + this.contentHeight))
            return false;
        return true;
    }
    get IsSelected() {
        return this._isSelected;
    }
    set IsSelected(val) {
        if (val != this._isSelected) {
            this._isSelected = val;           
            if (this.svg_object != null) {
                if (this._isSelected)
                    this.svg_object.setAttributeNS(null, 'fill', 'red');
                else
                    this.svg_object.removeAttribute('fill');
            }
        }
    }
    set Text(text) {
        this.text = text;
        this.rebuild();
    }
    get Text() {
        return this.text;
    }
    get IsBold() {
        return this.IsBold;
    }
    set IsBold(val) {
        this.is_bold = val;
        if (this.is_bold)
            this.svg_object.setAttributeNS(null, "font-weight", "bold");
        else
            this.svg_object.setAttributeNS(null, "font-weight", "normal");
    }
    #refreshSpans() {
        for (let i = 0; i < this.innerSpans.length; i++) {
            let lObj = this.innerSpans[i];
            lObj.setAttributeNS(null, "x", this.x);
        }
    }
    dispose() {
        super.dispose();
    }
}

class ConnectorLine {
    objectId;
    relObject1;
    relObject2;
    pointX;
    pointY;
    svg;
    line;
    model;
    pointIndex1;
    pointIndex2;
    lineHead1;
    //lineHead2;
    connectorWidth;
    endPointType;
    endPoint;
    textBlockBottom;
    textBlockTop;
    textBlockBegin;
    textBlockEnd;
    constructor(relObject1) {
        this.objectId = 0;
        this.connectorWidth = 20;
        this.relObject1 = relObject1;
        this.lineHead1 = null;
        //this.lineHead2 = null;
        this.endPoint = null;
        this.endPointType = null;
        this.textBlockBottom = null;
        this.textBlockTop = null;
        this.textBlockBegin = null;
        this.textBlockEnd = null;
    }
    init(svg, model) {
        this.svg = svg;
        this.model = model;
        this.line = new BaseLine();
        this.line.init(this.svg);
    }
    get IsSelected() {
        return this.line.IsSelected;
    }
    set IsSelected(val) {
        this.line.IsSelected = val;
    }
    IsPointInMe(x, y) {
        return this.line.IsPointNear(x, y);
    }
    // call when mouse_move wlile draw connector
    drawTo(x, y) {
        let bestI = 0;
        let bestV = -1;
        let points = this.relObject1.getConnectionPoints();
        if (this.pointIndex1 != null) {
            bestI = this.pointIndex1;
        } else {
            for (let i = 0; i < points.length; i++) {
                let v = points[i].getDistanceToCoordinates(x, y);
                if ((bestV < 0) || (v < bestV)) {
                    bestV = v;
                    bestI = i;
                }
            }
        }
        this.line.X1 = points[bestI].x;
        this.line.Y1 = points[bestI].y;
        this.line.X2 = x;
        this.line.Y2 = y;
    }
    get currentEndpointType() {
        return this.endPointType;
    }
    set currentEndpointType(endpointType) {
        if (this.endPointType != endpointType) {
            this.endPointType = endpointType;
            if (this.endPoint != null) {
                this.endPoint.dispose();
                let activator = EndpointActivators[this.endPointType];
                this.endPoint = activator(0, 0);
                this.endPoint.init(this.svg, this.model);                
                this.line.IsDashed = this.endPoint.isDashed;
                this.refresh();
            }
        }
    }
    getPropertyTypes() {
        let arr = [];
        arr.push(new PropertyGridItem(this, "currentEndpointType", "Endpoint type", PropertyTypes.Enum, EndpointTypes));
        arr.push(new PropertyGridItem(this, "TextBottom", "Bottom text", PropertyTypes.MultilineString));
        arr.push(new PropertyGridItem(this, "TextTop", "Top text", PropertyTypes.MultilineString));
        arr.push(new PropertyGridItem(this, "TextBegin", "Begin text", PropertyTypes.OneLineString));
        arr.push(new PropertyGridItem(this, "TextEnd", "End text", PropertyTypes.OneLineString));
        return arr;
    }
    connect(relObject2) {
        this.relObject2 = relObject2;
        this.relObject1.addConnector(this);
        this.relObject2.addConnector(this);
        this.lineHead1 = new BaseLine();
        this.lineHead1.init(this.svg);
        this.endPointType = this.model.currentEndpointType;
        let activator = EndpointActivators[this.endPointType];
        this.endPoint = activator(0, 0);
        this.endPoint.init(this.svg, this.model);
        this.refresh();
    }
    #getTextByControlName(controlName) {
        if (this[controlName] == null) return "";
        return this[controlName].Text;
    }
    #setTextByControlName(controlName, text) {
        if (((text == null) || (text == "")) && (this[controlName] != null)) {
            this[controlName].dispose();
            this[controlName] = null;
            return;
        }
        if ((text != null) && (text != "")) {
            if (this[controlName] == null)
                this[controlName] = new TextBlock();
            this[controlName].Text = text;
        }
        this.refresh();
    }    
    get TextBottom() {
        return this.#getTextByControlName("textBlockBottom");
    }
    set TextBottom(val) {
        this.#setTextByControlName("textBlockBottom", val);
    }
    get TextTop() {
        return this.#getTextByControlName("textBlockTop");
    }
    set TextTop(val) {
        this.#setTextByControlName("textBlockTop", val);
    }
    get TextBegin() {
        return this.#getTextByControlName("textBlockBegin");
    }
    set TextBegin(val) {
        this.#setTextByControlName("textBlockBegin", val);
    }
    get TextEnd() {
        return this.#getTextByControlName("textBlockEnd");
    }
    set TextEnd(val) {
        this.#setTextByControlName("textBlockEnd", val);
    }
    #horizontalTextBlockSetPosition(textBlock, x, y, directionX, directionY, x2, y2, arrowPadding) {
        if (directionY == 0) {
            textBlock.X = (directionX > 0) ? x + this.model.padding : x - textBlock.contentWidth - this.model.padding;
            textBlock.Y = (y2 > y) ? y - textBlock.contentHeight - this.model.padding - arrowPadding : y + this.model.padding + arrowPadding;
        } else {
            textBlock.x = (x2 < x) ? x + this.model.padding + arrowPadding : x - textBlock.contentWidth - this.model.padding - arrowPadding;
            textBlock.Y = (directionY < 0) ? y - textBlock.contentHeight - this.model.padding: textBlock.Y = y + this.model.padding;
        }
    }
    refresh() {
        let points1 = [];
        if (this.pointIndex1 != null)
            points1.push(this.relObject1.getConnectionPoints()[this.pointIndex1]);
        else
            points1 = this.relObject1.getConnectionPoints();

        let points2 = [];
        if (this.pointIndex2 != null)
            points2.push(this.relObject2.getConnectionPoints()[this.pointIndex2]);
        else
            points2 = this.relObject2.getConnectionPoints();

        let bestV = -1;
        let bestI = 0;
        let bestJ = 0;
        for (let i = 0; i < points1.length; i++)
            for (let j = 0; j < points2.length; j++) {
                let v = points1[i].getDistance(points2[j]);
                if ((bestV < 0) || (v < bestV)) {
                    bestV = v;
                    bestI = i;
                    bestJ = j;
                }
            }

        this.lineHead1.X1 = points1[bestI].x;
        this.lineHead1.Y1 = points1[bestI].y;
        this.lineHead1.X2 = points1[bestI].x + points1[bestI].directionX;
        this.lineHead1.Y2 = points1[bestI].y + points1[bestI].directionY;

        this.line.X1 = points1[bestI].x + points1[bestI].directionX;
        this.line.Y1 = points1[bestI].y + points1[bestI].directionY;
        this.line.X2 = points2[bestJ].x + points2[bestJ].directionX;
        this.line.Y2 = points2[bestJ].y + points2[bestJ].directionY;

        this.endPoint.X = points2[bestJ].x;
        this.endPoint.Y = points2[bestJ].y;
        this.endPoint.setDirectionX(points2[bestJ].directionX);
        this.endPoint.setDirectionY(points2[bestJ].directionY);

        let l = Math.sqrt((this.line.X1 - this.line.X2) * (this.line.X1 - this.line.X2) + (this.line.Y1 - this.line.Y2) * (this.line.Y1 - this.line.Y2));
        let a_rad = Math.atan2(this.line.Y2 - this.line.Y1, this.line.X2 - this.line.X1);        

        if (this.textBlockBottom != null) {
            let a = a_rad * 180 / Math.PI;
            if (!this.textBlockBottom.IsInitialized)
                this.textBlockBottom.init(this.svg, this.model);

            let dx = this.line.X1 - this.textBlockBottom.X;
            let dy = this.line.Y1 - this.textBlockBottom.Y;

            if (this.textBlockBottom.contentWidth < l) {
                let p = (l - this.textBlockBottom.contentWidth) / (2 * l);
                let xt = 0;
                let yt = 0;
                if ((a > 90) || (a < -90)) {
                    xt = this.line.X2 + (this.line.X1 - this.line.X2) * p;
                    yt = this.line.Y2 + (this.line.Y1 - this.line.Y2) * p;
                    a = a + 180;
                } else {
                    xt = this.line.X1 + (this.line.X2 - this.line.X1) * p;
                    yt = this.line.Y1 + (this.line.Y2 - this.line.Y1) * p;
                }
                dx = xt - this.textBlockBottom.X;
                dy = yt - this.textBlockBottom.Y;
            }
            this.textBlockBottom.moveXY(dx, dy);
            this.textBlockBottom.setRotationAngle(a);
        }

        if (this.textBlockTop != null) {
            let a = a_rad * 180 / Math.PI;
            if (!this.textBlockTop.IsInitialized)
                this.textBlockTop.init(this.svg, this.model);

            let dx = this.line.X1 - this.textBlockTop.X;
            let dy = this.line.Y1 - this.textBlockTop.Y;

            if (this.textBlockTop.contentWidth < l) {
                let p = (l - this.textBlockTop.contentWidth) / (2 * l);
                let xt = 0;
                let yt = 0;
                
                if ((a > 90) || (a < -90)) {
                    xt = this.line.X2 + (this.line.X1 - this.line.X2) * p + Math.sin(a_rad + Math.PI) * (this.textBlockTop.contentHeight + model.padding);
                    yt = this.line.Y2 + (this.line.Y1 - this.line.Y2) * p - Math.cos(a_rad + Math.PI) * (this.textBlockTop.contentHeight + model.padding);
                    a = a + 180;
                } else {
                    xt = this.line.X1 + (this.line.X2 - this.line.X1) * p + Math.sin(a_rad) * (this.textBlockTop.contentHeight + model.padding);
                    yt = this.line.Y1 + (this.line.Y2 - this.line.Y1) * p - Math.cos(a_rad) * (this.textBlockTop.contentHeight + model.padding);
                }
                dx = xt - this.textBlockTop.X;
                dy = yt - this.textBlockTop.Y;
            }
            this.textBlockTop.moveXY(dx, dy);
            this.textBlockTop.setRotationAngle(a);
        }

        if (this.textBlockBegin != null) {
            if (!this.textBlockBegin.IsInitialized)
                this.textBlockBegin.init(this.svg, this.model);
            this.#horizontalTextBlockSetPosition(this.textBlockBegin,
                points1[bestI].x,
                points1[bestI].y,
                points1[bestI].directionX,
                points1[bestI].directionY,
                points2[bestJ].x + points2[bestJ].directionX,
                points2[bestJ].y + points2[bestJ].directionY,
                0
            );
        }

        if (this.textBlockEnd != null) {
            if (!this.textBlockEnd.IsInitialized)
                this.textBlockEnd.init(this.svg, this.model);
            this.#horizontalTextBlockSetPosition(this.textBlockEnd,
                points2[bestJ].x,
                points2[bestJ].y,
                points2[bestJ].directionX,
                points2[bestJ].directionY,
                points1[bestI].x + points1[bestI].directionX,
                points1[bestI].y + points1[bestI].directionY,
                4
            );
        }
    }
    dispose() {
        this.relObject1.removeConnector(this);
        if (this.relObject2 != null)
            this.relObject2.removeConnector(this);
        this.line.dispose();
        if (this.lineHead1 != null) this.lineHead1.dispose();
        if (this.endPoint != null) this.endPoint.dispose();
        if (this.textBlockBottom != null) this.textBlockBottom.dispose();
        if (this.textBlockTop != null) this.textBlockTop.dispose();
        if (this.textBlockBegin != null) this.textBlockBegin.dispose();
        if (this.textBlockEnd != null) this.textBlockEnd.dispose();
    }
}

class LineObject extends BaseFigure {
    baseLine;
    svg;
    model;
    positionPoint1;
    positionPoint2;
    #isMoveActive;
    #pointIndexSelected;
    #selected;
    innerTextBlock;
    static GetObjectTypeInfo() {
        return new ObjectTypeInfo("LineObject",
            "Line",
            function (x, y, width, height) {
                let obj = new LineObject();
                obj.X1 = x;
                obj.Y1 = y;
                obj.X2 = x + width;
                obj.Y2 = y + height;
                return obj;
            },
            function (parent) {
                let rect = document.createElementNS("http://www.w3.org/2000/svg", "line");
                rect.setAttribute("x1", "10");
                rect.setAttribute("y1", "15");
                rect.setAttribute("x2", "36");
                rect.setAttribute("y2", "15");
                rect.setAttributeNS(null, 'fill', "none");
                rect.setAttributeNS(null, 'stroke', "black");
                rect.setAttributeNS(null, 'stroke-width', 1);
                parent.appendChild(rect);
            },
        );
    }
    constructor() {
        super();
        this.#pointIndexSelected = 0;
        this.#isMoveActive = false;
        this.#selected = false;
        this.baseLine = new BaseLine();
        this.innerTextBlock = new TextBlock();
        this.innerTextBlock.setParent(this);
        this.innerTextBlock.enableEdit = true;
        this.addInnerObject(this.innerTextBlock);
    }
    init(svg, model) {
        this.svg = svg;
        this.model = model;
        this.baseLine.init(svg, model);
        this.positionPoint1 = new PointerCircle(this, function () {
            this.X = this.parentObject.X1;
            this.Y = this.parentObject.Y1;
        });
        this.addInnerObject(this.positionPoint1);

        this.positionPoint2 = new PointerCircle(this, function () {
            this.X = this.parentObject.X2;
            this.Y = this.parentObject.Y2;
        });
        this.addInnerObject(this.positionPoint2);
        this.IsInitialized = true;
        this.rebuild();
    }
    get LineColor() {
        return this.baseLine.LineColor;
    }
    set LineColor(val) {
        this.baseLine.LineColor = val;
        this.lineColorChanged(val);
    }
    lineColorChanged(newColor) { }
    isInPositionPoint(x, y) {
        if (this.positionPoint1.IsPointInMe(x, y)) return true;
        if (this.positionPoint2.IsPointInMe(x, y)) return true;
        return false;
    }
    getPropertyTypes() {
        let arr = [];
        arr.push(new PropertyGridItem(this, "X1", "X1", PropertyTypes.Numbers));
        arr.push(new PropertyGridItem(this, "Y1", "Y1", PropertyTypes.Numbers));
        arr.push(new PropertyGridItem(this, "X2", "X2", PropertyTypes.Numbers));
        arr.push(new PropertyGridItem(this, "Y2", "Y2", PropertyTypes.Numbers));
        arr.push(new PropertyGridItem(this, "StrokeWidth", "Stroke width", PropertyTypes.Numbers));
        arr.push(new PropertyGridItem(this, "Text", "Text", PropertyTypes.MultilineString));
        arr.push(new PropertyGridItem(this, "LineColor", "Line color", PropertyTypes.Color));
        return arr;
    }
    get StrokeWidth() {
        return this.baseLine.StrokeWidth;
    }
    set StrokeWidth(val) {
        this.baseLine.StrokeWidth = val;
    }
    get Text() {
        return this.innerTextBlock.Text;
    }
    set Text(val) {
        this.innerTextBlock.Text = val;
        this.rebuild();
    }
    mouse_down(x, y) {
        this.prevX = x;
        this.prevY = y;
        if (this.positionPoint1.IsPointInMe(x, y)) {
            this.#isMoveActive = true;
            this.status = Statuses.CustomMove;
            this.#pointIndexSelected = 1;
            return new GetConnectionObjectResult(Statuses.CustomMove, null);
        }
        if (this.positionPoint2.IsPointInMe(x, y)) {
            this.#isMoveActive = true;
            this.status = Statuses.CustomMove;
            this.#pointIndexSelected = 2;
            return new GetConnectionObjectResult(Statuses.CustomMove, null);
        }
        if (this.baseLine.IsPointNear(x, y)) {
            this.#isMoveActive = false;
            this.status = Statuses.CustomMove;
            this.IsSelected = true;
            return new GetConnectionObjectResult(Statuses.MoveMeAutomaticaly, null);
        }
        return new GetConnectionObjectResult(Statuses.None, null);
    }
    mouse_up(x, y) {
        this.status = Statuses.None;
        this.#isMoveActive = false;
    }
    mouse_move(x, y) {
        if ((this.status == Statuses.CustomMove) && (this.#isMoveActive)) {
            let dx = x - this.prevX;
            let dy = y - this.prevY;

            if (this.#pointIndexSelected == 1) {
                this.X1 += dx;
                this.Y1 += dy;                
            } else {
                this.X2 += dx;
                this.Y2 += dy;                
            }
            this.prevX = x;
            this.prevY = y;
            this.rebuild();
        }
    }
    double_click(x, y) {
        if (this.baseLine.IsPointNear(x, y) || this.innerTextBlock.IsPointInMe(x, y)) {
            this.innerTextBlock.editStart();
            this.IsSelected = true;
            return true;
        }
        return false;
    }
    rebuild() {
        this.positionPoint1.parentUpdatePosition();
        this.positionPoint2.parentUpdatePosition();

        if (this.IsInitialized) {
            if (!this.innerTextBlock.IsInitialized)
                this.innerTextBlock.init(this.svg, this.model);

            let dx = this.X1 - this.innerTextBlock.X;
            let dy = this.Y1 - this.innerTextBlock.Y;

            let l = Math.sqrt((this.X1 - this.X2) * (this.X1 - this.X2) + (this.Y1 - this.Y2) * (this.Y1 - this.Y2));
            let a = Math.atan2(this.Y2 - this.Y1, this.X2 - this.X1) * 180 / Math.PI;
            if (this.innerTextBlock.contentWidth < l) {
                let p = (l - this.innerTextBlock.contentWidth) / (2 * l);
                let xt = 0;
                let yt = 0;
                if ((a > 90) || (a < -90)) {
                    xt = this.X2 + (this.X1 - this.X2) * p;
                    yt = this.Y2 + (this.Y1 - this.Y2) * p;
                    a = a + 180;
                } else {
                    xt = this.X1 + (this.X2 - this.X1) * p;
                    yt = this.Y1 + (this.Y2 - this.Y1) * p;
                }
                dx = xt - this.innerTextBlock.X;
                dy = yt - this.innerTextBlock.Y;
            }
            this.innerTextBlock.moveXY(dx, dy);
            this.innerTextBlock.setRotationAngle(a);
            this.width = Math.abs(this.X1 - this.X2);
            this.height = Math.abs(this.Y1 - this.Y2);
            this.x = Math.min(this.X1, this.X2);
            this.y = Math.min(this.Y1, this.Y2);
        }        
    }
    moveXY(dx, dy) {
        this.baseLine.moveXY(dx, dy);
        this.rebuild();
    }
    get IsSelected() {
        return this.#selected;
    }
    set IsSelected(val) {
        if (val != this.#selected) {
            this.#selected = val;
            this.baseLine.IsSelected = val;
            if (this.#selected) {                
                this.positionPoint1.isVisible = true;
                this.positionPoint2.isVisible = true;
            }
            else {
                this.positionPoint1.isVisible = false;
                this.positionPoint2.isVisible = false;
            }
        }
    }
    get X1() {
        return this.baseLine.x1;
    }
    set X1(val) {        
        if (this.IsInitialized){
            this.baseLine.X1 = val;
            this.rebuild();
        }
        else
            this.baseLine.x1 = val;
    }
    get Y1() {
        return this.baseLine.y1;
    }
    set Y1(val) {
        if (this.IsInitialized){
            this.baseLine.Y1 = val;
            this.rebuild();
        }
        else
            this.baseLine.y1 = val;
    }
    get X2() {
        return this.baseLine.x2;
    }
    set X2(val) {
        if (this.IsInitialized) {
            this.baseLine.X2 = val;
            this.rebuild();
        }
        else
            this.baseLine.x2 = val;
    }
    get Y2() {
        return this.baseLine.y2;
    }
    set Y2(val) {
        if (this.IsInitialized) {
            this.baseLine.Y2 = val;
            this.rebuild();
        }
        else
            this.baseLine.y2 = val;
    }
    serializeStateToObject(obj) {
        obj.objectId = this.objectId;
        obj.x1 = this.X1;
        obj.y1 = this.Y1;
        obj.x2 = this.X2;
        obj.y2 = this.Y2;
        obj.text = this.Text;
        obj.lineColor = this.LineColor;
        obj.objectTypeName = this.constructor.name;
    }
    restoreStateFromObject(obj) {
        this.objectId = obj.objectId;
        this.X1 = obj.x1;
        this.Y1 = obj.y1;
        this.X2 = obj.x2;
        this.Y2 = obj.y2;
        this.LineColor = obj.lineColor;
        if (obj.text != null) this.Text = obj.text;
    }
    dispose() {
        super.dispose();
        this.baseLine.dispose();
    }
}

class LineArrowObject extends LineObject {
    static GetObjectTypeInfo() {
        return new ObjectTypeInfo("LineArrowObject",
            "Arrow",
            function (x, y, width, height) {
                let obj = new LineArrowObject();
                obj.X1 = x;
                obj.Y1 = y;
                obj.X2 = x + width;
                obj.Y2 = y + height;
                return obj;
            },
            function (parent) {
                let line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                line.setAttribute("x1", "10");
                line.setAttribute("y1", "15");
                line.setAttribute("x2", "36");
                line.setAttribute("y2", "15");
                line.setAttributeNS(null, 'fill', "none");
                line.setAttributeNS(null, 'stroke', "black");
                line.setAttributeNS(null, 'stroke-width', 1);
                parent.appendChild(line);
                line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                line.setAttribute("x1", "30");
                line.setAttribute("y1", "10");
                line.setAttribute("x2", "36");
                line.setAttribute("y2", "15");
                line.setAttributeNS(null, 'fill', "none");
                line.setAttributeNS(null, 'stroke', "black");
                line.setAttributeNS(null, 'stroke-width', 1);
                parent.appendChild(line);
                line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                line.setAttribute("x1", "30");
                line.setAttribute("y1", "20");
                line.setAttribute("x2", "36");
                line.setAttribute("y2", "15");
                line.setAttributeNS(null, 'fill', "none");
                line.setAttributeNS(null, 'stroke', "black");
                line.setAttributeNS(null, 'stroke-width', 1);
                parent.appendChild(line);
            }
        );
    }
    line1;
    line2;
    constructor() {
        super();
        this.line1 = new BaseLine();
        this.line2 = new BaseLine();
    }
    init(svg, model) {        
        this.svg = svg;
        this.model = model;
        this.line1.init(svg, model);
        this.line2.init(svg, model);
        super.init(svg, model);
    }
    rebuild() {
        super.rebuild();
        if (this.IsInitialized) {
            let r = 20;
            let da = Math.PI * 30 / 180;
            let a = Math.atan2(this.Y2 - this.Y1, this.X2 - this.X1);

            this.line1.X1 = this.X2;
            this.line1.Y1 = this.Y2;
            this.line1.X2 = this.X2 - r * Math.cos(a + da);
            this.line1.Y2 = this.Y2 - r * Math.sin(a + da);

            this.line2.X1 = this.X2;
            this.line2.Y1 = this.Y2;
            this.line2.X2 = this.X2 - r * Math.cos(a - da);
            this.line2.Y2 = this.Y2 - r * Math.sin(a - da);
        }
    }
    lineColorChanged(newColor) {
        this.line1.LineColor = newColor;
        this.line2.LineColor = newColor;
    }
    serializeStateToObject(obj) {
        super.serializeStateToObject(obj);
        obj.objectTypeName = this.constructor.name;
    }
    dispose() {
        this.line1.dispose();
        this.line2.dispose();
        super.dispose();
    }
}

class EndpointSimpleLine extends BaseFigure {
    directionX;
    directionY;
    line_base;
    isDashed;
    static StaticConstructor(directionX, directionY) {
        return new EndpointSimpleLine(directionX, directionY);
    }
    constructor(directionX, directionY) {
        super();
        this.isDashed = false;
        this.directionX = directionX;
        this.directionY = directionY;
    }
    setDirectionX(directionX) {
        if (directionX != this.directionX) {
            this.directionX = directionX;
            this.refresh();
        }
    }
    setDirectionY(directionY) {
        if (directionY != this.directionY) {
            this.directionY = directionY;
            this.refresh();
        }
    }
    init(svg, model) {
        this.svg = svg;
        this.model = model;
        this.line_base = new BaseLine();
        this.line_base.init(this.svg);
        this.addInnerObject(this.line_base);
        this.refresh();
    }
    refresh() {
        this.line_base.X1 = this.X;
        this.line_base.Y1 = this.Y;
        this.line_base.X2 = this.X + this.directionX;
        this.line_base.Y2 = this.Y + this.directionY;
    }
}

class EndpointOneToMany extends EndpointSimpleLine {
    line1;
    line2;
    static StaticConstructor(directionX, directionY) {
        return new EndpointOneToMany(directionX, directionY);
    }
    constructor(directionX, directionY) {
        super(directionX, directionY);
    }
    init(svg, model) {
        this.line1 = new BaseLine();
        this.line1.init(svg);
        this.addInnerObject(this.line1);

        this.line2 = new BaseLine();
        this.line2.init(svg);
        this.addInnerObject(this.line2);
        super.init(svg, model);
    }
    refresh() {
        super.refresh();
        this.line1.X1 = this.X + this.directionX;
        this.line1.Y1 = this.Y + this.directionY;
        if (this.directionY == 0) {
            this.line1.X2 = this.X;
            this.line1.Y2 = this.Y + 5;
        } else {
            this.line1.X2 = this.X + 5;
            this.line1.Y2 = this.Y;
        }

        this.line2.X1 = this.X + this.directionX;
        this.line2.Y1 = this.Y + this.directionY;
        if (this.directionY == 0) {
            this.line2.X2 = this.X;
            this.line2.Y2 = this.Y - 5;
        } else {
            this.line2.X2 = this.X - 5;
            this.line2.Y2 = this.Y;
        }
    }
}

class EndpointArrow extends EndpointSimpleLine {
    line1;
    line2;
    static StaticConstructor(directionX, directionY) {
        return new EndpointArrow(directionX, directionY);
    }
    constructor(directionX, directionY) {
        super(directionX, directionY);
    }
    init(svg, model) {
        this.line1 = new BaseLine();
        this.line1.init(svg);
        this.addInnerObject(this.line1);

        this.line2 = new BaseLine();
        this.line2.init(svg);
        this.addInnerObject(this.line2);
        super.init(svg, model);
    }
    refresh() {
        super.refresh();
        this.line1.X1 = this.X;
        this.line1.Y1 = this.Y;
        if (this.directionY == 0) {
            this.line1.X2 = this.X + this.directionX * 0.75;
            this.line1.Y2 = this.Y + 5;
        } else {
            this.line1.X2 = this.X + 5;
            this.line1.Y2 = this.Y + this.directionY * 0.75;
        }

        this.line2.X1 = this.X;
        this.line2.Y1 = this.Y;
        if (this.directionY == 0) {
            this.line2.X2 = this.X + this.directionX * 0.75;
            this.line2.Y2 = this.Y - 5;
        } else {
            this.line2.X2 = this.X - 5;
            this.line2.Y2 = this.Y + this.directionY * 0.75;
        }
    }
}

class EndpointInheritance extends EndpointSimpleLine {
    polygon;    
    static StaticConstructor(directionX, directionY) {
        return new EndpointInheritance(directionX, directionY);
    }
    constructor(directionX, directionY) {
        super(directionX, directionY);
        this.polygon = null;
    }
    init(svg, model) {
        this.polygon = BaseScalableFigure.createPolygon(svg);
        this.polygon.setAttribute("fill", "white");
        super.init(svg, model);
    }
    refresh() {
        super.refresh();
        let points = [];
        points.push([this.X, this.Y]);

        if (this.directionY == 0) {
            points.push([this.X + this.directionX * 0.9, this.Y + 5]);
            points.push([this.X + this.directionX * 0.9, this.Y - 5]);
        } else {
            points.push([this.X + 5, this.Y + this.directionY * 0.9]);
            points.push([this.X - 5, this.Y + this.directionY * 0.9]);
        }
        BaseScalableFigure.setupPolygon(this.polygon, points);

        this.line_base.X1 = this.X + this.directionX * 0.9;
        this.line_base.Y1 = this.Y + this.directionY * 0.9;
        this.line_base.X2 = this.X + this.directionX;
        this.line_base.Y2 = this.Y + this.directionY;
    }
    positionChanged(dx, dy) {
        super.positionChanged(dx, dy);
        this.refresh();
    }
    dispose() {
        super.dispose();
        this.svg.removeChild(this.polygon);
    }
}

class EndpointImplementation extends EndpointInheritance {
    static StaticConstructor(directionX, directionY) {
        return new EndpointImplementation(directionX, directionY);
    }
    constructor(directionX, directionY) {
        super(directionX, directionY);
        this.isDashed = true;
    }
}

class EndpointDependancy extends EndpointArrow {
    static StaticConstructor(directionX, directionY) {
        return new EndpointDependancy(directionX, directionY);
    }
    constructor(directionX, directionY) {
        super(directionX, directionY);
        this.isDashed = true;
    }
}

class EndpointAggregation extends EndpointSimpleLine {
    polygon;
    static StaticConstructor(directionX, directionY) {
        return new EndpointAggregation(directionX, directionY);
    }
    constructor(directionX, directionY) {
        super(directionX, directionY);
        this.polygon = null;
    }
    init(svg, model) {
        this.polygon = BaseScalableFigure.createPolygon(svg);
        this.polygon.setAttribute("fill", "white");
        super.init(svg, model);
    }
    refresh() {
        super.refresh();
        let points = [];
        points.push([this.X, this.Y]);

        if (this.directionY == 0) {
            points.push([this.X + this.directionX * 0.5, this.Y + 5]);
            points.push([this.X + this.directionX, this.Y]);
            points.push([this.X + this.directionX * 0.5, this.Y - 5]);
        } else {
            points.push([this.X + 5, this.Y + this.directionY * 0.5]);
            points.push([this.X, this.Y + this.directionY]);
            points.push([this.X - 5, this.Y + this.directionY * 0.5]);
        }
        BaseScalableFigure.setupPolygon(this.polygon, points);

        this.line_base.X1 = this.X + this.directionX * 0.9;
        this.line_base.Y1 = this.Y + this.directionY * 0.9;
        this.line_base.X2 = this.X + this.directionX;
        this.line_base.Y2 = this.Y + this.directionY;
    }
    positionChanged(dx, dy) {
        super.positionChanged(dx, dy);
        this.refresh();
    }
    dispose() {
        super.dispose();
        this.svg.removeChild(this.polygon);
    }
}

class EndpointComposition extends EndpointAggregation {
    static StaticConstructor(directionX, directionY) {
        return new EndpointComposition(directionX, directionY);
    }
    constructor(directionX, directionY) {
        super(directionX, directionY);        
    }
    init(svg, model) {
        super.init(svg, model);
        this.polygon.setAttribute("fill", "black");
    }
}

class ScalableRectangle extends BaseFigure {
    svg;
    model;
    minWidth;
    minHeight;    
    #resizeCircle;
    #isResizeActive;
    #selected;
    #leftConnector;
    #rightConnector;
    #topConnector;
    #bottomConnector;
    connectionPoints;
    autoSize;
    _useFillColor;
    _fillFigure;
    static GetObjectTypeInfo() {
        return new ObjectTypeInfo(
            "ScalableRectangle",
            "Rectangle",
            function (x, y, width, height) { return new ScalableRectangle(x, y, width, height); },
            function (parent) {
                let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                rect.setAttribute("x", "10");
                rect.setAttribute("y", "5");
                rect.setAttribute("width", "26");
                rect.setAttribute("height", "26");
                rect.setAttributeNS(null, 'fill', "none");
                rect.setAttributeNS(null, 'stroke', "black");
                rect.setAttributeNS(null, 'stroke-width', 1);                
                parent.appendChild(rect); 
            }
        );
    }
    constructor(x, y, width, height) {
        super();
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.minWidth = 20;
        this.minHeight = 20;
        this.#isResizeActive = false;
        this.#selected = false;
        this.connectionPoints = [];
        this.autoSize = false;
        this._fillFigure = false;
        this._fillColor = "#FFFFFF";
    }
    get FillColor() {
        return this._fillColor;
    }
    set FillColor(val) {
        this._fillColor = val;
        this.fillColorChanged();
    }
    get FillFigure() {
        return this._fillFigure;
    }
    set FillFigure(val) {
        this._fillFigure = val;
        this.fillColorChanged();
    }
    fillColorChanged() {
        if (this._fillFigure)
            this.svg_object.setAttributeNS(null, 'fill', this._fillColor);
        else
            this.svg_object.setAttributeNS(null, 'fill', "none");
    }
    getConnectionPoints() {
        return this.connectionPoints;
    }
    getBorderRectangle() {
        const svgns = "http://www.w3.org/2000/svg";
        let rect = document.createElementNS(svgns, "rect");
        rect.setAttribute("x", this.x);
        rect.setAttribute("y", this.y);
        rect.setAttribute("width", this.width);
        rect.setAttribute("height", this.height);
        rect.setAttributeNS(null, 'fill', "none");
        rect.setAttributeNS(null, 'stroke', "black");
        rect.setAttributeNS(null, 'stroke-width', 1);
        rect.setAttributeNS(null, 'rx', 5);
        return rect;
    }
    init(svg, model) {
        this.model = model;
        this.svg = svg;
        let rect = this.getBorderRectangle();
        this.svg.appendChild(rect);
        this.svg_object = rect;
        this.IsInitialized = true;

        this.rebuild();

        this.#resizeCircle = new PointerCircle(this, function () {
            this.X = this.parentObject.x + this.parentObject.width;
            this.Y = this.parentObject.y + this.parentObject.height;
        });
        this.addInnerObject(this.#resizeCircle);

        this.#leftConnector = new ConnectionPointCircle(this, function () {
            this.X = this.parentObject.x;
            this.Y = this.parentObject.y + this.parentObject.height / 2;
        }, -20, 0);
        this.addInnerObject(this.#leftConnector);
        this.connectionPoints.push(this.#leftConnector);

        this.#rightConnector = new ConnectionPointCircle(this, function () {
            this.X = this.parentObject.x + this.parentObject.width;
            this.Y = this.parentObject.y + this.parentObject.height / 2;
        }, 20, 0);
        this.addInnerObject(this.#rightConnector);
        this.connectionPoints.push(this.#rightConnector);

        this.#topConnector = new ConnectionPointCircle(this, function () {
            this.X = this.parentObject.x + this.parentObject.width / 2;
            this.Y = this.parentObject.y;
        }, 0, -20);
        this.addInnerObject(this.#topConnector);
        this.connectionPoints.push(this.#topConnector);

        this.#bottomConnector = new ConnectionPointCircle(this, function () {
            this.X = this.parentObject.x + this.parentObject.width / 2;
            this.Y = this.parentObject.y + this.parentObject.height;
        }, 0, 20);
        this.addInnerObject(this.#bottomConnector);
        this.connectionPoints.push(this.#bottomConnector);
        
        this.rebuild();
    }
    getSecondObjectForConnect(x, y) {
        if ((this.IsPointInMe(x, y)) || (this.isInConnectionPoint(x, y))) {
            return new GetConnectionObjectResult(Statuses.DrawConnector, this, this.getNearestConnectionPointIndex(x, y));
        }
        return null;
    }
    isInConnectionPoint(x, y) {
        for (let i = 0; i < this.connectionPoints.length; i++)
            if (this.connectionPoints[i].IsPointInMe(x, y)) return true;
        return false;
    }
    getNearestConnectionPointIndex(x, y) {
        let v = -1;
        let bestI = 0;
        for (let i = 0; i < this.connectionPoints.length; i++) {
            let d = this.connectionPoints[i].getDistanceToCoordinates(x, y);
            if ((v == -1) || (d < v)) {
                v = d;
                bestI = i;
            }
        }
        return bestI;
    }
    mouse_down(x, y) {
        this.prevX = x;
        this.prevY = y;
        if (this.isInConnectionPoint(x, y)) return new GetConnectionObjectResult(Statuses.DrawConnector, this, this.getNearestConnectionPointIndex(x, y));
        if ((!this.autoSize) && this.#resizeCircle.IsPointInMe(x, y)) {
            this.#isResizeActive = true;
            this.status = Statuses.CustomMove;
            return new GetConnectionObjectResult(Statuses.CustomMove, null);
        }
        if (this.IsPointInMe(x, y)) {
            this.#isResizeActive = false;
            this.status = Statuses.CustomMove;
            this.IsSelected = true;
            return new GetConnectionObjectResult(Statuses.MoveMeAutomaticaly, null);            
        }        
        return new GetConnectionObjectResult(Statuses.None, null);
    }
    mouse_up(x, y) {
        this.status = Statuses.None;
        this.#isResizeActive = false;
    }
    mouse_move(x, y) {
        if ((this.status == Statuses.CustomMove) && (this.#isResizeActive)) {
            let dx = x - this.prevX;
            let dy = y - this.prevY;

            if (this.Width + dx > this.minWidth)
                this.Width += dx;
            if (this.height + dy > this.minHeight)
                this.Height += dy;

            this.prevX = x;
            this.prevY = y;
        }
    }
    get IsSelected() {
        return this.#selected;
    }
    set IsSelected(val) {
        if (val != this.#selected) {
            this.#selected = val;
            if (this.#selected) {
                this.svg_object.setAttributeNS(null, 'stroke-width', 2);
                this.#resizeCircle.isVisible = true && (!this.autoSize);
                this.#topConnector.isVisible = true;
                this.#bottomConnector.isVisible = true;
                this.#leftConnector.isVisible = true;
                this.#rightConnector.isVisible = true;
            }
            else {
                this.svg_object.setAttributeNS(null, 'stroke-width', 1);
                this.#resizeCircle.isVisible = false;
                this.#topConnector.isVisible = false;
                this.#bottomConnector.isVisible = false;
                this.#leftConnector.isVisible = false;
                this.#rightConnector.isVisible = false;
            }
        }
    }
}

class CommentObject extends ScalableRectangle {
    innerTextBlock;
    _verticalAlign;
    static GetObjectTypeInfo() {
        return new ObjectTypeInfo("CommentObject",
            "Comment",
            function (x, y, width, height) { return new CommentObject(x, y, width, height); },
            function (parent) {
                let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                rect.setAttribute("x", "10");
                rect.setAttribute("y", "5");
                rect.setAttribute("width", "26");
                rect.setAttribute("height", "26");
                rect.setAttributeNS(null, 'fill', "none");
                rect.setAttributeNS(null, 'stroke', "black");
                rect.setAttributeNS(null, 'stroke-width', 1);
                rect.setAttributeNS(null, 'rx', 3);
                parent.appendChild(rect);
            }
        );
    }
    constructor(x, y, width, height) {
        super(x, y, width, height);
        this.innerTextBlock = new TextBlock();
        this.innerTextBlock.setParent(this);
        this.innerTextBlock.enableEdit = true;
        this.addInnerObject(this.innerTextBlock);
        this._verticalAlign = VerticalAlignTypes.Center;
    }
    reCreateTextBlockOnTop() {
        let textBlock = this.removeInnerObject(this.innerTextBlock);
        textBlock.dispose();
        this.innerTextBlock = new TextBlock();
        this.addInnerObject(this.innerTextBlock);
        if (this.svg != null)
            this.innerTextBlock.init(this.svg, this.model);
    }
    rebuild() {
        if (this.IsInitialized) {
            if (!this.innerTextBlock.IsInitialized) {
                this.innerTextBlock.init(this.svg, this.model);
            }
            switch (this._verticalAlign) {
                case VerticalAlignTypes.Over:
                    this.innerTextBlock.Y = this.y - this.innerTextBlock.contentHeight - this.model.padding;
                    break;
                case VerticalAlignTypes.Top:
                    this.innerTextBlock.Y = this.y + this.model.padding;
                    break;
                case VerticalAlignTypes.Center:                    
                    this.innerTextBlock.Y = this.y + (this.Height - this.innerTextBlock.contentHeight) / 2;
                    break;
                case VerticalAlignTypes.Bottom:                    
                    this.innerTextBlock.Y = this.y + this.Height - this.innerTextBlock.contentHeight - this.model.padding;
                    break;
                case VerticalAlignTypes.Under:
                    this.innerTextBlock.Y = this.y + this.Height + this.model.padding;
                    break;
            }
            this.innerTextBlock.X = this.x + (this.Width - this.innerTextBlock.contentWidth) / 2;
        }
    }
    getPropertyTypes() {
        let arr = [];
        arr.push(new PropertyGridItem(this, "X", "X", PropertyTypes.Numbers));
        arr.push(new PropertyGridItem(this, "Y", "Y", PropertyTypes.Numbers));
        arr.push(new PropertyGridItem(this, "Width", "Width", PropertyTypes.Numbers));
        arr.push(new PropertyGridItem(this, "Height", "Height", PropertyTypes.Numbers));
        arr.push(new PropertyGridItem(this, "verticalAlign", "Vertical align", PropertyTypes.Enum, VerticalAlignTypes));
        arr.push(new PropertyGridItem(this, "Text", "Text", PropertyTypes.MultilineString));
        arr.push(new PropertyGridItem(this, "FillColor", "Fill  color", PropertyTypes.Color));
        arr.push(new PropertyGridItem(this, "FillFigure", "Fill figure", PropertyTypes.Boolean));
        return arr;
    }
    get verticalAlign() {
        return this._verticalAlign;
    }
    set verticalAlign(val) {
        this._verticalAlign = val;
        this.rebuild();
    }
    get Text() {
        return this.innerTextBlock.Text;
    }
    set Text(val) {
        this.innerTextBlock.Text = val;
        this.rebuild();
    }
    sizeChanged() {
        super.sizeChanged();
        this.rebuild();
    }
    double_click(x, y) {
        if (this.IsPointInMe(x, y) || this.innerTextBlock.IsPointInMe(x, y)) {
            this.innerTextBlock.editStart();
            this.IsSelected = true;
            return true;
        }
        return false;
    }
    serializeStateToObject(obj) {
        obj.objectId = this.objectId;
        obj.x = this.x;
        obj.y = this.y;
        obj.width = this.width;
        obj.height = this.height;
        obj.text = this.Text;
        obj.fillColor = this.FillColor;
        obj.fillFigure = this.FillFigure;
        obj.verticalAlign = this.verticalAlign;
        obj.objectTypeName = this.constructor.name;
        
    }
    restoreStateFromObject(obj) {
        this.objectId = obj.objectId;
        this.X = obj.x;
        this.Y = obj.y;
        this.Width = obj.width;
        this.Height = obj.height;
        this.FillColor = obj.fillColor;
        this.FillFigure = obj.fillFigure;
        if (obj.verticalAlign != null) this.verticalAlign = obj.verticalAlign;
        if (obj.text != null) this.Text = obj.text;
    }
}

class BaseScalableFigure extends CommentObject {
    static createLine(svg) {
        let line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        BaseScalableFigure.setupLine(line, 0, 0, 0, 0);
        line.setAttribute("stroke", "black");
        svg.appendChild(line);
        return line;
    }
    static setupLine(line, x1, y1, x2, y2) {
        line.setAttribute("x1", x1);
        line.setAttribute("y1", y1);
        line.setAttribute("x2", x2);
        line.setAttribute("y2", y2);
    }
    static createCircle(svg) {
        let circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        BaseScalableFigure.setupCircle(circle, 0, 0, 0);
        circle.setAttribute("stroke", "black");
        circle.setAttribute("fill", "white");
        svg.appendChild(circle);
        return circle;
    }
    static setupCircle(circle, x, y, r) {
        circle.setAttribute("cx", x);
        circle.setAttribute("cy", y);
        circle.setAttribute("r", r);
    }
    static createPolygon(svg) {
        let polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        polygon.setAttribute("stroke", "black");
        polygon.setAttribute("fill", "none");
        BaseScalableFigure.setupPolygon(polygon, [[0, 0], [1, 1]]);        
        svg.appendChild(polygon);
        return polygon;
    }
    static setupPolygon(polygon, pointPairs) {
        var res = [];
        for (let tmp of pointPairs)
            res.push(tmp[0] + ',' + tmp[1]);
        polygon.setAttribute("points", res.join(' '));
    }
    static createElipse(svg) {
        let ellipse = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
        BaseScalableFigure.setupEllipse(ellipse, 0, 0, 0, 0);
        ellipse.setAttribute("stroke", "black");
        ellipse.setAttribute("fill", "none");
        svg.appendChild(ellipse);
        return ellipse;
    }
    static setupEllipse(ellipse, x, y, rx, ry) {
        ellipse.setAttribute("cx", x);
        ellipse.setAttribute("cy", y);
        ellipse.setAttribute("rx", rx);
        ellipse.setAttribute("ry", ry);
    }
    static createRectangle(svg) {
        let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        BaseScalableFigure.setupRectangle(rect, 0, 0, 0, 0);
        rect.setAttributeNS(null, 'fill', "none");
        rect.setAttributeNS(null, 'stroke', "black");
        rect.setAttributeNS(null, 'stroke-width', 1);
        svg.appendChild(rect);
        return rect;
    }
    static setupRectangle(rect, x, y, width, height) {
        rect.setAttribute("x", x);
        rect.setAttribute("y", y);
        rect.setAttribute("width", width);
        rect.setAttribute("height", height);
    }
    constructor(x, y, width, height) {
        super(x, y, width, height);
        this._verticalAlign = VerticalAlignTypes.Under;
    }
    rebuild() {
        super.rebuild();
        this.IsSelected = this.IsSelected;
    }
    get IsSelected() {
        return super.IsSelected;
    }
    set IsSelected(val) {
        super.IsSelected = val;
        if (val) {
            this.svg_object.setAttributeNS(null, 'stroke-width', 1);
            this.svg_object.setAttributeNS(null, 'stroke-dasharray', 5);
        }
        else {
            this.svg_object.setAttributeNS(null, 'stroke-width', 0);
        }
    }
    positionChanged(dx, dy) {
        super.positionChanged(dx, dy);
        this.rebuild();
    }
    sizeChanged() {
        super.sizeChanged();
        this.rebuild();
    }
}

class UMLUserObject extends BaseScalableFigure {
    static createInnerObjects(svg) {
        let head = BaseScalableFigure.createCircle(svg);
        let spine = BaseScalableFigure.createLine(svg);
        let leftLeg = BaseScalableFigure.createLine(svg);
        let rightLeg = BaseScalableFigure.createLine(svg);
        let hands = BaseScalableFigure.createLine(svg);
        return { head, spine, leftLeg, rightLeg, hands };
    }
    static refreshObjectCoordinates(x, y, width, height, objects) {
        let { head, spine, leftLeg, rightLeg, hands } = objects;
        let medX = x + width / 2;
        let tazPoint = y + 2 * height / 3;
        BaseScalableFigure.setupCircle(head, medX, y + height / 6, height / 6);
        BaseScalableFigure.setupLine(spine, medX, y + height / 3, medX, tazPoint);
        BaseScalableFigure.setupLine(leftLeg, medX, tazPoint, x, y + height);
        BaseScalableFigure.setupLine(rightLeg, medX, tazPoint, x + width, y + height);
        BaseScalableFigure.setupLine(hands, x, y + 3 * height / 8, x + width, y + 3 * height / 8);
    }
    fillColorChanged() {
        let { head, spine, leftLeg, rightLeg, hands } = this.innerFigures;
        if (this._fillFigure)
            head.setAttributeNS(null, 'fill', this._fillColor);
        else
            head.setAttributeNS(null, 'fill', "none");
    }
    static GetObjectTypeInfo() {
        return new ObjectTypeInfo("UMLUserObject",
            "User",
            function (x, y, width, height) {
                // height x height (!!!) width is ignored for this figure
                return new UMLUserObject(x, y, height, height);
            },
            function (parent) {
                let objects = UMLUserObject.createInnerObjects(parent);
                UMLUserObject.refreshObjectCoordinates(7, 2, 30, 30, objects);
            }
        );
    }
    innerFigures;
    constructor(x, y, width, height) {
        super(x, y, width, height);
        this.innerFigures = null;
    }
    rebuild() {
        super.rebuild();
        if (this.IsInitialized) {
            if (this.innerFigures == null) 
                this.innerFigures = UMLUserObject.createInnerObjects(this.svg);
            UMLUserObject.refreshObjectCoordinates(
                this.x + this.model.padding,
                this.y + this.model.padding,
                this.width - 2 * this.model.padding,
                this.height - 2 * this.model.padding,
                this.innerFigures);
        }
    }
    serializeStateToObject(obj) {
        super.serializeStateToObject(obj);
        obj.objectTypeName = this.constructor.name;
    }
    dispose() {
        super.dispose();
        let { head, spine, leftLeg, rightLeg, hands } = this.innerFigures;
        this.svg.removeChild(head);
        this.svg.removeChild(spine);
        this.svg.removeChild(leftLeg);
        this.svg.removeChild(rightLeg);
        this.svg.removeChild(hands);
    }
}

class IfThenObject extends BaseScalableFigure {
    static createInnerObjects(svg) {
        let polygon = BaseScalableFigure.createPolygon(svg);
        return { polygon };
    }
    static refreshObjectCoordinates(x, y, width, height, objects) {
        let { polygon } = objects;
        let medX = x + width / 2;
        let medY = y + height / 2;

        BaseScalableFigure.setupPolygon(polygon, [[x, medY], [medX, y], [x + width, medY], [medX, y + height]]);        
    }
    static GetObjectTypeInfo() {
        return new ObjectTypeInfo("IfThenObject",
            "If-Then-Else",
            function (x, y, width, height) { return new IfThenObject(x, y, width, height); },
            function (parent) {
                let objects = IfThenObject.createInnerObjects(parent);
                IfThenObject.refreshObjectCoordinates(7, 5, 30, 25, objects);
            }
        );
    }
    innerFigures;
    leftTextBlock;
    rightTextBlock;
    bottomTextBlock;
    constructor(x, y, width, height) {
        super(x, y, width, height);
        this._verticalAlign = VerticalAlignTypes.Center;
        this.innerFigures = null;
        this.leftTextBlock = new TextBlock();
        this.leftTextBlock.setParent(this);        
        this.addInnerObject(this.leftTextBlock);
        this.rightTextBlock = new TextBlock();
        this.rightTextBlock.setParent(this);
        this.addInnerObject(this.rightTextBlock);
        this.bottomTextBlock = new TextBlock();
        this.bottomTextBlock.setParent(this);
        this.addInnerObject(this.bottomTextBlock);

    }
    rebuild() {        
        if (this.IsInitialized) {
            if (!this.leftTextBlock.IsInitialized) this.leftTextBlock.init(this.svg, this.model);
            if (!this.rightTextBlock.IsInitialized) this.rightTextBlock.init(this.svg, this.model);
            if (!this.bottomTextBlock.IsInitialized) this.bottomTextBlock.init(this.svg, this.model);

            if (this.innerFigures == null) {
                this.innerFigures = IfThenObject.createInnerObjects(this.svg);

            }
            IfThenObject.refreshObjectCoordinates(
                this.x,
                this.y,
                this.width,
                this.height,
                this.innerFigures);

            this.rightTextBlock.X = this.X + this.Width + 2 * this.model.padding;
            this.rightTextBlock.Y = this.Y + this.Height / 2 - this.rightTextBlock.contentHeight - 2 * this.model.padding;

            this.leftTextBlock.X = this.X - this.leftTextBlock.contentWidth - 2 * this.model.padding;
            this.leftTextBlock.Y = this.Y + this.Height / 2 - this.leftTextBlock.contentHeight - 2 * this.model.padding;

            this.bottomTextBlock.X = this.X + this.Width / 2 + this.model.padding;
            this.bottomTextBlock.Y = this.Y + this.Height + this.model.padding;
        }
        super.rebuild(); // super.rebuild  after all to ensure, that textBlock will be on top
    }
    fillColorChanged() {
        let { polygon } = this.innerFigures;
        if (this._fillFigure)
            polygon.setAttributeNS(null, 'fill', this._fillColor);
        else
            polygon.setAttributeNS(null, 'fill', "none");
    }
    getPropertyTypes() {
        let arr = super.getPropertyTypes();
        arr.push(new PropertyGridItem(this, "LeftText", "Left Text", PropertyTypes.OneLineString));
        arr.push(new PropertyGridItem(this, "RightText", "Right Text", PropertyTypes.OneLineString));
        arr.push(new PropertyGridItem(this, "BottomText", "Bottom Text", PropertyTypes.OneLineString));
        return arr;
    }
    get LeftText() {
        return this.leftTextBlock.Text;
    }
    set LeftText(val) {
        this.leftTextBlock.Text = val;
        this.rebuild();
    }
    get RightText() {
        return this.rightTextBlock.Text;
    }
    set RightText(val) {
        this.rightTextBlock.Text = val;
        this.rebuild();
    }
    get BottomText() {
        return this.bottomTextBlock.Text;
    }
    set BottomText(val) {
        this.bottomTextBlock.Text = val;
        this.rebuild();
    }
    serializeStateToObject(obj) {
        super.serializeStateToObject(obj);
        obj.rightText = this.RightText;
        obj.leftText = this.LeftText;
        obj.bottomText = this.BottomText;
        obj.objectTypeName = this.constructor.name;
    }
    restoreStateFromObject(obj) {
        super.restoreStateFromObject(obj);
        if (obj.rightText != null) this.RightText = obj.rightText;
        if (obj.leftText != null) this.LeftText = obj.leftText;
        if (obj.bottomText != null) this.BottomText = obj.bottomText;
    }
    dispose() {
        super.dispose();
        let { polygon } = this.innerFigures;
        this.svg.removeChild(polygon);
    }
}

class EllipseObject extends BaseScalableFigure {
    static createInnerObjects(svg) {
        let ellipse = BaseScalableFigure.createElipse(svg);
        return { ellipse };
    }
    static refreshObjectCoordinates(x, y, width, height, objects) {
        let { ellipse } = objects;
        let medX = x + width / 2;
        let medY = y + height / 2;
        BaseScalableFigure.setupEllipse(ellipse, medX, medY, width / 2, height / 2);
    }
    static GetObjectTypeInfo() {
        return new ObjectTypeInfo("EllipseObject",
            "Ellipse",
            function (x, y, width, height) { return new EllipseObject(x, y, width, height); },
            function (parent) {
                let objects = EllipseObject.createInnerObjects(parent);
                EllipseObject.refreshObjectCoordinates(7, 5, 30, 20, objects);
            }
        );
    }
    innerFigures;
    fillBlack;
    constructor(x, y, width, height) {
        super(x, y, width, height);
        this.innerFigures = null;
        this._verticalAlign = VerticalAlignTypes.Center;
        this.fillBlack = false;
    }
    rebuild() {
        if (this.IsInitialized) {
            if (this.innerFigures == null)
                this.innerFigures = EllipseObject.createInnerObjects(this.svg);
            EllipseObject.refreshObjectCoordinates(
                this.x,
                this.y,
                this.width,
                this.height,
                this.innerFigures);
        }
        super.rebuild(); // after all.To ensure that textblock is on top
    }
    fillColorChanged() {
        let { ellipse } = this.innerFigures;
        if (this._fillFigure)
            ellipse.setAttributeNS(null, 'fill', this._fillColor);
        else
            ellipse.setAttributeNS(null, 'fill', "none");
    }
    getPropertyTypes() {
        let arr = super.getPropertyTypes();
        return arr;
    }
    serializeStateToObject(obj) {
        super.serializeStateToObject(obj);
        obj.objectTypeName = this.constructor.name;
    }
    dispose() {
        super.dispose();
        let { ellipse } = this.innerFigures;
        this.svg.removeChild(ellipse);
    }
}

class DatabaseObject extends BaseScalableFigure {
    static createInnerObjects(svg) {
        let ellipseTop = BaseScalableFigure.createElipse(svg);
        ellipseTop.setAttributeNS(null, 'fill', "white");
        let rect = BaseScalableFigure.createRectangle(svg);
        rect.setAttributeNS(null, 'fill', "white");
        rect.setAttributeNS(null, 'stroke', "black");
        rect.setAttributeNS(null, 'stroke-width', 1);
        let ellipseBottom = BaseScalableFigure.createElipse(svg);
        ellipseBottom.setAttributeNS(null, 'fill', "white");

        let whiteRectangle = BaseScalableFigure.createRectangle(svg);
        whiteRectangle.setAttributeNS(null, 'fill', "white");
        whiteRectangle.setAttributeNS(null, 'stroke', "white");
        whiteRectangle.setAttributeNS(null, 'stroke-width', 0);
        return { ellipseTop, rect, ellipseBottom, whiteRectangle };
    }
    static refreshObjectCoordinates(x, y, width, height, objects) {
        let { ellipseTop, rect, ellipseBottom, whiteRectangle } = objects;
        let medX = x + width / 2;
        let ry = height / 8;
        BaseScalableFigure.setupEllipse(ellipseBottom, medX, y + ry, width / 2, ry);
        BaseScalableFigure.setupRectangle(rect, x, y + ry, width, height - 2 * ry);
        BaseScalableFigure.setupEllipse(ellipseTop, medX, y + height - ry, width / 2, ry);
        BaseScalableFigure.setupRectangle(whiteRectangle, x + 1, y + height - ry - 2, width-2, 4);
    }
    static GetObjectTypeInfo() {
        return new ObjectTypeInfo("DatabaseObject",
            "Database",
            function (x, y, width, height) { return new DatabaseObject(x, y, width, height); },
            function (parent) {
                let objects = DatabaseObject.createInnerObjects(parent);
                DatabaseObject.refreshObjectCoordinates(7, 5, 30, 20, objects);
            }
        );
    }
    innerFigures;
    fillBlack;
    constructor(x, y, width, height) {
        super(x, y, width, height);
        this.innerFigures = null;        
    }
    rebuild() {
        super.rebuild();
        if (this.IsInitialized) {
            if (this.innerFigures == null)
                this.innerFigures = DatabaseObject.createInnerObjects(this.svg);
            DatabaseObject.refreshObjectCoordinates(
                this.x,
                this.y,
                this.width,
                this.height,
                this.innerFigures);
        }
    }
    fillColorChanged() {
        let { ellipseTop, rect, ellipseBottom, whiteRectangle } = this.innerFigures;
        if (this._fillFigure) {
            ellipseTop.setAttributeNS(null, 'fill', this._fillColor);
            rect.setAttributeNS(null, 'fill', this._fillColor);
            ellipseBottom.setAttributeNS(null, 'fill', this._fillColor);
            whiteRectangle.setAttributeNS(null, 'fill', this._fillColor);
        }
        else {
            ellipseTop.setAttributeNS(null, 'fill', "white");
            rect.setAttributeNS(null, 'fill', "white");
            ellipseBottom.setAttributeNS(null, 'fill', "white");
            whiteRectangle.setAttributeNS(null, 'fill', "white");
            whiteRectangle.setAttributeNS(null, 'stroke', "white");
        }
    }
    serializeStateToObject(obj) {
        super.serializeStateToObject(obj);
        obj.objectTypeName = this.constructor.name;
    }
    dispose() {
        super.dispose();
        let { ellipseTop, rect, ellipseBottom, whiteRectangle } = this.innerFigures;
        this.svg.removeChild(ellipseTop);
        this.svg.removeChild(ellipseBottom);
        this.svg.removeChild(rect);
        this.svg.removeChild(whiteRectangle);
    }
}

class Model {
    #Status;
    #Objects;
    #Connectors;
    #SelectedObject;
    dialog_element;
    fontSize;
    fontFamily;
    prevX;
    prevY;
    textEditModeOn;
    objectTypes;
    locked;
    currentEndpointType;
    objectIdIncremental;
    registeredObjects;
    constructor(svg, dialog_element) {
        this.registeredObjects = {};
        this.padding = 3;
        this.objectIdIncremental = 0;
        this.svg = svg;
        this.dialog_element = dialog_element;
        this.fontSize = "16px";
        this.fontFamily = "Times New Roman";
        let model = this;
        this.textEditModeOn = false;
        this.objectTypes = [];
        this.locked = false;
        svg.addEventListener("mousedown", function (e) { model.mouse_down(e); });
        svg.addEventListener("mouseup", function (e) { model.mouse_up(e); });
        svg.addEventListener("mousemove", function (e) { model.mouse_move(e); });
        svg.addEventListener("mouseleave", function (e) { model.mouse_leave(e); });
        svg.addEventListener("dblclick", function (e) { model.double_click(e); });
        document.addEventListener('keydown', function (e) { model.key_up(e); }, false);
        this.#Status = Statuses.None;
        this.#Objects = [];
        this.#Connectors = [];
        this.#SelectedObject = null;
        this.currentEndpointType = EndpointTypes.SimpleLine;
    }
    getJsonData() {
        let objects = [];
        for (var i = 0; i < this.#Objects.length; i++)
            if (this.#Objects[i].serializeStateToObject != null) {
                let obj = {};
                this.#Objects[i].serializeStateToObject(obj);
                objects.push(obj);
            }
        let connectors = [];
        for (var i = 0; i < this.#Connectors.length; i++) {
            let connector = this.#Connectors[i];
            let obj = {};
            obj.currentEndpointType = connector.currentEndpointType;
            obj.pointIndex1 = connector.pointIndex1;
            obj.pointIndex2 = connector.pointIndex2;

            if (connector.relObject1.childId != null) {
                obj.relObject1_objectId = connector.relObject1.parentObject.objectId;
                obj.relObject1_childId = connector.relObject1.childId;
            } else {
                obj.relObject1_objectId = connector.relObject1.objectId;
            }

            if (connector.relObject2.childId != null) {
                obj.relObject2_objectId = connector.relObject2.parentObject.objectId;
                obj.relObject2_childId = connector.relObject2.childId;
            } else {
                obj.relObject2_objectId = connector.relObject2.objectId;
            }
            obj.textTop = connector.TextTop;
            obj.textBottom = connector.TextBottom;
            obj.textBegin = connector.TextBegin;
            obj.textEnd = connector.TextEnd;
            connectors.push(obj);
        }
        return JSON.stringify({ objects: objects, connectors: connectors });
    }    
    clearAll() {
        for (var i = 0; i < this.#Connectors.length; i++)
            this.#Connectors[i].dispose();
        for (var i = 0; i < this.#Objects.length; i++)
            this.#Objects[i].dispose();
        this.#Connectors = [];
        this.#Objects = [];
        this.objectIdIncremental = 0;
    }
    loadFromJson(jsonString) {
        this.clearAll();
        let dataObj = JSON.parse(jsonString);
        let maxV = 0;
        let obj_dict = {};
        for (let i = 0; i < dataObj.objects.length; i++) {
            let obj = dataObj.objects[i];
            let reg = null;
            for (let j = 0; j < this.objectTypes.length; j++)
                if (this.objectTypes[j].objectTypeName == obj.objectTypeName) {
                    reg = this.objectTypes[j];
                    break;
                }
            if (reg != null) {
                let drObject = reg.objectActivator(0, 0, 10, 10);
                this.add_object(drObject);
                drObject.restoreStateFromObject(obj);
                if (drObject.objectId > maxV) maxV = drObject.objectId;
                obj_dict[drObject.objectId] = drObject;
            }            
        }

        for (let i = 0; i < dataObj.connectors.length; i++) {
            let con_obj = dataObj.connectors[i];
            let relObject1 = obj_dict[con_obj.relObject1_objectId];
            if (con_obj.relObject1_childId != null)
                relObject1 = relObject1.getChildObjectByChildId(con_obj.relObject1_childId);

            let relObject2 = obj_dict[con_obj.relObject2_objectId];
            if (con_obj.relObject2_childId != null)
                relObject2 = relObject2.getChildObjectByChildId(con_obj.relObject2_childId);

            let connector = new ConnectorLine(relObject1);            
            connector.pointIndex1 = con_obj.pointIndex1;
            connector.init(this.svg, this);
            this.#Connectors.push(connector);
            connector.connect(relObject2);
            connector.pointIndex2 = con_obj.pointIndex2;
            connector.TextTop = con_obj.textTop;
            connector.TextBottom = con_obj.textBottom;
            connector.TextBegin = con_obj.textBegin;
            connector.TextEnd = con_obj.textEnd;
            connector.refresh();
            connector.currentEndpointType = con_obj.currentEndpointType;
        }

        this.objectIdIncremental = maxV + 1;
        this.update_svg_size();
    }
    saveJson() {
        this.#save("file.json", this.getJsonData(), 'application/json', '.json', 'JSON-file');
    }
    cloneCurrentObject(){
        let selected_object = null;
        for (var i = 0; i < this.#Objects.length; i++)
            if (this.#Objects[i].IsSelected){
                selected_object = this.#Objects[i];
                break;
            }
        if (selected_object == null) {
            alert("There is no selected object to clone");
            return;
        }
        let obj = {};
        selected_object.serializeStateToObject(obj);
        if (obj.x != null) obj.x = obj.x + 20;
        if (obj.y != null) obj.y = obj.y + 20;
        obj.objectId = this.objectIdIncremental++;

        let reg = null;
        for (let j = 0; j < this.objectTypes.length; j++)
            if (this.objectTypes[j].objectTypeName == obj.objectTypeName) {
                reg = this.objectTypes[j];
                break;
            }
        if (reg != null) {
            let drObject = reg.objectActivator(0, 0, 10, 10);
            this.add_object(drObject);
            drObject.restoreStateFromObject(obj);
            this.#SelectedObject = null;
            for (var i = 0; i < this.#Objects.length; i++)
                this.#Objects[i].IsSelected = false;
            drObject.IsSelected = true;
        }

        this.update_svg_size();
    }
    getSvgData() {
        let wMax = 20;
        let hMax = 20;
        for (var i = 0; i < this.#Objects.length; i++) {
            let obj = this.#Objects[i];
            if (wMax < obj.x + obj.width) wMax = obj.x + obj.width;
            if (hMax < obj.y + obj.height) hMax = obj.y + obj.height;
        }
        let tmp_width = this.svg.getAttribute("width");
        let tmp_height = this.svg.getAttribute("height");
        this.svg.setAttribute("width", Math.round(wMax + 20));
        this.svg.setAttribute("height", Math.round(hMax + 20));
        let res = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>\n<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\">";
        res = res + this.svg.outerHTML;
        this.svg.setAttribute("width", tmp_width);
        this.svg.setAttribute("height", tmp_height);
        return res;
    }
    getSvgFile() {
        this.#save("file.svg", this.getSvgData(), 'image/svg+xml', '.svg', 'SVG-file');
    }
    async #save(filename, svg_data, mime, extension, description) {
        const blob = new Blob([svg_data], { type: mime });
        if (window.showSaveFilePicker) {
            let acceptObject = {};
            acceptObject[mime] = [];
            acceptObject[mime].push(extension);
            const handle = await showSaveFilePicker({
                suggestedName: filename,
                types: [{
                    description: description,
                    accept: acceptObject,
                }],
            });
            const writable = await handle.createWritable();
            await writable.write(blob);
            writable.close();
        }
        else {
            let elem = window.document.createElement('a');
            elem.href = window.URL.createObjectURL(blob);
            elem.download = filename;
            document.body.appendChild(elem);
            elem.click();
            document.body.removeChild(elem);
        }
    }
    getMousePos(refObj, evt) {
        var rect = refObj.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top,
        };
    }
    removeItemFromArray(item, array) {
        var index = array.indexOf(item);
        if (index != -1)
            array.splice(index, 1);
    }
    deleteObject(obj) {
        obj.dispose();
        this.removeItemFromArray(obj, this.#Objects);
    }
    key_up(e) {
        if ((e.target != null) && (e.target.tagName == "INPUT")) return;
        if (this.textEditModeOn) return;
        if (e.keyCode == 8 || e.keyCode == 46) {
            // delete key
            for (var i = 0; i < this.#Objects.length; i++)
                if (this.#Objects[i].IsSelected) {
                    if (confirm("Do you want to delete object?")) {
                        this.deleteObject(this.#Objects[i]);
                        this.clearPropertyGrid();
                    }
                    return;
                }

            for (var i = 0; i < this.#Connectors.length; i++)
                if (this.#Connectors[i].IsSelected) {
                    if (confirm("Do you want to delete relation?")) {
                        this.#Connectors[i].dispose();
                        this.removeConnector(this.#Connectors[i]);
                    }
                    return;
                }
        }
    }
    removeConnector(connector) {
        this.removeItemFromArray(connector, this.#Connectors);
    }
    double_click(e) {
        this.#SelectedObject = null;
        let { x, y } = this.getMousePos(this.svg, e);
        for (var i = 0; i < this.#Objects.length; i++)
            this.#Objects[i].IsSelected = false;
        for (var i = 0; i < this.#Connectors.length; i++)
            this.#Connectors[i].IsSelected = false;

        for (var i = 0; i < this.#Objects.length; i++) {
            let obj = this.#Objects[i];
            if (obj.double_click(x, y)) {
                obj.IsSelected = true;
                break;
            }
        }
    }
    clearPropertyGrid() {
        let gridDiv = document.getElementById("propertyGrid");
        gridDiv.style.display = "none";
        gridDiv.innerHTML = "";
    }
    openMultiLineDialog(val, okFunction) {
        let dialog_element = this.dialog_element;
        dialog_element.innerHTML = "";
        let dialog_obj = document.createElement("dialog");
        dialog_element.appendChild(dialog_obj);
        dialog_obj.style.width = "300px";
        dialog_obj.style.height = "300px";

        let textarea = document.createElement("textarea");
        textarea.style.width = "280px";
        textarea.style.height = "250px";
        dialog_obj.appendChild(textarea);
        textarea.value = val;
        let div = document.createElement("div");
        dialog_obj.appendChild(div);
        let close_button = document.createElement("button");
        close_button.innerText = "Close";
        close_button.addEventListener("click", () => {
            dialog_obj.close();
            this.textEditModeOn = false;
        });
        div.appendChild(close_button);

        let ok_button = document.createElement("button");
        ok_button.innerText = "OK";
        ok_button.addEventListener("click", () => {
            okFunction(textarea.value);
            dialog_obj.close();
            this.textEditModeOn = false;
        });
        div.appendChild(ok_button);
        this.textEditModeOn = true;
        dialog_obj.showModal();
    }
    setupPropertyGrid(arr) {
        let model = this;
        let gridDiv = document.getElementById("propertyGrid");
        gridDiv.style.display = "block";
        gridDiv.innerHTML = "<div>Properties</div>";
        let tbl = document.createElement("table");
        gridDiv.appendChild(tbl);
        for (let i = 0; i < arr.length; i++) {
            let pitem = arr[i];
            let tr = document.createElement("tr");
            tbl.appendChild(tr);
            let td = document.createElement("td");
            td.innerText = pitem.propertyDisplayName;
            tr.appendChild(td);
            td = document.createElement("td");            
            tr.appendChild(td);
            switch (pitem.propertyType) {
                case PropertyTypes.Enum:
                    let select = document.createElement("select");
                    td.appendChild(select);
                    Object.keys(pitem.enumType).forEach(function (key, index) {
                        let option = document.createElement("option");
                        select.appendChild(option);
                        option.innerText = key;
                        option.setAttribute("value", pitem.enumType[key]);
                        if (pitem.enumType[key] == pitem.objectToSet[pitem.propertyName])
                            option.setAttribute("selected", "selected");
                    });
                    select.addEventListener('change', function () {
                        pitem.objectToSet[pitem.propertyName] = parseInt(this.value);
                    });
                    break;
                case PropertyTypes.OneLineString:
                    let input = document.createElement("input");
                    td.appendChild(input);
                    input.setAttribute("type", "text");
                    input.value = pitem.objectToSet[pitem.propertyName];
                    input.addEventListener('change', function () {
                        pitem.objectToSet[pitem.propertyName] = this.value;
                    });
                    break;
                case PropertyTypes.Boolean:
                    let input_bool = document.createElement("input");
                    td.appendChild(input_bool);
                    input_bool.setAttribute("type", "checkbox");
                    if (pitem.objectToSet[pitem.propertyName])
                        input_bool.setAttribute("checked", "checked");                    
                    input_bool.addEventListener('change', function (e) {
                        if (e.currentTarget.checked)
                            pitem.objectToSet[pitem.propertyName] = true;
                        else
                            pitem.objectToSet[pitem.propertyName] = false;
                    });
                    break;
                case PropertyTypes.Color:
                    let input_color = document.createElement("input");
                    td.appendChild(input_color);
                    input_color.setAttribute("type", "color");
                    input_color.value = pitem.objectToSet[pitem.propertyName];
                    input_color.addEventListener('change', function (e) {
                        pitem.objectToSet[pitem.propertyName] = this.value;
                    });
                    break;
                case PropertyTypes.Numbers:
                    let input_number = document.createElement("input");
                    td.appendChild(input_number);
                    input_number.setAttribute("type", "number");
                    input_number.value = pitem.objectToSet[pitem.propertyName];
                    input_number.addEventListener('change', function () {
                        pitem.objectToSet[pitem.propertyName] = parseInt(this.value);
                    });
                    break;
                case PropertyTypes.MultilineString:
                    let span = document.createElement("span");
                    td.appendChild(span);
                    span.innerText = pitem.objectToSet[pitem.propertyName].replace(/(?:\r\n|\r|\n)/g, ' ');
                    span.style.width = "200px";
                    let btn = document.createElement("button");
                    btn.innerText = "...";
                    td.appendChild(btn);
                    btn.addEventListener('click', function () {
                        model.openMultiLineDialog(pitem.objectToSet[pitem.propertyName],
                            function (val) {
                                let tmp = val.replace(/(?:\r\n|\r|\n)/g, ' ');
                                span.innerText = tmp;
                                pitem.objectToSet[pitem.propertyName] = val;
                            });                        
                    });                    
                    break;
            }
        }
    }
    mouse_move(e) {
        if (this.#Status != Statuses.None) {
            let { x, y } = this.getMousePos(this.svg, e);

            if (this.#Status == Statuses.CustomMove) {
                this.#SelectedObject.mouse_move(x, y);
            }

            if (this.#Status == Statuses.MoveMeAutomaticaly) {
                let dx = x - this.prevX;
                let dy = y - this.prevY;
                this.#SelectedObject.moveXY(dx, dy);
                this.prevX = x;
                this.prevY = y;
            }

            if (this.#Status == Statuses.DrawConnector) {
                this.#SelectedObject.drawTo(x, y);
            }
            this.update_svg_size();
        }
    }
    mouse_down(e) {
        this.#SelectedObject = null;
        let { x, y } = this.getMousePos(this.svg, e);
        for (var i = 0; i < this.#Objects.length; i++)
            this.#Objects[i].IsSelected = false;
        for (var i = 0; i < this.#Connectors.length; i++)
            this.#Connectors[i].IsSelected = false;

        for (var i = 0; i < this.#Objects.length; i++) {
            let obj = this.#Objects[i];
            let click_obj_status = obj.mouse_down(x, y);
            if (click_obj_status.status == Statuses.None) continue;
            if (click_obj_status.status == Statuses.CustomMove) {
                obj.IsSelected = true;
                this.#SelectedObject = obj;
                this.#Status = Statuses.CustomMove;
                break;
            }
            if (click_obj_status.status == Statuses.DrawConnector) {
                this.#Status = Statuses.DrawConnector;
                obj.IsSelected = true;
                let connector = new ConnectorLine(click_obj_status.connectedObject);
                connector.relObject1 = click_obj_status.objectForConnect;
                connector.pointIndex1 = click_obj_status.connectionPointerIndex;
                connector.init(this.svg, this);
                this.#Connectors.push(connector);
                this.#SelectedObject = connector;
                break;
            }
            if (click_obj_status.status == Statuses.MoveMeAutomaticaly) {
                obj.IsSelected = true;
                this.#Status = Statuses.MoveMeAutomaticaly
                this.#SelectedObject = obj;
                this.prevX = x;
                this.prevY = y;
                break;
            }
        }

        if (this.#Status == Statuses.None) {
            for (var i = 0; i < this.#Connectors.length; i++) {
                let connector = this.#Connectors[i];
                if (connector.IsPointInMe(x, y)) {
                    connector.IsSelected = true;
                    this.#SelectedObject = connector;
                    break;
                }
            }
        }

        if ((this.#SelectedObject != null) && (this.#SelectedObject.getPropertyTypes != null)) {
            let arr = this.#SelectedObject.getPropertyTypes();
            this.setupPropertyGrid(arr);
        } else
            this.clearPropertyGrid();
    }
    mouse_up(e) {
        if (this.#Status == Statuses.DrawConnector) {            
            let { x, y } = this.getMousePos(this.svg, e);
            let connector = this.#SelectedObject;
            let foundConnectedBlock = false;
            for (var i = 0; i < this.#Objects.length; i++) {
                let obj = this.#Objects[i];
                let objForConnectStruct = obj.getSecondObjectForConnect(x, y);
                if (objForConnectStruct != null)
                {
                    let canConnect = true;

                    if ((connector.relObject1.parentObject != null) && (objForConnectStruct.objectForConnect.parentObject == connector.relObject1.parentObject))
                        canConnect = false; // same table

                    if ((connector.relObject1.parentObject == null) && (objForConnectStruct.objectForConnect == connector.relObject1))
                        canConnect = false; // same object

                    if (canConnect) 
                    {
                        connector.connect(objForConnectStruct.objectForConnect);
                        connector.pointIndex2 = objForConnectStruct.connectionPointerIndex;
                        connector.refresh();
                        connector.objectId = this.objectIdIncremental++;
                        foundConnectedBlock = true;
                        // reset selection of first object after connection is established
                        if (connector.relObject1.parentObject != null)
                            connector.relObject1.parentObject.IsSelected = false;
                        else
                            connector.relObject1.IsSelected = false;
                    }
                    obj.mouse_up(x, y);
                }
                
                if (foundConnectedBlock)
                    break;
            }

            if (!foundConnectedBlock) {
                connector.dispose();
                this.removeConnector(connector);
                this.clearPropertyGrid();
            } 
        }

        this.refreshPropertyGrid();

        if (this.#SelectedObject != null)
            this.#SelectedObject.IsSelected = true;
        this.#Status = Statuses.None;
        //this.#SelectedObject = null;
        this.update_svg_size();
    }
    mouse_leave(e) {
        this.mouse_up(e);
    }
    update_svg_size() {
        let wMax = 20;
        let hMax = 20;
        for (var i = 0; i < this.#Objects.length; i++) {
            let obj = this.#Objects[i];
            if (wMax < obj.x + obj.width) wMax = obj.x + obj.width;
            if (hMax < obj.y + obj.height) hMax = obj.y + obj.height;
        }
        this.svg.setAttribute("width", Math.round(wMax + 40));
        this.svg.setAttribute("height", Math.round(hMax + 40));
    }
    getFirstSelectedObjectOrConnector() {
        for (var i = 0; i < this.#Objects.length; i++)
            if (this.#Objects[i].IsSelected)
                return this.#Objects[i];
        for (var i = 0; i < this.#Connectors.length; i++)
            if (this.#Connectors[i].IsSelected)
                return this.#Connectors[i];
        return null;
    }
    refreshPropertyGrid(sel_obj) {
        if (sel_obj == null)
            sel_obj = this.getFirstSelectedObjectOrConnector();
        if ((sel_obj != null) && (sel_obj.getPropertyTypes != null)) {
            let arr = sel_obj.getPropertyTypes();
            this.setupPropertyGrid(arr);
        } 
    }
    add_object(obj) {
        this.#Objects.push(obj);
        obj.objectId = this.objectIdIncremental++;
        obj.init(this.svg, model);
        this.update_svg_size();
    }
    registreObjectType(reg) {
        this.objectTypes.push(reg);
    }
    setCurrentEndpointType(endpointType) {
        this.currentEndpointType = endpointType;
        let keys = [];
        for (var key in EndpointTypes)
            keys.push(key);
        let menu = document.getElementById("rightMenu");
        let divs = menu.childNodes;
        for (let i = 0; i < keys.length; i++) {
            let div = divs[i];
            if (this.currentEndpointType == EndpointTypes[keys[i]])
                div.style.backgroundColor = "#eaeaea";
            else
                div.style.backgroundColor = "#ffffff";
        }
        for (var i = 0; i < this.#Connectors.length; i++)
            if (this.#Connectors[i].IsSelected) {
                this.#Connectors[i].currentEndpointType = endpointType;
                this.refreshPropertyGrid(this.#Connectors[i]);
                break;
            }
    }
    rebuildRightMenu() {
        let keys = [];
        for (var key in EndpointTypes)
            keys.push(key);
        let menu = document.getElementById("rightMenu");
        menu.innerHTML = "";
        let height = keys.length * 37;
        let width = 64;
        menu.style["width"] = width + "px";
        menu.style["height"] = height + "px";
        let model = this;
        for (let i = 0; i < keys.length; i++) {
            let endpointType = EndpointTypes[keys[i]];
            let endpointTypeName = EndpointNames[endpointType];
            let activator = EndpointActivators[endpointType];
            let div = document.createElement("div");
            if (this.currentEndpointType == endpointType)
                div.style.backgroundColor = "#eaeaea";
            else
                div.style.backgroundColor = "#ffffff";
            let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.setAttributeNS(null, "id", "svg_right_menu_" + i);
            svg.setAttributeNS(null, "width", width);
            svg.setAttributeNS(null, "height", "36");
            menu.appendChild(div);
            div.setAttribute("title", endpointTypeName);
            div.appendChild(svg);            
            div.addEventListener('click', (e) => {
                model.setCurrentEndpointType(endpointType);
                e.stopPropagation();
            });
            let endpoint = activator(-20, 0);
            endpoint.init(svg, this);
            endpoint.X = 55;
            endpoint.Y = 15;            

            let line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttributeNS(null, "x1", 5);
            line.setAttributeNS(null, "y1", 15);
            line.setAttributeNS(null, "x2", 35);
            line.setAttributeNS(null, "y2", 15);
            line.setAttribute("stroke", "black");
            if (endpoint.isDashed)
                line.setAttribute("stroke-dasharray", 4);
            svg.appendChild(line);

            let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttributeNS(null, "x", 3);
            text.setAttributeNS(null, "y", 32);
            text.setAttributeNS(null, "font-family", "Arial");
            text.setAttributeNS(null, "font-size", "9");
            let text_node = document.createTextNode(endpointTypeName);
            text.appendChild(text_node);
            svg.appendChild(text);
        }
    }
    rebuildLeftMenu() {
        let menu = document.getElementById("leftMenu");
        menu.innerHTML = "";
        let height = this.objectTypes.length * 47;
        let width = 47;
        menu.style["width"] = width + "px";
        menu.style["height"] = height + "px";
        for (let i = 0; i < this.objectTypes.length; i++) {
            let reg = this.objectTypes[i];
            let div = document.createElement("div");
            let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.setAttributeNS(null, "id", "svg_menu_" + i);
            svg.setAttributeNS(null, "width", width - 1);
            svg.setAttributeNS(null, "height", "46");
            menu.appendChild(div);
            div.setAttribute("title", reg.objectDisplayName);
            div.appendChild(svg);
            div.addEventListener('click', (e) => {
                let t = reg.objectActivator(60, 10, 100, 50);
                model.add_object(t);
                if (reg.postInitSetup != null)
                    reg.postInitSetup(t);
                model.update_svg_size();
                e.stopPropagation();
            });
            reg.objectDrawIcon(svg);
            let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttributeNS(null, "x", 3);
            text.setAttributeNS(null, "y", 42);
            text.setAttributeNS(null, "font-family", "Arial");
            text.setAttributeNS(null, "font-size", "9");
            let text_node = document.createTextNode(reg.objectDisplayName);
            text.appendChild(text_node);
            svg.appendChild(text);
            let size = text.getBBox();
            text.setAttributeNS(null, "x", (width - size.width) / 2); // horizontal align
        }
    }
    rebuild() {
        this.rebuildRightMenu();
        this.rebuildLeftMenu();
    }
}

const EndpointActivators = [];
EndpointActivators[EndpointTypes.SimpleLine] = EndpointSimpleLine.StaticConstructor;
EndpointActivators[EndpointTypes.OneToMany] = EndpointOneToMany.StaticConstructor;
EndpointActivators[EndpointTypes.Arrow] = EndpointArrow.StaticConstructor;
EndpointActivators[EndpointTypes.Inheritance] = EndpointInheritance.StaticConstructor;
EndpointActivators[EndpointTypes.Implementation] = EndpointImplementation.StaticConstructor;
EndpointActivators[EndpointTypes.Dependancy] = EndpointDependancy.StaticConstructor;
EndpointActivators[EndpointTypes.Aggregation] = EndpointAggregation.StaticConstructor;
EndpointActivators[EndpointTypes.Composition] = EndpointComposition.StaticConstructor;

const EndpointNames = [];
EndpointNames[EndpointTypes.SimpleLine] = "Direct line";
EndpointNames[EndpointTypes.OneToMany] = "One-to-many";
EndpointNames[EndpointTypes.Arrow] = "Arrow";
EndpointNames[EndpointTypes.Inheritance] = "Inheritance";
EndpointNames[EndpointTypes.Implementation] = "Implementation";
EndpointNames[EndpointTypes.Dependancy] = "Dependancy";
EndpointNames[EndpointTypes.Aggregation] = "Aggregation";
EndpointNames[EndpointTypes.Composition] = "Composition";


