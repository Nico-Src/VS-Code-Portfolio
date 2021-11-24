var editorObj = {
    elements: [],
    scale: 1,
    lastActiveConnection: undefined,
    lines: []
};

function setupEditorEvents(){
    // get editor element and set wheel event
    var editor = $(".editor-wrapper").get(0);
    editor.onwheel = wheel;

    document.addEventListener('gestureend', function(e) {
        if (e.scale < 1.0) {
            editorObj.scale += (1 * -0.01) / 50.0;
            editorObj.scale = Math.min(Math.max(.17, editorObj.scale), 2); // maximum is 200% and minimum is 17%

            // scale background
            $(".editor-wrapper").css('background-size',(50.0 * ((editorObj.scale * 100.0)))+'px '+(50.0 * ((editorObj.scale * 100.0)))+' px');
        }
    }, false);

    function wheel(event) {
        event.preventDefault();
        // increase or decrease scale according to deltaY of the mouse wheel
        editorObj.scale += (event.deltaY * -0.01) / 50.0;
        editorObj.scale = Math.min(Math.max(0.17, editorObj.scale), 2); // maximum is 400% and minimum is 12.5%

        // scale background
        $(".editor-wrapper").css('background-size',(50.0 * ((editorObj.scale * 100.0)))+'px '+(50.0 * ((editorObj.scale * 100.0)))+' px');
        // scale whole editor
        setZoom(editorObj.scale,editor);
    }
}

