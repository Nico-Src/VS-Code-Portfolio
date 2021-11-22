<?php
?>
<html>
    <head>
        <title>Relationale Algebra</title>
        <link rel="icon" href="favico.ico">
        <link rel="stylesheet" href="css/main.css">
        <link rel="stylesheet" href="css/elements.css">
        <link href="bootstrap/css/bootstrap.css" rel="stylesheet">
    </head>
    <body>
        <div class="row m-0 p-0 w-100 h-100">
            <div class="zoom-level" onmousedown="resetZoom();">100%</div>
            <div class="element-toolbar">
                <div class="option option-xl element-counter">0 Elements</div>
                <div class="option" onmousedown="deleteSelected();"><i class="fa fa-trash-o" aria-hidden="true"></i><div class="tip">Delete <kbd>ENTF</kbd></div></div>
                <div class="option single" onmousedown="toggleEditorWindow();"><i class="fa fa-pencil" aria-hidden="true"></i><div class="tip">Edit <kbd>E</kbd></div></div>
                <div class="option" onmousedown="unselectedAll();"><i class="fa fa-times" aria-hidden="true"></i><div class="tip">Unselect <kbd>ESC</kbd></div></div>
            </div>
            <div class="generatedStatement">Statement: None</div>
            <div class="edit-box col-2" state="closed">
                <div class="header"><span>Edit</span><div class="close-btn" onmousedown="closeEditorWindow();"><i class="fa fa-times" aria-hidden="true"></i></div></div>
                <div class="id"><p>ID: 12419ß41941249102</p></div>
                <div class="property">
                    <span>Fußnote:</span>
                    <input type="text" class="form-control" id="description-input">
                </div>
                <div class="footer"><button onclick="saveEditorChanges();" class="btn btn-success">Save</button></div>
            </div>
            <div class="toolbar col-2">
                    <button class="btn btn-success m-3" onclick="getStatement();">Generate Statement</button>
                    <div class="algebra-element col-12" onmousedown="addElement(this,false,true);">
                        <p class="symbol">Relation</p>
                        <p class="name">Table</p>
                    </div>
                    <div class="algebra-element col-12" onmousedown="addElement(this,true);">
                        <p class="symbol special">π</p>
                        <p class="name">Pi (Projection)</p>
                    </div>
                    <div class="algebra-element col-12" onmousedown="addElement(this,true);">
                        <p class="symbol special">σ</p>
                        <p class="name">Sigma (Selection)</p>
                    </div>
                    <div class="algebra-element col-12" onmousedown="addElement(this,true);">
                        <p class="symbol special">ρ</p>
                        <p class="name">Rename</p>
                    </div>
                    <div class="algebra-element col-12" onmousedown="addElement(this);">
                        <p class="symbol">x</p>
                        <p class="name">Cross Product</p>
                    </div>
                    <div class="algebra-element col-12" onmousedown="addElement(this);">
                        <p class="symbol">⋈</p>
                        <p class="name">Join</p>
                    </div>
                    <div class="algebra-element col-12" onmousedown="addElement(this);">
                        <p class="symbol">\</p>
                        <p class="name">Minus</p>
                    </div>
                    <div class="algebra-element col-12" onmousedown="addElement(this);">
                        <p class="symbol">u</p>
                        <p class="name">Union</p>
                    </div>
                    <div class="algebra-element col-12" onmousedown="addElement(this);">
                        <p class="symbol">∩</p>
                        <p class="name">Intersection</p>
                    </div>
                    <div class="algebra-element col-12" onmousedown="addElement(this,true);">
                        <p class="symbol special">γ</p>
                        <p class="name">Gamma (Group by)</p>
                    </div>
            </div>

            <div class="editor col-10">
                <div class="editor-wrapper">
                </div>
            </div>
        </div>
        
        <script src="js/jquery-3.6.0.js"></script>
        <script src="js/jquery-ui.js"></script>
        <script src="js/jquery-connect/required/script/jquery.connectingLine.js"></script>
        <script src="bootstrap/js/bootstrap.bundle.js"></script>
        <script src="js/fontawesome.js" crossorigin="anonymous"></script>
        <script src="js/editor.js"></script>
        <script>
        </script>
    </body>
    <script>
        var currentMaxZIndex = 9;

        function uuidv4() {
            return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
                (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
            );
        }

        $(document).ready(function(){
            setupEditorEvents();
            $( ".editor-wrapper" ).draggable({
                refreshPositions: true,
            });
            setZoom(1,$(".editor-wrapper").get(0));
            $(".element").each(function(){
                dragElement(this);
            });
        });

        $(window).resize(function(){
            
        });

        function resetZoom(){
            setZoom(1,$('.editor-wrapper').get(0));
            editorObj.scale = 1;
        }

        function addElement(symbol,specialFont,smallFont){
            var id = uuidv4();
            var editorContainer = $(".editor-wrapper").get(0);
            var top = -parseInt(editorContainer.style.top.replace('px','')) || 0;
            top += $(".editor").height() / 2.0; // add half of the height of the editor
            top -= 50; // add elements own radius
            top /= editorObj.scale;
            var left = -parseInt(editorContainer.style.left.replace('px','')) || 0;
            left += $(".editor").width() / 2.0; // add half of the height of the editor
            left -= 50; // add elements own radius
            left /= editorObj.scale;
            var symbolHTML = $(symbol).find(".symbol").html();
            var el = $("<div class='element' style='top: "+top+"px; left: "+left+"px;' id='"+id+"'><div class='content'><p class='symbol "+(specialFont ? 'special' : '')+" "+(smallFont ? 'small' : '')+"'>"+symbolHTML+"</p><div class='connection top' id='"+id+"top'></div><div class='connection bottom' id='"+id+"bottom'></div><div class='description right' style='opacity: 0; display: none;' onclick='switchPlacement(this);'></div></div></div>").get(0);
            $(".editor-wrapper").append(el);
            editorObj.elements.push({
                id: id,
                domElement: el,
                description: "",
                connections: [
                    {
                        type: 'top',
                        status: 'disconnected'
                    },
                    {
                        type: 'bottom',
                        status: 'disconnected'
                    }
                ]
            });
            $(".element").each(function(){
                dragElement(this);
            });
        }

        function deleteSelected(e){
            e = e || window.event;
            if(e.which === 1){
                $(".element.selected").each(function(){
                    $(this).addClass('delete');
                    $(this).animate({opacity: 0},500,function(){
                        this.parentElement.removeChild(this);
                        countSelected();
                    });
                });
            }
        }

        function unselectedAll(e){
            e = e || window.event;
            if(e.which === 1){
                $(".element.selected").each(function(){
                $(this).removeClass('selected');
                    countSelected();
                });
            }
        }

        function closeEditorWindow(e){
            e = e || window.event;
            if(e.which === 1){
                closeEditor();
            }
        }

        function toggleEditorWindow(e){
            e = e || window.event;
            if(e.which === 1){
                toggleEditor();
            }
        }

        function switchPlacement(el){
            if($(el).hasClass('left')){
                $(el).removeClass('left');
                $(el).addClass('topLeft');
            } else if($(el).hasClass('right')){
                $(el).removeClass('right');
                $(el).addClass('left');
            } else if($(el).hasClass('topLeft')){
                $(el).removeClass('topLeft');
                $(el).addClass('topRight');
            } else if($(el).hasClass('topRight')){
                $(el).removeClass('topRight');
                $(el).addClass('right');
            }
        }
    </script>
</html>