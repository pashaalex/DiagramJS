class ClassObject extends CommentObject {
    fieldsTextBlock;
    methodsTextBlock;
    line1;
    line2;
    #preventInnerRebuild;
    static GetObjectTypeInfo() {
        return new ObjectTypeInfo("ClassObject",
            "Class",
            function (x, y, width, height) {
                let tbl = new ClassObject(x, y, width, height);
                tbl.Text = "Class";                
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
        super(x, y, width, height);
        this._verticalAlign = VerticalAlignTypes.Top;
        // this.autoSize = true;
        this.fieldsTextBlock = new TextBlock();
        this.methodsTextBlock = new TextBlock();
        this.line1 = new BaseLine();
        this.line2 = new BaseLine();
        this.#preventInnerRebuild = false;
    }
    init(svg, model) {
        this.fieldsTextBlock.init(svg, model);
        this.fieldsTextBlock.setParent(this);
        this.methodsTextBlock.init(svg, model);
        this.methodsTextBlock.setParent(this);
        this.line1.init(svg, model);
        this.line2.init(svg, model);
        super.init(svg, model);
    }
    serializeStateToObject(obj) {
        super.serializeStateToObject(obj);
        obj.methods = this.Methods;
        obj.fields = this.Fields;
        obj.objectTypeName = this.constructor.name;
    }
    restoreStateFromObject(obj) {
        super.restoreStateFromObject(obj);
        if (obj.methods != undefined) this.Methods = obj.methods;
        if (obj.fields != undefined) this.Fields = obj.fields;
    }
    rebuild() {
        super.rebuild();
        if (this.IsInitialized)  {
            let resWidth = Math.max(this.innerTextBlock.contentWidth, this.fieldsTextBlock.contentWidth, this.methodsTextBlock.contentWidth) + 2 * this.model.padding;
            let resHeight = this.innerTextBlock.contentHeight + this.fieldsTextBlock.contentHeight + this.methodsTextBlock.contentHeight + 30;

            if (!this.#preventInnerRebuild) {
                if (resWidth > this.Width) this.Width = resWidth;
                if (resHeight > this.Height) this.Height = resHeight;
            }
            this.minWidth = resWidth;
            this.minHeight = resHeight;

            let verticalPadding = (this.Height - resHeight) / 4;

            this.innerTextBlock.X = this.X + (this.Width - this.innerTextBlock.contentWidth) / 2;
            this.line1.X1 = this.x;
            this.line1.Y1 = this.innerTextBlock.y + this.innerTextBlock.contentHeight + this.model.padding;
            this.line1.X2 = this.x + this.width;
            this.line1.Y2 = this.innerTextBlock.y + this.innerTextBlock.contentHeight + this.model.padding;

            this.fieldsTextBlock.X = this.x + this.model.padding;
            this.fieldsTextBlock.Y = this.line1.Y1 + verticalPadding;

            this.line2.X1 = this.x;
            this.line2.Y1 = this.fieldsTextBlock.Y + this.fieldsTextBlock.contentHeight + this.model.padding + verticalPadding;
            this.line2.X2 = this.x + this.width;
            this.line2.Y2 = this.fieldsTextBlock.Y + this.fieldsTextBlock.contentHeight + this.model.padding + verticalPadding;

            this.methodsTextBlock.X = this.x + this.model.padding;
            this.methodsTextBlock.Y = this.line2.Y1 + this.model.padding + verticalPadding;
            
            this.model.update_svg_size();
        }
    }
    get Methods() {
        return this.methodsTextBlock.Text;
    }
    set Methods(val) {
        this.methodsTextBlock.Text = val;
        this.rebuild();
    }
    get Fields() {
        return this.fieldsTextBlock.Text;
    }
    set Fields(val) {
        this.fieldsTextBlock.Text = val;
        this.rebuild();
    }
    getPropertyTypes() {
        let arr = super.getPropertyTypes();
        arr.push(new PropertyGridItem(this, "Text", "Class name", PropertyTypes.OneLineString));
        arr.push(new PropertyGridItem(this, "Methods", "Methods", PropertyTypes.MultilineString));
        arr.push(new PropertyGridItem(this, "Fields", "Fields", PropertyTypes.MultilineString));
        return arr;
    }
    //get IsSelected() {
    //    return super.IsSelected;
    //}
    //set IsSelected(val) {
    //    super.IsSelected = val;
    //}
    positionChanged(dx, dy) {
        super.positionChanged(dx, dy);
        this.rebuild();
    }
    sizeChanged() {
        this.#preventInnerRebuild = true;
        super.sizeChanged();
        this.#preventInnerRebuild = false;
        //this.rebuild();
    }
    dispose() {
        super.dispose();
        this.fieldsTextBlock.dispose();
        this.methodsTextBlock.dispose();
        this.line1.dispose();
        this.line2.dispose();
    }
}