function dragElement(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  // get editor
  var editor = $(".editor-wrapper").get(0);
  // only put the mousedown event on the content of the element not on the outline
  $(elmnt).find(".content").get(0).onmousedown = dragMouseDown;
  $(elmnt).find(".content").get(0).ontouchstart = dragMouseDown;
  // catch hotkey events
  document.onkeydown = onKeyDown;

  function onKeyDown(e){
    e = e || window.event;
    if(e.keyCode == 46){ // delete
        // delete every selected element
        closeEditor();
        $(".element.selected").each(function(){
            var id = $(this).attr('id');

            var linesToRemove = [];

            editorObj.lines.forEach((line) => {
                if(line.firstElement.id === id){
                    linesToRemove.push(line);
                }

                if(line.secondElement.id === id){
                    linesToRemove.push(line);
                }
            });

            linesToRemove.forEach((lineToRemove) => {
                var firstConnectionDotConnections = getConnectionCountOfDot(lineToRemove.firstElement.id,lineToRemove.firstElement.connectionType);
                var secondConnectionDotConnections = getConnectionCountOfDot(lineToRemove.secondElement.id,lineToRemove.secondElement.connectionType);
    
                $("#"+lineToRemove.firstElement.id + lineToRemove.firstElement.connectionType).removeClass('connect');
                if(firstConnectionDotConnections < 2){
                    $("#"+lineToRemove.firstElement.id + lineToRemove.firstElement.connectionType).removeClass('connected');
                    changeConnectionStatus(lineToRemove.firstElement.id,lineToRemove.firstElement.connectionType,'disconnected');
                } else {
                    changeConnectionStatus(lineToRemove.firstElement.id,lineToRemove.firstElement.connectionType,'connected');
                }
    
    
                $("#"+lineToRemove.secondElement.id + lineToRemove.secondElement.connectionType).removeClass('connect');
                if(secondConnectionDotConnections < 2){
                    $("#"+lineToRemove.secondElement.id + lineToRemove.secondElement.connectionType).removeClass('connected');
                    changeConnectionStatus(lineToRemove.secondElement.id,lineToRemove.secondElement.connectionType,'disconnected');
                } else {
                    changeConnectionStatus(lineToRemove.secondElement.id,lineToRemove.secondElement.connectionType,'connected');
                }
    
                var lineElement = $("#"+lineToRemove.id).get(0);
                $(lineElement).animate({opacity: 0},function(){
                    lineElement.parentElement.removeChild(lineElement);
                });
    
    
                editorObj.lines = editorObj.lines.filter(function(item) {
                    return item !== lineToRemove
                });
            });

            // add delete class for scale down animation
            $(this).addClass('delete');
            var id = this.id;
            editorObj.elements.forEach((element,index) => {
                if(element.id === id){
                    editorObj.elements.splice(index, 1);
                }
            });
            // fade out element
            if(animationsEnabled){
                $(this).animate({opacity: 0},500,function(){
                    this.parentElement.removeChild(this);
                    countSelected();
                });
            } else {
                this.parentElement.removeChild(this);
                countSelected();
            }
        });

        var elements = getActiveConnectionElements();

        if(elements.length >= 2){
            var lineToRemove = null;
        
            editorObj.lines.forEach((line) => {
                if(line.firstElement.id === elements[0].id && line.secondElement.id === elements[1].id){
                    lineToRemove = line;
                }

                if(line.firstElement.id === elements[1].id && line.secondElement.id === elements[0].id){
                    lineToRemove = line;
                }
            });

            var firstConnectionDotConnections = getConnectionCountOfDot(lineToRemove.firstElement.id,lineToRemove.firstElement.connectionType);
            var secondConnectionDotConnections = getConnectionCountOfDot(lineToRemove.secondElement.id,lineToRemove.secondElement.connectionType);

            $("#"+lineToRemove.firstElement.id + lineToRemove.firstElement.connectionType).removeClass('connect');
            if(firstConnectionDotConnections < 2){
                $("#"+lineToRemove.firstElement.id + lineToRemove.firstElement.connectionType).removeClass('connected');
                changeConnectionStatus(lineToRemove.firstElement.id,lineToRemove.firstElement.connectionType,'disconnected');
            } else {
                changeConnectionStatus(lineToRemove.firstElement.id,lineToRemove.firstElement.connectionType,'connected');
            }


            $("#"+lineToRemove.secondElement.id + lineToRemove.secondElement.connectionType).removeClass('connect');
            if(secondConnectionDotConnections < 2){
                $("#"+lineToRemove.secondElement.id + lineToRemove.secondElement.connectionType).removeClass('connected');
                changeConnectionStatus(lineToRemove.secondElement.id,lineToRemove.secondElement.connectionType,'disconnected');
            } else {
                changeConnectionStatus(lineToRemove.secondElement.id,lineToRemove.secondElement.connectionType,'connected');
            }

            var lineElement = $("#"+lineToRemove.id).get(0);
            $(lineElement).animate({opacity: 0},function(){
                lineElement.parentElement.removeChild(lineElement);
            });


            editorObj.lines = editorObj.lines.filter(function(item) {
                return item !== lineToRemove
            });

            console.log(editorObj.lines);
        }

    } else if (e.keyCode == 37){ // arrow left
        var selected = $(".element.selected").get(0);
        selected.style.left = (selected.offsetLeft - 1) + "px";
    } else if (e.keyCode == 39){ // right left
        var selected = $(".element.selected").get(0);
        selected.style.left = (selected.offsetLeft + 1) + "px";
    } else if (e.keyCode == 38){ // arrow up
        var selected = $(".element.selected").get(0);
        selected.style.top = (selected.offsetTop - 1) + "px";
    } else if (e.keyCode == 40){ // arrow down
        var selected = $(".element.selected").get(0);
        selected.style.top = (selected.offsetTop + 1) + "px";
    } else if (e.keyCode == 76){ // L - Key for linking
        connect();
    } else if (e.keyCode == 69){ // E - Key for editing
        if(getSelectedCount() == 1){
            console.log("toggle edit")
            toggleEditor();
        }
    }
  }

  function getSelectedCount(){
      var count = 0;
      $(".element.selected").each(function(){
        count++;
      });
      return count;
  }

  function dragMouseDown(e) {
    e.stopPropagation(); // <-- dont pass event onto elements below clicked element
    // dont trigger dragging if mouse button was right and clicked element should not be the description of the element
    if(true && !$(e.target).hasClass('description')){
        // check if clicked element was a connection or an element
        if($(e.target).hasClass('connection')){
            // get id of element
            var parentId = $(e.target.parentElement.parentElement).attr('id');
            // get editor element with id
            var editorElement = getEditorElement(parentId);
            // get active connections on element
            var activeConnectionCount = getActiveConnectionsOnElement(parentId);

            // if connection-dot is already in the state of awaiting a connection remove it
            if($(e.target).hasClass('connect')){
                e = e || window.event;
                currentMaxZIndex += 1;
                // remove the connect class
                $(e.target).removeClass('connect');
                // get connection type of connection (e.g: 'top','bottom')
                var connectionType = getConnectionType(e.target);
                // change state in editorObj
                changeConnectionStatus(parentId,connectionType,'disconnected');
            } else {
                // 
                if(activeConnectionCount >= 1){
                    $("#"+parentId+" .connection").each(function(){
                        $(this).removeClass('connect');
                        var parentTmpId = $(this.parentElement.parentElement).attr('id');
                        var tmpConnectionType = getConnectionType(this);
                        changeConnectionStatus(parentTmpId,tmpConnectionType,'disconnected');
                    });

                    var totalActiveConnections = getTotalActiveCount();

                    if(totalActiveConnections >= 2){
                        disconnectLastConnection();
                    }
                }
                
                // get total active connections on all elements
                var totalActiveConnections = getTotalActiveCount();

                // if there are more than 2 already disconnect last one
                if(totalActiveConnections >= 2){
                    disconnectLastConnection();
                }

                // get connection type of connection
                var connectionType = getConnectionType(e.target);
                // get count of connections on dot existing already
                totalConnectionsOfConnection = getConnectionCountOfDot(parentId,connectionType);
                // if there are more than 2 connections on dot return and dont change
                //if(totalConnectionsOfConnection >= 2) return;

                e.preventDefault();
                // add connect class
                $(e.target).addClass('connect');
                // change state in editorObj
                changeConnectionStatus(parentId,connectionType,'active');
                // set last active connection
                editorObj.lastActiveConnection = {id: parentId,type: connectionType};
                e = e || window.event;
            }
        } else {
            // if element is already selected deselect it
            if($(elmnt).hasClass('selected')){
                e = e || window.event;
                currentMaxZIndex += 1;
                // if selected remove
                $(elmnt).removeClass('selected');
                $(elmnt).css('z-index',currentMaxZIndex);
                e.preventDefault();
                // get the mouse cursor position at startup:
                pos3 = e.clientX;
                pos4 = e.clientY;
                document.onmouseup = closeDragElement;
                document.ontouchend = closeDragElement;
                // call a function whenever the cursor moves:
                document.onmousemove = elementDrag;
                document.ontouchmove = elementDragTouch;

                if(getSelectedCount() === 1){
                    setupEditor();
                }

                // recount selected elements to decide if element toolbar should be visible or not
                countSelected();
            } else {
                e.preventDefault();
                // if ctrl key wasnt pressed while clicking element deselect every other element
                if(!window.event.ctrlKey){
                    $(".element").each(function(){
                        $(this).removeClass('selected');
                    });
                }
                // select clicked element
                $(elmnt).addClass('selected');
                e = e || window.event;
                currentMaxZIndex += 1;
                $(elmnt).css('z-index',currentMaxZIndex);
                // get the mouse cursor position at startup:
                pos3 = e.clientX;
                pos4 = e.clientY;
                document.onmouseup = closeDragElement;
                document.ontouchend = closeDragElement;
                // call a function whenever the cursor moves:
                document.onmousemove = elementDrag;
                document.ontouchmove = elementDragTouch;

                if(getSelectedCount() === 1){
                    setupEditor();
                }
                
                // recount selected elements to decide if element toolbar should be visible or not
                countSelected();
            }
        }
    }
  }

  function elementDragTouch(e){
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    var touch = event.touches[0];
    pos1 = pos3 - touch.clientX;
    pos2 = pos4 - touch.clientY;
    pos3 = touch.clientX;
    pos4 = touch.clientY;
    // set the element's new position:
    if((elmnt.offsetLeft - pos1) >= 5){
        $(elmnt).addClass('selected');
        //var maxPixelsLeft = ((($(".editor").width() / editorObj.scale) - 100)) + $('.editor').scrollLeft();
        var newTopPixels = elmnt.offsetTop - pos2 / editorObj.scale;
        elmnt.style.top = newTopPixels + "px";
        var newLeftPixels = elmnt.offsetLeft - pos1 / editorObj.scale;
        elmnt.style.left = newLeftPixels + "px";

        // recount selected elements to decide if element toolbar should be visible or not
        countSelected();
    }

    if(editorObj.lines.length > 0){
        updateLines();
    }
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    if((elmnt.offsetLeft - pos1) >= 5){
        $(elmnt).addClass('selected');
        //var maxPixelsLeft = ((($(".editor").width() / editorObj.scale) - 100)) + $('.editor').scrollLeft();
        var newTopPixels = elmnt.offsetTop - pos2 / editorObj.scale;
        elmnt.style.top = newTopPixels + "px";
        var newLeftPixels = elmnt.offsetLeft - pos1 / editorObj.scale;
        elmnt.style.left = newLeftPixels + "px";

        // recount selected elements to decide if element toolbar should be visible or not
        countSelected();
    }

    if(editorObj.lines.length > 0){
        updateLines();
    }
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    $(elmnt).css('z-index','10');
    // remove event listeners
    document.onmouseup = null;
    document.ontouchend = null;
    document.ontouchmove = null;
    document.onmousemove = null;
  }
}

