class ERTableFieldName extends TextBlock {
    childId;
    connectionWidth;
    constructor() {
        super();
        this.connectionWidth = 20;
        this.childId = 0;
    }
    init(svg, model) {
        super.init(svg, model)
    }
    IsPointInMe(x, y) {
        if ((x < this.x)
            || (y < this.y)
            || (x > this.x + this.width)
            || (y > this.y + this.contentHeight))
            return false;
        return true;
    }
    getConnectionPoints() {
        let arr = [];
        let medY = this.y + this.height / 2;
        arr.push(new ConnectionPoint(this.x - this.model.padding, medY, -this.connectionWidth, 0));
        arr.push(new ConnectionPoint(this.x + this.width, medY, this.connectionWidth, 0));
        return arr;
    }
    serializeStateToObject(obj) {
        obj.childId = this.childId;
        obj.fieldName = this.Text;        
    }
    restoreStateFromObject(obj) {
        this.childId = obj.childId;
    }
    dispose() {
        super.dispose();
    }
}

class ERTableObject extends BaseFigure {
    header;
    fields;
    lines
    svg;
    model;
    childObjectIncremental;    
    static GetObjectTypeInfo() {
        return new ObjectTypeInfo("ERTableObject", 
            "Table",
            function (x, y, width, height) {
                let tbl = new ERTableObject(x, y, width, height);
                tbl.setTableName("TableName");
                tbl.addField("Field1");
                return tbl;
            },
            function (parent) {
                for (let i = 0; i < 3; i++) {
                    let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                    rect.setAttribute("x", "10");
                    rect.setAttribute("y", 5 + (i * 8));
                    rect.setAttribute("width", "26");
                    rect.setAttribute("height", "8");
                    rect.setAttributeNS(null, 'fill', "none");
                    rect.setAttributeNS(null, 'stroke', "black");
                    rect.setAttributeNS(null, 'stroke-width', 1);
                    parent.appendChild(rect);
                }
            },
            function (tbl) {

            }
        );
    }
    constructor(x, y, width, height) {
        super();
        this.childObjectIncremental = 0;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.prevX = 0;
        this.prevY = 0;
        this.status = Statuses.None;
        this.fields = [];
        this.lines = [];
        this.connectors = [];
        this.header = new TextBlock();
    }
    init(svg, model) {
        this.model = model;
        this.svg = svg;
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
        this.svg.appendChild(rect);
        this.svg_object = rect;
        this.header.init(this.svg, this.model);
        this.header.X = this.X + 1;
        this.header.y = this.Y + 1;
        this.header.IsBold = true;
        this.IsInitialized = true;
        this.rebuild();
    }
    mouse_down(x, y) {
        if (this.IsPointInMe(x, y)) {
            this.prevX = x;
            this.prevY = y;            
            this.status = Statuses.CustomMove;
            if (y > this.y + this.header.contentHeight) {
                for (let i = 0; i < this.fields.length; i++)
                    if (this.fields[i].IsPointInMe(x, y)) 
                        return new GetConnectionObjectResult(Statuses.DrawConnector, this.fields[i]);                    
            }
            else
                return new GetConnectionObjectResult(Statuses.MoveMeAutomaticaly, null); 
        }
        return new GetConnectionObjectResult(Statuses.None, null); 
    }
    getSecondObjectForConnect(x, y) {
        if ((this.IsPointInMe(x, y)) && (y > this.y + this.header.contentHeight)) {
            for (let i = 0; i < this.fields.length; i++)
                if (this.fields[i].IsPointInMe(x, y))
                    return new GetConnectionObjectResult(Statuses.DrawConnector, this.fields[i]);
        }
        return null;
    }
    #createEditTableRow(obj, table) {
        let tr = document.createElement("tr");
        table.appendChild(tr);
        let td = document.createElement("td");
        tr.appendChild(td);
        let input = document.createElement("input");
        input.setAttribute("type", "text");
        input.setAttribute("value", obj.Text);
        input.addEventListener("change", (e) => { obj.Text = e.target.value; this.rebuild(); });
        td.appendChild(input);
        td = document.createElement("td");
        tr.appendChild(td);
        let btn = document.createElement("button");
        td.appendChild(btn);
        btn.innerText = "-";
        btn.addEventListener("click", (e) => {
            if (confirm("Are you sure to delete field?")) {
                table.removeChild(tr);
                this.removeField(obj);
            }
        });
    }
    show_table_editor() {
        let dialog_element = this.model.dialog_element;
        dialog_element.innerHTML = "";
        let dialog_obj = document.createElement("dialog");
        dialog_element.appendChild(dialog_obj);

        let close_button = document.createElement("button");
        close_button.innerText = "Close";
        close_button.addEventListener("click", () => {
            dialog_obj.close();
        });
        dialog_obj.appendChild(close_button);

        let div = document.createElement("div");
        dialog_obj.appendChild(div);
        let div_caption = document.createElement("div");
        div_caption.innerText = "Table name:";
        div.appendChild(div_caption);

        let tbl_name = document.createElement("input");
        tbl_name.setAttribute("type", "text");
        tbl_name.setAttribute("value", this.header.Text);
        tbl_name.addEventListener("change", (e) => { this.header.Text = e.target.value; this.rebuild(); });
        div.appendChild(tbl_name);

        div_caption = document.createElement("div");
        div_caption.innerText = "Table fields:";
        dialog_obj.appendChild(div_caption);

        let table = document.createElement("table");
        dialog_obj.appendChild(table);
        for (let i = 0; i < this.fields.length; i++) {
            let obj = this.fields[i];
            this.#createEditTableRow(obj, table);
        }

        let add_button = document.createElement("button");
        add_button.innerText = "Add new field";
        add_button.addEventListener("click", () => {
            let obj = this.addField("field name");
            this.#createEditTableRow(obj, table);
        });
        dialog_obj.appendChild(add_button);

        dialog_obj.showModal();
    }
    double_click(x, y) {
        if ((this.IsPointInMe(x, y)) && (y < this.y + this.header.contentHeight)) {
            this.show_table_editor();
            return true;
        }
        return false;
    }
    mouse_up(x, y) {
        this.status = Statuses.None;
    }
    mouse_move(x, y) {
    }
    positionChanged(dx, dy) {
        this.header.moveXY(dx, dy);
        for (let i = 0; i < this.fields.length; i++) {
            this.fields[i].moveXY(dx, dy);
            this.lines[i].moveXY(dx, dy);
        }
    }
    setTableName(tableName) {
        this.header.Text = tableName;
        this.rebuild();
    }
    addField(fieldName) {
        let field = new ERTableFieldName();
        field.childId = this.childObjectIncremental++;
        field.text = fieldName;
        if (this.IsInitialized) field.init(this.svg, this.model);
        field.setParent(this);
        this.fields.push(field);
        let line = new BaseLine();
        if (this.IsInitialized) line.init(this.svg);
        this.lines.push(line);
        this.rebuild();
        return field;
    }
    removeField(field) {
        field.dispose();
        this.removeItemFromArray(field, this.fields);
        let line = this.lines[0];
        this.removeItemFromArray(line, this.lines);
        line.dispose();
        for (let i = 0; i < field.connectors.length; i++)
            this.model.removeConnector(field.connectors[i]);
        this.rebuild();
    }
    getChildObjectByChildId(childId) {
        for (let i = 0; i < this.fields.length; i++)
            if (this.fields[i].childId == childId)
                return this.fields[i];
        return null;
    }
    rebuild() {
        super.rebuild();
        if (this.IsInitialized) {
            this.header.Y = this.Y;
            this.header.X = this.X + this.model.padding;
            let h = this.header.contentHeight + this.model.padding;
            let w = this.header.contentWidth + this.model.padding;
            let y = this.header.Y + this.header.contentHeight;
            for (let i = 0; i < this.fields.length; i++) {
                let line = this.lines[i];
                if (!line.IsInitialized) line.init(this.svg);
                line.X1 = this.X;
                line.Y1 = y + this.model.padding;
                line.Y2 = y + this.model.padding;
                let field = this.fields[i];
                if (!field.IsInitialized) field.init(this.svg, this.model);
                let fdx = this.X + this.model.padding - field.x;
                let fdy = y + this.model.padding - field.y;
                field.moveXY(fdx, fdy);
                y += field.contentHeight + this.model.padding;
                h += field.contentHeight + this.model.padding;
                if (w < field.contentWidth) w = field.contentWidth;
            }
            this.Width = w + this.model.padding * 2;
            this.Height = h + this.model.padding;

            for (let i = 0; i < this.fields.length; i++) {
                this.fields[i].width = this.width - this.model.padding;
                this.fields[i].height = this.fields[i].contentHeight;
                let line = this.lines[i];
                line.X2 = line.X1 + this.width;
                this.fields[i].refreshConnectors();
            }

            // align middle
            this.header.X = this.X + (this.Width - this.header.contentWidth) / 2;
        }
    }    
    serializeStateToObject(obj) {
        obj.objectId = this.objectId;
        obj.x = this.x;
        obj.y = this.y;
        let flds = [];
        for (let i = 0; i < this.fields.length; i++) {
            let o = {};
            this.fields[i].serializeStateToObject(o);
            flds.push(o);
        }
        obj.fields = flds;
        obj.tableName = this.header.Text;
        obj.objectTypeName = this.constructor.name;
    }
    restoreStateFromObject(obj) {
        this.objectId = obj.objectId;
        this.X = obj.x;
        this.Y = obj.y;
        this.setTableName = obj.tableName;
        while (this.fields.length > 0)
            this.removeField(this.fields[0]);
        for (let i = 0; i < obj.fields.length; i++) {
            let f = obj.fields[i];
            let fld_obj = this.addField(f.fieldName);
            fld_obj.restoreStateFromObject(f);
        }
        let maxV = 0;
        for (let i = 0; i < this.fields.length; i++)
            if (this.fields[i].childId > maxV)
                maxV = this.fields[i].childId;
        this.childObjectIncremental = maxV;
    }
    dispose() {
        super.dispose();
        this.header.dispose();
        for (let i = 0; i < this.fields.length; i++) {
            this.fields[i].dispose();
            this.lines[i].dispose();
        }
    }
}