function countSelected(){
    var selectedElements = [];
    var elementCounter = $(".element-counter");
    var elementToolbar = $(".element-toolbar");

    // add all elements to list
    $(".element.selected").each(function(){
        selectedElements.push(this);
    });

    // if there is one selected element display all options
    if(selectedElements.length == 1){
        elementToolbar.stop().animate({opacity: 1});
        elementToolbar.css('display','flex');
        elementToolbar.css('pointer-events','all');
        $(".element-toolbar .option").each(function(){
            $(this).css('display','flex');
            $(this).css('pointer-events','all');
        });
        // if there are more than one only display options that are suited for multiple elements
    } else if (selectedElements.length > 1){
        elementToolbar.stop().animate({opacity: 1});
        elementToolbar.css('display','flex');
        elementToolbar.css('pointer-events','all');
        $(".element-toolbar .option").each(function(){
            if($(this).hasClass('single')){
                $(this).css('display','none');
                $(this).css('pointer-events','none');
            }
        });
        // if there is no selected elements hide the element toolbar
    } else {
        elementToolbar.stop().animate({opacity: 0},function(){
            $(this).css('display','none');
            $(this).css('pointer-events','none');
        });
    }

    if(selectedElements.length == 1){
        elementCounter.html(selectedElements.length + ' Element');
    } else {
        elementCounter.html(selectedElements.length + ' Elements');
    }
    return selectedElements.length;
}

function setZoom(zoom,el) {
      
    transformOrigin = [0,0];
    el = el || instance.getContainer();
     var p = ["webkit", "moz", "ms", "o"],
        s = "scale(" + zoom + ")",
        oString = (transformOrigin[0] * 100) + "% " + (transformOrigin[1] * 100) + "%";

    for (var i = 0; i < p.length; i++) {
        el.style[p[i] + "Transform"] = s;
    }

    el.style["transform"] = s;
    // update zoom-level in editor
    $(".zoom-level").html(Math.round((zoom * 100.0))+'%');
}

function getConnectionType(el){
    // if element has class top or bottom return that
    if($(el).hasClass('top')) return 'top';
    if($(el).hasClass('bottom')) return 'bottom';
}

function changeConnectionStatus(parentId,connectionType,type){
    editorObj.elements.forEach((item) => {
        // if element was found go through connections and change status of specific connection
        if($(item.domElement).attr('id') == parentId){
            item.connections.forEach((connection) => {
                if(connection.type === connectionType){
                    connection.status = type;
                }
            });
        }
    });
}

function getActiveConnectionsOnElement(id){
    var count = 0;
    editorObj.elements.forEach((element) => {
        if(element.id === id){
            element.connections.forEach((connection) => {
                // if connection is active increment count
                if(connection.status === 'active'){
                    count++;
                }
            });
        }
    });
    return count;
}

function getTotalActiveCount(){
    var count = 0;
    editorObj.elements.forEach((element) => {
        element.connections.forEach((connection) => {
            // if connection is active increment count
            if(connection.status === 'active'){
                count++;
            }
        });
    });
    return count;
}

function getEditorElement(id){
    var selectedItem = null;
    editorObj.elements.forEach((item) => {
        var currentItemId = item.id;
        if(currentItemId == id){
            selectedItem = item;
            return;
        }
    });

    return selectedItem;
}

function disconnectLastConnection(){
    var lastConnectionId = editorObj.lastActiveConnection.id;
    var lastConnectionType = editorObj.lastActiveConnection.type;
    var lastConnectionElement = getEditorElement(lastConnectionId);
    
    // remove connect class from last active
    $(lastConnectionElement.domElement).find('.connection').removeClass('connect');
    // find connection and change status to disconnected
    lastConnectionElement.connections.forEach((connection) => {
        if(connection.type === lastConnectionType){
            connection.status = 'disconnected';
        }
    });
}

function getActiveConnectionElements(){
    var elements = [];
    editorObj.elements.forEach((element) => {
        element.connections.forEach((connection) => {
            if(connection.status === 'active'){
                elements.push({id: element.id,connectionType: connection.type,dom: element.domElement});
            }
        });
    });
    return elements;
}

function getConnectionCountOfDot(id,connectionType){
    var count = 0;
    editorObj.lines.forEach((line) => {
        if((line.firstElement.id === id && line.firstConnectionType === connectionType) || (line.secondElement.id === id && line.secondConnectionType === connectionType)){
            count++;
        }
    });
    return count;
}

function updateLines(){
    editorObj.lines.forEach((line) => {
        var x1 = 0;x2 = 0;y1 = 0;y2 = 0;
        // if the origin is top and the destination is bottom y1 must stay the same and y2 must be added 100
        if(line.firstElement.connectionType === 'top' && line.secondElement.connectionType === 'bottom'){
            var x1 = (parseInt((line.firstElement.dom.style.left).replace('px','')) + 50) + "px";
            var x2 = (parseInt((line.secondElement.dom.style.left).replace('px','')) + 50) + "px";
            var y1 = (parseInt((line.firstElement.dom.style.top).replace('px',''))) + "px";
            var y2 = (parseInt((line.secondElement.dom.style.top).replace('px','')) + 100) + "px";
            // if the origin is bottom and the destination is top y1 must be added 100 and y2 must stay the same
        }  else if(line.firstElement.connectionType === 'bottom' && line.secondElement.connectionType === 'top') {
            var x1 = (parseInt((line.firstElement.dom.style.left).replace('px','')) + 50) + "px";
            var x2 = (parseInt((line.secondElement.dom.style.left).replace('px','')) + 50) + "px";
            var y1 = (parseInt((line.firstElement.dom.style.top).replace('px','')) + 100) + "px";
            var y2 = (parseInt((line.secondElement.dom.style.top).replace('px',''))) + "px";
        }
        
        var lineEl = line.line.find('line');
        lineEl.attr('x1',x1);
        lineEl.attr('x2',x2);
        lineEl.attr('y1',y1);
        lineEl.attr('y2',y2);
    });
}

function connect(){
    // generate uuid
    var id = uuidv4();
    // get the active connection elements
    var activeElements = getActiveConnectionElements();
    console.log("Active: ",activeElements);
    var firstElement = null;
    var secondElement = null;

    // choose which one should be the first element
    // the one with the higher top value should be second
    if(activeElements[0].dom.style.top > activeElements[1].dom.style.top){
        firstElement = activeElements[1];
        secondElement = activeElements[0];
    } else {
        firstElement = activeElements[0];
        secondElement = activeElements[1];
    }

    var x1 = 0;x2 = 0;y1 = 0;y2 = 0;
    // if the origin is top and the destination is bottom y1 must stay the same and y2 must be added 100
    if(firstElement.connectionType === 'top' && secondElement.connectionType === 'bottom'){
        var x1 = (parseInt((firstElement.dom.style.left).replace('px','')) + 50) + "px";
        var x2 = (parseInt((secondElement.dom.style.left).replace('px','')) + 50) + "px";
        var y1 = (parseInt((firstElement.dom.style.top).replace('px',''))) + "px";
        var y2 = (parseInt((secondElement.dom.style.top).replace('px','')) + 100) + "px";
        // if the origin is bottom and the destination is top y1 must be added 100 and y2 must stay the same
    }  else if(firstElement.connectionType === 'bottom' && secondElement.connectionType === 'top') {
        var x1 = (parseInt((firstElement.dom.style.left).replace('px','')) + 50) + "px";
        var x2 = (parseInt((secondElement.dom.style.left).replace('px','')) + 50) + "px";
        var y1 = (parseInt((firstElement.dom.style.top).replace('px','')) + 100) + "px";
        var y2 = (parseInt((secondElement.dom.style.top).replace('px',''))) + "px";
    }


    // connections should only be possible between top and bottom
    if(firstElement.connectionType === 'top' && secondElement.connectionType === "top"){
        return;
    }

    // connections should only be possible between top and bottom
    if(firstElement.connectionType === 'bottom' && secondElement.connectionType === "bottom"){
        return;
    }

    firstElementConnections = getConnectionCountOfDot(firstElement.id,firstElement.connectionType);
    secondElementConnections = getConnectionCountOfDot(secondElement.id,secondElement.connectionType);

    if(firstElementConnections >= 2 || secondElementConnections >= 2){
        return;
    }

    // create line
    var line = $('<svg style="opacity: 0;" id="'+id+'" height="'+$(".editor-wrapper").height()+'" width="'+$(".editor-wrapper").width()+'"><line class="selectable-line" x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" style="stroke:rgb(101, 209, 86);stroke-width:3" /></svg>');
    
    // add line to editor
    $(".editor-wrapper").append(line);
    line.animate({opacity: 1});

    // add line to line array
    editorObj.lines.push({id: id,firstElement: firstElement,secondElement: secondElement,firstConnectionType:firstElement.connectionType,secondConnectionType:secondElement.connectionType,line: line});

    // get connection types
    var firstElementConnectionType = firstElement.connectionType;
    var secondElementConnectionType = secondElement.connectionType;

    // change style
    $(firstElement.dom).find('.connection.connect').addClass('connected');
    $(secondElement.dom).find('.connection.connect').addClass('connected');
    $(firstElement.dom).find('.connection.connect').removeClass('connect');
    $(secondElement.dom).find('.connection.connect').removeClass('connect');

    // update connections
    changeConnectionStatus(firstElement.id,firstElementConnectionType,'connected');
    changeConnectionStatus(secondElement.id,secondElementConnectionType,'connected');
}

function toggleEditor(){
    var currentState = $(".edit-box").attr('state');
    if(currentState === "closed"){
        openEditor();
    }
}

function setupEditor(){
    var selected = $(".element.selected").get(0);
    if(selected){
        var selectedId = selected.id;
        var selectedElement = getEditorElement(selectedId);

        $(".edit-box .id p").html("ID: " + selectedElement.id);
        $(".edit-box #description-input").val(selectedElement.description);
    }
}

function saveEditorChanges(){
    var selected = $(".element.selected").get(0);
    if(selected){
        var selectedId = selected.id;
        var selectedElement = getEditorElement(selectedId);
        var newDesc = $(".edit-box #description-input").val().replace('<','&lt;').replace('>','&gt;');
        selectedElement.description = newDesc;
        if(newDesc.trim() === ""){
            $(selected).find(".description").animate({opacity: 0},function(){
                $(selected).find(".description").css('display','none');
                $(selected).find(".description").html(newDesc);
            });
        } else {
            $(selected).find(".description").css('display','flex');
            $(selected).find(".description").animate({opacity: 1});
            $(selected).find(".description").html(newDesc);
        }
    }

    closeEditor()
}

function openEditor(){
    setupEditor();
    $(".edit-box").css('display','flex');
    $(".edit-box").css('pointer-events','all');
    $(".edit-box").animate({opacity: 1});
    $(".edit-box").attr('state','open');
}

function closeEditor(){
    $(".edit-box").animate({opacity: 0},function(){
        $(this).css('display','none');
        $(this).css('pointer-events','none');
        $(".edit-box").attr('state','closed');
    });
}

function iterateTree(originaltree,tree,id){
    var symbol = $("#"+id).find('.symbol').html();
    var connections = [];
    editorObj.lines.forEach((line) => {
        if(line.firstElement.id === id){
            if(line.secondElement.id !== tree.node && line.secondElement.id !== originaltree.node && line.secondElement.id !== tree.previous) connections.push(line.secondElement.id);
        } else if(line.secondElement.id === id){
            if(line.firstElement.id !== tree.node && line.firstElement.id !== originaltree.node && line.firstElement.id !== tree.previous) connections.push(line.firstElement.id);
        }
    });

    if(connections.length > 0){
        var con1 = $("#"+connections[0]).get(0);
        tree.next.push({node: connections[0],symbol: $("#"+connections[0]).find(".symbol").html(),previous: id,previousSymbol: symbol,joincount: 0,next: [],position: {left: con1.style.left,top: con1.style.top},description: $(con1).find('.description').html()});
        iterateTree(originaltree,tree.next[0],connections[0]);
        if(connections.length > 1){
            var con2 = $("#"+connections[1]).get(0);
            tree.next.push({node: connections[1],symbol: $("#"+connections[1]).find(".symbol").html(),previous: id,previousSymbol: symbol,joincount: 0,next: [],position: {left: con2.style.left,top: con2.style.top},description: $(con2).find('.description').html()});
            iterateTree(originaltree,tree.next[1],connections[1]);
        }
        return originaltree;
    } else {
        return originaltree;
    }
}

function getNodeTree(){
    var tree = "";
    $(".element").each(function(){
        if(!$(this).find(".connection.top").hasClass('connected')){
            // find starting node by searching for a node that has no connection on the top connection-dot but on the bottom one
            if(!$(this).find(".connection.top").hasClass('connect') && !$(this).find(".connection.top").hasClass('connected')){
                if($(this).find(".connection.bottom").hasClass('connected')){
                    var element = $(this).get(0);
                    tree = {node: element.id,symbol: $(element).find(".symbol").html(),previous: undefined,previousSymbol: undefined,joincount: 0,position: {left: element.style.left,top: element.style.top},description: $(element).find('.description').html(),next: []};
                    return;
                }
            }
        }
    });
    // start recursion
    var nodeTree = iterateTree(tree,tree,tree.node);
    return nodeTree;
}

function buildStatement(originalTree,tree,statement,counter,paranthesisOpened,paranthesisClosed,join){
    var currentNode = tree.node;
    var symbol = $("#"+currentNode).find('.symbol').html();
    var join = symbol === "⋈";
 
    if(symbol === "Relation"){
        statement += "(" + $("#"+currentNode).find('.description').html();
    } else if(symbol === "⋈") {
        
    } else {
        statement += symbol + "<sub>"+$("#"+currentNode).find('.description').html()+"</sub>" + "(";
        paranthesisOpened++;
    }

    console.log(statement);
    counter++;

    if(tree.next.length > 0){
        
        if(tree.next.length > 1){
            buildStatement(originalTree,tree.next[0],statement,counter,paranthesisOpened,paranthesisClosed,join);
            buildStatement(originalTree,tree.next[1],statement,counter,paranthesisOpened,paranthesisClosed,join);
        }
        return buildStatement(originalTree,tree.next[0],statement,counter,paranthesisOpened,paranthesisClosed,join);
    } else {
        return {statement: statement,openParanthesis: paranthesisOpened,closedParanthesis: paranthesisClosed};
    }
}

function getStatement(){
    nodeTree = getNodeTree();
    var statement = "";
    var generated = buildStatement(nodeTree,nodeTree,statement,statement,0,0,0);
    var paranthesisDifference = generated.openParanthesis - generated.closedParanthesis;
    for(var i = 0; i < paranthesisDifference; i++){
        generated.statement += ")";
    }
    $(".generatedStatement").html("Statement: " + generated.statement);
    return generated;
}